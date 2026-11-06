import React, { useState } from 'react';
import {
  Settings,
  Profile,
  ColorScheme,
  Keybinding,
  CursorShape,
} from '../../types/terminal';
import {
  X,
  Sliders,
  Palette,
  Terminal,
  Keyboard,
  FileCode,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Monitor,
  Eye,
  Type,
  Maximize2,
  Download,
  Upload,
  PanelLeft,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'startup' | 'appearance' | 'schemes' | 'profiles' | 'actions' | 'json'>('startup');
  const [selectedProfileGuid, setSelectedProfileGuid] = useState<string>(settings.defaultProfileGuid);
  const [selectedSchemeName, setSelectedSchemeName] = useState<string>(settings.schemes[0]?.name || 'Campbell');
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(settings, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProfile = settings.profiles.find((p) => p.guid === selectedProfileGuid) || settings.profiles[0];
  const currentScheme = settings.schemes.find((s) => s.name === selectedSchemeName) || settings.schemes[0];

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onUpdateSettings(parsed);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const updateProfile = (updated: Partial<Profile>) => {
    const newProfiles = settings.profiles.map((p) => (p.guid === currentProfile.guid ? { ...p, ...updated } : p));
    const newSettings = { ...settings, profiles: newProfiles };
    onUpdateSettings(newSettings);
    setJsonText(JSON.stringify(newSettings, null, 2));
  };

  const updateScheme = (updated: Partial<ColorScheme>) => {
    const newSchemes = settings.schemes.map((s) => (s.name === currentScheme.name ? { ...s, ...updated } : s));
    const newSettings = { ...settings, schemes: newSchemes };
    onUpdateSettings(newSettings);
    setJsonText(JSON.stringify(newSettings, null, 2));
  };

  const handleAddProfile = () => {
    const newGuid = `{${Math.random().toString(36).substring(2, 9)}-${Date.now()}}`;
    const newProfile: Profile = {
      guid: newGuid,
      name: 'Custom Shell',
      shellType: 'custom',
      commandline: 'powershell.exe',
      icon: 'powershell',
      colorScheme: 'Campbell',
      fontFace: 'Cascadia Code',
      fontSize: 13,
      opacity: 0.95,
      acrylic: true,
      padding: '8px, 8px, 8px, 8px',
      startingDirectory: 'C:\\Projects',
      cursorShape: 'bar',
    };
    const newSettings = { ...settings, profiles: [...settings.profiles, newProfile] };
    onUpdateSettings(newSettings);
    setSelectedProfileGuid(newGuid);
    setJsonText(JSON.stringify(newSettings, null, 2));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <Sliders className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-slate-100 text-lg">Windows Terminal Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-slate-950/60 border-r border-slate-800 p-3 space-y-1 overflow-y-auto text-xs font-medium text-slate-300">
            <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              Global Settings
            </div>
            <button
              onClick={() => setActiveTab('startup')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'startup' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Startup & Interaction</span>
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'appearance' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Appearance & Display</span>
            </button>
            <button
              onClick={() => setActiveTab('schemes')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'schemes' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Color Schemes</span>
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'actions' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Actions & Keys</span>
            </button>

            <div className="my-2 border-t border-slate-800" />
            <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center justify-between">
              <span>Profiles</span>
              <button onClick={handleAddProfile} title="Add Profile" className="p-0.5 hover:text-white">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {settings.profiles.map((p) => (
              <button
                key={p.guid}
                onClick={() => {
                  setSelectedProfileGuid(p.guid);
                  setActiveTab('profiles');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
                  activeTab === 'profiles' && selectedProfileGuid === p.guid
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Terminal className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate">{p.name}</span>
                </div>
                {p.guid === settings.defaultProfileGuid && (
                  <span className="text-[9px] bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded border border-slate-700">
                    Default
                  </span>
                )}
              </button>
            ))}

            <div className="my-2 border-t border-slate-800" />
            <button
              onClick={() => setActiveTab('json')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'json' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>JSON File (settings.json)</span>
            </button>
          </div>

          {/* Tab Main Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-900 text-slate-200">
            {activeTab === 'startup' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 mb-1">Default Profile</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    The profile that opens when you create a new tab or launch Windows Terminal.
                  </p>
                  <select
                    value={settings.defaultProfileGuid}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, defaultProfileGuid: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-blue-500"
                  >
                    {settings.profiles.map((p) => (
                      <option key={p.guid} value={p.guid}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-slate-800 pt-5">
                  <h3 className="text-base font-semibold text-slate-100 mb-1">Interaction Settings</h3>
                  <div className="space-y-4 mt-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="text-xs font-medium text-slate-200">Copy on selection</div>
                        <div className="text-[11px] text-slate-400">
                          Automatically copy selected text in terminal to clipboard.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.copyOnSelect}
                        onChange={(e) => onUpdateSettings({ ...settings, copyOnSelect: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="text-xs font-medium text-slate-200">Confirm before closing all tabs</div>
                        <div className="text-[11px] text-slate-400">
                          Show confirmation prompt when closing a window with multiple open tabs.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.confirmCloseAllTabs}
                        onChange={(e) =>
                          onUpdateSettings({ ...settings, confirmCloseAllTabs: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-blue-600"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 mb-1">Tab Placement & Layout (Chrome / Tabby Style)</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Choose whether tab headers appear at the top or on the left as vertical tabs.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => onUpdateSettings({ ...settings, tabPosition: 'top' })}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition ${
                        settings.tabPosition === 'top'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-sm flex items-center justify-between mb-2">
                        <span>Top Horizontal Tabs</span>
                        {settings.tabPosition === 'top' && <Check className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-xs text-slate-400">Standard Windows Terminal top tab bar layout.</p>
                    </button>

                    <button
                      onClick={() => onUpdateSettings({ ...settings, tabPosition: 'left' })}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition ${
                        settings.tabPosition === 'left'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-sm flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <PanelLeft className="w-4 h-4 text-blue-400" />
                          <span>Left Vertical Tabs (Tabby Style)</span>
                        </div>
                        {settings.tabPosition === 'left' && <Check className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-xs text-slate-400">Vertical tab sidebar like Tabby Terminal & Edge/Chrome.</p>
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-5">
                  <h3 className="text-base font-semibold text-slate-100 mb-1">Application Theme</h3>
                  <p className="text-xs text-slate-400 mb-3">Set theme mode for the terminal window interface.</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['dark', 'light', 'system'].map((th) => (
                      <button
                        key={th}
                        onClick={() => onUpdateSettings({ ...settings, theme: th as any })}
                        className={`p-3 rounded-xl border text-xs capitalize text-center font-medium transition ${
                          settings.theme === th
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {th} mode
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-5 space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-slate-200">Retro CRT Scanline Effect</div>
                      <div className="text-[11px] text-slate-400">
                        Enable scanlines and glowing monitor effect across terminal view.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.crtEffect}
                      onChange={(e) => onUpdateSettings({ ...settings, crtEffect: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-slate-200">Show tabs in titlebar</div>
                      <div className="text-[11px] text-slate-400">
                        Integrate tab header directly into the top window bar.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showTabsInTitlebar}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, showTabsInTitlebar: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'schemes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">Color Schemes</h3>
                    <p className="text-xs text-slate-400">Customize foreground, background, and 16 ANSI colors.</p>
                  </div>
                  <select
                    value={selectedSchemeName}
                    onChange={(e) => setSelectedSchemeName(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 outline-none"
                  >
                    {settings.schemes.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scheme Color Swatches */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Background</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentScheme.background}
                        onChange={(e) => updateScheme({ background: e.target.value })}
                        className="w-8 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                      />
                      <span className="text-xs font-mono">{currentScheme.background}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Foreground</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentScheme.foreground}
                        onChange={(e) => updateScheme({ foreground: e.target.value })}
                        className="w-8 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                      />
                      <span className="text-xs font-mono">{currentScheme.foreground}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Cursor Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentScheme.cursorColor}
                        onChange={(e) => updateScheme({ cursorColor: e.target.value })}
                        className="w-8 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                      />
                      <span className="text-xs font-mono">{currentScheme.cursorColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Selection</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentScheme.selectionBackground}
                        onChange={(e) => updateScheme({ selectionBackground: e.target.value })}
                        className="w-8 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                      />
                      <span className="text-xs font-mono">{currentScheme.selectionBackground}</span>
                    </div>
                  </div>
                </div>

                {/* Live Scheme Sample Preview Box */}
                <div
                  className="p-4 rounded-xl font-mono text-xs border border-slate-700 shadow-inner"
                  style={{
                    backgroundColor: currentScheme.background,
                    color: currentScheme.foreground,
                  }}
                >
                  <div>PS C:\Users\Developer&gt; neofetch</div>
                  <div style={{ color: currentScheme.green }}>✔ Color scheme: {currentScheme.name}</div>
                  <div style={{ color: currentScheme.red }}>✖ Error simulation: red text</div>
                  <div style={{ color: currentScheme.yellow }}>▲ Warning simulation: yellow text</div>
                  <div style={{ color: currentScheme.blue }}>■ Information simulation: blue text</div>
                  <div style={{ color: currentScheme.brightCyan }}>★ Bright Cyan text output</div>
                </div>
              </div>
            )}

            {activeTab === 'profiles' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    Profile Settings: {currentProfile.name}
                  </h3>
                  <p className="text-xs text-slate-400">Configure commandline, fonts, opacity, and acrylic.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Profile Name</label>
                    <input
                      type="text"
                      value={currentProfile.name}
                      onChange={(e) => updateProfile({ name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Commandline</label>
                    <input
                      type="text"
                      value={currentProfile.commandline}
                      onChange={(e) => updateProfile({ commandline: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Font Face</label>
                    <select
                      value={currentProfile.fontFace}
                      onChange={(e) => updateProfile({ fontFace: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 outline-none"
                    >
                      <option value="Cascadia Code">Cascadia Code</option>
                      <option value="Cascadia Mono">Cascadia Mono</option>
                      <option value="Fira Code">Fira Code</option>
                      <option value="JetBrains Mono">JetBrains Mono</option>
                      <option value="Consolas">Consolas</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Font Size (pt)</label>
                    <input
                      type="number"
                      value={currentProfile.fontSize}
                      onChange={(e) => updateProfile({ fontSize: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Color Scheme</label>
                    <select
                      value={currentProfile.colorScheme}
                      onChange={(e) => updateProfile({ colorScheme: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 outline-none"
                    >
                      {settings.schemes.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Cursor Shape</label>
                    <select
                      value={currentProfile.cursorShape}
                      onChange={(e) => updateProfile({ cursorShape: e.target.value as CursorShape })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 outline-none"
                    >
                      <option value="bar">Bar ( | )</option>
                      <option value="block">Block ( █ )</option>
                      <option value="vintage">Vintage ( ▄ )</option>
                      <option value="underscore">Underscore ( _ )</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-300">Enable Acrylic Translucency</span>
                    <input
                      type="checkbox"
                      checked={currentProfile.acrylic}
                      onChange={(e) => updateProfile({ acrylic: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </label>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Window Opacity</span>
                      <span>{Math.round(currentProfile.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="1.0"
                      step="0.05"
                      value={currentProfile.opacity}
                      onChange={(e) => updateProfile({ opacity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">Keybindings & Shortcuts</h3>
                  <p className="text-xs text-slate-400">Actions mapped to hotkeys in Windows Terminal.</p>
                </div>
                <div className="space-y-2">
                  {settings.actions.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{act.description}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{act.command}</div>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-blue-400 font-mono text-xs rounded-lg">
                        {act.keys}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'json' && (
              <div className="h-full flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">JSON Settings Editor</h3>
                    <p className="text-xs text-slate-400">
                      Directly edit <code className="text-emerald-400">settings.json</code> for Windows Terminal.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveJson}
                    className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply JSON Settings</span>
                  </button>
                </div>

                {jsonError && (
                  <div className="p-3 bg-rose-950/80 border border-rose-500 text-rose-300 text-xs rounded-lg">
                    JSON Error: {jsonError}
                  </div>
                )}

                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="flex-1 bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { TerminalTab, Profile } from '../types/terminal';
import {
  Plus,
  ChevronDown,
  X,
  Settings as SettingsIcon,
  Search,
  Copy,
  Columns,
  Rows,
  Terminal,
  Shield,
  Zap,
  Globe,
  SquareCode,
  Pin,
  Monitor,
  PanelLeft,
  Download,
} from 'lucide-react';

interface TerminalTabHeaderProps {
  tabs: TerminalTab[];
  activeTabId: string;
  profiles: Profile[];
  onSelectTab: (tabId: string) => void;
  onNewTab: (profileGuid?: string) => void;
  onCloseTab: (tabId: string) => void;
  onDuplicateTab: (tabId: string) => void;
  onSplitActivePane: (direction: 'horizontal' | 'vertical') => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onToggleTabPosition: () => void;
  onToggleCrt: () => void;
  crtEffectActive: boolean;
  onExportPortablePackage: () => void;
}

export const TerminalTabHeader: React.FC<TerminalTabHeaderProps> = ({
  tabs,
  activeTabId,
  profiles,
  onSelectTab,
  onNewTab,
  onCloseTab,
  onDuplicateTab,
  onSplitActivePane,
  onOpenSettings,
  onOpenCommandPalette,
  onToggleTabPosition,
  onToggleCrt,
  crtEffectActive,
  onExportPortablePackage,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getProfileIcon = (iconName: string) => {
    switch (iconName) {
      case 'powershell':
        return <Terminal className="w-3.5 h-3.5 text-sky-400" />;
      case 'cmd':
        return <SquareCode className="w-3.5 h-3.5 text-slate-300" />;
      case 'ubuntu':
      case 'wsl':
        return <Globe className="w-3.5 h-3.5 text-orange-400" />;
      case 'gitbash':
        return <Shield className="w-3.5 h-3.5 text-rose-400" />;
      case 'azure':
        return <Zap className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-2 select-none relative z-30">
      {/* Tabs Container */}
      <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar flex-1 mr-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const profile = profiles.find((p) => p.guid === tab.profileGuid);
          const tabColor = tab.tabColor || profile?.tabColor;

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center space-x-2 px-3 py-1.5 text-xs rounded-t-md cursor-pointer border-t-2 transition-all min-w-[120px] max-w-[200px] ${
                isActive
                  ? 'bg-slate-950 text-slate-100 border-blue-500 font-medium shadow-md'
                  : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200'
              }`}
              style={{
                borderTopColor: isActive ? (tabColor || '#3B82F6') : 'transparent',
              }}
            >
              {tabColor && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tabColor }}
                />
              )}
              {getProfileIcon(profile?.icon || 'powershell')}
              <span className="truncate flex-1">{tab.title || profile?.name || 'Terminal'}</span>

              {/* Tab Action Buttons (Hover) */}
              <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateTab(tab.id);
                  }}
                  title="Duplicate Tab"
                  className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-100"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    title="Close Tab"
                    className="p-0.5 hover:bg-rose-600 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Tab & Profile Dropdown */}
        <div className="flex items-center space-x-0.5 relative">
          <button
            onClick={() => onNewTab()}
            title="New Tab (Ctrl+Shift+T)"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Select Profile / Actions"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute top-8 left-0 z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 w-64 text-xs font-sans text-slate-200">
                <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Open New Tab Profile
                </div>
                {profiles.map((p) => (
                  <button
                    key={p.guid}
                    onClick={() => {
                      onNewTab(p.guid);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center justify-between transition"
                  >
                    <div className="flex items-center space-x-2">
                      {getProfileIcon(p.icon)}
                      <span>{p.name}</span>
                    </div>
                    {p.tabColor && (
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.tabColor }} />
                    )}
                  </button>
                ))}

                <div className="my-1.5 border-t border-slate-800" />
                <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Pane Actions
                </div>
                <button
                  onClick={() => {
                    onSplitActivePane('vertical');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split Pane Right (Alt+Shift++)</span>
                </button>
                <button
                  onClick={() => {
                    onSplitActivePane('horizontal');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
                >
                  <Rows className="w-3.5 h-3.5" />
                  <span>Split Pane Down (Alt+Shift+-)</span>
                </button>

                <div className="my-1.5 border-t border-slate-800" />
                <button
                  onClick={() => {
                    onOpenSettings();
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>Settings (Ctrl+,)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Controls (Left Tabs Toggle, Export Portable, Command Palette, CRT toggle, Settings) */}
      <div className="flex items-center space-x-1">
        <button
          onClick={onToggleTabPosition}
          title="Switch to Left Vertical Tabs Mode (Tabby Style) (Ctrl+Shift+L)"
          className="px-2 py-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-700 text-blue-300 rounded text-xs flex items-center space-x-1 transition"
        >
          <PanelLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-medium">Vertical Tabs</span>
        </button>

        <button
          onClick={onExportPortablePackage}
          title="Export Portable Configuration Package"
          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleCrt}
          title={`Toggle CRT Retro Shader (${crtEffectActive ? 'ON' : 'OFF'})`}
          className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition border ${
            crtEffectActive
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CRT</span>
        </button>

        <button
          onClick={onOpenCommandPalette}
          title="Command Palette (Ctrl+Shift+P)"
          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings (Ctrl+,)"
          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

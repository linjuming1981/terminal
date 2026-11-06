import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, Columns, Rows, Settings as SettingsIcon, Trash2, Copy, Monitor, Plus, X, PanelLeft, Download } from 'lucide-react';
import { Profile, ColorScheme } from '../types/terminal';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  schemes: ColorScheme[];
  onNewTab: (profileGuid?: string) => void;
  onSplitPane: (direction: 'horizontal' | 'vertical') => void;
  onOpenSettings: () => void;
  onChangeScheme: (schemeName: string) => void;
  onToggleTabPosition: () => void;
  onToggleCrt: () => void;
  onClearBuffer: () => void;
  onExportPortablePackage: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  profiles,
  schemes,
  onNewTab,
  onSplitPane,
  onOpenSettings,
  onChangeScheme,
  onToggleTabPosition,
  onToggleCrt,
  onClearBuffer,
  onExportPortablePackage,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'new-tab-default',
      title: 'New Tab (Default Profile)',
      category: 'Tab Operations',
      icon: <Plus className="w-4 h-4 text-emerald-400" />,
      shortcut: 'Ctrl+Shift+T',
      run: () => onNewTab(),
    },
    ...profiles.map((p) => ({
      id: `new-tab-${p.guid}`,
      title: `New Tab: ${p.name}`,
      category: 'New Tab Profile',
      icon: <Terminal className="w-4 h-4 text-sky-400" />,
      shortcut: '',
      run: () => onNewTab(p.guid),
    })),
    {
      id: 'split-right',
      title: 'Split Pane Vertically (Right)',
      category: 'Pane Management',
      icon: <Columns className="w-4 h-4 text-blue-400" />,
      shortcut: 'Alt+Shift++',
      run: () => onSplitPane('vertical'),
    },
    {
      id: 'split-down',
      title: 'Split Pane Horizontally (Down)',
      category: 'Pane Management',
      icon: <Rows className="w-4 h-4 text-indigo-400" />,
      shortcut: 'Alt+Shift+-',
      run: () => onSplitPane('horizontal'),
    },
    ...schemes.map((s) => ({
      id: `scheme-${s.name}`,
      title: `Color Scheme: ${s.name}`,
      category: 'Color Schemes',
      icon: <div className="w-3.5 h-3.5 rounded-full border border-slate-600" style={{ backgroundColor: s.background }} />,
      shortcut: '',
      run: () => onChangeScheme(s.name),
    })),
    {
      id: 'toggle-tab-position',
      title: 'Toggle Left / Top Tab Bar Position (Vertical Tabs)',
      category: 'Layout',
      icon: <PanelLeft className="w-4 h-4 text-sky-400" />,
      shortcut: 'Ctrl+Shift+L',
      run: () => onToggleTabPosition(),
    },
    {
      id: 'export-portable-pkg',
      title: 'Export Portable Configuration Package (.json)',
      category: 'Portable Tools',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      shortcut: '',
      run: () => onExportPortablePackage(),
    },
    {
      id: 'toggle-crt',
      title: 'Toggle Retro CRT Scanline Shader',
      category: 'Appearance',
      icon: <Monitor className="w-4 h-4 text-amber-400" />,
      shortcut: 'Ctrl+Shift+C',
      run: () => onToggleCrt(),
    },
    {
      id: 'clear-buffer',
      title: 'Clear Active Terminal Scrollback Buffer',
      category: 'Terminal',
      icon: <Trash2 className="w-4 h-4 text-rose-400" />,
      shortcut: 'Ctrl+Shift+K',
      run: () => onClearBuffer(),
    },
    {
      id: 'open-settings',
      title: 'Open Settings Page',
      category: 'Configuration',
      icon: <SettingsIcon className="w-4 h-4 text-slate-300" />,
      shortcut: 'Ctrl+,',
      run: () => onOpenSettings(),
    },
  ];

  const filteredActions = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].run();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search action (e.g. Split, Profile, Scheme, Clear)..."
            className="w-full bg-transparent text-slate-100 text-sm placeholder-slate-500 outline-none font-sans"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Results */}
        <div className="max-h-96 overflow-y-auto py-2">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No matching commands found.</div>
          ) : (
            filteredActions.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={action.id}
                  onClick={() => {
                    action.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-xs transition ${
                    isSelected ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {action.icon}
                    <div className="flex flex-col">
                      <span className="font-medium">{action.title}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                        {action.category}
                      </span>
                    </div>
                  </div>
                  {action.shortcut && (
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                        isSelected
                          ? 'bg-blue-700 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {action.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Use ↑ ↓ to navigate, Enter to run, Esc to dismiss</span>
          <span>Windows Terminal Palette</span>
        </div>
      </div>
    </div>
  );
};

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
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutList,
  Download,
} from 'lucide-react';

interface VerticalTabSidebarProps {
  tabs: TerminalTab[];
  activeTabId: string;
  profiles: Profile[];
  collapsed: boolean;
  onToggleCollapse: () => void;
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

export const VerticalTabSidebar: React.FC<VerticalTabSidebarProps> = ({
  tabs,
  activeTabId,
  profiles,
  collapsed,
  onToggleCollapse,
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
        return <Terminal className="w-4 h-4 text-sky-400 flex-shrink-0" />;
      case 'cmd':
        return <SquareCode className="w-4 h-4 text-slate-300 flex-shrink-0" />;
      case 'ubuntu':
      case 'wsl':
        return <Globe className="w-4 h-4 text-orange-400 flex-shrink-0" />;
      case 'gitbash':
        return <Shield className="w-4 h-4 text-rose-400 flex-shrink-0" />;
      case 'azure':
        return <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />;
      default:
        return <Terminal className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
    }
  };

  return (
    <aside
      className={`h-full bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-all duration-200 select-none z-30 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Sidebar Top: Logo & Controls */}
      <div className="p-2 border-b border-slate-800/80 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center space-x-2 px-1">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-xs text-slate-100 tracking-tight">Terminal</span>
            <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800/60 px-1.5 py-0.2 rounded font-mono">
              LEFT
            </span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* New Tab & Profile Launcher */}
      <div className="p-2 border-b border-slate-900 relative">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onNewTab()}
            className={`flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg p-2 text-xs font-medium shadow-md transition ${
              collapsed ? 'px-0' : ''
            }`}
            title="New Tab (Ctrl+Shift+T)"
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span>New Tab</span>}
          </button>

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition"
            title="Choose Profile"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Profile Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute top-12 left-2 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 w-56 text-xs font-sans text-slate-200">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Open Profile Tab
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
            </div>
          </>
        )}
      </div>

      {/* Tab List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const profile = profiles.find((p) => p.guid === tab.profileGuid);
          const tabColor = tab.tabColor || profile?.tabColor;

          if (collapsed) {
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                title={`${tab.title || profile?.name} (Click to switch)`}
                className={`relative w-full h-10 rounded-xl flex items-center justify-center cursor-pointer transition border ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {getProfileIcon(profile?.icon || 'powershell')}
                {tabColor && (
                  <span
                    className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-slate-950"
                    style={{ backgroundColor: tabColor }}
                  />
                )}
              </div>
            );
          }

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition border ${
                isActive
                  ? 'bg-slate-900 border-blue-500/80 text-slate-100 font-medium shadow-md border-l-4'
                  : 'bg-slate-900/40 border-transparent text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
              }`}
              style={{
                borderLeftColor: isActive ? (tabColor || '#3B82F6') : 'transparent',
              }}
            >
              <div className="flex items-center space-x-2.5 truncate flex-1 min-w-0">
                {getProfileIcon(profile?.icon || 'powershell')}
                <span className="truncate">{tab.title || profile?.name}</span>
              </div>

              <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateTab(tab.id);
                  }}
                  title="Duplicate Tab"
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100"
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
                    className="p-1 hover:bg-rose-600 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Bottom Action Bar */}
      <div className="p-2 border-t border-slate-900 flex flex-col space-y-1">
        <div className={`flex items-center ${collapsed ? 'flex-col space-y-1' : 'justify-between space-x-1'}`}>
          {/* Toggle Tab Position (Left <-> Top) */}
          <button
            onClick={onToggleTabPosition}
            title="Switch to Top Tab Bar"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-blue-400 rounded-lg transition"
          >
            <LayoutList className="w-4 h-4" />
          </button>

          {/* Export Portable Package */}
          <button
            onClick={onExportPortablePackage}
            title="Export Portable Package (JSON)"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* CRT Shader Toggle */}
          <button
            onClick={onToggleCrt}
            title={`CRT Scanlines (${crtEffectActive ? 'ON' : 'OFF'})`}
            className={`p-2 border rounded-lg transition ${
              crtEffectActive
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Command Palette */}
          <button
            onClick={onOpenCommandPalette}
            title="Command Palette (Ctrl+Shift+P)"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Settings (Ctrl+,)"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

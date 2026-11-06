import React from 'react';
import { Profile, ColorScheme } from '../types/terminal';
import { Terminal, Shield, Zap, Globe, SquareCode, Activity, Cpu } from 'lucide-react';

interface StatusBarProps {
  activeProfile: Profile;
  colorScheme: ColorScheme;
  paneCount: number;
  tabCount: number;
  crtEffect: boolean;
  onOpenSettings: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  activeProfile,
  colorScheme,
  paneCount,
  tabCount,
  crtEffect,
  onOpenSettings,
}) => {
  return (
    <div className="h-6 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between px-3 select-none z-30 font-sans">
      {/* Left items */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Terminal className="w-3 h-3 text-blue-400" />
          <span className="font-semibold text-slate-200">{activeProfile.name}</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-[10px] text-slate-400">{activeProfile.commandline}</span>
        </div>

        <div className="flex items-center space-x-1 text-slate-500">
          <span>•</span>
          <span>Scheme: <strong className="text-slate-300">{colorScheme.name}</strong></span>
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 text-emerald-400">
          <Activity className="w-3 h-3" />
          <span className="font-mono text-[10px]">ConPTY: Ready (0ms)</span>
        </div>

        <div className="flex items-center space-x-1 text-slate-400 font-mono">
          <span>Panes: {paneCount}</span>
          <span className="text-slate-600">|</span>
          <span>Tabs: {tabCount}</span>
        </div>

        <div className="text-slate-400 font-mono">UTF-8</div>

        {crtEffect && (
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded text-[9px]">
            CRT ACTIVE
          </span>
        )}
      </div>
    </div>
  );
};

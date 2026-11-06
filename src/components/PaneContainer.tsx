import React, { useState } from 'react';
import { PaneNode, Profile, ColorScheme, Settings } from '../types/terminal';
import { TerminalView } from './TerminalView';

interface PaneContainerProps {
  node: PaneNode;
  activePaneId: string;
  profiles: Profile[];
  schemes: ColorScheme[];
  settings: Settings;
  onFocusPane: (paneId: string) => void;
  onSplitPane: (paneId: string, direction: 'horizontal' | 'vertical') => void;
  onClosePane: (paneId: string) => void;
  onChangeScheme?: (schemeName: string) => void;
}

export const PaneContainer: React.FC<PaneContainerProps> = ({
  node,
  activePaneId,
  profiles,
  schemes,
  settings,
  onFocusPane,
  onSplitPane,
  onClosePane,
  onChangeScheme,
}) => {
  if (node.type === 'leaf') {
    const profile = profiles.find((p) => p.guid === node.profileGuid) || profiles[0];
    const colorScheme = schemes.find((s) => s.name === profile.colorScheme) || schemes[0];

    return (
      <div className="w-full h-full relative group">
        <TerminalView
          paneId={node.id}
          profile={profile}
          colorScheme={colorScheme}
          settings={settings}
          isActive={node.id === activePaneId}
          onFocus={() => onFocusPane(node.id)}
          onSplitPane={(dir) => onSplitPane(node.id, dir)}
          onClosePane={() => onClosePane(node.id)}
          onChangeScheme={onChangeScheme}
        />
      </div>
    );
  }

  // Split Node
  const isHorizontal = node.direction === 'horizontal'; // top/bottom
  const [ratio, setRatio] = useState<number>(node.splitRatio || 0.5);

  return (
    <div className={`w-full h-full flex ${isHorizontal ? 'flex-col' : 'flex-row'} overflow-hidden relative`}>
      <div style={{ flex: ratio }} className="overflow-hidden">
        <PaneContainer
          node={node.children[0]}
          activePaneId={activePaneId}
          profiles={profiles}
          schemes={schemes}
          settings={settings}
          onFocusPane={onFocusPane}
          onSplitPane={onSplitPane}
          onClosePane={onClosePane}
          onChangeScheme={onChangeScheme}
        />
      </div>

      {/* Resize handle divider */}
      <div
        className={`${
          isHorizontal ? 'h-1.5 w-full cursor-row-resize' : 'w-1.5 h-full cursor-col-resize'
        } bg-slate-800 hover:bg-blue-500 transition-colors z-20 flex-shrink-0 flex items-center justify-center`}
      >
        <div className={`${isHorizontal ? 'w-8 h-0.5' : 'h-8 w-0.5'} bg-slate-600 rounded-full`} />
      </div>

      <div style={{ flex: 1 - ratio }} className="overflow-hidden">
        <PaneContainer
          node={node.children[1]}
          activePaneId={activePaneId}
          profiles={profiles}
          schemes={schemes}
          settings={settings}
          onFocusPane={onFocusPane}
          onSplitPane={onSplitPane}
          onClosePane={onClosePane}
          onChangeScheme={onChangeScheme}
        />
      </div>
    </div>
  );
};

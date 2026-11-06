export type ShellType = 'powershell' | 'cmd' | 'wsl' | 'gitbash' | 'azureshell' | 'custom';

export type CursorShape = 'bar' | 'block' | 'vintage' | 'underscore';

export interface Profile {
  guid: string;
  name: string;
  shellType: ShellType;
  commandline: string;
  icon: string; // Icon name or SVG indicator
  colorScheme: string;
  fontFace: string;
  fontSize: number;
  opacity: number;
  acrylic: boolean;
  padding: string;
  startingDirectory: string;
  tabColor?: string;
  cursorShape: CursorShape;
  hidden?: boolean;
  env?: Record<string, string>;
}

export interface ColorScheme {
  name: string;
  background: string;
  foreground: string;
  selectionBackground: string;
  cursorColor: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  purple: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightPurple: string;
  brightCyan: string;
  brightWhite: string;
}

export interface Keybinding {
  id: string;
  command: string;
  keys: string;
  description: string;
}

export interface PaneLeaf {
  id: string;
  type: 'leaf';
  profileGuid: string;
  customTitle?: string;
  history?: string[];
  cwd?: string;
  env?: Record<string, string>;
}

export interface PaneSplit {
  id: string;
  type: 'split';
  direction: 'horizontal' | 'vertical'; // horizontal = top/bottom, vertical = left/right
  splitRatio: number; // e.g. 0.5
  children: [PaneNode, PaneNode];
}

export type PaneNode = PaneLeaf | PaneSplit;

export interface TerminalTab {
  id: string;
  title: string;
  profileGuid: string;
  paneTree: PaneNode;
  activePaneId: string;
  tabColor?: string;
  isPinned?: boolean;
}

export interface CommandHistoryItem {
  id: string;
  timestamp: number;
  command: string;
  shell: ShellType;
  cwd: string;
  exitCode: number;
}

export interface Settings {
  defaultProfileGuid: string;
  theme: 'system' | 'dark' | 'light';
  showTabsInTitlebar: boolean;
  tabWidthMode: 'equal' | 'titleLength' | 'compact';
  copyOnSelect: boolean;
  wordDelimiters: string;
  crtEffect: boolean;
  soundBell: boolean;
  tabPosition: 'top' | 'left';
  sidebarCollapsed: boolean;
  confirmCloseAllTabs: boolean;
  profiles: Profile[];
  schemes: ColorScheme[];
  actions: Keybinding[];
}

export interface SystemProcess {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  status: 'running' | 'sleeping' | 'stopped';
}

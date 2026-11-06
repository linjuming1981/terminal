import { ShellType, SystemProcess } from '../types/terminal';

export interface VFSNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  children?: Record<string, VFSNode>;
  updatedAt: string;
  size: number;
}

export class ShellEngine {
  private vfs: VFSNode;
  private currentPath: string[];
  private shellType: ShellType;
  private history: string[] = [];
  private env: Record<string, string>;

  constructor(shellType: ShellType, startingDir?: string) {
    this.shellType = shellType;
    this.vfs = this.initVFS();
    this.currentPath = this.parseStartingDir(startingDir, shellType);
    this.env = this.initEnv(shellType);
  }

  private initEnv(shellType: ShellType): Record<string, string> {
    const isWin = shellType === 'powershell' || shellType === 'cmd';
    return {
      USER: 'Developer',
      HOME: isWin ? 'C:\\Users\\Developer' : '/home/developer',
      SHELL: shellType,
      PATH: isWin
        ? 'C:\\Windows\\System32;C:\\Program Files\\PowerShell\\7;C:\\Program Files\\Git\\cmd'
        : '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      TERM: 'xterm-256color',
      OS: isWin ? 'Windows_NT' : 'Linux',
      COMPUTERNAME: 'WIN-TERM-STUDIO',
      PSVersion: '7.4.1',
    };
  }

  private parseStartingDir(dir?: string, shellType?: ShellType): string[] {
    if (!dir) return shellType === 'wsl' ? ['home', 'developer'] : ['Users', 'Developer'];
    const cleaned = dir.replace(/\\/g, '/').replace(/^\//, '').replace(/^C:/i, '');
    const parts = cleaned.split('/').filter(Boolean);
    return parts.length > 0 ? parts : ['Users', 'Developer'];
  }

  private initVFS(): VFSNode {
    return {
      name: 'root',
      type: 'dir',
      size: 0,
      updatedAt: '2026-11-05 12:00',
      children: {
        Users: {
          name: 'Users',
          type: 'dir',
          size: 0,
          updatedAt: '2026-11-05 12:00',
          children: {
            Developer: {
              name: 'Developer',
              type: 'dir',
              size: 0,
              updatedAt: '2026-11-05 12:00',
              children: {
                'README.md': {
                  name: 'README.md',
                  type: 'file',
                  size: 420,
                  updatedAt: '2026-11-05 10:15',
                  content: `# Welcome to Windows Terminal Web! 🚀

This is a simulated shell environment replicating Microsoft Windows Terminal.

Features:
- Multi-Tab & Split Pane support
- Simulated Shells: PowerShell 7, Command Prompt, Ubuntu (WSL2), Git Bash, Azure Cloud Shell
- Commands: ls, cd, cat, echo, mkdir, rm, grep, find, neofetch, matrix, top, curl, git, node, python, theme, history
- Try running \`neofetch\` or \`matrix\` or \`top\`!
`,
                },
                'package.json': {
                  name: 'package.json',
                  type: 'file',
                  size: 350,
                  updatedAt: '2026-11-05 11:30',
                  content: JSON.stringify(
                    {
                      name: 'my-awesome-project',
                      version: '1.0.0',
                      dependencies: {
                        react: '^18.3.1',
                        typescript: '^5.7.2',
                      },
                    },
                    null,
                    2
                  ),
                },
                Projects: {
                  name: 'Projects',
                  type: 'dir',
                  size: 0,
                  updatedAt: '2026-11-05 11:00',
                  children: {
                    'App.tsx': {
                      name: 'App.tsx',
                      type: 'file',
                      size: 280,
                      updatedAt: '2026-11-05 11:05',
                      content: `import React from 'react';\n\nexport default function App() {\n  return <h1>Hello from Windows Terminal Web!</h1>;\n}\n`,
                    },
                    'data.json': {
                      name: 'data.json',
                      type: 'file',
                      size: 150,
                      updatedAt: '2026-11-05 11:20',
                      content: JSON.stringify({ status: 'active', server: 'online', pingMs: 14 }, null, 2),
                    },
                  },
                },
                'system.log': {
                  name: 'system.log',
                  type: 'file',
                  size: 512,
                  updatedAt: '2026-11-05 12:01',
                  content: `[INFO] 2026-11-05 12:00:01 - Windows Terminal Web v1.0.0 initialized
[INFO] 2026-11-05 12:00:02 - ConPTY process host connected on PID 4096
[INFO] 2026-11-05 12:00:03 - GPU Acceleration enabled (DirectWrite / WebGL)
[WARN] 2026-11-05 12:00:04 - Azure sync token refreshed
[SUCCESS] 2026-11-05 12:00:05 - Shell session ready.
`,
                },
              },
            },
          },
        },
        home: {
          name: 'home',
          type: 'dir',
          size: 0,
          updatedAt: '2026-11-05 12:00',
          children: {
            developer: {
              name: 'developer',
              type: 'dir',
              size: 0,
              updatedAt: '2026-11-05 12:00',
              children: {
                '.bashrc': {
                  name: '.bashrc',
                  type: 'file',
                  size: 180,
                  updatedAt: '2026-11-05 09:00',
                  content: `export PS1='\\[\\e[32m\\]\\u@ubuntu\\:\\[\\e[34m\\]\\w\\[\\e[0m\\]\\$ '\nalias ll='ls -la'\nalias gs='git status'\n`,
                },
                'welcome.txt': {
                  name: 'welcome.txt',
                  type: 'file',
                  size: 120,
                  updatedAt: '2026-11-05 09:00',
                  content: 'Welcome to Ubuntu 24.04 LTS via WSL2 on Windows Terminal!\nType `help` for commands.\n',
                },
              },
            },
          },
        },
      },
    };
  }

  public getPrompt(): string {
    const isWin = this.shellType === 'powershell' || this.shellType === 'cmd';
    if (this.shellType === 'powershell') {
      const pathStr = 'PS C:\\' + this.currentPath.join('\\') + '>';
      return `\x1b[36m${pathStr}\x1b[0m `;
    }
    if (this.shellType === 'cmd') {
      const pathStr = 'C:\\' + this.currentPath.join('\\') + '>';
      return `${pathStr} `;
    }
    if (this.shellType === 'wsl') {
      const pathStr = '~/' + (this.currentPath.length > 2 ? this.currentPath.slice(2).join('/') : '');
      return `\x1b[32mdeveloper@ubuntu-wsl2\x1b[0m:\x1b[34m${pathStr}\x1b[0m$ `;
    }
    if (this.shellType === 'gitbash') {
      const pathStr = '/' + this.currentPath.join('/');
      return `\x1b[35mDeveloper@WIN-TERM-STUDIO\x1b[0m \x1b[33m${pathStr}\x1b[0m \x1b[36m(main)\x1b[0m\n$ `;
    }
    if (this.shellType === 'azureshell') {
      return `\x1b[34mdeveloper@Azure:\x1b[0m\x1b[33m~$\x1b[0m `;
    }
    return `\x1b[32m${this.shellType}\x1b[0m$ `;
  }

  public getCwd(): string {
    const isWin = this.shellType === 'powershell' || this.shellType === 'cmd';
    return isWin ? 'C:\\' + this.currentPath.join('\\') : '/' + this.currentPath.join('/');
  }

  private getNodeAtPath(pathParts: string[]): VFSNode | null {
    let curr = this.vfs;
    for (const part of pathParts) {
      if (part === '.' || part === '') continue;
      if (part === '..') {
        // Handled outside
        continue;
      }
      if (!curr.children || !curr.children[part]) {
        return null;
      }
      curr = curr.children[part];
    }
    return curr;
  }

  private resolvePath(target: string): string[] {
    const isWin = target.includes('\\') || target.startsWith('C:');
    const cleaned = target.replace(/\\/g, '/').replace(/^C:/i, '');
    let parts: string[];
    if (target.startsWith('/') || target.startsWith('\\') || target.toUpperCase().startsWith('C:')) {
      parts = cleaned.split('/').filter(Boolean);
    } else {
      parts = [...this.currentPath];
      const relParts = cleaned.split('/').filter(Boolean);
      for (const p of relParts) {
        if (p === '.') continue;
        if (p === '..') {
          if (parts.length > 0) parts.pop();
        } else {
          parts.push(p);
        }
      }
    }
    return parts;
  }

  public executeCommand(input: string, onSpecialAction?: (action: string, payload?: any) => void): string {
    const trimmed = input.trim();
    if (!trimmed) return '';

    this.history.push(trimmed);

    // Handle redirection (e.g. echo hello > file.txt)
    let commandStr = trimmed;
    let redirectFile: string | null = null;
    let isAppend = false;

    if (commandStr.includes('>>')) {
      const parts = commandStr.split('>>');
      commandStr = parts[0].trim();
      redirectFile = parts[1].trim();
      isAppend = true;
    } else if (commandStr.includes('>')) {
      const parts = commandStr.split('>');
      commandStr = parts[0].trim();
      redirectFile = parts[1].trim();
      isAppend = false;
    }

    const tokens = this.parseTokens(commandStr);
    const cmd = tokens[0]?.toLowerCase() || '';
    const args = tokens.slice(1);

    let output = '';

    switch (cmd) {
      case 'help':
      case '?':
      case 'get-help':
        output = this.cmdHelp(args);
        break;

      case 'ls':
      case 'dir':
      case 'get-childitem':
        output = this.cmdLs(args);
        break;

      case 'cd':
      case 'set-location':
      case 'chdir':
        output = this.cmdCd(args);
        break;

      case 'pwd':
      case 'get-location':
        output = `\x1b[36m${this.getCwd()}\x1b[0m`;
        break;

      case 'cat':
      case 'type':
      case 'get-content':
        output = this.cmdCat(args);
        break;

      case 'mkdir':
      case 'md':
        output = this.cmdMkdir(args);
        break;

      case 'touch':
      case 'ni':
      case 'new-item':
        output = this.cmdTouch(args);
        break;

      case 'rm':
      case 'del':
      case 'remove-item':
      case 'rmdir':
        output = this.cmdRm(args);
        break;

      case 'echo':
      case 'write-output':
      case 'print':
        output = this.cmdEcho(args);
        break;

      case 'grep':
      case 'select-string':
        output = this.cmdGrep(args);
        break;

      case 'find':
        output = this.cmdFind(args);
        break;

      case 'date':
      case 'get-date':
        output = `\x1b[33m${new Date().toLocaleString()}\x1b[0m`;
        break;

      case 'whoami':
        output = `${this.env.USER}@${this.env.COMPUTERNAME}`;
        break;

      case 'clear':
      case 'cls':
      case 'clear-host':
        if (onSpecialAction) onSpecialAction('clear');
        return '';

      case 'neofetch':
      case 'systeminfo':
        output = this.cmdNeofetch();
        break;

      case 'matrix':
      case 'cmatrix':
        if (onSpecialAction) onSpecialAction('matrix');
        return '\x1b[32mEntering Matrix Mode... Press ESC or Ctrl+C to return.\x1b[0m';

      case 'top':
      case 'htop':
      case 'get-process':
        if (onSpecialAction) onSpecialAction('htop');
        return this.cmdTop();

      case 'vim':
      case 'nano':
      case 'notepad':
      case 'edit':
        if (args.length === 0) {
          output = '\x1b[31mUsage: nano/vim <filename>\x1b[0m';
        } else {
          if (onSpecialAction) onSpecialAction('editor', { filename: args[0], content: this.readFileContent(args[0]) });
          return `\x1b[33mOpening editor for ${args[0]}...\x1b[0m`;
        }
        break;

      case 'curl':
      case 'wget':
      case 'invoke-webrequest':
        output = this.cmdCurl(args);
        break;

      case 'git':
        output = this.cmdGit(args);
        break;

      case 'node':
      case 'python':
      case 'python3':
        output = this.cmdRepl(cmd, args);
        break;

      case 'theme':
      case 'color':
        if (args.length > 0 && onSpecialAction) {
          onSpecialAction('theme', args[0]);
          output = `\x1b[32mSwitched color scheme to '${args[0]}'\x1b[0m`;
        } else {
          output = '\x1b[33mUsage: theme <name>\x1b[0m\nAvailable: Campbell, One Half Dark, Solarized Dark, Tango Dark, Dracula, Retro Matrix CRT, Cyberpunk 2077';
        }
        break;

      case 'history':
      case 'get-history':
        output = this.history.map((h, i) => `  \x1b[90m${i + 1}\x1b[0m  ${h}`).join('\n');
        break;

      case 'ps':
      case 'tasklist':
        output = this.cmdPs();
        break;

      case 'ping':
        output = this.cmdPing(args);
        break;

      case 'ver':
      case 'version':
        output = '\x1b[36mMicrosoft Windows Terminal Web [Version 10.0.26100.2161]\x1b[0m';
        break;

      default:
        output = `\x1b[31m${cmd}: command not found.\x1b[0m Type '\x1b[33mhelp\x1b[0m' for available commands.`;
        break;
    }

    if (redirectFile) {
      this.writeFileContent(redirectFile, output, isAppend);
      return `\x1b[90m[Output written to ${redirectFile}]\x1b[0m`;
    }

    return output;
  }

  private parseTokens(input: string): string[] {
    const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
    const tokens: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      tokens.push(match[1] ?? match[2] ?? match[3]);
    }
    return tokens;
  }

  private cmdHelp(args: string[]): string {
    return `\x1b[1;36mWINDOWS TERMINAL WEB - SIMULATED COMMAND SUITE\x1b[0m

\x1b[33mFile System Operations:\x1b[0m
  ls, dir, Get-ChildItem      List contents of current directory
  cd, Set-Location            Change directory
  pwd, Get-Location           Display current working directory
  cat, type, Get-Content      Read file contents
  mkdir, md                   Create a new directory
  touch, ni                   Create an empty file
  rm, del, Remove-Item        Remove file or folder
  grep, Select-String         Search text in files
  find                        Search for files by name

\x1b[33mSystem & Information:\x1b[0m
  neofetch, systeminfo        Display system specs and ASCII logo
  top, htop, Get-Process      Show running processes
  whoami                      Display current user
  date, Get-Date              Show system timestamp
  ver, version                Show Windows Terminal version
  clear, cls                  Clear terminal buffer
  history                     Display command history

\x1b[33mDeveloper Tools & Utilities:\x1b[0m
  nano, vim, edit             Edit files in visual editor modal
  git <status|log|commit>     Simulated Git operations
  curl, wget <url>            Simulate web HTTP requests
  node, python                Simulated JS / Python REPL
  matrix, cmatrix             Launch Matrix digital rain animation
  theme <scheme-name>         Quick switch terminal color scheme
  echo <text> [> file]        Print text or redirect to file

\x1b[90mTip: Press Ctrl+Shift+P for the Windows Terminal Command Palette!\x1b[0m`;
  }

  private cmdLs(args: string[]): string {
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al') || this.shellType === 'cmd' || this.shellType === 'powershell';

    const node = this.getNodeAtPath(this.currentPath);
    if (!node || !node.children) return '\x1b[31mDirectory error.\x1b[0m';

    const items = Object.values(node.children).filter((item) => showAll || !item.name.startsWith('.'));

    if (items.length === 0) return '\x1b[90m(directory is empty)\x1b[0m';

    if (this.shellType === 'powershell') {
      let res = `\x1b[90m    Directory: ${this.getCwd()}\x1b[0m\n\n`;
      res += '\x1b[1;30mMode                 LastWriteTime         Length Name\x1b[0m\n';
      res += '\x1b[90m----                 -------------         ------ ----\x1b[0m\n';
      for (const item of items) {
        const mode = item.type === 'dir' ? 'd-----' : '-a----';
        const date = item.updatedAt.padEnd(20);
        const size = item.type === 'dir' ? ''.padStart(12) : String(item.size).padStart(12);
        const nameColor = item.type === 'dir' ? '\x1b[1;34m' : '\x1b[0m';
        res += `${mode} ${date} ${size} ${nameColor}${item.name}\x1b[0m\n`;
      }
      return res;
    }

    if (this.shellType === 'cmd') {
      let res = ` Volume in drive C has no label.\n Volume Serial Number is 4C9E-8A11\n\n Directory of ${this.getCwd()}\n\n`;
      let fileCount = 0;
      let dirCount = 0;
      let totalSize = 0;
      for (const item of items) {
        const date = item.updatedAt.padEnd(20);
        if (item.type === 'dir') {
          dirCount++;
          res += `${date}    <DIR>          \x1b[1;36m${item.name}\x1b[0m\n`;
        } else {
          fileCount++;
          totalSize += item.size;
          const size = String(item.size).padStart(14);
          res += `${date} ${size} \x1b[0m${item.name}\n`;
        }
      }
      res += `              ${fileCount} File(s)    ${totalSize} bytes\n              ${dirCount} Dir(s)   42,949,672,960 bytes free`;
      return res;
    }

    // POSIX style
    if (showLong) {
      return items
        .map((item) => {
          const perm = item.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
          const size = String(item.size).padStart(8);
          const color = item.type === 'dir' ? '\x1b[1;34m' : item.name.endsWith('.sh') ? '\x1b[1;32m' : '\x1b[0m';
          return `${perm} 1 developer staff ${size} ${item.updatedAt} ${color}${item.name}\x1b[0m`;
        })
        .join('\n');
    }

    return items
      .map((item) => {
        const color = item.type === 'dir' ? '\x1b[1;34m' : item.name.endsWith('.sh') ? '\x1b[1;32m' : '\x1b[0m';
        return `${color}${item.name}\x1b[0m`;
      })
      .join('  ');
  }

  private cmdCd(args: string[]): string {
    if (args.length === 0 || args[0] === '~') {
      this.currentPath = this.shellType === 'wsl' ? ['home', 'developer'] : ['Users', 'Developer'];
      return '';
    }
    const target = args[0];
    const newPath = this.resolvePath(target);
    const node = this.getNodeAtPath(newPath);

    if (!node) {
      return `\x1b[31mcd: no such file or directory: ${target}\x1b[0m`;
    }
    if (node.type !== 'dir') {
      return `\x1b[31mcd: not a directory: ${target}\x1b[0m`;
    }

    this.currentPath = newPath;
    return '';
  }

  private cmdCat(args: string[]): string {
    if (args.length === 0) return '\x1b[31mUsage: cat <filename>\x1b[0m';
    const filename = args[0];
    const path = this.resolvePath(filename);
    const node = this.getNodeAtPath(path);

    if (!node) return `\x1b[31mcat: ${filename}: No such file or directory\x1b[0m`;
    if (node.type === 'dir') return `\x1b[31mcat: ${filename}: Is a directory\x1b[0m`;

    return node.content || '\x1b[90m(empty file)\x1b[0m';
  }

  public readFileContent(filename: string): string {
    const path = this.resolvePath(filename);
    const node = this.getNodeAtPath(path);
    return node?.content || '';
  }

  public writeFileContent(filename: string, content: string, append = false): void {
    const path = this.resolvePath(filename);
    const dirPath = path.slice(0, -1);
    const fileNameOnly = path[path.length - 1];

    const dirNode = this.getNodeAtPath(dirPath);
    if (!dirNode || dirNode.type !== 'dir') return;

    if (!dirNode.children) dirNode.children = {};

    const existing = dirNode.children[fileNameOnly];
    if (existing && append) {
      existing.content = (existing.content || '') + '\n' + content;
      existing.size = existing.content.length;
      existing.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
    } else {
      dirNode.children[fileNameOnly] = {
        name: fileNameOnly,
        type: 'file',
        content,
        size: content.length,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
    }
  }

  private cmdMkdir(args: string[]): string {
    if (args.length === 0) return '\x1b[31mUsage: mkdir <foldername>\x1b[0m';
    const target = args[0];
    const path = this.resolvePath(target);
    const dirPath = path.slice(0, -1);
    const folderName = path[path.length - 1];

    const parent = this.getNodeAtPath(dirPath);
    if (!parent || parent.type !== 'dir') return `\x1b[31mmkdir: cannot create directory '${target}': No such file or directory\x1b[0m`;

    if (!parent.children) parent.children = {};
    if (parent.children[folderName]) return `\x1b[31mmkdir: cannot create directory '${target}': File exists\x1b[0m`;

    parent.children[folderName] = {
      name: folderName,
      type: 'dir',
      size: 0,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      children: {},
    };

    return '';
  }

  private cmdTouch(args: string[]): string {
    if (args.length === 0) return '\x1b[31mUsage: touch <filename>\x1b[0m';
    this.writeFileContent(args[0], '', false);
    return '';
  }

  private cmdRm(args: string[]): string {
    if (args.length === 0) return '\x1b[31mUsage: rm <filename/foldername>\x1b[0m';
    const target = args[0];
    const path = this.resolvePath(target);
    const dirPath = path.slice(0, -1);
    const nameOnly = path[path.length - 1];

    const parent = this.getNodeAtPath(dirPath);
    if (!parent || !parent.children || !parent.children[nameOnly]) {
      return `\x1b[31mrm: cannot remove '${target}': No such file or directory\x1b[0m`;
    }

    delete parent.children[nameOnly];
    return '';
  }

  private cmdEcho(args: string[]): string {
    const text = args.join(' ');
    // Handle env var interpolation like $USER or %USER%
    let result = text.replace(/\$([A-Z0-9_]+)/gi, (_, g1) => this.env[g1] || '');
    result = result.replace(/%([A-Z0-9_]+)%/gi, (_, g1) => this.env[g1] || '');
    return result;
  }

  private cmdGrep(args: string[]): string {
    if (args.length < 2) return '\x1b[31mUsage: grep <pattern> <filename>\x1b[0m';
    const pattern = args[0];
    const filename = args[1];
    const content = this.readFileContent(filename);
    if (!content) return `\x1b[31mgrep: ${filename}: No such file or file empty\x1b[0m`;

    const lines = content.split('\n');
    const matches = lines.filter((l) => l.toLowerCase().includes(pattern.toLowerCase()));
    if (matches.length === 0) return '\x1b[90m(no matches found)\x1b[0m';

    return matches
      .map((l) => l.replace(new RegExp(pattern, 'gi'), (m) => `\x1b[1;31m${m}\x1b[0m`))
      .join('\n');
  }

  private cmdFind(args: string[]): string {
    const node = this.getNodeAtPath(this.currentPath);
    if (!node || !node.children) return '.';
    const results: string[] = ['.'];
    const traverse = (curr: VFSNode, prefix: string) => {
      if (!curr.children) return;
      for (const key of Object.keys(curr.children)) {
        const child = curr.children[key];
        const path = `${prefix}/${child.name}`;
        results.push(path);
        if (child.type === 'dir') traverse(child, path);
      }
    };
    traverse(node, '.');
    return results.join('\n');
  }

  private cmdNeofetch(): string {
    const logo =
      this.shellType === 'wsl'
        ? `\x1b[33m
            .-.
           (   )
            \`-\`
        \x1b[31m   /   \\
          /     \\
         /       \\
        /         \\\x1b[0m`
        : `\x1b[36m
   ██████████████  ██████████████
   ██████████████  ██████████████
   ██████████████  ██████████████
   
   ██████████████  ██████████████
   ██████████████  ██████████████
   ██████████████  ██████████████\x1b[0m`;

    return `${logo}
\x1b[1;32mdeveloper\x1b[0m@\x1b[1;36mWIN-TERM-STUDIO\x1b[0m
---------------------------
\x1b[33mOS\x1b[0m: Windows 11 Pro 24H2 / Web Container
\x1b[33mHost\x1b[0m: AI Studio Hyper-V Virtual Machine
\x1b[33mKernel\x1b[0m: Linux 6.6.0-x86_64 / ConPTY Host
\x1b[33mUptime\x1b[0m: 4 hours, 20 mins
\x1b[33mShell\x1b[0m: ${this.shellType} v7.4.1
\x1b[33mTerminal\x1b[0m: Windows Terminal Web v1.20
\x1b[33mCPU\x1b[0m: Intel Core i9-14900K (16) @ 5.80GHz
\x1b[33mGPU\x1b[0m: NVIDIA GeForce RTX 4090 (24GB)
\x1b[33mMemory\x1b[0m: 4096MiB / 32768MiB

\x1b[40m   \x1b[41m   \x1b[42m   \x1b[43m   \x1b[44m   \x1b[45m   \x1b[46m   \x1b[47m   \x1b[0m`;
  }

  private cmdTop(): string {
    return `\x1b[1;36mSimulated Process Monitor (Press Ctrl+C to exit)\x1b[0m
Tasks: \x1b[32m12 total\x1b[0m, \x1b[33m1 running\x1b[0m, \x1b[90m11 sleeping\x1b[0m
%Cpu(s): \x1b[32m3.2 us\x1b[0m, \x1b[33m1.1 sy\x1b[0m, \x1b[90m95.7 id\x1b[0m

\x1b[7m PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND             \x1b[0m
 1024 developer  20   0  452890  84200  32100 S   2.4   0.8   0:14.20 WindowsTerminal.exe
 1088 developer  20   0  120400  42100  18200 S   0.8   0.4   0:02.10 OpenConsole.exe     
 1409 developer  20   0   84200  28900  14100 R   0.5   0.3   0:00.85 pwsh.exe            
 1820 developer  20   0  512000 128400  45000 S   0.2   1.2   0:05.40 node.exe            
 2104 developer  20   0   14200   4500   3200 S   0.0   0.1   0:00.04 wslhost.exe         
`;
  }

  private cmdPs(): string {
    return `  PID TTY          TIME CMD
 1024 tty1     00:00:01 WindowsTerminal
 1088 tty1     00:00:00 ConPTY
 1409 tty1     00:00:00 ${this.shellType}`;
  }

  private cmdPing(args: string[]): string {
    const host = args[0] || '1.1.1.1';
    return `PING ${host} (${host}): 56 data bytes
64 bytes from ${host}: icmp_seq=0 ttl=118 time=12.4 ms
64 bytes from ${host}: icmp_seq=1 ttl=118 time=11.8 ms
64 bytes from ${host}: icmp_seq=2 ttl=118 time=13.1 ms
64 bytes from ${host}: icmp_seq=3 ttl=118 time=12.0 ms

--- ${host} ping statistics ---
4 packets transmitted, 4 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 11.8/12.3/13.1/0.5 ms`;
  }

  private cmdCurl(args: string[]): string {
    const url = args[0] || 'https://api.github.com';
    return `\x1b[32mHTTP/1.1 200 OK\x1b[0m
Date: ${new Date().toUTCString()}
Content-Type: application/json; charset=utf-8
Server: GitHub.com

{
  "message": "Windows Terminal Web API Connection Verified",
  "status": "connected",
  "endpoint": "${url}",
  "timestamp": ${Date.now()}
}`;
  }

  private cmdGit(args: string[]): string {
    const sub = args[0] || 'status';
    if (sub === 'status') {
      return `\x1b[32mOn branch main\x1b[0m
Your branch is up to date with 'origin/main'.

\x1b[33mChanges not staged for commit:\x1b[0m
  (use "git add <file>..." to update what will be committed)
	\x1b[31mmodified:   src/App.tsx\x1b[0m

no changes added to commit (use "git add" and/or "git commit -a")`;
    }
    if (sub === 'log') {
      return `\x1b[33mcommit a1b2c3d4e5f67890 (HEAD -> main, origin/main)\x1b[0m
Author: Developer <developer@example.com>
Date:   Thu Nov 5 22:15:00 2026 -0800

    feat: implement Windows Terminal Web emulator components

\x1b[33mcommit f9e8d7c6b5a43210\x1b[0m
Author: Developer <developer@example.com>
Date:   Thu Nov 5 21:30:00 2026 -0800

    initial setup for terminal workspace`;
    }
    if (sub === 'branch') {
      return `* \x1b[32mmain\x1b[0m\n  feature/tabs\n  feature/crt-shader`;
    }
    return `\x1b[32mgit ${sub} executed successfully.\x1b[0m`;
  }

  private cmdRepl(cmd: string, args: string[]): string {
    if (args.length > 0) {
      const expr = args.join(' ');
      try {
        const val = Function(`"use strict"; return (${expr});`)();
        return `\x1b[32m${val}\x1b[0m`;
      } catch (err: any) {
        return `\x1b[31mError: ${err.message}\x1b[0m`;
      }
    }
    return `\x1b[33mWelcome to ${cmd.toUpperCase()} REPL mode.\x1b[0m\nType expressions like \`2 + 2\` or \`Math.PI\` in single command lines.`;
  }

  public getCompletions(partial: string): string[] {
    const commands = [
      'help',
      'ls',
      'dir',
      'cd',
      'pwd',
      'cat',
      'mkdir',
      'touch',
      'rm',
      'echo',
      'grep',
      'find',
      'clear',
      'neofetch',
      'systeminfo',
      'matrix',
      'top',
      'htop',
      'vim',
      'nano',
      'curl',
      'git',
      'node',
      'python',
      'theme',
      'history',
      'ping',
      'whoami',
      'date',
    ];

    const tokens = partial.split(' ');
    if (tokens.length <= 1) {
      return commands.filter((c) => c.startsWith(tokens[0].toLowerCase()));
    }

    // Auto-complete files/folders in current directory
    const lastToken = tokens[tokens.length - 1];
    const node = this.getNodeAtPath(this.currentPath);
    if (node && node.children) {
      return Object.keys(node.children).filter((name) => name.toLowerCase().startsWith(lastToken.toLowerCase()));
    }
    return [];
  }
}

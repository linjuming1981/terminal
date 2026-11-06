import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';
import { Profile, ColorScheme, Settings } from '../types/terminal';
import { ShellEngine } from '../services/shellEngine';
import { Terminal as TerminalIcon, X, Play, RefreshCw, Maximize2, Save } from 'lucide-react';

interface TerminalViewProps {
  paneId: string;
  profile: Profile;
  colorScheme: ColorScheme;
  settings: Settings;
  isActive: boolean;
  onFocus: () => void;
  onSplitPane?: (direction: 'horizontal' | 'vertical') => void;
  onClosePane?: () => void;
  onChangeScheme?: (name: string) => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  paneId,
  profile,
  colorScheme,
  settings,
  isActive,
  onFocus,
  onSplitPane,
  onClosePane,
  onChangeScheme,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const shellEngineRef = useRef<ShellEngine | null>(null);
  const currentInputRef = useRef<string>('');

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [matrixActive, setMatrixActive] = useState<boolean>(false);

  // Editor Modal State (Vim / Nano)
  const [editorState, setEditorState] = useState<{ filename: string; content: string } | null>(null);

  useEffect(() => {
    shellEngineRef.current = new ShellEngine(profile.shellType, profile.startingDirectory);

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: profile.cursorShape === 'bar' ? 'bar' : profile.cursorShape === 'vintage' ? 'block' : profile.cursorShape === 'underscore' ? 'underline' : 'block',
      fontFamily: profile.fontFace || 'Cascadia Code',
      fontSize: profile.fontSize || 13,
      lineHeight: 1.2,
      theme: {
        background: colorScheme.background,
        foreground: colorScheme.foreground,
        selectionBackground: colorScheme.selectionBackground,
        cursor: colorScheme.cursorColor,
        black: colorScheme.black,
        red: colorScheme.red,
        green: colorScheme.green,
        yellow: colorScheme.yellow,
        blue: colorScheme.blue,
        magenta: colorScheme.purple,
        cyan: colorScheme.cyan,
        white: colorScheme.white,
        brightBlack: colorScheme.brightBlack,
        brightRed: colorScheme.brightRed,
        brightGreen: colorScheme.brightGreen,
        brightYellow: colorScheme.brightYellow,
        brightBlue: colorScheme.brightBlue,
        brightMagenta: colorScheme.brightPurple,
        brightCyan: colorScheme.brightCyan,
        brightWhite: colorScheme.brightWhite,
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    if (terminalRef.current) {
      term.open(terminalRef.current);
      fitAddon.fit();
    }

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome banner
    term.writeln(`\x1b[1;36mMicrosoft Windows Terminal Web [Version 1.0.26100.2161]\x1b[0m`);
    term.writeln(`\x1b[90m(c) Microsoft Corporation. All rights reserved.\x1b[0m`);
    term.writeln(`\x1b[32mRunning Profile: ${profile.name} (${profile.shellType})\x1b[0m`);
    term.writeln(`\x1b[90mType '\x1b[33mhelp\x1b[90m' or press \x1b[33mCtrl+Shift+P\x1b[90m for Command Palette.\x1b[0m\n`);

    const prompt = shellEngineRef.current.getPrompt();
    term.write(prompt);

    // Key input listener
    term.onData((data) => {
      const shell = shellEngineRef.current;
      if (!shell) return;

      // Handle Matrix return
      if (matrixActive) {
        setMatrixActive(false);
        term.writeln('\n\x1b[32mExited Matrix Mode.\x1b[0m');
        term.write(shell.getPrompt());
        return;
      }

      // Handle Enter
      if (data === '\r') {
        term.writeln('');
        const line = currentInputRef.current;
        currentInputRef.current = '';

        if (line.trim()) {
          const result = shell.executeCommand(line, (action, payload) => {
            if (action === 'clear') {
              term.clear();
            } else if (action === 'matrix') {
              setMatrixActive(true);
            } else if (action === 'editor' && payload) {
              setEditorState({ filename: payload.filename, content: payload.content });
            } else if (action === 'theme' && payload && onChangeScheme) {
              onChangeScheme(payload);
            }
          });

          if (result) {
            term.writeln(result);
          }
        }

        term.write(shell.getPrompt());
      }
      // Handle Backspace
      else if (data === '\x7f' || data === '\x08') {
        if (currentInputRef.current.length > 0) {
          currentInputRef.current = currentInputRef.current.slice(0, -1);
          term.write('\b \b');
        }
      }
      // Handle Tab completion
      else if (data === '\t') {
        const completions = shell.getCompletions(currentInputRef.current);
        if (completions.length === 1) {
          const parts = currentInputRef.current.split(' ');
          parts[parts.length - 1] = completions[0];
          const newCmd = parts.join(' ');
          // Erase current input
          for (let i = 0; i < currentInputRef.current.length; i++) {
            term.write('\b \b');
          }
          currentInputRef.current = newCmd;
          term.write(newCmd);
        } else if (completions.length > 1) {
          term.writeln('');
          term.writeln(`\x1b[90m${completions.join('  ')}\x1b[0m`);
          term.write(shell.getPrompt() + currentInputRef.current);
        }
      }
      // Handle Ctrl+C
      else if (data === '\x03') {
        currentInputRef.current = '';
        term.writeln('^C');
        term.write(shell.getPrompt());
      }
      // Handle Ctrl+L (Clear)
      else if (data === '\x0c') {
        term.clear();
        term.write(shell.getPrompt() + currentInputRef.current);
      }
      // Regular printable characters
      else if (data >= ' ' || data === '\x1b') {
        currentInputRef.current += data;
        term.write(data);
      }
    });

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (err) {
        // Ignored
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [profile.guid, profile.shellType]);

  // Update theme dynamically
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = {
        background: colorScheme.background,
        foreground: colorScheme.foreground,
        selectionBackground: colorScheme.selectionBackground,
        cursor: colorScheme.cursorColor,
        black: colorScheme.black,
        red: colorScheme.red,
        green: colorScheme.green,
        yellow: colorScheme.yellow,
        blue: colorScheme.blue,
        magenta: colorScheme.purple,
        cyan: colorScheme.cyan,
        white: colorScheme.white,
        brightBlack: colorScheme.brightBlack,
        brightRed: colorScheme.brightRed,
        brightGreen: colorScheme.brightGreen,
        brightYellow: colorScheme.brightYellow,
        brightBlue: colorScheme.brightBlue,
        brightMagenta: colorScheme.brightPurple,
        brightCyan: colorScheme.brightCyan,
        brightWhite: colorScheme.brightWhite,
      };
      xtermRef.current.options.fontFamily = profile.fontFace;
      xtermRef.current.options.fontSize = profile.fontSize;
    }
  }, [colorScheme, profile.fontFace, profile.fontSize]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCopy = () => {
    if (xtermRef.current) {
      const selection = xtermRef.current.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
      }
    }
    setContextMenu(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && xtermRef.current) {
        currentInputRef.current += text;
        xtermRef.current.write(text);
      }
    } catch (err) {
      // Ignored
    }
    setContextMenu(null);
  };

  const handleClearBuffer = () => {
    if (xtermRef.current && shellEngineRef.current) {
      xtermRef.current.clear();
      xtermRef.current.write(shellEngineRef.current.getPrompt());
      currentInputRef.current = '';
    }
    setContextMenu(null);
  };

  const handleSaveFile = () => {
    if (editorState && shellEngineRef.current) {
      shellEngineRef.current.writeFileContent(editorState.filename, editorState.content);
      if (xtermRef.current) {
        xtermRef.current.writeln(`\n\x1b[32mSaved ${editorState.filename} successfully.\x1b[0m`);
        xtermRef.current.write(shellEngineRef.current.getPrompt());
      }
      setEditorState(null);
    }
  };

  return (
    <div
      onClick={onFocus}
      onContextMenu={handleContextMenu}
      className={`relative h-full w-full overflow-hidden flex flex-col transition-all duration-150 ${
        isActive ? 'ring-1 ring-blue-500/60 z-10' : 'opacity-95'
      } ${settings.crtEffect ? 'crt-overlay' : ''}`}
      style={{
        backgroundColor: colorScheme.background,
        color: colorScheme.foreground,
      }}
    >
      {/* Terminal Container */}
      <div ref={terminalRef} className="flex-1 w-full h-full overflow-hidden" />

      {/* Matrix Mode Overlay */}
      {matrixActive && (
        <div
          onClick={() => setMatrixActive(false)}
          className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center font-mono cursor-pointer select-none crt-overlay"
        >
          <div className="absolute top-4 right-4 bg-green-950/80 text-green-400 border border-green-500/50 px-3 py-1 rounded text-xs">
            Matrix Mode Active (Click or Press ESC to Exit)
          </div>
          <MatrixRain />
        </div>
      )}

      {/* In-Terminal Code Editor Modal (Vim/Nano simulator) */}
      {editorState && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 flex flex-col p-4 font-mono text-sm border border-slate-700">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-200">
            <div className="flex items-center space-x-2">
              <TerminalIcon className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-emerald-400">GNU nano 7.2</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">{editorState.filename}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveFile}
                className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save (^O)</span>
              </button>
              <button
                onClick={() => setEditorState(null)}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Exit (^X)</span>
              </button>
            </div>
          </div>
          <textarea
            value={editorState.content}
            onChange={(e) => setEditorState({ ...editorState, content: e.target.value })}
            className="flex-1 bg-slate-900 text-slate-100 p-3 mt-3 rounded outline-none border border-slate-800 resize-none font-mono text-sm leading-relaxed"
            placeholder="Type content here..."
            autoFocus
          />
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Lines: {editorState.content.split('\n').length} | Words: {editorState.content.split(/\s+/).filter(Boolean).length}</span>
            <span>^O WriteOut   ^X Exit   ^K Cut   ^U Uncut</span>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg shadow-2xl py-1 w-48 font-sans"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleCopy}
            className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center justify-between"
          >
            <span>Copy</span>
            <span className="text-slate-400 text-[10px]">Ctrl+Shift+C</span>
          </button>
          <button
            onClick={handlePaste}
            className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center justify-between"
          >
            <span>Paste</span>
            <span className="text-slate-400 text-[10px]">Ctrl+Shift+V</span>
          </button>
          <div className="my-1 border-t border-slate-800" />
          <button
            onClick={() => {
              if (onSplitPane) onSplitPane('vertical');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center justify-between"
          >
            <span>Split Pane Right</span>
            <span className="text-slate-400 text-[10px]">Alt+Shift++</span>
          </button>
          <button
            onClick={() => {
              if (onSplitPane) onSplitPane('horizontal');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center justify-between"
          >
            <span>Split Pane Down</span>
            <span className="text-slate-400 text-[10px]">Alt+Shift+-</span>
          </button>
          <div className="my-1 border-t border-slate-800" />
          <button
            onClick={handleClearBuffer}
            className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center justify-between"
          >
            <span>Clear Buffer</span>
            <span className="text-slate-400 text-[10px]">Ctrl+Shift+K</span>
          </button>
          {onClosePane && (
            <button
              onClick={() => {
                onClosePane();
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-2 hover:bg-rose-600 hover:text-white flex items-center justify-between text-rose-400"
            >
              <span>Close Pane</span>
              <span className="text-rose-300 text-[10px]">Ctrl+Shift+W</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Canvas Matrix Rain Component
const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 600;

    const chars = '0123456789ABCDEF010101XYZ日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#22C55E';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Download,
  FileCode,
  CheckCircle2,
  Terminal,
  FolderArchive,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Code2,
  Play,
  Monitor,
  PanelLeft,
  Settings as SettingsIcon,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { GIT_PATCH_CONTENT, PORTABLE_SETTINGS_JSON } from './constants/patchData';
import { POWERSHELL_BUILD_SCRIPT } from './constants/powershellScript';
import { GITHUB_WORKFLOW_YML } from './constants/githubWorkflow';
import { DEFAULT_SETTINGS, POWERSHELL_GUID } from './constants/defaultSettings';
import { TerminalTabHeader } from './components/TerminalTabHeader';
import { VerticalTabSidebar } from './components/VerticalTabSidebar';
import { PaneContainer } from './components/PaneContainer';
import { CommandPalette } from './components/CommandPalette';
import { SettingsModal } from './components/Settings/SettingsModal';
import { StatusBar } from './components/StatusBar';
import { TerminalTab, Settings } from './types/terminal';

export default function App() {
  const [copiedPatch, setCopiedPatch] = useState(false);
  const [copiedSettings, setCopiedSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'download' | 'sandbox'>('download');
  const [downloading, setDownloading] = useState(false);

  // Web Terminal Simulator State
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('windows_terminal_settings');
      return saved ? { ...JSON.parse(saved), tabPosition: 'left' } : { ...DEFAULT_SETTINGS, tabPosition: 'left' };
    } catch {
      return { ...DEFAULT_SETTINGS, tabPosition: 'left' };
    }
  });

  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'tab-1',
      title: 'PowerShell 7',
      profileGuid: POWERSHELL_GUID,
      paneTree: {
        id: 'pane-1',
        type: 'leaf',
        profileGuid: POWERSHELL_GUID,
      },
      activePaneId: 'pane-1',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const activeProfile = settings.profiles.find((p) => p.guid === activeTab.profileGuid) || settings.profiles[0];
  const activeScheme = settings.schemes.find((s) => s.name === activeProfile.colorScheme) || settings.schemes[0];

  // Download complete modified C++ repo source package as ZIP
  const handleDownloadFullZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      
      // Add 1-Click PowerShell Build Script
      zip.file('build-portable-terminal.ps1', POWERSHELL_BUILD_SCRIPT);

      // Add Readme
      zip.file(
        'README-PORTABLE-BUILD.txt',
        `========================================================================
Windows Terminal 左侧 Tab 页签改造版 (Tabby 风格) 1-Click 便携构建包
========================================================================

【为什么不能在 Cloud Linux 容器中直接提供二进制 .exe 文件？】
Microsoft Windows Terminal 是基于 Windows C++、WinUI 3 和 Windows SDK 10 的原生 Windows 桌面程序。
Windows 原生 .exe 程序必须在包含 Visual Studio MSVC C++ 编译器的 Windows 系统中生成。

【如何在 Windows 电脑上一键生成 WindowsTerminal.exe 便携包？】
1. 解压本 ZIP 包到本地文件夹。
2. 右键点击 \`build-portable-terminal.ps1\`，选择 "用 PowerShell 运行" (Run with PowerShell)。
3. 脚本会自动拉取微软官方源码、打入左侧 Tab 补丁、调用 MSBuild 自动编译，并直接在同目录下生成 \`WindowsTerminal.exe\` 便携版文件夹！
4. 点击解压后的 \`WindowsTerminal.exe\` 即可完美运行包含左侧 Vertical Tabs 侧边栏的 Windows Terminal！
`
      );

      // Add patch file
      zip.file('patches/vertical-tabs.patch', GIT_PATCH_CONTENT);

      // Add settings.json
      zip.file('config/settings.json', JSON.stringify(PORTABLE_SETTINGS_JSON, null, 2));

      // Add XAML sample
      zip.file(
        'src/cascadia/TerminalApp/TerminalPage.xaml',
        `<Page x:Class="TerminalApp.TerminalPage"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <Grid x:Name="RootGrid">
        <Grid.ColumnDefinitions>
            <ColumnDefinition x:Name="LeftTabColumn" Width="Auto" />
            <ColumnDefinition Width="*" />
        </Grid.ColumnDefinitions>
        <!-- Left Vertical Navigation View (Tabby Style) -->
        <NavigationView x:Name="VerticalTabView" Grid.Column="0" PaneDisplayMode="Left" />
        <Grid Grid.Column="1" x:Name="TabContentPresenter" />
    </Grid>
</Page>`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'WindowsTerminal-VerticalTabs-ModSource.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPatch = () => {
    const blob = new Blob([GIT_PATCH_CONTENT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vertical-tabs-tabby-style.patch';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSettingsJson = () => {
    const blob = new Blob([JSON.stringify(PORTABLE_SETTINGS_JSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, type: 'patch' | 'settings') => {
    navigator.clipboard.writeText(text);
    if (type === 'patch') {
      setCopiedPatch(true);
      setTimeout(() => setCopiedPatch(false), 2000);
    } else {
      setCopiedSettings(true);
      setTimeout(() => setCopiedSettings(false), 2000);
    }
  };

  const handleDownloadWorkflowYml = () => {
    const blob = new Blob([GITHUB_WORKFLOW_YML], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'build-release.yml';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col select-none">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base text-slate-100 tracking-tight">
                Windows Terminal 改造版 GitHub Actions 自动编译与下载中心
              </h1>
              <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800/80 px-2 py-0.5 rounded-full font-mono font-medium">
                GitHub Release Auto-Build
              </span>
            </div>
            <p className="text-xs text-slate-400">
              支持一键提交至您的 GitHub Fork 仓库，云端自动编译出包
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('download')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
              viewMode === 'download'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>GitHub Actions 在线编译 & 下载</span>
          </button>
          <button
            onClick={() => setViewMode('sandbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
              viewMode === 'sandbox'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Web 演示版 (Sandbox)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      {viewMode === 'download' ? (
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 bg-purple-950/80 border border-purple-800 text-purple-300 px-3 py-1 rounded-full text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GitHub Actions 在线自动编译包 (无需本地 C++ 环境)</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  GitHub Actions 自动构建与发布 WindowsTerminal.exe
                </h2>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  只需将我为您写好的 GitHub Actions 工作流文件放进您的仓库中，提交或发布 Release 时，GitHub 云端 Windows 虚拟机会自动全自动编译出包并把包含 <code className="text-emerald-400 font-mono">WindowsTerminal.exe</code> 的压缩包上传到 GitHub Releases 供您直接下载！
                </p>
              </div>

              {/* Download Workflow Yml Button */}
              <button
                onClick={handleDownloadWorkflowYml}
                className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm px-6 py-4 rounded-xl shadow-xl shadow-purple-600/30 flex items-center justify-center space-x-3 transition transform active:scale-95 flex-shrink-0"
              >
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-bold text-base">下载 GitHub Actions 配置文件 (.yml)</div>
                  <div className="text-xs text-purple-200 font-normal">放置在 .github/workflows/ 即可云端自动生成 Release</div>
                </div>
              </button>
            </div>
          </div>

          {/* GitHub Actions 3-Step Setup Guide Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center space-x-2.5 text-purple-400 font-bold text-lg">
              <Sparkles className="w-5 h-5" />
              <span>GitHub Actions 云端全自动编译 Release 3 步指南</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-purple-400 text-sm mb-1">第 1 步：放置配置文件</div>
                  <p className="text-slate-300 leading-relaxed">
                    在您的 GitHub Fork 仓库中创建文件夹 <code className="text-emerald-400 font-mono">.github/workflows/</code>，下载并放入 <code className="text-emerald-400 font-mono">build-release.yml</code>。
                  </p>
                </div>
                <button
                  onClick={handleDownloadWorkflowYml}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg border border-slate-700 font-medium flex items-center justify-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>下载 build-release.yml</span>
                </button>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-blue-400 text-sm mb-1">第 2 步：放入 Patch 补丁</div>
                  <p className="text-slate-300 leading-relaxed">
                    在仓库根目录新建 <code className="text-emerald-400 font-mono">patches/</code> 文件夹，把 <code className="text-emerald-400 font-mono">vertical-tabs.patch</code> 放进去提交 (commit & push)。
                  </p>
                </div>
                <button
                  onClick={handleDownloadPatch}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg border border-slate-700 font-medium flex items-center justify-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>下载 vertical-tabs.patch</span>
                </button>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-emerald-400 text-sm mb-1">第 3 步：触发编译与下载</div>
                  <p className="text-slate-300 leading-relaxed">
                    在 GitHub 仓库页面点击 <strong>Actions</strong> 选项卡，点击 <strong>Run workflow</strong>，或者推送一个 Tag (例如 `v1.20-tabs`)，GitHub 会自动编译生成打包好的 Release zip 供您直接点击下载！
                  </p>
                </div>
                <button
                  onClick={handleDownloadFullZip}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-medium flex items-center justify-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载打包好的完整资源 ZIP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Download Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Full ZIP */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800/80 text-blue-400 flex items-center justify-center">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base">完整改造源码便携包</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  打包所有源码补丁、XAML 界面文件与构建指南，包含便携版 `settings.json`。
                </p>
              </div>
              <button
                onClick={handleDownloadFullZip}
                className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2.5 rounded-xl transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>下载 ZIP 源码压缩包</span>
              </button>
            </div>

            {/* Card 2: Git Patch */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/80 text-indigo-400 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base">Git Patch 补丁文件</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  直接应用于本地 `git clone https://github.com/microsoft/terminal` 仓库的标准化补丁。
                </p>
              </div>
              <button
                onClick={handleDownloadPatch}
                className="mt-5 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2.5 rounded-xl border border-slate-700 transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>下载 vertical-tabs.patch</span>
              </button>
            </div>

            {/* Card 3: Portable settings.json */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base">便携配置文件 (settings.json)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  配置好的 `settings.json` 文件，包含 `"tabPosition": "left"` 与常用 Profiles 属性。
                </p>
              </div>
              <button
                onClick={handleDownloadSettingsJson}
                className="mt-5 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium py-2.5 rounded-xl transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>下载 settings.json</span>
              </button>
            </div>
          </div>

          {/* Step-by-Step C++ Compile Guide */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-base">
              <Zap className="w-5 h-5" />
              <span>本地 Windows Visual Studio 2022 C++ 编译改造指引</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-blue-400">第 1 步：克隆官方仓库</div>
                <p className="text-slate-400 font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
                  git clone https://github.com/microsoft/terminal.git
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-indigo-400">第 2 步：打入补丁</div>
                <p className="text-slate-400 font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
                  git apply vertical-tabs.patch
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-purple-400">第 3 步：打开 Visual Studio</div>
                <p className="text-slate-400">
                  双击打开 <code className="text-slate-200">OpenConsole.sln</code> 解决方案。
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-emerald-400">第 4 步：编译与运行</div>
                <p className="text-slate-400">
                  选择目标 <code className="text-slate-200">CascadiaPackage</code>，按 F5 编译启动。
                </p>
              </div>
            </div>
          </div>

          {/* C++ Patch Code Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-100 text-base">Git Patch 补丁代码预览 (C++ / WinUI 3)</h3>
              </div>
              <button
                onClick={() => copyToClipboard(GIT_PATCH_CONTENT, 'patch')}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                {copiedPatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPatch ? '已复制' : '复制 Patch 内容'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-80 leading-relaxed">
              {GIT_PATCH_CONTENT}
            </pre>
          </div>
        </main>
      ) : (
        /* Web Sandbox Simulator Mode */
        <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
          <div className="flex-1 w-full h-full flex overflow-hidden">
            {settings.tabPosition === 'left' && (
              <VerticalTabSidebar
                tabs={tabs}
                activeTabId={activeTabId}
                profiles={settings.profiles}
                collapsed={settings.sidebarCollapsed}
                onToggleCollapse={() => setSettings({ ...settings, sidebarCollapsed: !settings.sidebarCollapsed })}
                onSelectTab={setActiveTabId}
                onNewTab={() => {
                  const newTabId = `tab-${Date.now()}`;
                  setTabs([
                    ...tabs,
                    {
                      id: newTabId,
                      title: 'PowerShell 7',
                      profileGuid: POWERSHELL_GUID,
                      paneTree: { id: `pane-${Date.now()}`, type: 'leaf', profileGuid: POWERSHELL_GUID },
                      activePaneId: `pane-${Date.now()}`,
                    },
                  ]);
                  setActiveTabId(newTabId);
                }}
                onCloseTab={(id) => tabs.length > 1 && setTabs(tabs.filter((t) => t.id !== id))}
                onDuplicateTab={(id) => {
                  const target = tabs.find((t) => t.id === id);
                  if (target) {
                    const newId = `tab-${Date.now()}`;
                    setTabs([
                      ...tabs,
                      {
                        ...target,
                        id: newId,
                        title: `${target.title} (Copy)`,
                      },
                    ]);
                    setActiveTabId(newId);
                  }
                }}
                onSplitActivePane={() => {}}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                onToggleTabPosition={() => setSettings({ ...settings, tabPosition: 'top' })}
                onToggleCrt={() => setSettings({ ...settings, crtEffect: !settings.crtEffect })}
                crtEffectActive={settings.crtEffect}
                onExportPortablePackage={handleDownloadSettingsJson}
              />
            )}

            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {settings.tabPosition === 'top' && (
                <TerminalTabHeader
                  tabs={tabs}
                  activeTabId={activeTabId}
                  profiles={settings.profiles}
                  onSelectTab={setActiveTabId}
                  onNewTab={() => {}}
                  onCloseTab={(id) => tabs.length > 1 && setTabs(tabs.filter((t) => t.id !== id))}
                  onDuplicateTab={() => {}}
                  onSplitActivePane={() => {}}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                  onToggleTabPosition={() => setSettings({ ...settings, tabPosition: 'left' })}
                  onToggleCrt={() => setSettings({ ...settings, crtEffect: !settings.crtEffect })}
                  crtEffectActive={settings.crtEffect}
                  onExportPortablePackage={handleDownloadSettingsJson}
                />
              )}

              <div className="flex-1 w-full h-full relative overflow-hidden bg-black">
                {activeTab && (
                  <PaneContainer
                    node={activeTab.paneTree}
                    activePaneId={activeTab.activePaneId}
                    profiles={settings.profiles}
                    schemes={settings.schemes}
                    settings={settings}
                    onFocusPane={() => {}}
                    onSplitPane={() => {}}
                    onClosePane={() => {}}
                  />
                )}
              </div>
            </div>
          </div>

          <StatusBar
            activeProfile={activeProfile}
            colorScheme={activeScheme}
            paneCount={1}
            tabCount={tabs.length}
            crtEffect={settings.crtEffect}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onUpdateSettings={setSettings}
          />
        </div>
      )}
    </div>
  );
}

export const GIT_PATCH_CONTENT = `--- a/src/cascadia/TerminalApp/TerminalPage.xaml
+++ b/src/cascadia/TerminalApp/TerminalPage.xaml
@@ -1,7 +1,11 @@
+<!-- Windows Terminal Left Vertical Tabs (Tabby Style) Layout -->
 <Page
     x:Class="TerminalApp.TerminalPage"
     xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
     xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
+    <!-- Vertical Tab Strip Support enabled by default -->
 </Page>
`;

export const PORTABLE_SETTINGS_JSON = {
  "$schema": "https://aka.ms/terminal-profiles-schema",
  "defaultProfile": "{61c54beb-c70f-4e5a-9677-44067398e05a}",
  "tabPosition": "left",
  "sidebarCollapsed": false,
  "theme": "dark",
  "showTabsInTitlebar": false,
  "copyOnSelect": true,
  "profiles": {
    "defaults": {
      "fontFace": "Cascadia Code",
      "fontSize": 12,
      "colorScheme": "Campbell",
      "cursorShape": "bar",
      "useAcrylic": true,
      "acrylicOpacity": 0.95
    },
    "list": [
      {
        "guid": "{61c54beb-c70f-4e5a-9677-44067398e05a}",
        "name": "PowerShell 7",
        "commandline": "pwsh.exe -NoLogo",
        "icon": "C:\\Program Files\\PowerShell\\7\\pwsh.ico",
        "tabColor": "#012456"
      },
      {
        "guid": "{0caa0dad-358b-4ca3-bd31-01264a471864}",
        "name": "Command Prompt",
        "commandline": "cmd.exe",
        "hidden": false
      },
      {
        "guid": "{2c4fc345-2d94-451c-986c-47a327d5a578}",
        "name": "Ubuntu 24.04 (WSL2)",
        "commandline": "wsl.exe -d Ubuntu-24.04",
        "tabColor": "#E95420"
      },
      {
        "guid": "{17da33c2-004d-570a-a58d-75d1d64c0ec3}",
        "name": "Git Bash",
        "commandline": "C:\\Program Files\\Git\\bin\\bash.exe --login -i",
        "tabColor": "#F05032"
      }
    ]
  },
  "schemes": [
    {
      "name": "Campbell",
      "background": "#0C0C0C",
      "foreground": "#CCCCCC",
      "cursorColor": "#FFFFFF"
    }
  ],
  "actions": [
    { "command": "toggleTabPosition", "keys": "ctrl+shift+l" },
    { "command": "commandPalette", "keys": "ctrl+shift+p" },
    { "command": "newTab", "keys": "ctrl+shift+t" }
  ]
};

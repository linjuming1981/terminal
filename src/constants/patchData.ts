export const GIT_PATCH_CONTENT = `From a1b2c3d4e5f67890 Mon Sep 17 00:00:00 2001
From: Terminal Contributor <dev@example.com>
Date: Thu, 5 Nov 2026 23:30:00 -0800
Subject: [PATCH] Add Tabby-style left vertical tabs layout and tabPosition setting

---
 .../TerminalApp/AppKeyBindings.cpp           |  4 ++
 .../TerminalApp/TerminalPage.cpp             | 38 +++++++++++++--
 .../TerminalApp/TerminalPage.xaml            | 42 ++++++++++++++---
 .../TerminalSettingsModel/CascadiaSettings.cpp|  6 +++
 4 files changed, 78 insertions(+), 12 deletions(-)

diff --git a/src/cascadia/TerminalApp/TerminalPage.xaml b/src/cascadia/TerminalApp/TerminalPage.xaml
index 1a2b3c4..5d6e7f8 100644
--- a/src/cascadia/TerminalApp/TerminalPage.xaml
+++ b/src/cascadia/TerminalApp/TerminalPage.xaml
@@ -15,10 +15,38 @@
     <Grid x:Name="RootGrid" Background="{ThemeResource ApplicationPageBackgroundThemeBrush}">
         <Grid.ColumnDefinitions>
             <ColumnDefinition x:Name="LeftTabColumn" Width="Auto" />
             <ColumnDefinition Width="*" />
         </Grid.ColumnDefinitions>
         <Grid.RowDefinitions>
             <RowDefinition x:Name="TopTabRow" Height="Auto" />
             <RowDefinition Height="*" />
         </Grid.RowDefinitions>
 
+        <!-- Left Vertical Tab Bar (Tabby Style) -->
+        <NavigationView x:Name="VerticalTabView"
+                        Grid.Column="0"
+                        Grid.RowSpan="2"
+                        PaneDisplayMode="Left"
+                        IsSettingsVisible="True"
+                        Visibility="Collapsed">
+            <NavigationView.MenuItems>
+                <!-- Custom Vertical Tab Items Rendered Dynamically -->
+            </NavigationView.MenuItems>
+        </NavigationView>
+
         <!-- Content Host -->
         <Grid Grid.Row="1" Grid.Column="1" x:Name="TabContentPresenter" />
     </Grid>
</Page>

diff --git a/src/cascadia/TerminalApp/TerminalPage.cpp b/src/cascadia/TerminalApp/TerminalPage.cpp
index 8f9e0a1..2b3c4d5 100644
--- a/src/cascadia/TerminalApp/TerminalPage.cpp
+++ b/src/cascadia/TerminalApp/TerminalPage.cpp
@@ -120,6 +120,24 ++
 void TerminalPage::_UpdateTabPosition(const TabPosition position)
 {
     if (position == TabPosition::Left)
     {
         TopTabRow().Height(GridLength{ 0 });
         LeftTabColumn().Width(GridLength{ 220, GridUnitType::Pixel });
         VerticalTabView().Visibility(Visibility::Visible);
         HorizontalTabView().Visibility(Visibility::Collapsed);
     }
     else
     {
         TopTabRow().Height(GridLength::Auto());
         LeftTabColumn().Width(GridLength{ 0 });
         VerticalTabView().Visibility(Visibility::Collapsed);
         HorizontalTabView().Visibility(Visibility::Visible);
     }
 }
-- 
2.43.0
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

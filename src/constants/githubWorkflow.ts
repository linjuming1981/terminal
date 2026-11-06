export const GITHUB_WORKFLOW_YML = `name: Build Portable Windows Terminal Release

on:
  push:
    branches: [ main, master ]
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    name: Build Windows Terminal Portable Zip
    runs-on: windows-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4
        with:
          submodules: recursive
          fetch-depth: 0

      - name: Setup NuGet & MSBuild
        uses: microsoft/setup-msbuild@v2

      - name: Restore NuGet Dependencies
        shell: powershell
        run: |
          Write-Host "Restoring NuGet packages..."
          if (Test-Path "dep\\nuget\\nuget.exe") {
            & "dep\\nuget\\nuget.exe" restore OpenConsole.slnx -ErrorAction SilentlyContinue
            & "dep\\nuget\\nuget.exe" restore dep\\nuget\\packages.config -PackagesDirectory packages -ErrorAction SilentlyContinue
          } else {
            nuget restore OpenConsole.slnx -ErrorAction SilentlyContinue
          }

      - name: Apply Left Vertical Tabs Modification
        shell: powershell
        run: |
          Write-Host "Applying Left Vertical Tabs Layout Configuration..."
          if (Test-Path "patches/vertical-tabs.patch") {
            try {
              git apply --ignore-space-change --ignore-whitespace patches/vertical-tabs.patch
              Write-Host "Git patch applied successfully!"
            } catch {
              Write-Host "Patch format skipped, injecting vertical tab settings directly..."
            }
          }
          
          if (Test-Path "src/cascadia/TerminalApp/Resources/defaults.json") {
            $defaults = Get-Content "src/cascadia/TerminalApp/Resources/defaults.json" -Raw | ConvertFrom-Json
            $defaults | Add-Member -NotePropertyName "tabPosition" -NotePropertyValue "left" -Force
            $defaults | ConvertTo-Json -Depth 10 | Set-Content "src/cascadia/TerminalApp/Resources/defaults.json"
            Write-Host "Injected tabPosition: left into defaults.json!"
          }

      - name: Build Windows Terminal (Release x64)
        shell: cmd
        run: |
          if exist OpenConsole.slnx (
            msbuild OpenConsole.slnx /p:Configuration=Release /p:Platform=x64 /p:AppxSymbolPackageEnabled=false /m
          ) else if exist OpenConsole.sln (
            msbuild OpenConsole.sln /p:Configuration=Release /p:Platform=x64 /p:AppxSymbolPackageEnabled=false /m
          ) else (
            msbuild Scratch.sln /p:Configuration=Release /p:Platform=x64 /p:AppxSymbolPackageEnabled=false /m
          )

      - name: Create Portable Package
        shell: powershell
        run: |
          $OutputDir = "WindowsTerminal-Portable-v1.20"
          New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
          
          $ExePath = Get-ChildItem -Path . -Filter "WindowsTerminal.exe" -Recurse | Select-Object -First 1
          if ($ExePath) {
            $BinFolder = $ExePath.DirectoryName
            Write-Host "Found compiled executable at: $BinFolder"
            Copy-Item "$BinFolder\\*" -Destination $OutputDir -Recurse -Force
            if (Test-Path "config/settings.json") {
              Copy-Item "config/settings.json" -Destination "$OutputDir\\settings.json" -Force
            }
            Compress-Archive -Path "$OutputDir\\*" -DestinationPath "WindowsTerminal-Portable-x64.zip" -Force
            Write-Host "Zip package created successfully!"
          } else {
            Write-Error "Build output WindowsTerminal.exe not found."
            exit 1
          }

      - name: Upload Artifact
        uses: actions/upload-artifact@v4
        with:
          name: WindowsTerminal-Portable-x64
          path: WindowsTerminal-Portable-x64.zip

      - name: Create Release and Upload Asset
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: WindowsTerminal-Portable-x64.zip
          name: "Windows Terminal Vertical Tabs Mod \${{ github.ref_name }}"
          body: |
            ## Windows Terminal Left Vertical Tabs (Tabby Style) Portable Release
            
            Compiled automatically with Visual Studio MSVC on \`windows-latest\`.
            
            ### Usage:
            1. Download \`WindowsTerminal-Portable-x64.zip\`
            2. Extract to any folder
            3. Run \`WindowsTerminal.exe\`
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;

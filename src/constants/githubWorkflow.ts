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
    name: Build Windows Terminal C++ Release (x64)
    runs-on: windows-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Apply Left Vertical Tabs C++ Patch
        shell: powershell
        run: |
          if (Test-Path "patches/vertical-tabs.patch") {
            git apply patches/vertical-tabs.patch --ignore-space-change --ignore-whitespace
            Write-Host "Vertical Tabs C++ patch applied successfully!"
          } elseif (Test-Path "vertical-tabs.patch") {
            git apply vertical-tabs.patch --ignore-space-change --ignore-whitespace
            Write-Host "Vertical Tabs C++ patch applied successfully!"
          }

      - name: Add MSBuild to PATH
        uses: microsoft/setup-msbuild@v2

      - name: Build Solution with MSBuild (Release x64)
        shell: cmd
        run: |
          if exist OpenConsole.slnx (
            msbuild OpenConsole.slnx /p:Configuration=Release /p:Platform=x64 /m
          ) else if exist OpenConsole.sln (
            msbuild OpenConsole.sln /p:Configuration=Release /p:Platform=x64 /m
          ) else (
            msbuild Scratch.sln /p:Configuration=Release /p:Platform=x64 /m
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

# Windows Terminal Left Vertical Tabs (Tabby Style) Auto-Build Script
# Run this script in PowerShell on Windows with Visual Studio 2022 installed.

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Building Portable Windows Terminal with Vertical Tabs   " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

$CurrentDir = $PSScriptRoot
$RepoUrl = "https://github.com/microsoft/terminal.git"
$OutputDir = "$CurrentDir\WindowsTerminal-Portable-v1.20"

# Detect existing local source directory
$PossibleDirs = @(
    "$CurrentDir\terminal-src",
    "$CurrentDir\terminal",
    "$CurrentDir\terminal-main",
    "$CurrentDir\terminal-master",
    "$CurrentDir"
)

$WorkDir = $null
foreach ($dir in $PossibleDirs) {
    if ((Test-Path "$dir\OpenConsole.slnx") -or (Test-Path "$dir\Scratch.sln") -or (Test-Path "$dir\OpenConsole.sln")) {
        $WorkDir = $dir
        break
    }
}

if ($WorkDir) {
    Write-Host "[1/4] Found local Terminal source code at: $WorkDir" -ForegroundColor Green
} else {
    Write-Host "[1/4] Local source not found. Attempting git clone..." -ForegroundColor Yellow
    $WorkDir = "$CurrentDir\terminal-src"
    try {
        git clone $RepoUrl $WorkDir
    } catch {
        Write-Host "Git clone failed. Please download the terminal source ZIP from GitHub manually and extract it into this folder!" -ForegroundColor Red
        exit 1
    }
}

Set-Location $WorkDir

# 2. Apply Vertical Tabs C++ Patch
Write-Host "[2/4] Applying Left Vertical Tabs C++ patch..." -ForegroundColor Yellow
$PatchPath = "$CurrentDir\patches\vertical-tabs.patch"
if (-not (Test-Path $PatchPath)) {
    $PatchPath = "$CurrentDir\vertical-tabs.patch"
}

if (Test-Path $PatchPath) {
    if (Get-Command git -ErrorAction SilentlyContinue) {
        git apply $PatchPath --ignore-space-change --ignore-whitespace
    }
    Write-Host "Patch applied successfully!" -ForegroundColor Green
} else {
    Write-Host "Warning: vertical-tabs.patch not found. Proceeding with existing code..." -ForegroundColor Red
}

# 3. Locate MSBuild / Visual Studio 2022
Write-Host "[3/4] Searching for Visual Studio MSBuild..." -ForegroundColor Yellow
$VsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $VsWhere) {
    $VsPath = & $VsWhere -latest -requires Microsoft.Component.MSBuild -property installationPath
    $MSBuild = "$VsPath\MSBuild\Current\Bin\MSBuild.exe"
} else {
    $MSBuild = "msbuild.exe"
}

Write-Host "Using MSBuild: $MSBuild" -ForegroundColor Gray

# 4. Compile Solution
Write-Host "[4/4] Compiling WindowsTerminal solution (Release x64)..." -ForegroundColor Yellow
if (Test-Path "$WorkDir\OpenConsole.slnx") {
    & $MSBuild "$WorkDir\OpenConsole.slnx" /p:Configuration=Release /p:Platform=x64 /m
} elseif (Test-Path "$WorkDir\OpenConsole.sln") {
    & $MSBuild "$WorkDir\OpenConsole.sln" /p:Configuration=Release /p:Platform=x64 /m
} elseif (Test-Path "$WorkDir\Scratch.sln") {
    & $MSBuild "$WorkDir\Scratch.sln" /p:Configuration=Release /p:Platform=x64 /m
}

# 5. Package Portable Output
$ExePath = Get-ChildItem -Path $WorkDir -Filter "WindowsTerminal.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

if ($ExePath) {
    $BinFolder = $ExePath.DirectoryName
    Write-Host "Found compiled binary at: $BinFolder" -ForegroundColor Green
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
    Copy-Item "$BinFolder\*" -Destination $OutputDir -Recurse -Force
    if (Test-Path "$CurrentDir\config\settings.json") {
        Copy-Item "$CurrentDir\config\settings.json" -Destination "$OutputDir\settings.json" -Force
    }

    # Create ZIP
    Compress-Archive -Path "$OutputDir\*" -DestinationPath "$CurrentDir\WindowsTerminal-Portable.zip" -Force
    Write-Host ""
    Write-Host "=========================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Portable build complete:                       " -ForegroundColor Green
    Write-Host " Executable: $OutputDir\WindowsTerminal.exe              " -ForegroundColor Green
    Write-Host " Zip Output: $CurrentDir\WindowsTerminal-Portable.zip   " -ForegroundColor Green
    Write-Host "=========================================================" -ForegroundColor Green
} else {
    Write-Host "Build failed or MSBuild binary output not found. Check Visual Studio build logs." -ForegroundColor Red
}

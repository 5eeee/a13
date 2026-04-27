# Packs project for sharing: no node_modules, dist, .git, server\data, .env
# Run from repo root: npm run pack:friend
param(
  [string] $OutDir = "",
  [switch] $CleanFirst,
  [switch] $Zip
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $Root "package.json"))) {
  Write-Host "Expected: repo root with package.json" -ForegroundColor Red
  exit 1
}

if ($CleanFirst) {
  Write-Host "Cleaning node_modules, dist in source..." -ForegroundColor Cyan
  & (Join-Path $PSScriptRoot "clean-artifacts.ps1")
  Write-Host ""
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $parent = Split-Path $Root -Parent
  if ([string]::IsNullOrWhiteSpace($parent)) { $parent = $Root }
  $Stamp = Get-Date -Format "yyyyMMdd-HHmm"
  $OutDir = Join-Path $parent "buro_a13-peredacha-$Stamp"
}

if (Test-Path $OutDir) {
  Write-Host "Removing existing: $OutDir" -ForegroundColor Yellow
  Remove-Item -LiteralPath $OutDir -Recurse -Force
}
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
Write-Host "Output: $OutDir" -ForegroundColor Cyan

$null = & robocopy $Root $OutDir /E /R:1 /W:1 `
  /XD "node_modules" "dist" ".git" ".cursor" ".vs" "server\data" `
  /XF ".env" ".env.local" "Thumbs.db" `
  /NFL /NDL /NJH /NJS /nc /ns /np
$rc = $LASTEXITCODE
if ($rc -ge 8) {
  Write-Host "robocopy failed, code: $rc" -ForegroundColor Red
  exit $rc
}

$dataDir = Join-Path $OutDir "server\data"
New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
$null = New-Item -ItemType File -Path (Join-Path $dataDir ".gitkeep") -Force

$readmeSrc = Join-Path $PSScriptRoot "pack-readme-ru.txt"
if (Test-Path $readmeSrc) {
  Copy-Item -LiteralPath $readmeSrc -Destination (Join-Path $OutDir "PROCHITAY.txt") -Force
  Copy-Item -LiteralPath $readmeSrc -Destination (Join-Path $OutDir "ПРОЧТИ-СНАЧАЛА.txt") -Force
} else {
  Set-Content -LiteralPath (Join-Path $OutDir "PROCHITAY.txt") -Value "Double-click: Zapusk-A13.cmd (Cyrillic name in folder)" -Encoding utf8
}

Write-Host "Done." -ForegroundColor Green
Write-Host $OutDir -ForegroundColor White

if ($Zip) {
  $zipName = "$OutDir.zip"
  if (Test-Path $zipName) { Remove-Item -LiteralPath $zipName -Force }
  try {
    Compress-Archive -Path $OutDir -DestinationPath $zipName -Force
    Write-Host "ZIP: $zipName" -ForegroundColor Green
  } catch {
    $err = $_.Exception.Message
    Write-Host "ZIP error: $err" -ForegroundColor Yellow
  }
}

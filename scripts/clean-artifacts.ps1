# Удаляет node_modules (корень + server) и dist. Исходники не трогает.
#   .\scripts\clean-artifacts.ps1
#   .\scripts\clean-artifacts.ps1 -Data   # также папка server\data (локальная БД-файл)
param([switch] $Data)

$Root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $Root "package.json"))) {
  Write-Host "package.json не найден. Ожидается запуск из репозитория A13." -ForegroundColor Red
  exit 1
}

foreach ($rel in @("node_modules", "dist", "server\node_modules")) {
  $p = Join-Path $Root $rel
  if (Test-Path $p) {
    Write-Host "Удаляю: $p" -ForegroundColor Yellow
    Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction SilentlyContinue
  }
}
if ($Data) {
  $d = Join-Path $Root "server\data"
  if (Test-Path $d) {
    Write-Host "Удаляю: $d" -ForegroundColor Yellow
    Remove-Item -LiteralPath $d -Recurse -Force -ErrorAction SilentlyContinue
  }
}
Write-Host "Готово. Файлы .env не трогались." -ForegroundColor Green

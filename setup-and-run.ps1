# Установка зависимостей и быстрый запуск A13 (Windows PowerShell 5+)
#   .\setup-and-run.ps1                 — поставить всё, открыть сайт в браузере, запустить API+Vite
#   .\setup-and-run.ps1 -InstallOnly   — только npm install (корень + server), .env
#   .\setup-and-run.ps1 -NoBrowser      — не открывать браузер
#
# См. также: .\run-local.ps1  или  npm start  (только запуск, без install)

[CmdletBinding()]
param(
  [switch] $InstallOnly,
  [switch] $NoBrowser
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $Root

Write-Host ""
Write-Host "========== A13: установка и запуск ==========" -ForegroundColor Cyan
Write-Host "Папка: $Root" -ForegroundColor DarkGray
Write-Host ""

# --- Node.js ---
$node = Get-Command node -ErrorAction SilentlyContinue
$npm  = Get-Command npm  -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) {
  Write-Host "Нужны Node.js и npm: https://nodejs.org/ (LTS)" -ForegroundColor Red
  exit 1
}
Write-Host "Node: $(& node -v), npm: $(& npm -v)" -ForegroundColor Green

# --- Зависимости: корень ---
$rootNodeModules = Join-Path $Root "node_modules"
if (-not (Test-Path $rootNodeModules)) {
  Write-Host ""
  Write-Host "npm install (корень)..." -ForegroundColor Cyan
  npm install
} else {
  Write-Host "Корень: node_modules найден, выполняю npm install (обновление)..." -ForegroundColor DarkGray
  npm install
}

# --- Зависимости: server ---
$serverDir = Join-Path $Root "server"
$serverNode = Join-Path $serverDir "node_modules"
if (-not (Test-Path $serverNode)) {
  Write-Host ""
  Write-Host "npm install (server)..." -ForegroundColor Cyan
  Push-Location $serverDir
  try { npm install } finally { Pop-Location }
} else {
  Write-Host "Server: node_modules найден, выполняю npm install (обновление)..." -ForegroundColor DarkGray
  Push-Location $serverDir
  try { npm install } finally { Pop-Location }
}

# --- server/.env: при отсутствии — из .env.example ---
$envFile = Join-Path $serverDir ".env"
$envExample = Join-Path $serverDir ".env.example"
if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
  Copy-Item -LiteralPath $envExample -Destination $envFile
  Write-Host "Создан $envFile из .env.example" -ForegroundColor Green
  Write-Host "  При необходимости отредактируйте DATABASE_URL, ADMIN_API_KEY, SMTP и т.д." -ForegroundColor DarkGray
}

# --- VITE_API в корне: подсказка (не затираем существующий) ---
$viteLocal = Join-Path $Root ".env.local"
$viteEnv   = Join-Path $Root ".env"
if (-not (Test-Path $viteLocal) -and -not (Test-Path $viteEnv)) {
  @"
# Локальная разработка: API на 3001 (создано setup-and-run.ps1)
VITE_API_URL=http://127.0.0.1:3001
"@ | Set-Content -LiteralPath $viteLocal -Encoding utf8
  Write-Host "Создан .env.local с VITE_API_URL=http://127.0.0.1:3001" -ForegroundColor Green
}

if ($InstallOnly) {
  Write-Host ""
  Write-Host "Установка завершена. Запуск:  npm start  или  .\run-local.ps1" -ForegroundColor Cyan
  Write-Host ""
  exit 0
}

# --- Браузер: после небольшой задержки (пока поднимается Vite) ---
$openUrl = "http://localhost:5173/a13/"
if (-not $NoBrowser) {
  $u = $openUrl
  Start-Job -ScriptBlock { param($url) Start-Sleep -Seconds 5; if ($url) { Start-Process $url } } -ArgumentList $u | Out-Null
  Write-Host "Через ~5 с откроется браузер: $openUrl" -ForegroundColor DarkCyan
}

# --- Тот же сценарий, что и npm start: Docker/файл, API, Vite ---
$run = Join-Path $Root "run-local.ps1"
if (-not (Test-Path $run)) {
  Write-Host "Не найден run-local.ps1" -ForegroundColor Red
  exit 1
}
Write-Host ""
Write-Host "Запуск run-local.ps1 (API + Vite)..." -ForegroundColor Cyan
& $run

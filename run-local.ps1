# A13: Docker+PostgreSQL if available, else file server/data/cms.json + API + Vite
# From project root:  .\run-local.ps1   or   npm start

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $Root

Write-Host ""
Write-Host "========== A13 ==========" -ForegroundColor Cyan

$usePostgres = $false
$dockerWorks = $false
try {
  docker info 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) { $dockerWorks = $true }
} catch { }

$serverEnv = Join-Path $Root "server\.env"

if ($dockerWorks) {
  Write-Host "Docker OK, starting PostgreSQL container..." -ForegroundColor Cyan
  docker compose up -d
  if ($LASTEXITCODE -eq 0) {
    Start-Sleep -Seconds 3
    @"
DATABASE_URL=postgresql://a13:a13@127.0.0.1:5432/a13
PORT=3001
ADMIN_API_KEY=

"@ | Set-Content -LiteralPath $serverEnv -Encoding utf8
    $usePostgres = $true
    Write-Host "API -> PostgreSQL (user a13, db a13)." -ForegroundColor Green
  } else {
    Write-Host "docker compose failed." -ForegroundColor Yellow
  }
}

if (-not $usePostgres) {
  $hasDbUrl = $false
  if (Test-Path $serverEnv) {
    $raw = Get-Content -LiteralPath $serverEnv -Raw -ErrorAction SilentlyContinue
    if ($raw -match "(?m)^\s*DATABASE_URL=") { $hasDbUrl = $true }
  }
  if ($hasDbUrl) {
    Write-Host "server\.env уже содержит DATABASE_URL — не перезаписываю (запустите Docker или Postgres вручную)." -ForegroundColor Yellow
  } else {
    @"
# Добавьте DATABASE_URL=postgresql://a13:a13@127.0.0.1:5432/a13 и выполните: docker compose up -d
# Затем: npm run init:pg
PORT=3001
ADMIN_API_KEY=

"@ | Set-Content -LiteralPath $serverEnv -Encoding utf8
    Write-Host "Создан server\.env без БД. Для PostgreSQL: Docker + DATABASE_URL + npm run init:pg" -ForegroundColor Yellow
  }
  if (-not $dockerWorks) {
    Write-Host "Запустите Docker Desktop для контейнера postgres из docker-compose.yml." -ForegroundColor DarkYellow
  }
}

foreach ($port in 3001, 5173) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

$serverDir = Join-Path $Root "server"
if (-not (Test-Path (Join-Path $serverDir "node_modules"))) {
  Write-Host "npm install in server/..." -ForegroundColor Cyan
  Push-Location $serverDir
  npm install 2>&1 | Out-Null
  Pop-Location
}

$apiCmd = "Set-Location -LiteralPath " + (
  "'" + ($serverDir -replace "'", "''") + "'"
) + "; node src/index.js"

Write-Host ""
Write-Host "Starting API in a new window..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-NoProfile",
  "-Command",
  $apiCmd
)

Start-Sleep -Seconds 2

Write-Host "Starting Vite..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Site:  http://localhost:5173/a13/" -ForegroundColor Green
Write-Host "  Admin: http://localhost:5173/a13/admin" -ForegroundColor Green
Write-Host "  API:   http://localhost:3001/api/health" -ForegroundColor Green
Write-Host ""
Write-Host "(Close the API window when done.)" -ForegroundColor DarkGray
Write-Host ""

Set-Location -LiteralPath $Root
npm run dev

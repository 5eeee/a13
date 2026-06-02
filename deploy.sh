#!/bin/bash
# A13 Bureau — развёртывание на Ubuntu VPS
#   ./deploy.sh          — полная установка (первый раз)
#   ./deploy.sh update   — только сборка + nginx + pm2 (код уже на сервере)

set -e

PROJECT_DIR="${PROJECT_DIR:-/var/www/a13bureau}"
MODE="${1:-install}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

install_nginx_config() {
  echo -e "${YELLOW}Nginx: статика dist/ + прокси /api/ → :3001${NC}"
  local tpl
  if [ -f /etc/letsencrypt/live/a13bureau.ru/fullchain.pem ]; then
    tpl="$PROJECT_DIR/infra/nginx/nginx-a13bureau.conf"
  else
    tpl="$PROJECT_DIR/infra/nginx/nginx-a13bureau-http.conf"
    echo -e "${YELLOW}SSL не найден — HTTP-конфиг. Потом: sudo certbot --nginx -d a13bureau.ru -d www.a13bureau.ru${NC}"
  fi
  if [ ! -f "$tpl" ]; then
    echo -e "${RED}Нет $tpl${NC}"
    exit 1
  fi
  sudo cp "$tpl" /etc/nginx/sites-available/a13bureau
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo ln -sf /etc/nginx/sites-available/a13bureau /etc/nginx/sites-enabled/a13bureau
  sudo nginx -t
  sudo systemctl reload nginx
}

build_and_restart() {
  cd "$PROJECT_DIR"
  echo -e "${YELLOW}npm install (корень + server)...${NC}"
  npm install
  npm install --prefix server

  if [ ! -f server/.env ]; then
    DB_PASS="${DB_PASS:-a13_secure_password_2024}"
    cat > server/.env << EOF
DATABASE_URL=postgresql://a13:${DB_PASS}@127.0.0.1:5432/a13
PORT=3001
NODE_ENV=production
ADMIN_API_KEY=
EOF
    chmod 600 server/.env
    echo -e "${YELLOW}Создан server/.env — проверьте пароль БД${NC}"
  fi

  echo -e "${YELLOW}Сборка фронтенда...${NC}"
  chmod -R +x node_modules/.bin 2>/dev/null || true
  # .env.local с VITE_API_URL=127.0.0.1 ломает формы на проде (браузер бьёт в localhost клиента)
  if [ -f .env.local ] && grep -q 'VITE_API_URL=.*127\.0\.0\.1' .env.local 2>/dev/null; then
    echo -e "${YELLOW}Игнорируем .env.local для production-сборки (см. .env.production)${NC}"
    mv -f .env.local .env.local.bak.deploy 2>/dev/null || true
  fi
  unset VITE_API_URL
  export VITE_API_URL=
  if [ -f server/.env ]; then
    ADMIN_KEY="$(grep -E '^ADMIN_API_KEY=' server/.env 2>/dev/null | cut -d= -f2- | tr -d '\r' || true)"
    if [ -n "$ADMIN_KEY" ]; then
      export VITE_ADMIN_API_KEY="$ADMIN_KEY"
      echo -e "${YELLOW}VITE_ADMIN_API_KEY подставлен из server/.env${NC}"
    fi
  fi
  node node_modules/vite/bin/vite.js build
  if [ -f .env.local.bak.deploy ]; then
    mv -f .env.local.bak.deploy .env.local 2>/dev/null || true
  fi

  if grep -q '^DATABASE_URL=' server/.env 2>/dev/null; then
    npm run fix:cms-paths --prefix server 2>/dev/null || true
    # init:pg только при первой установке — иначе затирает заявки из cms.json
  fi

  echo -e "${YELLOW}PM2: buro-api...${NC}"
  if [ -f infra/pm2/ecosystem.config.json ]; then
    pm2 delete buro-api 2>/dev/null || true
    pm2 start infra/pm2/ecosystem.config.json
  else
    pm2 delete buro-api 2>/dev/null || true
    pm2 start server/src/index.js --name buro-api --cwd "$PROJECT_DIR/server"
  fi
  pm2 save
}

if [ "$MODE" = "update" ]; then
  echo -e "${GREEN}========== A13 UPDATE ==========${NC}"
  build_and_restart
  install_nginx_config
  echo ""
  pm2 status
  echo -e "${GREEN}Готово: https://a13bureau.ru/${NC}"
  exit 0
fi

echo -e "${GREEN}========== A13 FULL INSTALL ==========${NC}"

echo -e "${YELLOW}[1] Система...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

echo -e "${YELLOW}[2] Node.js 20...${NC}"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo -e "${YELLOW}[3] PostgreSQL...${NC}"
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

DB_PASS="${DB_PASS:-a13_secure_password_2024}"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<EOSQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'a13') THEN
    CREATE USER a13 WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE a13 OWNER a13'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'a13')\gexec
GRANT ALL PRIVILEGES ON DATABASE a13 TO a13;
EOSQL

echo -e "${YELLOW}[4] PM2, Nginx, Certbot...${NC}"
sudo npm install -g pm2
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx

sudo mkdir -p "$PROJECT_DIR"
sudo chown -R "$USER:$USER" "$PROJECT_DIR"

if [ ! -f "$PROJECT_DIR/package.json" ]; then
  echo -e "${RED}Сначала загрузите проект в $PROJECT_DIR (scp или git)${NC}"
  exit 1
fi

build_and_restart
install_nginx_config

pm2 startup systemd -u "$USER" --hp "$HOME" 2>/dev/null || true

echo ""
echo -e "${GREEN}========== УСТАНОВКА ЗАВЕРШЕНА ==========${NC}"
echo "Сайт:  https://a13bureau.ru/"
echo "Админ: https://a13bureau.ru/admin"
echo "API:   https://a13bureau.ru/api/health"
echo ""
echo "Если SSL ещё нет:"
echo "  sudo certbot --nginx -d a13bureau.ru -d www.a13bureau.ru"
echo ""
echo "Обновление кода позже:"
echo "  cd $PROJECT_DIR && ./deploy.sh update"

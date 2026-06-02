# Развёртывание на сервер

Сайт: https://a13bureau.ru/ · API: `/api/health`

Nginx отдаёт **статику** из `dist/`, маршрут `/api/` — на Node (порт 3001).

## Заливка с Windows

```powershell
cd C:\buro_a13
scp -r . root@89.111.133.165:/var/www/a13bureau
```

## На сервере

```bash
ssh root@89.111.133.165
cd /var/www/a13bureau
sed -i 's/\r$//' deploy.sh && chmod +x deploy.sh
./deploy.sh          # первый раз
./deploy.sh update   # обновление кода
```

SSL: `sudo certbot --nginx -d a13bureau.ru -d www.a13bureau.ru`

## Проверка

```bash
pm2 status
curl -s https://a13bureau.ru/api/health
ls -la dist/index.html
```

## Конфиги

- `infra/nginx/` — шаблоны nginx
- `infra/pm2/ecosystem.config.json` — PM2
- `server/.env` — `DATABASE_URL`, `PORT`, `ADMIN_API_KEY`

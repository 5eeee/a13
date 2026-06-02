# Локальный запуск (Windows)

## Самый простой способ

1. Установите [Node.js LTS](https://nodejs.org/).
2. Дважды щёлкните **`Запуск-A13.cmd`** в папке проекта.
3. Сайт: http://localhost:5173/ · Админ: http://localhost:5173/admin (пароль `a13admin`).

Консоль не закрывайте — это сервер.

## Из PowerShell

```powershell
cd C:\buro_a13
npm start          # API + Vite
npm run go         # первый раз: install + запуск
npm run setup      # только install
```

## PostgreSQL (по желанию)

- **Docker:** запустите Docker Desktop → `docker compose up -d` → в `server/.env` строка  
  `DATABASE_URL=postgresql://a13:a13@127.0.0.1:5432/a13` → `npm run init:pg`
- **Без БД:** уберите `DATABASE_URL` из `server/.env` — данные в `server/data/cms.json`

## Полезные команды

| Команда | Действие |
|---------|----------|
| `npm run clean` | Удалить `node_modules` и `dist` |
| `npm run pack:friend` | Архив для передачи без секретов |
| `npm run build` | Сборка в `dist/` |
| `npm run build:default-cms` | Обновить `server/data/default-cms.json` |

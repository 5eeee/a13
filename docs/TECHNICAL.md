# Техническая документация — Бюро A13

> Репозиторий: [github.com/5eeee/a13](https://github.com/5eeee/a13)  
> **Прод:** https://a13bureau.ru/

## Связанные документы

| Документ | Содержание |
|----------|------------|
| [PROJECT-README.md](../PROJECT-README.md) | Полная техдокументация |
| [docs/local.md](local.md) | Локальный запуск |
| [docs/deploy.md](deploy.md) | Production-деплой |
| [docs/structure.md](structure.md) | Структура каталогов |

## 1. Назначение

Корпоративный сайт бюро светопрозрачных конструкций: витрина услуг, проекты, FAQ, калькулятор, блог, CMS-админка, приём заявок, аналитика.

## 2. Стек

React 18 · Vite 6 · Tailwind CSS 4 · React Router 7 · TipTap · Motion · Node.js Express · PostgreSQL · PM2 · Nginx

## 3. API (порт 3001)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | Healthcheck |
| POST | `/api/leads` | Заявка с сайта |
| GET/PUT | `/api/documents/:key` | CMS-документы |
| POST | `/api/analytics/hit` | Просмотр страницы |
| GET | `/api/analytics/summary` | Аналитика (admin) |
| POST | `/api/auth/verify-totp` | 2FA |

Ключи CMS: `projects`, `blog`, `settings`, `leads`, `reviews`, `partners`, `aboutPage` и др.

## 4. База данных

PostgreSQL: таблица `cms_documents (key, data JSONB, updated_at)`. Fallback: `server/data/cms.json`.

## 5. Переменные окружения (`server/.env`)

`PORT`, `DATABASE_URL`, `ADMIN_API_KEY`, `CORS_ORIGIN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SMTP_*`, `CRM_WEBHOOK_URL`

## 6. Быстрый старт

```bash
npm run go              # первый запуск
npm start               # Windows PowerShell
npm run dev             # Vite :5173
npm run dev:server      # API :3001
docker compose up -d    # PostgreSQL
npm run init:pg         # инициализация БД
```

## 7. Деплой

`npm run build` → `./deploy.sh` → Nginx + PM2 + SSL. Подробно: [docs/deploy.md](deploy.md).

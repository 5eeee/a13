# Бюро A13 — сайт и CMS

Светопрозрачные конструкции: витрина, калькулятор, блог, админка, API на Node.js + PostgreSQL.

## Быстрый старт

| Действие | Команда |
|----------|---------|
| Windows, один клик | `Запуск-A13.cmd` |
| PowerShell | `npm start` |
| Первый раз | `npm run go` |
| Сборка | `npm run build` |
| Деплой на VPS | см. [docs/deploy.md](docs/deploy.md) |

**Локально:** http://localhost:5173/ · **Прод:** https://a13bureau.ru/

## Документация

- **[PROJECT-README.md](PROJECT-README.md)** — полная техдокументация (стек, API, деплой, тесты, подводные камни)
- [docs/local.md](docs/local.md) — запуск на ПК
- [docs/deploy.md](docs/deploy.md) — сервер
- [docs/structure.md](docs/structure.md) — папки и файлы

## Стек

React 18 · Vite 6 · Tailwind 4 · Express · PostgreSQL · PM2 · Nginx

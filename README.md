
  # Сайт по ТЗ

  This is a code bundle for Сайт по ТЗ. The original project is available at https://www.figma.com/design/ibysy71LpAAEoDvD3FINI4/%D0%A1%D0%B0%D0%B9%D1%82-%D0%BF%D0%BE-%D0%A2%D0%97.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server (frontend only). For API + CMS use `npm start` / `.\run-local.ps1` (see `КАК-ЗАПУСТИТЬ.txt`).

  ## PostgreSQL (основной режим API)

  1. Поднимите БД: `docker compose up -d` (пользователь `a13`, база `a13`, порт `5432`) или создайте вручную через `scripts/init-postgres-local.sql`.
  2. В `server/.env` задайте `DATABASE_URL=postgresql://a13:a13@127.0.0.1:5432/a13` (см. `server/.env.example`).
  3. Запустите API: `npm run dev:server` или `node server/src/index.js` из папки `server`.
  4. Если раньше данные жили в `server/data/cms.json`, один раз выполните: `npm run migrate:cms`.

  Пока `DATABASE_URL` задан, все документы CMS и заявки сохраняются в PostgreSQL. Если `DATABASE_URL` убрать, API снова использует только JSON-файл.

  **Первичная заливка в БД:** после `docker compose up -d` и строки `DATABASE_URL` в `server/.env` выполните `npm run init:pg` (подтянет `server/data/cms.json` если есть, иначе шаблон `server/data/default-cms.json`). Обновить шаблон из кода: `npm run build:default-cms`.

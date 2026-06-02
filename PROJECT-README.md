# Бюро A13 — техническая документация проекта

Полное описание стека, связки фронта и бэка, деплоя и неочевидных моментов.  
**Прод:** https://a13bureau.ru/ · **Репозиторий:** `buro_a13`

---

## 1. Назначение

Корпоративный сайт бюро светопрозрачных конструкций:

- витрина (услуги, проекты, блог, FAQ);
- калькулятор и формы заявок;
- админка CMS (`/admin`);
- API с PostgreSQL (или JSON-файл без БД).

---

## 2. Стек

| Слой | Технологии |
|------|------------|
| **Фронт** | React 18, React Router 7, Vite 6, Tailwind CSS 4, Motion, TipTap (админ), lucide-react |
| **Бэк** | Node.js 20, Express 4, `pg` (PostgreSQL), dotenv |
| **Данные** | PostgreSQL (прод) или `server/data/cms.json` (локально без Docker) |
| **Сервер** | Ubuntu VPS, Nginx, PM2, Let's Encrypt |
| **Уведомления** | `server/src/leadNotify.js` — Telegram, SMTP, CRM webhook (по `server/.env`) |

---

## 3. Как связаны фронт и бэк

```
Браузер
   │
   ├─ GET /*           → Nginx → dist/ (статика SPA)
   │
   └─ GET/POST /api/*  → Nginx → Node :3001 (Express)
                              │
                              ├─ DATABASE_URL задан → PostgreSQL (cms_documents)
                              └─ нет DATABASE_URL   → server/data/cms.json
```

### Фронт (`src/app/lib/store.ts`)

- При загрузке сайта: `hydrateStore()` → `GET /api/documents`.
- Данные кэшируются в памяти; админка сохраняет через `PUT /api/documents/:key` с заголовком `X-Admin-Key` (если задан `ADMIN_API_KEY`).
- Заявки: `POST /api/leads` из форм (контакты, калькулятор, всплывающие формы).
- Локально Vite проксирует `/api` на `http://127.0.0.1:3001` (`vite.config.ts`).

### Переменные фронта (сборка)

| Переменная | Назначение |
|------------|------------|
| `VITE_API_URL` | База API (локально: `http://127.0.0.1:3001`; на проде обычно пусто — тот же домен) |
| `VITE_ADMIN_API_KEY` | Ключ для админки при сборке |

### Бэк (`server/.env`)

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | PostgreSQL |
| `PORT` | Порт API (3001) |
| `ADMIN_API_KEY` | Защита записи CMS |
| `TELEGRAM_*`, `SMTP_*`, `CRM_WEBHOOK` | Уведомления о заявках |

---

## 4. Структура репозитория

```
buro_a13/
├── src/                    # React SPA
│   └── app/
│       ├── pages/          # Страницы + Admin.tsx
│       ├── components/     # UI, Header, формы
│       └── lib/            # store.ts — CMS на клиенте
├── server/                 # API
│   ├── src/index.js
│   ├── src/leadNotify.js
│   └── data/default-cms.json
├── public/                 # Статика → dist/
│   └── projects/
│       ├── web/            # Фото проектов (галерея)
│       └── pptx-*.webp     # Иллюстрации блога
├── infra/
│   ├── nginx/              # Конфиг VPS
│   └── pm2/
├── scripts/                # Деплой, тесты, обрезка картинок
├── docs/                   # Краткие гайды
├── deploy.sh               # install | update на сервере
└── PROJECT-README.md       # Этот файл
```

---

## 5. Локальный запуск

```powershell
# Windows
Запуск-A13.cmd
# или
npm run go      # первый раз (install + запуск)
npm start       # API + Vite
```

- Сайт: http://localhost:5173/
- API: http://localhost:3001/api/health
- Админ: http://localhost:5173/admin (пароль в коде: `a13admin` + опционально 2FA через API)

Подробнее: `docs/local.md`

---

## 6. Деплой на сервер

**Сервер:** `89.111.133.165`, каталог `/var/www/a13bureau`, домен `a13bureau.ru`.

### Заливка с ПК

```powershell
cd C:\buro_a13
$env:SSH_PASS='***'; node scripts/ssh-deploy.mjs
```

или `scp` + на сервере `./deploy.sh update`.

### Что делает `deploy.sh update`

1. `npm install` (корень + server)
2. `node node_modules/vite/bin/vite.js build` → `dist/`
3. `npm run init:pg` (если есть БД)
4. PM2: `infra/pm2/ecosystem.config.json`
5. Nginx: `infra/nginx/` — статика + прокси `/api/`

### SSL

```bash
sudo certbot --nginx -d a13bureau.ru -d www.a13bureau.ru
```

Подробнее: `docs/deploy.md`

---

## 7. Важные и редкие моменты

### 7.1. Белый экран на проде (было)

Nginx проксировал **весь** сайт на API. API не отдаёт HTML.  
**Решение:** `root dist/` + `location /api/` → proxy.

### 7.2. Пути картинок `/a13/projects/...`

Раньше Vite использовал `base: '/a13/'`. В БД остались старые URL.  
Файлы лежат в `/projects/...` (без `/a13`).

- Фронт: `normalizeCmsData()` в `store.ts` при загрузке CMS.
- БД: `npm run fix:cms-paths` (в `server/`) — переписывает JSON в PostgreSQL.

### 7.3. `vite` Permission denied на Linux

Бинарники в `node_modules/.bin` без +x. В `deploy.sh`:

```bash
node node_modules/vite/bin/vite.js build
```

### 7.4. Service Worker

`public/sw.js`, база `/`. При смене `base` в Vite — обновить `BASE` в sw.js и имя кэша.

### 7.5. Синхронизация дефолтов CMS

Код: `src/app/lib/store.ts` → команда:

```bash
npm run build:default-cms   # → server/data/default-cms.json
npm run init:pg             # заливка в PostgreSQL
```

### 7.6. Картинки проектов

- **Галерея:** `public/projects/web/NN-{a,b,c}.webp`
- **Блог (запас):** `public/projects/pptx-NN.webp`
- Обрезка неиспользуемых + сжатие: `npm run prune:images` (читает CMS с `CMS_URL` или локальный json)

### 7.7. Пароль PostgreSQL и PM2

`server/.env` должен совпадать с паролем пользователя `a13` в Postgres. Иначе API в логах: `auth_failed`.

### 7.8. Админка и ключ API

Если в `server/.env` задан `ADMIN_API_KEY`, при сборке фронта нужен тот же `VITE_ADMIN_API_KEY`.

---

## 8. Тестирование продакшена

**Последний прогон (автоматический):** 21/21 OK — страницы, API, статика, заявка, карта, нагрузка 30× GET `/`.

Автоматические проверки:

```bash
npm run test:prod
# или
BASE_URL=https://a13bureau.ru node scripts/test-production.mjs
```

Проверяется:

| Категория | Что |
|-----------|-----|
| Страницы | `/`, `/about`, `/gallery`, `/contacts`, `/admin`, … |
| API | `/api/health`, `/api/documents` |
| Статика | `logo.svg`, `projects/web/01-a.webp`, CSS из index.html |
| Заявки | `POST /api/leads` (тестовая заявка — удалить в админке) |
| Карта | доступность виджета Яндекс.Карт (контакты) |
| Нагрузка | 30 параллельных GET `/` |

Ручная проверка после деплоя:

1. Главная, мобильная версия — «Связь» (телефон + почта).
2. Калькулятор → отправить расчёт.
3. Контакты → форма + карта.
4. Админка → вход, список заявок.
5. Галерея → открыть проект, листать фото.

---

## 9. Полезные команды

| Команда | Действие |
|---------|----------|
| `npm start` | Локально API + Vite |
| `npm run build` | Сборка `dist/` |
| `npm run test:prod` | Тесты продакшена |
| `npm run prune:images` | Сжать WebP, удалить лишние |
| `npm run fix:cms-paths` | Убрать `/a13/` в БД |
| `./deploy.sh update` | Обновление на VPS |
| `pm2 logs buro-api` | Логи API на сервере |

---

## 10. Контакты в коде (настройки CMS)

Телефон, email, адреса, Telegram, WhatsApp, Метрика — в админке (вкладка «Настройки») или в `store.ts` / `default-cms.json`.

---

## 11. Попап, cookie, статистика, слабые устройства

### Всплывающая форма

- Компонент: `src/app/components/PopupForm.tsx`
- Настройки: админка → **Настройки** → блок **Маркетинг**
- **Задержка** (по умолчанию 18 сек) — окно не появляется сразу при входе
- **Варианты**: консультация, скидка (−10%), сезонное предложение, свой текст
- **Показывать**: раз за сессию или раз в сутки
- Под формой — ссылка на `/privacy` (политика обработки данных)

### Cookie-баннер

- Компонент: `src/app/components/CookieConsent.tsx`
- Крупная карточка с анимацией, блок «Что именно мы используем?»
- Метрика и Service Worker подключаются **только после** «Принять»
- Задержка показа и тексты — в том же блоке **Маркетинг**

### Сообщение браузера «доступ к другим приложениям»

Чаще всего это не «вирус», а запрос от:

1. **Яндекс.Метрика (вебвизор)** — запись действий на странице; по умолчанию **выключен** (`metrikaWebvisor: false`)
2. **Service Worker** — офлайн-кэш; регистрируется только после согласия на cookie

Рекомендация: не включать вебвизор без необходимости. В баннере cookie это описано пользователю.

### Статистика

- Вкладка админки **Статистика**: просмотры по дням, топ страниц, ссылка в Метрику
- Внутренний счётчик: `POST /api/analytics/hit` (после cookie), сводка: `GET /api/analytics/summary`
- ID Метрики — в **Настройки** → Маркетинг

### Лёгкий режим

- Чекбокс **Лёгкий режим** в настройках → класс `lite-mode` на `<html>`: меньше анимаций (`src/styles/index.css`)
- Учитывается `prefers-reduced-motion` в ОС

---

*Документ обновлён при рефакторинге структуры и деплое на a13bureau.ru.*

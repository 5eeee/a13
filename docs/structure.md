# Структура проекта

```
buro_a13/
├── src/                    # Фронтенд (React + Vite)
│   ├── main.tsx
│   ├── styles/             # CSS, Tailwind, тема
│   └── app/
│       ├── App.tsx, routes.tsx
│       ├── pages/          # Страницы сайта и Admin
│       ├── components/
│       │   ├── ui/         # FadeIn, анимации (motion.tsx)
│       │   └── …           # Header, Footer, формы, админ-UI
│       └── lib/            # store (CMS), API, утилиты
├── server/                 # API (Express + PostgreSQL)
│   ├── src/index.js
│   ├── src/leadNotify.js
│   └── data/default-cms.json
├── public/                 # Статика (копируется в dist)
│   └── projects/
│       ├── web/            # Фото проектов (галерея)
│       └── pptx-*.webp     # Запас для блога
├── infra/
│   ├── nginx/              # Конфиг для VPS
│   └── pm2/
├── scripts/                # Сборка, упаковка, фото
├── docs/                   # Документация
├── deploy.sh               # Деплой на Ubuntu
├── run-local.ps1           # npm start
└── package.json
```

## Где что править

| Задача | Файл |
|--------|------|
| Тексты и проекты по умолчанию | `src/app/lib/store.ts` → `npm run build:default-cms` |
| Маршруты | `src/app/routes.tsx` |
| API, заявки | `server/src/index.js` |
| Уведомления (Telegram, почта) | `server/src/leadNotify.js` |
| Админка | `src/app/pages/Admin.tsx` (крупный файл — кандидат на разбиение) |

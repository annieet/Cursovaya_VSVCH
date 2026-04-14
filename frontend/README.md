# HomePage Export (AlterEgo)

Отдельная мини-версия проекта с главной страницей и её логикой.

## Запуск

```bash
npm install
npm run dev
```

Открыть: `http://localhost:5173`

## Что включено

- `src/pages/HomePage.jsx` — главная страница (перенесена из основного проекта).
- `src/components/HomeHeroCollage.jsx` — hero-блок.
- `src/theme.js` — тема MUI.
- `src/api/client.js` и `src/lib/uiPreview.js` — вспомогательная логика.
- `public/` — ассеты для главной.

## Примечание

- Ссылки на `"/orders/new"` и `"/services"` ведут на заглушки, чтобы кнопки на главной работали в standalone-режиме.
- Запросы к API используют префикс `/api`. Если бэкенд не запущен, главная всё равно работает (ошибки сетевых запросов перехватываются на странице).

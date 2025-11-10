# 🚀 Готово к деплою!

## ✅ Что было сделано

Проект реорганизован для правильной работы на Cloudflare Pages:

1. ✅ Functions перемещены в корень (`functions/api/`)
2. ✅ Обновлен `_routes.json` для правильного routing
3. ✅ Frontend статика из `frontend/dist/`
4. ✅ Всё будет работать на одном домене

## 🏗️ Новая структура

```
logsfucker/
├── functions/              ← Backend Functions (API)
│   └── api/
│       ├── logs.ts
│       └── stats.ts
├── frontend/               ← Frontend React
│   └── dist/              (создается при сборке)
├── _routes.json           ← Routing: /api/* → Functions, /* → Frontend
└── wrangler.toml          ← Конфигурация Cloudflare Pages
```

## 🎯 Что будет на домене

После деплоя на `https://logsfucker.pages.dev`:

- **Frontend:** `https://logsfucker.pages.dev/`
- **API Logs:** `https://logsfucker.pages.dev/api/logs`
- **API Stats:** `https://logsfucker.pages.dev/api/stats`

Всё на одном домене! Нет проблем с CORS! ✅

## 📦 Как задеплоить

### Шаг 1: Коммит изменений

```bash
git add .
git commit -m "fix: реорганизация для Cloudflare Pages full-stack

- Переместил Functions в корень (functions/api/)
- Обновил _routes.json для правильного routing
- Теперь backend и frontend работают на одном домене"
git push origin main
```

### Шаг 2: Настройте Cloudflare Pages

Откройте ваш проект на Cloudflare Pages:

#### Settings → Builds and deployments

**Build command:**
```bash
cd frontend && npm install && npm run build
```

**Build output directory:**
```
frontend/dist
```

**Root directory:**
```
/
```
(оставьте пустым или укажите `/`)

#### Settings → Functions → D1 database bindings

Добавьте binding:
- **Variable name:** `DB`
- **D1 database:** выберите `logs-db`

### Шаг 3: Убедитесь что миграции применены

```bash
cd backend
wrangler d1 migrations apply logs-db --remote
```

### Шаг 4: Деплой!

Push в main ветку запустит автоматический деплой.

Или manual деплой:

```bash
cd frontend
npm run build
cd ..
wrangler pages deploy frontend/dist --project-name=logsfucker
```

### Шаг 5: Проверка

Через 2-3 минуты проверьте:

```bash
# Frontend
curl https://logsfucker.pages.dev/

# Backend API
curl https://logsfucker.pages.dev/api/logs?limit=1
curl https://logsfucker.pages.dev/api/stats
```

Всё должно работать! 🎉

## 🔧 Настройки окружения (опционально)

Если нужны environment variables:

Settings → Environment variables → Add variable

Для Production и Preview:

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `18` |

## ✨ Преимущества новой структуры

- ✅ **Единый домен** - нет проблем с CORS
- ✅ **Автоматические деплои** - push в main → деплой
- ✅ **Preview деплои** - каждая ветка получает preview URL
- ✅ **Глобальная CDN** - быстро по всему миру
- ✅ **Бесплатно** - на Free плане Cloudflare Pages

## 🐛 Если что-то не работает

### Functions не отвечают

Проверьте:
1. Папка `functions/` в корне проекта (не `backend/functions/`)
2. D1 binding настроен (Settings → Functions)
3. `_routes.json` исключает `/api/*`

### Frontend показывает 404

Проверьте:
1. Build output directory: `frontend/dist`
2. Build прошел успешно (смотрите логи)
3. `_redirects` в `frontend/public/` настроен

### 500 Internal Server Error на API

Проверьте:
1. Миграции применены: `wrangler d1 migrations apply logs-db --remote`
2. D1 binding настроен правильно
3. Логи в Cloudflare Dashboard → Workers & Pages → Project → Logs

## 📚 Документация

- [CLOUDFLARE_FULLSTACK_SETUP.md](./CLOUDFLARE_FULLSTACK_SETUP.md) - детали full-stack структуры
- [frontend/DEPLOYMENT.md](./frontend/DEPLOYMENT.md) - деплой frontend
- [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md) - деплой backend

---

## 🎉 Готово!

Проект готов к деплою на Cloudflare Pages как full-stack приложение!

**Следующий шаг:** Закоммитьте изменения и push в main ✨

---

Made with 💜 and ⚡ by LogsFucker Team


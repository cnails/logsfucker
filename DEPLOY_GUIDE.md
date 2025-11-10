# 🚀 Полный гайд по деплою LogsFucker

Пошаговая инструкция по деплою полного стека LogsFucker на Cloudflare Pages.

## 📋 Что будет задеплоено

- ✅ **Backend** - API на Cloudflare Pages Functions + D1 база данных
- ✅ **Frontend** - React приложение на Cloudflare Pages CDN

## 🎯 Два варианта деплоя

### Вариант 1: Единый проект (рекомендуется)
Backend и Frontend в одном проекте на Cloudflare Pages.
- ✅ Проще настроить
- ✅ Единый домен
- ✅ Не нужно настраивать CORS

### Вариант 2: Раздельные проекты
Backend и Frontend в разных проектах.
- ✅ Независимые деплои
- ✅ Разные домены
- ⚠️ Нужно настроить CORS

---

## 🔥 Вариант 1: Единый проект (рекомендуется)

### Шаг 1: Подготовка репозитория

Убедитесь, что структура проекта выглядит так:

```
logsfucker/
├── backend/
│   └── functions/
│       └── api/
│           ├── logs.ts
│           └── stats.ts
├── frontend/
│   ├── src/
│   └── dist/ (будет создан при сборке)
├── wrangler.toml
└── _routes.json
```

### Шаг 2: Настройка wrangler.toml

В корне проекта уже есть `wrangler.toml`:

```toml
name = "logsfucker"
compatibility_date = "2024-01-01"
pages_build_output_dir = "frontend/dist"

[[d1_databases]]
binding = "DB"
database_name = "logs-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Обновите `database_id`** на ID вашей D1 базы.

### Шаг 3: Настройка роутинга

Файл `_routes.json` уже создан:

```json
{
  "version": 1,
  "description": "Backend на /api/*, Frontend на остальных путях",
  "include": ["/*"],
  "exclude": []
}
```

Это позволит Functions обрабатывать `/api/*`, а статика будет на остальных путях.

### Шаг 4: Создание D1 базы данных

```bash
cd backend
wrangler d1 create logs-db
```

Скопируйте `database_id` и обновите `wrangler.toml`.

### Шаг 5: Применение миграций (remote)

```bash
wrangler d1 migrations apply logs-db --remote
```

Это применит миграции к production базе.

### Шаг 6: Подключение к Cloudflare Pages

1. Откройте [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pages → Create a project → Connect to Git
3. Выберите репозиторий `logsfucker`

### Шаг 7: Настройка сборки

**Project name:**
```
logsfucker
```

**Production branch:**
```
main
```

**Build command:**
```bash
cd frontend && npm install && npm run build
```

**Build output directory:**
```
frontend/dist
```

**Environment variables:**

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `18` |

### Шаг 8: Привязка D1 базы

После создания проекта:

1. Settings → Functions → D1 database bindings
2. Add binding:
   - Variable name: `DB`
   - D1 database: `logs-db`

### Шаг 9: Деплой!

Нажмите **Save and Deploy**.

Через 2-3 минуты ваш проект будет доступен:
```
https://logsfucker.pages.dev
```

### Шаг 10: Проверка

1. Frontend: `https://logsfucker.pages.dev`
2. API: `https://logsfucker.pages.dev/api/logs?limit=5`

Оба должны работать! 🎉

---

## ⚙️ Вариант 2: Раздельные проекты

### Backend

См. [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md)

```bash
cd backend
npm run deploy
```

Backend будет на: `https://logsfucker-backend.pages.dev`

### Frontend

См. [frontend/DEPLOYMENT.md](./frontend/DEPLOYMENT.md)

1. Создайте отдельный проект на Cloudflare Pages
2. Build command: `cd frontend && npm install && npm run build`
3. Build output: `frontend/dist`
4. Environment variables:
   - `VITE_API_URL=https://logsfucker-backend.pages.dev`

Frontend будет на: `https://logsfucker-frontend.pages.dev`

### Настройка CORS

Backend уже настроен с CORS headers в `functions/api/logs.ts` и `stats.ts`.

---

## 🌐 Кастомный домен

### Для единого проекта

1. В Cloudflare Pages → Custom domains
2. Add domain: `logs.example.com`
3. Cloudflare автоматически настроит DNS

Ваш проект будет на:
- Frontend: `https://logs.example.com`
- API: `https://logs.example.com/api/*`

### Для раздельных проектов

Backend:
- `https://api.logs.example.com`

Frontend:
- `https://logs.example.com`

Обновите `VITE_API_URL` на `https://api.logs.example.com`.

---

## 🔄 CI/CD

### Автоматические деплои

При использовании Git интеграции:

#### Production
- Push в `main` → деплой на production
- URL: `https://logsfucker.pages.dev`

#### Preview
- Push в другие ветки → preview деплой
- URL: `https://<branch>.logsfucker.pages.dev`

#### Pull Requests
- Каждый PR → preview деплой
- URL в комментарии к PR

### Manual деплой через Wrangler

```bash
# Сборка frontend
cd frontend
npm run build

# Деплой всего проекта
cd ..
wrangler pages deploy frontend/dist --project-name=logsfucker
```

---

## 📊 Мониторинг

### Cloudflare Analytics

В проекте доступна встроенная аналитика:
- Requests
- Bandwidth
- Unique visitors
- Top pages
- География

### Логи

Для просмотра логов Functions:

1. Dashboard → Workers & Pages
2. Выберите проект → Logs
3. Real-time logs

### Алерты

Настройте Notifications для:
- Deployment failures
- High error rates
- Traffic spikes

---

## 🐛 Решение проблем

### "Database binding not found"

**Причина:** D1 база не привязана к проекту.

**Решение:**
1. Settings → Functions → D1 database bindings
2. Add binding: `DB` → `logs-db`
3. Redeploy

### "404 на /api/*"

**Причина:** Functions не деплоятся или неправильный routing.

**Решение:**
1. Убедитесь, что папка `functions/` в корне или `backend/functions/`
2. Проверьте `_routes.json`
3. Убедитесь, что Functions включены в настройках проекта

### "CORS ошибка"

**Причина:** Frontend и Backend на разных доменах без CORS.

**Решение:**
Backend уже настроен с CORS headers. Если не работает:
1. Проверьте headers в ответе API
2. Используйте единый проект вместо раздельных

### Frontend показывает пустую страницу

**Причина:** JavaScript не загружается или ошибка в коде.

**Решение:**
1. Откройте DevTools → Console
2. Проверьте ошибки
3. Убедитесь, что build прошел успешно

---

## ✅ Чек-лист деплоя

### Backend
- [ ] D1 база создана
- [ ] `database_id` обновлен в `wrangler.toml`
- [ ] Миграции применены (`--remote`)
- [ ] Functions деплоятся
- [ ] API отвечает на запросы

### Frontend
- [ ] Build проходит успешно
- [ ] Статические файлы генерируются в `dist/`
- [ ] Frontend открывается
- [ ] API запросы работают

### Общее
- [ ] Routing настроен (`_routes.json`)
- [ ] D1 binding привязан к проекту
- [ ] Environment variables настроены
- [ ] Кастомный домен добавлен (опционально)
- [ ] SSL активен

---

## 🎉 Готово!

Ваш full-stack LogsFucker теперь работает в production! 🚀

**Полезные ссылки:**
- [Frontend DEPLOYMENT.md](./frontend/DEPLOYMENT.md) - детали фронтенда
- [Backend DEPLOYMENT.md](./backend/DEPLOYMENT.md) - детали бэкенда
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)

---

Made with 💜 and ⚡ by LogsFucker Team


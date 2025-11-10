# 🏗️ Настройка Full-Stack проекта на Cloudflare Pages

## 🔴 Проблема

Backend и Frontend деплоятся на один URL, что вызывает конфликты.

## 📁 Правильная структура для Cloudflare Pages

Для full-stack проекта нужна такая структура:

```
logsfucker/
├── functions/              # ← Functions в КОРНЕ (не в backend/)
│   └── api/
│       ├── logs.ts
│       └── stats.ts
├── frontend/
│   └── dist/              # ← Статика frontend (после сборки)
├── _routes.json           # ← Routing конфигурация
└── wrangler.toml
```

## ⚠️ Текущая проблема

Сейчас Functions находятся в `backend/functions/`, но Cloudflare Pages ищет их в `functions/` в корне.

## ✅ Решение: Реорганизация структуры

### Вариант 1: Переместить Functions в корень (рекомендуется)

Это позволит всё работать на одном домене.

#### Шаг 1: Создайте functions в корне

```bash
# Из корня проекта
mkdir -p functions/api
```

#### Шаг 2: Переместите файлы Functions

```bash
cp backend/functions/api/logs.ts functions/api/logs.ts
cp backend/functions/api/stats.ts functions/api/stats.ts
```

Или просто переместите папку:

```bash
mv backend/functions ./functions
```

#### Шаг 3: Обновите _routes.json

Файл уже существует, но проверьте содержимое:

```json
{
  "version": 1,
  "description": "Backend на /api/*, Frontend на остальных путях",
  "include": ["/*"],
  "exclude": ["/api/*"]
}
```

Это означает:
- `/api/*` → обрабатывается Functions (backend)
- `/*` → статика frontend

#### Шаг 4: Обновите wrangler.toml в корне

Убедитесь что указано:

```toml
name = "logsfucker"
compatibility_date = "2024-01-01"

# Указываем где статика frontend
pages_build_output_dir = "frontend/dist"

# D1 база данных
[[d1_databases]]
binding = "DB"
database_name = "logs-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

#### Шаг 5: Настройте Cloudflare Pages

В Dashboard → Pages → Settings → Builds and deployments:

**Build command:**
```bash
cd frontend && npm install && npm run build
```

**Build output directory:**
```
frontend/dist
```

**Root directory:**
Оставьте пустым (/)

#### Шаг 6: Привяжите D1 базу

Settings → Functions → D1 database bindings:
- Variable name: `DB`
- D1 database: выберите вашу базу `logs-db`

#### Шаг 7: Деплой

```bash
git add .
git commit -m "fix: переместил Functions в корень для правильной структуры"
git push origin main
```

Cloudflare автоматически задеплоит проект.

---

## 🎯 Результат

После этого на одном домене будет:

- **Frontend:** `https://logsfucker.pages.dev/`
- **API:** `https://logsfucker.pages.dev/api/logs`
- **API:** `https://logsfucker.pages.dev/api/stats`

Всё работает на одном домене! ✅

---

## 🔧 Вариант 2: Раздельные проекты

Если хотите держать backend и frontend отдельно:

### Backend проект

Создайте отдельный проект для backend:

```bash
cd backend
wrangler pages deploy public --project-name=logsfucker-api
```

Backend будет на: `https://logsfucker-api.pages.dev`

### Frontend проект

Отдельный проект для frontend:

```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name=logsfucker-app
```

Frontend будет на: `https://logsfucker-app.pages.dev`

**Важно:** Настройте CORS на backend и добавьте `VITE_API_URL` на frontend.

---

## 📋 Проверка

После настройки проверьте:

```bash
# Frontend
curl https://logsfucker.pages.dev/

# API
curl https://logsfucker.pages.dev/api/logs?limit=1
curl https://logsfucker.pages.dev/api/stats
```

Всё должно работать! 🎉

---

## 🐛 Возможные проблемы

### "Functions не работают"

**Причина:** Functions не в корне проекта.

**Решение:** Убедитесь что папка `functions/` в корне (не `backend/functions/`)

### "404 на /api/*"

**Причина:** `_routes.json` настроен неправильно.

**Решение:** Используйте конфиг выше, где `/api/*` исключен из статики.

### "Frontend показывает 404"

**Причина:** Build output directory указан неправильно.

**Решение:** Должно быть `frontend/dist`, а не просто `dist`.

---

## 📚 Дополнительно

- [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - полный гайд по деплою
- [Cloudflare Pages Full-stack](https://developers.cloudflare.com/pages/platform/functions/)

---

Made with 💜 and ⚡


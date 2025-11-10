# 🚀 Production Setup - Пошаговая инструкция

После первого деплоя на Cloudflare Pages нужно выполнить несколько шагов для настройки production окружения.

## ✅ Шаг 1: Применить миграции к production базе

После деплоя backend обязательно примените миграции к **облачной** базе D1:

```bash
cd backend
wrangler d1 migrations apply logs-db --remote
```

**Важно:** Флаг `--remote` обязателен! Это применит миграции к production базе в Cloudflare.

Вы должны увидеть:
```
✅ Successfully applied 1 migration(s)
```

---

## ✅ Шаг 2: Проверить, что база создана

Проверьте, что таблица `logs` создана в production:

```bash
wrangler d1 execute logs-db --command "SELECT name FROM sqlite_master WHERE type='table';"
```

Должно вывести:
```
┌───────┐
│ name  │
├───────┤
│ logs  │
└───────┘
```

---

## ✅ Шаг 3: Проверить работу API

Откройте ваш деплой (например, `https://your-project.pages.dev`) и проверьте endpoints:

### GET /api/logs
```bash
curl https://your-project.pages.dev/api/logs?limit=1
```

**Ожидается:** `[]` (пустой массив, если логов пока нет)

**Если ошибка:** `{"error":"db error"}` - миграции не применены, вернитесь к шагу 1

### POST /api/logs (отправить тестовый лог)
```bash
curl -X POST https://your-project.pages.dev/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "extensionName": "test",
    "level": "info",
    "message": "Production test"
  }'
```

**Ожидается:** `{"ok":true}`

### GET /api/stats
```bash
curl https://your-project.pages.dev/api/stats
```

**Ожидается:** `[]` или статистика, если есть логи

---

## ✅ Шаг 4: Настроить Frontend

Если вы также деплоите frontend на Cloudflare Pages, обновите API URL:

### Вариант А: Environment Variable (рекомендуется)

В Cloudflare Dashboard для frontend проекта:
1. Settings → Environment variables
2. Добавьте:
   - `VITE_API_BASE_URL` = `https://your-backend-project.pages.dev`

Обновите `frontend/src/hooks/useStats.ts` и `useLogs.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8788';
```

### Вариант Б: Hardcode (быстро)

Измените прямо в коде:

**frontend/src/hooks/useStats.ts:**
```typescript
const API_BASE_URL = 'https://your-backend-project.pages.dev';
```

**frontend/src/hooks/useLogs.ts:**
```typescript
const API_BASE_URL = 'https://your-backend-project.pages.dev';
```

---

## 🔍 Проверка статуса

### Посмотреть список миграций
```bash
wrangler d1 migrations list logs-db
```

### Выполнить SQL запрос
```bash
# Количество логов
wrangler d1 execute logs-db --command "SELECT COUNT(*) as total FROM logs"

# Последние 5 логов
wrangler d1 execute logs-db --command "SELECT * FROM logs ORDER BY created_at DESC LIMIT 5"
```

---

## 📊 Заполнение тестовыми данными

После настройки можете заполнить базу тестовыми данными:

```bash
cd backend

# Измените URL на ваш production URL в скрипте
node scripts/generate-test-data.js https://your-project.pages.dev 50
```

Или используйте `example-client.html`:
1. Откройте `backend/example-client.html` в браузере
2. Измените API URL на `https://your-project.pages.dev`
3. Отправьте несколько тестовых логов

---

## ⚠️ Частые ошибки

### ❌ Ошибка: "database_id does not match"

**Проблема:** В `wrangler.toml` указан неправильный `database_id`.

**Решение:**
1. Получите список ваших D1 баз:
   ```bash
   wrangler d1 list
   ```

2. Найдите `logs-db` и скопируйте её ID

3. Обновите `backend/wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "logs-db"
   database_id = "правильный-id-отсюда"
   ```

4. Передеплойте:
   ```bash
   npm run deploy
   ```

### ❌ Ошибка: "Binding DB not found" или постоянный `{"error":"db error"}`

**Проблема:** D1 биндинг не настроен в Cloudflare Pages.

**Решение:**
1. Откройте Cloudflare Dashboard: https://dash.cloudflare.com/
2. Workers & Pages → Ваш проект → Settings → Functions
3. Scroll down до раздела **D1 database bindings**
4. Add binding:
   - Variable name: `DB` (обязательно заглавными!)
   - D1 database: выберите `logs-db`
5. Save
6. Передеплойте проект (или сделайте любой коммит)

**Проверка:**
```bash
# После сохранения биндинга подождите ~30 секунд и проверьте
curl "https://your-project.pages.dev/api/logs?limit=1"
# Должно вернуться: []
```

### ❌ Миграции не применяются

**Проблема:**
```
✘ [ERROR] No migrations folder found
```

**Решение:**
Убедитесь, что вы в папке `backend/`:
```bash
pwd  # Должно быть .../logsfucker/backend
ls migrations/  # Должен быть файл 0001_init.sql
```

---

## 🎯 Чеклист после деплоя

- [ ] Применены миграции: `wrangler d1 migrations apply logs-db`
- [ ] Таблица создана: `wrangler d1 execute logs-db --command "SELECT name FROM sqlite_master WHERE type='table';"`
- [ ] GET /api/logs работает: `curl https://your-url/api/logs?limit=1`
- [ ] POST /api/logs работает: отправлен тестовый лог
- [ ] GET /api/stats работает: `curl https://your-url/api/stats`
- [ ] Frontend настроен на правильный API URL
- [ ] Frontend задеплоен (если нужно)
- [ ] Добавлены тестовые данные (опционально)

---

## 🔐 Рекомендации для Production

### 1. Настройте Rate Limiting

В Cloudflare Dashboard:
- Security → WAF → Rate limiting rules
- Создайте правило: 100 requests per minute per IP

### 2. Включите Bot Protection

- Security → Bots → Configure
- Bot Fight Mode → ON

### 3. Настройте мониторинг

- Analytics → Web Analytics
- Следите за количеством запросов и ошибок

### 4. Резервное копирование

Регулярно создавайте backup базы D1:
```bash
wrangler d1 backup create logs-db
wrangler d1 backup list logs-db
```

### 5. Добавьте авторизацию (опционально)

Для защиты API добавьте проверку API ключа в `functions/api/logs.ts`:
```typescript
const apiKey = request.headers.get('X-API-Key');
if (apiKey !== 'ваш-секретный-ключ') {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: corsHeaders() }
  );
}
```

---

## 📞 Нужна помощь?

Если что-то не получается:
1. Проверьте [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Посмотрите логи: Cloudflare Dashboard → Your project → Logs
3. Создайте issue в репозитории

---

**Последнее обновление:** 10 ноября 2025


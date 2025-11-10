# 🔧 Устранение неполадок

## Ошибка `{"error":"db error"}`

### Причина
База данных D1 не инициализирована или миграции не применены в dev режиме.

### Решение

#### Шаг 1: Остановите dev сервер
Если backend запущен, остановите его (Ctrl+C).

#### Шаг 2: Примените миграции локально
```bash
cd backend
wrangler d1 migrations apply logs-db --local
```

Должно появиться сообщение о применении миграций или "No migrations to apply".

#### Шаг 3: Проверьте, что база создана
```bash
wrangler d1 execute logs-db --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

Должна вывестись таблица `logs`.

#### Шаг 4: Перезапустите dev сервер
```bash
npm run dev
```

#### Шаг 5: Проверьте работу API
Откройте в браузере или через curl:
```bash
curl http://localhost:8788/api/logs?limit=1
```

Должен вернуться `[]` (пустой массив) или логи, если они есть.

---

## Другие частые проблемы

### ❌ CORS ошибка

**Проблема:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Решение:**
Убедитесь, что backend запущен через `npm run dev`, а не открыт как файл в браузере.

---

### ❌ "database_id is required"

**Проблема:**
```
✘ [ERROR] database_id is required
```

**Решение:**
1. Создайте D1 базу:
   ```bash
   wrangler d1 create logs-db
   ```

2. Скопируйте `database_id` из вывода

3. Обновите `backend/wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "logs-db"
   database_id = "ваш-реальный-id"  # ⬅️ Вставьте сюда
   ```

---

### ❌ "no such table: logs"

**Проблема:**
```sql
no such table: logs
```

**Решение:**
Примените миграции:
```bash
# Для локальной разработки
wrangler d1 migrations apply logs-db --local

# Для production
wrangler d1 migrations apply logs-db
```

---

### ❌ Порт 8788 уже занят

**Проблема:**
```
✘ [ERROR] Address already in use
```

**Решение:**

**Вариант 1:** Остановите другой процесс на порту 8788
```bash
# macOS/Linux
lsof -ti:8788 | xargs kill -9

# Windows
netstat -ano | findstr :8788
taskkill /PID <номер_процесса> /F
```

**Вариант 2:** Используйте другой порт
```bash
wrangler pages dev public --port=8787
```

Затем обновите URL в frontend (`frontend/src/hooks/useStats.ts` и `useLogs.ts`):
```typescript
const API_BASE_URL = 'http://localhost:8787';
```

---

### ❌ Frontend не может подключиться к Backend

**Проблема:**
Frontend показывает ошибки сети или "db error".

**Решение:**

1. **Проверьте, что backend запущен:**
   ```bash
   curl http://localhost:8788/api/logs?limit=1
   ```

2. **Проверьте URL в frontend:**
   - Откройте `frontend/src/hooks/useStats.ts`
   - Убедитесь, что `API_BASE_URL = 'http://localhost:8788'`

3. **Проверьте, что оба сервиса запущены:**
   ```bash
   # Терминал 1 - Backend
   cd backend && npm run dev
   
   # Терминал 2 - Frontend
   cd frontend && npm run dev
   ```

---

### ❌ Wrangler устарел (WARNING)

**Проблема:**
```
▲ [WARNING] The version of Wrangler you are using is now out-of-date.
```

**Решение:**
```bash
cd backend
npm install -D wrangler@latest
```

Или глобально:
```bash
npm install -g wrangler@latest
```

---

### ❌ TypeScript ошибки в frontend

**Проблема:**
```
TS2307: Cannot find module '...'
```

**Решение:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ Build frontend не работает

**Проблема:**
```
✘ [ERROR] Build failed
```

**Решение:**

1. Очистите кэш:
   ```bash
   cd frontend
   rm -rf node_modules dist .vite
   npm install
   npm run build
   ```

2. Проверьте версию Node.js:
   ```bash
   node --version  # Должно быть >= 18
   ```

---

### ❌ Деплой на Cloudflare не работает

**Проблема:**
```
✘ [ERROR] Must specify a directory of assets to deploy
```

**Решение:**

Убедитесь, что в `backend/wrangler.toml` правильно указана директория:
```toml
pages_build_output_dir = "public"
```

И папка `backend/public/` существует с `index.html` внутри.

Затем:
```bash
cd backend
npm run deploy
```

---

## 🔍 Отладка

### Проверка логов backend

Wrangler сохраняет логи в:
```
~/.wrangler/logs/
```

Последний лог можно посмотреть:
```bash
# macOS/Linux
cat $(ls -t ~/.wrangler/logs/wrangler-*.log | head -1)

# Windows
type %USERPROFILE%\.wrangler\logs\wrangler-*.log
```

### Проверка состояния D1 базы

```bash
# Список таблиц
wrangler d1 execute logs-db --local --command "SELECT name FROM sqlite_master WHERE type='table';"

# Количество записей
wrangler d1 execute logs-db --local --command "SELECT COUNT(*) FROM logs;"

# Последние 10 логов
wrangler d1 execute logs-db --local --command "SELECT * FROM logs ORDER BY created_at DESC LIMIT 10;"
```

### Тест API вручную

```bash
# Отправить тестовый лог
curl -X POST http://localhost:8788/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "extensionName": "test",
    "level": "info",
    "message": "Test message"
  }'

# Получить логи
curl http://localhost:8788/api/logs?limit=10

# Получить статистику
curl http://localhost:8788/api/stats
```

---

## 💡 Советы

1. **Всегда запускайте backend перед frontend**
   ```bash
   # Сначала
   cd backend && npm run dev
   
   # Потом (в другом терминале)
   cd frontend && npm run dev
   ```

2. **Используйте `example-client.html` для быстрого тестирования backend**
   ```bash
   cd backend
   npm run dev
   open example-client.html  # или просто откройте в браузере
   ```

3. **Проверяйте версии:**
   ```bash
   node --version   # >= 18
   npm --version    # >= 8
   wrangler --version  # >= 3.0
   ```

4. **Очищайте кэш при странных ошибках:**
   ```bash
   # Backend
   cd backend
   rm -rf node_modules package-lock.json .wrangler
   npm install
   
   # Frontend
   cd frontend
   rm -rf node_modules package-lock.json dist .vite
   npm install
   ```

---

## 🆘 Всё ещё не работает?

1. **Проверьте, что у вас есть:**
   - Node.js >= 18
   - npm >= 8
   - Cloudflare аккаунт (для деплоя)

2. **Попробуйте полную переустановку:**
   ```bash
   # Удалите всё
   rm -rf backend/node_modules backend/package-lock.json
   rm -rf frontend/node_modules frontend/package-lock.json
   rm -rf backend/.wrangler
   
   # Установите заново
   cd backend && npm install
   cd ../frontend && npm install
   
   # Примените миграции
   cd ../backend
   wrangler d1 migrations apply logs-db --local
   
   # Запустите
   npm run dev
   ```

3. **Создайте issue в репозитории** с:
   - Описанием проблемы
   - Шагами для воспроизведения
   - Выводом команд и логами
   - Версиями Node.js, npm, wrangler

---

**Последнее обновление:** 10 ноября 2025


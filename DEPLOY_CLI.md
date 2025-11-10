# 🚀 Деплой LogsFucker через Wrangler CLI

Полная инструкция по деплою с нуля через Cloudflare Wrangler CLI.

## 📋 Подготовка

### Шаг 1: Удалите старый проект (если есть)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → найдите проект **logsfucker**
3. Settings → прокрутите вниз → **Delete project**
4. Подтвердите удаление

### Шаг 2: Обновите Wrangler

```bash
npm install -g wrangler@latest
```

Или локально в проекте:

```bash
npm install --save-dev wrangler@latest
```

### Шаг 3: Авторизуйтесь

```bash
wrangler login
```

Откроется браузер для авторизации в Cloudflare.

---

## 🗄️ Настройка D1 базы данных

### База уже создана?

Проверьте:

```bash
wrangler d1 list
```

Должна быть база `logs-db` с ID `253b544c-3a8f-4783-8f7f-47df2e6e0096`.

### Если база есть - применить миграции:

```bash
cd backend
wrangler d1 migrations apply logs-db --remote
cd ..
```

Вывод:
```
✅ No migrations to apply!
```
или
```
✅ Successfully applied migration(s)
```

### Если базы нет - создать:

```bash
wrangler d1 create logs-db
```

Скопируйте `database_id` и обновите в `wrangler.toml` (корневом).

Затем примените миграции:

```bash
cd backend
wrangler d1 migrations apply logs-db --remote
cd ..
```

---

## 🎨 Сборка Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

Проверьте что создалась папка `frontend/dist/` с файлами.

---

## 🚀 Деплой проекта

### Первый деплой (создание проекта)

```bash
wrangler pages deploy frontend/dist --project-name=logsfucker
```

Wrangler:
1. Создаст новый Pages проект
2. Загрузит статику из `frontend/dist/`
3. Загрузит Functions из `functions/api/`
4. **Автоматически применит** D1 bindings из `wrangler.toml`

Вывод:
```
✨ Success! Uploaded 25 files
✨ Deployment complete!
🌎 https://logsfucker.pages.dev
```

---

## ✅ Проверка

### 1. Frontend

Откройте в браузере:
```
https://logsfucker.pages.dev/
```

Должен открыться дашборд LogsFucker 🔥

### 2. Backend API

```bash
# Логи
curl "https://logsfucker.pages.dev/api/logs?limit=1"

# Статистика
curl "https://logsfucker.pages.dev/api/stats"
```

Должны вернуть `[]` (пустые массивы), а не ошибки ✅

### 3. Отправка тестового лога

```bash
curl -X POST "https://logsfucker.pages.dev/api/logs" \
  -H "Content-Type: application/json" \
  -d '{
    "extensionName": "test-extension",
    "level": "info",
    "message": "Hello from CLI deploy!",
    "meta": "{}"
  }'
```

Ответ:
```json
{"success":true,"id":1}
```

### 4. Проверка что лог сохранился

```bash
curl "https://logsfucker.pages.dev/api/logs?limit=1"
```

Должен вернуть массив с вашим логом! 🎉

---

## 🔄 Повторный деплой (после изменений)

При любых изменениях в коде:

```bash
# 1. Соберите frontend
cd frontend
npm run build
cd ..

# 2. Деплой
wrangler pages deploy frontend/dist --project-name=logsfucker
```

Wrangler автоматически:
- Обновит статику
- Обновит Functions
- Сохранит все bindings

---

## 🤖 Автоматизация через GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Build
        run: |
          cd frontend
          npm run build
      
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy frontend/dist --project-name=logsfucker
```

Добавьте `CLOUDFLARE_API_TOKEN` в GitHub Secrets.

---

## 📝 Преимущества CLI деплоя

✅ **Bindings работают** - автоматически из `wrangler.toml`
✅ **Проще отладка** - видны все ошибки в терминале
✅ **Быстрее** - не нужно ждать Git integration
✅ **Контроль** - полный контроль над процессом
✅ **Предсказуемость** - одинаковый результат каждый раз

---

## 🐛 Решение проблем

### "You must be authenticated"

```bash
wrangler login
```

### "Project not found"

При первом деплое это нормально - Wrangler создаст проект.

### "Error: Too large"

Проверьте размер `frontend/dist/`:

```bash
du -sh frontend/dist/
```

Должно быть < 25 MB.

### "Database binding not found"

Проверьте `wrangler.toml` в корне:

```toml
[[d1_databases]]
binding = "DB"
database_name = "logs-db"
database_id = "253b544c-3a8f-4783-8f7f-47df2e6e0096"
```

---

## 🎉 Готово!

После успешного деплоя через CLI всё будет работать идеально! 🔥

**Команда для повторного деплоя:**
```bash
cd frontend && npm run build && cd .. && wrangler pages deploy frontend/dist --project-name=logsfucker
```

---

Made with 💜 and ⚡ by LogsFucker Team


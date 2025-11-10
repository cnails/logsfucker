# 📦 Установка LogsFucker

Полное руководство по установке full-stack приложения LogsFucker.

## 📋 Требования

### Обязательные

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Cloudflare account** (бесплатный)
- **Wrangler CLI** - устанавливается автоматически

### Рекомендуемые

- **Git** для версионного контроля
- **VS Code** или другой редактор
- **Расширения VS Code**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

## 🚀 Установка

### Шаг 1: Клонирование проекта

```bash
git clone <your-repository-url>
cd logsfucker
```

### Шаг 2: Установка корневых зависимостей

```bash
npm install
```

Это установит `npm-run-all` для запуска нескольких сервисов одновременно.

### Шаг 3: Установка Backend

```bash
cd backend
npm install
```

**Установленные пакеты:**
- `wrangler` - Cloudflare CLI
- `typescript` - TypeScript компилятор
- Все необходимые типы для Cloudflare Workers

### Шаг 4: Настройка D1 базы данных

```bash
# Находясь в папке backend/
wrangler login  # Войдите в Cloudflare аккаунт

# Создайте D1 базу данных
wrangler d1 create logs-db
```

**Вывод команды:**
```
✅ Successfully created DB 'logs-db'

[[d1_databases]]
binding = "DB"
database_name = "logs-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Скопируйте** `database_id` и обновите `backend/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "logs-db"
database_id = "ваш-реальный-database-id"  # ⬅️ Вставьте сюда
```

### Шаг 5: Применение миграций

```bash
# Находясь в папке backend/
npm run d1:migrate
```

**Ожидаемый вывод:**
```
Migrations to be applied:
┌────────────────┬────────────────┐
│ Name           │ Status         │
├────────────────┼────────────────┤
│ 0001_init.sql  │ Not applied    │
└────────────────┴────────────────┘

✅ Successfully applied 1 migration(s)
```

### Шаг 6: Установка Frontend

```bash
cd ../frontend  # или cd frontend из корня
npm install
```

**Установленные пакеты:**
- `react` + `react-dom` - React библиотека
- `vite` - Сборщик
- `typescript` - TypeScript
- `tailwindcss` - Стилизация
- `date-fns` - Работа с датами
- Все необходимые типы и плагины

## ✅ Проверка установки

### Проверка Backend

```bash
cd backend
npm run dev
```

**Ожидаемый вывод:**
```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

**Тест API:**
```bash
# В другом терминале
curl http://localhost:8787/api/logs?limit=1
```

Должен вернуть `[]` (пустой массив) или логи, если есть.

### Проверка Frontend

```bash
cd frontend
npm run dev
```

**Ожидаемый вывод:**
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

Откройте http://localhost:3000 в браузере. Вы должны увидеть дашборд LogsFucker.

## 🎯 Генерация тестовых данных

Для тестирования интерфейса сгенерируйте тестовые данные:

```bash
cd backend
node scripts/generate-test-data.js
```

**Что будет создано:**
- 3 проекта (test-extension-1, 2, 3)
- ~150 логов разных уровней
- Логи за последние 7 дней
- Аномальные IP для тестирования

После генерации обновите страницу в браузере.

## 🔧 Настройка среды разработки

### VS Code (рекомендуется)

Создайте `.vscode/settings.json` в корне проекта:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Расширения VS Code

Рекомендуемые расширения (`.vscode/extensions.json`):

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 📦 Структура после установки

```
logsfucker/
├── node_modules/           # Корневые зависимости
├── backend/
│   ├── node_modules/       # Backend зависимости
│   ├── .wrangler/          # Wrangler cache (git ignored)
│   └── ...
├── frontend/
│   ├── node_modules/       # Frontend зависимости
│   ├── dist/               # Build output (git ignored)
│   └── ...
└── ...
```

## 🐛 Решение проблем

### "wrangler: command not found"

```bash
cd backend
npm install
# Wrangler устанавливается локально в node_modules/.bin/
npm run dev  # использует локальный wrangler
```

### "database_id is required"

Убедитесь, что вы:
1. Создали D1 базу: `wrangler d1 create logs-db`
2. Скопировали `database_id` в `wrangler.toml`
3. Применили миграции: `npm run d1:migrate`

### "Module not found" в frontend

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### "CORS error" при локальной разработке

Убедитесь, что:
1. Backend запущен на порту 8787
2. Frontend запущен на порту 3000
3. В `vite.config.ts` настроен прокси (уже настроен)

### Frontend не видит backend

Проверьте, что backend запущен:
```bash
curl http://localhost:8787/api/logs
```

Если не работает, перезапустите backend:
```bash
cd backend
npm run dev
```

## ✅ Готово!

Теперь у вас установлен полный стек LogsFucker:

- ✅ Backend на Cloudflare Workers + D1
- ✅ Frontend на React + TypeScript + Vite
- ✅ База данных D1 с примененными миграциями
- ✅ Тестовые данные (опционально)

## 🚀 Следующие шаги

1. **Разработка**: См. [DEV.md](./DEV.md)
2. **Быстрый старт**: См. [QUICKSTART.md](./QUICKSTART.md)
3. **Деплой**: См. [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md)
4. **Contributing**: См. [CONTRIBUTING.md](./CONTRIBUTING.md)

---

Приятной разработки! 💜⚡


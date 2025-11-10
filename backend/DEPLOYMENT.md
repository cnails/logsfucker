# 🚀 Развертывание на Cloudflare Pages

## Предварительные требования

1. **Аккаунт Cloudflare** с активной подпиской (бесплатный план подойдет)
2. **Wrangler CLI** установлен и настроен:

```bash
npm install -g wrangler
wrangler login
```

## Пошаговая инструкция

### 1. Создание D1 базы данных

```bash
# Создайте базу данных
wrangler d1 create logs-db
```

**Важно**: Сохраните `database_id` из вывода команды. Он понадобится на следующем шаге.

Пример вывода:

```
✅ Successfully created DB 'logs-db'

[[d1_databases]]
binding = "DB"
database_name = "logs-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Обновление конфигурации

Откройте `wrangler.toml` и замените `your-database-id-here` на реальный ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "logs-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ⬅️ Ваш реальный ID
```

### 3. Применение миграций

```bash
# Применить миграции к production базе
wrangler d1 migrations apply logs-db
```

Вы должны увидеть:

```
✅ Successfully applied 1 migration(s)
```

### 4. Первый деплой

```bash
npm run deploy
```

Wrangler спросит название проекта (можете использовать `logsfucker` или любое другое).

После успешного деплоя вы получите URL вида:

```
✨ Deployment complete! Take a peek over at https://logsfucker-xxx.pages.dev
```

### 5. Проверка работы

Проверьте, что API работает:

```bash
# Замените URL на ваш реальный
curl https://logsfucker-xxx.pages.dev/api/logs?limit=1
```

Должен вернуться пустой массив `[]` (так как логов пока нет).

### 6. Отправка тестового лога

```bash
curl -X POST https://logsfucker-xxx.pages.dev/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "extensionName": "test-extension",
    "level": "info",
    "message": "Hello from production!"
  }'
```

Ответ: `{"ok":true}`

### 7. Проверка статистики

```bash
curl https://logsfucker-xxx.pages.dev/api/stats
```

## Автоматический деплой с GitHub

### Шаг 1: Создайте репозиторий

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/logsfucker.git
git push -u origin main
```

### Шаг 2: Подключите к Cloudflare Pages

1. Перейдите в [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → Create application → Pages → Connect to Git
3. Выберите ваш репозиторий `logsfucker`
4. Настройки сборки:
   - **Build command**: (оставьте пустым)
   - **Build output directory**: `.`
   - **Root directory**: `/`
5. Добавьте Environment Variable:
   - `NODE_VERSION` = `18`

### Шаг 3: Настройка D1 binding

После создания проекта:

1. Settings → Functions → D1 database bindings
2. Add binding:
   - **Variable name**: `DB`
   - **D1 database**: `logs-db`
3. Save

### Шаг 4: Применение миграций

Миграции нужно применить вручную один раз:

```bash
wrangler d1 migrations apply logs-db
```

Теперь при каждом push в `main` будет автоматический деплой! 🎉

## Работа с несколькими окружениями

### Development (локально)

```bash
npm run dev
```

Использует локальную SQLite базу.

### Preview (ветки)

```bash
wrangler pages deploy --branch=staging
```

### Production

```bash
npm run deploy
# или через Git push в main
```

## Мониторинг и логи

### Просмотр логов в реальном времени

```bash
wrangler pages deployment tail
```

### Просмотр метрик

1. Cloudflare Dashboard → Pages → Ваш проект
2. Analytics → Metrics

### Выполнение SQL запросов

```bash
# Посмотреть все логи
wrangler d1 execute logs-db --command "SELECT * FROM logs LIMIT 10"

# Посчитать записи
wrangler d1 execute logs-db --command "SELECT COUNT(*) FROM logs"

# Удалить старые логи (старше 30 дней)
wrangler d1 execute logs-db --command "DELETE FROM logs WHERE created_at < $(date -d '30 days ago' +%s)000"
```

## Лимиты D1 (бесплатный план)

- **Хранение**: 5 GB
- **Запросы**: 5 млн в день
- **Строк прочитано**: 25 млн в день
- **Строк записано**: 100k в день

Для большинства проектов этого более чем достаточно!

## Обновление проекта

После изменений в коде:

```bash
git add .
git commit -m "Update API"
git push
```

Если используете автоматический деплой через GitHub - всё произойдет автоматически.

Если деплоите вручную:

```bash
npm run deploy
```

## Откат к предыдущей версии

В Cloudflare Dashboard:

1. Pages → Ваш проект → Deployments
2. Найдите нужную версию
3. Нажмите ⋮ → Rollback to this deployment

## Удаление проекта

⚠️ **Внимание**: Это удалит все данные!

```bash
# Удалить базу данных
wrangler d1 delete logs-db

# Удалить Pages проект через Dashboard:
# Pages → Ваш проект → Settings → Scroll down → Delete project
```

## Безопасность для production

1. **Добавьте rate limiting** через Cloudflare WAF
2. **Настройте API токены** (модифицируйте код для проверки заголовка `X-API-Key`)
3. **Включите Bot Fight Mode** в Cloudflare
4. **Настройте алерты** на необычную активность
5. **Регулярно делайте backup БД**:

```bash
wrangler d1 backup create logs-db
wrangler d1 backup list logs-db
```

## Troubleshooting

### Ошибка "binding DB not found"

Убедитесь, что в `wrangler.toml` правильно настроен binding и `database_id` корректен.

### Ошибка "no such table: logs"

Примените миграции:

```bash
wrangler d1 migrations apply logs-db
```

### Деплой завершается ошибкой

Проверьте логи:

```bash
wrangler pages deployment list
wrangler pages deployment tail
```

### CORS ошибки

Убедитесь, что в коде установлены правильные заголовки (уже реализовано в `logs.ts` и `stats.ts`).

---

📧 Вопросы? Создайте issue в репозитории!


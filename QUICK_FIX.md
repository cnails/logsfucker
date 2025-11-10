# ⚡ Быстрое исправление API запросов

## 🔴 Проблема

Frontend на `https://main.logsfucker.pages.dev/` не может обратиться к backend на `https://logsfucker.pages.dev/`

## ✅ Решение за 2 минуты

### Шаг 1: Откройте Cloudflare Dashboard

Перейдите на https://dash.cloudflare.com/

### Шаг 2: Найдите frontend проект

Workers & Pages → выберите проект где деплоится frontend

### Шаг 3: Добавьте Environment Variable

1. Settings → Environment variables
2. Нажмите **Add variable**
3. Заполните:

**Production:**
```
Variable name: VITE_API_URL
Value: https://logsfucker.pages.dev
```

**Preview:**
```
Variable name: VITE_API_URL
Value: https://logsfucker.pages.dev
```

4. Нажмите **Save**

### Шаг 4: Redeploy

1. Deployments
2. Выберите последний деплой
3. **Retry deployment**

### Шаг 5: Подождите 2-3 минуты

Cloudflare пересоберёт проект с новой переменной.

### Шаг 6: Проверка

1. Откройте https://main.logsfucker.pages.dev/
2. Откройте DevTools (F12) → Network
3. Обновите страницу
4. Должны быть запросы к:
   - ✅ `https://logsfucker.pages.dev/api/stats`
   - ✅ `https://logsfucker.pages.dev/api/logs`
5. Status должен быть `200 OK`

## 🎉 Готово!

Теперь frontend корректно обращается к backend API.

---

## 🔧 Альтернативное решение (для production)

Если хотите чтобы всё было на одном домене `logsfucker.pages.dev`:

См. [frontend/CLOUDFLARE_SETUP.md](./frontend/CLOUDFLARE_SETUP.md) → Решение 2

Это правильная архитектура для production:
- Frontend: `https://logsfucker.pages.dev/`
- API: `https://logsfucker.pages.dev/api/*`

Всё на одном домене, нет проблем с CORS.

---

## 📚 Дополнительно

- [CURRENT_SETUP.md](./CURRENT_SETUP.md) - текущая ситуация
- [frontend/CLOUDFLARE_SETUP.md](./frontend/CLOUDFLARE_SETUP.md) - детальная настройка
- [frontend/DEPLOYMENT.md](./frontend/DEPLOYMENT.md) - полный гайд по деплою

---

Made with 💜 and ⚡


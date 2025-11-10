# 🔧 Текущая настройка деплоя LogsFucker

## 📍 Текущие URL

- **Backend (production):** https://logsfucker.pages.dev/
- **Frontend (preview):** https://main.logsfucker.pages.dev/

## ⚠️ Проблема

Frontend деплоится как **preview** из ветки `main`, поэтому находится на поддомене `main.logsfucker.pages.dev`.

Backend находится на основном домене `logsfucker.pages.dev`.

Из-за этого API запросы с frontend на backend не работали (разные домены).

## ✅ Решение (применено)

Обновлены хуки `useStats` и `useLogs` для использования правильного API URL:

```typescript
// По умолчанию используется production backend
const apiUrl = import.meta.env.VITE_API_URL || 'https://logsfucker.pages.dev';
const response = await fetch(`${apiUrl}/api/stats?${params.toString()}`);
```

## 🚀 Что нужно сделать

### Вариант 1: Добавить Environment Variable (быстро)

В Cloudflare Pages для frontend проекта:

1. Settings → Environment variables
2. Добавить для **Production** и **Preview**:
   - Variable: `VITE_API_URL`
   - Value: `https://logsfucker.pages.dev`
3. Retry deployment

### Вариант 2: Объединить проекты (правильно)

См. [frontend/CLOUDFLARE_SETUP.md](./frontend/CLOUDFLARE_SETUP.md) для полной инструкции.

Коротко:
1. Настроить один проект для backend + frontend
2. Frontend статика из `frontend/dist/`
3. Backend Functions из `backend/functions/`
4. Оба на одном домене `logsfucker.pages.dev`

## 📝 После исправления

После применения одного из решений проверьте:

1. Откройте https://main.logsfucker.pages.dev/
2. Откройте DevTools → Network
3. Должны быть успешные запросы к:
   - `https://logsfucker.pages.dev/api/stats`
   - `https://logsfucker.pages.dev/api/logs`

## 📚 Документация

- [frontend/CLOUDFLARE_SETUP.md](./frontend/CLOUDFLARE_SETUP.md) - детальная инструкция
- [frontend/DEPLOYMENT.md](./frontend/DEPLOYMENT.md) - общий гайд по деплою
- [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - full-stack деплой

---

**Статус:** ⚠️ Требуется настройка Environment Variable в Cloudflare Pages

**Рекомендация:** Используйте Вариант 2 для production (единый проект)

---

Made with 💜 and ⚡


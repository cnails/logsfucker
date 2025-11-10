# 🔥 LogsFucker - Микросервис логов

```
 _                   _____           _             
| |                 |  ___|         | |            
| |     ___   __ _ ___\ `--. _   _  | | __ _ _ __  
| |    / _ \ / _` / __|`--. \ | | | | |/ _` | '__| 
| |___| (_) | (_| \__ /\__/ / |_| | | | (_| | |    
\_____/\___/ \__, |___\____/ \__,_| |_|\__,_|_|    
              __/ |                                 
             |___/                                  
```

**Full-stack приложение для сбора, хранения и анализа логов от веб-расширений.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)](https://www.cloudflare.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🚀 Быстрый старт

**Первый раз?** → [FIRST_RUN.md](./FIRST_RUN.md) 👈 Начните здесь!

**Опытный?** → [QUICKSTART.md](./QUICKSTART.md) ⚡ Запуск за 5 минут

**Разработчик?** → [DEV.md](./DEV.md) 🛠 Гайд по разработке

---

## 🏗 Архитектура проекта

```
logsfucker/
├── backend/           # Backend на Cloudflare Pages + D1
│   ├── functions/     # API endpoints
│   ├── migrations/    # SQL миграции
│   └── scripts/       # Утилиты
└── frontend/          # Frontend на React + TypeScript
    ├── src/
    │   ├── components/   # React компоненты
    │   ├── hooks/        # API хуки
    │   ├── pages/        # Страницы
    │   └── types/        # TypeScript типы
    └── public/
```

## 🚀 Быстрый старт

### Backend

```bash
cd backend
npm install
wrangler d1 create logs-db
# Обновите database_id в wrangler.toml
npm run d1:migrate
npm run dev
```

Подробнее: [backend/README.md](./backend/README.md)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на http://localhost:3000

Подробнее: [frontend/README.md](./frontend/README.md)

### Деплой

**Backend:**
```bash
cd backend
npm run deploy
```

**Frontend:**
См. подробную инструкцию в [frontend/DEPLOYMENT.md](./frontend/DEPLOYMENT.md)

Быстрый способ - подключите репозиторий к Cloudflare Pages!

## 📚 Документация

### Начало работы
- [WELCOME.md](./WELCOME.md) - приветствие 👋
- [FIRST_RUN.md](./FIRST_RUN.md) - первый запуск (пошагово)
- [QUICKSTART.md](./QUICKSTART.md) - быстрый старт за 5 минут
- [INSTALLATION.md](./INSTALLATION.md) - детальная установка

### Деплой
- [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - **полный гайд по деплою** 🚀
- [frontend/DEPLOYMENT.md](./frontend/DEPLOYMENT.md) - деплой frontend
- [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md) - деплой backend

### Разработка
- [DEV.md](./DEV.md) - руководство разработчика
- [Backend README](./backend/README.md) - документация API
- [Frontend README](./frontend/README.md) - документация интерфейса
- [CONTRIBUTING.md](./CONTRIBUTING.md) - как внести вклад

### Примеры
- [Integration Examples](./backend/INTEGRATION_EXAMPLES.md) - интеграция расширений
- [Frontend FEATURES](./frontend/FEATURES.md) - возможности интерфейса

## ✨ Возможности

### Backend
- 📥 Приём событий от веб-расширений
- 💾 Хранение в D1 (SQLite на Cloudflare)
- 🔍 Получение сырых логов с фильтрацией
- 📊 Агрегированная статистика по проектам
- 🚨 Выявление аномально активных IP
- ✅ Расчёт uptime (процент успешных событий)

### Frontend
- 🎨 Дерзкий дизайн в темных и фиолетовых тонах
- 🔍 Мощная фильтрация логов (проект, уровень, IP, время)
- 📊 Интерактивная панель статистики
- 🚨 Визуализация аномальных IP
- 📋 Таблица логов с цветовой индикацией
- ⚡ Быстрые временные фильтры (24ч, 7д, 30д)
- 📱 Адаптивный дизайн

## 🛠 Технологии

### Backend
- TypeScript
- Cloudflare Pages Functions
- Cloudflare D1 (SQLite)
- Wrangler CLI

### Frontend
- React 18 + TypeScript
- TailwindCSS (темная тема + фиолетовые акценты)
- Vite для быстрой разработки
- date-fns для работы с датами
- Строгая типизация TypeScript

## 📡 API Endpoints

### POST /api/logs
Приём логов от расширений.

### GET /api/logs
Получение логов с фильтрацией.

### GET /api/stats
Агрегированная статистика с определением аномалий.

Полная документация API: [backend/README.md](./backend/README.md)

## 🎁 Что включено

### ✅ Frontend (27 файлов)
- 4 React компонента (Filters, StatsPanel, AnomaliesTable, LogsTable)
- 2 API хука (useStats, useLogs)
- 1 страница Dashboard
- TypeScript типы для API
- Дизайн-система TailwindCSS
- Полная документация

### ✅ Backend (уже был)
- 2 API эндпоинта (logs, stats)
- D1 база данных (SQLite)
- SQL миграции
- Генератор тестовых данных

### ✅ Документация (10+ файлов)
- [WELCOME.md](./WELCOME.md) - приветствие 👋
- [FIRST_RUN.md](./FIRST_RUN.md) - первый запуск (пошагово)
- [QUICKSTART.md](./QUICKSTART.md) - быстрый старт (5 минут)
- [DEV.md](./DEV.md) - руководство разработчика
- [INSTALLATION.md](./INSTALLATION.md) - детальная установка
- [SUMMARY.md](./SUMMARY.md) - сводка проекта
- И многое другое...

## 🌟 Скриншоты

### Dashboard
> Дашборд с фильтрами, статистикой, аномалиями и логами в дерзком стиле

### Панель статистики
> Uptime, количество событий, ошибки, активные IP

### Аномальные IP
> Таблица с визуальной индикацией уровня угрозы

### Таблица логов
> Все логи с цветовой индикацией и метаданными

## 📊 Статистика проекта

- **Компонентов:** 4
- **API хуков:** 2
- **Страниц:** 1
- **Файлов:** 27+ (frontend)
- **Строк кода:** ~2000+
- **Технологий:** 8+
- **Документов:** 10+
- **Крутость:** 🔥🔥🔥

## 💬 Обратная связь

Есть вопросы или предложения? Создайте issue в репозитории!

## 📄 Лицензия

MIT - используйте свободно!

---

Made with 💜 and ⚡ by LogsFucker Team

**Версия:** 1.0.0  
**Дата:** 10 ноября 2025  
**Статус:** ✅ Готово к использованию

**Приятной работы!** 🚀

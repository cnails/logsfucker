# 🛠 Руководство разработчика

Это руководство для разработчиков, работающих над проектом LogsFucker.

## 🚀 Быстрый старт для разработки

### 1. Клонирование и установка

```bash
git clone <your-repo>
cd logsfucker

# Установка зависимостей для всего проекта
npm install

# Установка зависимостей для backend
cd backend
npm install
cd ..

# Установка зависимостей для frontend
cd frontend
npm install
cd ..
```

### 2. Настройка backend

```bash
cd backend

# Создание D1 базы данных
wrangler d1 create logs-db

# Обновите database_id в wrangler.toml
# Примените миграции
npm run d1:migrate
```

### 3. Запуск в режиме разработки

#### Вариант 1: Запуск обоих сервисов одновременно (рекомендуется)

Из корневой папки проекта:

```bash
npm run dev
```

Это запустит:
- Backend на http://localhost:8787
- Frontend на http://localhost:3000

#### Вариант 2: Запуск по отдельности

**Терминал 1 - Backend:**
```bash
cd backend
npm run dev
```

**Терминал 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 📁 Структура проекта

```
logsfucker/
├── backend/                    # Backend на Cloudflare
│   ├── functions/api/
│   │   ├── logs.ts            # Эндпоинты логов
│   │   └── stats.ts           # Эндпоинты статистики
│   ├── migrations/
│   │   └── 0001_init.sql      # Миграции БД
│   ├── scripts/
│   │   └── generate-test-data.js  # Генератор тестовых данных
│   └── wrangler.toml          # Конфиг Cloudflare Workers
│
├── frontend/                   # Frontend на React + TypeScript
│   ├── src/
│   │   ├── components/        # React компоненты
│   │   │   ├── Filters.tsx    # Компонент фильтров
│   │   │   ├── StatsPanel.tsx # Панель статистики
│   │   │   ├── AnomaliesTable.tsx  # Таблица аномалий
│   │   │   └── LogsTable.tsx  # Таблица логов
│   │   ├── hooks/             # Кастомные хуки
│   │   │   ├── useStats.ts    # Хук для статистики
│   │   │   └── useLogs.ts     # Хук для логов
│   │   ├── pages/
│   │   │   └── Dashboard.tsx  # Главная страница
│   │   ├── types/
│   │   │   └── api.ts         # TypeScript типы
│   │   └── utils/
│   │       └── date.ts        # Утилиты для дат
│   ├── vite.config.ts         # Конфиг Vite
│   └── tailwind.config.js     # Конфиг TailwindCSS
│
├── QUICKSTART.md              # Быстрый старт
├── CONTRIBUTING.md            # Гайд по контрибьютингу
└── package.json               # Главный package.json
```

## 🎨 Frontend - Детали разработки

### Стек технологий

- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Сборщик
- **TailwindCSS** - Стилизация
- **date-fns** - Работа с датами

### Дизайн-система

#### Цвета

```typescript
// Primary (Фиолетовый)
primary-500: '#8b5cf6'
primary-600: '#7c3aed'
primary-700: '#6d28d9'

// Dark (Серый)
dark-50: '#18181b'
dark-100: '#27272a'
dark-200: '#3f3f46'

// Состояния
info: синий
warn: желтый
error: красный
success: зеленый
```

#### Компоненты

Все компоненты следуют единому стилю:
- Закругленные углы (`rounded-lg`)
- Тени для глубины (`shadow-xl`)
- Бордеры (`border border-primary-900/30`)
- Hover эффекты
- Анимации для загрузки

### Добавление нового компонента

```typescript
// src/components/MyComponent.tsx
interface MyComponentProps {
  data: any;
}

export function MyComponent({ data }: MyComponentProps) {
  return (
    <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-primary-900/30">
      <h2 className="text-2xl font-bold text-primary-400 mb-4">
        Заголовок
      </h2>
      {/* Ваш контент */}
    </div>
  );
}
```

### Создание нового хука

```typescript
// src/hooks/useMyData.ts
import { useState, useEffect } from 'react';

export function useMyData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/my-endpoint');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
```

## 🔧 Backend - Детали разработки

### Структура эндпоинтов

```typescript
// functions/api/my-endpoint.ts
export async function onRequestGet(context: any) {
  const { request, env } = context;
  
  try {
    // Ваша логика
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### Работа с D1

```typescript
const result = await env.DB.prepare(
  'SELECT * FROM logs WHERE extension_name = ?'
).bind(extensionName).all();

const logs = result.results;
```

### Тестирование API

```bash
# Отправка тестового лога
curl -X POST http://localhost:8787/api/logs \
  -H "Content-Type: application/json" \
  -d '{"extensionName": "test", "level": "info", "message": "Hello"}'

# Получение логов
curl http://localhost:8787/api/logs?limit=10

# Получение статистики
curl http://localhost:8787/api/stats
```

## 🧪 Генерация тестовых данных

```bash
cd backend
node scripts/generate-test-data.js
```

Это создаст:
- Несколько проектов (extensions)
- Логи разных уровней
- Аномальные IP для тестирования

## 📦 Сборка для продакшена

### Backend

```bash
cd backend
npm run deploy
```

### Frontend

```bash
cd frontend
npm run build
```

Результат будет в `frontend/dist/`

## 🐛 Отладка

### Backend

```bash
# Логи в режиме разработки
cd backend
npm run dev
# Логи будут в консоли
```

### Frontend

- Используйте React DevTools
- Используйте `console.log()` в компонентах
- Проверяйте Network tab для API запросов

## 🔍 Линтинг

### Frontend

```bash
cd frontend
npm run lint
```

### Backend

Backend использует TypeScript компилятор для проверки типов.

## 🎯 Best Practices

### Frontend

1. **Используйте TypeScript** - всегда типизируйте данные
2. **Разбивайте компоненты** - один компонент = одна задача
3. **Используйте хуки** - переиспользуйте логику
4. **Следуйте дизайн-системе** - используйте существующие цвета и стили
5. **Добавляйте loading/error состояния** - всегда обрабатывайте асинхронность

### Backend

1. **Валидируйте входные данные** - не доверяйте пользовательскому вводу
2. **Обрабатывайте ошибки** - всегда возвращайте понятные сообщения
3. **Используйте prepared statements** - защита от SQL injection
4. **Добавляйте CORS заголовки** - для работы с frontend

## 🚀 Деплой

### Cloudflare Pages (Backend)

```bash
cd backend
npm run deploy
```

### Cloudflare Pages (Frontend)

1. Подключите репозиторий к Cloudflare Pages
2. Настройте:
   - Build command: `cd frontend && npm install && npm run build`
   - Build output directory: `frontend/dist`
3. Деплой!

## 📝 Чек-лист перед коммитом

- [ ] Код прошел линтинг
- [ ] TypeScript не выдает ошибок
- [ ] Все компоненты работают
- [ ] API эндпоинты отвечают корректно
- [ ] Код задокументирован
- [ ] Тесты пройдены (если есть)

## 🤝 Contributing

См. [CONTRIBUTING.md](./CONTRIBUTING.md) для деталей.

## 💬 Вопросы?

Создайте issue в репозитории!

---

Made with 💜 and ⚡ by LogsFucker Team


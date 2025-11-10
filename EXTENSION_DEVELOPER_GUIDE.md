# 📚 Руководство для разработчиков расширений

Это руководство поможет правильно интегрировать LogsFucker API в ваше веб-расширение для эффективного сбора и анализа логов.

## 🎯 Основные принципы

### 1. Не логируйте всё подряд

**❌ Плохо:**
```javascript
// Логирование каждого клика
document.addEventListener('click', () => {
  sendLog('info', 'User clicked');
});
```

**✅ Хорошо:**
```javascript
// Логирование только важных событий
button.addEventListener('click', () => {
  sendLog('info', 'Settings saved', { 
    settingsChanged: ['theme', 'language'] 
  });
});
```

### 2. Используйте правильные уровни логов

| Уровень | Когда использовать | Примеры |
|---------|-------------------|---------|
| `info` | Обычные события | Вход пользователя, сохранение настроек |
| `warning` | Потенциальные проблемы | Медленный API, устаревшие данные |
| `error` | Ошибки и исключения | Сбои запросов, невалидные данные |
| `debug` | Отладочная информация | Состояние переменных (только в dev) |

### 3. Добавляйте контекст в meta

**❌ Плохо:**
```javascript
sendLog('error', 'Request failed');
```

**✅ Хорошо:**
```javascript
sendLog('error', 'API request failed', {
  endpoint: '/api/users',
  statusCode: 500,
  duration: 3500,
  retryCount: 2,
  errorCode: 'TIMEOUT'
});
```

## 📝 Правила отправки логов

### Обязательные поля

```typescript
interface LogPayload {
  extensionName: string;  // ОБЯЗАТЕЛЬНО: уникальное имя вашего расширения
  message: string;        // ОБЯЗАТЕЛЬНО: описание события
  level?: string;         // Опционально: 'info' | 'warning' | 'error' | 'debug'
  meta?: object;          // Опционально: дополнительные данные
  ts?: number;           // Опционально: timestamp в миллисекундах
}
```

### Рекомендации по полям

#### extensionName
- Используйте kebab-case: `my-awesome-extension`
- Не меняйте между версиями
- Уникальное для вашего расширения
- Без спецсимволов, только буквы, цифры и дефис

```javascript
// ✅ Хорошо
extensionName: 'ad-blocker-pro'

// ❌ Плохо
extensionName: 'AdBlocker Pro v2.0!!!'
```

#### message
- Короткое и ясное описание события
- На английском языке (для совместимости)
- Без конфиденциальных данных
- Максимум 200 символов

```javascript
// ✅ Хорошо
message: 'User authenticated successfully'
message: 'Failed to load settings from storage'

// ❌ Плохо
message: 'User john@email.com logged in with password 123456'
message: 'Something happened idk what lol'
```

#### level
- По умолчанию `'info'` если не указан
- Используйте согласно таблице выше

#### meta
- Любой сериализуемый JSON объект
- Избегайте циклических ссылок
- Не передавайте функции или DOM элементы
- Ограничьте размер до ~10KB

```javascript
// ✅ Хорошо
meta: {
  userId: 123,
  action: 'click',
  target: 'submit-button',
  timestamp: Date.now()
}

// ❌ Плохо
meta: {
  element: document.getElementById('btn'), // DOM элемент
  callback: () => {},                       // Функция
  hugeArray: Array(10000).fill('data')     // Слишком много данных
}
```

#### ts
- Timestamp в миллисекундах
- Если не указан, сервер использует текущее время
- Полезно для offline логирования

```javascript
// ✅ Хорошо
ts: Date.now()
ts: 1699999999999

// ❌ Плохо
ts: Date.now() / 1000  // Секунды, а не миллисекунды
ts: new Date()         // Объект Date, а не число
```

## 🔧 Реализация логгера

### Базовая реализация

```javascript
class ExtensionLogger {
  constructor(extensionName, apiUrl) {
    this.extensionName = extensionName;
    this.apiUrl = apiUrl;
    this.isProduction = !chrome.runtime.getManifest().name.includes('dev');
  }

  async send(level, message, meta = {}) {
    // В development дублируем в консоль
    if (!this.isProduction) {
      console.log(`[${level.toUpperCase()}]`, message, meta);
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extensionName: this.extensionName,
          level,
          message,
          meta: {
            ...meta,
            version: chrome.runtime.getManifest().version,
            browser: this.detectBrowser()
          },
          ts: Date.now()
        })
      });

      if (!response.ok) {
        console.error('Failed to send log:', await response.text());
      }
    } catch (error) {
      // Важно: не падать если логирование не работает
      console.error('Logger error:', error);
    }
  }

  detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Edg')) return 'edge';
    if (ua.includes('Chrome')) return 'chrome';
    return 'unknown';
  }

  info(msg, meta) { return this.send('info', msg, meta); }
  warning(msg, meta) { return this.send('warning', msg, meta); }
  error(msg, meta) { return this.send('error', msg, meta); }
  debug(msg, meta) { 
    // Debug логи только в development
    if (!this.isProduction) {
      return this.send('debug', msg, meta);
    }
  }
}

// Использование
const logger = new ExtensionLogger(
  'my-extension',
  'https://your-project.pages.dev'
);
```

### Продвинутая реализация с очередью

```javascript
class QueuedLogger extends ExtensionLogger {
  constructor(extensionName, apiUrl, options = {}) {
    super(extensionName, apiUrl);
    this.queue = [];
    this.maxQueueSize = options.maxQueueSize || 100;
    this.flushInterval = options.flushInterval || 5000; // 5 сек
    this.sending = false;

    // Автоматическая отправка по интервалу
    setInterval(() => this.flush(), this.flushInterval);

    // Отправить логи при закрытии расширения
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  async send(level, message, meta = {}) {
    this.queue.push({
      extensionName: this.extensionName,
      level,
      message,
      meta: {
        ...meta,
        version: chrome.runtime.getManifest().version,
        browser: this.detectBrowser()
      },
      ts: Date.now()
    });

    // Если очередь переполнена, сбросить старые логи
    if (this.queue.length > this.maxQueueSize) {
      this.queue = this.queue.slice(-this.maxQueueSize);
    }

    // Если много логов, отправить немедленно
    if (this.queue.length >= 10) {
      await this.flush();
    }
  }

  async flush() {
    if (this.sending || this.queue.length === 0) return;

    this.sending = true;
    const logsToSend = [...this.queue];
    this.queue = [];

    for (const log of logsToSend) {
      try {
        await fetch(`${this.apiUrl}/api/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log)
        });
      } catch (error) {
        // Вернуть в очередь при ошибке
        this.queue.unshift(log);
        break;
      }
    }

    this.sending = false;
  }
}
```

## 📊 Что логировать

### ✅ Рекомендуется логировать

1. **Жизненный цикл расширения**
   ```javascript
   chrome.runtime.onInstalled.addListener((details) => {
     logger.info('Extension installed', { 
       reason: details.reason,
       version: chrome.runtime.getManifest().version
     });
   });

   chrome.runtime.onStartup.addListener(() => {
     logger.info('Extension started');
   });
   ```

2. **Ошибки и исключения**
   ```javascript
   try {
     await riskyOperation();
   } catch (error) {
     logger.error('Operation failed', {
       operation: 'riskyOperation',
       error: error.message,
       stack: error.stack
     });
   }
   ```

3. **Важные пользовательские действия**
   ```javascript
   saveButton.addEventListener('click', async () => {
     logger.info('User saved settings', {
       settingsCount: Object.keys(newSettings).length
     });
   });
   ```

4. **API запросы (особенно неудачные)**
   ```javascript
   const response = await fetch(url);
   if (!response.ok) {
     logger.warning('API request failed', {
       url,
       status: response.status,
       statusText: response.statusText
     });
   }
   ```

5. **Производительность**
   ```javascript
   const start = Date.now();
   await heavyOperation();
   const duration = Date.now() - start;
   
   if (duration > 1000) {
     logger.warning('Slow operation detected', {
       operation: 'heavyOperation',
       duration,
       threshold: 1000
     });
   }
   ```

### ❌ НЕ логируйте

1. **Конфиденциальные данные**
   - Пароли
   - Токены авторизации
   - Приватные API ключи
   - Персональные данные (email, телефон, адреса)
   - Платежная информация

2. **Слишком частые события**
   - Движения мыши
   - Скроллинг
   - Каждое изменение input поля
   - Таймеры каждую секунду

3. **Избыточные данные**
   - Весь DOM
   - Большие объекты (>10KB)
   - Бинарные данные
   - Циклические структуры

## 🎯 Примеры использования

### Chrome Extension (Manifest V3)

```javascript
// background.js
const logger = new QueuedLogger(
  'my-chrome-extension',
  'https://your-project.pages.dev'
);

// Старт расширения
chrome.runtime.onInstalled.addListener(async (details) => {
  await logger.info('Extension installed', {
    reason: details.reason,
    previousVersion: details.previousVersion
  });
});

// Обработка сообщений от content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ERROR') {
    logger.error(message.error, {
      tabId: sender.tab?.id,
      url: sender.tab?.url
    });
  }
});

// Обработка ошибок
self.addEventListener('error', (event) => {
  logger.error('Unhandled error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});
```

```javascript
// content.js
try {
  const data = await fetchData();
  processData(data);
} catch (error) {
  // Отправить ошибку в background
  chrome.runtime.sendMessage({
    type: 'ERROR',
    error: error.message,
    stack: error.stack,
    url: window.location.href
  });
}
```

### Firefox Add-on

```javascript
// background.js
browser.runtime.onInstalled.addListener(async () => {
  await logger.info('Add-on installed', {
    browser: 'firefox',
    version: browser.runtime.getManifest().version
  });
});

browser.tabs.onCreated.addListener(async (tab) => {
  await logger.info('Tab created', {
    tabId: tab.id,
    url: tab.url
  });
});
```

## 🔒 Безопасность и приватность

### 1. Фильтруйте конфиденциальные данные

```javascript
function sanitizeMeta(meta) {
  const sensitive = ['password', 'token', 'apiKey', 'secret', 'email'];
  const sanitized = { ...meta };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Использование
logger.info('User logged in', sanitizeMeta(userData));
```

### 2. Получайте согласие пользователя

```javascript
// Перед отправкой логов
const settings = await chrome.storage.sync.get(['telemetryEnabled']);

if (settings.telemetryEnabled) {
  logger.info('Feature used', { feature: 'exportData' });
}
```

### 3. Предоставьте опцию отключения

```html
<!-- popup.html -->
<label>
  <input type="checkbox" id="telemetry">
  Отправлять анонимную телеметрию для улучшения расширения
</label>
```

## ⚡ Оптимизация производительности

### 1. Батчинг логов

Отправляйте логи группами, а не по одному:

```javascript
// Вместо немедленной отправки
logger.info('Event 1');
logger.info('Event 2');
logger.info('Event 3');

// Используйте очередь (QueuedLogger из примера выше)
```

### 2. Не блокируйте UI

```javascript
// ✅ Асинхронно, без await
button.addEventListener('click', () => {
  logger.info('Button clicked'); // Не блокирует
  doSomething();
});

// ❌ Синхронно, блокирует UI
button.addEventListener('click', async () => {
  await logger.info('Button clicked'); // Блокирует!
  doSomething();
});
```

### 3. Ограничьте частоту

```javascript
// Дебаунсинг для частых событий
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    logger.info('Search performed', { query: e.target.value });
  }, 500);
});
```

## 📈 Мониторинг и отладка

### Проверка отправки логов

```javascript
class DebugLogger extends ExtensionLogger {
  async send(level, message, meta = {}) {
    console.log('📤 Sending log:', { level, message, meta });
    
    const start = Date.now();
    await super.send(level, message, meta);
    const duration = Date.now() - start;
    
    console.log(`✅ Log sent in ${duration}ms`);
  }
}
```

### Статистика логирования

```javascript
class StatsLogger extends ExtensionLogger {
  constructor(...args) {
    super(...args);
    this.stats = { info: 0, warning: 0, error: 0, debug: 0 };
  }

  async send(level, message, meta = {}) {
    this.stats[level]++;
    await super.send(level, message, meta);
  }

  getStats() {
    return { ...this.stats };
  }

  resetStats() {
    this.stats = { info: 0, warning: 0, error: 0, debug: 0 };
  }
}
```

## 🎓 Лучшие практики

1. **Используйте один экземпляр логгера**
   ```javascript
   // logger.js
   export const logger = new QueuedLogger('my-extension', API_URL);
   
   // В других файлах
   import { logger } from './logger';
   ```

2. **Добавляйте версию расширения**
   ```javascript
   meta: {
     version: chrome.runtime.getManifest().version
   }
   ```

3. **Логируйте только в production**
   ```javascript
   const isDev = chrome.runtime.getManifest().name.includes('dev');
   if (!isDev) {
     logger.info('Event happened');
   }
   ```

4. **Обрабатывайте ошибки логгера**
   ```javascript
   try {
     await logger.info('Event');
   } catch (error) {
     // Логгер не должен ломать приложение
     console.error('Logger failed:', error);
   }
   ```

5. **Используйте типизацию TypeScript**
   ```typescript
   interface LogMeta {
     userId?: number;
     action?: string;
     [key: string]: any;
   }
   
   logger.info('Event', { userId: 123, action: 'click' } as LogMeta);
   ```

## 📚 Дополнительные ресурсы

- [Backend API Documentation](./backend/README.md)
- [Integration Examples](./backend/INTEGRATION_EXAMPLES.md)
- [Frontend Dashboard](./frontend/README.md)

## 💡 Нужна помощь?

Создайте issue в репозитории с тегом `extension-integration`.

---

**Версия документа:** 1.0  
**Последнее обновление:** 10 ноября 2025


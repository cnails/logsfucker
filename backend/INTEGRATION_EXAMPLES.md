# 🔌 Примеры интеграции

Примеры использования LogsFucker API в различных сценариях.

## Chrome Extension (Manifest V3)

### background.js

```javascript
// Конфигурация
const API_URL = 'https://your-project.pages.dev/api/logs';
const EXTENSION_NAME = 'my-chrome-extension';

// Логгер
class Logger {
  constructor(extensionName, apiUrl) {
    this.extensionName = extensionName;
    this.apiUrl = apiUrl;
  }

  async send(level, message, meta = {}) {
    try {
      await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extensionName: this.extensionName,
          level,
          message,
          meta,
          ts: Date.now(),
        }),
      });
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  }

  info(message, meta) { return this.send('info', message, meta); }
  error(message, meta) { return this.send('error', message, meta); }
  warning(message, meta) { return this.send('warning', message, meta); }
  debug(message, meta) { return this.send('debug', message, meta); }
}

const logger = new Logger(EXTENSION_NAME, API_URL);

// Использование
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await logger.info('Extension installed', { version: chrome.runtime.getManifest().version });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  await logger.info('Extension icon clicked', { tabId: tab.id, url: tab.url });
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === 'LOG_ERROR') {
    await logger.error(message.message, {
      ...message.meta,
      tabId: sender.tab?.id,
    });
  }
});
```

### content.js

```javascript
// Отправка логов из content script
try {
  // Ваш код
  doSomething();
} catch (error) {
  chrome.runtime.sendMessage({
    type: 'LOG_ERROR',
    message: error.message,
    meta: {
      stack: error.stack,
      url: window.location.href,
    },
  });
}
```

### manifest.json

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }],
  "permissions": ["storage", "tabs"],
  "host_permissions": ["https://your-project.pages.dev/*"]
}
```

## Firefox Add-on

### logger.js (ES Module)

```javascript
export class Logger {
  constructor(extensionName, apiUrl) {
    this.extensionName = extensionName;
    this.apiUrl = apiUrl;
    this.queue = [];
    this.sending = false;
  }

  async send(level, message, meta = {}) {
    const log = {
      extensionName: this.extensionName,
      level,
      message,
      meta,
      ts: Date.now(),
    };

    this.queue.push(log);
    await this.flush();
  }

  async flush() {
    if (this.sending || this.queue.length === 0) return;

    this.sending = true;

    while (this.queue.length > 0) {
      const log = this.queue.shift();
      
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log),
        });

        if (!response.ok) {
          console.error('Failed to send log:', await response.text());
          // Вернуть в очередь для повтора
          this.queue.unshift(log);
          break;
        }
      } catch (error) {
        console.error('Network error:', error);
        // Вернуть в очередь
        this.queue.unshift(log);
        break;
      }
    }

    this.sending = false;
  }

  info(message, meta) { return this.send('info', message, meta); }
  error(message, meta) { return this.send('error', message, meta); }
  warning(message, meta) { return this.send('warning', message, meta); }
  debug(message, meta) { return this.send('debug', message, meta); }
}
```

## React App Integration

### useLogger.ts (React Hook)

```typescript
import { useCallback, useRef } from 'react';

interface LogMeta {
  [key: string]: any;
}

interface Logger {
  info: (message: string, meta?: LogMeta) => Promise<void>;
  error: (message: string, meta?: LogMeta) => Promise<void>;
  warning: (message: string, meta?: LogMeta) => Promise<void>;
  debug: (message: string, meta?: LogMeta) => Promise<void>;
}

export function useLogger(extensionName: string, apiUrl: string): Logger {
  const apiUrlRef = useRef(apiUrl);
  const extensionNameRef = useRef(extensionName);

  const send = useCallback(
    async (level: string, message: string, meta: LogMeta = {}) => {
      try {
        await fetch(`${apiUrlRef.current}/api/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            extensionName: extensionNameRef.current,
            level,
            message,
            meta,
            ts: Date.now(),
          }),
        });
      } catch (error) {
        console.error('Failed to send log:', error);
      }
    },
    []
  );

  return {
    info: useCallback((msg, meta) => send('info', msg, meta), [send]),
    error: useCallback((msg, meta) => send('error', msg, meta), [send]),
    warning: useCallback((msg, meta) => send('warning', msg, meta), [send]),
    debug: useCallback((msg, meta) => send('debug', msg, meta), [send]),
  };
}

// Использование в компоненте
function MyComponent() {
  const logger = useLogger('my-react-app', 'https://your-project.pages.dev');

  const handleClick = async () => {
    await logger.info('Button clicked', { buttonId: 'submit' });
    
    try {
      await fetchData();
    } catch (error) {
      await logger.error('Failed to fetch data', {
        error: error.message,
        stack: error.stack,
      });
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Node.js / Express.js

### logger-middleware.js

```javascript
const fetch = require('node-fetch');

class LogsMiddleware {
  constructor(extensionName, apiUrl) {
    this.extensionName = extensionName;
    this.apiUrl = apiUrl;
  }

  // Middleware для логирования всех запросов
  requestLogger() {
    return async (req, res, next) => {
      const startTime = Date.now();

      // Перехватываем res.send
      const originalSend = res.send;
      res.send = function (data) {
        res.send = originalSend;
        
        const duration = Date.now() - startTime;
        const level = res.statusCode >= 400 ? 'error' : 'info';

        // Отправляем лог асинхронно
        fetch(`${this.apiUrl}/api/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            extensionName: this.extensionName,
            level,
            message: `${req.method} ${req.path}`,
            meta: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              duration,
              ip: req.ip,
              userAgent: req.get('user-agent'),
            },
            ts: Date.now(),
          }),
        }).catch(err => console.error('Failed to send log:', err));

        return res.send(data);
      }.bind(this);

      next();
    };
  }

  // Middleware для логирования ошибок
  errorLogger() {
    return async (err, req, res, next) => {
      await fetch(`${this.apiUrl}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extensionName: this.extensionName,
          level: 'error',
          message: err.message,
          meta: {
            stack: err.stack,
            method: req.method,
            path: req.path,
            ip: req.ip,
          },
          ts: Date.now(),
        }),
      }).catch(console.error);

      next(err);
    };
  }
}

// Использование
const express = require('express');
const app = express();

const logsMiddleware = new LogsMiddleware(
  'my-express-app',
  'https://your-project.pages.dev'
);

app.use(logsMiddleware.requestLogger());

// ... ваши роуты ...

app.use(logsMiddleware.errorLogger());
```

## Vue.js Plugin

### logger-plugin.js

```javascript
export default {
  install(app, options) {
    const { extensionName, apiUrl } = options;

    const logger = {
      async send(level, message, meta = {}) {
        try {
          await fetch(`${apiUrl}/api/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              extensionName,
              level,
              message,
              meta,
              ts: Date.now(),
            }),
          });
        } catch (error) {
          console.error('Failed to send log:', error);
        }
      },
      info(message, meta) { return this.send('info', message, meta); },
      error(message, meta) { return this.send('error', message, meta); },
      warning(message, meta) { return this.send('warning', message, meta); },
      debug(message, meta) { return this.send('debug', message, meta); },
    };

    // Глобальное свойство
    app.config.globalProperties.$logger = logger;

    // Provide/inject
    app.provide('logger', logger);

    // Глобальный обработчик ошибок
    app.config.errorHandler = (err, instance, info) => {
      logger.error(err.message, {
        stack: err.stack,
        componentName: instance?.$options?.name,
        info,
      });
    };
  },
};

// main.js
import { createApp } from 'vue';
import App from './App.vue';
import LoggerPlugin from './logger-plugin';

const app = createApp(App);

app.use(LoggerPlugin, {
  extensionName: 'my-vue-app',
  apiUrl: 'https://your-project.pages.dev',
});

app.mount('#app');

// Использование в компоненте
export default {
  setup() {
    const logger = inject('logger');

    const handleClick = async () => {
      await logger.info('Button clicked', { component: 'MyComponent' });
    };

    return { handleClick };
  },
};
```

## Batch Logging (массовая отправка)

Для оптимизации производительности можно группировать логи:

```javascript
class BatchLogger {
  constructor(extensionName, apiUrl, options = {}) {
    this.extensionName = extensionName;
    this.apiUrl = apiUrl;
    this.batchSize = options.batchSize || 10;
    this.flushInterval = options.flushInterval || 5000; // 5 секунд
    this.queue = [];
    
    // Автоматическая отправка по интервалу
    setInterval(() => this.flush(), this.flushInterval);
  }

  add(level, message, meta = {}) {
    this.queue.push({
      extensionName: this.extensionName,
      level,
      message,
      meta,
      ts: Date.now(),
    });

    // Если накопилось достаточно логов, отправляем
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);

    // Отправляем каждый лог последовательно
    // (в production можно использовать Promise.allSettled)
    for (const log of batch) {
      try {
        await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log),
        });
      } catch (error) {
        console.error('Failed to send log:', error);
      }
    }
  }

  info(message, meta) { this.add('info', message, meta); }
  error(message, meta) { this.add('error', message, meta); }
  warning(message, meta) { this.add('warning', message, meta); }
  debug(message, meta) { this.add('debug', message, meta); }
}
```

## Environment-aware Logger

Логирование только в production:

```javascript
class SmartLogger {
  constructor(extensionName, apiUrl, environment = 'production') {
    this.extensionName = extensionName;
    this.apiUrl = apiUrl;
    this.environment = environment;
    this.isProduction = environment === 'production';
  }

  async send(level, message, meta = {}) {
    // В development только console.log
    if (!this.isProduction) {
      console.log(`[${level.toUpperCase()}]`, message, meta);
      return;
    }

    // В production отправляем на сервер
    try {
      await fetch(`${this.apiUrl}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extensionName: this.extensionName,
          level,
          message,
          meta: {
            ...meta,
            environment: this.environment,
            userAgent: navigator.userAgent,
            url: window.location.href,
          },
          ts: Date.now(),
        }),
      });
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  }

  info(message, meta) { return this.send('info', message, meta); }
  error(message, meta) { return this.send('error', message, meta); }
  warning(message, meta) { return this.send('warning', message, meta); }
  debug(message, meta) { return this.send('debug', message, meta); }
}

// Использование
const logger = new SmartLogger(
  'my-app',
  'https://your-project.pages.dev',
  process.env.NODE_ENV // 'development' | 'production'
);
```

---

💡 **Совет**: Всегда оборачивайте отправку логов в try/catch, чтобы ошибки логирования не ломали ваше приложение!


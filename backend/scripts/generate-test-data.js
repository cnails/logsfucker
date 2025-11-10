#!/usr/bin/env node

/**
 * Скрипт для генерации тестовых данных в API логов
 * Использование:
 *   node scripts/generate-test-data.js [API_URL] [COUNT]
 * 
 * Пример:
 *   node scripts/generate-test-data.js http://localhost:8788 100
 *   node scripts/generate-test-data.js https://your-project.pages.dev 50
 */

const API_URL = process.argv[2] || 'http://localhost:8788';
const COUNT = parseInt(process.argv[3] || '20', 10);

const extensions = [
  'chrome-addon-v1',
  'firefox-plugin-beta',
  'edge-extension',
  'safari-helper',
  'universal-tracker'
];

const levels = ['info', 'error', 'warning', 'debug'];

const messages = [
  'User logged in successfully',
  'Failed to fetch user data',
  'API request completed',
  'Connection timeout',
  'Cache cleared',
  'Settings updated',
  'File uploaded',
  'Download started',
  'Network error occurred',
  'Authentication successful',
  'Session expired',
  'Data synchronized',
  'Error parsing response',
  'Background task completed',
  'Memory usage high'
];

const metaExamples = [
  { userId: 123, action: 'click', target: 'button' },
  { endpoint: '/api/users', status: 200, duration: 145 },
  { error: 'NETWORK_ERROR', code: 'ERR_CONNECTION_REFUSED' },
  { cacheSize: 1024, itemsCleared: 42 },
  { fileSize: 2048576, fileName: 'document.pdf' },
  { sessionId: 'abc123', lastSeen: Date.now() - 3600000 },
  { memoryUsage: 85.5, threshold: 80 },
  { retryCount: 3, maxRetries: 5 }
];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sendLog(extensionName, level, message, meta) {
  try {
    const response = await fetch(`${API_URL}/api/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        extensionName,
        level,
        message,
        meta,
        ts: Date.now() - randomInt(0, 24 * 60 * 60 * 1000), // случайное время в последние 24ч
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Failed to send log: ${error}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`❌ Network error: ${error.message}`);
    return false;
  }
}

async function generateTestData() {
  console.log(`🔥 Generating ${COUNT} test logs...`);
  console.log(`📡 API URL: ${API_URL}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < COUNT; i++) {
    const extensionName = randomItem(extensions);
    const level = randomItem(levels);
    const message = randomItem(messages);
    const meta = randomItem(metaExamples);

    const success = await sendLog(extensionName, level, message, meta);

    if (success) {
      successCount++;
      process.stdout.write(`✅ ${i + 1}/${COUNT}\r`);
    } else {
      errorCount++;
      console.log(`❌ Failed: ${i + 1}/${COUNT}`);
    }

    // Небольшая задержка для избежания rate limit
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n');
  console.log('📊 Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Failed: ${errorCount}`);
  console.log(`  📈 Total: ${COUNT}`);
  console.log('');
  console.log(`🌐 Check stats: ${API_URL}/api/stats`);
  console.log(`📋 View logs: ${API_URL}/api/logs?limit=100`);
}

// Проверка доступности fetch API
if (typeof fetch === 'undefined') {
  console.error('❌ Error: fetch is not available');
  console.error('Please use Node.js 18+ or install node-fetch');
  process.exit(1);
}

generateTestData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


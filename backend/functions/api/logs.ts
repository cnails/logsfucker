/**
 * API для работы с логами
 * Endpoints:
 * - POST /api/logs - приём логов от расширений
 * - GET /api/logs - получение логов с фильтрами
 * - OPTIONS /api/logs - CORS preflight
 */

// Типы для Cloudflare Pages Functions и D1
type PagesFunction<Env = unknown> = (context: {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
}) => Response | Promise<Response>;

interface Env {
  DB: D1Database;
}

interface LogRow {
  id: number;
  extension_name: string;
  level: string;
  message: string;
  meta: string | null;
  ip: string | null;
  created_at: number;
}

interface IncomingLog {
  extensionName: string;
  level?: string;
  message: string;
  meta?: object;
  ts?: number;
}

// Вспомогательная функция для добавления CORS заголовков
function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };
}

/**
 * POST /api/logs - приём логов от расширений
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    // Проверяем наличие DB биндинга
    if (!env || !env.DB) {
      console.error('DB binding is not available. env:', env);
      return new Response(
        JSON.stringify({ 
          error: 'Database binding not configured',
          details: 'DB binding is missing or not properly configured in Cloudflare Pages'
        }),
        { status: 500, headers: corsHeaders() }
      );
    }

    // Парсим JSON из body
    let body: IncomingLog;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'invalid json or server error' }),
        { status: 500, headers: corsHeaders() }
      );
    }

    // Валидация обязательных полей
    if (!body.extensionName || !body.message) {
      return new Response(
        JSON.stringify({ error: 'extensionName and message are required' }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Устанавливаем значения по умолчанию
    const level = body.level || 'info';
    const ts = body.ts || Date.now();
    
    // Сериализация meta
    let metaString: string | null = null;
    if (body.meta && typeof body.meta === 'object') {
      try {
        metaString = JSON.stringify(body.meta);
      } catch (e) {
        // Если не удалось сериализовать meta, оставляем null
        console.error('Failed to serialize meta:', e);
      }
    }

    // Определяем IP пользователя
    let ip: string | null = null;
    ip = request.headers.get('CF-Connecting-IP');
    if (!ip) {
      ip = request.headers.get('x-forwarded-for');
    }
    if (!ip) {
      ip = request.headers.get('remote-addr');
    }

    // Вставляем запись в БД
    try {
      await env.DB.prepare(
        'INSERT INTO logs (extension_name, level, message, meta, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(body.extensionName, level, body.message, metaString, ip, ts)
        .run();

      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: corsHeaders() }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'invalid json or server error' }),
        { status: 500, headers: corsHeaders() }
      );
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/logs:', error);
    return new Response(
      JSON.stringify({ error: 'invalid json or server error' }),
      { status: 500, headers: corsHeaders() }
    );
  }
};

/**
 * GET /api/logs - получение логов с фильтрами
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    // Проверяем наличие DB биндинга
    if (!env || !env.DB) {
      console.error('DB binding is not available. env:', env);
      return new Response(
        JSON.stringify({ 
          error: 'Database binding not configured',
          details: 'DB binding is missing or not properly configured in Cloudflare Pages'
        }),
        { status: 500, headers: corsHeaders() }
      );
    }

    const url = new URL(request.url);
    const params = url.searchParams;

    // Читаем параметры
    const extensionName = params.get('extensionName');
    const level = params.get('level');
    const ip = params.get('ip');
    const fromParam = params.get('from');
    const toParam = params.get('to');
    const limitParam = params.get('limit');

    // Преобразуем числовые параметры
    let from: number | null = null;
    let to: number | null = null;
    let limit = 100; // по умолчанию

    if (fromParam) {
      from = Number(fromParam);
      if (isNaN(from)) {
        return new Response(
          JSON.stringify({ error: 'Invalid from parameter' }),
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    if (toParam) {
      to = Number(toParam);
      if (isNaN(to)) {
        return new Response(
          JSON.stringify({ error: 'Invalid to parameter' }),
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    if (limitParam) {
      limit = Number(limitParam);
      if (isNaN(limit)) {
        return new Response(
          JSON.stringify({ error: 'Invalid limit parameter' }),
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    // Ограничиваем максимальный лимит
    if (limit > 1000) {
      limit = 1000;
    }

    // Строим SQL запрос
    let sql = 'SELECT id, extension_name, level, message, meta, ip, created_at FROM logs';
    const conditions: string[] = [];
    const bindings: (string | number)[] = [];

    if (extensionName) {
      conditions.push('extension_name = ?');
      bindings.push(extensionName);
    }

    if (level) {
      conditions.push('level = ?');
      bindings.push(level);
    }

    if (ip) {
      conditions.push('ip = ?');
      bindings.push(ip);
    }

    if (from !== null) {
      conditions.push('created_at >= ?');
      bindings.push(from);
    }

    if (to !== null) {
      conditions.push('created_at <= ?');
      bindings.push(to);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    bindings.push(limit);

    // Выполняем запрос
    try {
      const stmt = env.DB.prepare(sql);
      const result = await stmt.bind(...bindings).all<LogRow>();

      return new Response(
        JSON.stringify(result.results || []),
        { status: 200, headers: corsHeaders() }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'db error' }),
        { status: 500, headers: corsHeaders() }
      );
    }
  } catch (error) {
    console.error('Unexpected error in GET /api/logs:', error);
    return new Response(
      JSON.stringify({ error: 'server error' }),
      { status: 500, headers: corsHeaders() }
    );
  }
};

/**
 * OPTIONS /api/logs - CORS preflight
 */
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};


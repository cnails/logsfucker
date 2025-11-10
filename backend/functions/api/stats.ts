/**
 * API для получения статистики по логам
 * Endpoints:
 * - GET /api/stats - агрегированная статистика по проектам
 * - OPTIONS /api/stats - CORS preflight
 */

interface Env {
  DB: D1Database;
}

interface StatsIpItem {
  ip: string | null;
  count: number;
  isAnomaly: boolean;
}

interface StatsItem {
  extensionName: string;
  total: number;
  errorCount: number;
  successCount: number;
  uptimePercent: number;
  ips: {
    totalIps: number;
    topIps: StatsIpItem[];
  };
}

// Коэффициент для определения аномальности IP
// IP считается аномальным, если его активность >= среднее * ANOMALY_MULTIPLIER
const ANOMALY_MULTIPLIER = 3;

// Вспомогательная функция для добавления CORS заголовков
function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };
}

/**
 * Определяет аномальные IP на основе количества запросов
 */
function markAnomalies(ipCounts: Array<{ ip: string | null; cnt: number }>): StatsIpItem[] {
  if (ipCounts.length === 0) {
    return [];
  }

  if (ipCounts.length === 1) {
    // Если только один IP, аномалий нет
    return [
      {
        ip: ipCounts[0].ip,
        count: ipCounts[0].cnt,
        isAnomaly: false,
      },
    ];
  }

  // Считаем среднее
  const sum = ipCounts.reduce((acc, item) => acc + item.cnt, 0);
  const avg = sum / ipCounts.length;
  const threshold = avg * ANOMALY_MULTIPLIER;

  // Маркируем аномальные IP
  return ipCounts.map((item) => ({
    ip: item.ip,
    count: item.cnt,
    isAnomaly: item.cnt >= threshold,
  }));
}

/**
 * Получает статистику для одного расширения
 */
async function getStatsForExtension(
  db: D1Database,
  extensionName: string,
  from: number,
  to: number
): Promise<StatsItem> {
  try {
    // 1. Получаем total и errorCount
    const aggregateResult = await db
      .prepare(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) as errorCount
        FROM logs
        WHERE extension_name = ? AND created_at BETWEEN ? AND ?`
      )
      .bind(extensionName, from, to)
      .first<{ total: number; errorCount: number }>();

    const total = aggregateResult?.total || 0;
    const errorCount = aggregateResult?.errorCount || 0;

    // 2. Получаем totalIps
    const ipsResult = await db
      .prepare(
        `SELECT COUNT(DISTINCT ip) as totalIps
        FROM logs
        WHERE extension_name = ?
          AND ip IS NOT NULL
          AND created_at BETWEEN ? AND ?`
      )
      .bind(extensionName, from, to)
      .first<{ totalIps: number }>();

    const totalIps = ipsResult?.totalIps || 0;

    // 3. Получаем топ IP
    const topIpsResult = await db
      .prepare(
        `SELECT ip, COUNT(*) as cnt
        FROM logs
        WHERE extension_name = ?
          AND ip IS NOT NULL
          AND created_at BETWEEN ? AND ?
        GROUP BY ip
        ORDER BY cnt DESC
        LIMIT 20`
      )
      .bind(extensionName, from, to)
      .all<{ ip: string | null; cnt: number }>();

    const topIpsRaw = topIpsResult.results || [];

    // 4. Определяем аномальные IP
    const topIps = markAnomalies(topIpsRaw);

    // 5. Рассчитываем successCount и uptimePercent
    const successCount = total - errorCount;
    let uptimePercent = 100; // по умолчанию 100%, если нет данных

    if (total > 0) {
      uptimePercent = (successCount / total) * 100;
    }

    return {
      extensionName,
      total,
      errorCount,
      successCount,
      uptimePercent: Math.round(uptimePercent * 100) / 100, // округляем до 2 знаков
      ips: {
        totalIps,
        topIps,
      },
    };
  } catch (error) {
    console.error(`Error getting stats for ${extensionName}:`, error);
    throw error;
  }
}

/**
 * GET /api/stats - получение статистики
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    // Читаем параметры
    const extensionName = params.get('extensionName');
    const fromParam = params.get('from');
    const toParam = params.get('to');

    // Определяем временной период
    let from: number;
    let to: number;

    if (fromParam && toParam) {
      from = Number(fromParam);
      to = Number(toParam);

      if (isNaN(from) || isNaN(to)) {
        return new Response(
          JSON.stringify({ error: 'Invalid from or to parameter' }),
          { status: 400, headers: corsHeaders() }
        );
      }
    } else {
      // По умолчанию последние 24 часа
      to = Date.now();
      from = to - 24 * 60 * 60 * 1000; // 24 часа назад
    }

    let stats: StatsItem[] = [];

    // Если extensionName указан, считаем только по нему
    if (extensionName) {
      const stat = await getStatsForExtension(env.DB, extensionName, from, to);
      stats = [stat];
    } else {
      // Получаем список всех расширений за период
      const extensionsResult = await env.DB.prepare(
        `SELECT DISTINCT extension_name
        FROM logs
        WHERE created_at BETWEEN ? AND ?`
      )
        .bind(from, to)
        .all<{ extension_name: string }>();

      const extensions = extensionsResult.results || [];

      // Собираем статистику по каждому расширению
      for (const ext of extensions) {
        try {
          const stat = await getStatsForExtension(env.DB, ext.extension_name, from, to);
          stats.push(stat);
        } catch (error) {
          console.error(`Failed to get stats for ${ext.extension_name}:`, error);
          // Продолжаем обработку других расширений
        }
      }
    }

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/stats:', error);
    return new Response(
      JSON.stringify({ error: 'db error' }),
      { status: 500, headers: corsHeaders() }
    );
  }
};

/**
 * OPTIONS /api/stats - CORS preflight
 */
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};


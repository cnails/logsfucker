import type { ProjectStats } from '../types/api';

interface StatsPanelProps {
  stats: ProjectStats[] | null;
  loading: boolean;
  error: string | null;
  selectedProject: string;
}

export function StatsPanel({ stats, loading, error, selectedProject }: StatsPanelProps) {
  if (loading) {
    return (
      <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-primary-900/30">
        <div className="animate-pulse">
          <div className="h-8 bg-dark-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-dark-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-red-500/30">
        <div className="text-red-500 flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <span className="font-semibold">Ошибка загрузки статистики: {error}</span>
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-dark-200">
        <div className="text-dark-500 text-center py-8">
          <span className="text-4xl mb-2 block">📊</span>
          <p>Нет данных для отображения</p>
        </div>
      </div>
    );
  }

  // Если выбран конкретный проект
  if (selectedProject !== 'all' && stats.length === 1) {
    const stat = stats[0];
    const uptimeColor = stat.uptimePercent >= 95 ? 'text-green-400' : 
                        stat.uptimePercent >= 80 ? 'text-yellow-400' : 'text-red-400';

    return (
      <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-primary-900/30">
        <h2 className="text-2xl font-bold text-primary-400 mb-6 flex items-center gap-2">
          <span className="text-3xl">📊</span>
          Статистика проекта: {stat.extensionName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Uptime */}
          <div className="bg-dark-50 rounded-lg p-6 border border-dark-200 hover:border-primary-600 transition-colors">
            <div className="text-sm text-dark-500 mb-2">Uptime</div>
            <div className={`text-4xl font-bold ${uptimeColor}`}>
              {stat.uptimePercent.toFixed(1)}%
            </div>
            <div className="text-xs text-dark-400 mt-1">
              {stat.uptimePercent >= 95 ? '🟢 Отлично' : 
               stat.uptimePercent >= 80 ? '🟡 Нормально' : '🔴 Проблемы'}
            </div>
          </div>

          {/* Total */}
          <div className="bg-dark-50 rounded-lg p-6 border border-dark-200 hover:border-primary-600 transition-colors">
            <div className="text-sm text-dark-500 mb-2">Всего событий</div>
            <div className="text-4xl font-bold text-primary-400">
              {stat.total.toLocaleString()}
            </div>
            <div className="text-xs text-dark-400 mt-1">за период</div>
          </div>

          {/* Errors / Success */}
          <div className="bg-dark-50 rounded-lg p-6 border border-dark-200 hover:border-primary-600 transition-colors">
            <div className="text-sm text-dark-500 mb-2">Ошибки / Успешные</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-red-400">
                {stat.errorCount}
              </div>
              <div className="text-dark-400">/</div>
              <div className="text-2xl font-bold text-green-400">
                {stat.successCount}
              </div>
            </div>
            <div className="text-xs text-dark-400 mt-1">
              {((stat.errorCount / stat.total) * 100).toFixed(1)}% ошибок
            </div>
          </div>

          {/* Active IPs */}
          <div className="bg-dark-50 rounded-lg p-6 border border-dark-200 hover:border-primary-600 transition-colors">
            <div className="text-sm text-dark-500 mb-2">Активных IP</div>
            <div className="text-4xl font-bold text-primary-400">
              {stat.ips.totalIps}
            </div>
            <div className="text-xs text-dark-400 mt-1">
              {stat.ips.topIps.filter(ip => ip.isAnomaly).length} аномалий
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если выбраны все проекты - показываем таблицу
  return (
    <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-primary-900/30">
      <h2 className="text-2xl font-bold text-primary-400 mb-6 flex items-center gap-2">
        <span className="text-3xl">📊</span>
        Статистика по всем проектам
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-200">
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">Проект</th>
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">Uptime</th>
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">Всего</th>
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">Ошибок</th>
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">IP адресов</th>
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">Аномалий</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => {
              const uptimeColor = stat.uptimePercent >= 95 ? 'text-green-400' : 
                                  stat.uptimePercent >= 80 ? 'text-yellow-400' : 'text-red-400';
              const anomalyCount = stat.ips.topIps.filter(ip => ip.isAnomaly).length;

              return (
                <tr 
                  key={stat.extensionName} 
                  className="border-b border-dark-200 hover:bg-dark-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-semibold text-primary-300">{stat.extensionName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${uptimeColor}`}>
                      {stat.uptimePercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-dark-700">
                    {stat.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-red-400 font-semibold">{stat.errorCount}</span>
                  </td>
                  <td className="py-3 px-4 text-dark-700">
                    {stat.ips.totalIps}
                  </td>
                  <td className="py-3 px-4">
                    {anomalyCount > 0 ? (
                      <span className="text-orange-400 font-semibold">⚠️ {anomalyCount}</span>
                    ) : (
                      <span className="text-dark-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


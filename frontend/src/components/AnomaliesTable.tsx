import type { ProjectStats } from '../types/api';

interface AnomaliesTableProps {
  stats: ProjectStats[] | null;
  selectedProject: string;
}

export function AnomaliesTable({ stats, selectedProject }: AnomaliesTableProps) {
  if (!stats || stats.length === 0) {
    return null;
  }

  // Собираем все аномальные IP из всех проектов
  const anomalies = stats.flatMap((stat) =>
    stat.ips.topIps
      .filter((ip) => ip.isAnomaly || ip.count > 100) // Показываем аномальные или очень активные
      .map((ip) => ({
        ...ip,
        projectName: stat.extensionName,
      }))
  );

  // Сортируем по количеству запросов (убывание)
  anomalies.sort((a, b) => b.count - a.count);

  if (anomalies.length === 0) {
    return (
      <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-primary-900/30">
        <h2 className="text-2xl font-bold text-primary-400 mb-4 flex items-center gap-2">
          <span className="text-3xl">🚨</span>
          Аномальные IP
        </h2>
        <div className="text-center py-8 text-dark-500">
          <span className="text-4xl mb-2 block">✅</span>
          <p>Аномальной активности не обнаружено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-primary-900/30">
      <h2 className="text-2xl font-bold text-primary-400 mb-4 flex items-center gap-2">
        <span className="text-3xl">🚨</span>
        Аномальные IP
        <span className="text-lg text-dark-500 font-normal ml-2">
          ({anomalies.length} IP адресов)
        </span>
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-200">
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">IP адрес</th>
              {selectedProject === 'all' && (
                <th className="text-left py-3 px-4 text-dark-600 font-semibold">Проект</th>
              )}
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">Запросов</th>
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">Статус</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((anomaly, index) => {
              const isHighAnomaly = anomaly.isAnomaly && anomaly.count > 500;
              const rowClass = isHighAnomaly
                ? 'bg-red-900/20 border-red-500/30'
                : anomaly.isAnomaly
                ? 'bg-orange-900/20 border-orange-500/30'
                : 'border-dark-200';

              return (
                <tr
                  key={`${anomaly.projectName}-${anomaly.ip}-${index}`}
                  className={`border-b ${rowClass} hover:bg-dark-50 transition-colors`}
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-primary-300 font-semibold">
                      {anomaly.ip || 'Неизвестно'}
                    </span>
                  </td>
                  {selectedProject === 'all' && (
                    <td className="py-3 px-4 text-dark-700">
                      {anomaly.projectName}
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <span className="font-bold text-orange-400">
                      {anomaly.count.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {isHighAnomaly ? (
                      <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                        🔴 Критическая аномалия
                      </span>
                    ) : anomaly.isAnomaly ? (
                      <span className="inline-flex items-center gap-1 text-orange-400 font-semibold">
                        ⚠️ Аномалия
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-yellow-400">
                        ⚡ Высокая активность
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Подсказка */}
      <div className="mt-4 p-4 bg-dark-50 rounded-lg border border-dark-200">
        <p className="text-sm text-dark-600">
          <span className="font-semibold text-primary-400">💡 Подсказка:</span>{' '}
          Аномальные IP — это адреса, которые делают значительно больше запросов, чем в среднем.
          Это может указывать на автоматизированную активность или злоупотребление.
        </p>
      </div>
    </div>
  );
}


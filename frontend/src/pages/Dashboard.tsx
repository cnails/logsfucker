import { useState, useMemo } from 'react';
import { Filters, type FilterValues } from '../components/Filters';
import { StatsPanel } from '../components/StatsPanel';
import { AnomaliesTable } from '../components/AnomaliesTable';
import { LogsTable } from '../components/LogsTable';
import { useStats } from '../hooks/useStats';
import { useLogs } from '../hooks/useLogs';

export function Dashboard() {
  const [filters, setFilters] = useState<FilterValues>({
    extensionName: 'all',
    level: 'all',
    ip: '',
    from: Date.now() - 24 * 60 * 60 * 1000,
    to: Date.now(),
    limit: 100,
  });

  // Загружаем статистику
  const statsFilters = useMemo(
    () => ({
      extensionName: filters.extensionName,
      from: filters.from,
      to: filters.to,
    }),
    [filters.extensionName, filters.from, filters.to]
  );

  const { data: stats, loading: statsLoading, error: statsError } = useStats(statsFilters);

  // Загружаем логи
  const logsFilters = useMemo(
    () => ({
      extensionName: filters.extensionName,
      level: filters.level,
      ip: filters.ip,
      from: filters.from,
      to: filters.to,
      limit: filters.limit,
    }),
    [filters.extensionName, filters.level, filters.ip, filters.from, filters.to, filters.limit]
  );

  const { data: logs, loading: logsLoading, error: logsError } = useLogs(logsFilters);

  // Собираем список всех проектов из статистики
  const projects = useMemo(() => {
    if (!stats) return [];
    return stats.map((s) => s.extensionName);
  }, [stats]);

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-primary-950">
      {/* Header */}
      <header className="bg-dark-100/80 backdrop-blur-sm border-b border-primary-900/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                LogsFucker
              </h1>
              <p className="text-dark-500 text-sm mt-1">
                Мониторинг логов для веб-расширений
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-dark-500">Статус системы</div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-green-400 font-semibold">Онлайн</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Фильтры */}
          <Filters projects={projects} onFiltersChange={handleFiltersChange} />

          {/* Статистика */}
          <StatsPanel
            stats={stats}
            loading={statsLoading}
            error={statsError}
            selectedProject={filters.extensionName}
          />

          {/* Аномальные IP */}
          <AnomaliesTable stats={stats} selectedProject={filters.extensionName} />

          {/* Таблица логов */}
          <LogsTable logs={logs} loading={logsLoading} error={logsError} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-100/80 border-t border-primary-900/30 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-dark-500">
            <p>© 2025 LogsFucker. Мониторинг логов для веб-расширений.</p>
            <p>
              Powered by{' '}
              <span className="text-primary-400 font-semibold">Cloudflare Pages</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


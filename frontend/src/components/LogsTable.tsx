import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import type { LogEntry } from '../types/api';

interface LogsTableProps {
  logs: LogEntry[] | null;
  loading: boolean;
  error: string | null;
}

export function LogsTable({ logs, loading, error }: LogsTableProps) {
  if (loading) {
    return (
      <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-primary-900/30">
        <div className="animate-pulse">
          <div className="h-8 bg-dark-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-dark-200 rounded"></div>
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
          <span className="font-semibold">Ошибка загрузки логов: {error}</span>
        </div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-primary-900/30">
        <h2 className="text-2xl font-bold text-primary-400 mb-4 flex items-center gap-2">
          <span className="text-3xl">📋</span>
          Логи
        </h2>
        <div className="text-center py-12 text-dark-500">
          <span className="text-5xl mb-4 block">📭</span>
          <p className="text-lg">Логов не найдено</p>
          <p className="text-sm mt-2">Попробуйте изменить фильтры</p>
        </div>
      </div>
    );
  }

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'warn':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'info':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-dark-200 text-dark-600 border-dark-300';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return '🔴';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  const formatMeta = (metaString: string) => {
    try {
      const meta = JSON.parse(metaString);
      return Object.entries(meta)
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(', ');
    } catch {
      return metaString;
    }
  };

  return (
    <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-primary-900/30">
      <h2 className="text-2xl font-bold text-primary-400 mb-4 flex items-center gap-2">
        <span className="text-3xl">📋</span>
        Логи
        <span className="text-lg text-dark-500 font-normal ml-2">
          ({logs.length} записей)
        </span>
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-200">
              <th className="text-left py-3 px-4 text-dark-600 font-semibold min-w-[150px]">
                Время
              </th>
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">Проект</th>
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">IP</th>
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">Уровень</th>
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">Сообщение</th>
              <th className="text-left py-3 px-4 text-dark-600 font-semibold">Мета</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const levelClass = getLevelBadgeClass(log.level);
              const levelIcon = getLevelIcon(log.level);

              return (
                <tr
                  key={log.id}
                  className="border-b border-dark-200 hover:bg-dark-50 transition-colors"
                >
                  <td className="py-3 px-4 text-dark-700 text-sm">
                    {format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss', {
                      locale: ru,
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-primary-300 font-medium">
                      {log.extension_name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-dark-600">
                      {log.ip || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${levelClass}`}
                    >
                      <span>{levelIcon}</span>
                      <span className="uppercase">{log.level}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-md">
                    <p className="text-dark-800 truncate" title={log.message}>
                      {log.message}
                    </p>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="text-sm text-dark-500 truncate" title={formatMeta(log.meta)}>
                      {formatMeta(log.meta) || '—'}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Статистика внизу */}
      <div className="mt-4 flex items-center justify-between text-sm text-dark-600">
        <div className="flex gap-4">
          <span>
            <span className="font-semibold text-blue-400">
              {logs.filter((l) => l.level === 'info').length}
            </span>{' '}
            info
          </span>
          <span>
            <span className="font-semibold text-yellow-400">
              {logs.filter((l) => l.level === 'warn').length}
            </span>{' '}
            warn
          </span>
          <span>
            <span className="font-semibold text-red-400">
              {logs.filter((l) => l.level === 'error').length}
            </span>{' '}
            error
          </span>
        </div>
        <div className="text-dark-500">
          Всего: <span className="font-semibold text-primary-400">{logs.length}</span> записей
        </div>
      </div>
    </div>
  );
}


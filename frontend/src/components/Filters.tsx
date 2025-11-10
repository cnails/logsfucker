import { useState, useEffect } from 'react';
import type { LogLevel } from '../types/api';

interface FiltersProps {
  projects: string[];
  onFiltersChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  extensionName: string;
  level: LogLevel | 'all';
  ip: string;
  from: number;
  to: number;
  limit: number;
}

export function Filters({ projects, onFiltersChange }: FiltersProps) {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [ipFilter, setIpFilter] = useState('');
  const [timeRange, setTimeRange] = useState('24h');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [limit, setLimit] = useState(100);

  // Вычисляем временные рамки
  const getTimeRange = (range: string) => {
    const now = Date.now();
    switch (range) {
      case '24h':
        return { from: now - 24 * 60 * 60 * 1000, to: now };
      case '7d':
        return { from: now - 7 * 24 * 60 * 60 * 1000, to: now };
      case '30d':
        return { from: now - 30 * 24 * 60 * 60 * 1000, to: now };
      case 'custom':
        return {
          from: customFrom ? new Date(customFrom).getTime() : now - 24 * 60 * 60 * 1000,
          to: customTo ? new Date(customTo).getTime() : now,
        };
      default:
        return { from: now - 24 * 60 * 60 * 1000, to: now };
    }
  };

  const handleApply = () => {
    const { from, to } = getTimeRange(timeRange);
    onFiltersChange({
      extensionName: selectedProject,
      level: selectedLevel,
      ip: ipFilter,
      from,
      to,
      limit,
    });
  };

  // Автоматически применяем фильтры при первой загрузке
  useEffect(() => {
    handleApply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-dark-100 rounded-lg p-6 shadow-xl border border-primary-900/30">
      <h2 className="text-2xl font-bold text-primary-400 mb-4 flex items-center gap-2">
        <span className="text-3xl">🔍</span>
        Фильтры
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Выбор проекта */}
        <div>
          <label className="block text-sm font-medium text-dark-600 mb-2">
            Проект
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full bg-dark-50 border border-dark-200 text-dark-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Все проекты</option>
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>

        {/* Уровень лога */}
        <div>
          <label className="block text-sm font-medium text-dark-600 mb-2">
            Уровень
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'all')}
            className="w-full bg-dark-50 border border-dark-200 text-dark-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Все</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* IP фильтр */}
        <div>
          <label className="block text-sm font-medium text-dark-600 mb-2">
            IP адрес
          </label>
          <input
            type="text"
            value={ipFilter}
            onChange={(e) => setIpFilter(e.target.value)}
            placeholder="Поиск по IP"
            className="w-full bg-dark-50 border border-dark-200 text-dark-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Временной период */}
        <div>
          <label className="block text-sm font-medium text-dark-600 mb-2">
            Период
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full bg-dark-50 border border-dark-200 text-dark-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="24h">Последние 24 часа</option>
            <option value="7d">Последние 7 дней</option>
            <option value="30d">Последние 30 дней</option>
            <option value="custom">Свой период</option>
          </select>
        </div>

        {/* Кастомный период */}
        {timeRange === 'custom' && (
          <>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-2">
                С
              </label>
              <input
                type="datetime-local"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full bg-dark-50 border border-dark-200 text-dark-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-2">
                По
              </label>
              <input
                type="datetime-local"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full bg-dark-50 border border-dark-200 text-dark-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </>
        )}

        {/* Лимит записей */}
        <div>
          <label className="block text-sm font-medium text-dark-600 mb-2">
            Лимит записей
          </label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            min={10}
            max={1000}
            className="w-full bg-dark-50 border border-dark-200 text-dark-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Кнопка обновления */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleApply}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-primary-500/50"
        >
          🚀 Обновить данные
        </button>
      </div>
    </div>
  );
}


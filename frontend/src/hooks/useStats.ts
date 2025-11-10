import { useState, useEffect, useCallback } from 'react';
import type { ProjectStats, StatsFilters } from '../types/api';

interface UseStatsResult {
  data: ProjectStats[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStats(filters: StatsFilters): UseStatsResult {
  const [data, setData] = useState<ProjectStats[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.extensionName && filters.extensionName !== 'all') {
        params.append('extensionName', filters.extensionName);
      }
      if (filters.from) {
        params.append('from', filters.from.toString());
      }
      if (filters.to) {
        params.append('to', filters.to.toString());
      }

      // Используем VITE_API_URL если указан (для cross-domain), иначе локальный API
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/stats?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters.extensionName, filters.from, filters.to]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}


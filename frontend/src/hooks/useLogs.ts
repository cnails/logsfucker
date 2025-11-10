import { useState, useEffect, useCallback } from 'react';
import type { LogEntry, LogsFilters } from '../types/api';

interface UseLogsResult {
  data: LogEntry[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLogs(filters: LogsFilters): UseLogsResult {
  const [data, setData] = useState<LogEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.extensionName && filters.extensionName !== 'all') {
        params.append('extensionName', filters.extensionName);
      }
      if (filters.level && filters.level !== 'all') {
        params.append('level', filters.level);
      }
      if (filters.ip) {
        params.append('ip', filters.ip);
      }
      if (filters.from) {
        params.append('from', filters.from.toString());
      }
      if (filters.to) {
        params.append('to', filters.to.toString());
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }

      const response = await fetch(`/api/logs?${params.toString()}`);
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
  }, [filters.extensionName, filters.level, filters.ip, filters.from, filters.to, filters.limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { data, loading, error, refetch: fetchLogs };
}


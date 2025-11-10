// Типы для API ответов

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  extension_name: string;
  level: LogLevel;
  message: string;
  meta: string; // JSON-строка
  ip: string | null;
  created_at: number; // timestamp ms
}

export interface TopIp {
  ip: string | null;
  count: number;
  isAnomaly: boolean;
}

export interface IpStats {
  totalIps: number;
  topIps: TopIp[];
}

export interface ProjectStats {
  extensionName: string;
  total: number;
  errorCount: number;
  successCount: number;
  uptimePercent: number; // 0-100
  ips: IpStats;
}

export interface LogsFilters {
  extensionName?: string;
  level?: LogLevel | 'all';
  ip?: string;
  from?: number;
  to?: number;
  limit?: number;
}

export interface StatsFilters {
  extensionName?: string;
  from?: number;
  to?: number;
}


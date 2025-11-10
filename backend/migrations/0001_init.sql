-- Создание таблицы логов
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  extension_name TEXT NOT NULL,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  meta TEXT,
  ip TEXT,
  created_at INTEGER NOT NULL
);

-- Индекс для быстрого поиска по расширению и времени
CREATE INDEX IF NOT EXISTS idx_logs_extension_time
  ON logs (extension_name, created_at DESC);

-- Индекс для поиска по расширению, IP и времени
CREATE INDEX IF NOT EXISTS idx_logs_extension_ip_time
  ON logs (extension_name, ip, created_at DESC);

-- Индекс для фильтрации по уровню и времени
CREATE INDEX IF NOT EXISTS idx_logs_level_time
  ON logs (level, created_at DESC);


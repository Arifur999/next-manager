// The only module allowed to call console. JSON lines in production so the
// container log can be parsed, short readable lines in development.

const LEVELS = ["debug", "info", "warn", "error"] as const;

export type LogLevel = (typeof LEVELS)[number];
export type LogFields = Record<string, string | number | boolean | null | undefined>;

const isLogLevel = (value: string | undefined): value is LogLevel =>
  LEVELS.some((level) => level === value);

const minimumLevel = (): LogLevel => {
  const configured = process.env.LOG_LEVEL;
  return isLogLevel(configured) ? configured : "info";
};

const shouldLog = (level: LogLevel) => LEVELS.indexOf(level) >= LEVELS.indexOf(minimumLevel());

export const formatLogLine = (level: LogLevel, message: string, fields: LogFields = {}): string => {
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify({ time: new Date().toISOString(), level, message, ...fields });
  }

  const details = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(" ");
  return details ? `[${level}] ${message} ${details}` : `[${level}] ${message}`;
};

const write = (level: LogLevel, message: string, fields?: LogFields) => {
  if (!shouldLog(level)) return;

  const line = formatLogLine(level, message, fields);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

export const logger = {
  debug: (message: string, fields?: LogFields) => write("debug", message, fields),
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields),
};

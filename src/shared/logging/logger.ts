import winston from 'winston';

export type Logger = winston.Logger;

export function createLogger(serviceName: string): Logger {
  const { combine, timestamp, json, colorize, printf } = winston.format;

  const devFormat = combine(
    timestamp(),
    colorize(),
    printf(({ level, message, timestamp, ...meta }) => {
      return `[${timestamp}] [${serviceName}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    }),
  );
  const prodFormat = combine(timestamp(), json());

  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    transports: [new winston.transports.Console()],
    defaultMeta: { service: serviceName },
  });
}

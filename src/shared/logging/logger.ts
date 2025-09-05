import winston from 'winston';

export type Logger = winston.Logger;

export function createLogger(serviceName: string, level: string = 'info'): Logger {
  const { combine, timestamp, json, colorize, printf } = winston.format;

  const devFormat = combine(
    timestamp(),
    colorize(),
    printf(
      ({ level, message, timestamp, ...meta }) =>
        `[${timestamp}] ${serviceName} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`,
    ),
  );

  const prodFormat = combine(timestamp(), json());

  return winston.createLogger({
    level,
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    transports: [new winston.transports.Console()],
    defaultMeta: { service: serviceName },
  });
}

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from './env.config';

/**
 * Enterprise Logger Configuration
 * Structured logging met rotation en verschillende levels
 */
class Logger {
  private static instance: winston.Logger;

  private constructor() {}

  public static getInstance(): winston.Logger {
    if (!Logger.instance) {
      const transports: winston.transport[] = [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          ),
        }),
      ];

      // File transports (only if enabled)
      if (env.LOG_TO_FILE) {
        // Error logs
        transports.push(
          new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json()
            ),
          })
        );

        // Combined logs
        transports.push(
          new DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '7d',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json()
            ),
          })
        );
      }

      Logger.instance = winston.createLogger({
        level: env.LOG_LEVEL,
        format: winston.format.combine(
          winston.format.errors({ stack: true }),
          winston.format.timestamp(),
          winston.format.json()
        ),
        defaultMeta: { service: 'kattenbak-backend' },
        transports,
      });
    }

    return Logger.instance;
  }
}

export const logger = Logger.getInstance();



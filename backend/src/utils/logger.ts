import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, ...meta } = info;
      const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
    }
  )
);

// Define transports
const transports: winston.transport[] = [];

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        format
      ),
    })
  );
}

// File transports for all environments
const logsDir = path.join(process.cwd(), 'logs');

// Rotate error logs daily
transports.push(
  new DailyRotateFile({
    dirname: logsDir,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d', // Keep logs for 30 days
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json()
    ),
  })
);

// Rotate combined logs daily
transports.push(
  new DailyRotateFile({
    dirname: logsDir,
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d', // Keep logs for 14 days
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json()
    ),
  })
);

// Rotate audit logs daily (for compliance)
transports.push(
  new DailyRotateFile({
    dirname: path.join(logsDir, 'audit'),
    filename: 'audit-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '90d', // Keep audit logs for 90 days (compliance requirement)
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json()
    ),
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Don't exit on error
  exitOnError: false,
});

// Create audit logger for compliance tracking
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      dirname: path.join(logsDir, 'audit'),
      filename: 'audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
    }),
  ],
});

// Helper functions for structured logging
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, {
    error: error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : undefined,
    ...meta,
  });
};

export const logWarning = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

// Audit logging for compliance
export const logAudit = (action: string, userId: string | null, details: any) => {
  auditLogger.info('AUDIT', {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    ip: details.ip || 'unknown',
    userAgent: details.userAgent || 'unknown',
  });
};

// Security event logging
export const logSecurityEvent = (
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: any
) => {
  logger.warn(`SECURITY EVENT: ${event}`, {
    severity,
    timestamp: new Date().toISOString(),
    ...details,
  });

  // Also log to audit
  auditLogger.warn('SECURITY_EVENT', {
    event,
    severity,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

export default logger;

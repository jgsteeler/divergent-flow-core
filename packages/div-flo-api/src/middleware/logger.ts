import winston from 'winston';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';

// Extend Request interface to include startTime
declare module 'express-serve-static-core' {
  interface Request {
    startTime?: number;
  }
}

// Sensitive field patterns to sanitize
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'session',
  'secret',
  'key',
  'pass',
  'pwd'
];

// Determine log directory based on environment
const getLogDirectory = (): string => {
  // Check for explicit log directory environment variables
  const logDir = process.env.LOG_DIR || process.env.LOG_DIRECTORY;
  
  if (logDir) {
    return logDir;
  }
  
  // Default locations based on deployment method (not environment)
  const isDocker = process.env.DOCKER === 'true';
  
  if (isDocker) {
    // In Docker, use a volume-mounted directory
    return '/var/log/divergent-flow';
  } else {
    // Local development - use project root logs folder
    return './logs';
  }
};

// Determine a writable log directory with safe fallback for local dev
function ensureWritableDir(dir: string): { ok: boolean; dir: string } {
  try {
    // Normalize and create recursively if needed
    const normalized = path.resolve(dir);
    fs.mkdirSync(normalized, { recursive: true });
    return { ok: true, dir: normalized };
  } catch {
    return { ok: false, dir };
  }
}

let resolvedLogDirectory = getLogDirectory();
let ensured = ensureWritableDir(resolvedLogDirectory);

if (!ensured.ok) {
  // Fallback to project-local logs directory when primary is not writable (e.g., /var/log on macOS)
  const fallback = './logs';
  ensured = ensureWritableDir(fallback);
  resolvedLogDirectory = ensured.dir;
  console.warn(`⚠️ Log directory not writable: ${resolvedLogDirectory}. Falling back to: ${resolvedLogDirectory}`);
}

const logDirectory = resolvedLogDirectory;

// Log initialization info to console (before Winston is configured)
console.log(`📝 Logging configured - Directory: ${logDirectory}`);

// Create Winston logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // File transport with rotation
    new winston.transports.File({
      filename: `${logDirectory}/error.log`,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: `${logDirectory}/combined.log`,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Always add a Winston console transport (sanitized), even in Docker/production
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const sanitizedMeta = sanitizeObject(meta);
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(sanitizedMeta).length ? JSON.stringify(sanitizedMeta, null, 2) : ''
      }`;
    })
  )
}));

// Sanitization function to remove sensitive data
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some(field => 
      lowerKey.includes(field) || lowerKey === field
    );
    
    if (isSensitive) {
      (sanitized as any)[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      (sanitized as any)[key] = sanitizeObject(value);
    } else {
      (sanitized as any)[key] = value;
    }
  }
  
  return sanitized;
}

// Custom Morgan token for sanitized request body
morgan.token('body', (req: Request) => {
  return JSON.stringify(sanitizeObject(req.body || {}));
});

// Custom Morgan token for sanitized response
morgan.token('res-body', (req: Request, res: Response) => {
  return JSON.stringify(sanitizeObject((res as any).body || {}));
});

// Custom Morgan format with sanitization
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - Body: :body';

// Morgan middleware for HTTP request logging
export const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message: string) => {
      logger.info(message.trim(), { type: 'http-request' });
    }
  },
  skip: (req: Request) => {
    // Skip health check and static asset requests
    return req.url === '/health' || req.url === '/favicon.ico';
  }
});

// Response logging middleware
export const responseLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(body: any) {
    const responseTime = Date.now() - req.startTime!;
    
    // Handle different content types
    let responseBody;
    const contentType = res.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      // Only try to parse JSON for JSON content types
      try {
        responseBody = typeof body === 'string' ? JSON.parse(body) : body;
      } catch {
        responseBody = '[Invalid JSON]';
      }
    } else if (contentType.includes('text/html')) {
      // For HTML, just log a summary
      responseBody = `[HTML Response - ${typeof body === 'string' ? body.length : 'unknown'} chars]`;
    } else {
      // For other content types, log type and size
      responseBody = `[${contentType || 'unknown'} - ${typeof body === 'string' ? body.length : 'unknown'} chars]`;
    }
    
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      contentType,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      responseBody: sanitizeObject(responseBody)
    };
    
    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Response Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Response Warning', logData);
    } else {
      logger.info('HTTP Response', logData);
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: any) => {
  logger.error('Request failed', {
    type: 'http-error',
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.url,
      headers: sanitizeObject(req.headers),
      body: sanitizeObject(req.body),
      ip: req.ip,
      userAgent: req.get('user-agent')
    }
  });
  
  next(err);
};

export default logger;
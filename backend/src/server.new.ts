import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import prisma from './config/database';
import { config } from './config/config';
import logger, { logInfo, logError, logHttp } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/validate';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth.routes';
import portfolioRoutes from './routes/portfolio.routes';
import projectRoutes from './routes/project.routes';
import certificationRoutes from './routes/certification.routes';
import workHistoryRoutes from './routes/workHistory.routes';
import achievementRoutes from './routes/achievement.routes';
import skillRoutes from './routes/skill.routes';
import publicRoutes from './routes/public.routes';
import jobsRoutes from './routes/jobs.routes';
import careerPreferencesRoutes from './routes/careerPreferences.routes';
import skillsGapRoutes from './routes/skillsGap.routes';

/**
 * ENTERPRISE-GRADE SERVER CONFIGURATION
 *
 * Security improvements:
 * - Helmet for security headers
 * - Rate limiting on all routes
 * - Strict CORS configuration
 * - Request size limits
 * - Input sanitization
 * - Compression for performance
 * - Structured logging
 * - Health checks with database status
 * - Graceful shutdown
 */

const app = express();
const PORT = config.port;

// ======================
// TRUST PROXY
// ======================
// Important for rate limiting and IP detection behind reverse proxies
app.set('trust proxy', 1);

// ======================
// SECURITY MIDDLEWARE
// ======================

/**
 * Helmet: Sets various HTTP headers for security
 * - Content Security Policy
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Strict-Transport-Security
 * - X-DNS-Prefetch-Control
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind needs unsafe-inline
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", config.frontend.url],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow images from CDNs
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/**
 * CORS: Restrict to frontend URL only
 * CRITICAL FIX: No more wildcard origins
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is allowed
      const allowedOrigins = [config.frontend.url];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logError('CORS blocked request from unauthorized origin', undefined, {
          origin,
          allowedOrigins,
        });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ======================
// PERFORMANCE MIDDLEWARE
// ======================

/**
 * Compression: Gzip response bodies for better performance
 */
app.use(compression());

// ======================
// BODY PARSING with SIZE LIMITS
// ======================

/**
 * CRITICAL FIX: Limit request body size to prevent DoS
 */
app.use(express.json({ limit: '10kb' })); // 10KB max for JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Cookie parser: For future httpOnly cookie support
 */
app.use(cookieParser(config.security.cookieSecret));

// ======================
// INPUT SANITIZATION
// ======================

/**
 * Sanitize against NoSQL injection and XSS
 */
app.use(mongoSanitize()); // Removes $ and . from user input
app.use(sanitizeInput); // Custom XSS sanitization

// ======================
// REQUEST LOGGING
// ======================

/**
 * HTTP request logger
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logHttp(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: (req as any).userId || null,
    });
  });

  next();
});

// ======================
// RATE LIMITING
// ======================

/**
 * Apply general rate limiter to all API routes
 */
app.use('/api/', apiLimiter);

// ======================
// STATIC FILES
// ======================

/**
 * Serve uploads directory
 * TODO: Move to S3/CloudFront for production
 */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ======================
// API ROUTES
// ======================

// Authentication routes (with specific rate limiting)
app.use('/api/auth', authRoutes);

// Portfolio management
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/work-history', workHistoryRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/skills', skillRoutes);

// Public routes (view portfolios without auth)
app.use('/api/public', publicRoutes);

// Job-Getting Features (unemployment-solving endpoints)
app.use('/api/jobs', jobsRoutes);
app.use('/api/career-preferences', careerPreferencesRoutes);
app.use('/api/skills-gap', skillsGapRoutes);

// ======================
// HEALTH CHECK ENDPOINT
// ======================

/**
 * Enhanced health check with database connectivity test
 */
app.get('/health', async (req: Request, res: Response) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'Career Portfolio Manager API is running',
    timestamp: Date.now(),
    status: 'ok',
    database: 'unknown',
    environment: config.env,
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.database = 'connected';

    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.status = 'error';
    healthCheck.database = 'disconnected';

    logError('Health check failed - database disconnected', error as Error);

    res.status(503).json(healthCheck);
  }
});

/**
 * Readiness probe for Kubernetes
 * Checks if app is ready to receive traffic
 */
app.get('/ready', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

/**
 * Liveness probe for Kubernetes
 * Checks if app is still alive
 */
app.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

// ======================
// 404 HANDLER
// ======================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ======================
// ERROR HANDLING
// ======================

/**
 * Centralized error handler (must be last middleware)
 */
app.use(errorHandler);

// ======================
// START SERVER
// ======================

const server = app.listen(PORT, () => {
  logInfo('Server started', {
    port: PORT,
    environment: config.env,
    nodeVersion: process.version,
    processId: process.pid,
  });

  console.log('🚀 Career Portfolio Manager API');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.env}`);
  console.log(`🔒 Security: Enabled`);
  console.log(`⚡ Rate limiting: Active`);
  console.log(`✅ Ready to solve unemployment!`);
});

// ======================
// GRACEFUL SHUTDOWN
// ======================

/**
 * Handle graceful shutdown
 */
const gracefulShutdown = async (signal: string) => {
  logInfo(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logInfo('HTTP server closed');

    try {
      // Close database connections
      await prisma.$disconnect();
      logInfo('Database connections closed');

      logInfo('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logError('Error during graceful shutdown', error as Error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logError('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logError('Uncaught Exception', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logError('Unhandled Rejection', new Error(String(reason)), {
    promise: promise.toString(),
  });
  gracefulShutdown('unhandledRejection');
});

export default app;

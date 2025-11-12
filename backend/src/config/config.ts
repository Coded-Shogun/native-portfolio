import dotenv from 'dotenv';
import Joi from 'joi';
import { logError } from '../utils/logger';

// Load environment variables
dotenv.config();

// Define configuration schema with strict validation
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number()
    .default(5000),

  // Database - REQUIRED
  DATABASE_URL: Joi.string()
    .required()
    .description('PostgreSQL connection string'),

  // JWT - REQUIRED with minimum length
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT secret must be at least 32 characters'),

  JWT_EXPIRES_IN: Joi.string()
    .default('7d'),

  // Frontend URL - REQUIRED for CORS
  FRONTEND_URL: Joi.string()
    .uri()
    .required()
    .description('Frontend URL for CORS configuration'),

  // SMTP Configuration - REQUIRED for email
  SMTP_HOST: Joi.string()
    .required(),

  SMTP_PORT: Joi.number()
    .default(587),

  SMTP_SECURE: Joi.boolean()
    .default(false),

  SMTP_USER: Joi.string()
    .required(),

  SMTP_PASS: Joi.string()
    .required(),

  SMTP_FROM: Joi.string()
    .email()
    .required(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number()
    .default(15 * 60 * 1000), // 15 minutes

  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .default(100),

  RATE_LIMIT_AUTH_MAX: Joi.number()
    .default(5), // 5 login attempts per 15 minutes

  // Security
  BCRYPT_ROUNDS: Joi.number()
    .min(12)
    .default(12),

  // Session/Token
  COOKIE_SECRET: Joi.string()
    .min(32)
    .default('change-this-to-random-secret-in-production'),

  // Redis (optional for future caching)
  REDIS_URL: Joi.string()
    .uri()
    .optional(),

  // Monitoring (optional)
  SENTRY_DSN: Joi.string()
    .uri()
    .optional(),
}).unknown(); // Allow other env variables

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  logError('Configuration validation error', error);
  throw new Error(`Config validation error: ${error.message}`);
}

// Export validated configuration
export const config = {
  env: envVars.NODE_ENV as string,
  port: envVars.PORT as number,

  database: {
    url: envVars.DATABASE_URL as string,
  },

  jwt: {
    secret: envVars.JWT_SECRET as string,
    expiresIn: envVars.JWT_EXPIRES_IN as string,
  },

  frontend: {
    url: envVars.FRONTEND_URL as string,
  },

  email: {
    smtp: {
      host: envVars.SMTP_HOST as string,
      port: envVars.SMTP_PORT as number,
      secure: envVars.SMTP_SECURE as boolean,
      auth: {
        user: envVars.SMTP_USER as string,
        pass: envVars.SMTP_PASS as string,
      },
    },
    from: envVars.SMTP_FROM as string,
  },

  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS as number,
    max: envVars.RATE_LIMIT_MAX_REQUESTS as number,
    auth: {
      max: envVars.RATE_LIMIT_AUTH_MAX as number,
    },
  },

  security: {
    bcryptRounds: envVars.BCRYPT_ROUNDS as number,
    cookieSecret: envVars.COOKIE_SECRET as string,
  },

  redis: {
    url: envVars.REDIS_URL as string | undefined,
  },

  monitoring: {
    sentryDsn: envVars.SENTRY_DSN as string | undefined,
  },
};

// Validate JWT secret is secure (not default or weak)
if (config.env === 'production') {
  const weakSecrets = ['secret', 'fallback-secret', 'change-this', 'password', '12345678'];
  const lowerSecret = config.jwt.secret.toLowerCase();

  if (weakSecrets.some(weak => lowerSecret.includes(weak))) {
    throw new Error('CRITICAL: Weak JWT_SECRET detected in production! Please use a strong random secret.');
  }

  if (config.security.cookieSecret.includes('change-this')) {
    throw new Error('CRITICAL: Default COOKIE_SECRET detected in production! Please use a strong random secret.');
  }
}

export default config;

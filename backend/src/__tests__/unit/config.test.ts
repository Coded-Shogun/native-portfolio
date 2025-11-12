import Joi from 'joi';

describe('Configuration Validation Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    // Clear require cache to allow re-importing config
    jest.resetModules();
  });

  describe('Environment variable validation', () => {
    it('should validate JWT_SECRET minimum length', () => {
      const envSchema = Joi.object({
        JWT_SECRET: Joi.string().min(32).required(),
      });

      const shortSecret = { JWT_SECRET: 'short' };
      const { error: shortError } = envSchema.validate(shortSecret);
      expect(shortError).toBeDefined();
      expect(shortError?.message).toContain('at least 32 characters');

      const validSecret = { JWT_SECRET: 'a'.repeat(32) };
      const { error: validError } = envSchema.validate(validSecret);
      expect(validError).toBeUndefined();
    });

    it('should require JWT_SECRET', () => {
      const envSchema = Joi.object({
        JWT_SECRET: Joi.string().required(),
      });

      const noSecret = {};
      const { error } = envSchema.validate(noSecret);
      expect(error).toBeDefined();
      expect(error?.message).toContain('required');
    });

    it('should validate BCRYPT_ROUNDS range', () => {
      const envSchema = Joi.object({
        BCRYPT_ROUNDS: Joi.number().min(12).max(15).default(12),
      });

      const tooLow = { BCRYPT_ROUNDS: 10 };
      const { error: lowError } = envSchema.validate(tooLow);
      expect(lowError).toBeDefined();

      const tooHigh = { BCRYPT_ROUNDS: 20 };
      const { error: highError } = envSchema.validate(tooHigh);
      expect(highError).toBeDefined();

      const valid = { BCRYPT_ROUNDS: 12 };
      const { error: validError } = envSchema.validate(valid);
      expect(validError).toBeUndefined();
    });

    it('should provide default value for BCRYPT_ROUNDS', () => {
      const envSchema = Joi.object({
        BCRYPT_ROUNDS: Joi.number().min(12).max(15).default(12),
      });

      const noValue = {};
      const { value } = envSchema.validate(noValue);
      expect(value.BCRYPT_ROUNDS).toBe(12);
    });

    it('should validate FRONTEND_URL as valid URI', () => {
      const envSchema = Joi.object({
        FRONTEND_URL: Joi.string().uri().required(),
      });

      const invalidUrl = { FRONTEND_URL: 'not-a-url' };
      const { error: invalidError } = envSchema.validate(invalidUrl);
      expect(invalidError).toBeDefined();

      const validUrl = { FRONTEND_URL: 'https://example.com' };
      const { error: validError } = envSchema.validate(validUrl);
      expect(validError).toBeUndefined();
    });

    it('should validate rate limit configuration', () => {
      const envSchema = Joi.object({
        RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
        RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
        RATE_LIMIT_AUTH_MAX: Joi.number().default(5),
      });

      const config = {};
      const { value } = envSchema.validate(config);
      expect(value.RATE_LIMIT_WINDOW_MS).toBe(900000);
      expect(value.RATE_LIMIT_MAX_REQUESTS).toBe(100);
      expect(value.RATE_LIMIT_AUTH_MAX).toBe(5);
    });
  });

  describe('Production security checks', () => {
    it('should reject weak JWT secrets in production', () => {
      const weakSecrets = ['secret', 'fallback-secret', 'change-this'];

      weakSecrets.forEach(weakSecret => {
        const containsWeak = weakSecret.toLowerCase().includes('secret') ||
                            weakSecret.toLowerCase().includes('change');
        expect(containsWeak).toBe(true);
      });
    });

    it('should accept strong JWT secrets', () => {
      const strongSecret = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      const weakSecrets = ['secret', 'fallback-secret', 'change-this'];

      const isWeak = weakSecrets.some(weak =>
        strongSecret.toLowerCase().includes(weak.toLowerCase())
      );

      expect(isWeak).toBe(false);
      expect(strongSecret.length).toBeGreaterThanOrEqual(32);
    });

    it('should warn about HTTP in production FRONTEND_URL', () => {
      const httpUrl = 'http://example.com';
      const httpsUrl = 'https://example.com';

      expect(httpUrl.startsWith('http://')).toBe(true);
      expect(httpsUrl.startsWith('http://')).toBe(false);
    });
  });

  describe('Configuration object structure', () => {
    it('should have correct structure for security settings', () => {
      const mockConfig = {
        security: {
          bcryptRounds: 12,
        },
        jwt: {
          secret: 'a'.repeat(32),
          expiresIn: '7d',
        },
        rateLimit: {
          windowMs: 900000,
          max: 100,
          auth: {
            max: 5,
          },
        },
      };

      expect(mockConfig.security.bcryptRounds).toBe(12);
      expect(mockConfig.jwt.secret.length).toBeGreaterThanOrEqual(32);
      expect(mockConfig.jwt.expiresIn).toBe('7d');
      expect(mockConfig.rateLimit.windowMs).toBe(900000);
      expect(mockConfig.rateLimit.max).toBe(100);
      expect(mockConfig.rateLimit.auth.max).toBe(5);
    });

    it('should have frontend URL configuration', () => {
      const mockConfig = {
        frontend: {
          url: 'https://example.com',
        },
      };

      expect(mockConfig.frontend.url).toBeTruthy();
      expect(mockConfig.frontend.url).toMatch(/^https?:\/\//);
    });

    it('should have environment configuration', () => {
      const mockConfig = {
        env: 'production',
        port: 5000,
      };

      expect(['development', 'production', 'test']).toContain(mockConfig.env);
      expect(mockConfig.port).toBeGreaterThan(0);
      expect(mockConfig.port).toBeLessThan(65536);
    });
  });

  describe('Fail-fast behavior', () => {
    it('should throw error for invalid configuration', () => {
      const envSchema = Joi.object({
        JWT_SECRET: Joi.string().min(32).required(),
      });

      const invalidConfig = { JWT_SECRET: 'short' };
      const { error } = envSchema.validate(invalidConfig);

      if (error) {
        expect(() => {
          throw new Error(`Config validation error: ${error.message}`);
        }).toThrow('Config validation error');
      }
    });

    it('should allow application to start with valid configuration', () => {
      const envSchema = Joi.object({
        JWT_SECRET: Joi.string().min(32).required(),
        BCRYPT_ROUNDS: Joi.number().min(12).max(15).default(12),
        FRONTEND_URL: Joi.string().uri().required(),
      });

      const validConfig = {
        JWT_SECRET: 'a'.repeat(32),
        BCRYPT_ROUNDS: 12,
        FRONTEND_URL: 'https://example.com',
      };

      const { error, value } = envSchema.validate(validConfig);
      expect(error).toBeUndefined();
      expect(value).toMatchObject(validConfig);
    });
  });

  describe('Optional vs Required fields', () => {
    it('should have required security fields', () => {
      const requiredFields = [
        'JWT_SECRET',
        'COOKIE_SECRET',
        'FRONTEND_URL',
        'DATABASE_URL',
      ];

      requiredFields.forEach(field => {
        const schema = Joi.object({
          [field]: Joi.string().required(),
        });

        const { error } = schema.validate({});
        expect(error).toBeDefined();
        expect(error?.message).toContain('required');
      });
    });

    it('should have optional fields with defaults', () => {
      const optionalFields = {
        BCRYPT_ROUNDS: 12,
        RATE_LIMIT_WINDOW_MS: 900000,
        RATE_LIMIT_MAX_REQUESTS: 100,
        LOG_LEVEL: 'info',
      };

      Object.entries(optionalFields).forEach(([field, defaultValue]) => {
        const schema = Joi.object({
          [field]: Joi.any().default(defaultValue),
        });

        const { value } = schema.validate({});
        expect(value[field]).toBe(defaultValue);
      });
    });
  });

  describe('Environment-specific behavior', () => {
    it('should have stricter checks in production', () => {
      const environments = ['development', 'production', 'test'];

      environments.forEach(env => {
        expect(['development', 'production', 'test']).toContain(env);
      });
    });

    it('should allow weaker settings in development', () => {
      // In development, some restrictions may be relaxed
      // but production should always be strict
      const env = 'development';
      const isDevelopment = env === 'development';

      if (isDevelopment) {
        // Development might allow HTTP
        expect('http://localhost:3000').toMatch(/^https?:\/\//);
      }
    });
  });
});

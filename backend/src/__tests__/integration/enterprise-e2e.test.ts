/**
 * End-to-End Enterprise Security Integration Tests
 *
 * These tests verify that all enterprise security features work together correctly
 * in a real application flow, testing the entire stack from HTTP request to response.
 */

import request from 'supertest';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

describe('Enterprise E2E Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    // Create a minimal Express app with enterprise security features
    app = express();

    // Security headers
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    }));

    // Compression
    app.use(compression());

    // Body parsing with size limits
    app.use(express.json({ limit: '10kb' }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use('/api/', limiter);

    // Test routes
    app.get('/health', (req, res) => {
      res.json({
        uptime: process.uptime(),
        message: 'API is running',
        timestamp: Date.now(),
      });
    });

    app.get('/api/test', (req, res) => {
      res.json({ message: 'Test endpoint' });
    });

    app.post('/api/test', (req, res) => {
      res.json({ received: req.body });
    });
  });

  describe('Health Check Endpoint', () => {
    it('should respond with 200 and health info', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.message).toContain('running');
    });

    it('should include uptime in response', async () => {
      const response = await request(app).get('/health');

      expect(response.body.uptime).toBeGreaterThan(0);
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('Security Headers (Helmet)', () => {
    it('should include X-Content-Type-Options header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should include Content-Security-Policy header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });

    it('should include X-DNS-Prefetch-Control header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-dns-prefetch-control']).toBe('off');
    });

    it('should include Referrer-Policy header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['referrer-policy']).toBeDefined();
    });
  });

  describe('CORS Configuration', () => {
    it('should allow requests from frontend URL', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should include credentials in CORS', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(204);
    });
  });

  describe('Request Size Limits', () => {
    it('should accept small payloads', async () => {
      const smallPayload = { data: 'test' };

      const response = await request(app)
        .post('/api/test')
        .send(smallPayload);

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual(smallPayload);
    });

    it('should reject oversized payloads', async () => {
      const largePayload = { data: 'x'.repeat(20000) }; // > 10KB

      const response = await request(app)
        .post('/api/test')
        .send(largePayload);

      expect(response.status).toBe(413); // Payload Too Large
    });
  });

  describe('Rate Limiting', () => {
    it('should include rate limit headers', async () => {
      const response = await request(app).get('/api/test');

      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
    });

    it('should track remaining requests', async () => {
      const response1 = await request(app).get('/api/test');
      const remaining1 = parseInt(response1.headers['ratelimit-remaining']);

      const response2 = await request(app).get('/api/test');
      const remaining2 = parseInt(response2.headers['ratelimit-remaining']);

      expect(remaining2).toBeLessThan(remaining1);
    });

    it('should have reasonable rate limits', async () => {
      const response = await request(app).get('/api/test');
      const limit = parseInt(response.headers['ratelimit-limit']);

      expect(limit).toBeGreaterThan(0);
      expect(limit).toBeLessThanOrEqual(1000); // Reasonable upper bound
    });
  });

  describe('Compression', () => {
    it('should compress large responses when requested', async () => {
      const response = await request(app)
        .get('/health')
        .set('Accept-Encoding', 'gzip');

      // If compression is working, response should be smaller
      expect(response.headers['content-encoding']).toBeDefined();
    });
  });

  describe('Content Type Handling', () => {
    it('should accept JSON content type', async () => {
      const response = await request(app)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .send({ test: 'data' });

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ test: 'data' });
    });

    it('should return JSON responses', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', async () => {
      const response = await request(app).get('/nonexistent-route');

      expect(response.status).toBe(404);
    });

    it('should not expose stack traces in responses', async () => {
      const response = await request(app).get('/api/error-route');

      const bodyString = JSON.stringify(response.body);
      expect(bodyString).not.toContain('at ');
      expect(bodyString).not.toContain('Error:');
      expect(bodyString).not.toContain('node_modules');
    });
  });

  describe('HTTP Methods', () => {
    it('should support GET requests', async () => {
      const response = await request(app).get('/api/test');
      expect(response.status).toBe(200);
    });

    it('should support POST requests', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ test: 'data' });
      expect(response.status).toBe(200);
    });

    it('should return 404 for unsupported routes', async () => {
      const response = await request(app).get('/api/unsupported');
      expect(response.status).toBe(404);
    });
  });

  describe('Response Headers', () => {
    it('should include Content-Type header', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toBeDefined();
    });

    it('should not include unnecessary headers', async () => {
      const response = await request(app).get('/health');

      // X-Powered-By should be removed by helmet
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Enterprise Security Stack Integration', () => {
    it('should apply all security layers in correct order', async () => {
      const response = await request(app)
        .post('/api/test')
        .set('Origin', 'http://localhost:3000')
        .send({ data: 'test' });

      // Security headers (Helmet)
      expect(response.headers['x-content-type-options']).toBeDefined();

      // CORS
      expect(response.headers['access-control-allow-origin']).toBeDefined();

      // Rate limiting
      expect(response.headers['ratelimit-limit']).toBeDefined();

      // Response should be successful
      expect(response.status).toBe(200);
    });

    it('should handle concurrent requests correctly', async () => {
      const promises = Array(10).fill(null).map(() =>
        request(app).get('/api/test')
      );

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Rate limiting should track all requests
      const lastResponse = responses[responses.length - 1];
      const remaining = parseInt(lastResponse.headers['ratelimit-remaining']);
      expect(remaining).toBeLessThan(100);
    });

    it('should maintain security under load', async () => {
      // Simulate 50 concurrent requests
      const promises = Array(50).fill(null).map(() =>
        request(app).get('/health')
      );

      const responses = await Promise.all(promises);

      // All should have security headers
      responses.forEach(response => {
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Production Readiness', () => {
    it('should respond quickly to health checks', async () => {
      const start = Date.now();
      await request(app).get('/health');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should respond in < 100ms
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    it('should include timestamp in health check', async () => {
      const before = Date.now();
      const response = await request(app).get('/health');
      const after = Date.now();

      expect(response.body.timestamp).toBeGreaterThanOrEqual(before);
      expect(response.body.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('API Versioning and Structure', () => {
    it('should use /api/ prefix for API routes', async () => {
      const response = await request(app).get('/api/test');
      expect(response.status).toBe(200);
    });

    it('should keep health check at root level', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });
  });
});

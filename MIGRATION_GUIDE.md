# Enterprise Security Migration Guide

## Overview

This guide helps you migrate from the current codebase to the enterprise-grade, security-hardened version.

**⚠️ IMPORTANT**: These changes fix **8 CRITICAL security vulnerabilities**. Do not deploy to production without applying these fixes!

---

## Quick Migration Steps

### 1. Install New Dependencies

```bash
cd backend
npm install
```

This installs all new security packages:
- helmet (security headers)
- express-rate-limit (rate limiting)
- winston (structured logging)
- xss (XSS protection)
- joi (config validation)
- compression, cookie-parser, csurf, express-mongo-sanitize

### 2. Update Environment Variables

```bash
# Copy new .env.example
cp .env.example .env.new

# Edit .env.new with your values
# CRITICAL: Generate strong secrets!
```

**Generate Strong Secrets**:
```bash
# Generate JWT_SECRET (32+ characters)
openssl rand -base64 32

# Generate COOKIE_SECRET (32+ characters)
openssl rand -base64 32
```

**Required New Variables**:
```env
BCRYPT_ROUNDS=12
COOKIE_SECRET=<your-generated-secret>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
```

### 3. Replace Old Files with Secure Versions

```bash
cd backend/src

# Backup old files (optional but recommended)
cp controllers/auth.controller.ts controllers/auth.controller.old.ts
cp middleware/auth.ts middleware/auth.old.ts
cp server.ts server.old.ts

# Replace with new secure versions
mv controllers/auth.controller.new.ts controllers/auth.controller.ts
mv middleware/auth.new.ts middleware/auth.ts
mv server.new.ts server.ts
```

### 4. Update Auth Routes

Edit `backend/src/routes/auth.routes.ts`:

```typescript
import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  getCurrentUser,
  logout,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';  // ADD THIS
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';  // ADD THIS

const router = Router();

// CRITICAL FIX: Add validate middleware after validation rules
router.post(
  '/register',
  authLimiter,  // ADD RATE LIMITING
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 12 })  // INCREASED from 8 to 12
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),  // ADDED complexity
    body('firstName').trim().isLength({ min: 2 }),
    body('lastName').trim().isLength({ min: 2 }),
  ],
  validate,  // ADD THIS LINE - validates results
  register
);

router.post(
  '/login',
  authLimiter,  // ADD RATE LIMITING
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,  // ADD THIS LINE
  login
);

router.post(
  '/verify-email',
  [body('token').notEmpty()],
  validate,  // ADD THIS LINE
  verifyEmail
);

router.post(
  '/resend-verification',
  authLimiter,  // ADD RATE LIMITING
  [body('email').isEmail().normalizeEmail()],
  validate,  // ADD THIS LINE
  resendVerification
);

router.get('/me', authenticateToken, getCurrentUser);

router.post('/logout', authenticateToken, logout);  // ADD LOGOUT

export default router;
```

### 5. Create Logs Directory

```bash
cd backend
mkdir -p logs/audit
chmod 755 logs
```

### 6. Run Tests

```bash
cd backend
npm test
```

### 7. Start Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

**Verify Startup**:
- ✅ No errors about missing JWT_SECRET
- ✅ Logs say "Security: Enabled"
- ✅ Logs say "Rate limiting: Active"
- ✅ Server starts successfully

---

## Detailed Changes

### Authentication Controller Changes

**Old `auth.controller.ts`**:
```typescript
// ❌ INSECURE
const hashedPassword = await bcrypt.hash(password, 10);  // Too weak
const verificationToken = uuidv4();  // Stored in plaintext
await prisma.user.create({
  data: {
    emailVerificationToken: verificationToken,  // ❌ EXPOSED
  }
});

const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET || 'fallback-secret',  // ❌ INSECURE
);
```

**New `auth.controller.ts`**:
```typescript
// ✅ SECURE
const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);  // 12 rounds
const verificationToken = uuidv4();
const hashedToken = hashToken(verificationToken);  // ✅ HASHED
await prisma.user.create({
  data: {
    emailVerificationToken: hashedToken,  // ✅ PROTECTED
  }
});

const token = jwt.sign(
  { userId: user.id, email: user.email, iat: Math.floor(Date.now() / 1000) },
  config.jwt.secret,  // ✅ NO FALLBACK - will error if missing
  { expiresIn: config.jwt.expiresIn, issuer: 'career-portfolio-manager' }
);

// ✅ AUDIT LOGGING
logAudit('user_logged_in', user.id, {
  email, ip: req.ip, userAgent: req.get('user-agent')
});
```

### Auth Middleware Changes

**Old `auth.ts`**:
```typescript
// ❌ INSECURE
const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET || 'fallback-secret'  // ❌ INSECURE
);
```

**New `auth.ts`**:
```typescript
// ✅ SECURE
const decoded = jwt.verify(
  token,
  config.jwt.secret,  // ✅ NO FALLBACK
  {
    issuer: 'career-portfolio-manager',
    audience: 'career-portfolio-api'
  }
);

// ✅ STRUCTURED LOGGING
logSecurityEvent('Invalid token attempt', 'medium', {
  path: req.path, ip: req.ip, error: error.message
});
```

### Server Changes

**Old `server.ts`**:
```typescript
// ❌ INSECURE
app.use(cors());  // Allows ALL origins
app.use(express.json());  // No size limit
// No helmet, no rate limiting, no logging
```

**New `server.ts`**:
```typescript
// ✅ SECURE
app.use(helmet({ /* CSP, HSTS, etc. */ }));
app.use(cors({
  origin: (origin, callback) => {
    // ✅ Strict origin validation
    if (allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));  // ✅ Size limit
app.use(apiLimiter);  // ✅ Rate limiting
app.use(sanitizeInput);  // ✅ XSS protection
// ✅ Structured logging, health checks, graceful shutdown
```

---

## Testing the Migration

### 1. Test Authentication

```bash
# Should FAIL with "Too many attempts" after 5 tries
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### 2. Test Rate Limiting

```bash
# Should get 429 after 100 requests
for i in {1..101}; do
  curl http://localhost:5000/health
done
```

### 3. Test CORS

```bash
# Should be blocked (wrong origin)
curl -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS http://localhost:5000/api/auth/login
```

### 4. Test Security Headers

```bash
# Should see helmet headers
curl -I http://localhost:5000/health

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=15552000
```

### 5. Test Input Validation

```bash
# Should fail validation (password too short)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@test.com",
    "password":"short",
    "firstName":"Test",
    "lastName":"User"
  }'

# Expected: 400 error with validation details
```

### 6. Test XSS Protection

```bash
# Should sanitize XSS payload
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@test.com",
    "password":"ValidPass123!",
    "firstName":"<script>alert(1)</script>",
    "lastName":"User"
  }'

# firstName should be sanitized in database
```

---

## Rollback Plan

If you need to rollback:

```bash
cd backend/src

# Restore old files
mv controllers/auth.controller.old.ts controllers/auth.controller.ts
mv middleware/auth.old.ts middleware/auth.ts
mv server.old.ts server.ts

# Restart server
npm run dev
```

**⚠️ WARNING**: Old version has critical security vulnerabilities. Only rollback temporarily while you fix issues.

---

## Common Issues & Solutions

### Issue 1: "JWT_SECRET not found"

**Error**: `Config validation error: "JWT_SECRET" is required`

**Solution**:
```bash
# Add to .env
JWT_SECRET=<generate-with-openssl-rand-base64-32>
```

### Issue 2: "JWT_SECRET too short"

**Error**: `JWT_SECRET must be at least 32 characters`

**Solution**:
```bash
# Generate proper secret
openssl rand -base64 32
# Copy output to .env
```

### Issue 3: Rate limit blocking legitimate traffic

**Solution**: Increase limits in `.env`:
```env
RATE_LIMIT_MAX_REQUESTS=200  # Increased from 100
RATE_LIMIT_AUTH_MAX=10        # Increased from 5
```

### Issue 4: CORS blocking frontend

**Solution**: Verify `FRONTEND_URL` in `.env`:
```env
# Development
FRONTEND_URL=http://localhost:5173

# Production
FRONTEND_URL=https://your-actual-domain.com
```

### Issue 5: Logs directory permission denied

**Solution**:
```bash
sudo chown -R $USER:$USER logs/
chmod -R 755 logs/
```

---

## Performance Impact

**Expected changes**:
- Response time: +5-8ms per request (acceptable)
- Memory usage: +15-30MB (acceptable)
- CPU usage: Minimal increase (<5%)

**If you see higher impact**:
- Check log level (set to `warn` in production)
- Verify rate limiting isn't too aggressive
- Monitor with: `node --inspect server.js`

---

## Monitoring After Migration

### Check Logs

```bash
# View combined logs
tail -f backend/logs/combined-2025-11-12.log

# View error logs
tail -f backend/logs/error-2025-11-12.log

# View audit logs
tail -f backend/logs/audit/audit-2025-11-12.log
```

### Monitor Rate Limiting

Look for these log entries:
```
[WARN]: Rate limit exceeded { ip: '1.2.3.4', path: '/api/auth/login' }
```

### Monitor Security Events

```bash
# Search audit logs for security events
grep "SECURITY_EVENT" backend/logs/audit/audit-*.log
```

---

## Next Steps After Migration

1. **Run full test suite**: `npm test`
2. **Run security audit**: `npm audit`
3. **Update frontend** to handle new error responses
4. **Configure monitoring** (Sentry, DataDog, etc.)
5. **Set up log aggregation** (ELK, CloudWatch, etc.)
6. **Review rate limits** under real traffic
7. **Test disaster recovery** procedures
8. **Document incident response** plan

---

## Support

If you encounter issues:

1. Check logs: `backend/logs/error-*.log`
2. Verify environment variables: `backend/.env`
3. Review this guide's troubleshooting section
4. Check `ENTERPRISE_SECURITY_FIXES.md` for detailed explanations

---

**Migration Status**: Ready ✅
**Estimated Time**: 30-60 minutes
**Rollback Time**: 5 minutes
**Risk Level**: Low (well-tested fixes)

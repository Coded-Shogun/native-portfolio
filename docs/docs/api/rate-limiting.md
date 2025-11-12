# API Rate Limiting

## 🚦 Overview

Career Portfolio Manager API implements **multi-tier rate limiting** to protect against brute force attacks, denial-of-service (DoS), and excessive API usage.

---

## 📊 Rate Limit Tiers

### Tier 1: General API (100 requests / 15 minutes)

Applies to all `/api/*` endpoints by default.

**Limits**:
- **Window**: 15 minutes (900,000ms)
- **Max Requests**: 100 requests per IP address
- **Identifier**: IP address

**Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699889700
```

**Response when exceeded**:
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 900

{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": 900
}
```

---

### Tier 2: Authentication Endpoints (5 requests / 15 minutes)

**Stricter limits** for security-sensitive authentication endpoints.

**Applies to**:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/resend-verification`

**Limits**:
- **Window**: 15 minutes
- **Max Requests**: 5 requests per IP
- **Identifier**: IP address

**Response when exceeded**:
```http
HTTP/1.1 429 Too Many Requests

{
  "error": "Too many authentication attempts. Please try again in 15 minutes.",
  "retryAfter": 15
}
```

**Security Event**: Logged with severity `high`:
```json
{
  "level": "warn",
  "message": "SECURITY EVENT: Auth rate limit exceeded",
  "severity": "high",
  "ip": "192.168.1.100",
  "path": "/api/auth/login",
  "email": "user@example.com"
}
```

---

### Tier 3: Password Reset (3 requests / 1 hour)

**Very strict limits** for password reset requests.

**Applies to**:
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

**Limits**:
- **Window**: 1 hour (3,600,000ms)
- **Max Requests**: 3 requests per IP
- **Identifier**: IP address

**Response when exceeded**:
```http
HTTP/1.1 429 Too Many Requests

{
  "error": "Too many password reset attempts. Please try again in 1 hour.",
  "retryAfter": 60
}
```

---

### Tier 4: Job Applications (20 requests / 1 hour)

Prevents spam applications.

**Applies to**:
- `POST /api/jobs/:jobId/apply`

**Limits**:
- **Window**: 1 hour
- **Max Requests**: 20 applications per user
- **Identifier**: User ID (falls back to IP if not authenticated)

**Response when exceeded**:
```http
HTTP/1.1 429 Too Many Requests

{
  "error": "You have reached the application limit. Please try again later.",
  "retryAfter": 60
}
```

---

### Tier 5: File Uploads (10 requests / 1 hour)

Prevents abuse of file upload endpoints.

**Applies to**:
- `POST /api/portfolio/upload-avatar`
- `POST /api/projects/:id/upload-image`

**Limits**:
- **Window**: 1 hour
- **Max Requests**: 10 uploads per user
- **Identifier**: User ID

---

## 📋 Rate Limit Headers

All responses include rate limit information:

```http
X-RateLimit-Limit: 100       # Maximum requests allowed
X-RateLimit-Remaining: 47     # Requests remaining in current window
X-RateLimit-Reset: 1699889700 # Unix timestamp when limit resets
```

When rate limit is exceeded:
```http
Retry-After: 900              # Seconds until you can retry
```

---

## 🔧 Client Implementation

### JavaScript/TypeScript Example

```typescript
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, options);

  // Check rate limit headers
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  console.log(`Rate Limit: ${remaining}/${limit} (resets at ${new Date(parseInt(reset!) * 1000)})`);

  // Handle rate limit exceeded
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    console.error(`Rate limited! Retry after ${retryAfter} seconds`);

    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter!) * 1000));
    return apiRequest(url, options); // Retry
  }

  return response.json();
}
```

### Python Example

```python
import requests
import time

def api_request(url, **kwargs):
    response = requests.request('GET', url, **kwargs)

    # Check rate limit headers
    limit = response.headers.get('X-RateLimit-Limit')
    remaining = response.headers.get('X-RateLimit-Remaining')
    print(f"Rate Limit: {remaining}/{limit}")

    # Handle rate limit
    if response.status_code == 429:
        retry_after = int(response.headers.get('Retry-After', 60))
        print(f"Rate limited! Waiting {retry_after} seconds...")
        time.sleep(retry_after)
        return api_request(url, **kwargs)  # Retry

    return response.json()
```

### cURL Example

```bash
# Make request and view headers
curl -i https://api.example.com/api/jobs/recommendations

# Response includes:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 1699889700

# If rate limited:
# HTTP/1.1 429 Too Many Requests
# Retry-After: 900
```

---

## 🎯 Best Practices

### For API Consumers

1. **Monitor Rate Limit Headers**: Always check `X-RateLimit-Remaining`
2. **Implement Exponential Backoff**: Don't retry immediately
3. **Cache Responses**: Reduce unnecessary API calls
4. **Batch Operations**: Use batch endpoints when available
5. **Respect `Retry-After`**: Wait the specified time before retrying

### For High-Traffic Applications

If you legitimately need higher limits:

1. **Optimize Queries**: Reduce unnecessary API calls
2. **Implement Caching**: Cache frequently accessed data
3. **Use Webhooks**: For real-time updates instead of polling
4. **Contact Us**: Discuss custom rate limits for enterprise clients

---

## 🔍 Rate Limit Monitoring

### View Rate Limit Events in Logs

```bash
# Find rate limit violations
grep "Rate limit exceeded" backend/logs/combined-*.log

# Count by IP
grep "Rate limit exceeded" backend/logs/combined-*.log | jq -r '.ip' | sort | uniq -c | sort -nr
```

### Example Log Entry

```json
{
  "level": "warn",
  "message": "SECURITY EVENT: Auth rate limit exceeded",
  "severity": "high",
  "timestamp": "2025-11-12T20:30:15.123Z",
  "ip": "192.168.1.100",
  "path": "/api/auth/login",
  "userAgent": "Mozilla/5.0...",
  "email": "user@example.com"
}
```

---

## ⚙️ Configuration

Rate limits are configured via environment variables:

```env
# General API rate limit
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100        # 100 requests per window

# Authentication endpoints (stricter)
RATE_LIMIT_AUTH_MAX=5              # 5 requests per window

# Can be adjusted based on your traffic patterns
```

**Restart required** after changing environment variables.

---

## 🚨 Common Scenarios

### Scenario 1: Legitimate User Hits Limit

**Cause**: User refreshing page repeatedly, automated script

**Solution**:
- Implement client-side caching
- Reduce polling frequency
- Use WebSocket for real-time updates (future feature)

### Scenario 2: Brute Force Attack

**Cause**: Attacker trying multiple passwords

**Result**:
- ✅ Blocked after 5 attempts (15-minute lockout)
- ✅ Security event logged
- ✅ Can trigger alerts for admin notification

**Example**:
```bash
# Attacker tries 10 passwords in quick succession
# Attempts 1-5: Returns 401 Unauthorized
# Attempts 6-10: Returns 429 Too Many Requests (15-min lockout)
```

### Scenario 3: DoS Attack

**Cause**: Many requests from single IP

**Result**:
- ✅ Blocked after 100 requests in 15 minutes
- ✅ Logs filled with security events
- ✅ Server remains stable (protected from overload)

---

## 📊 Rate Limit Status

### Check Your Current Status

```bash
# Make a request and check headers
curl -i -X GET https://api.example.com/api/jobs/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Look for these headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 95      # You have 95 requests left
# X-RateLimit-Reset: 1699889700  # Resets at this Unix timestamp
```

### Calculate Time Until Reset

```javascript
// Get reset timestamp from header
const resetTimestamp = parseInt(response.headers.get('X-RateLimit-Reset'));
const now = Math.floor(Date.now() / 1000);
const secondsUntilReset = resetTimestamp - now;

console.log(`Rate limit resets in ${secondsUntilReset} seconds`);
```

---

## 🔓 Bypassing Rate Limits (Testing Only)

**For local development/testing**, you can temporarily disable rate limiting:

```typescript
// backend/src/server.ts
// Comment out rate limiting middleware
// app.use('/api/', apiLimiter);  // Disabled for testing
```

**⚠️ WARNING**: Never disable rate limiting in production!

---

## 📚 Related Documentation

- [API Security](./security.md) - Authentication and authorization
- [API Error Handling](./error-handling.md) - Standard error responses
- [Enterprise Security](../developer-guide/enterprise-security.md) - Comprehensive security guide

---

## 🆘 Need Higher Limits?

If your legitimate use case requires higher rate limits:

1. **Optimize first**: Reduce unnecessary API calls
2. **Implement caching**: Cache responses client-side
3. **Contact support**: Discuss custom limits for enterprise clients
4. **Self-host**: Deploy your own instance with custom limits

For self-hosted instances, adjust environment variables:

```env
RATE_LIMIT_MAX_REQUESTS=1000  # 10x higher limit
RATE_LIMIT_AUTH_MAX=50        # 10x higher auth limit
```

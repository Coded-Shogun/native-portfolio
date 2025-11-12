# Monitoring & Logging

## 📊 Overview

Career Portfolio Manager Enterprise Edition includes comprehensive structured logging, audit trails, and monitoring capabilities suitable for production deployments and regulatory compliance.

---

## 🪵 Structured Logging (Winston)

### Architecture

```
┌─────────────────────────────────────┐
│      Application Events             │
└──────────────┬──────────────────────┘
               │
    ┌──────────▼────────────┐
    │   Winston Logger      │
    │   (JSON Format)       │
    └──────────┬────────────┘
               │
    ┌──────────┴────────────┐
    │                       │
┌───▼────────┐    ┌────────▼──────┐
│  File Logs │    │  Audit Logs   │
│  (Daily)   │    │  (90-day)     │
└────────────┘    └───────────────┘
```

### Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| **error** | Critical failures | Database connection lost |
| **warn** | Warning conditions | Rate limit exceeded, CORS blocked |
| **info** | Informational | Server started, config loaded |
| **http** | HTTP requests | GET /api/jobs/recommendations 200 12ms |
| **debug** | Debug information | Variable values, flow tracing |

### Log Transports

**Combined Logs** (all levels):
```
backend/logs/combined-2025-11-12.log
backend/logs/combined-2025-11-13.log
...
```

**Error Logs** (errors only):
```
backend/logs/error-2025-11-12.log
backend/logs/error-2025-11-13.log
...
```

**Audit Logs** (compliance):
```
backend/logs/audit/audit-2025-11-12.log
backend/logs/audit/audit-2025-11-13.log
...
```

### Log Rotation

- **Frequency**: Daily
- **Format**: `filename-%DATE%.log`
- **Retention**: 90 days (configurable)
- **Max Size**: 20MB per file
- **Compression**: Optional (gzip)

---

## 🔍 Audit Logging

### What Gets Audited

**Authentication Events**:
- User registration
- Login (success/failure)
- Logout
- Email verification
- Password changes
- Token refresh

**Data Modification Events**:
- Portfolio updates
- Project creation/modification/deletion
- Job applications
- Profile changes

**Security Events**:
- Rate limit exceeded
- Invalid JWT token attempts
- CORS violations
- Failed authentication attempts
- Unauthorized access attempts

### Audit Log Format

```json
{
  "level": "info",
  "message": "AUDIT",
  "timestamp": "2025-11-12T20:30:15.123Z",
  "action": "user_logged_in",
  "userId": "cm3g5h6j7k8l9m0n1p2q3r",
  "details": {
    "email": "user@example.com",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### GDPR Compliance

- ✅ **90-day retention** (configurable)
- ✅ **Separate audit file** (easy to export for compliance)
- ✅ **Immutable logs** (append-only, no editing)
- ✅ **Timestamp on all events**
- ✅ **User linkage** (userId tracked)

---

## 📈 Application Logging

### HTTP Request Logging

Every HTTP request is automatically logged:

```typescript
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
```

**Example Output**:
```json
{
  "level": "http",
  "message": "GET /api/jobs/recommendations",
  "method": "GET",
  "path": "/api/jobs/recommendations",
  "statusCode": 200,
  "duration": "12ms",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "userId": "cm3g5h6j7k8l9m0n1p2q3r",
  "timestamp": "2025-11-12T20:30:15.123Z"
}
```

### Security Event Logging

```typescript
logSecurityEvent('Rate limit exceeded', 'high', {
  ip: req.ip,
  path: req.path,
  userAgent: req.get('user-agent'),
  email: req.body?.email || 'unknown',
});
```

**Severity Levels**:
- `low`: Informational security events
- `medium`: Suspicious activity
- `high`: Likely attack attempts
- `critical`: Confirmed security breaches

### Error Logging

```typescript
try {
  // Operation
} catch (error) {
  logError('Operation failed', error as Error, {
    userId: req.userId,
    operation: 'jobMatch',
  });
  res.status(500).json({ error: 'Internal server error' });
}
```

---

## 🎯 Monitoring Integrations

### Log Aggregation Tools

#### ELK Stack (Elasticsearch, Logstash, Kibana)

**Configuration**:
```yaml
# logstash.conf
input {
  file {
    path => "/app/logs/combined-*.log"
    codec => json
  }
}

filter {
  json {
    source => "message"
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "career-portfolio-%{+YYYY.MM.dd}"
  }
}
```

**Benefits**:
- Full-text search across all logs
- Real-time dashboards
- Alerting on patterns
- Open-source

#### Splunk

**Configuration**:
```conf
[monitor:///app/logs/combined-*.log]
sourcetype = _json
index = career_portfolio
```

**Benefits**:
- Enterprise-grade
- Advanced analytics
- Machine learning anomaly detection
- Compliance reporting

#### AWS CloudWatch

**Configuration**:
```typescript
// Install aws-cloudwatch-winston
import CloudWatchTransport from 'winston-cloudwatch';

logger.add(new CloudWatchTransport({
  logGroupName: '/career-portfolio/production',
  logStreamName: `${process.env.HOSTNAME}-${new Date().toISOString().split('T')[0]}`,
  awsRegion: 'us-east-1',
}));
```

**Benefits**:
- Native AWS integration
- Log insights (SQL queries)
- CloudWatch Alarms
- Cost-effective

#### Datadog

**Configuration**:
```typescript
// Install datadog-winston
import DatadogTransport from 'datadog-winston';

logger.add(new DatadogTransport({
  apiKey: process.env.DATADOG_API_KEY,
  service: 'career-portfolio-api',
  ddsource: 'nodejs',
  ddtags: 'env:production',
}));
```

**Benefits**:
- APM + logs in one platform
- Infrastructure monitoring
- Real-time alerting
- Custom dashboards

---

## 🚨 Health Checks & Monitoring

### Health Check Endpoints

#### `/health` - General Health
```typescript
GET /health

Response:
{
  "uptime": 3600.5,
  "message": "Career Portfolio Manager API is running",
  "timestamp": 1699888888000,
  "status": "ok",
  "database": "connected",
  "environment": "production"
}
```

#### `/ready` - Readiness Probe (Kubernetes)
```typescript
GET /ready

Response:
{
  "ready": true
}
```

Used by Kubernetes to determine if pod can receive traffic.

#### `/live` - Liveness Probe (Kubernetes)
```typescript
GET /live

Response:
{
  "alive": true
}
```

Used by Kubernetes to determine if pod should be restarted.

### Kubernetes Configuration

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: career-portfolio-api
spec:
  containers:
  - name: api
    image: career-portfolio:latest
    livenessProbe:
      httpGet:
        path: /live
        port: 5000
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /ready
        port: 5000
      initialDelaySeconds: 5
      periodSeconds: 5
```

---

## 📊 Monitoring Dashboards

### Recommended Metrics to Track

**Application Metrics**:
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (%)
- Status code distribution (2xx, 4xx, 5xx)

**Security Metrics**:
- Failed authentication attempts
- Rate limit violations
- Invalid token attempts
- CORS violations

**Business Metrics**:
- User registrations
- Job matches created
- Applications submitted
- Portfolio completion rate

**Infrastructure Metrics**:
- CPU usage
- Memory usage
- Database connections
- Disk usage

### Sample Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Career Portfolio API",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## 🔔 Alerting

### Recommended Alerts

**Critical (Immediate Action)**:
- ❗ API error rate > 5% for 5 minutes
- ❗ Database connection lost
- ❗ Memory usage > 90%
- ❗ Disk usage > 90%
- ❗ Health check failing

**High (Action within 1 hour)**:
- ⚠️ API error rate > 1% for 15 minutes
- ⚠️ Response time p95 > 1000ms for 10 minutes
- ⚠️ Failed auth attempts > 100/hour from single IP
- ⚠️ Memory usage > 80%

**Medium (Action within 24 hours)**:
- ⚠️ Response time p95 > 500ms for 30 minutes
- ⚠️ Rate limit violations > 100/hour
- ⚠️ Database connections > 80% of pool

### Alert Configuration Examples

#### Datadog Alert
```yaml
name: "High Error Rate"
query: "avg(last_5m):sum:api.errors{env:production}.as_rate() > 0.05"
message: "API error rate is above 5% @pagerduty @slack-alerts"
```

#### CloudWatch Alarm
```typescript
const alarm = new cloudwatch.Alarm(this, 'HighErrorRate', {
  metric: errorMetric,
  threshold: 5,
  evaluationPeriods: 2,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
  actionsEnabled: true,
});
```

#### Prometheus Alert
```yaml
groups:
- name: api_alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    annotations:
      summary: "High API error rate detected"
```

---

## 🔧 Log Analysis Examples

### Find Failed Logins
```bash
grep "user_login_failed" backend/logs/audit-*.log | jq .
```

### Count Requests by Path
```bash
cat backend/logs/combined-*.log | jq -r '.path' | sort | uniq -c | sort -nr
```

### Find Slow Requests (>100ms)
```bash
cat backend/logs/combined-*.log | jq 'select(.duration | tonumber > 100) | {path, duration, timestamp}'
```

### Security Events by Severity
```bash
grep "SECURITY EVENT" backend/logs/combined-*.log | jq 'select(.severity == "high")'
```

---

## 🎯 Best Practices

### Do's ✅

- ✅ Use structured logging (JSON format)
- ✅ Include request ID for tracing
- ✅ Log at appropriate levels
- ✅ Sanitize sensitive data (passwords, tokens)
- ✅ Use log aggregation tools
- ✅ Set up alerts for critical issues
- ✅ Regular log review
- ✅ Compliance-friendly retention (90 days)

### Don'ts ❌

- ❌ Don't log passwords or secrets
- ❌ Don't log personally identifiable information (PII) unnecessarily
- ❌ Don't use console.log in production
- ❌ Don't ignore log rotation (disk will fill)
- ❌ Don't log too verbosely (impacts performance)
- ❌ Don't skip monitoring setup

---

## 📚 Accessing Logs

### Local Development
```bash
# Tail combined logs
tail -f backend/logs/combined-$(date +%Y-%m-%d).log

# Tail error logs
tail -f backend/logs/error-$(date +%Y-%m-%d).log

# Tail audit logs
tail -f backend/logs/audit/audit-$(date +%Y-%m-%d).log
```

### Production (Docker)
```bash
# View logs from container
docker logs career-portfolio-api -f

# Copy logs from container
docker cp career-portfolio-api:/app/logs ./logs-backup
```

### Production (Kubernetes)
```bash
# View logs from pod
kubectl logs career-portfolio-api-xxxxxx -f

# View logs from previous pod (if crashed)
kubectl logs career-portfolio-api-xxxxxx --previous
```

---

## Next Steps

- [Enterprise Migration Guide →](./enterprise-migration.md)
- [Performance Optimization →](./performance-optimization.md)
- [Enterprise Security →](./enterprise-security.md)
- [Compliance Certifications →](./compliance-certifications.md)

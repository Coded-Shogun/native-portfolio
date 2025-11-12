# API Introduction

## Overview

The Career Portfolio Manager API is a RESTful API that powers the platform's unemployment-solving features.

**Base URL**: `http://localhost:5000/api` (development)

**Production URL**: `https://api.career-portfolio-manager.com/api`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

[Learn more about authentication →](./authentication.md)

## Request Format

**Content-Type**: `application/json`

**Example**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Response Format

All responses are JSON:

### Success Response

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Error Response

```json
{
  "error": "Invalid credentials"
}
```

[Learn more about error handling →](./error-handling.md)

## Rate Limiting

Currently no rate limiting in development. Production will have:

- **100 requests/minute** per IP for unauthenticated endpoints
- **1000 requests/minute** per user for authenticated endpoints

## API Sections

### Authentication
- [Register](./auth/register.md)
- [Login](./auth/login.md)
- [Verify Email](./auth/verify-email.md)

### Portfolio Management
- [Get Portfolio](./portfolio/get-portfolio.md)
- [Update Portfolio](./portfolio/update-portfolio.md)
- [Manage Projects](./portfolio/projects.md)
- [Manage Skills](./portfolio/skills.md)
- [Manage Work History](./portfolio/work-history.md)
- [Manage Certifications](./portfolio/certifications.md)
- [Manage Achievements](./portfolio/achievements.md)

### Job-Getting Features
- [Job Recommendations](./jobs/recommendations.md)
- [Job Applications](./jobs/applications.md)
- [Saved Jobs](./jobs/saved-jobs.md)
- [Career Preferences](./career/preferences.md)
- [Skills Gap Analysis](./skills-gap/analyze.md)

## Quick Start

### 1. Register
```bash
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

### 2. Login
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "Password123!"
}

# Response includes token
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {...}
}
```

### 3. Get Job Recommendations
```bash
GET /api/jobs/recommendations
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Response
{
  "matches": [
    {
      "job": {...},
      "matchScore": 85,
      "matchReasons": ["Strong skills match", ...],
      "missingSkills": ["Kubernetes"]
    }
  ]
}
```

## Next Steps

- [Authentication](./authentication.md)
- [Error Handling](./error-handling.md)
- [Job Recommendations](./jobs/recommendations.md)

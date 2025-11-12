# API Authentication

## Overview

The API uses JWT (JSON Web Tokens) for authentication.

## Authentication Flow

1. **Register** or **Login** to receive a JWT token
2. **Store token** in client (localStorage, memory, etc.)
3. **Include token** in subsequent requests
4. **Token expires** after 7 days

## Getting a Token

### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response**:
```json
{
  "message": "Registration successful. Please check your email to verify your account."
}
```

After email verification, login to get token.

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

## Using the Token

Include token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example**:
```bash
GET /api/portfolio
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Protected Endpoints

All endpoints except the following require authentication:

### Public Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/verify-email/:token`
- `GET /api/portfolio/public/:username` (view public portfolio)

### Protected Endpoints
All other endpoints require valid JWT token.

## Token Expiration

Tokens expire after **7 days**.

When a token expires:

**Response**:
```json
{
  "error": "Token expired. Please log in again."
}
```

**Status Code**: 401 Unauthorized

**Action**: User must log in again to get new token.

## Token Refresh

Currently, tokens cannot be refreshed. User must log in again after expiration.

**Future**: Implement refresh tokens for better UX.

## Security Best Practices

### Client-Side

✅ **Do**:
- Store token securely (httpOnly cookie in production)
- Clear token on logout
- Handle 401 responses by redirecting to login
- Use HTTPS in production

❌ **Don't**:
- Store token in localStorage in production (XSS risk)
- Send token in URL parameters
- Share tokens between users

### Server-Side

- Tokens are signed with secret key
- Verify signature on every request
- Include user ID in token payload
- Set reasonable expiration time

## Error Responses

### Missing Token

**Status**: 401 Unauthorized

```json
{
  "error": "No token provided"
}
```

### Invalid Token

**Status**: 401 Unauthorized

```json
{
  "error": "Invalid token"
}
```

### Expired Token

**Status**: 401 Unauthorized

```json
{
  "error": "Token expired. Please log in again."
}
```

## Example: Frontend Implementation

```typescript
// Store token after login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);

// Use token in subsequent requests
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Next Steps

- [Register endpoint](./auth/register.md)
- [Login endpoint](./auth/login.md)
- [Error handling](./error-handling.md)

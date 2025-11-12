# Login

Authenticate user and receive JWT token.

## Endpoint

```
POST /api/auth/login
```

**Authentication**: Not required (public endpoint)

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

## Example Request

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

## Success Response

**Status**: 200 OK

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1dWlkIiwiaWF0IjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "emailVerified": true
  }
}
```

## Error Responses

### Invalid Credentials

**Status**: 401 Unauthorized

```json
{
  "error": "Invalid email or password"
}
```

### Email Not Verified

**Status**: 401 Unauthorized

```json
{
  "error": "Please verify your email before logging in"
}
```

### Missing Fields

**Status**: 400 Bad Request

```json
{
  "error": "Email and password are required"
}
```

## Token Usage

Store the returned token and include it in subsequent API requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token expiration**: 7 days

[Learn more about authentication →](../authentication.md)

## Example: Frontend Usage

```typescript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'Password123!'
  })
});

const { token, user } = await response.json();

// Store token
localStorage.setItem('token', token);

// Use in subsequent requests
const portfolioResponse = await fetch('/api/portfolio', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Security Notes

- Passwords are hashed with bcrypt
- Failed login attempts are logged (future: rate limiting)
- Use HTTPS in production
- Tokens are signed and verified

## Next Steps

- [Get portfolio](../portfolio/get-portfolio.md)
- [Get job recommendations](../jobs/recommendations.md)
- [Set career preferences](../career/preferences.md)

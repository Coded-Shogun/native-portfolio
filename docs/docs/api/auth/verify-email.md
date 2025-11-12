# Verify Email

Verify user's email address after registration.

## Endpoint

```
GET /api/auth/verify-email/:token
```

**Authentication**: Not required (public endpoint)

## URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | Verification token from email |

## Example Request

```bash
curl http://localhost:5000/api/auth/verify-email/abc123verificationtoken456
```

## Success Response

**Status**: 200 OK

```json
{
  "message": "Email verified successfully. You can now log in."
}
```

## Error Responses

### Invalid Token

**Status**: 400 Bad Request

```json
{
  "error": "Invalid or expired verification token"
}
```

### Already Verified

**Status**: 400 Bad Request

```json
{
  "error": "Email already verified"
}
```

## Email Verification Flow

1. User registers via `/api/auth/register`
2. System sends verification email
3. User clicks link in email
4. Link points to frontend: `/verify-email?token=abc123`
5. Frontend calls this API endpoint
6. Backend verifies token and activates account
7. User can now log in

## Frontend Implementation

```typescript
// Extract token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Call verification endpoint
const response = await fetch(`/api/auth/verify-email/${token}`);

if (response.ok) {
  // Show success message
  alert('Email verified! You can now log in.');
  // Redirect to login
  window.location.href = '/login';
} else {
  // Show error
  const { error } = await response.json();
  alert(error);
}
```

## Next Steps

- [Log in](./login.md) after verification
- [Register](./register.md) a new account

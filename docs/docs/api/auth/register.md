# Register

Create a new user account.

## Endpoint

```
POST /api/auth/register
```

**Authentication**: Not required (public endpoint)

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | Yes | User's first name |
| lastName | string | Yes | User's last name |
| email | string | Yes | Valid email address |
| password | string | Yes | Minimum 8 characters, uppercase, lowercase, number |

## Example Request

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

## Success Response

**Status**: 201 Created

```json
{
  "message": "Registration successful. Please check your email to verify your account."
}
```

## Error Responses

### Email Already Exists

**Status**: 409 Conflict

```json
{
  "error": "User with this email already exists"
}
```

### Invalid Input

**Status**: 400 Bad Request

```json
{
  "error": "Password must be at least 8 characters with uppercase, lowercase, and numbers"
}
```

### Missing Fields

**Status**: 400 Bad Request

```json
{
  "error": "Email is required"
}
```

## Validation Rules

### Email
- Must be valid email format
- Must be unique

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special characters optional but recommended

### First Name & Last Name
- Required
- Minimum 2 characters

## Email Verification

After registration:

1. Verification email sent to provided address
2. User must click verification link
3. Account activated
4. User can then [log in](./login.md)

**Note**: User cannot log in until email is verified.

## Next Steps

- [Verify email](./verify-email.md)
- [Log in](./login.md)

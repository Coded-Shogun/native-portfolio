# Error Handling

## Error Response Format

All errors follow consistent format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## HTTP Status Codes

### 200 OK
Request succeeded

### 201 Created
Resource created successfully

### 400 Bad Request
Invalid input data

**Example**:
```json
{
  "error": "Email is required"
}
```

### 401 Unauthorized
Missing or invalid authentication

**Example**:
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
Authenticated but not authorized

**Example**:
```json
{
  "error": "You don't have permission to access this resource"
}
```

### 404 Not Found
Resource doesn't exist

**Example**:
```json
{
  "error": "Portfolio not found"
}
```

### 409 Conflict
Resource already exists

**Example**:
```json
{
  "error": "User with this email already exists"
}
```

### 500 Internal Server Error
Server error

**Example**:
```json
{
  "error": "Internal server error"
}
```

## Common Errors

### Authentication Errors

**No token provided**:
```json
{
  "error": "No token provided"
}
```
**Status**: 401

**Solution**: Include Authorization header with Bearer token

---

**Invalid token**:
```json
{
  "error": "Invalid token"
}
```
**Status**: 401

**Solution**: Log in again to get new token

---

**Token expired**:
```json
{
  "error": "Token expired. Please log in again."
}
```
**Status**: 401

**Solution**: Log in again

### Validation Errors

**Missing required field**:
```json
{
  "error": "Email is required"
}
```
**Status**: 400

---

**Invalid email format**:
```json
{
  "error": "Invalid email format"
}
```
**Status**: 400

---

**Password too weak**:
```json
{
  "error": "Password must be at least 8 characters with uppercase, lowercase, and numbers"
}
```
**Status**: 400

### Resource Errors

**Not found**:
```json
{
  "error": "Portfolio not found"
}
```
**Status**: 404

---

**Already exists**:
```json
{
  "error": "User with this email already exists"
}
```
**Status**: 409

## Error Handling Best Practices

### Client-Side

```typescript
try {
  const response = await api.post('/auth/login', { email, password });
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;

    if (status === 400) {
      // Show validation error to user
      showError(data.error);
    } else if (status === 401) {
      // Redirect to login
      redirectToLogin();
    } else if (status === 500) {
      // Show generic error
      showError('Something went wrong. Please try again.');
    }
  } else {
    // Network error
    showError('Network error. Please check your connection.');
  }
}
```

### Server-Side

Errors are handled by centralized error handler middleware.

## Debugging Errors

In development, errors include stack traces:

```json
{
  "error": "User not found",
  "stack": "Error: User not found\n    at ..."
}
```

**Note**: Stack traces are hidden in production for security.

## Next Steps

- [API Introduction](./introduction.md)
- [Authentication](./authentication.md)

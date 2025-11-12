# Authentication

## JWT-Based Authentication

### Registration Flow

1. User submits registration form
2. Server validates input
3. Password is hashed with bcrypt
4. User created in database
5. Verification email sent
6. User clicks link to verify email

### Login Flow

1. User submits credentials
2. Server validates email and password
3. JWT token generated
4. Token returned to client
5. Client stores token in localStorage

### Protected Routes

Backend middleware verifies JWT:

```typescript
// backend/src/middleware/auth.middleware.ts
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  req.userId = decoded.userId;
  next();
};
```

Frontend context manages auth state:

```typescript
// frontend/src/contexts/AuthContext.tsx
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // login, logout, etc.
};
```

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- HTTPS required in production
- Email verification required

## Next Steps

- [Learn about protected routes](./project-structure.md)
- [Understand middleware](./project-structure.md#backend)

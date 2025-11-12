# Running Locally

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Coded-Shogun/native-portfolio.git
cd native-portfolio

# 2. Install dependencies
npm install

# 3. Set up database
cd backend
cp .env.example .env
# Edit .env with your database credentials
npx prisma migrate dev

# 4. Start backend (in one terminal)
npm run dev

# 5. Start frontend (in another terminal)
cd ../frontend
npm run dev
```

Visit http://localhost:5173

## Detailed Steps

### 1. Database Setup

Create PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE career_portfolio;
\q
```

Configure `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/career_portfolio"
JWT_SECRET="your-secret-key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

Run migrations:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed  # Optional: add demo data
```

### 2. Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server running on http://localhost:5000
Database connected successfully
```

**Available at**: http://localhost:5000/api

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

**Available at**: http://localhost:5173

## Development Workflow

### Making Changes

**Backend changes**:
1. Edit files in `backend/src/`
2. Server auto-restarts (nodemon)
3. Test with API client or frontend

**Frontend changes**:
1. Edit files in `frontend/src/`
2. Browser auto-refreshes (HMR)
3. See changes instantly

**Database changes**:
1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Prisma generates new TypeScript types
4. Restart backend server

### Testing Changes

**Unit tests**:
```bash
cd backend
npm test
```

**E2E tests**:
```bash
cd frontend
npm run test:e2e
```

### Debugging

**Backend debugging**:
1. Add `console.log()` or `debugger`
2. Check terminal output
3. Use Prisma Studio: `npx prisma studio`

**Frontend debugging**:
1. Open browser DevTools (F12)
2. Check Console tab for logs
3. Use React DevTools extension

### Common Issues

**Port already in use**:
```bash
# Find and kill process
lsof -i :5000  # Backend
lsof -i :5173  # Frontend
kill -9 <PID>
```

**Database connection failed**:
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check database exists

**Module not found**:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## Development Tools

### Prisma Studio

Visual database editor:
```bash
cd backend
npx prisma studio
```

Opens at http://localhost:5555

### API Testing

Test endpoints with:
- Thunder Client (VS Code extension)
- Postman
- cURL

Example:
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

## Environment Variables

### Backend (.env)

```env
# Required
DATABASE_URL="postgresql://..."
JWT_SECRET="random-secret-key"

# Email (for development, use Mailtrap or similar)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your-mailtrap-user"
SMTP_PASS="your-mailtrap-pass"

# Optional
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## Hot Reload

**Backend**: Uses `nodemon` - auto-restarts on file changes

**Frontend**: Uses Vite HMR - instant updates without refresh

## Database Management

### Reset database

```bash
cd backend
npx prisma migrate reset
```

**Warning**: Deletes all data!

### View migrations

```bash
npx prisma migrate status
```

### Generate Prisma Client

After schema changes:
```bash
npx prisma generate
```

## Next Steps

- [Understand project structure](./project-structure.md)
- [Learn about testing](./testing.md)
- [Explore deployment options](./deployment.md)
- [Read contributing guidelines](./contributing.md)

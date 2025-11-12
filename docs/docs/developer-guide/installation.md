# Installation

## Prerequisites

Before installing, ensure you have:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

Verify installations:

```bash
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
psql --version  # Should be 14.x or higher
git --version   # Any recent version
```

## Clone Repository

```bash
git clone https://github.com/Coded-Shogun/native-portfolio.git
cd native-portfolio
```

## Install Dependencies

This is a monorepo using npm workspaces:

```bash
# Install all dependencies (backend + frontend)
npm install
```

This installs dependencies for:
- Root workspace
- Backend (backend/package.json)
- Frontend (frontend/package.json)

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE career_portfolio;

# Create user (optional but recommended)
CREATE USER portfolio_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE career_portfolio TO portfolio_user;

# Exit psql
\q
```

### 2. Configure Environment Variables

Create `.env` file in `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://portfolio_user:your_password@localhost:5432/career_portfolio"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email (for user verification)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
SMTP_FROM="Career Portfolio <noreply@career-portfolio.com>"

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for email links)
FRONTEND_URL="http://localhost:5173"
```

**Important**:
- Change `JWT_SECRET` to a strong random string
- Set up SMTP credentials for email verification
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)

### 3. Run Database Migrations

```bash
cd backend
npx prisma migrate dev
```

This creates all database tables based on the schema.

### 4. Seed Database (Optional)

Add demo data:

```bash
npx prisma db seed
```

This creates:
- Demo user account
- Sample portfolios
- Test job listings
- Example matches

## Frontend Configuration

Create `.env` file in `frontend/` directory:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Verify Installation

### 1. Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server running on http://localhost:5000
Database connected successfully
```

### 2. Start Frontend (in new terminal)

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Test in Browser

Open http://localhost:5173

You should see the landing page. Try:
- ✅ Registering a new account
- ✅ Logging in
- ✅ Creating a portfolio
- ✅ Viewing job recommendations

## Development Tools

### Prisma Studio (Database GUI)

View and edit database records:

```bash
cd backend
npx prisma studio
```

Opens at http://localhost:5555

### Database Reset

Reset database to clean state:

```bash
cd backend
npx prisma migrate reset
```

**Warning**: This deletes all data!

## Troubleshooting

### Database Connection Failed

**Error**: `Can't reach database server`

**Solutions**:
1. Ensure PostgreSQL is running: `sudo service postgresql start`
2. Check DATABASE_URL in .env
3. Verify database exists: `psql -U postgres -l`
4. Check PostgreSQL logs

### Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solutions**:
1. Kill process on port:
   ```bash
   # Find process
   lsof -i :5000  # or :5173 for frontend

   # Kill it
   kill -9 <PID>
   ```
2. Or change PORT in backend/.env

### Migration Errors

**Error**: `Migration failed to apply`

**Solutions**:
1. Check database connection
2. Reset migrations: `npx prisma migrate reset`
3. Check schema syntax
4. Ensure database user has permissions

### SMTP Errors (Email)

**Error**: `Invalid login` or `Authentication failed`

**Solutions**:
1. Use app-specific password for Gmail
2. Enable "Less secure app access" (not recommended)
3. Use a different SMTP provider (SendGrid, Mailgun)
4. For development, use tools like [Mailtrap](https://mailtrap.io/)

### TypeScript Errors

**Error**: Various TS errors

**Solutions**:
1. Ensure TypeScript installed: `npm install -D typescript`
2. Regenerate Prisma client: `npx prisma generate`
3. Restart TS server in your editor
4. Check tsconfig.json

## Next Steps

- [Understand project structure](./project-structure.md)
- [Learn about authentication](./authentication.md)
- [Run tests](./testing.md)
- [Start developing](./running-locally.md)

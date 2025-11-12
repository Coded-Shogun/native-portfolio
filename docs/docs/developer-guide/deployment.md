# Deployment

## Production Deployment

### Prerequisites

- PostgreSQL database
- Node.js 18+ hosting
- Environment variables configured

### Backend Deployment

1. Set production environment variables
2. Run migrations: `npx prisma migrate deploy`
3. Build: `npm run build`
4. Start: `npm start`

### Frontend Deployment

1. Set VITE_API_URL to production API
2. Build: `npm run build`
3. Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)

### Environment Variables

Set in production environment (not .env file):

- `DATABASE_URL`
- `JWT_SECRET`
- `SMTP_*` variables
- `NODE_ENV=production`

## Docker Deployment

See Dockerfile for containerization.

## Next Steps

- [Configure environment](./configuration.md)
- [Run tests before deploying](./testing.md)

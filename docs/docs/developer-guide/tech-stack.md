# Technology Stack

## Overview

Career Portfolio Manager is a full-stack TypeScript application built for performance, type safety, and developer experience.

## Frontend

### React 18

**Why**: Industry standard, component-based UI library with great ecosystem

**Features used**:
- Functional components
- Hooks (useState, useEffect, useContext, custom hooks)
- Context API for auth state
- Strict mode for better development experience

### TypeScript

**Why**: Type safety prevents bugs, better IDE support, self-documenting code

**Benefits**:
- Catch errors at compile time
- Better autocomplete
- Easier refactoring
- Clear interfaces

### Tailwind CSS

**Why**: Utility-first CSS for rapid development, consistent design, small bundle size

**Features**:
- Responsive design utilities
- Dark mode support (future)
- Custom configuration
- JIT compiler for performance

### React Router v6

**Why**: Client-side routing for SPA experience

**Features**:
- Protected routes for authentication
- Nested routes
- URL parameters
- Programmatic navigation

### React Hook Form

**Why**: Performant form management with validation

**Benefits**:
- Minimal re-renders
- Easy validation
- TypeScript support
- Great DX

### Axios

**Why**: Promise-based HTTP client with interceptors

**Features**:
- Request/response interceptors for auth
- Automatic JSON transformation
- Error handling
- Base URL configuration

### Additional Libraries

- **lucide-react**: Modern icon library
- **react-hot-toast**: Toast notifications
- **date-fns**: Date formatting and manipulation

## Backend

### Node.js + Express

**Why**: JavaScript everywhere, large ecosystem, proven at scale

**Features**:
- RESTful API design
- Middleware architecture
- JSON responses
- Error handling

### TypeScript

**Why**: Same benefits as frontend, plus API contract enforcement

**Features**:
- Shared types with frontend
- Type-safe database queries
- Better refactoring

### Prisma ORM

**Why**: Modern ORM with excellent TypeScript support

**Benefits**:
- Type-safe database queries
- Auto-generated TypeScript types
- Migrations system
- Prisma Studio GUI
- Query optimization

**Example**:
```typescript
const portfolio = await prisma.portfolio.findUnique({
  where: { userId },
  include: {
    skills: true,
    projects: true,
    workHistory: true
  }
});
// portfolio is fully typed!
```

### PostgreSQL

**Why**: Robust, ACID-compliant, great for complex queries

**Features used**:
- Relational data model
- Foreign keys and constraints
- JSON support for flexible fields
- Full-text search (future)
- Transactions

### JWT (jsonwebtoken)

**Why**: Stateless authentication, scalable

**Flow**:
1. User logs in
2. Server issues JWT
3. Client includes JWT in requests
4. Server verifies JWT

### Nodemailer

**Why**: Send email verification and notifications

**Features**:
- SMTP support
- HTML emails
- Attachment support

### Bcrypt

**Why**: Secure password hashing

**Features**:
- Salted hashing
- Configurable rounds
- Secure by design

## Testing

### Jest

**Why**: Comprehensive testing framework

**Features**:
- Unit testing
- Mocking
- Coverage reports
- Snapshot testing
- Watch mode

### Supertest

**Why**: HTTP assertion library for API testing

**Example**:
```typescript
const response = await request(app)
  .post('/api/auth/login')
  .send({ email, password })
  .expect(200);
```

### Cypress

**Why**: E2E testing with great developer experience

**Features**:
- Real browser testing
- Time travel debugging
- Automatic waiting
- Custom commands

## Build Tools

### Vite

**Why**: Next-gen frontend build tool, incredibly fast

**Benefits**:
- Instant server start
- Lightning fast HMR
- Optimized builds
- Built-in TypeScript support

**vs Webpack**: 10-100x faster in development

### ts-node

**Why**: Run TypeScript directly in Node.js

**Used for**:
- Development server
- Scripts
- Testing

## Development Tools

### ESLint

**Why**: Code quality and consistency

**Rules**:
- TypeScript-specific rules
- React hooks rules
- Import order
- Unused vars

### Prettier (optional)

**Why**: Code formatting

**Benefits**:
- Consistent style
- No debates
- Auto-fix on save

### Prisma Studio

**Why**: Visual database management

**Features**:
- Browse records
- Edit data
- Run queries
- View relationships

## Infrastructure (Production)

### Docker

**Why**: Consistent environments, easy deployment

**Containers**:
- Backend API
- Frontend (Nginx)
- PostgreSQL

### Environment Variables

**Why**: Configuration management

**Files**:
- `.env` for local development
- Environment-specific configs for production

## Architecture Patterns

### Layered Architecture

```
Routes → Controllers → Services → Database
```

**Routes**: Define endpoints
**Controllers**: Handle requests/responses
**Services**: Business logic
**Database**: Data persistence

### JWT Middleware

**Pattern**: Middleware validates JWT before protected routes

```typescript
router.get('/portfolio', authMiddleware, getPortfolio);
```

### Error Handling

**Pattern**: Centralized error handler middleware

```typescript
app.use(errorHandler);
```

### Type Sharing

**Pattern**: Shared types between frontend and backend

```typescript
// backend defines
export interface Portfolio {
  id: string;
  title: string;
  // ...
}

// frontend imports
import type { Portfolio } from '@types';
```

## Why These Choices?

### TypeScript Everywhere

**Benefit**: Type safety across entire stack, shared types

### React + Tailwind

**Benefit**: Fast development, component reusability, consistent design

### Prisma + PostgreSQL

**Benefit**: Type-safe queries, powerful relational capabilities

### JWT Authentication

**Benefit**: Stateless, scalable, mobile-friendly

### Jest + Cypress

**Benefit**: Comprehensive testing at all levels

## Trade-offs

### TypeScript
**Pro**: Type safety, better DX
**Con**: Learning curve, more verbose

**Verdict**: Worth it for medium+ projects

### Tailwind
**Pro**: Fast development, small bundle
**Con**: HTML can look cluttered

**Verdict**: Great for rapid development

### Prisma
**Pro**: Amazing DX, type safety
**Con**: Another abstraction layer

**Verdict**: Best ORM for TypeScript

### Monorepo
**Pro**: Shared code, single repo
**Con**: More complex setup

**Verdict**: Good for full-stack projects

## Next Steps

- [Understand project structure](./project-structure.md)
- [Learn authentication flow](./authentication.md)
- [Explore job matching algorithm](./job-matching-algorithm.md)

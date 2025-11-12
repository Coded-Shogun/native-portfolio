# Project Structure

## Repository Overview

```
native-portfolio/
├── backend/              # Node.js API server
├── frontend/             # React application
├── docs/                 # Docusaurus documentation
├── package.json          # Workspace configuration
└── README.md
```

## Backend Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── portfolio.controller.ts
│   │   ├── jobs.controller.ts
│   │   ├── careerPreferences.controller.ts
│   │   └── skillsGap.controller.ts
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.ts
│   │   └── errorHandler.ts
│   │
│   ├── routes/           # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── portfolio.routes.ts
│   │   ├── jobs.routes.ts
│   │   └── index.ts
│   │
│   ├── utils/            # Helper functions
│   │   ├── jobMatching.ts          # AI matching algorithm
│   │   ├── skillsGapAnalysis.ts    # Skills gap engine
│   │   ├── email.ts                # Email sending
│   │   └── validation.ts           # Input validation
│   │
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   │
│   ├── __tests__/        # Test files
│   │   ├── unit/
│   │   └── integration/
│   │
│   └── index.ts          # Entry point
│
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Seed data
│
├── .env                  # Environment variables
├── tsconfig.json         # TypeScript config
├── package.json          # Dependencies
└── jest.config.js        # Test configuration
```

## Frontend Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   │
│   ├── pages/            # Route pages
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── PortfolioEditor.tsx
│   │   ├── JobRecommendations.tsx
│   │   ├── SkillsGapAnalysis.tsx
│   │   ├── MyApplications.tsx
│   │   └── CareerPreferences.tsx
│   │
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   │
│   ├── utils/            # Helper functions
│   │   ├── api.ts        # Axios configuration
│   │   └── ...
│   │
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   │
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
│
├── cypress/              # E2E tests
│   ├── e2e/
│   │   ├── auth.cy.ts
│   │   ├── job-getting-journey.cy.ts
│   │   └── portfolio-management.cy.ts
│   ├── support/
│   │   ├── commands.ts
│   │   └── e2e.ts
│   └── cypress.config.ts
│
├── .env                  # Environment variables
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies
```

## Key Files Explained

### Backend

**`src/index.ts`** - Server entry point
- Express app setup
- Middleware registration
- Route mounting
- Database connection
- Server start

**`src/routes/index.ts`** - API routes registry
- Mounts all route modules
- Defines base paths

**`src/middleware/auth.middleware.ts`** - Authentication
- Verifies JWT tokens
- Attaches user ID to request
- Protects routes

**`src/utils/jobMatching.ts`** - Job matching algorithm
- Calculates match scores
- Generates recommendations
- Core unemployment-solving logic

**`prisma/schema.prisma`** - Database schema
- Defines all models
- Relationships
- Constraints

### Frontend

**`src/main.tsx`** - App entry point
- React DOM rendering
- Root component mounting

**`src/App.tsx`** - Root component
- Routing configuration
- Auth provider wrapper
- Global layout

**`src/contexts/AuthContext.tsx`** - Auth state
- Login/logout functions
- User state management
- Token storage

**`src/utils/api.ts`** - API client
- Axios instance
- Base URL configuration
- Auth token interceptor

## Import Paths

### Backend

```typescript
// Absolute imports from src/
import { authMiddleware } from '@/middleware/auth.middleware';
import { calculateJobMatch } from '@/utils/jobMatching';
```

### Frontend

```typescript
// Absolute imports from src/
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
```

## Adding New Features

### Backend Endpoint

1. Create controller in `src/controllers/`
2. Define routes in `src/routes/`
3. Add middleware if needed
4. Update Prisma schema if database changes
5. Write tests

### Frontend Page

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Create API calls in page or utility
4. Style with Tailwind
5. Write Cypress tests

## Next Steps

- [Learn authentication flow](./authentication.md)
- [Explore job matching algorithm](./job-matching-algorithm.md)
- [Understand database schema](./database-schema.md)

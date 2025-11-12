# Developer Guide - Introduction

Welcome to the Career Portfolio Manager developer documentation! This guide will help you understand, set up, and contribute to the platform.

## Project Mission

**Career Portfolio Manager is built to solve unemployment** by connecting professionals with job opportunities through:

- AI-powered job matching
- Skills gap analysis and learning recommendations
- Portfolio showcase and management
- Application tracking

## Architecture Overview

Career Portfolio Manager is a full-stack TypeScript application:

```
┌─────────────────────────────────────────┐
│          Frontend (React)               │
│  - React 18 + TypeScript                │
│  - Tailwind CSS                          │
│  - React Router, React Hook Form        │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────────┐
│       Backend API (Node.js)             │
│  - Express + TypeScript                  │
│  - JWT Authentication                    │
│  - AI Matching Algorithm                 │
└──────────────┬──────────────────────────┘
               │ Prisma ORM
┌──────────────▼──────────────────────────┐
│         Database (PostgreSQL)           │
│  - User data, Portfolios                 │
│  - Jobs, Applications, Matches          │
└─────────────────────────────────────────┘
```

## Key Features

### For Users (Job Seekers)

1. **Portfolio Management** - Build comprehensive professional portfolios
2. **AI Job Matching** - Get matched to jobs with 0-100% match scores
3. **Skills Gap Analysis** - Identify skills to learn for target roles
4. **Application Tracking** - Manage job search pipeline

### For Recruiters

1. **Browse Portfolios** - Search and filter qualified candidates
2. **Post Jobs** - Create job listings
3. **View Matches** - See candidates matched to jobs
4. **Track Hiring** - Monitor recruitment pipeline

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Nodemailer** - Email service

### Testing
- **Jest** - Unit testing
- **Supertest** - API testing
- **Cypress** - E2E testing

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD (future)

## Repository Structure

```
native-portfolio/
├── backend/           # Node.js API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth, validation
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Helpers, algorithms
│   │   └── index.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
├── frontend/          # React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Route pages
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Helpers
│   └── package.json
│
├── docs/              # Docusaurus documentation
│   └── docs/          # Documentation pages
│
└── package.json       # Workspace root
```

## Core Concepts

### AI Job Matching Algorithm

The matching algorithm calculates a 0-100% match score based on:

- **Skills Match (40%)** - Required skills you have
- **Experience Level (20%)** - Years of experience alignment
- **Location (15%)** - Geographic/remote fit
- **Work Type (10%)** - Remote/hybrid/on-site preference
- **Salary (10%)** - Compensation alignment
- **Certifications (5%)** - Relevant credentials

[Learn more →](./job-matching-algorithm.md)

### Skills Gap Analysis

Compares user's current skills against target role requirements:

1. Analyzes role-specific skill databases
2. Identifies missing and weak skills
3. Calculates readiness score (0-100%)
4. Generates learning recommendations
5. Estimates time to job-ready

[Learn more →](./skills-gap-engine.md)

### Portfolio Completion

Encourages profile completion through gamification:

- Calculates completion percentage
- Shows missing sections
- Highlights high-impact additions
- Updates job matches as profile improves

## Development Workflow

1. **Clone repository**
2. **Install dependencies** (`npm install`)
3. **Set up database** (PostgreSQL)
4. **Run migrations** (`npx prisma migrate dev`)
5. **Start backend** (`npm run dev` in backend/)
6. **Start frontend** (`npm run dev` in frontend/)
7. **Make changes**
8. **Write tests**
9. **Run tests** (`npm test`)
10. **Submit PR**

[Detailed setup →](./installation.md)

## Contributing

We welcome contributions! See [Contributing Guide](./contributing.md) for:

- Code style guidelines
- Git workflow
- PR process
- Testing requirements
- Documentation standards

## Getting Help

- **Documentation**: You're reading it!
- **Issues**: [GitHub Issues](https://github.com/Coded-Shogun/native-portfolio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Coded-Shogun/native-portfolio/discussions)

## Next Steps

1. [Check prerequisites](./prerequisites.md)
2. [Install and configure](./installation.md)
3. [Understand the architecture](./project-structure.md)
4. [Start developing](./running-locally.md)

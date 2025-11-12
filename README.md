# Career Portfolio Manager

**🎯 Mission: Solving Unemployment Through Technology**

A full-stack marketplace platform that goes beyond portfolios - it actively helps professionals get hired through AI-powered job matching, skills gap analysis, and application tracking. Built with React, Node.js, Express, PostgreSQL, and Prisma.

## 🚀 Job-Getting Features (NEW!)

**The platform isn't just about showing what you've done - it's about getting you hired.**

### AI-Powered Job Matching
- **Smart Recommendations**: Algorithm analyzes your skills, experience, and preferences to match you with relevant jobs
- **Match Scoring**: See exactly why a job is a good fit (60-100% match scores)
- **Gap Analysis**: Identify missing skills and get personalized learning recommendations
- **Improvement Suggestions**: Get actionable advice to increase your match score

### Application Tracking System
- **Centralized Dashboard**: Track all your applications in one place
- **Status Management**: Monitor progress from submission to offer
- **Interview Scheduling**: Keep track of interview dates and stages
- **Analytics**: See how many applications submitted, interviews scheduled, offers received
- **Success Metrics**: Track time-to-hire and placement rates

### Career Development Tools
- **Skills Gap Analysis**: Compare your skills against target roles
- **Learning Recommendations**: Get curated course and certification suggestions
- **Readiness Score**: Know exactly how prepared you are for your dream job
- **Career Preferences**: Set desired roles, locations, salary expectations
- **Industry Trends**: Stay updated on in-demand skills and market trends

### Profile Optimization
- **Completion Tracking**: Real-time score showing how complete your profile is
- **Gamification**: Badges, milestones, and achievements to encourage profile completion
- **Profile Views Analytics**: See who's viewing your portfolio (recruiters vs. others)
- **SEO-Optimized**: Shareable links that rank well in search engines

## Core Portfolio Features

### For Professionals
- **Comprehensive Portfolio Management**
  - Create and customize your professional profile
  - Showcase projects with descriptions, technologies, and links
  - Add certifications with credential validation
  - Document work history and achievements
  - Highlight skills with proficiency levels

- **Profile Completion Tracking**
  - Real-time completion score (0-100%)
  - Encouragement to complete all sections
  - Visual progress indicators

- **Shareable Portfolio Links**
  - Generate unique, SEO-friendly URLs (e.g., `/portfolio/john-doe-abc123`)
  - Share your portfolio with recruiters and businesses
  - Public/private visibility controls

- **Email Verification**
  - Secure account registration
  - Email verification for authenticity

### For Recruiters & Businesses
- **Professional Marketplace**
  - Browse all public portfolios
  - Search by name, title, or bio
  - Filter by skills and categories
  - View detailed portfolio pages

### Technical Features
- **Full CRUD Operations** for all portfolio sections
- **JWT Authentication** with secure token management
- **Responsive Design** - works on all devices
- **RESTful API** architecture
- **Type-safe** development with TypeScript
- **Modern UI** with Tailwind CSS

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Nodemailer** - Email service
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- SMTP email account (Gmail, SendGrid, etc.)

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd native-portfolio
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Set up PostgreSQL database

Create a new PostgreSQL database:

```sql
CREATE DATABASE portfolio_db;
```

### 4. Configure environment variables

Create `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/portfolio_db?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="Career Portfolio <noreply@portfoliomanager.com>"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"
```

**Note:** For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password" from Google Account settings
3. Use the app password as `EMAIL_PASSWORD`

### 5. Run database migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

### 6. Start the development servers

Option 1: Start both servers together (from root):
```bash
npm run dev
```

Option 2: Start separately:

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
native-portfolio/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── context/         # React context
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── package.json             # Root package
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/me` - Get current user

### Portfolio Management (Protected)
- `GET /api/portfolio/me` - Get my portfolio
- `PUT /api/portfolio/me` - Update portfolio
- `GET /api/portfolio/stats` - Get portfolio stats

### Projects (Protected)
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Certifications (Protected)
- `POST /api/certifications` - Create certification
- `PUT /api/certifications/:id` - Update certification
- `DELETE /api/certifications/:id` - Delete certification

### Work History (Protected)
- `POST /api/work-history` - Create work history
- `PUT /api/work-history/:id` - Update work history
- `DELETE /api/work-history/:id` - Delete work history

### Achievements (Protected)
- `POST /api/achievements` - Create achievement
- `PUT /api/achievements/:id` - Update achievement
- `DELETE /api/achievements/:id` - Delete achievement

### Skills (Protected)
- `POST /api/skills` - Create skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Public Routes
- `GET /api/public/portfolio/:slug` - View public portfolio
- `GET /api/public/marketplace` - Browse marketplace
- `GET /api/public/skills` - Get all skills

## Usage Guide

### 1. Create an Account
1. Visit http://localhost:5173
2. Click "Get Started" or "Sign Up"
3. Fill in your details (first name, last name, email, password)
4. Check your email for verification link
5. Click the verification link

### 2. Complete Your Profile
1. Log in to your account
2. Navigate to Dashboard
3. Click "Edit Portfolio"
4. Fill in Basic Information (title, bio, location, etc.)
5. Add your projects, certifications, work history, achievements, and skills
6. Watch your completion score increase!

### 3. Share Your Portfolio
1. Go to Dashboard
2. Click "Copy Link" under "Share Your Portfolio"
3. Share the link with recruiters or businesses
4. They can view your portfolio without logging in

### 4. Browse Marketplace
1. Visit the Marketplace page
2. Search for professionals by name, title, or skills
3. Click on any portfolio to view details
4. Contact professionals directly through their contact information

## Profile Completion Scoring

The completion score is calculated based on:
- **Basic Info (20%)**: Title, bio, profile image
- **Contact Info (10%)**: Phone, location
- **Projects (25%)**: At least 2-3 projects
- **Work History (20%)**: At least 1-2 work experiences
- **Skills (10%)**: At least 3-5 skills
- **Certifications (10%)**: At least 1-2 certifications
- **Achievements (5%)**: At least 1 achievement

## Database Schema

The application uses 8 main database tables:
- **users** - User accounts
- **portfolios** - Portfolio information
- **projects** - Project showcase
- **certifications** - Professional certifications
- **work_history** - Employment history
- **achievements** - Awards and recognitions
- **skills** - Professional skills

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication
- **Email Verification**: Prevents spam accounts
- **Input Validation**: express-validator
- **CORS**: Configured for security
- **Environment Variables**: Sensitive data protection

## Deployment

### Backend Deployment (e.g., Railway, Render, Heroku)
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Deploy backend code

### Frontend Deployment (e.g., Vercel, Netlify)
1. Update API base URL in `frontend/src/api/axios.ts`
2. Build frontend: `npm run build`
3. Deploy `dist` folder

## Future Enhancements

- [ ] File upload for profile images and project screenshots
- [ ] PDF export of portfolios
- [ ] Analytics dashboard (portfolio views, link clicks)
- [ ] Direct messaging between recruiters and professionals
- [ ] Advanced search filters (location, experience level)
- [ ] Portfolio templates and themes
- [ ] Social sharing (Twitter, LinkedIn)
- [ ] Recommendation system
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Contact: your-email@example.com

---

Built with ❤️ using React, Node.js, and PostgreSQL

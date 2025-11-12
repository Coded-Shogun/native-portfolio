# Database Schema

## Overview

See `backend/prisma/schema.prisma` for complete schema.

## Key Models

### User
- Authentication
- Profile ownership

### Portfolio
- User's professional profile
- Links to projects, skills, work history

### Job
- Job listings
- Requirements and details

### JobMatch
- AI-generated matches
- Match scores and reasons

### JobApplication
- Application tracking
- Status pipeline

### CareerPreferences
- User job search preferences
- Matching criteria

## Relationships

```
User → Portfolio → Projects, Skills, WorkHistory, Certifications, Achievements
Job → JobMatch → Portfolio
JobApplication → Job + Portfolio
```

## Next Steps

- View schema file at `backend/prisma/schema.prisma`
- [Learn about job matching](./job-matching-algorithm.md)

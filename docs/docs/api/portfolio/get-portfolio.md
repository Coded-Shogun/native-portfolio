# Get Portfolio

Retrieve user's portfolio.

## Endpoint

```
GET /api/portfolio
```

**Authentication**: Required

## Success Response

**Status**: 200 OK

```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "Senior Full Stack Developer",
  "tagline": "Building scalable applications",
  "bio": "Experienced developer...",
  "projects": [...],
  "skills": [...],
  "workHistory": [...],
  "certifications": [...],
  "achievements": [...],
  "completionScore": 85
}
```

## Public Portfolio

```
GET /api/portfolio/public/:username
```

View any user's public portfolio (no authentication required).

## Next Steps

- [Update portfolio](./update-portfolio.md)
- [Manage projects](./projects.md)

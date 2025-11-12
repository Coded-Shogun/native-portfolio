# Update Portfolio

Update portfolio basic information.

## Endpoint

```
PUT /api/portfolio
```

**Authentication**: Required

## Request Body

```json
{
  "title": "Senior Full Stack Developer",
  "tagline": "Building amazing web apps",
  "bio": "I'm a developer with 5 years..."
}
```

## Success Response

**Status**: 200 OK

```json
{
  "message": "Portfolio updated successfully",
  "portfolio": {...}
}
```

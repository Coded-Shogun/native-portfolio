# Manage Work History

## Add Work Experience

```
POST /api/portfolio/work-history
```

## Update Work Experience

```
PUT /api/portfolio/work-history/:id
```

## Delete Work Experience

```
DELETE /api/portfolio/work-history/:id
```

## Request Body

```json
{
  "company": "Tech Company",
  "position": "Senior Developer",
  "startDate": "2020-01-01",
  "endDate": "2023-12-31",
  "current": false,
  "description": "Led development of...",
  "technologies": ["React", "Node.js"]
}
```

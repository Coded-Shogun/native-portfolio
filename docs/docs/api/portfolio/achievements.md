# Manage Achievements

## Add Achievement

```
POST /api/portfolio/achievements
```

## Update Achievement

```
PUT /api/portfolio/achievements/:id
```

## Delete Achievement

```
DELETE /api/portfolio/achievements/:id
```

## Request Body

```json
{
  "title": "Hackathon Winner 2023",
  "description": "Won first place at...",
  "date": "2023-06-15",
  "url": "https://example.com/award"
}
```

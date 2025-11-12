# Job Applications

## Apply to Job

```
POST /api/jobs/:jobId/apply
```

Submit application to a job.

## Get My Applications

```
GET /api/applications
```

Get all your applications.

## Update Application Status

```
PUT /api/applications/:id
```

Update status (submitted, reviewing, interview, offer, accepted, rejected).

## Request Body

```json
{
  "status": "interview",
  "notes": "Phone screen scheduled for Friday"
}
```

## Success Response

```json
{
  "applications": [
    {
      "id": "uuid",
      "job": {...},
      "status": "interview",
      "appliedAt": "2024-03-01",
      "notes": "..."
    }
  ],
  "stats": {
    "total": 15,
    "submitted": 5,
    "interview": 3,
    "offers": 1
  }
}
```

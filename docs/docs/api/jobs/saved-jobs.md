# Saved Jobs

## Save Job

```
POST /api/jobs/:jobId/save
```

Bookmark a job for later.

## Get Saved Jobs

```
GET /api/jobs/saved
```

Retrieve all saved jobs.

## Remove Saved Job

```
DELETE /api/jobs/:jobId/save
```

Unsave a bookmarked job.

## Success Response

```json
{
  "savedJobs": [
    {
      "id": "uuid",
      "job": {
        "title": "Full Stack Developer",
        "company": "Tech Co",
        ...
      },
      "savedAt": "2024-03-15"
    }
  ]
}
```

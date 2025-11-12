# Job Recommendations

Get AI-powered job recommendations based on your portfolio and preferences.

## Endpoint

```
GET /api/jobs/recommendations?minScore=60
```

**Authentication**: Required

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| minScore | number | No | 60 | Minimum match score (0-100) |

## Example Request

```bash
curl http://localhost:5000/api/jobs/recommendations?minScore=70 \
  -H "Authorization: Bearer your-jwt-token"
```

## Success Response

**Status**: 200 OK

```json
{
  "matches": [
    {
      "job": {
        "id": "uuid",
        "title": "Senior Full Stack Developer",
        "company": "Tech Company Inc.",
        "location": "San Francisco, CA",
        "locationType": "Remote",
        "salaryMin": 120000,
        "salaryMax": 180000,
        "requiredSkills": ["React", "Node.js", "PostgreSQL", "AWS"],
        "description": "We're looking for a senior full stack developer...",
        "postedDate": "2024-03-15T00:00:00.000Z"
      },
      "matchScore": 85,
      "matchReasons": [
        "Strong skills match",
        "Experience level aligned",
        "Location preference match",
        "Salary expectations met"
      ],
      "missingSkills": ["Kubernetes"],
      "strengthAreas": ["React", "Node.js", "PostgreSQL"],
      "suggestions": [
        "Learn Kubernetes to improve match score to 95%"
      ]
    },
    {
      "job": { /* Another job */ },
      "matchScore": 78,
      // ...
    }
  ],
  "stats": {
    "totalMatches": 15,
    "excellentMatches": 3,
    "goodMatches": 8,
    "fairMatches": 4
  }
}
```

## Match Score Interpretation

- **90-100%**: Excellent match - Apply immediately!
- **75-89%**: Good match - Strong candidate
- **60-74%**: Fair match - Some gaps to address
- **Below 60%**: Not recommended - Significant gaps

## Match Reasons

Possible reasons include:
- "Strong skills match" - You have most required skills
- "Experience level aligned" - Years of experience match
- "Location preference match" - Job location fits your preferences
- "Salary expectations met" - Compensation in your range
- "Relevant certifications" - You have valued certifications

## Filtering Results

### By Minimum Score

```bash
# Get only excellent matches
GET /api/jobs/recommendations?minScore=90

# Get good+ matches
GET /api/jobs/recommendations?minScore=75
```

### Sorting

Results are automatically sorted by match score (highest first).

## Error Responses

### No Portfolio Found

**Status**: 404 Not Found

```json
{
  "error": "Portfolio not found. Please complete your profile first."
}
```

### No Career Preferences

**Status**: 400 Bad Request

```json
{
  "error": "Please set your career preferences first"
}
```

## How Matching Works

The AI algorithm calculates match scores based on:

1. **Skills Match (40%)** - Required skills you have
2. **Experience Level (20%)** - Years of experience alignment
3. **Location (15%)** - Geographic/remote fit
4. **Work Type (10%)** - Remote/hybrid/on-site preference
5. **Salary (10%)** - Compensation alignment
6. **Certifications (5%)** - Relevant credentials

[Learn more about the algorithm →](../../developer-guide/job-matching-algorithm.md)

## Improving Match Scores

To get better matches:

1. **Complete your profile**
   - Add all relevant skills
   - Update work history
   - Add certifications

2. **Set career preferences**
   - Specify desired roles
   - Add preferred locations
   - Set salary expectations

3. **Close skill gaps**
   - Use [Skills Gap Analysis](../skills-gap/analyze.md)
   - Learn missing skills
   - Update proficiency levels

## Frontend Usage Example

```typescript
const fetchRecommendations = async () => {
  const response = await api.get('/jobs/recommendations?minScore=70');
  const { matches, stats } = response.data;

  // Display matches
  matches.forEach(match => {
    console.log(`${match.job.title} - ${match.matchScore}% match`);
    console.log(`Reasons: ${match.matchReasons.join(', ')}`);
    console.log(`Missing: ${match.missingSkills.join(', ')}`);
  });

  console.log(`Total matches: ${stats.totalMatches}`);
};
```

## Next Steps

- [Apply to jobs](./applications.md)
- [Save jobs for later](./saved-jobs.md)
- [Analyze skills gaps](../skills-gap/analyze.md)
- [Update career preferences](../career/preferences.md)

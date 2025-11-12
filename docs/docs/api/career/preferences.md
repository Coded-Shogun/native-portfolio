# Career Preferences

Manage career preferences for job matching.

## Get Career Preferences

```
GET /api/career-preferences
```

**Authentication**: Required

### Success Response

**Status**: 200 OK

```json
{
  "id": "uuid",
  "portfolioId": "uuid",
  "isActivelySeeking": true,
  "desiredRoles": ["Full Stack Developer", "Software Engineer"],
  "preferredLocations": ["Remote", "San Francisco"],
  "workPreference": "Remote",
  "minSalary": 100000,
  "maxSalary": 180000,
  "benefits": ["Health Insurance", "401k", "Remote Work"],
  "industries": ["Technology", "Finance"]
}
```

## Update Career Preferences

```
POST /api/career-preferences
PUT /api/career-preferences
```

**Authentication**: Required

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| isActivelySeeking | boolean | Yes | Currently seeking jobs |
| desiredRoles | string[] | Yes | Target job titles |
| preferredLocations | string[] | Yes | Preferred work locations |
| workPreference | string | No | "Remote", "Hybrid", "On-site", or "No Preference" |
| minSalary | number | No | Minimum acceptable salary |
| maxSalary | number | No | Target salary |
| benefits | string[] | No | Desired benefits |
| industries | string[] | No | Preferred industries |

### Example Request

```bash
curl -X POST http://localhost:5000/api/career-preferences \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "isActivelySeeking": true,
    "desiredRoles": ["Senior Full Stack Developer", "Tech Lead"],
    "preferredLocations": ["Remote", "New York"],
    "workPreference": "Remote",
    "minSalary": 140000,
    "maxSalary": 200000,
    "benefits": ["Health Insurance", "Stock Options", "Unlimited PTO"],
    "industries": ["Technology", "FinTech"]
  }'
```

### Success Response

**Status**: 200 OK

```json
{
  "message": "Career preferences saved successfully",
  "preferences": {
    "id": "uuid",
    "isActivelySeeking": true,
    "desiredRoles": ["Senior Full Stack Developer", "Tech Lead"],
    "preferredLocations": ["Remote", "New York"],
    "workPreference": "Remote",
    "minSalary": 140000,
    "maxSalary": 200000
  }
}
```

## Error Responses

### Missing Required Fields

**Status**: 400 Bad Request

```json
{
  "error": "Desired roles are required"
}
```

### Invalid Work Preference

**Status**: 400 Bad Request

```json
{
  "error": "Work preference must be one of: Remote, Hybrid, On-site, No Preference"
}
```

## Impact on Job Matching

Career preferences affect job recommendations:

- **Desired Roles**: Jobs matching these titles get higher scores
- **Locations**: Filters and scores jobs by location
- **Work Preference**: Filters by remote/hybrid/on-site
- **Salary Range**: Filters jobs outside your range

[Learn more about job matching →](../../developer-guide/job-matching-algorithm.md)

## Best Practices

### Desired Roles
- Use common job titles from actual postings
- Include variations (e.g., "Software Engineer", "Software Developer")
- Be specific but not too narrow
- List 2-5 roles for best results

### Locations
- Include "Remote" if open to remote work
- Be specific with cities
- Can mix cities and remote (e.g., ["Remote", "Austin", "Denver"])

### Salary Range
- Research market rates first
- Be realistic but don't undervalue yourself
- Remember this filters out jobs

### Industries
- Optional but helps with matching
- Use standard industry names

## Example: Frontend Implementation

```typescript
const savePreferences = async (preferences) => {
  try {
    const response = await api.post('/career-preferences', preferences);
    toast.success('Preferences saved!');

    // Fetch updated job recommendations
    fetchJobRecommendations();
  } catch (error) {
    toast.error(error.response?.data?.error || 'Failed to save');
  }
};

// Usage
savePreferences({
  isActivelySeeking: true,
  desiredRoles: ['React Developer', 'Frontend Engineer'],
  preferredLocations: ['Remote', 'Boston'],
  workPreference: 'Remote',
  minSalary: 90000,
  maxSalary: 140000
});
```

## Next Steps

- [Get job recommendations](../jobs/recommendations.md)
- [Analyze skills gap](../skills-gap/analyze.md)
- [Track applications](../jobs/applications.md)

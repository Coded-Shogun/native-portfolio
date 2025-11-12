# Skills Gap Analysis

Analyze skill gaps for target role and get learning recommendations.

## Endpoint

```
POST /api/skills-gap/analyze
```

**Authentication**: Required

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| targetRole | string | Yes | Desired job title (e.g., "Full Stack Developer") |
| industry | string | No | Target industry (e.g., "Technology", "Finance") |

## Example Request

```bash
curl -X POST http://localhost:5000/api/skills-gap/analyze \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "targetRole": "Senior Full Stack Developer",
    "industry": "Technology"
  }'
```

## Success Response

**Status**: 200 OK

```json
{
  "analysis": {
    "targetRole": "Senior Full Stack Developer",
    "readinessScore": 75,
    "skillsYouHave": [
      {
        "name": "JavaScript",
        "proficiency": 90,
        "status": "strong"
      },
      {
        "name": "React",
        "proficiency": 85,
        "status": "strong"
      },
      {
        "name": "Node.js",
        "proficiency": 70,
        "status": "needs_improvement"
      }
    ],
    "missingSkills": [
      {
        "name": "Kubernetes",
        "priority": "high",
        "reason": "Required for role"
      },
      {
        "name": "GraphQL",
        "priority": "medium",
        "reason": "Commonly requested"
      }
    ],
    "skillsToImprove": [
      {
        "name": "Node.js",
        "currentLevel": 70,
        "targetLevel": 85,
        "gap": 15
      }
    ],
    "estimatedTimeToReady": {
      "months": 3,
      "description": "With focused learning, you could be job-ready in 3 months"
    }
  },
  "recommendations": {
    "prioritySkills": [
      {
        "name": "Kubernetes",
        "impact": "high",
        "learningPath": {
          "beginner": "4-6 weeks",
          "intermediate": "6-8 weeks",
          "advanced": "8-12 weeks"
        }
      }
    ],
    "learningResources": [
      {
        "skill": "Kubernetes",
        "resources": [
          {
            "type": "course",
            "title": "Kubernetes for Developers",
            "provider": "Udemy",
            "duration": "10 hours",
            "url": "https://example.com"
          },
          {
            "type": "certification",
            "title": "Certified Kubernetes Administrator (CKA)",
            "provider": "CNCF",
            "url": "https://example.com"
          }
        ]
      }
    ],
    "recommendedCertifications": [
      {
        "name": "AWS Certified Developer",
        "provider": "Amazon Web Services",
        "relevance": "Highly relevant for role",
        "estimatedCost": "$150"
      }
    ],
    "learningPaths": [
      {
        "phase": "Month 1",
        "focus": "Kubernetes fundamentals",
        "goals": [
          "Complete beginner course",
          "Deploy first application",
          "Understand pods and services"
        ]
      },
      {
        "phase": "Month 2",
        "focus": "Advanced concepts + GraphQL",
        "goals": [
          "Learn advanced Kubernetes",
          "Start GraphQL course",
          "Build project using both"
        ]
      },
      {
        "phase": "Month 3",
        "focus": "Practice + certification",
        "goals": [
          "Build portfolio project",
          "Prepare for CKA exam",
          "Update resume and portfolio"
        ]
      }
    ]
  }
}
```

## Readiness Score Interpretation

- **80-100%**: Job ready - Apply now!
- **60-79%**: Nearly ready - 1-3 months of focused learning
- **40-59%**: Significant gaps - 3-6 months needed
- **Below 40%**: Major upskilling - 6-12+ months

## Skill Priority Levels

- **High**: Critical missing skill, significantly impacts match scores
- **Medium**: Important but not critical
- **Low**: Nice to have, minimal impact

## Error Responses

### Invalid Role

**Status**: 400 Bad Request

```json
{
  "error": "Target role not recognized. Please use common job titles like 'Full Stack Developer', 'Data Scientist', etc."
}
```

### No Portfolio

**Status**: 404 Not Found

```json
{
  "error": "Portfolio not found. Please complete your profile first."
}
```

## Supported Roles

The system has skill databases for common roles:

- Full Stack Developer
- Frontend Developer
- Backend Developer
- Data Scientist
- Machine Learning Engineer
- DevOps Engineer
- Cloud Engineer
- Product Manager
- UI/UX Designer
- Mobile Developer
- ...and more

**Note**: If your role isn't recognized, try a similar role or generic title.

## How It Works

1. **Role Lookup**: System finds required skills for target role
2. **Comparison**: Compares your skills with requirements
3. **Gap Analysis**: Identifies missing and weak skills
4. **Scoring**: Calculates readiness percentage
5. **Recommendations**: Generates personalized learning plan

[Learn more about the algorithm →](../../developer-guide/skills-gap-engine.md)

## Using Results

### Update Your Learning Plan

```typescript
const analyzeGap = async (targetRole) => {
  const response = await api.post('/skills-gap/analyze', { targetRole });
  const { analysis, recommendations } = response.data;

  // Show readiness score
  console.log(`You're ${analysis.readinessScore}% ready!`);

  // Prioritize learning
  recommendations.prioritySkills.forEach(skill => {
    console.log(`Learn ${skill.name} - ${skill.impact} impact`);
  });

  // Follow learning path
  recommendations.learningPaths.forEach(phase => {
    console.log(`${phase.phase}: ${phase.focus}`);
  });
};
```

### Track Progress

1. Run analysis monthly
2. Learn priority skills
3. Update portfolio as you learn
4. Re-run to see improvement
5. Repeat until 80%+ ready

### Apply Results to Job Search

- Mention learning in progress in applications
- Add "Currently Learning" section to portfolio
- Highlight ready skills in interviews
- Use learning path as answer to "Where do you want to improve?"

## Frontend Example

```typescript
const SkillsGapAnalysis = () => {
  const [result, setResult] = useState(null);
  const [targetRole, setTargetRole] = useState('');

  const analyze = async () => {
    try {
      const response = await api.post('/skills-gap/analyze', {
        targetRole,
        industry: 'Technology'
      });
      setResult(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error);
    }
  };

  return (
    <div>
      <input
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
        placeholder="e.g., Full Stack Developer"
      />
      <button onClick={analyze}>Analyze</button>

      {result && (
        <div>
          <h2>{result.analysis.readinessScore}% Ready</h2>
          <h3>Missing Skills:</h3>
          {result.analysis.missingSkills.map(skill => (
            <div key={skill.name}>
              {skill.name} - {skill.priority} priority
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Next Steps

- [View job recommendations](../jobs/recommendations.md) (scores will improve as you close gaps)
- [Update your skills](../portfolio/skills.md) as you learn
- [Track applications](../jobs/applications.md) to see success rate improve

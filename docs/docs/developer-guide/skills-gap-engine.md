# Skills Gap Analysis Engine

## Overview

The skills gap engine helps users identify what skills they need to learn for their target role.

**Location**: `backend/src/utils/skillsGapAnalysis.ts` and `backend/src/controllers/skillsGap.controller.ts`

## How It Works

1. User specifies target role (e.g., "Full Stack Developer")
2. System looks up required skills from role database
3. Compares with user's current skills
4. Calculates readiness score (0-100%)
5. Generates learning recommendations

## Role Skills Database

Hardcoded database of common roles and required skills:

```typescript
const ROLE_SKILLS_DATABASE = {
  'full stack developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git', ...],
  'data scientist': ['Python', 'Machine Learning', 'Statistics', 'SQL', 'TensorFlow', ...],
  // ... more roles
};
```

## Readiness Score Calculation

```typescript
const matchedSkills = userSkills.filter(skill =>
  requiredSkills.includes(skill.name)
);

const readinessScore = (matchedSkills.length / requiredSkills.length) * 100;
```

## Recommendations

- **Missing skills**: Skills to learn
- **Learning paths**: Step-by-step guides
- **Certifications**: Recommended certs
- **Time estimate**: Months to job-ready

## Future Improvements

- Machine learning for role detection
- Personalized learning paths
- Integration with course platforms
- Skill trend analysis

## Next Steps

- [See API documentation](../api/skills-gap/analyze.md)
- [Learn about job matching](./job-matching-algorithm.md)

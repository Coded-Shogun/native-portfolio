# Job Matching Algorithm

## Overview

The AI-powered job matching algorithm is the core feature that solves unemployment by intelligently connecting professionals with suitable opportunities.

**Location**: `backend/src/utils/jobMatching.ts`

## How It Works

The algorithm calculates a **match score (0-100%)** by analyzing:

1. User's portfolio (skills, experience, preferences)
2. Job requirements (skills, experience, location, salary)
3. Weighted scoring across multiple dimensions

## Scoring Breakdown

### 1. Skills Match (40 points)

**Most important factor** - measures how many required skills the user has.

```typescript
const requiredSkills = job.requiredSkills.map(s => s.toLowerCase());
const portfolioSkills = portfolio.skills.map(s => s.name.toLowerCase());

requiredSkills.forEach(requiredSkill => {
  const matchedSkill = portfolio.skills.find(ps =>
    ps.name.toLowerCase().includes(requiredSkill)
  );

  if (matchedSkill) {
    // Award points based on proficiency
    skillsScore += (40 / requiredSkills.length) * (matchedSkill.proficiency / 100);
    matchedSkills.push(requiredSkill);
  } else {
    missingSkills.push(requiredSkill);
  }
});
```

**Example:**
- Job requires: [React, Node.js, PostgreSQL]
- User has: React (90%), Node.js (75%)
- Missing: PostgreSQL

**Calculation:**
```
Skills score = (40/3) * (90/100) + (40/3) * (75/100) + 0
            = 12 + 10 + 0
            = 22 / 40 points
```

### 2. Experience Level (20 points)

Matches years of experience against job requirements.

```typescript
const userYearsOfExperience = calculateTotalExperience(portfolio.workHistory);
const requiredExperience = extractExperienceRequirement(job);

if (requiredExperience) {
  if (userYearsOfExperience >= requiredExperience) {
    experienceScore = 20; // Full points if meets or exceeds
  } else if (userYearsOfExperience >= requiredExperience * 0.7) {
    experienceScore = 15; // Partial if close (70%+)
  } else {
    experienceScore = 10; // Some credit for any experience
  }
}
```

**Example:**
- Job requires: 5 years
- User has: 4 years
- Score: 15/20 (close enough)

### 3. Location Match (15 points)

Considers geographic and remote work preferences.

```typescript
let locationScore = 0;

// Remote jobs always match if user accepts remote
if (job.locationType === 'Remote' && preferences.workPreference !== 'On-site') {
  locationScore = 15;
}
// Hybrid has flexibility
else if (job.locationType === 'Hybrid' && preferences.workPreference !== 'Remote') {
  locationScore = 12;
}
// Location-based match
else {
  const userLocations = preferences.preferredLocations.map(l => l.toLowerCase());
  const jobLocation = job.location.toLowerCase();

  if (userLocations.some(loc => jobLocation.includes(loc) || loc.includes(jobLocation))) {
    locationScore = 15;
  }
}
```

**Example:**
- Job: Remote
- User preference: Remote
- Score: 15/15

### 4. Work Type (10 points)

Matches remote/hybrid/on-site preference.

```typescript
if (preferences.workPreference === 'No Preference') {
  workTypeScore = 10;
} else if (job.locationType === preferences.workPreference) {
  workTypeScore = 10;
} else if (
  (job.locationType === 'Hybrid' && preferences.workPreference === 'Remote') ||
  (job.locationType === 'Hybrid' && preferences.workPreference === 'On-site')
) {
  workTypeScore = 7; // Hybrid is flexible
}
```

### 5. Salary Match (10 points)

Compares job salary with user expectations.

```typescript
const userMinSalary = preferences.minSalary || 0;
const userMaxSalary = preferences.maxSalary || Infinity;
const jobMinSalary = job.salaryMin || 0;
const jobMaxSalary = job.salaryMax || Infinity;

// Check if ranges overlap
if (jobMaxSalary >= userMinSalary && jobMinSalary <= userMaxSalary) {
  // Calculate overlap percentage
  const overlapStart = Math.max(jobMinSalary, userMinSalary);
  const overlapEnd = Math.min(jobMaxSalary, userMaxSalary);
  const overlapRange = overlapEnd - overlapStart;
  const userRange = userMaxSalary - userMinSalary;

  salaryScore = Math.min(10, (overlapRange / userRange) * 10);
}
```

**Example:**
- User range: $80K - $120K
- Job range: $100K - $140K
- Overlap: $100K - $120K (50% of user range)
- Score: 5/10

### 6. Certifications (5 points)

Bonus points for relevant certifications.

```typescript
const relevantCerts = portfolio.certifications.filter(cert =>
  job.requiredSkills.some(skill =>
    cert.name.toLowerCase().includes(skill.toLowerCase())
  )
);

certificationsScore = Math.min(5, relevantCerts.length * 2);
```

**Example:**
- Job requires AWS, Kubernetes
- User has: AWS Certified Developer
- Score: 2/5

## Match Score Interpretation

```
90-100%: Excellent Match 🟢
  - Apply immediately!
  - Very high likelihood of success
  - Meets nearly all requirements

75-89%: Good Match 🟡
  - Strong candidate
  - Minor skill gaps
  - Worth applying

60-74%: Fair Match 🟠
  - Meets basic requirements
  - Several gaps to address
  - Consider if motivated to learn

0-59%: Not Recommended 🔴
  - Significant gaps
  - Major upskilling needed
  - Focus on better matches
```

## Match Reasons

The algorithm generates human-readable reasons:

```typescript
const matchReasons: string[] = [];

if (skillsScore > 30) matchReasons.push("Strong skills match");
if (experienceScore >= 18) matchReasons.push("Experience level aligned");
if (locationScore === 15) matchReasons.push("Location preference match");
if (salaryScore > 8) matchReasons.push("Salary expectations met");
if (certificationsScore > 0) matchReasons.push("Relevant certifications");
```

## Improvement Suggestions

Provides actionable recommendations:

```typescript
const suggestions: string[] = [];

if (missingSkills.length > 0) {
  suggestions.push(`Learn these skills: ${missingSkills.join(', ')}`);
}

if (skillsToImprove.length > 0) {
  suggestions.push(`Improve proficiency in: ${skillsToImprove.join(', ')}`);
}

if (experienceScore < 15) {
  suggestions.push(`Gain ${requiredExperience - userYearsOfExperience} more years of experience`);
}

if (certificationsScore === 0 && job.preferredCertifications) {
  suggestions.push(`Consider getting certified in: ${job.preferredCertifications.join(', ')}`);
}
```

## Full Algorithm Code

```typescript
export interface MatchResult {
  matchScore: number;        // 0-100
  matchReasons: string[];    // Why it's a match
  missingSkills: string[];   // Skills user doesn't have
  strengthAreas: string[];   // Where user excels
  suggestions: string[];     // How to improve candidacy
}

export function calculateJobMatch(
  portfolio: Portfolio,
  job: Job,
  preferences?: CareerPreferences
): MatchResult {
  let totalScore = 0;
  const matchReasons: string[] = [];
  const missingSkills: string[] = [];
  const strengthAreas: string[] = [];
  const suggestions: string[] = [];

  // 1. SKILLS MATCH (40 points)
  let skillsScore = 0;
  const requiredSkills = job.requiredSkills.map(s => s.toLowerCase());
  const portfolioSkills = portfolio.skills.map(s => s.name.toLowerCase());

  requiredSkills.forEach(requiredSkill => {
    const matchedSkill = portfolio.skills.find(ps =>
      ps.name.toLowerCase().includes(requiredSkill)
    );

    if (matchedSkill) {
      const points = (40 / requiredSkills.length) * (matchedSkill.proficiency / 100);
      skillsScore += points;

      if (matchedSkill.proficiency >= 75) {
        strengthAreas.push(matchedSkill.name);
      }
    } else {
      missingSkills.push(requiredSkill);
    }
  });

  totalScore += skillsScore;
  if (skillsScore > 30) matchReasons.push("Strong skills match");

  // 2. EXPERIENCE LEVEL (20 points)
  const experienceScore = calculateExperienceScore(portfolio, job);
  totalScore += experienceScore;
  if (experienceScore >= 18) matchReasons.push("Experience level aligned");

  // 3. LOCATION (15 points)
  const locationScore = calculateLocationScore(job, preferences);
  totalScore += locationScore;
  if (locationScore === 15) matchReasons.push("Perfect location match");

  // 4. WORK TYPE (10 points)
  const workTypeScore = calculateWorkTypeScore(job, preferences);
  totalScore += workTypeScore;

  // 5. SALARY (10 points)
  const salaryScore = calculateSalaryScore(job, preferences);
  totalScore += salaryScore;
  if (salaryScore > 8) matchReasons.push("Salary expectations met");

  // 6. CERTIFICATIONS (5 points)
  const certificationsScore = calculateCertificationsScore(portfolio, job);
  totalScore += certificationsScore;
  if (certificationsScore > 0) matchReasons.push("Relevant certifications");

  // Generate suggestions
  if (missingSkills.length > 0) {
    suggestions.push(`Learn: ${missingSkills.slice(0, 3).join(', ')}`);
  }

  return {
    matchScore: Math.round(totalScore),
    matchReasons,
    missingSkills,
    strengthAreas,
    suggestions,
  };
}
```

## Testing the Algorithm

Unit tests cover:
- High match scenarios (90%+)
- Low match scenarios (< 50%)
- Edge cases (missing data, empty skills)
- Each scoring dimension individually

**Test file**: `backend/src/__tests__/unit/jobMatching.test.ts`

Run tests:
```bash
cd backend
npm test jobMatching
```

## Tuning the Algorithm

Adjust weights in `jobMatching.ts`:

```typescript
const WEIGHTS = {
  SKILLS: 40,           // Most important
  EXPERIENCE: 20,
  LOCATION: 15,
  WORK_TYPE: 10,
  SALARY: 10,
  CERTIFICATIONS: 5,    // Least important
};
```

**Guidelines:**
- Skills should remain highest (40-50%)
- Experience 15-25%
- Other factors 5-15% each
- Total must equal 100

## Performance Optimization

For large-scale matching:

```typescript
// Batch matching with parallel processing
export async function findBestMatches(
  portfolio: Portfolio,
  minScore: number = 60
): Promise<JobMatch[]> {
  const jobs = await prisma.job.findMany({
    where: { isActive: true }
  });

  const matches = await Promise.all(
    jobs.map(async job => {
      const match = calculateJobMatch(portfolio, job);
      if (match.matchScore >= minScore) {
        return { job, ...match };
      }
      return null;
    })
  );

  return matches
    .filter(match => match !== null)
    .sort((a, b) => b.matchScore - a.matchScore);
}
```

## Future Improvements

Potential enhancements:
- **Machine learning** - Learn from successful matches
- **User feedback** - Adjust weights based on user actions
- **Collaborative filtering** - "Users like you also matched with..."
- **Temporal decay** - Weigh recent experience higher
- **Industry-specific weights** - Different weights per industry

## Next Steps

- [Understand skills gap engine](./skills-gap-engine.md)
- [See API endpoints](../api/jobs/recommendations.md)
- [Review test cases](./testing.md)

# Test Guide for Career Portfolio Manager

## Overview

This test suite ensures that the job-getting features work correctly to help solve unemployment. Tests cover:

1. **Job Matching Algorithm** - Core AI matching logic
2. **Skills Gap Analysis** - Career development recommendations
3. **Application Tracking** - Progress monitoring
4. **Career Preferences** - User preference management
5. **API Endpoints** - Integration tests

## Running Tests

```bash
# Run all tests with coverage
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Watch mode for development
npm run test:watch
```

## Test Structure

```
backend/src/__tests__/
├── unit/                          # Unit tests
│   ├── jobMatching.test.ts       # AI matching algorithm
│   ├── skillsGap.test.ts         # Skills gap logic
│   ├── careerPreferences.test.ts # Preferences validation
│   └── applicationTracking.test.ts # Application flow
└── TEST_GUIDE.md                  # This file
```

## Test Coverage Goals

- **Job Matching Algorithm**: >90% coverage
- **Skills Gap Analysis**: >85% coverage
- **API Controllers**: >80% coverage
- **Overall Backend**: >75% coverage

## Key Test Scenarios

### 1. Job Matching Tests

**Purpose**: Ensure professionals are matched to relevant opportunities

**Critical Tests**:
- ✅ High match score for well-matched candidates (70-100%)
- ✅ Correct identification of missing skills
- ✅ Bonus points for relevant experience
- ✅ Location and remote work preferences
- ✅ Salary expectations matching
- ✅ Certification bonuses
- ✅ Low scores for mismatched jobs

**Example**:
```typescript
// A full-stack developer with JS, React, Node.js
// Should match highly (80%+) with full-stack roles
// Should match poorly (<50%) with data science roles
```

### 2. Skills Gap Analysis Tests

**Purpose**: Help users understand what to learn next

**Critical Tests**:
- ✅ Accurate identification of missing skills
- ✅ Readiness score calculation (0-100%)
- ✅ Priority skill recommendations
- ✅ Learning path suggestions
- ✅ Time estimation (months to job-ready)
- ✅ Motivational messaging based on progress

**Example**:
```typescript
// User has: JavaScript, React, Node.js (5 skills)
// Target role needs: + Docker, Kubernetes (7 total)
// Readiness: 71% (5/7)
// Missing: Docker, Kubernetes
// Time estimate: ~3 months
```

### 3. Application Tracking Tests

**Purpose**: Monitor job search progress systematically

**Critical Tests**:
- ✅ Status pipeline (submitted → offer → accepted)
- ✅ Timestamp tracking for all status changes
- ✅ Interview scheduling and notes
- ✅ Rejection tracking with reasons
- ✅ Analytics calculation (conversion rates)
- ✅ Time-to-hire metrics

**Example**:
```typescript
// Application created: Jan 1
// Interview scheduled: Jan 15 (14 days)
// Offer received: Jan 25 (24 days)
// Accepted: Jan 30 (29 days total)
// Success metric: 29 days to hire ✅
```

### 4. Career Preferences Tests

**Purpose**: Personalize job recommendations

**Critical Tests**:
- ✅ Validation of desired roles
- ✅ Location preference matching
- ✅ Salary range validation
- ✅ Work type preferences (Remote/Hybrid/Onsite)
- ✅ Job search status flags
- ✅ Employment type preferences

## Test Data Examples

### Mock Professional Portfolio
```typescript
{
  skills: [
    { name: 'JavaScript', proficiency: 90 },
    { name: 'React', proficiency: 85 },
    { name: 'Node.js', proficiency: 80 }
  ],
  workHistory: [
    { position: 'Full Stack Developer', company: 'TechCorp' }
  ],
  certifications: [
    { name: 'AWS Certified Developer', issuer: 'Amazon' }
  ],
  careerPreferences: {
    desiredRoles: ['Senior Developer'],
    preferredLocations: ['Remote'],
    minSalary: 100000
  }
}
```

### Mock Job Posting
```typescript
{
  title: 'Senior Full Stack Developer',
  requiredSkills: ['JavaScript', 'React', 'Node.js', 'Docker'],
  location: 'Remote',
  locationType: 'Remote',
  salaryMin: 110000,
  salaryMax: 150000
}
```

### Expected Match Result
```typescript
{
  matchScore: 85,  // High match!
  matchReasons: [
    '3/4 required skills matched',
    'Relevant work experience',
    'Location preference match',
    'Exceeds salary expectations',
    '1 relevant certification'
  ],
  missingSkills: ['Docker'],
  strengthAreas: [
    'Expert in JavaScript',
    'Expert in React',
    'Previous experience in similar role'
  ]
}
```

## Debugging Failed Tests

### Job Matching Issues

**Symptom**: Match scores too low or too high

**Check**:
1. Skill proficiency levels (0-100 scale)
2. Case-insensitive matching working
3. Weight distribution (40% skills, 20% experience, etc.)
4. Salary comparison logic

### Skills Gap Issues

**Symptom**: Incorrect readiness scores

**Check**:
1. Role skills database completeness
2. Case-insensitive skill matching
3. Percentage calculation: (matched / required) * 100
4. Priority skill sorting

### Application Tracking Issues

**Symptom**: Status transitions not working

**Check**:
1. Valid status values in test data
2. Timestamp updates on status changes
3. Terminal status handling (rejected, accepted)

## Adding New Tests

### For New Features

1. **Create test file**: `__tests__/unit/newFeature.test.ts`
2. **Follow naming**: `describe('Feature Name')` → `it('should ...')`
3. **Test critical paths**: Happy path + edge cases
4. **Use descriptive assertions**: `expect(result).toBe(expected)`

### Example Template

```typescript
describe('New Feature', () => {
  describe('Core Functionality', () => {
    it('should handle normal input correctly', () => {
      const input = { /* test data */ };
      const result = featureFunction(input);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });

    it('should handle edge cases', () => {
      const edgeCase = { /* edge case data */ };
      const result = featureFunction(edgeCase);

      expect(result).toBeDefined();
      // Edge case specific assertions
    });
  });
});
```

## CI/CD Integration

Tests should run automatically on:
- Every commit to feature branches
- Pull request creation
- Before deployment to production

**Minimum requirements for merge**:
- ✅ All tests passing
- ✅ >75% code coverage
- ✅ No linting errors

## Performance Benchmarks

**Job Matching**:
- Single match calculation: <10ms
- Batch matching (50 jobs): <500ms

**Skills Gap Analysis**:
- Analysis generation: <100ms
- Learning path recommendations: <50ms

## Troubleshooting

### Tests Timing Out

- Increase Jest timeout in jest.config
- Check for infinite loops in matching algorithm
- Verify database connections close properly

### Flaky Tests

- Avoid time-dependent tests (use fixed dates)
- Mock external dependencies
- Ensure tests are independent (no shared state)

### Coverage Not Meeting Goals

- Add tests for error paths
- Test edge cases (empty arrays, null values)
- Cover all conditional branches

## Success Metrics

**What we're testing for**:

1. **Accuracy**: Do job matches lead to interviews?
2. **Completeness**: Are all required skills identified?
3. **Usefulness**: Do recommendations help users get hired?
4. **Reliability**: Does the system work consistently?

## Contributing

When adding new job-getting features:

1. Write tests FIRST (TDD approach)
2. Ensure tests cover unemployment-solving scenarios
3. Add integration tests for API endpoints
4. Update this guide with new test categories

---

**Remember**: These tests directly impact whether our platform helps people get employed. Write thorough tests!

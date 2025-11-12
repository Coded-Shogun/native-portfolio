# Testing

## Testing Strategy

We use a comprehensive testing approach:

- **Unit Tests** - Individual functions and utilities (Jest)
- **Integration Tests** - API endpoints (Jest + Supertest)
- **E2E Tests** - Complete user workflows (Cypress)

## Running Tests

### All Tests

```bash
# Backend unit + integration tests
cd backend
npm test

# Frontend E2E tests
cd frontend
npm run test:e2e
```

### Watch Mode

```bash
cd backend
npm run test:watch
```

### Coverage

```bash
cd backend
npm test -- --coverage
```

## Unit Tests

**Location**: `backend/src/__tests__/unit/`

**Purpose**: Test individual functions in isolation

### Example: Job Matching Algorithm

```typescript
// backend/src/__tests__/unit/jobMatching.test.ts

describe('Job Matching Algorithm', () => {
  it('should calculate high match score for well-matched job', () => {
    const portfolio = {
      skills: [
        { name: 'React', proficiency: 90 },
        { name: 'Node.js', proficiency: 85 }
      ],
      workHistory: [...]
    };

    const job = {
      title: 'Full Stack Developer',
      requiredSkills: ['React', 'Node.js', 'PostgreSQL']
    };

    const result = calculateJobMatch(portfolio, job);

    expect(result.matchScore).toBeGreaterThan(70);
    expect(result.missingSkills).toContain('PostgreSQL');
  });
});
```

### Run Specific Test

```bash
npm test jobMatching
```

## Integration Tests

**Location**: `backend/src/__tests__/integration/`

**Purpose**: Test API endpoints with real database

### Example: Auth Endpoint

```typescript
// backend/src/__tests__/integration/auth.test.ts

import request from 'supertest';
import app from '@/index';

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123!'
      })
      .expect(201);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('registered');
  });
});
```

## E2E Tests

**Location**: `frontend/cypress/e2e/`

**Purpose**: Test complete user workflows in browser

### Example: Job Getting Journey

```typescript
// frontend/cypress/e2e/job-getting-journey.cy.ts

describe('Complete Job Search Journey', () => {
  it('should complete full workflow: preferences → matches → apply', () => {
    // Login
    cy.login('demo@example.com', 'DemoPassword123!');

    // Set career preferences
    cy.visit('/career-preferences');
    cy.get('input[name="isActivelySeeking"]').check();
    cy.get('input[placeholder*="job titles"]').type('React Developer');
    cy.contains('Save Preferences').click();

    // View job recommendations
    cy.visit('/job-recommendations');
    cy.contains('Job Recommendations');

    // Analyze skills gap
    cy.visit('/skills-gap');
    cy.get('input[placeholder*="Full Stack Developer"]').type('React Developer');
    cy.contains('Analyze Skills Gap').click();
    cy.contains('Ready');

    // Check applications
    cy.visit('/my-applications');
    cy.contains('Track your job applications');
  });
});
```

### Run E2E Tests

**Interactive mode** (with browser):
```bash
cd frontend
npm run test:e2e
```

**Headless mode** (CI):
```bash
npm run test:e2e:headless
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys

## Writing Good Tests

### Unit Tests

✅ **Do**:
- Test one thing per test
- Use descriptive names
- Mock external dependencies
- Test edge cases

❌ **Don't**:
- Test implementation details
- Share state between tests
- Skip cleanup

### Integration Tests

✅ **Do**:
- Use test database
- Clean up after tests
- Test error cases
- Verify database changes

❌ **Don't**:
- Use production database
- Leave test data
- Skip authentication tests

### E2E Tests

✅ **Do**:
- Test complete workflows
- Use custom commands
- Wait for elements
- Test critical paths

❌ **Don't**:
- Test every edge case (use unit tests)
- Make tests dependent on each other
- Use fixed waits (cy.wait(1000))

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Before deployment

## Next Steps

- [Run tests locally](./running-locally.md)
- [Understand job matching algorithm](./job-matching-algorithm.md)
- [Learn deployment process](./deployment.md)

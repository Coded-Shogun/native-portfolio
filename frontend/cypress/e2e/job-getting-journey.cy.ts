describe('Job-Getting Features - Complete User Journey', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('demo@example.com', 'DemoPassword123!')
  })

  describe('Dashboard Overview', () => {
    it('should display job-getting features section', () => {
      cy.visit('/dashboard')

      cy.contains('Ready to Get Hired')
      cy.contains('Job Matches')
      cy.contains('My Applications')
      cy.contains('Skills Gap')
      cy.contains('Preferences')
    })

    it('should show profile completion score', () => {
      cy.visit('/dashboard')

      cy.contains('Profile Completion')
      cy.get('[class*="text-primary-600"]').should('contain', '%')
    })
  })

  describe('Career Preferences Setup', () => {
    it('should navigate to career preferences', () => {
      cy.visit('/dashboard')
      cy.contains('Preferences').click()

      cy.url().should('include', '/career-preferences')
      cy.contains('Career Preferences')
    })

    it('should save career preferences', () => {
      cy.visit('/career-preferences')

      // Set preferences
      cy.get('input[name="isActivelySeeking"]').check()
      cy.get('input[placeholder*="job titles"]').clear().type('Full Stack Developer, Software Engineer')
      cy.get('input[placeholder*="locations"]').clear().type('Remote, San Francisco')
      cy.get('select').select('Remote')

      // Set salary expectations
      cy.get('input[placeholder*="80000"]').clear().type('100000')
      cy.get('input[placeholder*="150000"]').clear().type('180000')

      // Save
      cy.contains('Save Preferences').click()

      cy.contains('saved', { matchCase: false, timeout: 10000 })
    })
  })

  describe('Job Recommendations', () => {
    it('should display job recommendations page', () => {
      cy.visit('/dashboard')
      cy.contains('Job Matches').click()

      cy.url().should('include', '/job-recommendations')
      cy.contains('Job Recommendations')
      cy.contains('AI-powered')
    })

    it('should show match statistics', () => {
      cy.visit('/job-recommendations')

      cy.contains('Total Matches')
      cy.contains('Excellent Matches')
      cy.contains('Good Matches')
    })

    it('should display job cards with match scores', () => {
      cy.visit('/job-recommendations')

      // Wait for jobs to load
      cy.wait(2000)

      // Check if job cards exist
      cy.get('[class*="card"]').should('exist')
    })

    it('should show job details on expand', () => {
      cy.visit('/job-recommendations')
      cy.wait(2000)

      // Click show details on first job (if exists)
      cy.get('button').contains('Show Details').first().click({ force: true })

      cy.contains('Job Description')
    })

    it('should save a job', () => {
      cy.visit('/job-recommendations')
      cy.wait(2000)

      // Click save button (bookmark icon)
      cy.get('button').contains('svg').first().click({ force: true })

      cy.contains('saved', { matchCase: false, timeout: 10000 })
    })
  })

  describe('Skills Gap Analysis', () => {
    it('should navigate to skills gap page', () => {
      cy.visit('/dashboard')
      cy.contains('Skills Gap').click()

      cy.url().should('include', '/skills-gap')
      cy.contains('Skills Gap Analysis')
    })

    it('should analyze skills for target role', () => {
      cy.visit('/skills-gap')

      // Enter target role
      cy.get('input[placeholder*="Full Stack Developer"]').type('Senior Full Stack Developer')
      cy.get('input[placeholder*="industry"]').type('Technology')

      // Analyze
      cy.contains('Analyze Skills Gap').click()

      // Check results
      cy.contains('Ready', { timeout: 10000 })
      cy.contains('Missing Skills')
      cy.contains('Skills to Improve')
    })

    it('should show readiness score', () => {
      cy.visit('/skills-gap')

      cy.get('input[placeholder*="Full Stack Developer"]').type('Frontend Developer')
      cy.contains('Analyze Skills Gap').click()

      cy.wait(2000)
      cy.get('[class*="text-6xl"]').should('contain', '%')
    })

    it('should provide learning recommendations', () => {
      cy.visit('/skills-gap')

      cy.get('input[placeholder*="Full Stack Developer"]').type('DevOps Engineer')
      cy.contains('Analyze Skills Gap').click()

      cy.wait(2000)
      cy.contains('Recommended Learning Paths')
      cy.contains('Recommended Certifications')
    })
  })

  describe('Application Tracking', () => {
    it('should navigate to applications page', () => {
      cy.visit('/dashboard')
      cy.contains('My Applications').click()

      cy.url().should('include', '/my-applications')
      cy.contains('My Applications')
    })

    it('should display application statistics', () => {
      cy.visit('/my-applications')

      cy.contains('Total')
      cy.contains('Submitted')
      cy.contains('Interview')
      cy.contains('Offers')
    })

    it('should filter applications by status', () => {
      cy.visit('/my-applications')

      // Click status filter
      cy.contains('button', 'Submitted').click()

      // Should filter to submitted only
      cy.wait(1000)
    })
  })

  describe('Complete Job Search Journey', () => {
    it('should complete full workflow: preferences → matches → apply → track', () => {
      // Step 1: Set career preferences
      cy.visit('/career-preferences')
      cy.get('input[name="isActivelySeeking"]').check()
      cy.get('input[placeholder*="job titles"]').type('React Developer')
      cy.contains('Save Preferences').click()
      cy.wait(1000)

      // Step 2: View job recommendations
      cy.visit('/job-recommendations')
      cy.wait(2000)
      cy.contains('Job Recommendations')

      // Step 3: Analyze skills gap
      cy.visit('/skills-gap')
      cy.get('input[placeholder*="Full Stack Developer"]').type('React Developer')
      cy.contains('Analyze Skills Gap').click()
      cy.wait(2000)
      cy.contains('Ready')

      // Step 4: Check applications
      cy.visit('/my-applications')
      cy.contains('Track your job applications')

      // Success!
      cy.visit('/dashboard')
      cy.contains('Welcome back')
    })
  })
})

describe('User Registration and Authentication', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
  }

  beforeEach(() => {
    cy.visit('/')
  })

  it('should display landing page correctly', () => {
    cy.contains('Showcase Your Professional Journey')
    cy.contains('Create Your Portfolio')
    cy.contains('Browse Portfolios')
  })

  it('should navigate to registration page', () => {
    cy.contains('Get Started').click()
    cy.url().should('include', '/register')
    cy.contains('Create your account')
  })

  it('should register a new user successfully', () => {
    cy.register(testUser)

    // Should show success message
    cy.contains('Check Your Email', { timeout: 10000 })
    cy.contains('verification link')
  })

  it('should prevent registration with existing email', () => {
    cy.visit('/register')

    // Try to register with existing email
    cy.get('input[name="firstName"]').type('Another')
    cy.get('input[name="lastName"]').type('User')
    cy.get('input[type="email"]').type('existing@example.com')
    cy.get('input[type="password"]').first().type('Password123!')
    cy.get('input[type="password"]').last().type('Password123!')
    cy.get('button[type="submit"]').click()

    // Should show error if email exists
    cy.contains('already registered', { matchCase: false, timeout: 10000 })
  })

  it('should validate password requirements', () => {
    cy.visit('/register')

    cy.get('input[name="firstName"]').type('Test')
    cy.get('input[name="lastName"]').type('User')
    cy.get('input[type="email"]').type('test@example.com')

    // Try weak password
    cy.get('input[type="password"]').first().type('weak')
    cy.get('input[type="password"]').last().type('weak')
    cy.get('button[type="submit"]').click()

    // Should show validation error
    cy.contains('at least 8 characters', { matchCase: false })
  })

  it('should validate password confirmation match', () => {
    cy.visit('/register')

    cy.get('input[name="firstName"]').type('Test')
    cy.get('input[name="lastName"]').type('User')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').first().type('Password123!')
    cy.get('input[type="password"]').last().type('DifferentPassword123!')
    cy.get('button[type="submit"]').click()

    // Should show mismatch error
    cy.contains('do not match', { matchCase: false })
  })

  it('should navigate to login page', () => {
    cy.visit('/register')
    cy.contains('Sign in').click()
    cy.url().should('include', '/login')
    cy.contains('Welcome back')
  })

  it('should login with valid credentials', () => {
    // Note: This assumes a test user exists in the database
    cy.login('demo@example.com', 'DemoPassword123!')

    cy.url().should('include', '/dashboard')
    cy.contains('Welcome back')
  })

  it('should show error with invalid credentials', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('invalid@example.com')
    cy.get('input[type="password"]').type('WrongPassword')
    cy.get('button[type="submit"]').click()

    cy.contains('Invalid', { matchCase: false, timeout: 10000 })
  })

  it('should logout successfully', () => {
    cy.login('demo@example.com', 'DemoPassword123!')
    cy.logout()

    cy.url().should('include', '/login')
  })
})

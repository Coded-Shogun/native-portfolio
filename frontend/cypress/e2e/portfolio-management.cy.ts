describe('Portfolio Management', () => {
  beforeEach(() => {
    cy.login('demo@example.com', 'DemoPassword123!')
  })

  describe('Portfolio Editor', () => {
    it('should navigate to portfolio editor', () => {
      cy.visit('/dashboard')
      cy.contains('Edit Portfolio').click()

      cy.url().should('include', '/editor')
      cy.contains('Edit Portfolio')
    })

    it('should display all portfolio sections', () => {
      cy.visit('/editor')

      cy.contains('Basic Info')
      cy.contains('Projects')
      cy.contains('Certifications')
      cy.contains('Work History')
      cy.contains('Achievements')
      cy.contains('Skills')
    })

    it('should update basic information', () => {
      cy.visit('/editor')

      // Click Basic Info tab
      cy.contains('Basic Info').click()

      // Update fields
      cy.get('input[placeholder*="Full Stack Developer"]').clear().type('Senior Full Stack Developer')
      cy.get('input[placeholder*="catchy tagline"]').clear().type('Building amazing web applications')
      cy.get('textarea[placeholder*="about yourself"]').clear().type('Passionate developer with 5 years of experience')

      // Save
      cy.contains('Save Changes').click()

      cy.contains('updated', { matchCase: false, timeout: 10000 })
    })

    it('should show completion score', () => {
      cy.visit('/editor')

      cy.contains('Completion:')
      cy.get('[class*="text-primary-600"]').should('contain', '%')
    })
  })

  describe('Projects Management', () => {
    it('should switch to projects tab', () => {
      cy.visit('/editor')
      cy.contains('Projects').click()

      cy.contains('Add Project')
    })

    it('should add a new project', () => {
      cy.visit('/editor')
      cy.contains('Projects').click()
      cy.contains('Add Project').click()

      cy.get('input[placeholder*="Project Title"]').type('E-commerce Platform')
      cy.get('textarea[placeholder*="Description"]').type('Built a full-featured e-commerce platform with React and Node.js')
      cy.get('input[placeholder*="comma-separated"]').type('React, Node.js, PostgreSQL, Stripe')

      cy.contains('button', 'Add Project').click()

      cy.contains('created', { matchCase: false, timeout: 10000 })
    })
  })

  describe('Skills Management', () => {
    it('should navigate to skills section', () => {
      cy.visit('/editor')
      cy.contains('Skills').click()
    })
  })

  describe('Public Portfolio View', () => {
    it('should generate shareable link', () => {
      cy.visit('/dashboard')

      cy.contains('Copy Link').click()

      cy.contains('Copied', { timeout: 5000 })
    })
  })
})

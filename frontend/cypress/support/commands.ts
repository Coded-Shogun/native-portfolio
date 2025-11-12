// ***********************************************************
// Custom commands for Career Portfolio Manager E2E tests
// ***********************************************************

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      register(userData: {
        firstName: string
        lastName: string
        email: string
        password: string
      }): Chainable<void>
      logout(): Chainable<void>
      createProject(projectData: any): Chainable<void>
      addSkill(skillName: string, proficiency: number): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

// Register command
Cypress.Commands.add('register', (userData) => {
  cy.visit('/register')
  cy.get('input[name="firstName"]').type(userData.firstName)
  cy.get('input[name="lastName"]').type(userData.lastName)
  cy.get('input[type="email"]').type(userData.email)
  cy.get('input[type="password"]').first().type(userData.password)
  cy.get('input[type="password"]').last().type(userData.password)
  cy.get('button[type="submit"]').click()
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('button').contains('logout', { matchCase: false }).click()
})

// Create project command
Cypress.Commands.add('createProject', (projectData) => {
  cy.visit('/editor')
  cy.contains('Projects').click()
  cy.contains('Add Project').click()
  cy.get('input[placeholder*="title"]').type(projectData.title)
  cy.get('textarea[placeholder*="description"]').type(projectData.description)
  cy.get('button').contains('Add Project').click()
})

// Add skill command
Cypress.Commands.add('addSkill', (skillName: string, proficiency: number) => {
  cy.visit('/editor')
  cy.contains('Skills').click()
  cy.contains('Add Skill').click()
  cy.get('input[placeholder*="skill"]').type(skillName)
  cy.get('input[type="range"]').invoke('val', proficiency).trigger('change')
  cy.get('button').contains('Add Skill').click()
})

export {}

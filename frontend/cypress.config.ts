{
  "e2e": {
    "baseUrl": "http://localhost:5173",
    "specPattern": "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    "supportFile": "cypress/support/e2e.ts",
    "video": true,
    "screenshotOnRunFailure": true,
    "viewportWidth": 1280,
    "viewportHeight": 720,
    "defaultCommandTimeout": 10000,
    "requestTimeout": 10000,
    "env": {
      "apiUrl": "http://localhost:5000/api"
    }
  }
}

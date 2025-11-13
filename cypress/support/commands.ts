/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via API
       * @example cy.loginViaAPI('user@test.com', 'password')
       */
      loginViaAPI(email: string, password: string): Chainable<string>;

      /**
       * Custom command to register a new user via API
       * @example cy.registerViaAPI('user@test.com', 'password', 'First', 'Last')
       */
      registerViaAPI(email: string, password: string, firstName: string, lastName: string): Chainable<void>;

      /**
       * Custom command to check security headers
       * @example cy.checkSecurityHeaders()
       */
      checkSecurityHeaders(url: string): Chainable<void>;

      /**
       * Custom command to check rate limiting
       * @example cy.checkRateLimiting('/api/endpoint')
       */
      checkRateLimiting(endpoint: string, maxAttempts: number): Chainable<void>;
    }
  }
}

/**
 * Login via API and return JWT token
 */
Cypress.Commands.add('loginViaAPI', (email: string, password: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5000';

  return cy.request({
    method: 'POST',
    url: `${apiUrl}/api/auth/login`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.token) {
      // Store token for use in other tests
      Cypress.env('authToken', response.body.token);
      return response.body.token;
    }
    throw new Error(`Login failed: ${response.status}`);
  });
});

/**
 * Register a new user via API
 */
Cypress.Commands.add('registerViaAPI', (email: string, password: string, firstName: string, lastName: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5000';

  return cy.request({
    method: 'POST',
    url: `${apiUrl}/api/auth/register`,
    body: { email, password, firstName, lastName },
    failOnStatusCode: false,
  }).then((response) => {
    expect([200, 201, 400]).to.include(response.status);
  });
});

/**
 * Check that all security headers are present
 */
Cypress.Commands.add('checkSecurityHeaders', (url: string) => {
  return cy.request(url).then((response) => {
    // Check for essential security headers
    expect(response.headers).to.have.property('x-content-type-options', 'nosniff');
    expect(response.headers).to.have.property('x-frame-options');
    expect(response.headers).to.have.property('content-security-policy');
    expect(response.headers).to.not.have.property('x-powered-by');
  });
});

/**
 * Test rate limiting by making multiple requests
 */
Cypress.Commands.add('checkRateLimiting', (endpoint: string, maxAttempts: number) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5000';
  const requests: Cypress.Chainable<any>[] = [];

  for (let i = 0; i < maxAttempts + 1; i++) {
    requests.push(
      cy.request({
        method: 'POST',
        url: `${apiUrl}${endpoint}`,
        body: { test: 'data' },
        failOnStatusCode: false,
      })
    );
  }

  return cy.wrap(requests).then((responses: any) => {
    // At least one response should be rate limited (429)
    const rateLimited = responses.find((r: any) => r.status === 429);
    expect(rateLimited).to.exist;
  });
});

export {};

/**
 * Enterprise Security Headers E2E Tests
 *
 * Tests verify that all enterprise security headers are properly set
 * in production-like environment.
 */

describe('Enterprise Security Headers', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5000';

  beforeEach(() => {
    cy.visit('/');
  });

  describe('Helmet Security Headers', () => {
    it('should include X-Content-Type-Options header', () => {
      cy.request(`${apiUrl}/health`).then((response) => {
        expect(response.headers).to.have.property('x-content-type-options');
        expect(response.headers['x-content-type-options']).to.equal('nosniff');
      });
    });

    it('should include X-Frame-Options header', () => {
      cy.request(`${apiUrl}/health`).then((response) => {
        expect(response.headers).to.have.property('x-frame-options');
        // Should be DENY or SAMEORIGIN
        expect(['DENY', 'SAMEORIGIN']).to.include(response.headers['x-frame-options']);
      });
    });

    it('should include Content-Security-Policy header', () => {
      cy.request(`${apiUrl}/health`).then((response) => {
        expect(response.headers).to.have.property('content-security-policy');
        expect(response.headers['content-security-policy']).to.include("default-src 'self'");
      });
    });

    it('should include X-DNS-Prefetch-Control header', () => {
      cy.request(`${apiUrl}/health`).then((response) => {
        expect(response.headers).to.have.property('x-dns-prefetch-control');
        expect(response.headers['x-dns-prefetch-control']).to.equal('off');
      });
    });

    it('should include Referrer-Policy header', () => {
      cy.request(`${apiUrl}/health`).then((response) => {
        expect(response.headers).to.have.property('referrer-policy');
        expect(response.headers['referrer-policy']).to.be.oneOf([
          'no-referrer',
          'strict-origin-when-cross-origin',
        ]);
      });
    });

    it('should NOT include X-Powered-By header', () => {
      cy.request(`${apiUrl}/health`).then((response) => {
        expect(response.headers).to.not.have.property('x-powered-by');
      });
    });
  });

  describe('HTTPS and Security', () => {
    it('should serve application over HTTPS in production', () => {
      // In production, this should be HTTPS
      const protocol = window.location.protocol;
      if (Cypress.env('environment') === 'production') {
        expect(protocol).to.equal('https:');
      }
    });

    it('should include Strict-Transport-Security header in production', () => {
      cy.request(`${apiUrl}/health`).then((response) => {
        if (Cypress.env('environment') === 'production') {
          expect(response.headers).to.have.property('strict-transport-security');
          expect(response.headers['strict-transport-security']).to.include('max-age');
        }
      });
    });
  });

  describe('CORS Configuration', () => {
    it('should have CORS headers configured', () => {
      cy.request({
        method: 'OPTIONS',
        url: `${apiUrl}/api/auth/login`,
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
        },
      }).then((response) => {
        expect(response.headers).to.have.property('access-control-allow-origin');
      });
    });

    it('should allow credentials in CORS', () => {
      cy.request({
        method: 'OPTIONS',
        url: `${apiUrl}/api/auth/login`,
        headers: {
          'Origin': 'http://localhost:5173',
        },
      }).then((response) => {
        expect(response.headers).to.have.property('access-control-allow-credentials');
        expect(response.headers['access-control-allow-credentials']).to.equal('true');
      });
    });
  });

  describe('Response Security', () => {
    it('should not expose server information in errors', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/nonexistent-endpoint`,
        failOnStatusCode: false,
      }).then((response) => {
        const bodyString = JSON.stringify(response.body);
        expect(bodyString).to.not.include('node_modules');
        expect(bodyString).to.not.include('at ');
        expect(bodyString).to.not.include('Error:');
      });
    });

    it('should use secure content types', () => {
      cy.request(`${apiUrl}/health`).then((response) => {
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });
});

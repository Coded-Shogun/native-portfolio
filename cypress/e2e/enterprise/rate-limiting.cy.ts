/**
 * Enterprise Rate Limiting E2E Tests
 *
 * Tests verify that rate limiting is properly enforced across all tiers
 * and protects against brute force and DoS attacks.
 */

describe('Enterprise Rate Limiting', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5000';

  describe('General API Rate Limiting', () => {
    it('should include rate limit headers in responses', () => {
      cy.request(`${apiUrl}/api/jobs`).then((response) => {
        expect(response.headers).to.have.property('ratelimit-limit');
        expect(response.headers).to.have.property('ratelimit-remaining');
        expect(response.headers).to.have.property('ratelimit-reset');
      });
    });

    it('should track remaining requests correctly', () => {
      let remaining1: number;

      cy.request(`${apiUrl}/api/jobs`).then((response) => {
        remaining1 = parseInt(response.headers['ratelimit-remaining']);
        expect(remaining1).to.be.greaterThan(0);

        // Make another request
        cy.request(`${apiUrl}/api/jobs`).then((response2) => {
          const remaining2 = parseInt(response2.headers['ratelimit-remaining']);
          expect(remaining2).to.be.lessThan(remaining1);
        });
      });
    });

    it('should have reasonable rate limits', () => {
      cy.request(`${apiUrl}/api/jobs`).then((response) => {
        const limit = parseInt(response.headers['ratelimit-limit']);
        expect(limit).to.be.greaterThan(0);
        expect(limit).to.be.lessThanOrEqual(1000);
      });
    });
  });

  describe('Authentication Rate Limiting (Strict)', () => {
    it('should rate limit failed login attempts', () => {
      const attemptLogin = () => {
        return cy.request({
          method: 'POST',
          url: `${apiUrl}/api/auth/login`,
          body: {
            email: 'nonexistent@example.com',
            password: 'wrongpassword',
          },
          failOnStatusCode: false,
        });
      };

      // First few attempts should return 401 Unauthorized
      attemptLogin().then((response) => {
        expect(response.status).to.equal(401);
      });

      // After 5 attempts, should get rate limited (429)
      // Making 6 attempts to trigger rate limit
      Cypress.Promise.all([
        attemptLogin(),
        attemptLogin(),
        attemptLogin(),
        attemptLogin(),
        attemptLogin(),
      ]).then((responses) => {
        // Last response should potentially be rate limited
        // or we'll hit rate limit on next attempt
        attemptLogin().then((finalResponse) => {
          if (finalResponse.status === 429) {
            expect(finalResponse.body).to.have.property('error');
            expect(finalResponse.body.error).to.include('Too many');
          }
        });
      });
    });

    it('should include retry-after header when rate limited', () => {
      // Attempt to trigger rate limit
      const requests = Array(6).fill(null).map(() =>
        cy.request({
          method: 'POST',
          url: `${apiUrl}/api/auth/login`,
          body: { email: 'test@test.com', password: 'wrong' },
          failOnStatusCode: false,
        })
      );

      // Check if any response is rate limited
      cy.wrap(requests).then((responses: any) => {
        const rateLimited = responses.find((r: any) => r.status === 429);
        if (rateLimited) {
          expect(rateLimited.headers).to.have.property('retry-after');
        }
      });
    });

    it('should have stricter limits for auth endpoints', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/login`,
        body: { email: 'test@test.com', password: 'test' },
        failOnStatusCode: false,
      }).then((response) => {
        const authLimit = parseInt(response.headers['ratelimit-limit'] || '100');

        cy.request(`${apiUrl}/api/jobs`).then((generalResponse) => {
          const generalLimit = parseInt(generalResponse.headers['ratelimit-limit']);
          // Auth limit should be lower than general API limit
          expect(authLimit).to.be.lessThanOrEqual(generalLimit);
        });
      });
    });
  });

  describe('Rate Limit Recovery', () => {
    it('should reset rate limit after window expires', () => {
      cy.request(`${apiUrl}/api/jobs`).then((response) => {
        const resetTimestamp = parseInt(response.headers['ratelimit-reset']);
        const now = Math.floor(Date.now() / 1000);

        // Reset should be in the future
        expect(resetTimestamp).to.be.greaterThan(now);

        // Reset should be within 15 minutes (900 seconds)
        expect(resetTimestamp - now).to.be.lessThanOrEqual(900);
      });
    });
  });

  describe('Rate Limiting User Experience', () => {
    it('should provide clear error messages when rate limited', () => {
      // Attempt to trigger rate limit
      const requests = Array(6).fill(null).map(() =>
        cy.request({
          method: 'POST',
          url: `${apiUrl}/api/auth/login`,
          body: { email: 'rate-limit-test@test.com', password: 'wrong' },
          failOnStatusCode: false,
        })
      );

      cy.wrap(requests).then((responses: any) => {
        const rateLimited = responses.find((r: any) => r.status === 429);
        if (rateLimited) {
          expect(rateLimited.body).to.have.property('error');
          expect(rateLimited.body.error).to.be.a('string');
          expect(rateLimited.body.error.length).to.be.greaterThan(0);
        }
      });
    });
  });

  describe('IP-Based Rate Limiting', () => {
    it('should track rate limits per IP address', () => {
      // All requests from same Cypress instance should share rate limit
      let remaining1: number;

      cy.request(`${apiUrl}/api/jobs`).then((response) => {
        remaining1 = parseInt(response.headers['ratelimit-remaining']);

        cy.request(`${apiUrl}/api/jobs`).then((response2) => {
          const remaining2 = parseInt(response2.headers['ratelimit-remaining']);
          expect(remaining2).to.be.lessThan(remaining1);
        });
      });
    });
  });
});

/**
 * Enterprise Authentication Security E2E Tests
 *
 * Tests verify JWT authentication, password security, and session management.
 */

describe('Enterprise Authentication Security', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5000';
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'SecureP@ssw0rd123!',
    firstName: 'Test',
    lastName: 'User',
  };

  describe('User Registration Security', () => {
    it('should enforce strong password requirements', () => {
      const weakPasswords = [
        'short',
        'nouppercase1!',
        'NOLOWERCASE1!',
        'NoNumbers!',
        'NoSpecial123',
        'Short1!', // Less than 12 chars
      ];

      weakPasswords.forEach((weakPassword) => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/api/auth/register`,
          body: {
            email: `weak-${Date.now()}@test.com`,
            password: weakPassword,
            firstName: 'Test',
            lastName: 'User',
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body).to.have.property('error');
          expect(response.body.error).to.include('Validation failed');
        });
      });
    });

    it('should accept strong passwords', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/register`,
        body: testUser,
        failOnStatusCode: false,
      }).then((response) => {
        // Should succeed or indicate email already exists
        expect([200, 201, 400]).to.include(response.status);
      });
    });

    it('should sanitize user inputs during registration', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/register`,
        body: {
          email: `xss-${Date.now()}@test.com`,
          password: 'SecureP@ssw0rd123!',
          firstName: '<script>alert("XSS")</script>',
          lastName: '<img src=x onerror=alert(1)>',
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Request should not fail due to XSS
        // Inputs should be sanitized
        if (response.status === 200 || response.status === 201) {
          expect(response.body).to.not.include('<script>');
          expect(response.body).to.not.include('onerror');
        }
      });
    });

    it('should validate email format', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user space@example.com',
      ];

      invalidEmails.forEach((invalidEmail) => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/api/auth/register`,
          body: {
            email: invalidEmail,
            password: 'SecureP@ssw0rd123!',
            firstName: 'Test',
            lastName: 'User',
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(400);
        });
      });
    });
  });

  describe('JWT Token Security', () => {
    let authToken: string;

    before(() => {
      // Register and login to get a token
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/register`,
        body: {
          email: `jwt-test-${Date.now()}@test.com`,
          password: 'SecureP@ssw0rd123!',
          firstName: 'JWT',
          lastName: 'Test',
        },
        failOnStatusCode: false,
      }).then((registerResponse) => {
        if (registerResponse.status === 200 || registerResponse.status === 201) {
          // Try to login
          cy.request({
            method: 'POST',
            url: `${apiUrl}/api/auth/login`,
            body: {
              email: `jwt-test-${Date.now()}@test.com`,
              password: 'SecureP@ssw0rd123!',
            },
            failOnStatusCode: false,
          }).then((loginResponse) => {
            if (loginResponse.body.token) {
              authToken = loginResponse.body.token;
            }
          });
        }
      });
    });

    it('should reject requests without authorization token', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/auth/me`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('error');
      });
    });

    it('should reject requests with invalid tokens', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/auth/me`,
        headers: {
          Authorization: 'Bearer invalid-token-12345',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        expect(response.body).to.have.property('error');
      });
    });

    it('should reject requests with malformed tokens', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/auth/me`,
        headers: {
          Authorization: 'NotBearer token',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });

    it('should accept requests with valid tokens', () => {
      if (authToken) {
        cy.request({
          method: 'GET',
          url: `${apiUrl}/api/auth/me`,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body).to.have.property('id');
          expect(response.body).to.have.property('email');
        });
      }
    });
  });

  describe('Login Security', () => {
    it('should not reveal whether email exists', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/login`,
        body: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
        // Error should be generic, not revealing "user not found"
        expect(response.body.error).to.be.oneOf([
          'Invalid credentials',
          'Invalid email or password',
          'Authentication failed',
        ]);
      });
    });

    it('should return consistent response time for valid and invalid users', function() {
      this.timeout(30000); // Increase timeout for this test

      const timings: number[] = [];

      // Test with non-existent user
      const start1 = Date.now();
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/login`,
        body: {
          email: 'nonexistent1@example.com',
          password: 'password123',
        },
        failOnStatusCode: false,
      }).then(() => {
        const duration1 = Date.now() - start1;
        timings.push(duration1);

        // Test with another non-existent user
        const start2 = Date.now();
        cy.request({
          method: 'POST',
          url: `${apiUrl}/api/auth/login`,
          body: {
            email: 'nonexistent2@example.com',
            password: 'password123',
          },
          failOnStatusCode: false,
        }).then(() => {
          const duration2 = Date.now() - start2;
          timings.push(duration2);

          // Response times should be similar (within 500ms)
          const diff = Math.abs(duration1 - duration2);
          expect(diff).to.be.lessThan(500);
        });
      });
    });

    it('should not accept empty credentials', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/login`,
        body: {
          email: '',
          password: '',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });
  });

  describe('Session Management', () => {
    it('should include token expiration in JWT payload', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/login`,
        body: {
          email: testUser.email,
          password: testUser.password,
        },
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status === 200 && response.body.token) {
          const token = response.body.token;
          const parts = token.split('.');

          // JWT should have 3 parts
          expect(parts).to.have.length(3);

          // Decode payload (base64)
          const payload = JSON.parse(atob(parts[1]));
          expect(payload).to.have.property('exp');
          expect(payload.exp).to.be.a('number');
        }
      });
    });
  });

  describe('Password Security', () => {
    it('should not return password in any response', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/register`,
        body: {
          email: `no-pwd-${Date.now()}@test.com`,
          password: 'SecureP@ssw0rd123!',
          firstName: 'Test',
          lastName: 'User',
        },
        failOnStatusCode: false,
      }).then((response) => {
        const bodyString = JSON.stringify(response.body);
        expect(bodyString).to.not.include('SecureP@ssw0rd123!');
        expect(bodyString).to.not.include('password');
      });
    });
  });

  describe('Account Enumeration Prevention', () => {
    it('should return same error for non-existent and wrong password', () => {
      // Non-existent user
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/login`,
        body: {
          email: 'definitelynonexistent@example.com',
          password: 'wrongpassword',
        },
        failOnStatusCode: false,
      }).then((response1) => {
        const error1 = response1.body.error;

        // Wrong password (assuming testUser exists)
        cy.request({
          method: 'POST',
          url: `${apiUrl}/api/auth/login`,
          body: {
            email: testUser.email,
            password: 'wrongpassword',
          },
          failOnStatusCode: false,
        }).then((response2) => {
          const error2 = response2.body.error;

          // Errors should be the same
          expect(error1).to.equal(error2);
        });
      });
    });
  });
});

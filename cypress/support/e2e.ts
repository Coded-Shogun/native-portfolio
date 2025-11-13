// ***********************************************************
// This file is processed and loaded automatically before test files.
//
// You can change the location of this file or turn off loading
// automatically by changing the 'supportFile' configuration option.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests in command log for cleaner output
const app = window.top;
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Global error handlers
Cypress.on('uncaught:exception', (err) => {
  // Returning false here prevents Cypress from failing the test
  // Only for specific expected errors
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});

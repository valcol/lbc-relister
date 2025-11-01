// ============================================================================
// LEBONCOIN REPUBLISH - Main Entry Point
// ============================================================================

import { captureError, captureMessage, LEVELS } from './logger.js';
import { CONFIG } from './config.js';
import { observeAdChanges, scheduleRetries } from './ui.js';

console.log('Leboncoin Republish chargé');

// ============================================================================
// URL DETECTION
// ============================================================================

const isDashboardPage = () => {
  return window.location.pathname.startsWith('/compte/part/mes-annonces');
};

// ============================================================================
// INITIALIZATION
// ============================================================================

let isInitialized = false;

const initialize = () => {
  console.log('Initializing Leboncoin Republish extension', CONFIG.version);
  // Only initialize if we're on the dashboard page
  if (!isDashboardPage()) {
    console.log('Not on dashboard page, skipping initialization');
    return;
  }

  // Prevent duplicate initialization
  if (isInitialized) {
    console.log('Already initialized, skipping');
    return;
  }

  try {
    captureMessage(`Initializing Leboncoin Republish extension`, LEVELS.info, { version: CONFIG.version });

    const start = () => {
      observeAdChanges();
      scheduleRetries();
      isInitialized = true;
      console.log('✓ Leboncoin Republish prêt');
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  } catch (error) {
    captureError(error, { action: 'initialize' });
    console.error('Erreur lors de l\'initialisation:', error);
  }
};

// ============================================================================
// SPA NAVIGATION DETECTION
// ============================================================================

// Listen for browser back/forward navigation
window.addEventListener('popstate', () => {
  console.log('Navigation detected (popstate)');
  isInitialized = false;
  initialize();
});

// Override pushState to detect SPA navigation
const originalPushState = history.pushState;
history.pushState = function(...args) {
  originalPushState.apply(this, args);
  console.log('Navigation detected (pushState)');
  isInitialized = false;
  setTimeout(initialize, 100); // Small delay to let the DOM update
};

// Override replaceState to detect SPA navigation
const originalReplaceState = history.replaceState;
history.replaceState = function(...args) {
  originalReplaceState.apply(this, args);
  console.log('Navigation detected (replaceState)');
  isInitialized = false;
  setTimeout(initialize, 100); // Small delay to let the DOM update
};

// Initial load
initialize();


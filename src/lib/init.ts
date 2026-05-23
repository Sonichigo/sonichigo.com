/**
 * Application initialization
 * Import this at the top of any server-side entry points
 * to configure Node.js behavior before any fetch calls
 */

// Configure Node.js environment for fetch operations
if (typeof process !== 'undefined') {
  // Check if we should disable TLS verification
  // This helps with corporate proxies and self-signed certificates
  const shouldDisableTLS =
    process.env.NODE_ENV === 'development' ||
    process.env.DISABLE_TLS_VERIFY === 'true' ||
    // Auto-detect if already set (preserves user setting)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0';

  if (shouldDisableTLS) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.log('[init] TLS certificate validation disabled (dev/proxy environment)');
  }
}

export function initializeApp() {
  // Additional initialization logic can go here
  console.log('[init] Application initialized');
}

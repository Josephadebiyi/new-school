// GITB Safe Stripe Wrapper - Prevents crashes on Stripe operations
(function() {
  'use strict';
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    console.log('[GITB] Safe Stripe wrapper initializing...');
    
    // Ensure Stripe is loaded before any operations
    window.GITB_STRIPE_READY = false;
    
    // Safe fetch wrapper
    var originalFetch = window.fetch;
    window.fetch = function(url, options) {
      return originalFetch.apply(this, arguments)
        .then(function(response) {
          return response;
        })
        .catch(function(error) {
          console.error('[GITB] Fetch error:', error);
          // Return a fake response to prevent crashes
          return new Response(JSON.stringify({
            detail: 'Network error. Please try again.'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        });
    };
    
    // Wait for Stripe to load
    var stripeCheckInterval = setInterval(function() {
      if (typeof Stripe !== 'undefined') {
        window.GITB_STRIPE_READY = true;
        console.log('[GITB] Stripe loaded successfully');
        clearInterval(stripeCheckInterval);
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(function() {
      if (!window.GITB_STRIPE_READY) {
        console.warn('[GITB] Stripe did not load in time');
        clearInterval(stripeCheckInterval);
      }
    }, 10000);
    
    // Safe localStorage wrapper
    var safeLocalStorage = {
      getItem: function(key) {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          console.warn('[GITB] localStorage.getItem failed:', e);
          return null;
        }
      },
      setItem: function(key, value) {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.warn('[GITB] localStorage.setItem failed:', e);
        }
      },
      removeItem: function(key) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('[GITB] localStorage.removeItem failed:', e);
        }
      },
      clear: function() {
        try {
          localStorage.clear();
        } catch (e) {
          console.warn('[GITB] localStorage.clear failed:', e);
        }
      }
    };
    
    // Expose safe localStorage
    window.safeStorage = safeLocalStorage;
    
    // Catch unhandled errors
    window.addEventListener('error', function(event) {
      console.error('[GITB] Uncaught error:', event.error);
      // Don't prevent default - let React handle it too
    });
    
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
      console.error('[GITB] Unhandled promise rejection:', event.reason);
      // Prevent the default browser behavior (showing error in console)
      event.preventDefault();
    });
    
    console.log('[GITB] Safe wrapper initialized');
  }
})();

// Global Error Handler for GITB LMS
(function() {
  'use strict';
  
  // Global error handler
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global Error:', message, 'at', source, lineno, colno);
    showErrorFallback('An unexpected error occurred. Please refresh the page.');
    return true;
  };
  
  // Unhandled promise rejection handler
  window.onunhandledrejection = function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    // Don't show UI for minor promise rejections
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('Failed to fetch') || 
         event.reason.message.includes('Network'))) {
      showErrorFallback('Network error. Please check your connection and try again.');
    }
  };
  
  // Error fallback UI
  function showErrorFallback(message) {
    // Only show if app container is empty or broken
    var root = document.getElementById('root');
    if (!root || root.innerHTML.trim() === '' || root.children.length === 0) {
      root.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#1a1a2e;color:white;font-family:Arial,sans-serif;padding:20px;text-align:center;">' +
        '<h2 style="color:#e94560;margin-bottom:16px;">Something went wrong</h2>' +
        '<p style="color:#ccc;margin-bottom:24px;">' + message + '</p>' +
        '<button onclick="location.reload()" style="padding:12px 24px;background:#3d7a4a;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;">Reload Page</button>' +
        '</div>';
    }
  }
  
  // Loading state tracker
  window.GITB_APP_LOADED = false;
  
  // Check if app loads within timeout
  setTimeout(function() {
    if (!window.GITB_APP_LOADED) {
      var root = document.getElementById('root');
      if (root && (root.innerHTML.trim() === '' || !root.querySelector('[class*="app"]'))) {
        console.warn('App may not have loaded properly');
      }
    }
  }, 10000);
  
  // Mark app as loaded when React renders
  var observer = new MutationObserver(function(mutations) {
    var root = document.getElementById('root');
    if (root && root.children.length > 0) {
      window.GITB_APP_LOADED = true;
      observer.disconnect();
    }
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    var root = document.getElementById('root');
    if (root) {
      observer.observe(root, { childList: true, subtree: true });
    }
  });
  
  console.log('GITB Error Handler initialized');
})();

// Global Error Handler for GITB LMS
(function() {
  'use strict';
  
  var errorShown = false;
  
  // Error fallback UI - only show for fatal errors when app fails to render
  function showErrorFallback(message) {
    if (errorShown) return;
    
    // Wait a bit to see if React recovers
    setTimeout(function() {
      var root = document.getElementById('root');
      // Only show if root is truly empty after delay
      if (root && root.children.length === 0) {
        errorShown = true;
        root.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#1a1a2e;color:white;font-family:Arial,sans-serif;padding:20px;text-align:center;">' +
          '<h2 style="color:#e94560;margin-bottom:16px;">Something went wrong</h2>' +
          '<p style="color:#ccc;margin-bottom:24px;">' + message + '</p>' +
          '<button onclick="location.reload()" style="padding:12px 24px;background:#3d7a4a;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;">Reload Page</button>' +
          '</div>';
      }
    }, 2000);
  }
  
  // Global error handler - only for fatal errors
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('JS Error:', message, 'at', source, lineno, colno);
    // Don't show UI for every error - only truly fatal ones
    if (message && (message.includes('React') || message.includes('undefined is not'))) {
      showErrorFallback('An unexpected error occurred. Please refresh the page.');
    }
    return false; // Let default handler also run
  };
  
  // Unhandled promise rejection handler
  window.onunhandledrejection = function(event) {
    console.error('Promise Rejection:', event.reason);
    // Don't show UI for API errors - app should handle them
  };
  
  console.log('GITB Error Handler v2 initialized');
})();

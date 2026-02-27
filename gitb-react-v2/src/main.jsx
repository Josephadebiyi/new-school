import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Smoke test to confirm script execution
const statusIndicator = document.createElement('div');
statusIndicator.id = 'react-smoke-test';
statusIndicator.style.cssText = 'position:fixed;bottom:10px;right:10px;background:rgba(0,0,0,0.5);color:white;padding:5px 10px;font-size:10px;z-index:9999;border-radius:4px;';
statusIndicator.textContent = 'React JS Executing...';
document.body.appendChild(statusIndicator);

const rootElement = document.getElementById('root');
if (!rootElement) {
  statusIndicator.textContent = 'Error: #root element not found!';
  statusIndicator.style.background = 'red';
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
  statusIndicator.textContent = 'App Rendered';
  // Hide after successful render
  setTimeout(() => statusIndicator.style.display = 'none', 1000);
}

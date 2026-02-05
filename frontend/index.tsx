import React from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css';
import App from './App';

// Suppress browser extension errors that don't affect app functionality
const originalError = console.error;
console.error = (...args) => {
  // Filter out known browser extension errors
  const errorMessage = args[0];
  if (
    typeof errorMessage === 'string' &&
    (errorMessage.includes('webpage_content_reporter') ||
     errorMessage.includes('Unexpected token \'export\'') ||
     errorMessage.includes('grainy-gradients'))
  ) {
    return; // Suppress these specific errors
  }
  originalError.apply(console, args);
};

// Attach JWT to API calls automatically
const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return originalFetch(input as any, init);
    }

    const url = typeof input === 'string'
      ? input
      : (input instanceof URL ? input.toString() : (input as Request).url);

    const isApiCall =
      url.startsWith('/api/') ||
      url.includes('/api/v1/') ||
      url.includes('/api/v1');

    const isAuthCall =
      url.includes('/auth/login') ||
      url.includes('/auth/send-otp') ||
      url.includes('/auth/verify-otp');

    if (!isApiCall || isAuthCall) {
      return originalFetch(input as any, init);
    }

    const mergedHeaders = new Headers(init?.headers || (typeof input !== 'string' && !(input instanceof URL) ? (input as Request).headers : undefined));
    if (!mergedHeaders.has('Authorization')) {
      mergedHeaders.set('Authorization', `Bearer ${token}`);
    }

    return originalFetch(input as any, { ...init, headers: mergedHeaders });
  } catch {
    return originalFetch(input as any, init);
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <App />
  );
} else {
  console.error("Failed to find the root element");
}
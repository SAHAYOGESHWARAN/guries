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

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <App />
  );
} else {
  console.error("Failed to find the root element");
}
import React from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <App />
  );
} else {
  console.error("Failed to find the root element");
}
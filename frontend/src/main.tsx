import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from '../App';

// Suppress browser extension errors
const originalError = console.error;
console.error = (...args) => {
    const errorMessage = String(args[0] || '');
    if (
        errorMessage.includes('webpage_content_reporter') ||
        errorMessage.includes('Unexpected token \'export\'') ||
        errorMessage.includes('grainy-gradients') ||
        errorMessage.includes('Failed to execute \'json\'')
    ) {
        return;
    }
    originalError.apply(console, args);
};

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
} else {
    console.error("Failed to find the root element");
}

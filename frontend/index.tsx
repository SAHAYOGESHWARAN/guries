import React from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css';
import App from './App';

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

// Mock API responses
const mockApiResponses: Record<string, any> = {
  '/api/auth/login': {
    success: true,
    user: {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      department: 'Administration',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiJ9.mock_token',
    message: 'Login successful'
  },
  '/api/health': {
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Marketing Control Center API is running',
    version: '2.5.0'
  },
  '/api/v1/assets': {
    success: true,
    data: [{ id: 1, asset_name: "Website Banner", status: "Draft" }],
    total: 1
  },
  '/api/v1/services': {
    success: true,
    data: [{ id: 1, service_name: "SEO Optimization", status: "Published" }],
    total: 1
  },
  '/api/v1/tasks': {
    success: true,
    data: [{ id: 1, name: "Design Homepage", status: "In Progress" }],
    total: 1
  },
  '/api/v1/campaigns': {
    success: true,
    data: [{ id: 1, name: "Q1 Campaign", status: "Active" }],
    total: 1
  },
  '/api/v1/projects': {
    success: true,
    data: [{ id: 1, name: "Website Redesign", status: "In Progress" }],
    total: 1
  }
};

// Override fetch for API calls
const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const url = typeof input === 'string'
      ? input
      : (input instanceof URL ? input.toString() : (input as Request).url);

    const isApiCall = url.includes('/api/');

    if (isApiCall) {
      const pathMatch = url.match(/\/api[^?]*/);
      const apiPath = pathMatch ? pathMatch[0] : url;
      const method = init?.method || 'GET';

      // Handle login
      if (apiPath.includes('/auth/login') && method === 'POST') {
        try {
          const body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
          const { email, password } = body || {};

          if (email === 'admin@example.com' && password === 'admin123') {
            return new Response(JSON.stringify(mockApiResponses['/api/auth/login']), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          } else {
            return new Response(JSON.stringify({
              success: false,
              error: 'Invalid email or password'
            }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } catch (e) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Invalid request'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // For GET requests, return mock responses if available
      if (method === 'GET' && mockApiResponses[apiPath]) {
        return new Response(JSON.stringify(mockApiResponses[apiPath]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // For POST/PUT/DELETE requests, pass through to actual backend
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        return originalFetch(input as any, init);
      }

      // Default GET response
      if (method === 'GET') {
        return new Response(JSON.stringify({
          success: true,
          data: [],
          total: 0
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return originalFetch(input as any, init);
  } catch (error) {
    console.error('Fetch error:', error);
    return originalFetch(input as any, init);
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Failed to find the root element");
}

/**
 * Vercel Serverless Function Entry Point
 * Uses the full backend server for deployment
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// Set environment variables for serverless mode
process.env.NODE_ENV = 'production';
process.env.VERCEL = '1';

// Import the backend app after setting environment
let app: any;
let backendError: any = null;

try {
  // Set mock database for production
  process.env.DB_CLIENT = 'mock';
  process.env.USE_PG = 'false';
  
  const backend = require('../backend/server');
  app = backend.app;
  
  if (!app) {
    throw new Error('Backend app not exported');
  }
} catch (error) {
  console.error('Error loading backend:', error);
  backendError = error;
  app = null;
}

// CORS headers helper
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');
}

// Health check endpoint
function handleHealthCheck(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Marketing Control Center API is running',
    backendLoaded: !!app,
    backendError: backendError ? backendError.message : null
  });
}

// Main handler function for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { url } = req;
    const path = url?.split('?')[0] || '';

    // Handle health checks directly
    if (path === '/health' || path === '/api/health' || path === '/api/v1/health') {
      return handleHealthCheck(req, res);
    }

    // If backend app failed to load, return error response
    if (!app) {
      return res.status(500).json({
        success: false,
        error: 'Backend not available',
        message: 'Failed to load backend application',
        backendError: backendError ? backendError.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        path
      });
    }

    console.log(`🚀 API Request: ${req.method} ${path}`);

    // Forward the request to the Express app
    return new Promise<void>((resolve, reject) => {
      app(req as any, res as any, (result: any) => {
        if (result instanceof Error) {
          console.error('Express app error:', result);
          return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: result.message,
            timestamp: new Date().toISOString(),
            path
          });
        }
        
        // If response hasn't been sent, end it
        if (!res.headersSent) {
          res.status(404).json({
            success: false,
            error: 'Route not found',
            path,
            timestamp: new Date().toISOString()
          });
        }
        
        resolve();
      });
    });
  } catch (error: any) {
    console.error('❌ Vercel API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

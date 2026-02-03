/**
 * Vercel Serverless Function Entry Point
 * Routes all API requests to the backend server
 */

import { app } from '../backend/server';

// Export for Vercel serverless functions
export default app;


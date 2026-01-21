/**
 * Global Error Handler Middleware
 * Catches and formats all errors consistently
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationException } from '../utils/validation';

export interface ErrorResponse {
    success: false;
    error: string;
    details?: any;
    timestamp: string;
    path?: string;
}

/**
 * Custom error class
 */
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Error handler middleware
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    let statusCode = 500;
    let message = 'Internal Server Error';
    let details: any = undefined;

    // Handle validation errors
    if (err instanceof ValidationException) {
        statusCode = 400;
        message = 'Validation failed';
        details = err.errors;
    }
    // Handle app errors
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        details = err.details;
    }
    // Handle database errors
    else if (err.message?.includes('SQLITE_CONSTRAINT')) {
        statusCode = 409;
        message = 'Constraint violation - duplicate or invalid data';
    }
    // Handle not found errors
    else if (err.message?.includes('not found')) {
        statusCode = 404;
        message = err.message;
    }
    // Handle syntax errors
    else if (err instanceof SyntaxError) {
        statusCode = 400;
        message = 'Invalid request format';
    }

    const response: ErrorResponse = {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
        path: req.path
    };

    if (details) {
        response.details = details;
    }

    res.status(statusCode).json(response);
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Not found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
        timestamp: new Date().toISOString()
    });
};

import { Request, Response, NextFunction } from 'express';

/**
 * Standardized API Response Handler
 * Ensures all API responses follow a consistent format
 */

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
    path: string;
}

// Store original response methods
const originalJson = Response.prototype.json;

// Override response.json to standardize format
Response.prototype.json = function (body: any) {
    // If already in standard format, return as-is
    if (body && typeof body === 'object' && ('success' in body || 'error' in body)) {
        return originalJson.call(this, body);
    }

    // If it's an error response (status >= 400)
    if (this.statusCode >= 400) {
        const response: ApiResponse = {
            success: false,
            error: body?.error || body?.message || 'An error occurred',
            message: body?.message,
            timestamp: new Date().toISOString(),
            path: (this.req as any)?.path || ''
        };
        return originalJson.call(this, response);
    }

    // If it's a success response
    const response: ApiResponse = {
        success: true,
        data: body,
        timestamp: new Date().toISOString(),
        path: (this.req as any)?.path || ''
    };
    return originalJson.call(this, response);
} as any;

/**
 * Response handler middleware
 */
export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
    // Store original status method
    const originalStatus = res.status.bind(res);

    // Override status to track status code
    res.status = function (code: number) {
        (this as any).statusCode = code;
        return originalStatus(code);
    } as any;

    next();
};

/**
 * Error response helper
 */
export const sendError = (res: Response, statusCode: number, error: string, details?: any) => {
    res.status(statusCode).json({
        success: false,
        error,
        ...(details && { details }),
        timestamp: new Date().toISOString()
    });
};

/**
 * Success response helper
 */
export const sendSuccess = (res: Response, data: any, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        data,
        timestamp: new Date().toISOString()
    });
};

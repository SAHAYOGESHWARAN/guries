/**
 * Security Configuration
 * Centralized security settings and utilities
 */

import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Security headers configuration
 */
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
            fontSrc: ["'self'", 'data:'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
});

/**
 * HTTPS redirect middleware
 */
export const httpsRedirect = (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
        return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
};

/**
 * Request size limit configuration
 */
export const requestSizeLimits = {
    json: '100mb',
    urlencoded: '100mb',
    text: '100mb'
};

/**
 * CORS allowed methods
 */
export const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];

/**
 * CORS allowed headers
 */
export const allowedHeaders = [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
];

/**
 * Sensitive headers to remove from responses
 */
export const sensitiveHeaders = [
    'x-powered-by',
    'server',
    'x-aspnet-version',
    'x-runtime-version'
];

/**
 * Remove sensitive headers from response
 */
export const removeSensitiveHeaders = (req: Request, res: Response, next: NextFunction) => {
    try {
        sensitiveHeaders.forEach(header => {
            try {
                res.removeHeader(header);
            } catch (error) {
                // Ignore errors when trying to remove non-existent headers
            }
        });
    } catch (error) {
        // Ignore any errors in header removal process
    }
    next();
};

/**
 * Validate JWT secret on startup
 */
export const validateSecurityConfig = () => {
    const errors: string[] = [];

    if (!process.env.JWT_SECRET) {
        errors.push('JWT_SECRET environment variable is required');
    }

    if (!process.env.ADMIN_EMAIL) {
        errors.push('ADMIN_EMAIL environment variable is required');
    }

    if (!process.env.ADMIN_PASSWORD) {
        errors.push('ADMIN_PASSWORD environment variable is required');
    }

    if (process.env.NODE_ENV === 'production') {
        if (!process.env.CORS_ORIGINS) {
            errors.push('CORS_ORIGINS environment variable is required in production');
        }

        if (process.env.JWT_SECRET === 'dev-secret-key-change-in-production-12345') {
            errors.push('JWT_SECRET must be changed from default value in production');
        }

        if (process.env.ADMIN_PASSWORD === 'admin123') {
            errors.push('ADMIN_PASSWORD must be changed from default value in production');
        }
    }

    if (errors.length > 0) {
        console.error('❌ Security Configuration Errors:');
        errors.forEach(error => console.error(`  - ${error}`));
        // In Vercel serverless, do not exit so the app can still respond (e.g. health, auth)
        if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
            process.exit(1);
        }
    }

    console.log('✅ Security configuration validated');
};

export default {
    securityHeaders,
    httpsRedirect,
    requestSizeLimits,
    allowedMethods,
    allowedHeaders,
    sensitiveHeaders,
    removeSensitiveHeaders,
    validateSecurityConfig
};

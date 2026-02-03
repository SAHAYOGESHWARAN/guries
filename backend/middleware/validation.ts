import { Request, Response, NextFunction } from 'express';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number validation regex (basic international format)
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// Validation error response
export interface ValidationError {
    field: string;
    message: string;
}

// Validate email format
export const validateEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email);
};

// Validate phone number format
export const validatePhoneNumber = (phone: string): boolean => {
    return PHONE_REGEX.test(phone.replace(/\s/g, ''));
};

// Validate password strength
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// Middleware to validate login request
export const validateLoginRequest = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const errors: ValidationError[] = [];

    if (!email) {
        errors.push({ field: 'email', message: 'Email is required' });
    } else if (!validateEmail(email)) {
        errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (!password) {
        errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 8) {
        errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

// Middleware to validate OTP request
export const validateOTPRequest = (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber } = req.body;
    const errors: ValidationError[] = [];

    if (!phoneNumber) {
        errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
    } else if (!validatePhoneNumber(phoneNumber)) {
        errors.push({ field: 'phoneNumber', message: 'Invalid phone number format' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

// Middleware to validate OTP verification request
export const validateOTPVerification = (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber, code } = req.body;
    const errors: ValidationError[] = [];

    if (!phoneNumber) {
        errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
    } else if (!validatePhoneNumber(phoneNumber)) {
        errors.push({ field: 'phoneNumber', message: 'Invalid phone number format' });
    }

    if (!code) {
        errors.push({ field: 'code', message: 'OTP code is required' });
    } else if (!/^\d{6}$/.test(code)) {
        errors.push({ field: 'code', message: 'OTP code must be 6 digits' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

// Middleware to validate asset creation
export const validateAssetCreation = (req: Request, res: Response, next: NextFunction) => {
    const { asset_name, asset_type, asset_category } = req.body;
    const errors: ValidationError[] = [];

    if (!asset_name || typeof asset_name !== 'string' || asset_name.trim().length === 0) {
        errors.push({ field: 'asset_name', message: 'Asset name is required and must be a string' });
    }

    if (!asset_type || typeof asset_type !== 'string') {
        errors.push({ field: 'asset_type', message: 'Asset type is required' });
    }

    if (!asset_category || typeof asset_category !== 'string' || asset_category.trim().length === 0) {
        errors.push({ field: 'asset_category', message: 'Asset category is required' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

// Middleware to sanitize input
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    // Sanitize string fields to prevent XSS
    const sanitizeString = (str: string): string => {
        if (typeof str !== 'string') return str;
        return str
            .replace(/[<>]/g, '')
            .trim();
    };

    const sanitizeObject = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;

        const sanitized: any = {};
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                sanitized[key] = sanitizeString(obj[key]);
            } else if (typeof obj[key] === 'object') {
                sanitized[key] = sanitizeObject(obj[key]);
            } else {
                sanitized[key] = obj[key];
            }
        }
        return sanitized;
    };

    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);

    next();
};

export default {
    validateEmail,
    validatePhoneNumber,
    validatePassword,
    validateLoginRequest,
    validateOTPRequest,
    validateOTPVerification,
    validateAssetCreation,
    sanitizeInput
};

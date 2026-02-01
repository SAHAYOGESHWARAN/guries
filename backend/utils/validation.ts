/**
 * Input Validation Utilities
 * Provides consistent validation across all endpoints
 */

export interface ValidationError {
    field: string;
    message: string;
}

export class ValidationException extends Error {
    constructor(public errors: ValidationError[]) {
        super('Validation failed');
        this.name = 'ValidationException';
    }
}

/**
 * Validate required fields
 */
export const validateRequired = (data: any, fields: string[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    fields.forEach(field => {
        const value = data[field];
        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            errors.push({
                field,
                message: `${field} is required`
            });
        }
    });

    return errors;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate string length
 */
export const validateLength = (
    value: string,
    min: number,
    max: number,
    fieldName: string
): ValidationError | null => {
    if (value.length < min || value.length > max) {
        return {
            field: fieldName,
            message: `${fieldName} must be between ${min} and ${max} characters`
        };
    }
    return null;
};

/**
 * Validate number range
 */
export const validateRange = (
    value: number,
    min: number,
    max: number,
    fieldName: string
): ValidationError | null => {
    if (value < min || value > max) {
        return {
            field: fieldName,
            message: `${fieldName} must be between ${min} and ${max}`
        };
    }
    return null;
};

/**
 * Validate enum value
 */
export const validateEnum = (
    value: any,
    allowedValues: any[],
    fieldName: string
): ValidationError | null => {
    if (!allowedValues.includes(value)) {
        return {
            field: fieldName,
            message: `${fieldName} must be one of: ${allowedValues.join(', ')}`
        };
    }
    return null;
};

/**
 * Sanitize string input
 */
export const sanitizeString = (value: string): string => {
    return value
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .substring(0, 1000); // Limit length
};

/**
 * Sanitize object
 */
export const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

/**
 * Validate and throw if errors
 */
export const throwIfErrors = (errors: ValidationError[]): void => {
    if (errors.length > 0) {
        throw new ValidationException(errors);
    }
};


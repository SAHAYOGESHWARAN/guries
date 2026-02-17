/**
 * Comprehensive form validation utilities
 */

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Email validation
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// URL validation
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Required field validation
export const isRequired = (value: any): boolean => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return value !== null && value !== undefined;
};

// Min length validation
export const minLength = (value: string, min: number): boolean => {
    return value.length >= min;
};

// Max length validation
export const maxLength = (value: string, max: number): boolean => {
    return value.length <= max;
};

// Number range validation
export const inRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
};

// Asset validation
export const validateAsset = (asset: any): ValidationResult => {
    const errors: ValidationError[] = [];

    // Name validation
    if (!isRequired(asset.name) && !isRequired(asset.asset_name)) {
        errors.push({
            field: 'name',
            message: 'Asset name is required'
        });
    }

    // Type validation
    if (!isRequired(asset.type) && !isRequired(asset.asset_type)) {
        errors.push({
            field: 'type',
            message: 'Asset type is required'
        });
    }

    // Category validation
    if (!isRequired(asset.category) && !isRequired(asset.asset_category)) {
        errors.push({
            field: 'category',
            message: 'Asset category is required'
        });
    }

    // URL validation (if provided)
    if (asset.file_url && !isValidUrl(asset.file_url)) {
        errors.push({
            field: 'file_url',
            message: 'Invalid file URL'
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// QC validation
export const validateQCReview = (review: any): ValidationResult => {
    const errors: ValidationError[] = [];

    // Asset ID validation
    if (!isRequired(review.asset_id)) {
        errors.push({
            field: 'asset_id',
            message: 'Asset ID is required'
        });
    }

    // Score validation
    if (review.qc_score !== undefined && review.qc_score !== null) {
        if (!inRange(review.qc_score, 0, 100)) {
            errors.push({
                field: 'qc_score',
                message: 'QC score must be between 0 and 100'
            });
        }
    }

    // Remarks validation for rejection/rework
    if ((review.action === 'reject' || review.action === 'rework') && !isRequired(review.qc_remarks)) {
        errors.push({
            field: 'qc_remarks',
            message: `Remarks are required for ${review.action}`
        });
    }

    // Remarks length validation
    if (review.qc_remarks && !maxLength(review.qc_remarks, 1000)) {
        errors.push({
            field: 'qc_remarks',
            message: 'Remarks must be less than 1000 characters'
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Form field validation
export const validateField = (
    fieldName: string,
    value: any,
    rules: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
        custom?: (value: any) => boolean | string;
    }
): ValidationError | null => {
    // Required validation
    if (rules.required && !isRequired(value)) {
        return {
            field: fieldName,
            message: `${fieldName} is required`
        };
    }

    if (!isRequired(value)) {
        return null; // Skip other validations if not required and empty
    }

    // Min length validation
    if (rules.minLength && typeof value === 'string' && !minLength(value, rules.minLength)) {
        return {
            field: fieldName,
            message: `${fieldName} must be at least ${rules.minLength} characters`
        };
    }

    // Max length validation
    if (rules.maxLength && typeof value === 'string' && !maxLength(value, rules.maxLength)) {
        return {
            field: fieldName,
            message: `${fieldName} must be less than ${rules.maxLength} characters`
        };
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        return {
            field: fieldName,
            message: `${fieldName} format is invalid`
        };
    }

    // Custom validation
    if (rules.custom) {
        const result = rules.custom(value);
        if (result !== true) {
            return {
                field: fieldName,
                message: typeof result === 'string' ? result : `${fieldName} is invalid`
            };
        }
    }

    return null;
};

// Batch field validation
export const validateFields = (
    data: Record<string, any>,
    rules: Record<string, any>
): ValidationResult => {
    const errors: ValidationError[] = [];

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
        const error = validateField(fieldName, data[fieldName], fieldRules);
        if (error) {
            errors.push(error);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

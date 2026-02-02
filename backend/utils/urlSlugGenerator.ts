/**
 * URL Slug Generator Utility
 * Provides comprehensive URL slug and full URL generation with validation
 */

export interface SlugGenerationOptions {
    maxLength?: number;
    separator?: string;
    lowercase?: boolean;
    removeSpecialChars?: boolean;
    preserveNumbers?: boolean;
    customReplacements?: { [key: string]: string };
}

export interface URLGenerationResult {
    slug: string;
    fullUrl: string;
    isValid: boolean;
    warnings: string[];
}

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string, options: SlugGenerationOptions = {}): string {
    const {
        maxLength = 100,
        separator = '-',
        lowercase = true,
        removeSpecialChars = true,
        preserveNumbers = true,
        customReplacements = {}
    } = options;

    if (!text || typeof text !== 'string') {
        return '';
    }

    let slug = text.trim();

    // Apply custom replacements first
    Object.entries(customReplacements).forEach(([from, to]) => {
        slug = slug.replace(new RegExp(from, 'gi'), to);
    });

    // Convert to lowercase if specified
    if (lowercase) {
        slug = slug.toLowerCase();
    }

    // Replace spaces and special characters with separator
    slug = slug
        .replace(/[&]/g, 'and')                    // Replace & with 'and'
        .replace(/[^\w\s-]/g, '')                  // Remove special characters except word chars, space, hyphen
        .replace(/[\s_]+/g, separator)            // Replace spaces and underscores with separator
        .replace(/-+/g, separator)                 // Replace multiple hyphens with single separator
        .replace(/^-+|-+$/g, '');                  // Remove leading/trailing hyphens

    // Remove special characters if specified
    if (removeSpecialChars) {
        slug = slug.replace(/[^a-z0-9-]/gi, '');
    }

    // Ensure numbers are preserved if specified
    if (!preserveNumbers) {
        slug = slug.replace(/[0-9]/g, '');
    }

    // Limit length
    if (maxLength > 0) {
        slug = slug.substring(0, maxLength);
        // Remove trailing separator if cut off
        slug = slug.replace(/-+$/, '');
    }

    return slug;
}

/**
 * Generate full URL from slug with context
 */
export function generateFullUrl(slug: string, context: {
    type: 'service' | 'subservice' | 'page' | 'asset';
    parentSlug?: string;
    baseUrl?: string;
    customPrefix?: string;
}): string {
    const { type, parentSlug, baseUrl = '', customPrefix } = context;

    if (!slug) {
        return '';
    }

    let urlPath = '';

    switch (type) {
        case 'service':
            urlPath = `/services/${slug}`;
            break;
        case 'subservice':
            if (parentSlug) {
                urlPath = `/services/${parentSlug}/${slug}`;
            } else {
                urlPath = `/services/${slug}`;
            }
            break;
        case 'page':
            urlPath = `/${slug}`;
            break;
        case 'asset':
            urlPath = `/assets/${slug}`;
            break;
        default:
            urlPath = `/${slug}`;
    }

    // Apply custom prefix if provided
    if (customPrefix) {
        urlPath = `${customPrefix}${urlPath}`;
    }

    // Add base URL if provided
    if (baseUrl) {
        return `${baseUrl}${urlPath}`;
    }

    return urlPath;
}

/**
 * Validate URL slug and full URL
 */
export function validateUrlStructure(slug: string, fullUrl: string, context: {
    type: 'service' | 'subservice' | 'page' | 'asset';
    parentSlug?: string;
}): URLGenerationResult {
    const warnings: string[] = [];
    let isValid = true;

    // Validate slug
    if (!slug) {
        warnings.push('Slug cannot be empty');
        isValid = false;
    }

    if (slug.length > 100) {
        warnings.push('Slug is too long (max 100 characters)');
        isValid = false;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
        warnings.push('Slug contains invalid characters (only lowercase letters, numbers, and hyphens allowed)');
        isValid = false;
    }

    if (slug.startsWith('-') || slug.endsWith('-')) {
        warnings.push('Slug cannot start or end with a hyphen');
        isValid = false;
    }

    if (slug.includes('--')) {
        warnings.push('Slug cannot contain consecutive hyphens');
        isValid = false;
    }

    // Validate full URL
    if (!fullUrl) {
        warnings.push('Full URL cannot be empty');
        isValid = false;
    }

    if (!fullUrl.startsWith('/')) {
        warnings.push('Full URL must start with /');
        isValid = false;
    }

    // Context-specific validation
    switch (context.type) {
        case 'service':
            if (!fullUrl.startsWith('/services/')) {
                warnings.push('Service URL must start with /services/');
                isValid = false;
            }
            break;
        case 'subservice':
            if (context.parentSlug) {
                const expectedPrefix = `/services/${context.parentSlug}/`;
                if (!fullUrl.startsWith(expectedPrefix)) {
                    warnings.push(`Sub-service URL must start with ${expectedPrefix}`);
                    isValid = false;
                }
            }
            break;
    }

    return {
        slug,
        fullUrl,
        isValid,
        warnings
    };
}

/**
 * Generate unique slug by checking against existing slugs
 */
export async function generateUniqueSlug(
    baseSlug: string,
    checkExisting: (slug: string) => Promise<boolean>,
    maxAttempts: number = 10
): Promise<string> {
    let slug = baseSlug;
    let attempt = 0;

    while (attempt < maxAttempts) {
        const exists = await checkExisting(slug);
        
        if (!exists) {
            return slug;
        }

        attempt++;
        
        if (attempt === 1) {
            slug = `${baseSlug}-1`;
        } else {
            // Remove existing suffix and add new one
            slug = slug.replace(/-\d+$/, '') + `-${attempt}`;
        }
    }

    throw new Error(`Unable to generate unique slug after ${maxAttempts} attempts`);
}

/**
 * Create comprehensive URL generation with auto-generation
 */
export async function createUrlStructure(
    title: string,
    context: {
        type: 'service' | 'subservice' | 'page' | 'asset';
        parentSlug?: string;
        baseUrl?: string;
        customPrefix?: string;
    },
    checkExisting?: (slug: string) => Promise<boolean>,
    options?: SlugGenerationOptions
): Promise<URLGenerationResult> {
    // Generate base slug
    const baseSlug = generateSlug(title, options);
    
    // Generate full URL
    const fullUrl = generateFullUrl(baseSlug, context);
    
    // Validate
    const result = validateUrlStructure(baseSlug, fullUrl, context);
    
    // Check uniqueness if validation function provided
    if (checkExisting && result.isValid) {
        try {
            const uniqueSlug = await generateUniqueSlug(baseSlug, checkExisting);
            const uniqueFullUrl = generateFullUrl(uniqueSlug, context);
            
            return {
                slug: uniqueSlug,
                fullUrl: uniqueFullUrl,
                isValid: true,
                warnings: result.warnings.length > 0 ? result.warnings : []
            };
        } catch (error) {
            result.warnings.push('Could not generate unique slug');
            result.isValid = false;
        }
    }
    
    return result;
}

/**
 * Common slug generation presets
 */
export const SLUG_PRESETS = {
    // SEO-friendly preset
    SEO_FRIENDLY: {
        maxLength: 60,
        separator: '-',
        lowercase: true,
        removeSpecialChars: true,
        preserveNumbers: true,
        customReplacements: {
            '&': 'and',
            '@': 'at',
            '%': 'percent',
            '+': 'plus'
        }
    },
    
    // Technical preset
    TECHNICAL: {
        maxLength: 50,
        separator: '_',
        lowercase: true,
        removeSpecialChars: true,
        preserveNumbers: true
    },
    
    // Minimal preset
    MINIMAL: {
        maxLength: 30,
        separator: '-',
        lowercase: true,
        removeSpecialChars: true,
        preserveNumbers: false
    }
};

/**
 * Utility functions for URL management
 */
export const URLUtils = {
    /**
     * Extract slug from full URL
     */
    extractSlugFromUrl(fullUrl: string, type: 'service' | 'subservice' | 'page' | 'asset'): string {
        if (!fullUrl) return '';
        
        switch (type) {
            case 'service':
                const serviceMatch = fullUrl.match(/\/services\/([^\/]+)$/);
                return serviceMatch ? serviceMatch[1] : '';
            case 'subservice':
                const subServiceMatch = fullUrl.match(/\/services\/[^\/]+\/([^\/]+)$/);
                return subServiceMatch ? subServiceMatch[1] : '';
            case 'page':
                return fullUrl.replace(/^\//, '').split('/').pop() || '';
            case 'asset':
                const assetMatch = fullUrl.match(/\/assets\/([^\/]+)$/);
                return assetMatch ? assetMatch[1] : '';
            default:
                return fullUrl.replace(/^\//, '').split('/').pop() || '';
        }
    },
    
    /**
     * Check if URL follows expected pattern
     */
    followsPattern(fullUrl: string, type: 'service' | 'subservice' | 'page' | 'asset'): boolean {
        const patterns = {
            service: /^\/services\/[a-z0-9-]+$/,
            subservice: /^\/services\/[a-z0-9-]+\/[a-z0-9-]+$/,
            page: /^\/[a-z0-9-]+$/,
            asset: /^\/assets\/[a-z0-9-]+$/
        };
        
        return patterns[type].test(fullUrl);
    },
    
    /**
     * Normalize URL (ensure consistent format)
     */
    normalizeUrl(fullUrl: string): string {
        if (!fullUrl) return '';
        
        // Ensure starts with single /
        let normalized = fullUrl.replace(/^\/+/, '/');
        
        // Remove trailing slash (except for root)
        if (normalized.length > 1) {
            normalized = normalized.replace(/\/+$/, '');
        }
        
        // Convert multiple slashes to single
        normalized = normalized.replace(/\/+/g, '/');
        
        return normalized;
    }
};

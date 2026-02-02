/**
 * Service Code Generator Utility
 * Generates unique service and sub-service codes
 */

/**
 * Generate service code from service name
 * Format: SVC-XXXX (e.g., SVC-0001, SVC-0002) or initials-based
 */
export function generateServiceCode(serviceName: string, serviceId?: number): string {
    if (!serviceName) {
        return `SVC-${Date.now().toString().slice(-4)}`;
    }

    // Extract initials from service name
    const initials = serviceName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 3);

    // Use timestamp for uniqueness
    const timestamp = Date.now().toString().slice(-4);
    return `${initials}-${timestamp}`;
}

/**
 * Generate sub-service code from sub-service name and parent service code
 * Format: PARENT-XXXX (e.g., WD-001, WD-0002)
 */
export function generateSubServiceCode(subServiceName: string, parentServiceCode?: string): string {
    if (!subServiceName) {
        return `SUB-${Date.now().toString().slice(-3)}`;
    }

    // Extract initials from sub-service name
    const initials = subServiceName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    // Use timestamp for uniqueness
    const timestamp = Date.now().toString().slice(-3);
    
    if (parentServiceCode) {
        return `${parentServiceCode}-${initials}${timestamp}`;
    }
    
    return `${initials}-${timestamp}`;
}

/**
 * Generate unique service code with collision check
 */
export async function generateUniqueServiceCode(
    serviceName: string,
    checkExisting: (code: string) => Promise<boolean>,
    maxAttempts: number = 10
): Promise<string> {
    let attempt = 0;
    
    while (attempt < maxAttempts) {
        const code = generateServiceCode(serviceName);
        const exists = await checkExisting(code);
        
        if (!exists) {
            return code;
        }
        
        attempt++;
        
        // Add attempt number to make it unique
        const timestamp = Date.now().toString().slice(-4);
        const initials = serviceName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 3);
        
        return `${initials}-${timestamp}-${attempt}`;
    }
    
    throw new Error(`Unable to generate unique service code after ${maxAttempts} attempts`);
}

/**
 * Generate unique sub-service code with collision check
 */
export async function generateUniqueSubServiceCode(
    subServiceName: string,
    parentServiceCode: string,
    checkExisting: (code: string) => Promise<boolean>,
    maxAttempts: number = 10
): Promise<string> {
    let attempt = 0;
    
    while (attempt < maxAttempts) {
        const code = generateSubServiceCode(subServiceName, parentServiceCode);
        const exists = await checkExisting(code);
        
        if (!exists) {
            return code;
        }
        
        attempt++;
        
        // Add attempt number to make it unique
        const initials = subServiceName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        
        const timestamp = Date.now().toString().slice(-3);
        return `${parentServiceCode}-${initials}${timestamp}-${attempt}`;
    }
    
    throw new Error(`Unable to generate unique sub-service code after ${maxAttempts} attempts`);
}

/**
 * Validate service code format
 */
export function validateServiceCode(code: string): boolean {
    if (!code || typeof code !== 'string') {
        return false;
    }
    
    // Accept formats: SVC-1234, WD-001, etc.
    return /^[A-Z]{2,4}-\d{3,6}(-\d+)?$/.test(code);
}

/**
 * Validate sub-service code format
 */
export function validateSubServiceCode(code: string): boolean {
    if (!code || typeof code !== 'string') {
        return false;
    }
    
    // Accept formats: WD-001, SVC-SUB-001, etc.
    return /^[A-Z]{2,4}(-[A-Z]{2,4})?-\d{3,6}(-\d+)?$/.test(code);
}

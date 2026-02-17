/**
 * Comprehensive Error Handler
 * Catches, logs, and displays errors consistently across the application
 */

export interface AppError {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorHandler {
    private static errors: AppError[] = [];
    private static maxErrors = 50;

    /**
     * Parse error from various sources
     */
    static parseError(error: any): AppError {
        const timestamp = new Date().toISOString();

        // Handle Error objects
        if (error instanceof Error) {
            return {
                code: error.name || 'Error',
                message: error.message,
                details: error.stack,
                timestamp,
                severity: this.determineSeverity(error.message)
            };
        }

        // Handle API error responses
        if (error?.response?.data) {
            return {
                code: `HTTP_${error.response.status}`,
                message: error.response.data.error || error.response.data.message || 'API Error',
                details: error.response.data,
                timestamp,
                severity: this.determineSeverity(error.response.status)
            };
        }

        // Handle fetch errors
        if (error?.message === 'Failed to fetch') {
            return {
                code: 'NETWORK_ERROR',
                message: 'Network connection failed. Please check your internet connection.',
                details: error,
                timestamp,
                severity: 'high'
            };
        }

        // Handle timeout errors
        if (error?.name === 'AbortError') {
            return {
                code: 'TIMEOUT_ERROR',
                message: 'Request timed out. Please try again.',
                details: error,
                timestamp,
                severity: 'medium'
            };
        }

        // Handle string errors
        if (typeof error === 'string') {
            return {
                code: 'UNKNOWN_ERROR',
                message: error,
                timestamp,
                severity: this.determineSeverity(error)
            };
        }

        // Handle object errors
        if (typeof error === 'object') {
            return {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || JSON.stringify(error),
                details: error,
                timestamp,
                severity: 'medium'
            };
        }

        // Fallback
        return {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
            details: error,
            timestamp,
            severity: 'low'
        };
    }

    /**
     * Determine error severity based on message or status code
     */
    private static determineSeverity(
        messageOrStatus: string | number
    ): 'low' | 'medium' | 'high' | 'critical' {
        const str = String(messageOrStatus).toLowerCase();

        // Critical errors
        if (
            str.includes('500') ||
            str.includes('fatal') ||
            str.includes('crash') ||
            str.includes('critical')
        ) {
            return 'critical';
        }

        // High severity
        if (
            str.includes('401') ||
            str.includes('403') ||
            str.includes('404') ||
            str.includes('network') ||
            str.includes('timeout') ||
            str.includes('failed')
        ) {
            return 'high';
        }

        // Medium severity
        if (
            str.includes('400') ||
            str.includes('validation') ||
            str.includes('warning')
        ) {
            return 'medium';
        }

        // Low severity
        return 'low';
    }

    /**
     * Log error to console with formatting
     */
    static logError(error: AppError): void {
        const style = this.getConsoleStyle(error.severity);

        console.group(`%c[${error.code}] ${error.message}`, style);
        console.log('Timestamp:', error.timestamp);
        console.log('Severity:', error.severity);
        if (error.details) {
            console.log('Details:', error.details);
        }
        console.groupEnd();
    }

    /**
     * Get console styling based on severity
     */
    private static getConsoleStyle(severity: string): string {
        const styles = {
            critical: 'color: white; background-color: #dc2626; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
            high: 'color: white; background-color: #ea580c; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
            medium: 'color: white; background-color: #f59e0b; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
            low: 'color: white; background-color: #3b82f6; padding: 2px 6px; border-radius: 3px; font-weight: bold;'
        };

        return styles[severity as keyof typeof styles] || styles.low;
    }

    /**
     * Store error in history
     */
    static storeError(error: AppError): void {
        this.errors.push(error);

        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }
    }

    /**
     * Get error history
     */
    static getErrorHistory(): AppError[] {
        return [...this.errors];
    }

    /**
     * Clear error history
     */
    static clearErrorHistory(): void {
        this.errors = [];
    }

    /**
     * Get errors by severity
     */
    static getErrorsBySeverity(severity: string): AppError[] {
        return this.errors.filter(e => e.severity === severity);
    }

    /**
     * Handle error with logging and storage
     */
    static handle(error: any, context?: string): AppError {
        const appError = this.parseError(error);

        if (context) {
            appError.message = `[${context}] ${appError.message}`;
        }

        this.logError(appError);
        this.storeError(appError);

        return appError;
    }

    /**
     * Get user-friendly error message
     */
    static getUserMessage(error: AppError): string {
        const messages: Record<string, string> = {
            NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
            TIMEOUT_ERROR: 'The request took too long. Please try again.',
            VALIDATION_ERROR: 'Please check your input and try again.',
            UNAUTHORIZED: 'You are not authorized to perform this action.',
            FORBIDDEN: 'Access denied.',
            NOT_FOUND: 'The requested resource was not found.',
            SERVER_ERROR: 'An error occurred on the server. Please try again later.',
            DATABASE_ERROR: 'A database error occurred. Please try again later.',
            CORS_ERROR: 'Cross-origin request failed. Please contact support.',
            PARSE_ERROR: 'Failed to parse response. Please try again.',
            UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
        };

        return messages[error.code] || error.message;
    }

    /**
     * Create error report
     */
    static createReport(): string {
        const report = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errors: this.errors.map(e => ({
                code: e.code,
                message: e.message,
                severity: e.severity,
                timestamp: e.timestamp
            }))
        };

        return JSON.stringify(report, null, 2);
    }

    /**
     * Export error report
     */
    static exportReport(): void {
        const report = this.createReport();
        const blob = new Blob([report], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

/**
 * Global error handler for unhandled promise rejections
 */
export function setupGlobalErrorHandler(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
        const error = ErrorHandler.handle(event.reason, 'Unhandled Promise Rejection');

        // Prevent default browser behavior for critical errors
        if (error.severity === 'critical') {
            event.preventDefault();
        }
    });

    // Handle global errors
    window.addEventListener('error', event => {
        ErrorHandler.handle(event.error, 'Global Error');
    });
}

/**
 * Hook for using error handler in React components
 */
export function useErrorHandler() {
    return {
        handle: (error: any, context?: string) => ErrorHandler.handle(error, context),
        getHistory: () => ErrorHandler.getErrorHistory(),
        clearHistory: () => ErrorHandler.clearErrorHistory(),
        getUserMessage: (error: AppError) => ErrorHandler.getUserMessage(error),
        exportReport: () => ErrorHandler.exportReport()
    };
}

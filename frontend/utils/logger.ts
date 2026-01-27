/**
 * Safe logging utility that only logs in development mode
 * Prevents console spam in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const devLog = (message: string, data?: any) => {
    if (isDevelopment) {
        console.log(message, data);
    }
};

export const devError = (message: string, error?: any) => {
    if (isDevelopment) {
        console.error(message, error);
    }
};

export const devWarn = (message: string, data?: any) => {
    if (isDevelopment) {
        console.warn(message, data);
    }
};

export const devInfo = (message: string, data?: any) => {
    if (isDevelopment) {
        console.info(message, data);
    }
};

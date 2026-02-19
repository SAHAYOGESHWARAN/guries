import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from '../App';
import { DataProvider } from '../context/DataContext';

// Suppress browser extension errors
const originalError = console.error;
console.error = (...args) => {
    const errorMessage = String(args[0] || '');
    if (
        errorMessage.includes('webpage_content_reporter') ||
        errorMessage.includes('Unexpected token \'export\'') ||
        errorMessage.includes('grainy-gradients') ||
        errorMessage.includes('Failed to execute \'json\'')
    ) {
        return;
    }
    originalError.apply(console, args);
};

// Override fetch to add auth headers
const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
        const url = typeof input === 'string'
            ? input
            : (input instanceof URL ? input.toString() : (input as Request).url);

        const token = localStorage.getItem('authToken');
        const currentUserRaw = localStorage.getItem('currentUser');
        let userId: string | null = null;
        let userRole: string | null = null;
        if (currentUserRaw) {
            try {
                const parsed = JSON.parse(currentUserRaw);
                userId = parsed?.id ? String(parsed.id) : null;
                userRole = parsed?.role ? String(parsed.role) : null;
            } catch { }
        }

        const headersObj: Record<string, string> = {};
        if (init?.headers) {
            if (init.headers instanceof Headers) {
                init.headers.forEach((v, k) => { headersObj[k] = v; });
            } else if (Array.isArray(init.headers)) {
                for (const [k, v] of init.headers as any) headersObj[k] = String(v);
            } else {
                Object.assign(headersObj, init.headers as Record<string, string>);
            }
        }

        if (token) {
            headersObj['Authorization'] = `Bearer ${token}`;
        }
        if (userId) {
            headersObj['X-User-Id'] = userId;
        }
        if (userRole) {
            headersObj['X-User-Role'] = userRole;
        }
        if ((init?.method === 'POST' || init?.method === 'PUT' || init?.method === 'PATCH') && !headersObj['Content-Type']) {
            headersObj['Content-Type'] = 'application/json';
        }

        const finalInit: RequestInit = { ...init, headers: headersObj };
        return originalFetch(input as any, finalInit);
    } catch (error) {
        console.error('Fetch error:', error);
        return originalFetch(input as any, init);
    }
};

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <DataProvider>
            <App />
        </DataProvider>
    );
} else {
    console.error("Failed to find the root element");
}

import React, { useEffect } from 'react';

interface RolePermissionMatrixViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

/**
 * RolePermissionMatrixView - Redirects to Admin Console
 * 
 * Per specification: Role & Permission Matrix has been moved inside Admin Console.
 * This view now redirects users to the Admin Console where the Roles & Permissions tab is available.
 */
const RolePermissionMatrixView: React.FC<RolePermissionMatrixViewProps> = ({ onNavigate }) => {
    useEffect(() => {
        // Redirect to Admin Console
        if (onNavigate) {
            onNavigate('admin-console', null);
        }
    }, [onNavigate]);

    return (
        <div className="h-full flex items-center justify-center bg-slate-50">
            <div className="text-center p-8 max-w-md">
                <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Redirecting...</h2>
                <p className="text-slate-600 text-sm">Role & Permission Matrix is now available in Admin Console.</p>
                <button
                    onClick={() => onNavigate?.('admin-console', null)}
                    className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                    Go to Admin Console
                </button>
            </div>
        </div>
    );
};

export default RolePermissionMatrixView;

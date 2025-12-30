import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, UserRole } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import type { User } from '../types';

interface RolePermissionMatrixViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

// Permission categories and their permissions
const permissionCategories = [
    {
        name: 'QC & Review',
        permissions: [
            { key: 'canPerformQC', label: 'Perform QC Review', description: 'Can approve, reject, or request rework on assets' },
            { key: 'canApproveAssets', label: 'Approve Assets', description: 'Can approve assets in QC review' },
            { key: 'canRejectAssets', label: 'Reject Assets', description: 'Can reject assets in QC review' },
            { key: 'canRequestRework', label: 'Request Rework', description: 'Can request rework on assets' },
            { key: 'canViewQCPanel', label: 'View QC Panel', description: 'Can view QC status and checklist' },
            { key: 'canSubmitForQC', label: 'Submit for QC', description: 'Can submit assets for QC review' },
        ]
    },
    {
        name: 'Asset Management',
        permissions: [
            { key: 'canEditOwnAssets', label: 'Edit Own Assets', description: 'Can edit assets they created' },
            { key: 'canDeleteOwnAssets', label: 'Delete Own Assets', description: 'Can delete assets they created' },
            { key: 'canEditAllAssets', label: 'Edit All Assets', description: 'Can edit any asset in the system' },
            { key: 'canDeleteAllAssets', label: 'Delete All Assets', description: 'Can delete any asset in the system' },
            { key: 'canViewAllAssets', label: 'View All Assets', description: 'Can view all assets across users' },
        ]
    },
    {
        name: 'Administration',
        permissions: [
            { key: 'canViewAdminQCReview', label: 'Admin QC Review Screen', description: 'Access to Admin QC Asset Review screen' },
            { key: 'canViewAdminConsole', label: 'Admin Console', description: 'Access to Admin Console and configurations' },
            { key: 'canManageUsers', label: 'Manage Users', description: 'Can create, edit, and deactivate user accounts' },
            { key: 'canViewAuditLogs', label: 'View Audit Logs', description: 'Can view system audit logs and activity' },
        ]
    }
];

// Role definitions with their default permissions
const roleDefinitions: Record<UserRole, { label: string; color: string; bgColor: string; permissions: string[] }> = {
    admin: {
        label: 'Administrator',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        permissions: [
            'canPerformQC', 'canApproveAssets', 'canRejectAssets', 'canRequestRework', 'canViewQCPanel', 'canSubmitForQC',
            'canEditOwnAssets', 'canDeleteOwnAssets', 'canEditAllAssets', 'canDeleteAllAssets', 'canViewAllAssets',
            'canViewAdminQCReview', 'canViewAdminConsole', 'canManageUsers', 'canViewAuditLogs'
        ]
    },
    qc: {
        label: 'QC Reviewer',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        permissions: [
            'canPerformQC', 'canApproveAssets', 'canRejectAssets', 'canRequestRework', 'canViewQCPanel',
            'canEditOwnAssets', 'canDeleteOwnAssets', 'canViewAllAssets'
        ]
    },
    manager: {
        label: 'Manager',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        permissions: [
            'canViewQCPanel', 'canSubmitForQC',
            'canEditOwnAssets', 'canDeleteOwnAssets', 'canViewAllAssets'
        ]
    },
    user: {
        label: 'Employee',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        permissions: [
            'canViewQCPanel', 'canSubmitForQC',
            'canEditOwnAssets', 'canDeleteOwnAssets'
        ]
    },
    guest: {
        label: 'Guest',
        color: 'text-slate-700',
        bgColor: 'bg-slate-100',
        permissions: []
    }
};

const roles: UserRole[] = ['admin', 'qc', 'manager', 'user', 'guest'];

const RolePermissionMatrixView: React.FC<RolePermissionMatrixViewProps> = ({ onNavigate }) => {
    const { user, isAdmin, hasPermission } = useAuth();
    const { data: users = [] } = useData<User>('users');
    const canAccessAdminConsole = hasPermission('canViewAdminConsole');

    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [showUserList, setShowUserList] = useState(false);

    // Count users by role
    const userCountByRole = useMemo(() => {
        const counts: Record<string, number> = {};
        roles.forEach(role => {
            counts[role] = users.filter(u => u.role?.toLowerCase() === role).length;
        });
        return counts;
    }, [users]);

    // Access denied for non-admin users
    if (!canAccessAdminConsole) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 max-w-md">
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600">You don't have permission to access the Role & Permission Matrix.</p>
                    <button
                        onClick={() => onNavigate?.('dashboard')}
                        className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onNavigate?.('admin-console-config')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Role & Permission Matrix</h1>
                            <p className="text-slate-500 text-sm mt-1">Define user roles, access levels, and permission rules across the platform.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">
                            Admin Only
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Role Cards */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">System Roles</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {roles.map((role) => {
                            const def = roleDefinitions[role];
                            return (
                                <div
                                    key={role}
                                    onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                                    className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${selectedRole === role
                                            ? 'border-indigo-500 shadow-lg'
                                            : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${def.bgColor} ${def.color}`}>
                                            {def.label}
                                        </span>
                                        <span className="text-xs text-slate-500">{userCountByRole[role]} users</span>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-800 mb-1">
                                        {def.permissions.length}
                                    </div>
                                    <div className="text-xs text-slate-500">permissions</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Permission Matrix Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">Permission Matrix</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <span className="w-4 h-4 bg-green-500 rounded"></span> Granted
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-4 h-4 bg-slate-200 rounded"></span> Denied
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide w-64">Permission</th>
                                    {roles.map((role) => (
                                        <th key={role} className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            <span className={`px-2 py-1 rounded ${roleDefinitions[role].bgColor} ${roleDefinitions[role].color}`}>
                                                {roleDefinitions[role].label}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {permissionCategories.map((category, catIndex) => (
                                    <React.Fragment key={category.name}>
                                        {/* Category Header */}
                                        <tr className="bg-slate-50">
                                            <td colSpan={roles.length + 1} className="px-6 py-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{category.name}</span>
                                            </td>
                                        </tr>
                                        {/* Permission Rows */}
                                        {category.permissions.map((perm, permIndex) => (
                                            <tr key={perm.key} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="px-6 py-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{perm.label}</p>
                                                        <p className="text-xs text-slate-500">{perm.description}</p>
                                                    </div>
                                                </td>
                                                {roles.map((role) => {
                                                    const hasPermission = roleDefinitions[role].permissions.includes(perm.key);
                                                    return (
                                                        <td key={role} className="text-center px-4 py-3">
                                                            {hasPermission ? (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-200 rounded-full">
                                                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Notice */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-bold text-blue-800">Security Notice</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                All permission rules are role-based and non-overridable by end users. QC actions are logged with timestamp and user identity.
                                Admin-only screens are not accessible via direct URL for unauthorized users.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RolePermissionMatrixView;

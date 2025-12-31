import React, { useState, useEffect } from 'react';
import { useAdminConsole } from '../hooks/useAdminConsole';
import type { User } from '../types';
import { AuthUser } from '../hooks/useAuth';

interface AdminConsoleViewProps {
    currentUser: AuthUser | null;
    onNavigate?: (view: string, id: number | null) => void;
}

// Toast notification component
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-fade-in ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
            </svg>
            <span className="font-medium text-sm">{message}</span>
        </div>
    );
};

// Create New Account Modal
const CreateAccountModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<User> & { password?: string }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.password.trim()) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({ name: formData.name, email: formData.email, password: formData.password, role: formData.role, status: 'active', created_at: new Date().toISOString() });
            setFormData({ name: '', email: '', password: '', role: 'user' });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Add New Employee</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-700">Only administrators can create accounts. Users cannot self-register.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter employee's full name" className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.name ? 'border-red-300' : 'border-slate-200'}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Work Email</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@company.com" className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.email ? 'border-red-300' : 'border-slate-200'}`} />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">System Password</label>
                            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Set initial password" className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.password ? 'border-red-300' : 'border-slate-200'}`} />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Access Role</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                            <option value="user">Employee</option>
                            <option value="admin">Admin</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-2">Admin: Full system access including Admin Console. Employee: Standard user access.</p>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">Create Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Edit Employee Modal
const EditEmployeeModal: React.FC<{
    isOpen: boolean;
    employee: User | null;
    onClose: () => void;
    onSubmit: (data: Partial<User>) => void;
}> = ({ isOpen, employee, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ name: '', email: '', role: 'user' });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (employee) {
            setFormData({ name: employee.name, email: employee.email, role: employee.role });
        }
    }, [employee]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
            onClose();
        }
    };

    if (!isOpen || !employee) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Edit Employee</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Update account details</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.name ? 'border-red-300' : 'border-slate-200'}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.email ? 'border-red-300' : 'border-slate-200'}`} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Access Role</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                            <option value="user">Employee</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Reset Password Modal
const ResetPasswordModal: React.FC<{
    isOpen: boolean;
    employee: User | null;
    onClose: () => void;
    onSubmit: (newPassword: string) => void;
}> = ({ isOpen, employee, onClose, onSubmit }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        onSubmit(password);
        setPassword(''); setConfirmPassword(''); setError('');
        onClose();
    };

    if (!isOpen || !employee) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Reset Password</h2>
                        <p className="text-sm text-slate-500 mt-0.5">For {employee.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-sm text-amber-700">The employee will need to be provided this new password manually.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors">Update Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Deactivate Confirmation Modal
const DeactivateModal: React.FC<{
    isOpen: boolean;
    employee: User | null;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, employee, onClose, onConfirm }) => {
    if (!isOpen || !employee) return null;
    const isDeactivated = employee.status === 'inactive';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
                <div className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isDeactivated ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {isDeactivated ? (
                            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        ) : (
                            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>
                        )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">{isDeactivated ? 'Activate Account' : 'Deactivate Account'}</h2>
                    <p className="text-slate-600 text-sm mb-6">
                        {isDeactivated ? `Are you sure you want to activate ${employee.name}'s account? They will be able to log in again.` : `Are you sure you want to deactivate ${employee.name}'s account? They will no longer be able to log in.`}
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={onConfirm} className={`flex-1 px-4 py-3 text-white rounded-xl text-sm font-medium transition-colors ${isDeactivated ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>{isDeactivated ? 'Activate' : 'Deactivate'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Role definitions for the permission matrix (Admin and Employee only per spec)
type UserRole = 'admin' | 'user';
const roleDefinitions: Record<UserRole, { label: string; color: string; bgColor: string; permissions: string[] }> = {
    admin: {
        label: 'Administrator',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        permissions: ['canViewAdminConsole', 'canManageUsers', 'canViewAuditLogs', 'canPerformQC', 'canApproveAssets', 'canRejectAssets', 'canRequestRework', 'canViewQCPanel', 'canSubmitForQC', 'canEditAllAssets', 'canDeleteAllAssets', 'canViewAllAssets']
    },
    user: {
        label: 'Employee',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        permissions: ['canViewQCPanel', 'canSubmitForQC', 'canEditOwnAssets', 'canDeleteOwnAssets']
    }
};

// Permission categories for the matrix display
const permissionCategories = [
    {
        name: 'Administration',
        permissions: [
            { key: 'canViewAdminConsole', label: 'Admin Console Access', description: 'Access to Admin Console and configurations' },
            { key: 'canManageUsers', label: 'Manage Users', description: 'Can create, edit, and deactivate user accounts' },
            { key: 'canViewAuditLogs', label: 'View Audit Logs', description: 'Can view system audit logs and activity' },
        ]
    },
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
    }
];

// Main Admin Console View
const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({ currentUser, onNavigate }) => {
    const { employees, pendingRegistrations, metrics, roleStats, loading, createEmployee, updateEmployee, resetPassword, toggleStatus, approveRegistration, rejectRegistration } = useAdminConsole();

    // Tab state for Admin Console sections
    const [activeTab, setActiveTab] = useState<'dashboard' | 'permissions' | 'pending'>('dashboard');
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const isAdmin = currentUser?.role === 'admin';

    // Filter employees by role if filter is set
    const filteredEmployees = roleFilter
        ? employees.filter(u => roleFilter === 'admin' ? u.role?.toLowerCase() === 'admin' : u.role?.toLowerCase() !== 'admin')
        : employees;

    // Handle role card click - navigate to dashboard with filter
    const handleRoleCardClick = (role: string) => {
        setRoleFilter(role);
        setActiveTab('dashboard');
    };

    // Clear role filter
    const clearRoleFilter = () => {
        setRoleFilter(null);
    };

    const handleCreateEmployee = async (data: Partial<User> & { password?: string }) => {
        const existingUser = employees.find(u => u.email.toLowerCase() === data.email?.toLowerCase());
        if (existingUser) { setToast({ message: 'Email already exists', type: 'error' }); return; }
        const result = await createEmployee(data);
        setToast(result ? { message: 'Employee account created successfully', type: 'success' } : { message: 'Failed to create employee', type: 'error' });
    };

    const handleEditEmployee = async (data: Partial<User>) => {
        if (!selectedEmployee) return;
        const existingUser = employees.find(u => u.email.toLowerCase() === data.email?.toLowerCase() && u.id !== selectedEmployee.id);
        if (existingUser) { setToast({ message: 'Email already exists', type: 'error' }); return; }
        const result = await updateEmployee(selectedEmployee.id, data);
        setToast(result ? { message: 'Employee updated successfully', type: 'success' } : { message: 'Failed to update employee', type: 'error' });
    };

    const handleResetPassword = async (newPassword: string) => {
        if (!selectedEmployee) return;
        const success = await resetPassword(selectedEmployee.id, newPassword);
        setToast(success ? { message: 'Password reset successfully', type: 'success' } : { message: 'Failed to reset password', type: 'error' });
    };

    const handleToggleStatus = async () => {
        if (!selectedEmployee) return;
        const result = await toggleStatus(selectedEmployee.id);
        if (result) {
            setToast({ message: result.status === 'active' ? 'User activated successfully' : 'User deactivated successfully', type: 'success' });
        } else {
            setToast({ message: 'Failed to update status', type: 'error' });
        }
        setIsDeactivateModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleApproveRegistration = async (user: User, role: string) => {
        const result = await approveRegistration(user.id, role);
        if (result) {
            setToast({ message: `${user.name}'s registration approved successfully`, type: 'success' });
        } else {
            setToast({ message: 'Failed to approve registration', type: 'error' });
        }
    };

    const handleRejectRegistration = async (user: User) => {
        const result = await rejectRegistration(user.id);
        if (result) {
            setToast({ message: `${user.name}'s registration rejected`, type: 'success' });
        } else {
            setToast({ message: 'Failed to reject registration', type: 'error' });
        }
    };

    // Access denied for non-admin users - SECURITY ENFORCEMENT
    if (!isAdmin) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 max-w-md">
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600">You don't have permission to access the Admin Console.</p>
                    <p className="text-slate-500 text-sm mt-2">Only administrators can manage employee accounts and system access.</p>
                    <button onClick={() => onNavigate?.('dashboard', null)} className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Go to Dashboard</button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading employees...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Admin Console</h1>
                        <p className="text-slate-500 text-sm mt-1">Oversee all company accounts and manage system access.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">Admin Only</span>
                        {activeTab === 'dashboard' && (
                            <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Add New Employee
                            </button>
                        )}
                    </div>
                </div>
                {/* Tabs */}
                <div className="flex gap-1 mt-4 border-b border-slate-200 -mb-5">
                    <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Employee Management
                        </div>
                    </button>
                    <button onClick={() => setActiveTab('pending')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Pending Requests
                            {pendingRegistrations.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">{pendingRegistrations.length}</span>
                            )}
                        </div>
                    </button>
                    <button onClick={() => setActiveTab('permissions')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'permissions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            Roles & Permissions
                        </div>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'dashboard' ? (
                    <>
                        {/* Dashboard Metrics - Per Spec: Total Users, Registered Accounts, Active Accounts, Inactive Accounts */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Users</p>
                                <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.totalUsers}</p>
                                <div className="flex items-center gap-2 mt-3 text-blue-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    <span className="text-xs font-medium">All accounts</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Registered Accounts</p>
                                <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.totalUsers}</p>
                                <div className="flex items-center gap-2 mt-3 text-indigo-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-xs font-medium">Admin approved</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Accounts</p>
                                <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.activeAccounts}</p>
                                <div className="flex items-center gap-2 mt-3 text-emerald-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-xs font-medium">System health optimal</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Inactive Accounts</p>
                                <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.inactiveAccounts}</p>
                                <div className="flex items-center gap-2 mt-3 text-rose-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                    <span className="text-xs font-medium">Restricted access</span>
                                </div>
                            </div>
                        </div>

                        {/* Pending Registrations Alert */}
                        {pendingRegistrations.length > 0 && (
                            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-800">{pendingRegistrations.length} Pending Registration{pendingRegistrations.length > 1 ? 's' : ''}</h4>
                                            <p className="text-xs text-amber-700">New users are waiting for your approval to access the system.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('pending')} className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors">
                                        Review Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Employee Management Table - Per Spec: Employee Name, Email ID, Role, Status, Actions */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Employee Management</h2>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {roleFilter
                                                ? `Showing ${roleFilter === 'admin' ? 'Administrators' : 'Employees'} (${filteredEmployees.length})`
                                                : `Manage all registered employee accounts (${employees.length})`
                                            }
                                        </p>
                                    </div>
                                    {roleFilter && (
                                        <button
                                            onClick={clearRoleFilter}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            Clear Filter
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50">
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee Name</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email ID</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                            <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredEmployees.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${user.role === 'admin' ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-indigo-400 to-indigo-600'}`}>{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                                                        <span className="font-medium text-slate-800">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4"><span className="text-slate-600">{user.email}</span></td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'admin' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                                        {user.role === 'admin' ? 'Admin' : 'Employee'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${user.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                        <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                        {user.status === 'active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => { setSelectedEmployee(user); setIsEditModalOpen(true); }} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button onClick={() => { setSelectedEmployee(user); setIsResetPasswordModalOpen(true); }} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Reset Password">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                                        </button>
                                                        <button onClick={() => { setSelectedEmployee(user); setIsDeactivateModalOpen(true); }} className={`p-2 rounded-lg transition-colors ${user.status === 'active' ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}`} title={user.status === 'active' ? 'Deactivate' : 'Activate'}>
                                                            {user.status === 'active' ? (
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredEmployees.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <div className="text-slate-400">
                                                        <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                        <p className="font-medium">{roleFilter ? `No ${roleFilter === 'admin' ? 'administrators' : 'employees'} found` : 'No employees found'}</p>
                                                        <p className="text-sm mt-1">{roleFilter ? 'Try clearing the filter or add new users.' : 'Click "Add New Employee" to create the first account.'}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'pending' ? (
                    <>
                        {/* Pending Registrations Tab */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-800">Pending Registration Requests</h2>
                                <p className="text-sm text-slate-500 mt-1">Review and approve or reject new user registration requests</p>
                            </div>
                            {pendingRegistrations.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {pendingRegistrations.map((user) => (
                                        <div key={user.id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-lg">
                                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-800">{user.name}</h3>
                                                        <p className="text-sm text-slate-500">{user.email}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Pending Approval</span>
                                                            <span className="text-xs text-slate-400">Requested {new Date(user.created_at || '').toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        id={`role-${user.id}`}
                                                        defaultValue="user"
                                                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="user">Employee</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <button
                                                        onClick={() => {
                                                            const roleSelect = document.getElementById(`role-${user.id}`) as HTMLSelectElement;
                                                            handleApproveRegistration(user, roleSelect?.value || 'user');
                                                        }}
                                                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectRegistration(user)}
                                                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-1">No Pending Requests</h3>
                                    <p className="text-sm text-slate-500">All registration requests have been processed.</p>
                                </div>
                            )}
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div>
                                    <h4 className="text-sm font-bold text-blue-800">Registration Approval Process</h4>
                                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                        <li>• Users can request access from the main login panel</li>
                                        <li>• All requests remain in "Pending" status until admin approval</li>
                                        <li>• Assign the appropriate role (Admin/Employee) before approving</li>
                                        <li>• Rejected requests are permanently removed from the system</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Role & Permission Matrix Tab */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">System Roles</h2>
                            <p className="text-sm text-slate-500 mb-4">Click on a role card to view users with that role</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(['admin', 'user'] as UserRole[]).map((role) => {
                                    const def = roleDefinitions[role];
                                    const stats = role === 'admin' ? roleStats.admin : roleStats.employee;
                                    return (
                                        <button
                                            key={role}
                                            onClick={() => handleRoleCardClick(role)}
                                            className="bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-indigo-400 hover:shadow-lg transition-all text-left group cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${def.bgColor} ${def.color}`}>{def.label}</span>
                                                <span className="text-sm font-semibold text-slate-700">{stats.total} user{stats.total !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="text-3xl font-bold text-slate-800 mb-1">{stats.permissions}</div>
                                            <div className="text-sm text-slate-500 mb-3">permissions granted</div>
                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <span>{stats.active} active</span>
                                                <span>{stats.inactive} inactive</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-3">
                                                <span>View {def.label}s</span>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Permission Matrix Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Permission Matrix</h2>
                                    <p className="text-sm text-slate-500 mt-1">Role-based access control for Admin and Employee roles</p>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5"><span className="w-4 h-4 bg-green-500 rounded flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span>Granted</span>
                                    <span className="flex items-center gap-1.5"><span className="w-4 h-4 bg-slate-200 rounded flex items-center justify-center"><svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></span>Denied</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide w-64">Permission</th>
                                            {(['admin', 'user'] as UserRole[]).map((role) => (
                                                <th key={role} className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                    <span className={`px-2.5 py-1 rounded ${roleDefinitions[role].bgColor} ${roleDefinitions[role].color}`}>{roleDefinitions[role].label}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {permissionCategories.map((category) => (
                                            <React.Fragment key={category.name}>
                                                <tr className="bg-slate-50"><td colSpan={3} className="px-6 py-2"><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{category.name}</span></td></tr>
                                                {category.permissions.map((perm) => (
                                                    <tr key={perm.key} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="px-6 py-3"><div><p className="text-sm font-medium text-slate-800">{perm.label}</p><p className="text-xs text-slate-500">{perm.description}</p></div></td>
                                                        {(['admin', 'user'] as UserRole[]).map((role) => {
                                                            const hasPermission = roleDefinitions[role].permissions.includes(perm.key);
                                                            return (
                                                                <td key={role} className="text-center px-4 py-3">
                                                                    {hasPermission ? (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full"><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-200 rounded-full"><svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></span>
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

                        {/* Security Notice */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div>
                                    <h4 className="text-sm font-bold text-blue-800">Security & Enforcement Rules</h4>
                                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                        <li>• Admin Console access is validated at both API and UI level</li>
                                        <li>• Role permissions are enforced server-side</li>
                                        <li>• Direct URL access to Admin Console by non-admin users is blocked</li>
                                        <li>• All user creation, edits, and status changes are audit-logged</li>
                                        <li>• Users cannot switch views manually - role determines view access</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <CreateAccountModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateEmployee} />
            <EditEmployeeModal isOpen={isEditModalOpen} employee={selectedEmployee} onClose={() => { setIsEditModalOpen(false); setSelectedEmployee(null); }} onSubmit={handleEditEmployee} />
            <ResetPasswordModal isOpen={isResetPasswordModalOpen} employee={selectedEmployee} onClose={() => { setIsResetPasswordModalOpen(false); setSelectedEmployee(null); }} onSubmit={handleResetPassword} />
            <DeactivateModal isOpen={isDeactivateModalOpen} employee={selectedEmployee} onClose={() => { setIsDeactivateModalOpen(false); setSelectedEmployee(null); }} onConfirm={handleToggleStatus} />
        </div>
    );
};

export default AdminConsoleView;

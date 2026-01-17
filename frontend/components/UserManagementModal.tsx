import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface User {
    id?: number;
    full_name: string;
    email_address: string;
    phone_number: string;
    role: string;
    department: string;
    status?: string;
}

interface Permission {
    category: string;
    name: string;
    granted: boolean;
}

interface UserManagementModalProps {
    user: User | null;
    onClose: () => void;
    onSave: () => void;
}

const PERMISSION_STRUCTURE: Record<string, string[]> = {
    GENERAL: ['View Dashboard', 'Export Data'],
    PROJECTS: ['Manage Projects'],
    CAMPAIGNS: ['Manage Campaigns'],
    ANALYTICS: ['View Analytics', 'View Reports'],
    CONTENT: ['Edit Content', 'Publish Content'],
    ADMIN: ['Manage Users', 'Manage Roles', 'System Settings'],
    ASSETS: ['Manage Assets']
};

export default function UserManagementModal({ user, onClose, onSave }: UserManagementModalProps) {
    const [formData, setFormData] = useState<User>({
        full_name: '',
        email_address: '',
        phone_number: '',
        role: '',
        department: '',
        status: 'active'
    });

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(user);
            fetchUserPermissions(user.id!);
        }
        fetchRolesAndDepartments();
        initializePermissions();
    }, [user]);

    const initializePermissions = () => {
        const perms: Permission[] = [];
        Object.entries(PERMISSION_STRUCTURE).forEach(([category, names]) => {
            names.forEach(name => {
                perms.push({ category, name, granted: false });
            });
        });
        setPermissions(perms);
    };

    const fetchUserPermissions = async (userId: number) => {
        try {
            const response = await fetch(`/api/user-management/${userId}`);
            const data = await response.json();
            const userPerms = data.permissions || [];
            setPermissions(prev =>
                prev.map(p => ({
                    ...p,
                    granted: userPerms.some((up: any) => up.permission_category === p.category && up.permission_name === p.name && up.is_granted)
                }))
            );
        } catch (error) {
            console.error('Error fetching user permissions:', error);
        }
    };

    const fetchRolesAndDepartments = async () => {
        try {
            const [rolesRes, deptsRes] = await Promise.all([
                fetch('/api/user-management/list/roles'),
                fetch('/api/user-management/list/departments')
            ]);

            const rolesData = await rolesRes.json();
            const deptsData = await deptsRes.json();

            setRoles(rolesData.map((r: any) => r.role_name));
            setDepartments(deptsData.map((d: any) => d.department_name));
        } catch (error) {
            console.error('Error fetching roles/departments:', error);
            // Set default values if fetch fails
            setRoles(['Admin', 'Manager', 'Developer', 'Analyst', 'QC']);
            setDepartments(['Management', 'Marketing', 'Content', 'Technology', 'Quality']);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (category: string, name: string) => {
        setPermissions(prev =>
            prev.map(p =>
                p.category === category && p.name === name
                    ? { ...p, granted: !p.granted }
                    : p
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                ...formData,
                permissions: permissions.map(p => ({
                    category: p.category,
                    name: p.name,
                    granted: p.granted
                }))
            };

            const url = user ? `/api/user-management/${user.id}` : '/api/user-management';
            const method = user ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save user');
            }

            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {user ? 'Edit User' : 'Add New User'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., John Smith"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email_address"
                                    value={formData.email_address}
                                    onChange={handleInputChange}
                                    placeholder="john.smith@company.com"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Role & Department */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role & Department</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role *
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select role</option>
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department *
                                </label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select department</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Permissions</h3>
                        <div className="space-y-4">
                            {Object.entries(PERMISSION_STRUCTURE).map(([category, names]) => (
                                <div key={category} className="border rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">{category}</h4>
                                    <div className="space-y-2">
                                        {names.map(name => (
                                            <label key={`${category}-${name}`} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={permissions.find(p => p.category === category && p.name === name)?.granted || false}
                                                    onChange={() => handlePermissionChange(category, name)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : user ? 'Save Changes' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

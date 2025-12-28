import React, { useState, useEffect } from 'react';
import { useAuth, AuthUser, UserRole } from '../hooks/useAuth';

interface UserProfileViewProps {
    onNavigateBack?: () => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ onNavigateBack }) => {
    const { user, setCurrentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        country: '',
        phone: '',
        avatar_url: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                department: user.department || '',
                country: user.country || '',
                phone: '',
                avatar_url: user.avatar_url || ''
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setIsSaving(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (user) {
            const updatedUser: AuthUser = {
                ...user,
                name: formData.name,
                email: formData.email,
                department: formData.department,
                country: formData.country,
                avatar_url: formData.avatar_url
            };
            setCurrentUser(updatedUser);
        }

        setIsSaving(false);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                department: user.department || '',
                country: user.country || '',
                phone: '',
                avatar_url: user.avatar_url || ''
            });
        }
        setIsEditing(false);
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800';
            case 'user': return 'bg-blue-100 text-blue-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Please log in to view your profile</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {onNavigateBack && (
                            <button
                                onClick={onNavigateBack}
                                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
                            <p className="text-sm text-slate-500">Manage your account information</p>
                        </div>
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {/* Success Message */}
                {saveSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-green-800 font-medium">Profile updated successfully!</p>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-8">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <img
                                    src={formData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=${user.role === 'admin' ? '7c3aed' : '3b82f6'}&color=fff&size=96`}
                                    alt={formData.name}
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                                />
                                {isEditing && (
                                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors">
                                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">{formData.name || 'User'}</h2>
                                <p className="text-white/80">{formData.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                        {user.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                        placeholder="Enter your name"
                                    />
                                ) : (
                                    <p className="px-4 py-2.5 bg-slate-50 rounded-lg text-slate-800">{formData.name || '-'}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                        placeholder="Enter your email"
                                    />
                                ) : (
                                    <p className="px-4 py-2.5 bg-slate-50 rounded-lg text-slate-800">{formData.email || '-'}</p>
                                )}
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                                {isEditing ? (
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Design">Design</option>
                                        <option value="Operations">Operations</option>
                                        <option value="HR">HR</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                ) : (
                                    <p className="px-4 py-2.5 bg-slate-50 rounded-lg text-slate-800">{formData.department || '-'}</p>
                                )}
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                                {isEditing ? (
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                    >
                                        <option value="">Select Country</option>
                                        <option value="United States">United States</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Australia">Australia</option>
                                        <option value="India">India</option>
                                        <option value="Germany">Germany</option>
                                        <option value="France">France</option>
                                    </select>
                                ) : (
                                    <p className="px-4 py-2.5 bg-slate-50 rounded-lg text-slate-800">{formData.country || '-'}</p>
                                )}
                            </div>

                            {/* Role (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                                <p className="px-4 py-2.5 bg-slate-100 rounded-lg text-slate-600">
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    <span className="text-xs text-slate-400 ml-2">(Contact admin to change)</span>
                                </p>
                            </div>

                            {/* Member Since */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Member Since</label>
                                <p className="px-4 py-2.5 bg-slate-50 rounded-lg text-slate-800">
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : '-'}
                                </p>
                            </div>
                        </div>

                        {/* Last Login Info */}
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    Last login: {user.last_login
                                        ? new Date(user.last_login).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'Just now'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            Change Password
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Notification Settings
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;

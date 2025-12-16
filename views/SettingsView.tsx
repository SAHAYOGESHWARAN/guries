
import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import type { User, IntegrationLog } from '../types';

// --- Sub-Components ---

const ProfileTab: React.FC<{ user: User | null; refresh: () => void }> = ({ user, refresh }) => {
    const { update } = useData<User>('users');
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email, role: user.role, department: user.department });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        await update(user.id, formData);
        alert('Profile updated successfully');
        refresh(); // Refresh parent data
    };

    if (!user) return (
        <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Loading user profile...</p>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-3xl lg:text-4xl font-bold text-white shadow-lg overflow-hidden">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            user.name?.charAt(0)?.toUpperCase()
                        )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800">{user.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{user.role} • {user.department}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${user.status === 'active'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                }`}></span>
                            {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                            Administrator
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
                <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                autoComplete="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                placeholder="Enter your email address"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                            <input
                                type="text"
                                value={formData.role || ''}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                placeholder="Enter your role"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                            <input
                                type="text"
                                value={formData.department || ''}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                placeholder="Enter your department"
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Settings */}
                <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">Preferences</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <h5 className="font-medium text-slate-800">Email Notifications</h5>
                                <p className="text-sm text-slate-600">Receive email updates about your account</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <h5 className="font-medium text-slate-800">Two-Factor Authentication</h5>
                                <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                            </div>
                            <button className="px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors">
                                Enable
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
                <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                    Save Changes
                </button>
                <button className="px-6 py-3 text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    );
};

const SecurityTab: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start">
            <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div>
                <h4 className="text-sm font-bold text-yellow-800">Security Recommendation</h4>
                <p className="text-xs text-yellow-700 mt-0.5">Enable Multi-Factor Authentication (MFA) to enhance your account security.</p>
            </div>
        </div>

        <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Password</h3>
            <div className="space-y-3 w-full">
                <input type="password" placeholder="Current Password" autoComplete="current-password" className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                <input type="password" placeholder="New Password" autoComplete="new-password" className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                <button className="text-indigo-600 font-medium text-xs hover:underline">Update Password</button>
            </div>
        </div>
    </div>
);

const NotificationsTab: React.FC = () => {
    const notificationCategories = [
        {
            title: 'Email Notifications',
            description: 'Choose what email notifications you want to receive',
            items: [
                { id: 'campaign-updates', name: 'Campaign Updates', description: 'Get notified when campaigns are updated or completed', enabled: true },
                { id: 'task-assignments', name: 'Task Assignments', description: 'Receive notifications when tasks are assigned to you', enabled: true },
                { id: 'weekly-reports', name: 'Weekly Reports', description: 'Get weekly performance and analytics reports', enabled: false },
                { id: 'security-alerts', name: 'Security Alerts', description: 'Important security notifications and login alerts', enabled: true },
            ]
        },
        {
            title: 'Push Notifications',
            description: 'Manage browser and mobile push notifications',
            items: [
                { id: 'urgent-tasks', name: 'Urgent Tasks', description: 'Get push notifications for high-priority tasks', enabled: true },
                { id: 'mentions', name: 'Mentions & Comments', description: 'When someone mentions you or comments on your work', enabled: true },
                { id: 'deadlines', name: 'Deadline Reminders', description: 'Reminders for upcoming deadlines', enabled: false },
            ]
        },
        {
            title: 'System Notifications',
            description: 'System-wide notifications and updates',
            items: [
                { id: 'system-updates', name: 'System Updates', description: 'Notifications about system maintenance and updates', enabled: true },
                { id: 'feature-announcements', name: 'Feature Announcements', description: 'Learn about new features and improvements', enabled: false },
            ]
        }
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
            <div>
                <h3 className="text-xl font-bold text-slate-800">Notification Preferences</h3>
                <p className="text-slate-600 mt-2">Manage how and when you receive notifications</p>
            </div>

            {notificationCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-4">
                    <div>
                        <h4 className="text-lg font-semibold text-slate-800">{category.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                    </div>

                    <div className="space-y-3">
                        {category.items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="flex-1 pr-4">
                                    <h5 className="font-medium text-slate-800">{item.name}</h5>
                                    <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        defaultChecked={item.enabled}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Notification Schedule */}
            <div className="space-y-4">
                <div>
                    <h4 className="text-lg font-semibold text-slate-800">Notification Schedule</h4>
                    <p className="text-sm text-slate-600 mt-1">Set quiet hours when you don't want to receive notifications</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-medium text-slate-800">Enable Quiet Hours</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">From</label>
                            <input
                                type="time"
                                defaultValue="22:00"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
                            <input
                                type="time"
                                defaultValue="08:00"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
                <button className="px-6 py-3 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                    Save Preferences
                </button>
                <button className="px-6 py-3 text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                    Reset to Default
                </button>
            </div>
        </div>
    );
};

const AdminConsole: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    const [maintenanceStatus, setMaintenanceStatus] = useState<string>('');

    const runMaintenance = async (action: string) => {
        setMaintenanceStatus(`Running ${action}...`);
        try {
            await fetch('http://localhost:3001/api/v1/settings/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            setMaintenanceStatus(`${action} completed.`);
            setTimeout(() => setMaintenanceStatus(''), 3000);
        } catch (e) {
            setMaintenanceStatus('Error executing action.');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">API Status</p>
                    <p className="text-base font-bold text-green-600 mt-0.5">Operational</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Latency: 45ms</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Database</p>
                    <p className="text-base font-bold text-blue-600 mt-0.5">Healthy</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Conns: 12/20</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Cache (Redis)</p>
                    <p className="text-base font-bold text-purple-600 mt-0.5">Active</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Hit Rate: 94%</p>
                </div>
            </div>

            {/* Config Management */}
            <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">System Configurations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { label: 'Users & Roles', view: 'user-role-master', icon: '👥' },
                        { label: 'Workflows', view: 'workflow-stage-master', icon: '🔄' },
                        { label: 'Industries', view: 'industry-sector-master', icon: '🏭' },
                        { label: 'Platforms', view: 'platform-master', icon: '📱' },
                        { label: 'Content Types', view: 'content-type-master', icon: '📄' },
                        { label: 'Asset Types', view: 'asset-type-master', icon: '🖼️' },
                    ].map((item) => (
                        <button
                            key={item.view}
                            onClick={() => onNavigate(item.view)}
                            className="flex items-center p-2.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-lg transition-all shadow-sm group"
                        >
                            <span className="text-lg mr-3 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="font-bold text-slate-700 text-xs group-hover:text-indigo-700">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface SettingsViewProps {
    onNavigate?: (view: string, id: number | null) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
    const { data: users, refresh } = useData<User>('users');
    const currentUser = users[0] || null; // Safely get first user (typically logged in user)

    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'admin'>('profile');

    const tabs = [
        { id: 'profile', name: 'Profile', icon: '👤' },
        { id: 'security', name: 'Security', icon: '🔒' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'admin', name: 'Admin Console', icon: '⚙️' }
    ];

    return (
        <div className="h-full flex flex-col animate-fade-in w-full overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden px-4 py-4 bg-white border-b border-slate-200">
                <h1 className="text-xl font-bold text-slate-800">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden bg-white border-b border-slate-200 px-4">
                <div className="flex space-x-1 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'bg-brand-100 text-brand-700'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Header & Sidebar */}
                <div className="hidden lg:flex lg:flex-col lg:w-80 lg:flex-shrink-0 bg-white border-r border-slate-200">
                    {/* Desktop Header */}
                    <div className="px-6 py-6 border-b border-slate-200">
                        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage your account preferences and system configurations</p>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="flex-1 px-4 py-6">
                        <div className="space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <span className="text-lg">{tab.icon}</span>
                                    <span>{tab.name}</span>
                                    {activeTab === tab.id && (
                                        <div className="ml-auto w-2 h-2 bg-brand-500 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="p-4 lg:p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                {activeTab === 'profile' && <ProfileTab user={currentUser} refresh={refresh} />}
                                {activeTab === 'security' && <SecurityTab />}
                                {activeTab === 'notifications' && <NotificationsTab />}
                                {activeTab === 'admin' && <AdminConsole onNavigate={(view) => onNavigate && onNavigate(view, null)} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;

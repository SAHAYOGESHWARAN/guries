
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

    if (!user) return <div className="p-4 text-slate-500">Loading user profile...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 border-4 border-white shadow-md overflow-hidden">
                        {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
                    <p className="text-xs text-slate-500">{user.role} • {user.department}</p>
                    <div className="mt-2 flex space-x-2">
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium border ${user.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {user.status}
                        </span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        autoComplete="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors">
                    Save Changes
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

const NotificationsTab: React.FC = () => (
    <div className="space-y-4 animate-fade-in">
        <h3 className="text-sm font-bold text-slate-800">Email Preferences</h3>
        <div className="space-y-3">
            {['Campaign Updates', 'Task Assignments', 'Weekly Reports', 'Security Alerts'].map(item => (
                <label key={item} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                </label>
            ))}
        </div>
    </div>
);

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

    return (
        <div className="space-y-6 h-full flex flex-col animate-fade-in w-full overflow-y-auto pr-1 p-6">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage your account preferences and system configurations.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
                {/* Settings Sidebar */}
                <div className="w-full md:w-56 flex-shrink-0">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-0">
                        <nav className="flex flex-col p-2 space-y-0.5">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                Security
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                Notifications
                            </button>
                            <div className="h-px bg-slate-100 my-1 mx-2"></div>
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center ${activeTab === 'admin' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <svg className={`w-3 h-3 mr-2 ${activeTab === 'admin' ? 'text-indigo-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Admin Console
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Panel */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-y-auto">
                    {activeTab === 'profile' && <ProfileTab user={currentUser} refresh={refresh} />}
                    {activeTab === 'security' && <SecurityTab />}
                    {activeTab === 'notifications' && <NotificationsTab />}
                    {activeTab === 'admin' && <AdminConsole onNavigate={(view) => onNavigate && onNavigate(view, null)} />}
                </div>
            </div>
        </div>
    );
};

export default SettingsView;

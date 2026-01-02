import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AutomationRule {
    id: number;
    rule_name: string;
    description: string;
    trigger_type: string;
    trigger_condition: string;
    action_type: string;
    recipients: string;
    status: string;
}

interface AutomationNotificationsViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

const AutomationNotificationsView: React.FC<AutomationNotificationsViewProps> = ({ onNavigate }) => {
    const { hasPermission } = useAuth();
    const canAccess = hasPermission('canViewAdminConsole');

    const [rules, setRules] = useState<AutomationRule[]>([
        { id: 1, rule_name: 'Task Deadline Reminder', description: 'Send reminder 24h before task deadline', trigger_type: 'Schedule', trigger_condition: '24 hours before deadline', action_type: 'Email + In-App', recipients: 'Assignee', status: 'Active' },
        { id: 2, rule_name: 'QC Approval Notification', description: 'Notify when asset is approved', trigger_type: 'Event', trigger_condition: 'Asset status = Approved', action_type: 'Email + Slack', recipients: 'Asset Owner', status: 'Active' },
        { id: 3, rule_name: 'Weekly Performance Report', description: 'Send weekly performance summary', trigger_type: 'Schedule', trigger_condition: 'Every Monday 9 AM', action_type: 'Email', recipients: 'All Managers', status: 'Active' },
        { id: 4, rule_name: 'High Priority Task Alert', description: 'Alert when high priority task is created', trigger_type: 'Event', trigger_condition: 'Task priority = High', action_type: 'Slack + SMS', recipients: 'Team Lead', status: 'Active' },
        { id: 5, rule_name: 'Campaign Launch Notification', description: 'Notify team when campaign goes live', trigger_type: 'Event', trigger_condition: 'Campaign status = Live', action_type: 'Email + In-App', recipients: 'Campaign Team', status: 'Active' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<AutomationRule | null>(null);
    const [formData, setFormData] = useState({ rule_name: '', description: '', trigger_type: 'Event', trigger_condition: '', action_type: 'Email', recipients: '', status: 'Active' });

    if (!canAccess) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600">Only administrators can access this configuration.</p>
                </div>
            </div>
        );
    }

    const handleSave = () => {
        if (editingItem) {
            setRules(rules.map(r => r.id === editingItem.id ? { ...r, ...formData } : r));
        } else {
            setRules([...rules, { ...formData, id: Date.now() } as AutomationRule]);
        }
        setShowModal(false);
        setEditingItem(null);
        setFormData({ rule_name: '', description: '', trigger_type: 'Event', trigger_condition: '', action_type: 'Email', recipients: '', status: 'Active' });
    };

    const handleEdit = (item: AutomationRule) => {
        setEditingItem(item);
        setFormData(item);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this automation rule?')) {
            setRules(rules.filter(r => r.id !== id));
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => onNavigate?.('admin-console-config')} className="p-2 hover:bg-slate-100 rounded-lg">
                            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl">🔔</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Automation & Notifications</h1>
                            <p className="text-slate-500 text-sm">Configure automated workflows, alerts, and notification preferences</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Rule
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Rule</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Trigger</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Condition</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Action</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Recipients</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rules.map(rule => (
                                <tr key={rule.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-800">{rule.rule_name}</p>
                                        <p className="text-xs text-slate-500">{rule.description}</p>
                                    </td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${rule.trigger_type === 'Event' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{rule.trigger_type}</span></td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{rule.trigger_condition}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{rule.action_type}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{rule.recipients}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rule.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{rule.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(rule)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                        <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{editingItem ? 'Edit Automation Rule' : 'Add Automation Rule'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name</label>
                                <input type="text" value={formData.rule_name} onChange={e => setFormData({ ...formData, rule_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2}></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Trigger Type</label>
                                    <select value={formData.trigger_type} onChange={e => setFormData({ ...formData, trigger_type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="Event">Event</option>
                                        <option value="Schedule">Schedule</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Action Type</label>
                                    <select value={formData.action_type} onChange={e => setFormData({ ...formData, action_type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="Email">Email</option>
                                        <option value="Slack">Slack</option>
                                        <option value="SMS">SMS</option>
                                        <option value="In-App">In-App</option>
                                        <option value="Email + Slack">Email + Slack</option>
                                        <option value="Email + In-App">Email + In-App</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Trigger Condition</label>
                                <input type="text" value={formData.trigger_condition} onChange={e => setFormData({ ...formData, trigger_condition: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g., Task status = Complete" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Recipients</label>
                                <input type="text" value={formData.recipients} onChange={e => setFormData({ ...formData, recipients: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g., Assignee, Team Lead" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-violet-600 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutomationNotificationsView;

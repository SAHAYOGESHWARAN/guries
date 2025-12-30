import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface DashboardWidget {
    id: number;
    widget_name: string;
    description: string;
    widget_type: string;
    data_source: string;
    refresh_interval: string;
    roles_visible: string;
    position: number;
    status: string;
}

interface DashboardConfigViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

const DashboardConfigView: React.FC<DashboardConfigViewProps> = ({ onNavigate }) => {
    const { hasPermission } = useAuth();
    const canAccess = hasPermission('canViewAdminConsole');

    const [widgets, setWidgets] = useState<DashboardWidget[]>([
        { id: 1, widget_name: 'Performance Overview', description: 'Key performance metrics summary', widget_type: 'Chart', data_source: 'Performance API', refresh_interval: '5 min', roles_visible: 'All', position: 1, status: 'Active' },
        { id: 2, widget_name: 'Task Progress', description: 'Task completion status by team', widget_type: 'Progress Bar', data_source: 'Tasks API', refresh_interval: '1 min', roles_visible: 'All', position: 2, status: 'Active' },
        { id: 3, widget_name: 'QC Status', description: 'Quality control review status', widget_type: 'Donut Chart', data_source: 'QC API', refresh_interval: '5 min', roles_visible: 'Admin, QC', position: 3, status: 'Active' },
        { id: 4, widget_name: 'Team Leaderboard', description: 'Top performers this month', widget_type: 'Table', data_source: 'Scoring API', refresh_interval: '1 hour', roles_visible: 'All', position: 4, status: 'Active' },
        { id: 5, widget_name: 'Campaign Analytics', description: 'Active campaign performance', widget_type: 'Line Chart', data_source: 'Campaigns API', refresh_interval: '15 min', roles_visible: 'Manager, Admin', position: 5, status: 'Active' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<DashboardWidget | null>(null);
    const [formData, setFormData] = useState({ widget_name: '', description: '', widget_type: 'Chart', data_source: '', refresh_interval: '5 min', roles_visible: 'All', position: 1, status: 'Active' });

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
            setWidgets(widgets.map(w => w.id === editingItem.id ? { ...w, ...formData } : w));
        } else {
            setWidgets([...widgets, { ...formData, id: Date.now() } as DashboardWidget]);
        }
        setShowModal(false);
        setEditingItem(null);
        setFormData({ widget_name: '', description: '', widget_type: 'Chart', data_source: '', refresh_interval: '5 min', roles_visible: 'All', position: 1, status: 'Active' });
    };

    const handleEdit = (item: DashboardWidget) => {
        setEditingItem(item);
        setFormData(item);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this widget?')) {
            setWidgets(widgets.filter(w => w.id !== id));
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
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl">⊞</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Dashboard Configuration</h1>
                            <p className="text-slate-500 text-sm">Customize dashboard layouts, widgets, and data visualization</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Widget
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {widgets.map(widget => (
                        <div key={widget.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                                        {widget.widget_type === 'Chart' && '📊'}
                                        {widget.widget_type === 'Progress Bar' && '📈'}
                                        {widget.widget_type === 'Donut Chart' && '🍩'}
                                        {widget.widget_type === 'Table' && '📋'}
                                        {widget.widget_type === 'Line Chart' && '📉'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{widget.widget_name}</h3>
                                        <p className="text-xs text-slate-500">{widget.widget_type}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${widget.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{widget.status}</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{widget.description}</p>
                            <div className="space-y-2 text-xs text-slate-500">
                                <div className="flex justify-between"><span>Data Source:</span><span className="text-slate-700">{widget.data_source}</span></div>
                                <div className="flex justify-between"><span>Refresh:</span><span className="text-slate-700">{widget.refresh_interval}</span></div>
                                <div className="flex justify-between"><span>Visible to:</span><span className="text-slate-700">{widget.roles_visible}</span></div>
                            </div>
                            <div className="flex gap-2 pt-3 mt-3 border-t border-slate-100">
                                <button onClick={() => handleEdit(widget)} className="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
                                <button onClick={() => handleDelete(widget.id)} className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{editingItem ? 'Edit Widget' : 'Add Widget'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Widget Name</label>
                                <input type="text" value={formData.widget_name} onChange={e => setFormData({ ...formData, widget_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2}></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Widget Type</label>
                                    <select value={formData.widget_type} onChange={e => setFormData({ ...formData, widget_type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="Chart">Chart</option>
                                        <option value="Progress Bar">Progress Bar</option>
                                        <option value="Donut Chart">Donut Chart</option>
                                        <option value="Table">Table</option>
                                        <option value="Line Chart">Line Chart</option>
                                        <option value="KPI Card">KPI Card</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Refresh Interval</label>
                                    <select value={formData.refresh_interval} onChange={e => setFormData({ ...formData, refresh_interval: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="1 min">1 minute</option>
                                        <option value="5 min">5 minutes</option>
                                        <option value="15 min">15 minutes</option>
                                        <option value="1 hour">1 hour</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data Source</label>
                                <input type="text" value={formData.data_source} onChange={e => setFormData({ ...formData, data_source: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g., Performance API" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Visible to Roles</label>
                                <input type="text" value={formData.roles_visible} onChange={e => setFormData({ ...formData, roles_visible: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g., All, Admin, Manager" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-slate-700 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardConfigView;

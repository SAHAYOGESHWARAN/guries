import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface KPI {
    id: number;
    kpi_name: string;
    description: string;
    kra_name: string;
    unit: string;
    target_value: number;
    current_value: number;
    frequency: string;
    status: string;
}

interface KPIMasterViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

const KPIMasterView: React.FC<KPIMasterViewProps> = ({ onNavigate }) => {
    const { hasPermission } = useAuth();
    const canAccess = hasPermission('canViewAdminConsole');

    const [kpis, setKpis] = useState<KPI[]>([
        { id: 1, kpi_name: 'Monthly Revenue', description: 'Total monthly revenue generated', kra_name: 'Revenue Growth', unit: 'USD', target_value: 500000, current_value: 425000, frequency: 'Monthly', status: 'Active' },
        { id: 2, kpi_name: 'Customer Churn Rate', description: 'Percentage of customers lost', kra_name: 'Customer Retention', unit: '%', target_value: 5, current_value: 3.2, frequency: 'Monthly', status: 'Active' },
        { id: 3, kpi_name: 'Net Promoter Score', description: 'Customer satisfaction metric', kra_name: 'NPS Score', unit: 'Score', target_value: 50, current_value: 47, frequency: 'Quarterly', status: 'Active' },
        { id: 4, kpi_name: 'System Availability', description: 'Platform uptime percentage', kra_name: 'System Uptime', unit: '%', target_value: 99.9, current_value: 99.95, frequency: 'Daily', status: 'Active' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<KPI | null>(null);
    const [formData, setFormData] = useState({ kpi_name: '', description: '', kra_name: '', unit: '', target_value: 0, frequency: 'Monthly', status: 'Active' });

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
            setKpis(kpis.map(k => k.id === editingItem.id ? { ...k, ...formData, current_value: editingItem.current_value } : k));
        } else {
            setKpis([...kpis, { ...formData, id: Date.now(), current_value: 0 } as KPI]);
        }
        setShowModal(false);
        setEditingItem(null);
        setFormData({ kpi_name: '', description: '', kra_name: '', unit: '', target_value: 0, frequency: 'Monthly', status: 'Active' });
    };

    const handleEdit = (item: KPI) => {
        setEditingItem(item);
        setFormData({ kpi_name: item.kpi_name, description: item.description, kra_name: item.kra_name, unit: item.unit, target_value: item.target_value, frequency: item.frequency, status: item.status });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this KPI?')) {
            setKpis(kpis.filter(k => k.id !== id));
        }
    };

    const getProgressColor = (current: number, target: number, unit: string) => {
        const percentage = unit === '%' && target < 10 ? (target - current) / target * 100 : (current / target) * 100;
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 70) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => onNavigate?.('admin-console-config')} className="p-2 hover:bg-slate-100 rounded-lg">
                            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl">📊</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">KPI Master</h1>
                            <p className="text-slate-500 text-sm">Set up Key Performance Indicators to track progress and measure success</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add KPI
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {kpis.map(kpi => (
                        <div key={kpi.id} className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{kpi.kpi_name}</p>
                                    <p className="text-xs text-slate-500">{kpi.kra_name}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${kpi.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{kpi.status}</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800 mb-1">{kpi.current_value.toLocaleString()} <span className="text-sm font-normal text-slate-500">{kpi.unit}</span></div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${getProgressColor(kpi.current_value, kpi.target_value, kpi.unit)}`} style={{ width: `${Math.min((kpi.current_value / kpi.target_value) * 100, 100)}%` }}></div>
                                </div>
                                <span className="text-xs text-slate-500">{Math.round((kpi.current_value / kpi.target_value) * 100)}%</span>
                            </div>
                            <p className="text-xs text-slate-500">Target: {kpi.target_value.toLocaleString()} {kpi.unit} • {kpi.frequency}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">KPI</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Linked KRA</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Target</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Current</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Frequency</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {kpis.map(kpi => (
                                <tr key={kpi.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-800">{kpi.kpi_name}</p>
                                        <p className="text-xs text-slate-500">{kpi.description}</p>
                                    </td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">{kpi.kra_name}</span></td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{kpi.target_value.toLocaleString()} {kpi.unit}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{kpi.current_value.toLocaleString()} {kpi.unit}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{kpi.frequency}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(kpi)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                        <button onClick={() => handleDelete(kpi.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{editingItem ? 'Edit KPI' : 'Add KPI'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">KPI Name</label>
                                <input type="text" value={formData.kpi_name} onChange={e => setFormData({ ...formData, kpi_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2}></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Linked KRA</label>
                                    <input type="text" value={formData.kra_name} onChange={e => setFormData({ ...formData, kra_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                                    <input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="%, USD, Score, etc." />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Value</label>
                                    <input type="number" value={formData.target_value} onChange={e => setFormData({ ...formData, target_value: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                                    <select value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPIMasterView;

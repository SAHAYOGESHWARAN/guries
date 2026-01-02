import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface KPITarget {
    id: number;
    kpi_name: string;
    target_type: string;
    target_value: number;
    unit: string;
    period: string;
    threshold_min: number;
    threshold_max: number;
    status: string;
}

interface KPITargetConfigViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

const KPITargetConfigView: React.FC<KPITargetConfigViewProps> = ({ onNavigate }) => {
    const { hasPermission } = useAuth();
    const canAccess = hasPermission('canViewAdminConsole');

    const [targets, setTargets] = useState<KPITarget[]>([
        { id: 1, kpi_name: 'Content Output', target_type: 'Monthly', target_value: 50, unit: 'Articles', period: 'Q1 2025', threshold_min: 40, threshold_max: 60, status: 'Active' },
        { id: 2, kpi_name: 'Backlinks Acquired', target_type: 'Monthly', target_value: 100, unit: 'Links', period: 'Q1 2025', threshold_min: 80, threshold_max: 120, status: 'Active' },
        { id: 3, kpi_name: 'QC Pass Rate', target_type: 'Weekly', target_value: 95, unit: '%', period: 'Q1 2025', threshold_min: 90, threshold_max: 100, status: 'Active' },
        { id: 4, kpi_name: 'Task Completion', target_type: 'Daily', target_value: 8, unit: 'Tasks', period: 'Q1 2025', threshold_min: 6, threshold_max: 10, status: 'Active' },
        { id: 5, kpi_name: 'Client Satisfaction', target_type: 'Quarterly', target_value: 4.5, unit: 'Rating', period: 'Q1 2025', threshold_min: 4.0, threshold_max: 5.0, status: 'Active' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<KPITarget | null>(null);
    const [formData, setFormData] = useState({ kpi_name: '', target_type: 'Monthly', target_value: 0, unit: '', period: 'Q1 2025', threshold_min: 0, threshold_max: 0, status: 'Active' });

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
            setTargets(targets.map(t => t.id === editingItem.id ? { ...t, ...formData } : t));
        } else {
            setTargets([...targets, { ...formData, id: Date.now() } as KPITarget]);
        }
        setShowModal(false);
        setEditingItem(null);
        setFormData({ kpi_name: '', target_type: 'Monthly', target_value: 0, unit: '', period: 'Q1 2025', threshold_min: 0, threshold_max: 0, status: 'Active' });
    };

    const handleEdit = (item: KPITarget) => {
        setEditingItem(item);
        setFormData(item);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this KPI target?')) {
            setTargets(targets.filter(t => t.id !== id));
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
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl">◎</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">KPI Target Configuration</h1>
                            <p className="text-slate-500 text-sm">Define target values, thresholds, and benchmarks for each KPI</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Target
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">KPI Name</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Target Type</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Target Value</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Period</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Threshold Range</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {targets.map(target => (
                                <tr key={target.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-800">{target.kpi_name}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{target.target_type}</span></td>
                                    <td className="px-6 py-4 text-slate-700">{target.target_value} {target.unit}</td>
                                    <td className="px-6 py-4 text-slate-600">{target.period}</td>
                                    <td className="px-6 py-4 text-slate-600">{target.threshold_min} - {target.threshold_max} {target.unit}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${target.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{target.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(target)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                        <button onClick={() => handleDelete(target.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{editingItem ? 'Edit KPI Target' : 'Add KPI Target'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">KPI Name</label>
                                <input type="text" value={formData.kpi_name} onChange={e => setFormData({ ...formData, kpi_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Type</label>
                                    <select value={formData.target_type} onChange={e => setFormData({ ...formData, target_type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
                                    <input type="text" value={formData.period} onChange={e => setFormData({ ...formData, period: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Value</label>
                                    <input type="number" value={formData.target_value} onChange={e => setFormData({ ...formData, target_value: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                                    <input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Min Threshold</label>
                                    <input type="number" value={formData.threshold_min} onChange={e => setFormData({ ...formData, threshold_min: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Threshold</label>
                                    <input type="number" value={formData.threshold_max} onChange={e => setFormData({ ...formData, threshold_max: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPITargetConfigView;

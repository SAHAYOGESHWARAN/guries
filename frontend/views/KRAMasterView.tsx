import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface KRA {
    id: number;
    kra_name: string;
    description: string;
    objective_id: number;
    objective_name: string;
    weightage: number;
    measurement_criteria: string;
    status: string;
}

interface KRAMasterViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

const KRAMasterView: React.FC<KRAMasterViewProps> = ({ onNavigate }) => {
    const { hasPermission } = useAuth();
    const canAccess = hasPermission('canViewAdminConsole');

    const [kras, setKras] = useState<KRA[]>([
        { id: 1, kra_name: 'Revenue Growth', description: 'Achieve quarterly revenue targets', objective_id: 1, objective_name: 'Increase Market Share', weightage: 30, measurement_criteria: 'Quarterly revenue vs target', status: 'Active' },
        { id: 2, kra_name: 'Customer Retention', description: 'Maintain customer retention rate above 90%', objective_id: 2, objective_name: 'Improve Customer Satisfaction', weightage: 25, measurement_criteria: 'Monthly retention rate', status: 'Active' },
        { id: 3, kra_name: 'NPS Score', description: 'Achieve NPS score of 50+', objective_id: 2, objective_name: 'Improve Customer Satisfaction', weightage: 20, measurement_criteria: 'Quarterly NPS survey', status: 'Active' },
        { id: 4, kra_name: 'System Uptime', description: 'Maintain 99.9% system availability', objective_id: 3, objective_name: 'Digital Transformation', weightage: 25, measurement_criteria: 'Monthly uptime percentage', status: 'Active' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<KRA | null>(null);
    const [formData, setFormData] = useState({ kra_name: '', description: '', objective_name: '', weightage: 0, measurement_criteria: '', status: 'Active' });

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
            setKras(kras.map(k => k.id === editingItem.id ? { ...k, ...formData, objective_id: 1 } : k));
        } else {
            setKras([...kras, { ...formData, id: Date.now(), objective_id: 1 } as KRA]);
        }
        setShowModal(false);
        setEditingItem(null);
        setFormData({ kra_name: '', description: '', objective_name: '', weightage: 0, measurement_criteria: '', status: 'Active' });
    };

    const handleEdit = (item: KRA) => {
        setEditingItem(item);
        setFormData({ kra_name: item.kra_name, description: item.description, objective_name: item.objective_name, weightage: item.weightage, measurement_criteria: item.measurement_criteria, status: item.status });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this KRA?')) {
            setKras(kras.filter(k => k.id !== id));
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
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl">📈</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">KRA Master</h1>
                            <p className="text-slate-500 text-sm">Configure Key Result Areas to measure team and individual performance</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add KRA
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">KRA</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Linked Objective</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Weightage</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Measurement</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {kras.map(kra => (
                                <tr key={kra.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-800">{kra.kra_name}</p>
                                        <p className="text-xs text-slate-500">{kra.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{kra.objective_name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${kra.weightage}%` }}></div>
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{kra.weightage}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{kra.measurement_criteria}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${kra.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{kra.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(kra)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                        <button onClick={() => handleDelete(kra.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{editingItem ? 'Edit KRA' : 'Add KRA'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">KRA Name</label>
                                <input type="text" value={formData.kra_name} onChange={e => setFormData({ ...formData, kra_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2}></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Linked Objective</label>
                                    <input type="text" value={formData.objective_name} onChange={e => setFormData({ ...formData, objective_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Weightage (%)</label>
                                    <input type="number" min="0" max="100" value={formData.weightage} onChange={e => setFormData({ ...formData, weightage: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Measurement Criteria</label>
                                <input type="text" value={formData.measurement_criteria} onChange={e => setFormData({ ...formData, measurement_criteria: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KRAMasterView;

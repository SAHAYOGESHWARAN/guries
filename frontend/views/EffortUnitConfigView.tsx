import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface EffortUnit {
    id: number;
    unit_name: string;
    description: string;
    base_hours: number;
    complexity_factor: number;
    category: string;
    status: string;
}

interface EffortUnitConfigViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

const EffortUnitConfigView: React.FC<EffortUnitConfigViewProps> = ({ onNavigate }) => {
    const { hasPermission } = useAuth();
    const canAccess = hasPermission('canViewAdminConsole');

    const [units, setUnits] = useState<EffortUnit[]>([
        { id: 1, unit_name: 'Blog Article (500 words)', description: 'Standard blog post writing', base_hours: 2, complexity_factor: 1.0, category: 'Content', status: 'Active' },
        { id: 2, unit_name: 'Blog Article (1000 words)', description: 'Long-form blog post', base_hours: 4, complexity_factor: 1.2, category: 'Content', status: 'Active' },
        { id: 3, unit_name: 'Backlink Outreach', description: 'Single backlink acquisition', base_hours: 1, complexity_factor: 1.5, category: 'SEO', status: 'Active' },
        { id: 4, unit_name: 'Social Media Post', description: 'Single platform post', base_hours: 0.5, complexity_factor: 1.0, category: 'SMM', status: 'Active' },
        { id: 5, unit_name: 'Technical Audit', description: 'Full site technical audit', base_hours: 8, complexity_factor: 2.0, category: 'SEO', status: 'Active' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<EffortUnit | null>(null);
    const [formData, setFormData] = useState({ unit_name: '', description: '', base_hours: 0, complexity_factor: 1.0, category: 'Content', status: 'Active' });

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
            setUnits(units.map(u => u.id === editingItem.id ? { ...u, ...formData } : u));
        } else {
            setUnits([...units, { ...formData, id: Date.now() } as EffortUnit]);
        }
        setShowModal(false);
        setEditingItem(null);
        setFormData({ unit_name: '', description: '', base_hours: 0, complexity_factor: 1.0, category: 'Content', status: 'Active' });
    };

    const handleEdit = (item: EffortUnit) => {
        setEditingItem(item);
        setFormData(item);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this effort unit?')) {
            setUnits(units.filter(u => u.id !== id));
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
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl">⚡</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Effort Unit Configuration</h1>
                            <p className="text-slate-500 text-sm">Configure how effort and time are measured across tasks</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Unit
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Unit Name</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Category</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Base Hours</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Complexity</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {units.map(unit => (
                                <tr key={unit.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-800">{unit.unit_name}</p>
                                        <p className="text-xs text-slate-500">{unit.description}</p>
                                    </td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{unit.category}</span></td>
                                    <td className="px-6 py-4 text-slate-700">{unit.base_hours}h</td>
                                    <td className="px-6 py-4 text-slate-600">{unit.complexity_factor}x</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${unit.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{unit.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(unit)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                        <button onClick={() => handleDelete(unit.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{editingItem ? 'Edit Effort Unit' : 'Add Effort Unit'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Name</label>
                                <input type="text" value={formData.unit_name} onChange={e => setFormData({ ...formData, unit_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2}></textarea>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="Content">Content</option>
                                        <option value="SEO">SEO</option>
                                        <option value="SMM">SMM</option>
                                        <option value="Design">Design</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Base Hours</label>
                                    <input type="number" step="0.5" value={formData.base_hours} onChange={e => setFormData({ ...formData, base_hours: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Complexity</label>
                                    <input type="number" step="0.1" value={formData.complexity_factor} onChange={e => setFormData({ ...formData, complexity_factor: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-amber-600 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EffortUnitConfigView;

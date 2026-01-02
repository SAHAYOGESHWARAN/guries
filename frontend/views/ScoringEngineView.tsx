import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ScoringRule {
    id: number;
    rule_name: string;
    description: string;
    category: string;
    weightage: number;
    calculation_method: string;
    min_score: number;
    max_score: number;
    status: string;
}

interface ScoringEngineViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

const ScoringEngineView: React.FC<ScoringEngineViewProps> = ({ onNavigate }) => {
    const { hasPermission } = useAuth();
    const canAccess = hasPermission('canViewAdminConsole');

    const [rules, setRules] = useState<ScoringRule[]>([
        { id: 1, rule_name: 'Task Completion Score', description: 'Score based on task completion rate', category: 'Performance', weightage: 25, calculation_method: 'Percentage', min_score: 0, max_score: 100, status: 'Active' },
        { id: 2, rule_name: 'Quality Score', description: 'Score based on QC pass rate', category: 'Quality', weightage: 30, calculation_method: 'Weighted Average', min_score: 0, max_score: 100, status: 'Active' },
        { id: 3, rule_name: 'Timeliness Score', description: 'Score based on deadline adherence', category: 'Performance', weightage: 20, calculation_method: 'Percentage', min_score: 0, max_score: 100, status: 'Active' },
        { id: 4, rule_name: 'Collaboration Score', description: 'Score based on team collaboration metrics', category: 'Behavior', weightage: 15, calculation_method: 'Points', min_score: 0, max_score: 50, status: 'Active' },
        { id: 5, rule_name: 'Innovation Score', description: 'Score based on new ideas and improvements', category: 'Growth', weightage: 10, calculation_method: 'Points', min_score: 0, max_score: 30, status: 'Active' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ScoringRule | null>(null);
    const [formData, setFormData] = useState({ rule_name: '', description: '', category: 'Performance', weightage: 0, calculation_method: 'Percentage', min_score: 0, max_score: 100, status: 'Active' });

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
            setRules([...rules, { ...formData, id: Date.now() } as ScoringRule]);
        }
        setShowModal(false);
        setEditingItem(null);
        setFormData({ rule_name: '', description: '', category: 'Performance', weightage: 0, calculation_method: 'Percentage', min_score: 0, max_score: 100, status: 'Active' });
    };

    const handleEdit = (item: ScoringRule) => {
        setEditingItem(item);
        setFormData(item);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this scoring rule?')) {
            setRules(rules.filter(r => r.id !== id));
        }
    };

    const totalWeightage = rules.filter(r => r.status === 'Active').reduce((sum, r) => sum + r.weightage, 0);

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => onNavigate?.('admin-console-config')} className="p-2 hover:bg-slate-100 rounded-lg">
                            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl">🎯</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Scoring Engine</h1>
                            <p className="text-slate-500 text-sm">Set up scoring algorithms, weightages, and calculation rules</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Rule
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {/* Weightage Summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-800">Total Weightage Distribution</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${totalWeightage === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {totalWeightage}% / 100%
                        </span>
                    </div>
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden flex">
                        {rules.filter(r => r.status === 'Active').map((rule, idx) => (
                            <div key={rule.id} className={`h-full ${['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'][idx % 5]}`} style={{ width: `${rule.weightage}%` }} title={`${rule.rule_name}: ${rule.weightage}%`}></div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                        {rules.filter(r => r.status === 'Active').map((rule, idx) => (
                            <div key={rule.id} className="flex items-center gap-1.5 text-xs">
                                <div className={`w-3 h-3 rounded ${['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'][idx % 5]}`}></div>
                                <span className="text-slate-600">{rule.rule_name} ({rule.weightage}%)</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Rule</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Category</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Weightage</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Method</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Range</th>
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
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{rule.category}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-pink-500 rounded-full" style={{ width: `${rule.weightage}%` }}></div>
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{rule.weightage}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{rule.calculation_method}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{rule.min_score} - {rule.max_score}</td>
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
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{editingItem ? 'Edit Scoring Rule' : 'Add Scoring Rule'}</h3>
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="Performance">Performance</option>
                                        <option value="Quality">Quality</option>
                                        <option value="Behavior">Behavior</option>
                                        <option value="Growth">Growth</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Weightage (%)</label>
                                    <input type="number" min="0" max="100" value={formData.weightage} onChange={e => setFormData({ ...formData, weightage: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
                                    <select value={formData.calculation_method} onChange={e => setFormData({ ...formData, calculation_method: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="Percentage">Percentage</option>
                                        <option value="Points">Points</option>
                                        <option value="Weighted Average">Weighted Average</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Min Score</label>
                                    <input type="number" value={formData.min_score} onChange={e => setFormData({ ...formData, min_score: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Score</label>
                                    <input type="number" value={formData.max_score} onChange={e => setFormData({ ...formData, max_score: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-pink-600 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScoringEngineView;

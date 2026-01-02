import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface IntelRule {
    id: number;
    rule_name: string;
    description: string;
    tracking_type: string;
    frequency: string;
    data_sources: string;
    alert_threshold: string;
    status: string;
}

interface CompetitorIntelligenceViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

const CompetitorIntelligenceView: React.FC<CompetitorIntelligenceViewProps> = ({ onNavigate }) => {
    const { hasPermission } = useAuth();
    const canAccess = hasPermission('canViewAdminConsole');

    const [rules, setRules] = useState<IntelRule[]>([
        { id: 1, rule_name: 'Keyword Ranking Monitor', description: 'Track competitor keyword positions', tracking_type: 'SEO', frequency: 'Daily', data_sources: 'SEMrush, Ahrefs', alert_threshold: 'Position change > 5', status: 'Active' },
        { id: 2, rule_name: 'Content Publication Tracker', description: 'Monitor new content from competitors', tracking_type: 'Content', frequency: 'Daily', data_sources: 'RSS, Web Scraping', alert_threshold: 'New post detected', status: 'Active' },
        { id: 3, rule_name: 'Backlink Analysis', description: 'Track competitor backlink acquisition', tracking_type: 'SEO', frequency: 'Weekly', data_sources: 'Ahrefs, Moz', alert_threshold: 'New DA 50+ link', status: 'Active' },
        { id: 4, rule_name: 'Social Media Monitor', description: 'Track competitor social engagement', tracking_type: 'Social', frequency: 'Daily', data_sources: 'Social APIs', alert_threshold: 'Viral post (1K+ shares)', status: 'Active' },
        { id: 5, rule_name: 'Pricing Intelligence', description: 'Monitor competitor pricing changes', tracking_type: 'Business', frequency: 'Weekly', data_sources: 'Web Scraping', alert_threshold: 'Price change > 10%', status: 'Active' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<IntelRule | null>(null);
    const [formData, setFormData] = useState({ rule_name: '', description: '', tracking_type: 'SEO', frequency: 'Daily', data_sources: '', alert_threshold: '', status: 'Active' });

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
            setRules([...rules, { ...formData, id: Date.now() } as IntelRule]);
        }
        setShowModal(false);
        setEditingItem(null);
        setFormData({ rule_name: '', description: '', tracking_type: 'SEO', frequency: 'Daily', data_sources: '', alert_threshold: '', status: 'Active' });
    };

    const handleEdit = (item: IntelRule) => {
        setEditingItem(item);
        setFormData(item);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this intelligence rule?')) {
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
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl">🔎</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Competitor Intelligence Configuration</h1>
                            <p className="text-slate-500 text-sm">Set up competitor tracking, analysis frameworks, and intelligence rules</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2">
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
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Type</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Frequency</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Data Sources</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Alert Threshold</th>
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
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">{rule.tracking_type}</span></td>
                                    <td className="px-6 py-4 text-slate-600">{rule.frequency}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{rule.data_sources}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{rule.alert_threshold}</td>
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
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{editingItem ? 'Edit Intelligence Rule' : 'Add Intelligence Rule'}</h3>
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tracking Type</label>
                                    <select value={formData.tracking_type} onChange={e => setFormData({ ...formData, tracking_type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="SEO">SEO</option>
                                        <option value="Content">Content</option>
                                        <option value="Social">Social</option>
                                        <option value="Business">Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                                    <select value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="Hourly">Hourly</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data Sources</label>
                                <input type="text" value={formData.data_sources} onChange={e => setFormData({ ...formData, data_sources: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="SEMrush, Ahrefs, etc." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Alert Threshold</label>
                                <input type="text" value={formData.alert_threshold} onChange={e => setFormData({ ...formData, alert_threshold: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g., Position change > 5" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompetitorIntelligenceView;

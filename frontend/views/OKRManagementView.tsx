import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import type { OKRItem, KeyResult, User } from '../types';

const OKR_TYPES = ['Company', 'Department', 'Individual'];
const CYCLES = ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'];
const STATUSES = ['Draft', 'Active', 'Completed', 'On Hold', 'Archived'];
const KPI_CATEGORIES = ['Revenue', 'Growth', 'Efficiency', 'Quality', 'Customer Satisfaction', 'Team Development', 'Engagement', 'Retention'];
const UNITS = ['%', 'Count', 'Revenue', 'Hours', 'Score', 'Sessions', 'Users', 'Leads', 'Conversions', 'Impressions'];
const FREQUENCIES = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];
const DEPARTMENTS = ['Marketing', 'Sales', 'Engineering', 'Product', 'Operations', 'Finance', 'HR', 'Legal'];
const ALIGNMENT_OPTIONS = ['Company Growth', 'Market Expansion', 'Product Excellence', 'Customer Success', 'Team Development', 'Operational Efficiency'];

// Progress Bar Component
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    const getColor = (p: number) => {
        if (p >= 80) return 'bg-emerald-500';
        if (p >= 60) return 'bg-blue-500';
        if (p >= 40) return 'bg-amber-500';
        return 'bg-red-500';
    };
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${getColor(progress)} rounded-full transition-all`} style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-medium text-slate-700 w-8 text-right">{progress}%</span>
        </div>
    );
};

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'Draft': { bg: 'bg-slate-100', text: 'text-slate-700' },
        'Active': { bg: 'bg-blue-100', text: 'text-blue-700' },
        'Completed': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
        'On Hold': { bg: 'bg-amber-100', text: 'text-amber-700' },
        'Archived': { bg: 'bg-slate-200', text: 'text-slate-600' },
    };
    const c = config[status] || config['Draft'];
    return <span className={`px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>{status}</span>;
};

// Type Badge
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'Company': { bg: 'bg-purple-100', text: 'text-purple-700' },
        'Department': { bg: 'bg-blue-100', text: 'text-blue-700' },
        'Individual': { bg: 'bg-slate-100', text: 'text-slate-700' },
    };
    const c = config[type] || config['Department'];
    return <span className={`px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>{type}</span>;
};

const OKRManagementView: React.FC = () => {
    const { data: okrs, create: createOKR, update: updateOKR, remove: deleteOKR, refresh } = useData<OKRItem>('okrs');
    const { data: users } = useData<User>('users');

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCycle, setFilterCycle] = useState('All Cycles');
    const [filterStatus, setFilterStatus] = useState('All Status');
    const [filterType, setFilterType] = useState('All Types');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'objective' | 'target' | 'governance'>('objective');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [keyResults, setKeyResults] = useState<KeyResult[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        objective_title: '',
        objective_type: 'Department',
        department: '',
        owner_id: '',
        cycle: 'Q1',
        objective_description: '',
        why_this_matters: '',
        expected_outcome: '',
        target_date: '',
        alignment: '',
        parent_okr_id: '',
        reviewer_id: '',
        review_notes: '',
        evidence_links: [] as string[],
        status: 'Draft',
        progress: 0,
    });

    const filteredOKRs = okrs.filter(item => {
        const matchesSearch = item.objective_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.objective?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCycle = filterCycle === 'All Cycles' || item.cycle === filterCycle;
        const matchesStatus = filterStatus === 'All Status' || item.status === filterStatus;
        const matchesType = filterType === 'All Types' || item.objective_type === filterType || item.type === filterType;
        return matchesSearch && matchesCycle && matchesStatus && matchesType;
    });

    const handleCreate = async () => {
        if (!formData.objective_title) {
            alert('Please fill in the Objective Title');
            return;
        }
        setIsSubmitting(true);
        try {
            await createOKR({
                ...formData,
                key_results: keyResults,
            } as any);
            setShowCreateModal(false);
            resetForm();
            refresh();
        } catch (error) {
            console.error('Failed to create OKR:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this OKR?')) {
            try { await deleteOKR(id); refresh(); } catch (error) { console.error('Failed to delete:', error); }
        }
    };

    const resetForm = () => {
        setFormData({
            objective_title: '', objective_type: 'Department', department: '', owner_id: '', cycle: 'Q1',
            objective_description: '', why_this_matters: '', expected_outcome: '', target_date: '',
            alignment: '', parent_okr_id: '', reviewer_id: '', review_notes: '', evidence_links: [], status: 'Draft', progress: 0,
        });
        setKeyResults([]);
        setActiveTab('objective');
    };

    const addKeyResult = () => {
        setKeyResults([...keyResults, { kr_title: '', kpi_category: '', metric_name: '', baseline_value: '', target_value: '', unit: '', frequency: 'Monthly', status: 'Draft' }]);
    };

    const updateKeyResult = (index: number, field: string, value: any) => {
        const updated = [...keyResults];
        (updated[index] as any)[field] = value;
        setKeyResults(updated);
    };

    const removeKeyResult = (index: number) => {
        setKeyResults(keyResults.filter((_, i) => i !== index));
    };

    // Create Modal with Tabs
    const renderCreateModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Create New OKR</h2>
                        <p className="text-sm text-slate-500 mt-1">Define objectives, key results, and track performance</p>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-white rounded-lg transition-colors">
                        <svg className="w-6 h-6 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-6 bg-slate-50 overflow-x-auto">
                    {[
                        { id: 'objective', label: 'Objective Details', icon: '📋' },
                        { id: 'target', label: 'Target & Impact', icon: '🎯' },
                        { id: 'governance', label: 'Governance', icon: '✓' }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'objective' && renderObjectiveTab()}
                    {activeTab === 'target' && renderTargetTab()}
                    {activeTab === 'governance' && renderGovernanceTab()}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-slate-200 bg-slate-50">
                    <span className="text-xs font-medium text-slate-500">* Required fields</span>
                    <div className="flex gap-3">
                        <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleCreate} disabled={isSubmitting || !formData.objective_title}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? 'Saving...' : 'Save OKR'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderObjectiveTab = () => (
        <div className="space-y-6 max-w-4xl">
            {/* Row 1: Title and Type */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Objective Title <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.objective_title} onChange={(e) => setFormData({ ...formData, objective_title: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Increase organic traffic by 40%" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Type <span className="text-red-500">*</span></label>
                    <select value={formData.objective_type} onChange={(e) => setFormData({ ...formData, objective_type: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                        {OKR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Row 2: Department, Cycle, Owner */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Department <span className="text-red-500">*</span></label>
                    <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">Select department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Cycle <span className="text-red-500">*</span></label>
                    <select value={formData.cycle} onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                        {CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Owner <span className="text-red-500">*</span></label>
                    <select value={formData.owner_id} onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">Select owner</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Row 3: Descriptions */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Why This Matters <span className="text-red-500">*</span></label>
                    <textarea value={formData.why_this_matters} onChange={(e) => setFormData({ ...formData, why_this_matters: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        placeholder="Explain the strategic importance and rationale..." />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Objective Description</label>
                    <textarea value={formData.objective_description} onChange={(e) => setFormData({ ...formData, objective_description: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        placeholder="Describe the objective in detail..." />
                </div>
            </div>

            {/* Row 4: Alignment */}
            <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Strategic Alignment</label>
                <select value={formData.alignment} onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select alignment</option>
                    {ALIGNMENT_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>
        </div>
    );

    const renderTargetTab = () => (
        <div className="space-y-6 max-w-4xl">
            {/* Expected Outcome and Target Date */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Expected Outcome <span className="text-red-500">*</span></label>
                    <textarea value={formData.expected_outcome} onChange={(e) => setFormData({ ...formData, expected_outcome: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        placeholder="Describe the expected results and impact..." />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Target Date <span className="text-red-500">*</span></label>
                    <input type="date" value={formData.target_date} onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            {/* Key Results Section */}
            <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Key Results</h3>
                        <p className="text-xs text-slate-500 mt-1">Define measurable outcomes for this objective</p>
                    </div>
                    <button onClick={addKeyResult} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Key Result
                    </button>
                </div>

                <div className="space-y-4">
                    {keyResults.map((kr, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-slate-900">Key Result #{idx + 1}</h4>
                                <button onClick={() => removeKeyResult(idx)} className="text-red-600 hover:text-red-700 text-sm font-medium">Remove</button>
                            </div>

                            {/* KR Title */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">KR Title</label>
                                <input type="text" value={kr.kr_title} onChange={(e) => updateKeyResult(idx, 'kr_title', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g., Increase organic sessions to 50,000/month" />
                            </div>

                            {/* KR Details Grid */}
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">KPI Category</label>
                                    <select value={kr.kpi_category || ''} onChange={(e) => updateKeyResult(idx, 'kpi_category', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                                        <option value="">Select</option>
                                        {KPI_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Metric Name</label>
                                    <input type="text" value={kr.metric_name || ''} onChange={(e) => updateKeyResult(idx, 'metric_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g., Organic Sessions" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unit</label>
                                    <select value={kr.unit || ''} onChange={(e) => updateKeyResult(idx, 'unit', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                                        <option value="">Select</option>
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Frequency</label>
                                    <select value={kr.frequency || 'Monthly'} onChange={(e) => updateKeyResult(idx, 'frequency', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                                        {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Baseline and Target */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Baseline Value</label>
                                    <input type="text" value={kr.baseline_value || ''} onChange={(e) => updateKeyResult(idx, 'baseline_value', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Current value" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Value</label>
                                    <input type="text" value={kr.target_value || ''} onChange={(e) => updateKeyResult(idx, 'target_value', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Goal value" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">KR Owner</label>
                                    <select value={kr.kr_owner_id || ''} onChange={(e) => updateKeyResult(idx, 'kr_owner_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                                        <option value="">Select</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}

                    {keyResults.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                            <p className="text-slate-500 text-sm">No key results added yet. Click "Add Key Result" to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderGovernanceTab = () => (
        <div className="space-y-6 max-w-4xl">
            {/* Reviewer and Status */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Reviewer <span className="text-red-500">*</span></label>
                    <select value={formData.reviewer_id} onChange={(e) => setFormData({ ...formData, reviewer_id: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">Select reviewer</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Status <span className="text-red-500">*</span></label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Review Notes */}
            <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Review Notes</label>
                <textarea value={formData.review_notes} onChange={(e) => setFormData({ ...formData, review_notes: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    placeholder="Add any notes for the reviewer..." />
            </div>

            {/* Progress */}
            <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Progress (%)</label>
                <div className="flex items-center gap-4">
                    <input type="range" min="0" max="100" value={formData.progress || 0}
                        onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                    <span className="text-sm font-semibold text-slate-700 w-12 text-right">{formData.progress || 0}%</span>
                </div>
            </div>

            {/* Evidence Links */}
            <div className="border-t pt-6">
                <h3 className="font-bold text-slate-900 text-lg mb-4">Evidence & Documentation</h3>

                <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-3">Upload Evidence</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                            <svg className="w-10 h-10 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm font-medium text-slate-600">Drop files here or click to upload</p>
                            <p className="text-xs text-slate-500 mt-1">Screenshots, PDFs, reports (Max 10MB each)</p>
                        </div>
                    </div>

                    {/* Evidence Links Input */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Evidence Links</label>
                        <input type="text" placeholder="Paste URL to analysis tool report or documentation"
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        <p className="text-xs text-slate-500 mt-2">e.g., Google Analytics, SEMrush, Ahrefs reports</p>
                    </div>
                </div>
            </div>

            {/* Parent OKR (Optional) */}
            <div className="border-t pt-6">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Parent OKR (Optional)</label>
                <input type="text" value={formData.alignment} onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Link to parent objective for hierarchy" />
            </div>
        </div>
    );

    // Main List View
    const renderListView = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <tr>
                            <th className="w-8 px-4 py-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" /></th>
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Objective</th>
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Type</th>
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Cycle</th>
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Owner</th>
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Progress</th>
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">KRs</th>
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Updated</th>
                            <th className="text-center px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredOKRs.map(item => (
                            <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                                <td className="px-4 py-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" /></td>
                                <td className="px-4 py-4">
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">{item.objective_title || item.objective}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.objective_description}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-4"><TypeBadge type={item.objective_type || item.type || 'Department'} /></td>
                                <td className="px-4 py-4"><span className="text-sm font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">{item.cycle}</span></td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                            {item.owner_name?.charAt(0) || '?'}
                                        </div>
                                        <span className="text-sm text-slate-700">{item.owner_name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4"><ProgressBar progress={item.progress || 0} /></td>
                                <td className="px-4 py-4"><StatusBadge status={item.status || 'Draft'} /></td>
                                <td className="px-4 py-4">
                                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{item.key_results?.length || 0} KRs</span>
                                </td>
                                <td className="px-4 py-4"><span className="text-xs text-slate-500">{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : item.updated_on || '-'}</span></td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredOKRs.length === 0 && (
                            <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                                <div className="flex flex-col items-center gap-2">
                                    <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="font-medium">No OKRs found</p>
                                    <p className="text-xs">Create your first OKR to get started</p>
                                </div>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col w-full p-6 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
            {showCreateModal && renderCreateModal()}

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">OKR Management</h1>
                    <p className="text-sm text-slate-600 mt-1">Define, track, and manage organizational objectives and key results</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-white rounded-lg transition-colors border border-slate-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="text-sm font-medium">Import</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-white rounded-lg transition-colors border border-slate-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-sm font-medium">Export</span>
                    </button>
                    <button onClick={refresh} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-white rounded-lg transition-colors border border-slate-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="text-sm font-medium">Refresh</span>
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-sm font-semibold">Create OKR</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-xs">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Search OKRs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm" />
                </div>
                <select value={filterCycle} onChange={(e) => setFilterCycle(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium">
                    <option value="All Cycles">All Cycles</option>
                    {CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium">
                    <option value="All Types">All Types</option>
                    {OKR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium">
                    <option value="All Status">All Status</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                {renderListView()}
            </div>
        </div>
    );
};

export default OKRManagementView;

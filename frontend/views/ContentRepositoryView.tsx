import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { ContentRepositoryItem, User, Service, SubServiceItem } from '../types';

// Pipeline stages matching the design
const PIPELINE_STAGES = [
    { key: 'All', label: 'All' },
    { key: 'idea', label: 'Idea' },
    { key: 'outline', label: 'Outline' },
    { key: 'draft', label: 'Draft' },
    { key: 'final_draft', label: 'Final Draft' },
    { key: 'qc_pending', label: 'QC Pending' },
    { key: 'qc_passed', label: 'QC Passed' },
    { key: 'ready_for_graphics', label: 'Ready for Graphics' },
    { key: 'ready_to_publish', label: 'Ready to Publish' },
    { key: 'published', label: 'Published' },
];

const CONTENT_TYPES = ['Article', 'Blog', 'Service Page', 'SMM Caption', 'Whitepaper', 'Case Study'];
const INDUSTRIES = ['Healthcare', 'Technology', 'Finance', 'Education', 'E-commerce', 'Manufacturing', 'Retail'];

// Avatar component
const Avatar: React.FC<{ name: string; color?: string }> = ({ name, color }) => {
    const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500'];
    const bgColor = color || colors[(name?.length || 0) % colors.length];
    return (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${bgColor}`}>
            {initials}
        </div>
    );
};

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        'idea': { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Idea' },
        'outline': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Outline' },
        'draft': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Draft' },
        'final_draft': { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Final Draft' },
        'qc_pending': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'QC Pending' },
        'qc_passed': { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'QC Passed' },
        'ready_for_graphics': { bg: 'bg-pink-50', text: 'text-pink-700', label: 'Ready for Graphics' },
        'ready_to_publish': { bg: 'bg-cyan-50', text: 'text-cyan-700', label: 'Ready to Publish' },
        'published': { bg: 'bg-green-50', text: 'text-green-700', label: 'Published' },
    };
    const c = config[status?.toLowerCase()] || { bg: 'bg-slate-100', text: 'text-slate-600', label: status };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
};


// Content Type Badge
const ContentTypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const colors: Record<string, string> = {
        'Article': 'bg-blue-100 text-blue-700',
        'Blog': 'bg-indigo-100 text-indigo-700',
        'Service Page': 'bg-emerald-100 text-emerald-700',
        'SMM Caption': 'bg-pink-100 text-pink-700',
        'Whitepaper': 'bg-violet-100 text-violet-700',
        'Case Study': 'bg-amber-100 text-amber-700',
    };
    const colorClass = colors[type] || 'bg-slate-100 text-slate-600';
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>{type || '-'}</span>;
};

// QC Score Badge
const QcScoreBadge: React.FC<{ score?: number }> = ({ score }) => {
    if (!score && score !== 0) return <span className="text-xs text-slate-400">—</span>;
    const getColor = () => {
        if (score >= 90) return 'bg-emerald-100 text-emerald-700';
        if (score >= 70) return 'bg-amber-100 text-amber-700';
        return 'bg-red-100 text-red-700';
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-bold ${getColor()}`}>{score}/100</span>;
};

// Keyword Tag
const KeywordTag: React.FC<{ keyword: string; count?: number }> = ({ keyword, count }) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
        {keyword}
        {count && <span className="text-indigo-400">+{count}</span>}
    </span>
);

const ContentRepositoryView: React.FC = () => {
    const { data: content, create: createContent, update: updateContent, remove: deleteContent, refresh } = useData<ContentRepositoryItem>('content');
    const { data: users } = useData<User>('users');
    const { data: services } = useData<Service>('services');
    const { data: subServices } = useData<SubServiceItem>('subServices');

    const [searchQuery, setSearchQuery] = useState('');
    const [activeStage, setActiveStage] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Form state
    const [formData, setFormData] = useState({
        content_type: '',
        content_title_clean: '',
        linked_service_id: '',
        linked_sub_service_id: '',
        industry: '',
        keywords: '',
        assigned_to_id: '',
        status: 'idea',
        auto_outline: false,
    });

    const getStageCount = (stage: string) => {
        if (stage === 'All') return content.length;
        return content.filter(c => c.status === stage).length;
    };

    const filteredContent = content.filter(item => {
        const matchesSearch = item.content_title_clean?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStage = activeStage === 'All' || item.status === activeStage;
        return matchesSearch && matchesStage;
    });

    const handleCreate = async () => {
        if (!formData.content_title_clean || !formData.content_type) {
            alert('Please fill in required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
            await createContent({
                content_title_clean: formData.content_title_clean,
                content_type: formData.content_type,
                linked_service_id: formData.linked_service_id ? parseInt(formData.linked_service_id) : null,
                linked_sub_service_id: formData.linked_sub_service_id ? parseInt(formData.linked_sub_service_id) : null,
                industry: formData.industry || null,
                keywords: keywordsArray,
                assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id) : null,
                status: formData.status,
                asset_type: formData.content_type.toLowerCase().replace(' ', '_'),
            } as any);
            setShowCreateModal(false);
            resetForm();
            refresh();
        } catch (error) {
            console.error('Failed to create content:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            content_type: '', content_title_clean: '', linked_service_id: '', linked_sub_service_id: '',
            industry: '', keywords: '', assigned_to_id: '', status: 'idea', auto_outline: false,
        });
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };


    // Create Content Modal
    const renderCreateModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Add Content Item</h2>
                        <p className="text-sm text-slate-500">Create a new content piece in the repository</p>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Content Type *</label>
                        <select
                            value={formData.content_type}
                            onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">Select content type</option>
                            {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Title *</label>
                        <input
                            type="text"
                            value={formData.content_title_clean}
                            onChange={(e) => setFormData({ ...formData, content_title_clean: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter content title..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Service *</label>
                        <select
                            value={formData.linked_service_id}
                            onChange={(e) => setFormData({ ...formData, linked_service_id: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">Select service</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Sub-Service *</label>
                        <select
                            value={formData.linked_sub_service_id}
                            onChange={(e) => setFormData({ ...formData, linked_sub_service_id: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            disabled={!formData.linked_service_id}
                        >
                            <option value="">Select sub-service</option>
                            {subServices
                                .filter(ss => !formData.linked_service_id || Number(ss.parent_service_id) === Number(formData.linked_service_id))
                                .map(s => <option key={s.id} value={s.id}>{s.sub_service_name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Industry *</label>
                        <select
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">Select industry</option>
                            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Keywords</label>
                        <input
                            type="text"
                            value={formData.keywords}
                            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter keywords (comma separated)..."
                        />
                        <p className="text-xs text-slate-400 mt-1">Separate multiple keywords with commas</p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Writer Assigned</label>
                        <select
                            value={formData.assigned_to_id}
                            onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">Select writer</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Initial Stage *</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            {PIPELINE_STAGES.filter(s => s.key !== 'All').map(s => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-4 flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={formData.auto_outline}
                            onChange={(e) => setFormData({ ...formData, auto_outline: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 mt-0.5"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="font-medium text-indigo-900">Auto-create outline using AI</span>
                            </div>
                            <p className="text-xs text-indigo-700 mt-1">AI will generate a structured outline based on the content type and keywords</p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500">* Required fields</p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={() => { setShowCreateModal(false); resetForm(); }}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isSubmitting || !formData.content_title_clean || !formData.content_type}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Content Item'}
                    </button>
                </div>
            </div>
        </div>
    );


    return (
        <div className="h-full flex flex-col w-full p-6 overflow-hidden bg-slate-50">
            {showCreateModal && renderCreateModal()}

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Content Repository</h1>
                            <p className="text-sm text-slate-500">Store, track, and manage all content pieces before campaign execution</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Content Item
                    </button>
                </div>
            </div>

            {/* Search and Stage Tabs */}
            <div className="mb-4 space-y-3">
                <div className="relative max-w-md">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        placeholder="Search by title, content type, keyword, service, draft status..."
                    />
                </div>

                {/* Stage Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {PIPELINE_STAGES.map(stage => (
                        <button
                            key={stage.key}
                            onClick={() => setActiveStage(stage.key)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeStage === stage.key
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {stage.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeStage === stage.key ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-600'
                                }`}>
                                {getStageCount(stage.key)}
                            </span>
                        </button>
                    ))}
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>


            {/* Table */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto h-full">
                    <table className="w-full min-w-[1200px]">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Content Type</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Stage</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Service/Sub-Service</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Keywords</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Word Count</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">QC Score</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned To</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Updated At</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredContent.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <p className="text-sm font-medium">No content items found</p>
                                            <p className="text-xs text-slate-400 mt-1">Create a new content item to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredContent.map((item) => {
                                    const assignee = users.find(u => u.id === item.assigned_to_id);
                                    const service = services.find(s => s.id === item.linked_service_id);
                                    const subService = subServices.find(s => s.id === item.linked_sub_service_id);
                                    const keywords = item.keywords || item.focus_keywords || [];

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900 text-sm">{item.content_title_clean}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <ContentTypeBadge type={item.content_type || item.asset_type || ''} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    <div className="text-slate-700">{item.service_name || service?.service_name || '-'}</div>
                                                    {(item.sub_service_name || subService?.sub_service_name) && (
                                                        <div className="text-xs text-slate-500">{item.sub_service_name || subService?.sub_service_name}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {keywords.length > 0 ? (
                                                    <div className="flex items-center gap-1 flex-wrap">
                                                        <KeywordTag keyword={keywords[0]} />
                                                        {keywords.length > 1 && (
                                                            <span className="text-xs text-indigo-600">+{keywords.length - 1}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {item.word_count ? item.word_count.toLocaleString() : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <QcScoreBadge score={item.qc_score || item.ai_qc_report?.score} />
                                            </td>
                                            <td className="px-4 py-3">
                                                {assignee || item.assigned_to_name ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar name={item.assigned_to_name || assignee?.name || ''} />
                                                        <span className="text-sm text-slate-700">{item.assigned_to_name || assignee?.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-500">
                                                {formatDate(item.updated_at || item.last_status_update_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI-Powered Tools Section */}
            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="font-semibold text-slate-900">AI-Powered Tools</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { name: 'Generate Topic Clusters', desc: 'Service Content Ideas' },
                        { name: 'SEO Outline', desc: 'Auto H2/H3 Tags' },
                        { name: 'Internal Linking', desc: 'Content Gaps' },
                        { name: 'Compare Competitors', desc: 'Optimize Existing' },
                    ].map((tool, idx) => (
                        <button key={idx} className="text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                            <div className="text-sm font-medium text-slate-900">{tool.name}</div>
                            <div className="text-xs text-slate-500">{tool.desc}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContentRepositoryView;
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import type { ServicePageItem, User, Service, SubServiceItem } from '../types';

// Pipeline stages matching the design
const PIPELINE_STAGES = [
    { key: 'All', label: 'All' },
    { key: 'Draft', label: 'Draft' },
    { key: 'In Progress', label: 'In Progress' },
    { key: 'Published', label: 'Published' },
    { key: 'Audit Pending', label: 'Audit Pending' },
    { key: 'Needs Fix', label: 'Needs Fix' },
    { key: 'QC Pending', label: 'QC Pending' },
    { key: 'QC Passed', label: 'QC Passed' },
    { key: 'Promoted', label: 'Promoted' },
];

const PAGE_TYPES = ['Service Page', 'Sub-Service Page'];
const INDUSTRIES = ['Healthcare', 'Technology', 'Finance', 'Education', 'E-commerce', 'Manufacturing', 'Retail', 'Nutraceuticals'];

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'Draft': { bg: 'bg-slate-100', text: 'text-slate-600' },
        'In Progress': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
        'Published': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        'Audit Pending': { bg: 'bg-amber-50', text: 'text-amber-700' },
        'Needs Fix': { bg: 'bg-red-50', text: 'text-red-700' },
        'QC Pending': { bg: 'bg-purple-50', text: 'text-purple-700' },
        'QC Passed': { bg: 'bg-cyan-50', text: 'text-cyan-700' },
        'Promoted': { bg: 'bg-green-50', text: 'text-green-700' },
    };
    const c = config[status] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{status}</span>;
};

// Score Badge
const ScoreBadge: React.FC<{ score?: number; label?: string }> = ({ score, label }) => {
    if (!score && score !== 0) return <span className="text-xs text-slate-400">—</span>;
    const getColor = () => {
        if (score >= 90) return 'text-emerald-600 font-bold';
        if (score >= 70) return 'text-amber-600 font-bold';
        return 'text-red-600 font-bold';
    };
    return <span className={`text-sm ${getColor()}`}>{score}</span>;
};

// Avatar component
const Avatar: React.FC<{ name: string }> = ({ name }) => {
    const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    const bgColor = colors[(name?.length || 0) % colors.length];
    return (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${bgColor}`}>
            {initials}
        </div>
    );
};


const ServicePagesView: React.FC = () => {
    const { data: servicePages, create: createServicePage, refresh } = useData<ServicePageItem>('servicePages');
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
        page_title: '',
        page_type: 'Service Page',
        url_slug: '',
        service_id: '',
        sub_service_id: '',
        industry: '',
        target_keyword: '',
        writer_id: '',
        seo_id: '',
        developer_id: '',
        status: 'Draft',
    });

    const getStageCount = (stage: string) => {
        if (stage === 'All') return servicePages.length;
        return servicePages.filter(p => p.status === stage).length;
    };

    const filteredPages = servicePages.filter(item => {
        const matchesSearch = item.page_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.primary_keyword?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStage = activeStage === 'All' || item.status === activeStage;
        return matchesSearch && matchesStage;
    });

    const handleCreate = async () => {
        if (!formData.page_title || !formData.page_type) {
            alert('Please fill in required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            await createServicePage({
                page_title: formData.page_title,
                page_type: formData.page_type,
                url_slug: formData.url_slug,
                url: `/services/${formData.url_slug}`,
                service_id: formData.service_id ? parseInt(formData.service_id) : null,
                sub_service_id: formData.sub_service_id ? parseInt(formData.sub_service_id) : null,
                industry: formData.industry || null,
                target_keyword: formData.target_keyword || null,
                primary_keyword: formData.target_keyword || null,
                writer_id: formData.writer_id ? parseInt(formData.writer_id) : null,
                seo_id: formData.seo_id ? parseInt(formData.seo_id) : null,
                developer_id: formData.developer_id ? parseInt(formData.developer_id) : null,
                status: formData.status,
                seo_score: 0,
                audit_score: 0,
            } as any);
            setShowCreateModal(false);
            resetForm();
            refresh();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to create service page:', error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            page_title: '', page_type: 'Service Page', url_slug: '', service_id: '',
            sub_service_id: '', industry: '', target_keyword: '', writer_id: '',
            seo_id: '', developer_id: '', status: 'Draft',
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


    // Create Service Page Modal
    const renderCreateModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Add Service Page</h2>
                        <p className="text-sm text-slate-500">Create a new Service or Sub-Service page entry</p>
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
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Page Title *</label>
                        <input
                            type="text"
                            value={formData.page_title}
                            onChange={(e) => setFormData({ ...formData, page_title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter page title..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Page Type *</label>
                        <select
                            value={formData.page_type}
                            onChange={(e) => setFormData({ ...formData, page_type: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            {PAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">URL Slug *</label>
                        <div className="flex items-center">
                            <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-sm text-slate-500">/services/</span>
                            <input
                                type="text"
                                value={formData.url_slug}
                                onChange={(e) => setFormData({ ...formData, url_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="url-slug"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Service *</label>
                        <select
                            value={formData.service_id}
                            onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">Select service</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Sub-Service *</label>
                        <select
                            value={formData.sub_service_id}
                            onChange={(e) => setFormData({ ...formData, sub_service_id: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            disabled={!formData.service_id}
                        >
                            <option value="">Select sub-service</option>
                            {subServices
                                .filter(ss => !formData.service_id || Number(ss.parent_service_id) === Number(formData.service_id))
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
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Target Keyword</label>
                        <input
                            type="text"
                            value={formData.target_keyword}
                            onChange={(e) => setFormData({ ...formData, target_keyword: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Primary target keyword..."
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Writer</label>
                            <select
                                value={formData.writer_id}
                                onChange={(e) => setFormData({ ...formData, writer_id: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                            >
                                <option value="">Select writer</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">SEO</label>
                            <select
                                value={formData.seo_id}
                                onChange={(e) => setFormData({ ...formData, seo_id: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                            >
                                <option value="">Select SEO</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Developer</label>
                            <select
                                value={formData.developer_id}
                                onChange={(e) => setFormData({ ...formData, developer_id: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                            >
                                <option value="">Select developer</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
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
                        disabled={isSubmitting || !formData.page_title || !formData.page_type}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Service Page Entry'}
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Service Page Repository</h1>
                            <p className="text-sm text-slate-500">Store, monitor, audit, and promote all Service and Sub-Service pages</p>
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
                        Add Service Page
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
                        placeholder="Search by Title, URL, Service, Sub-Service, keyword..."
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
                    <table className="w-full min-w-[1300px]">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Page Title</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">URL</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Service → Sub-Service</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">SEO Score</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Audit Score</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Primary Keyword</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Audit</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPages.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                            <p className="text-sm font-medium">No service pages found</p>
                                            <p className="text-xs text-slate-400 mt-1">Create a new service page to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPages.map((item) => {
                                    const service = services.find(s => s.id === item.service_id);
                                    const subService = subServices.find(s => s.id === item.sub_service_id);

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium text-slate-900 text-sm">{item.page_title}</div>
                                                    <div className="text-xs text-slate-500">{item.page_type}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                    {item.url}
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    <div className="font-medium text-slate-700">{item.service_name || service?.service_name || '-'}</div>
                                                    {(item.sub_service_name || subService?.sub_service_name) && (
                                                        <div className="text-xs text-slate-500">→ {item.sub_service_name || subService?.sub_service_name}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <ScoreBadge score={item.seo_score} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <ScoreBadge score={item.audit_score} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">{item.primary_keyword || item.target_keyword || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-500">
                                                {formatDate(item.last_audit || item.updated_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={item.status} />
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
        </div>
    );
};

export default ServicePagesView;
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import type { BacklinkSubmission, User, Service, SubServiceItem } from '../types';

const PIPELINE_STAGES = [
    { key: 'All', label: 'All' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Submitted', label: 'Submitted' },
    { key: 'Verified', label: 'Verified' },
    { key: 'Rejected', label: 'Rejected' },
    { key: 'Expired', label: 'Expired' },
];

const OPPORTUNITY_TYPES = [
    'Guest Post', 'Directory', 'Forum', 'Comment', 'Profile',
    'Social Bookmark', 'Press Release', 'Infographic', 'Resource Page', 'Broken Link'
];

const CATEGORIES = [
    'Technology', 'Business', 'Marketing', 'Health', 'Finance',
    'Education', 'Lifestyle', 'Travel', 'Food', 'Entertainment'
];

const COUNTRIES = ['US', 'UK', 'CA', 'AU', 'IN', 'DE', 'FR', 'ES', 'IT', 'NL', 'Global'];

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'Pending': { bg: 'bg-amber-50', text: 'text-amber-700' },
        'Submitted': { bg: 'bg-blue-50', text: 'text-blue-700' },
        'Verified': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        'Rejected': { bg: 'bg-red-50', text: 'text-red-700' },
        'Expired': { bg: 'bg-slate-100', text: 'text-slate-600' },
    };
    const c = config[status] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{status}</span>;
};

// Opportunity Type Badge
const OpportunityBadge: React.FC<{ type: string }> = ({ type }) => {
    const colors: Record<string, string> = {
        'Guest Post': 'bg-indigo-100 text-indigo-700',
        'Directory': 'bg-cyan-100 text-cyan-700',
        'Forum': 'bg-purple-100 text-purple-700',
        'Comment': 'bg-slate-100 text-slate-700',
        'Profile': 'bg-pink-100 text-pink-700',
        'Social Bookmark': 'bg-orange-100 text-orange-700',
        'Press Release': 'bg-emerald-100 text-emerald-700',
        'Infographic': 'bg-rose-100 text-rose-700',
        'Resource Page': 'bg-teal-100 text-teal-700',
        'Broken Link': 'bg-amber-100 text-amber-700',
    };
    const colorClass = colors[type] || 'bg-slate-100 text-slate-600';
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>{type}</span>;
};

// DA Score Badge
const DABadge: React.FC<{ score?: number }> = ({ score }) => {
    if (!score) return <span className="text-slate-400 text-xs">-</span>;
    const color = score >= 50 ? 'text-emerald-600' : score >= 30 ? 'text-amber-600' : 'text-red-600';
    return <span className={`font-semibold ${color}`}>{score}</span>;
};

// Spam Score Badge
const SpamBadge: React.FC<{ score?: number }> = ({ score }) => {
    if (score === undefined || score === null) return <span className="text-slate-400 text-xs">-</span>;
    const color = score <= 5 ? 'text-emerald-600' : score <= 15 ? 'text-amber-600' : 'text-red-600';
    return <span className={`font-semibold ${color}`}>{score}%</span>;
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

const BacklinksView: React.FC = () => {
    const { data: submissions, create: createSubmission, update: updateSubmission, remove: deleteSubmission, refresh } = useData<BacklinkSubmission>('submissions');
    const { data: users } = useData<User>('users');
    const { data: services } = useData<Service>('services');
    const { data: subServices } = useData<SubServiceItem>('subServices');

    const [searchQuery, setSearchQuery] = useState('');
    const [activeStage, setActiveStage] = useState('All');
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        opportunityTypes: [] as string[],
        daMin: '',
        daMax: '',
        service: '',
        country: '',
        seoOwner: '',
    });

    // Form state
    const [formData, setFormData] = useState({
        domain: '',
        opportunity_type: '',
        category: '',
        target_url: '',
        anchor_text: '',
        da_score: '',
        spam_score: '',
        country: '',
        service_id: '',
        sub_service_id: '',
        seo_owner_id: '',
        is_paid: false,
    });

    const getStageCount = (stage: string) => {
        if (stage === 'All') return submissions.length;
        return submissions.filter(s => s.submission_status === stage).length;
    };


    const filteredSubmissions = submissions.filter(item => {
        // Search filter
        const matchesSearch =
            item.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.target_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.anchor_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.anchor_text_used?.toLowerCase().includes(searchQuery.toLowerCase());

        // Stage filter
        const matchesStage = activeStage === 'All' || item.submission_status === activeStage;

        // Advanced filters
        const matchesOpportunityType = filters.opportunityTypes.length === 0 ||
            filters.opportunityTypes.includes(item.opportunity_type || '');
        const matchesDAMin = !filters.daMin || (item.da_score && item.da_score >= parseInt(filters.daMin));
        const matchesDAMax = !filters.daMax || (item.da_score && item.da_score <= parseInt(filters.daMax));
        const matchesService = !filters.service || item.service_id?.toString() === filters.service;
        const matchesCountry = !filters.country || item.country === filters.country;
        const matchesSeoOwner = !filters.seoOwner || item.seo_owner_id?.toString() === filters.seoOwner;

        return matchesSearch && matchesStage && matchesOpportunityType &&
            matchesDAMin && matchesDAMax && matchesService && matchesCountry && matchesSeoOwner;
    });

    const handleCreate = async () => {
        if (!formData.domain || !formData.target_url) {
            alert('Please fill in required fields (Domain and Target URL)');
            return;
        }
        setIsSubmitting(true);
        try {
            await createSubmission({
                domain: formData.domain,
                opportunity_type: formData.opportunity_type || 'Guest Post',
                category: formData.category || null,
                target_url: formData.target_url,
                anchor_text: formData.anchor_text,
                da_score: formData.da_score ? parseInt(formData.da_score) : null,
                spam_score: formData.spam_score ? parseInt(formData.spam_score) : null,
                country: formData.country || null,
                service_id: formData.service_id ? parseInt(formData.service_id) : null,
                sub_service_id: formData.sub_service_id ? parseInt(formData.sub_service_id) : null,
                seo_owner_id: formData.seo_owner_id ? parseInt(formData.seo_owner_id) : null,
                is_paid: formData.is_paid,
                submission_status: 'Pending',
            } as any);
            setShowCreateModal(false);
            resetForm();
            refresh();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to create backlink:', error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            domain: '', opportunity_type: '', category: '', target_url: '',
            anchor_text: '', da_score: '', spam_score: '', country: '',
            service_id: '', sub_service_id: '', seo_owner_id: '', is_paid: false,
        });
    };

    const resetFilters = () => {
        setFilters({
            opportunityTypes: [], daMin: '', daMax: '', service: '', country: '', seoOwner: '',
        });
    };

    const toggleOpportunityFilter = (type: string) => {
        setFilters(prev => ({
            ...prev,
            opportunityTypes: prev.opportunityTypes.includes(type)
                ? prev.opportunityTypes.filter(t => t !== type)
                : [...prev.opportunityTypes, type]
        }));
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Create Modal
    const renderCreateModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Add Backlink Opportunity</h2>
                        <p className="text-sm text-slate-500">Record a new backlink submission opportunity</p>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Domain *</label>
                            <input
                                type="text"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Opportunity Type</label>
                            <select
                                value={formData.opportunity_type}
                                onChange={(e) => setFormData({ ...formData, opportunity_type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">Select type</option>
                                {OPPORTUNITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Category / Niche</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Target URL *</label>
                            <input
                                type="text"
                                value={formData.target_url}
                                onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="/services/your-page"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Anchor Text</label>
                        <input
                            type="text"
                            value={formData.anchor_text}
                            onChange={(e) => setFormData({ ...formData, anchor_text: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Your anchor text"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Domain Authority (DA)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.da_score}
                                onChange={(e) => setFormData({ ...formData, da_score: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="0-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Spam Score</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.spam_score}
                                onChange={(e) => setFormData({ ...formData, spam_score: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="0-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Country</label>
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">Select country</option>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                        <h3 className="font-semibold text-slate-900 mb-3">Service Mapping</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Service</label>
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
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Sub-Service</label>
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
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">SEO Owner</label>
                            <select
                                value={formData.seo_owner_id}
                                onChange={(e) => setFormData({ ...formData, seo_owner_id: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">Select owner</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_paid}
                                    onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-slate-700">Paid Opportunity</span>
                            </label>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500">* Required fields</p>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={() => { setShowCreateModal(false); resetForm(); }}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isSubmitting || !formData.domain || !formData.target_url}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Add Opportunity'}
                    </button>
                </div>
            </div>
        </div>
    );


    // Advanced Filters Panel
    const renderFiltersPanel = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Advanced Filters</h3>
                <button onClick={resetFilters} className="text-xs text-indigo-600 hover:text-indigo-800">
                    Reset All
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Backlink Source Type</label>
                    <div className="flex flex-wrap gap-2">
                        {OPPORTUNITY_TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => toggleOpportunityFilter(type)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filters.opportunityTypes.includes(type)
                                    ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">DA Range</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={filters.daMin}
                                onChange={(e) => setFilters({ ...filters, daMin: e.target.value })}
                                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm"
                                placeholder="Min"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={filters.daMax}
                                onChange={(e) => setFilters({ ...filters, daMax: e.target.value })}
                                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm"
                                placeholder="Max"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Service</label>
                        <select
                            value={filters.service}
                            onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                        >
                            <option value="">All Services</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Country</label>
                        <select
                            value={filters.country}
                            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                        >
                            <option value="">All Countries</option>
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">SEO Owner</label>
                        <select
                            value={filters.seoOwner}
                            onChange={(e) => setFilters({ ...filters, seoOwner: e.target.value })}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                        >
                            <option value="">All Owners</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    // Card View
    const renderCardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSubmissions.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 text-sm truncate max-w-[150px]">{item.domain || 'Unknown Domain'}</h3>
                                <p className="text-xs text-slate-500">{item.opportunity_type || 'Guest Post'}</p>
                            </div>
                        </div>
                        <StatusBadge status={item.submission_status} />
                    </div>

                    <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">DA Score</span>
                            <DABadge score={item.da_score} />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Spam Score</span>
                            <SpamBadge score={item.spam_score} />
                        </div>
                        {item.service_name && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Service</span>
                                <span className="text-slate-700 truncate max-w-[120px]">{item.service_name}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {item.seo_owner_name ? (
                                <>
                                    <Avatar name={item.seo_owner_name} />
                                    <span className="text-xs text-slate-600">{item.seo_owner_name}</span>
                                </>
                            ) : (
                                <span className="text-xs text-slate-400">Unassigned</span>
                            )}
                        </div>
                        {item.is_paid && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Paid</span>
                        )}
                    </div>
                </div>
            ))}
            {filteredSubmissions.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                    No backlink opportunities found
                </div>
            )}
        </div>
    );

    // Table View
    const renderTableView = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Domain</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Opportunity Type</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Anchor Text</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Target URL</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Content Used</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">DA / Spam</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">SEO Owner</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Updated</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredSubmissions.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-900 text-sm">{item.domain || 'Unknown'}</span>
                                            {item.is_paid && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">Paid</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <OpportunityBadge type={item.opportunity_type || 'Guest Post'} />
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-700 truncate block max-w-[150px]">
                                        {item.anchor_text || item.anchor_text_used || '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-blue-600 truncate block max-w-[150px]" title={item.target_url}>
                                        {item.target_url || '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-600 truncate block max-w-[120px]">
                                        {item.content_used || '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <DABadge score={item.da_score} />
                                        <span className="text-slate-300">/</span>
                                        <SpamBadge score={item.spam_score} />
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={item.submission_status} />
                                </td>
                                <td className="px-4 py-3">
                                    {item.seo_owner_name ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar name={item.seo_owner_name} />
                                            <span className="text-sm text-slate-700">{item.seo_owner_name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-500">{formatDate(item.updated_at || item.submitted_at)}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredSubmissions.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                                    No backlink opportunities found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );


    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50">
            {showCreateModal && renderCreateModal()}

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Backlink Submission</h1>
                            <p className="text-sm text-slate-500">Manage backlink opportunities, submissions, and verification</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${showFilters
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'text-slate-600 border-slate-300 hover:bg-white'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Advanced Filters
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Backlink Opportunity
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
                        placeholder="Search by domain, opportunity, anchor text, keyword..."
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
                            onClick={() => setViewMode('card')}
                            className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && renderFiltersPanel()}

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {viewMode === 'table' ? renderTableView() : renderCardView()}
            </div>
        </div>
    );
};

export default BacklinksView;

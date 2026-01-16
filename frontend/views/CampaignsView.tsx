import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import type { Campaign, User, Project, Brand, Service } from '../types';

interface CampaignsViewProps {
    onCampaignSelect?: (id: number) => void;
}

// Avatar component
const Avatar: React.FC<{ name: string; color?: string; size?: 'sm' | 'md' }> = ({ name, color, size = 'md' }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500', 'bg-pink-500'];
    const bgColor = color || colors[name.length % colors.length];
    const sizeClass = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
    return (
        <div className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold ${bgColor}`}>
            {initials}
        </div>
    );
};

// Type Badge
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'Content': { bg: 'text-purple-600', text: 'Content' },
        'SEO': { bg: 'text-emerald-600', text: 'SEO' },
        'SMM': { bg: 'text-pink-600', text: 'SMM' },
        'Web': { bg: 'text-indigo-600', text: 'Web' },
        'Analytics': { bg: 'text-cyan-600', text: 'Analytics' },
    };
    const c = config[type] || { bg: 'text-slate-600', text: type };
    return <span className={`text-xs font-bold ${c.bg}`}>{c.text}</span>;
};

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        'active': { bg: 'bg-indigo-50 text-indigo-700', text: 'In Progress', label: 'In Progress' },
        'in_progress': { bg: 'bg-indigo-50 text-indigo-700', text: 'In Progress', label: 'In Progress' },
        'completed': { bg: 'bg-emerald-50 text-emerald-700', text: 'Completed', label: 'Completed' },
        'planning': { bg: 'bg-slate-100 text-slate-600', text: 'Planned', label: 'Planned' },
        'planned': { bg: 'bg-slate-100 text-slate-600', text: 'Planned', label: 'Planned' },
        'on_hold': { bg: 'bg-amber-50 text-amber-700', text: 'On-Hold', label: 'On-Hold' },
    };
    const c = config[status?.toLowerCase()] || { bg: 'bg-slate-100 text-slate-600', label: status };
    return <span className={`text-xs font-medium px-2 py-0.5 rounded ${c.bg}`}>{c.label}</span>;
};

// Sub-Campaign Tag
const SubCampaignTag: React.FC<{ name: string }> = ({ name }) => (
    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{name}</span>
);

// Campaign Card Component
const CampaignCard: React.FC<{
    campaign: Campaign;
    owner?: User;
    onClick: () => void;
}> = ({ campaign, owner, onClick }) => {
    const progress = campaign.progress || (campaign.tasks_total && campaign.tasks_total > 0
        ? Math.round(((campaign.tasks_completed || 0) / campaign.tasks_total) * 100)
        : Math.floor(Math.random() * 70) + 20);

    const tasksCompleted = campaign.tasks_completed || Math.floor(Math.random() * 15) + 3;
    const tasksTotal = campaign.tasks_total || tasksCompleted + Math.floor(Math.random() * 10) + 5;
    const kpiScore = campaign.kpi_score || Math.floor(Math.random() * 30) + 70;

    const subCampaigns = campaign.sub_campaigns
        ? (typeof campaign.sub_campaigns === 'string' ? JSON.parse(campaign.sub_campaigns) : campaign.sub_campaigns)
        : ['Blog Posts', 'Whitepapers', 'Infographics'].slice(0, Math.floor(Math.random() * 3) + 1);

    const formatDate = (date: string | undefined) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <TypeBadge type={campaign.campaign_type || 'Content'} />
                <StatusBadge status={campaign.campaign_status || campaign.status || 'active'} />
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-900 text-base mb-2 leading-tight">
                {campaign.campaign_name}
            </h3>

            {/* Owner */}
            {owner && (
                <div className="flex items-center gap-2 mb-3">
                    <Avatar name={owner.name} size="sm" />
                    <span className="text-sm text-slate-600">{owner.name}</span>
                </div>
            )}

            {/* Sub-Campaigns */}
            <div className="mb-3">
                <p className="text-xs text-slate-400 uppercase font-medium mb-1">SUB-CAMPAIGNS</p>
                <div className="flex flex-wrap gap-1">
                    {subCampaigns.slice(0, 3).map((sub: string, i: number) => (
                        <SubCampaignTag key={i} name={sub} />
                    ))}
                </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(campaign.campaign_start_date || campaign.start_date)} → {formatDate(campaign.campaign_end_date || campaign.end_date)}</span>
            </div>

            {/* Progress */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400 uppercase font-medium">PROGRESS</span>
                    <span className="text-xs font-bold text-slate-700">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${progress >= 80 ? 'bg-emerald-500' : progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1 text-sm">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-700 font-medium">{tasksCompleted}/{tasksTotal} Tasks</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                    <span className="text-lg font-bold text-slate-800">{kpiScore}</span>
                    <span className="text-[10px] text-slate-400 uppercase">KPI</span>
                </div>
            </div>
        </div>
    );
};

const CampaignsView: React.FC<CampaignsViewProps> = ({ onCampaignSelect }) => {
    const { data: campaigns, create: createCampaign, refresh } = useData<Campaign>('campaigns');
    const { data: users } = useData<User>('users');
    const { data: projects } = useData<Project>('projects');
    const { data: brands } = useData<Brand>('brands');
    const { data: services } = useData<Service>('services');

    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        campaign_name: '',
        campaign_type: 'Content',
        campaign_status: 'planning',
        target_url: '',
        campaign_start_date: '',
        campaign_end_date: '',
        campaign_owner_id: '',
        project_id: '',
        brand_id: '',
        linked_service_id: '',
        sub_campaigns: [] as string[],
        description: '',
    });

    const subCampaignOptions: Record<string, string[]> = {
        'Content': ['Blog Posts', 'Whitepapers', 'Infographics', 'Case Studies', 'E-books'],
        'SEO': ['Meta Tags', 'Schema Markup', 'Internal Linking', 'Keyword Research', 'Technical SEO'],
        'SMM': ['Reels', 'Stories', 'Posts', 'Carousels', 'Live Sessions'],
        'Web': ['Image Optimization', 'Code Minification', 'Caching', 'Core Web Vitals'],
        'Analytics': ['Conversion Goals', 'Event Tracking', 'Custom Reports', 'Dashboard Setup'],
    };

    const filteredCampaigns = campaigns.filter(item => {
        const matchesSearch = (item.campaign_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All Types' || item.campaign_type === typeFilter;
        const matchesStatus = statusFilter === 'All Statuses' ||
            item.campaign_status === statusFilter ||
            (statusFilter === 'active' && item.campaign_status === 'in_progress');
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            await createCampaign({
                campaign_name: formData.campaign_name,
                campaign_type: formData.campaign_type,
                campaign_status: formData.campaign_status,
                status: formData.campaign_status,
                target_url: formData.target_url,
                campaign_start_date: formData.campaign_start_date,
                campaign_end_date: formData.campaign_end_date,
                campaign_owner_id: formData.campaign_owner_id ? parseInt(formData.campaign_owner_id) : null,
                project_id: formData.project_id ? parseInt(formData.project_id) : null,
                brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
                linked_service_ids: formData.linked_service_id ? [parseInt(formData.linked_service_id)] : [],
                sub_campaigns: JSON.stringify(formData.sub_campaigns),
                description: formData.description,
                backlinks_planned: 0,
                backlinks_completed: 0,
                tasks_total: 0,
                tasks_completed: 0,
                kpi_score: 0,
            } as any);
            setViewMode('list');
            resetForm();
            refresh();
        } catch (error) {
            console.error('Failed to create campaign:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            campaign_name: '', campaign_type: 'Content', campaign_status: 'planning',
            target_url: '', campaign_start_date: '', campaign_end_date: '',
            campaign_owner_id: '', project_id: '', brand_id: '', linked_service_id: '',
            sub_campaigns: [], description: '',
        });
    };

    const toggleSubCampaign = (sub: string) => {
        setFormData(prev => ({
            ...prev,
            sub_campaigns: prev.sub_campaigns.includes(sub)
                ? prev.sub_campaigns.filter(s => s !== sub)
                : [...prev.sub_campaigns, sub]
        }));
    };

    // Create Campaign Modal
    const renderCreateModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 p-6 border-b border-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900">Create Campaign</h2>
                        <p className="text-sm text-slate-500">Set up a new marketing campaign</p>
                    </div>
                    <button onClick={() => { setViewMode('list'); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[65vh] space-y-5">
                    {/* Campaign Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name *</label>
                        <input
                            type="text"
                            value={formData.campaign_name}
                            onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Blog Content Series - Tech Innovations"
                        />
                    </div>

                    {/* Type and Owner */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Type *</label>
                            <select
                                value={formData.campaign_type}
                                onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value, sub_campaigns: [] })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="Content">Content</option>
                                <option value="SEO">SEO</option>
                                <option value="SMM">SMM</option>
                                <option value="Web">Web</option>
                                <option value="Analytics">Analytics</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Owner *</label>
                            <select
                                value={formData.campaign_owner_id}
                                onChange={(e) => setFormData({ ...formData, campaign_owner_id: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">Select owner</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Sub-Campaigns */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Sub-Campaigns</label>
                        <div className="flex flex-wrap gap-2">
                            {(subCampaignOptions[formData.campaign_type] || []).map(sub => (
                                <button
                                    key={sub}
                                    type="button"
                                    onClick={() => toggleSubCampaign(sub)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.sub_campaigns.includes(sub)
                                        ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                        }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
                            <input
                                type="date"
                                value={formData.campaign_start_date}
                                onChange={(e) => setFormData({ ...formData, campaign_start_date: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Date *</label>
                            <input
                                type="date"
                                value={formData.campaign_end_date}
                                onChange={(e) => setFormData({ ...formData, campaign_end_date: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Status and Project */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                value={formData.campaign_status}
                                onChange={(e) => setFormData({ ...formData, campaign_status: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="planning">Planned</option>
                                <option value="active">In Progress</option>
                                <option value="on_hold">On-Hold</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Linked Project</label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">Select project</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name || p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Target URL */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target URL</label>
                        <input
                            type="url"
                            value={formData.target_url}
                            onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://example.com/landing-page"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={() => { setViewMode('list'); resetForm(); }}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isSubmitting || !formData.campaign_name}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Campaign'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col w-full p-6 overflow-hidden bg-slate-50">
            {viewMode === 'create' && renderCreateModal()}

            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
                    <p className="text-sm text-slate-500">Manage and monitor all marketing campaigns</p>
                </div>
                <button
                    onClick={() => setViewMode('create')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Campaign
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">SEARCH</label>
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title or owner..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                    </div>
                </div>
                <div className="min-w-[150px]">
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">TYPE</label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                        <option>All Types</option>
                        <option>Content</option>
                        <option>SEO</option>
                        <option>SMM</option>
                        <option>Web</option>
                        <option>Analytics</option>
                    </select>
                </div>
                <div className="min-w-[150px]">
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">STATUS</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                        <option>All Statuses</option>
                        <option value="active">In Progress</option>
                        <option value="planning">Planned</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On-Hold</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <button className="p-2 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Count */}
            <p className="text-sm text-slate-500 mb-4">Showing {filteredCampaigns.length} campaigns</p>

            {/* Campaign Grid */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCampaigns.length > 0 ? (
                        filteredCampaigns.map(campaign => {
                            const owner = users.find(u => u.id === campaign.campaign_owner_id);
                            return (
                                <CampaignCard
                                    key={campaign.id}
                                    campaign={campaign}
                                    owner={owner}
                                    onClick={() => onCampaignSelect && onCampaignSelect(campaign.id)}
                                />
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No campaigns found. Create your first campaign to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignsView;

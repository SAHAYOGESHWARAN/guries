import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import type { PromotionItem, User, Service, Campaign } from '../types';

const PROMOTION_TYPES = [
    { key: 'SEO', label: 'SEO (Backlinks)', color: 'bg-blue-500' },
    { key: 'SMM', label: 'SMM (Posts, Reels)', color: 'bg-pink-500' },
    { key: 'Email', label: 'Email / Newsletter', color: 'bg-purple-500' },
    { key: 'Paid Ads', label: 'Paid Ads', color: 'bg-orange-500' },
    { key: 'Partnerships', label: 'Partnerships / Guest Posts', color: 'bg-emerald-500' },
    { key: 'Press Release', label: 'Press Release', color: 'bg-cyan-500' },
];

const CONTENT_TYPES = ['Blog', 'Infographic', 'Service Page', 'Video', 'Case Study', 'Whitepaper', 'Guide'];
const QC_STATUSES = ['QC Passed', 'QC Pending', 'QC Failed', 'Rework Completed', 'Updated'];
const CARD_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-pink-500', 'bg-orange-500', 'bg-purple-500', 'bg-cyan-500'];

const PromotionTypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const colors: Record<string, string> = {
        'SEO': 'bg-blue-100 text-blue-700', 'SMM': 'bg-pink-100 text-pink-700',
        'Email': 'bg-purple-100 text-purple-700', 'Paid Ads': 'bg-orange-100 text-orange-700',
        'Partnerships': 'bg-emerald-100 text-emerald-700', 'Press Release': 'bg-cyan-100 text-cyan-700',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[type] || 'bg-slate-100 text-slate-600'}`}>{type}</span>;
};

const QCStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'QC Passed': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        'QC Pending': { bg: 'bg-amber-50', text: 'text-amber-700' },
        'QC Failed': { bg: 'bg-red-50', text: 'text-red-700' },
        'Rework Completed': { bg: 'bg-blue-50', text: 'text-blue-700' },
        'Updated': { bg: 'bg-purple-50', text: 'text-purple-700' },
    };
    const c = config[status] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{status}</span>;
};

const ContentTypeBadge: React.FC<{ type: string }> = ({ type }) => (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">{type}</span>
);

const PromotionRepositoryView: React.FC = () => {
    const { data: items, create: createItem, remove: deleteItem, refresh } = useData<PromotionItem>('promotionItems');
    const { data: users } = useData<User>('users');
    const { data: services } = useData<Service>('services');
    const { data: campaigns } = useData<Campaign>('campaigns');

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [showFilters, setShowFilters] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [filters, setFilters] = useState({
        promotionTypes: [] as string[], contentType: '', campaignId: '',
        serviceId: '', qcStatuses: [] as string[], publishedDate: '',
    });

    const [formData, setFormData] = useState({
        title: '', subtitle: '', content_type: 'Blog', promotion_types: [] as string[],
        campaign_id: '', service_id: '', keywords: '', thumbnail_url: '', full_url: '', qc_status: 'QC Pending',
    });

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.campaign_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.service_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPromotionType = filters.promotionTypes.length === 0 ||
            (item.promotion_types && item.promotion_types.some(t => filters.promotionTypes.includes(t)));
        const matchesContentType = !filters.contentType || item.content_type === filters.contentType;
        const matchesCampaign = !filters.campaignId || item.campaign_id?.toString() === filters.campaignId;
        const matchesService = !filters.serviceId || item.service_id?.toString() === filters.serviceId;
        const matchesQCStatus = filters.qcStatuses.length === 0 || filters.qcStatuses.includes(item.qc_status);
        return matchesSearch && matchesPromotionType && matchesContentType && matchesCampaign && matchesService && matchesQCStatus;
    });

    const handleCreate = async () => {
        if (!formData.title) { alert('Please fill in the title'); return; }
        setIsSubmitting(true);
        try {
            await createItem({
                title: formData.title, subtitle: formData.subtitle || null, content_type: formData.content_type,
                promotion_types: formData.promotion_types,
                campaign_id: formData.campaign_id ? parseInt(formData.campaign_id) : null,
                service_id: formData.service_id ? parseInt(formData.service_id) : null,
                keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
                thumbnail_url: formData.thumbnail_url || null, full_url: formData.full_url || null, qc_status: formData.qc_status,
            } as any);
            setShowCreateModal(false); resetForm(); refresh();
        } catch (error) { console.error('Failed to create promotion item:', error); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try { await deleteItem(id); refresh(); } catch (error) { console.error('Failed to delete:', error); }
        }
    };

    const resetForm = () => setFormData({ title: '', subtitle: '', content_type: 'Blog', promotion_types: [], campaign_id: '', service_id: '', keywords: '', thumbnail_url: '', full_url: '', qc_status: 'QC Pending' });
    const resetFilters = () => setFilters({ promotionTypes: [], contentType: '', campaignId: '', serviceId: '', qcStatuses: [], publishedDate: '' });

    const togglePromotionTypeFilter = (type: string) => setFilters(prev => ({
        ...prev, promotionTypes: prev.promotionTypes.includes(type) ? prev.promotionTypes.filter(t => t !== type) : [...prev.promotionTypes, type]
    }));
    const toggleQCStatusFilter = (status: string) => setFilters(prev => ({
        ...prev, qcStatuses: prev.qcStatuses.includes(status) ? prev.qcStatuses.filter(s => s !== status) : [...prev.qcStatuses, status]
    }));
    const toggleFormPromotionType = (type: string) => setFormData(prev => ({
        ...prev, promotion_types: prev.promotion_types.includes(type) ? prev.promotion_types.filter(t => t !== type) : [...prev.promotion_types, type]
    }));
    const getCardColor = (id: number) => CARD_COLORS[id % CARD_COLORS.length];
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
                        <h2 className="text-xl font-bold text-slate-900">Add Promotion Item</h2>
                        <p className="text-sm text-slate-500">Add content to the promotion repository</p>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Title *</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Content title" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Subtitle</label>
                        <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Optional subtitle" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Content Type</label>
                            <select value={formData.content_type} onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">QC Status</label>
                            <select value={formData.qc_status} onChange={(e) => setFormData({ ...formData, qc_status: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                {QC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Promotion Types</label>
                        <div className="flex flex-wrap gap-2">
                            {PROMOTION_TYPES.map(pt => (
                                <button key={pt.key} type="button" onClick={() => toggleFormPromotionType(pt.key)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.promotion_types.includes(pt.key) ? `${pt.color} text-white` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    {pt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Campaign</label>
                            <select value={formData.campaign_id} onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                <option value="">Select campaign</option>
                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Service</label>
                            <select value={formData.service_id} onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                <option value="">Select service</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Keywords (comma separated)</label>
                        <input type="text" value={formData.keywords} onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="keyword1, keyword2, keyword3" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Thumbnail URL</label>
                        <input type="text" value={formData.thumbnail_url} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Full URL</label>
                        <input type="text" value={formData.full_url} onChange={(e) => setFormData({ ...formData, full_url: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="https://..." />
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                    <button onClick={handleCreate} disabled={isSubmitting || !formData.title}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Creating...' : 'Add Item'}
                    </button>
                </div>
            </div>
        </div>
    );

    // Filters Panel
    const renderFiltersPanel = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Advanced Filters</h3>
                <button onClick={resetFilters} className="text-sm text-indigo-600 hover:text-indigo-700">Reset All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Promotion Type</label>
                    <div className="space-y-2">
                        {PROMOTION_TYPES.map(pt => (
                            <label key={pt.key} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={filters.promotionTypes.includes(pt.key)} onChange={() => togglePromotionTypeFilter(pt.key)}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-slate-700">{pt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Content Type</label>
                        <select value={filters.contentType} onChange={(e) => setFilters({ ...filters, contentType: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                            <option value="">All Types</option>
                            {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Campaign</label>
                        <select value={filters.campaignId} onChange={(e) => setFilters({ ...filters, campaignId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                            <option value="">All Campaigns</option>
                            {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Service</label>
                        <select value={filters.serviceId} onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                            <option value="">All Services</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-2">QC Status</label>
                    <div className="space-y-2">
                        {QC_STATUSES.map(status => (
                            <label key={status} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={filters.qcStatuses.includes(status)} onChange={() => toggleQCStatusFilter(status)}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-slate-700">{status}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // Card View
    const renderCardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`h-32 ${getCardColor(item.id)} relative`}>
                        {item.thumbnail_url ? (
                            <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                        <div className="absolute top-2 right-2">
                            <ContentTypeBadge type={item.content_type} />
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{item.title}</h3>
                        {item.subtitle && <p className="text-xs text-slate-500 mb-2 line-clamp-1">{item.subtitle}</p>}
                        <div className="flex flex-wrap gap-1 mb-3">
                            {item.promotion_types?.slice(0, 3).map(pt => <PromotionTypeBadge key={pt} type={pt} />)}
                            {item.promotion_types && item.promotion_types.length > 3 && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">+{item.promotion_types.length - 3}</span>
                            )}
                        </div>
                        {item.campaign_name && <p className="text-xs text-slate-500 mb-2">Campaign: {item.campaign_name}</p>}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <QCStatusBadge status={item.qc_status} />
                            <div className="flex gap-1">
                                <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="SEO Action">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                                <button className="p-1.5 text-pink-600 hover:bg-pink-50 rounded-lg" title="SMM Action">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {filteredItems.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">No promotion items found</div>
            )}
        </div>
    );

    // List View
    const renderListView = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Thumbnail</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Promotion Categories</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Campaign</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Keywords</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">QC Status</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredItems.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className={`w-16 h-12 rounded-lg ${getCardColor(item.id)} overflow-hidden`}>
                                        {item.thumbnail_url ? (
                                            <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div>
                                        <span className="font-medium text-slate-900 text-sm">{item.title}</span>
                                        {item.subtitle && <p className="text-xs text-slate-500">{item.subtitle}</p>}
                                    </div>
                                </td>
                                <td className="px-4 py-3"><ContentTypeBadge type={item.content_type} /></td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {item.promotion_types?.slice(0, 2).map(pt => <PromotionTypeBadge key={pt} type={pt} />)}
                                        {item.promotion_types && item.promotion_types.length > 2 && (
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">+{item.promotion_types.length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3"><span className="text-sm text-slate-600">{item.campaign_name || '-'}</span></td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                                        {item.keywords?.slice(0, 2).map((kw, i) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{kw}</span>
                                        ))}
                                        {item.keywords && item.keywords.length > 2 && (
                                            <span className="text-xs text-slate-400">+{item.keywords.length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3"><QCStatusBadge status={item.qc_status} /></td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="SEO">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                        <button className="p-1.5 text-pink-600 hover:bg-pink-50 rounded-lg" title="SMM">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredItems.length === 0 && (
                            <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">No promotion items found</td></tr>
                        )}
                    </tbody>
                </table>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Promotion Repository</h1>
                            <p className="text-sm text-slate-500">Manage promotional content across all channels</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium">Add Promotion Item</span>
                </button>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Search by title, campaign, service..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" />
                </div>
                <button onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="font-medium">Filters</span>
                    {(filters.promotionTypes.length > 0 || filters.qcStatuses.length > 0 || filters.contentType || filters.campaignId || filters.serviceId) && (
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                    )}
                </button>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                    <button onClick={() => setViewMode('card')} className={`p-2.5 ${viewMode === 'card' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    </button>
                </div>
                <div className="text-sm text-slate-500">{filteredItems.length} items</div>
            </div>

            {/* Filters Panel */}
            {showFilters && renderFiltersPanel()}

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {viewMode === 'card' ? renderCardView() : renderListView()}
            </div>
        </div>
    );
};

export default PromotionRepositoryView;

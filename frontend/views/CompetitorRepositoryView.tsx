import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import type { CompetitorBenchmarkItem } from '../types';

const INDUSTRIES = ['Technology', 'E-commerce', 'Media', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing'];
const SECTORS = ['SaaS', 'Cloud Services', 'Publishing', 'Security', 'Analytics', 'Marketing', 'Consulting'];
const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'India', 'Singapore'];
const SERVICES_OFFERED = ['SEO Services', 'Content Marketing', 'Social Media Marketing', 'Email Marketing', 'PPC Advertising', 'Web Design', 'Branding'];
const TRAFFIC_SOURCES = ['Organic', 'Paid', 'Social', 'Referral'];
const STATUSES = ['Active', 'Inactive', 'Archived'];

// DA Progress Bar with color gradient
const DAProgressBar: React.FC<{ value: number }> = ({ value }) => {
    const getColor = (v: number) => {
        if (v >= 70) return 'bg-emerald-500';
        if (v >= 50) return 'bg-lime-500';
        if (v >= 30) return 'bg-amber-500';
        return 'bg-red-500';
    };
    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${getColor(value)} rounded-full`} style={{ width: `${value}%` }} />
            </div>
            <span className="text-xs font-medium text-slate-700">{value}</span>
        </div>
    );
};

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; dot: string }> = {
        'Active': { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
        'Inactive': { bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
        'Archived': { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
    };
    const c = config[status] || config['Active'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${c.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
            {status}
        </span>
    );
};

// Format traffic number
const formatTraffic = (value: number | string | undefined) => {
    if (!value) return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
};

const CompetitorRepositoryView: React.FC = () => {
    const { data: competitors, create: createCompetitor, update: updateCompetitor, remove: deleteCompetitor, refresh } = useData<CompetitorBenchmarkItem>('competitors');

    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        industry: '', country: '', status: ''
    });

    // Form state
    const [formData, setFormData] = useState({
        competitor_name: '', website_url: '', primary_country: '', industry: '', sector: '',
        services_offered: [] as string[], notes: '', status: 'Active',
        da: 0, spam_score: 0, estimated_monthly_traffic: '', total_keywords_ranked: '',
        total_backlinks: '', primary_traffic_sources: ['Organic'] as string[], attachments: [] as string[]
    });

    const filteredCompetitors = (competitors || []).filter(item => {
        if (!item) return false;
        const matchesSearch = (item.competitor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.website_url || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.domain?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIndustry = !filters.industry || item.industry === filters.industry;
        const matchesCountry = !filters.country || item.primary_country === filters.country || item.region === filters.country;
        const matchesStatus = !filters.status || item.status === filters.status;
        return matchesSearch && matchesIndustry && matchesCountry && matchesStatus;
    });

    const handleCreate = async () => {
        if (!formData.competitor_name || !formData.website_url) {
            alert('Please fill in Competitor Name and Website URL');
            return;
        }
        setIsSubmitting(true);
        try {
            await createCompetitor({
                ...formData,
                estimated_monthly_traffic: formData.estimated_monthly_traffic ? parseInt(formData.estimated_monthly_traffic) : 0,
                total_keywords_ranked: formData.total_keywords_ranked ? parseInt(formData.total_keywords_ranked) : 0,
                total_backlinks: formData.total_backlinks ? parseInt(formData.total_backlinks) : 0,
            } as any);
            setShowCreateModal(false);
            resetForm();
            refresh();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to create competitor:', error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this competitor?')) {
            try { await deleteCompetitor(id); refresh(); } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Failed to delete:', error);
                }
            }
        }
    };

    const resetForm = () => {
        setFormData({
            competitor_name: '', website_url: '', primary_country: '', industry: '', sector: '',
            services_offered: [], notes: '', status: 'Active',
            da: 0, spam_score: 0, estimated_monthly_traffic: '', total_keywords_ranked: '',
            total_backlinks: '', primary_traffic_sources: ['Organic'], attachments: []
        });
        setActiveTab('general');
    };

    const toggleService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            services_offered: prev.services_offered.includes(service)
                ? prev.services_offered.filter(s => s !== service)
                : [...prev.services_offered, service]
        }));
    };

    const toggleTrafficSource = (source: string) => {
        setFormData(prev => ({
            ...prev,
            primary_traffic_sources: prev.primary_traffic_sources.includes(source)
                ? prev.primary_traffic_sources.filter(s => s !== source)
                : [...prev.primary_traffic_sources, source]
        }));
    };

    // Create Modal with Tabs
    const renderCreateModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Add New Competitor</h2>
                        <p className="text-sm text-slate-500">Add a new competitor for SEO benchmarking and keyword gap analysis</p>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-6">
                    <button onClick={() => setActiveTab('general')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        General Info
                    </button>
                    <button onClick={() => setActiveTab('seo')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'seo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        SEO & Benchmark Metrics
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[55vh]">
                    {activeTab === 'general' ? renderGeneralInfoTab() : renderSeoMetricsTab()}
                </div>

                <div className="flex justify-between items-center p-6 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-slate-500 uppercase">Status</span>
                        <div className="flex gap-2">
                            {['Active', 'Inactive'].map(s => (
                                <button key={s} onClick={() => setFormData({ ...formData, status: s })}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${formData.status === s ? (s === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700') : 'text-slate-500 hover:bg-slate-100'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                        <button onClick={handleCreate} disabled={isSubmitting || !formData.competitor_name || !formData.website_url}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            {isSubmitting ? 'Adding...' : 'Add Competitor'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // General Info Tab
    const renderGeneralInfoTab = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Competitor Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.competitor_name} onChange={(e) => setFormData({ ...formData, competitor_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Acme Corporation" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Website URL <span className="text-red-500">*</span></label>
                <input type="text" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., www.example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Primary Country</label>
                    <select value={formData.primary_country} onChange={(e) => setFormData({ ...formData, primary_country: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">Select country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Industry</label>
                    <select value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">Select industry</option>
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Sector</label>
                <select value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select sector</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Services Offered</label>
                <div className="grid grid-cols-2 gap-2">
                    {SERVICES_OFFERED.map(service => (
                        <label key={service} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.services_offered.includes(service)} onChange={() => toggleService(service)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm text-slate-700">{service}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                    placeholder="Add any additional notes about this competitor..." />
            </div>
        </div>
    );

    // SEO & Benchmark Metrics Tab
    const renderSeoMetricsTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Domain Authority (DA)</label>
                    <input type="number" min="0" max="100" value={formData.da} onChange={(e) => setFormData({ ...formData, da: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0-100" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Spam Score</label>
                    <input type="number" min="0" max="100" value={formData.spam_score} onChange={(e) => setFormData({ ...formData, spam_score: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0-100" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Estimated Monthly Traffic</label>
                    <input type="text" value={formData.estimated_monthly_traffic} onChange={(e) => setFormData({ ...formData, estimated_monthly_traffic: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., 2.5M or 250000" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Total Keywords Ranked</label>
                    <input type="text" value={formData.total_keywords_ranked} onChange={(e) => setFormData({ ...formData, total_keywords_ranked: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., 1250" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Total Backlinks</label>
                <input type="text" value={formData.total_backlinks} onChange={(e) => setFormData({ ...formData, total_backlinks: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., 45000" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Primary Traffic Sources</label>
                <div className="flex gap-4">
                    {TRAFFIC_SOURCES.map(source => (
                        <label key={source} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.primary_traffic_sources.includes(source)} onChange={() => toggleTrafficSource(source)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm text-slate-700">{source}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Attachments</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-700">Upload screenshots or PDF exports</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                    <button className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Choose Files</button>
                </div>
            </div>
        </div>
    );

    // Main Table View
    const renderTableView = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="w-8 px-4 py-3"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" /></th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Competitor Name</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Website URL</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Industry</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Sector</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Primary Country</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Domain Authority (DA)</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Estimated Traffic</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Keywords Ranked</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Backlink Count</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Updated</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCompetitors.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" /></td>
                                <td className="px-4 py-3"><span className="font-medium text-slate-900 text-sm">{item.competitor_name}</span></td>
                                <td className="px-4 py-3">
                                    <a href={item.website_url?.startsWith('http') ? item.website_url : `https://${item.website_url}`} target="_blank" rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline">{item.website_url || item.domain || '-'}</a>
                                </td>
                                <td className="px-4 py-3"><span className="text-sm text-slate-600">{item.industry || '-'}</span></td>
                                <td className="px-4 py-3"><span className="text-sm text-slate-600">{item.sector || '-'}</span></td>
                                <td className="px-4 py-3"><span className="text-sm text-slate-600">{item.primary_country || item.region || '-'}</span></td>
                                <td className="px-4 py-3"><DAProgressBar value={item.da || 0} /></td>
                                <td className="px-4 py-3"><span className="text-sm font-medium text-slate-700">{formatTraffic(item.estimated_monthly_traffic || item.monthly_traffic)}</span></td>
                                <td className="px-4 py-3"><span className="text-sm text-slate-600">{(item.total_keywords_ranked || item.total_keywords || 0).toLocaleString()}</span></td>
                                <td className="px-4 py-3"><span className="text-sm text-slate-600">{(item.total_backlinks || item.backlinks || 0).toLocaleString()}</span></td>
                                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                                <td className="px-4 py-3"><span className="text-sm text-slate-500">{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : item.updated_on || '-'}</span></td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg" title="Edit">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Archive">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredCompetitors.length === 0 && (
                            <tr><td colSpan={13} className="px-4 py-12 text-center text-slate-500">No competitors found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                <span className="text-sm text-slate-600">Showing 1 to {filteredCompetitors.length} of {filteredCompetitors.length} entries</span>
                <div className="flex items-center gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                    <button className="w-8 h-8 rounded bg-blue-600 text-white text-sm font-medium">1</button>
                    <button className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 text-sm">2</button>
                    <button className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 text-sm">3</button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
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
                    <h1 className="text-2xl font-bold text-slate-900">Competitor Repository</h1>
                    <p className="text-sm text-slate-500">Stores all competitors and their SEO strength, used for keyword gap and benchmark analysis</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-sm font-medium">Export</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        <span className="text-sm font-medium">Filter</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" onClick={refresh}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="text-sm font-medium">Refresh</span>
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-sm font-medium">Add Competitor</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Search competitors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm" />
                </div>
                <select value={filters.industry} onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                    <option value="">All Industries</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <select value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                    <option value="">All Countries</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                    <option value="">All Status</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                {renderTableView()}
            </div>
        </div>
    );
};

export default CompetitorRepositoryView;


import React, { useState, useMemo } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { Service, ContentRepositoryItem, User, Brand, Campaign, IndustrySectorItem, CountryMasterItem, Keyword, ContentTypeItem } from '../types';

const ServiceMasterView: React.FC = () => {
    const { data: services, create, update, remove } = useData<Service>('services');
    const { data: contentAssets, update: updateContentAsset } = useData<ContentRepositoryItem>('content');
    const { data: keywordsMaster } = useData<Keyword>('keywords');

    // Master Data for Dropdowns/Selectors
    const { data: users } = useData<User>('users');
    const { data: brands } = useData<Brand>('brands');
    const { data: campaigns } = useData<Campaign>('campaigns');
    const { data: industrySectors } = useData<IndustrySectorItem>('industrySectors');
    const { data: countries } = useData<CountryMasterItem>('countries');
    const { data: contentTypes } = useData<ContentTypeItem>('contentTypes');

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [editingItem, setEditingItem] = useState<Service | null>(null);
    const [activeTab, setActiveTab] = useState<'Core' | 'Navigation' | 'Strategic' | 'Content' | 'SEO' | 'SMM' | 'Technical' | 'Linking' | 'Governance'>('Core');

    // Asset Picker State within Full Frame
    const [assetSearch, setAssetSearch] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Service>>({
        service_name: '', service_code: '', slug: '', full_url: '',
        service_description: '', status: 'Draft', language: 'en',
        industry_ids: [], country_ids: [],
        h1: '', h2_list: [], h3_list: [], h4_list: [], h5_list: [], body_content: '',
        internal_links: [], external_links: [], image_alt_texts: [],
        word_count: 0, reading_time_minutes: 0,
        meta_title: '', meta_description: '', focus_keywords: [], secondary_keywords: [],
        seo_score: 0, ranking_summary: '',
        og_title: '', og_description: '', og_image_url: '', og_type: 'website',
        twitter_title: '', twitter_description: '', twitter_image_url: '',
        schema_type_id: 'Service', robots_index: 'index', robots_follow: 'follow', robots_custom: '',
        canonical_url: '', redirect_from_urls: [], hreflang_group_id: 0,
        core_web_vitals_status: 'Good', tech_seo_status: 'Ok',
        sitemap_priority: 0.8, sitemap_changefreq: 'monthly', faq_section_enabled: false, faq_content: [],
        show_in_main_menu: false, show_in_footer_menu: false, menu_position: 0,
        linked_campaign_ids: [], secondary_persona_ids: []
    });

    // Helper inputs
    const [tempH2, setTempH2] = useState('');
    const [tempKeyword, setTempKeyword] = useState('');
    const [tempSecondaryKeyword, setTempSecondaryKeyword] = useState('');
    const [tempRedirect, setTempRedirect] = useState('');

    // Computed Data
    const filteredData = services.filter(item => {
        const matchesSearch = item.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.service_code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const linkedAssets = useMemo(() => {
        if (!editingItem) return [];
        return contentAssets.filter(a => a.linked_service_ids?.includes(editingItem.id));
    }, [contentAssets, editingItem]);

    const availableAssets = useMemo(() => {
        if (!editingItem) return [];
        return contentAssets
            .filter(a => !a.linked_service_ids?.includes(editingItem.id))
            .filter(a => a.content_title_clean.toLowerCase().includes(assetSearch.toLowerCase()))
            .slice(0, 10); // Limit results for perf
    }, [contentAssets, editingItem, assetSearch]);

    // Handlers
    const handleCreateClick = () => {
        setEditingItem(null);
        setFormData({
            service_name: '', service_code: '', slug: '', full_url: '',
            service_description: '', status: 'Draft', language: 'en', content_type: 'Pillar',
            h1: '', h2_list: [], h3_list: [], h4_list: [], h5_list: [], body_content: '',
            meta_title: '', meta_description: '', focus_keywords: [], secondary_keywords: [],
            industry_ids: [], country_ids: [], linked_campaign_ids: [],
            redirect_from_urls: [], faq_content: []
        });
        setActiveTab('Core');
        setViewMode('form');
    };

    const handleEdit = (item: Service) => {
        setEditingItem(item);
        setFormData({
            ...item,
            h2_list: item.h2_list || [],
            h3_list: item.h3_list || [],
            h4_list: item.h4_list || [],
            h5_list: item.h5_list || [],
            focus_keywords: item.focus_keywords || [],
            secondary_keywords: item.secondary_keywords || [],
            industry_ids: item.industry_ids || [],
            country_ids: item.country_ids || [],
            linked_campaign_ids: item.linked_campaign_ids || [],
            faq_content: item.faq_content || [],
            redirect_from_urls: item.redirect_from_urls || []
        });
        setActiveTab('Core');
        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this service?')) await remove(id);
    };

    const handleSave = async () => {
        if (!formData.service_name) return alert("Service Name is required");
        const payload = { ...formData, updated_at: new Date().toISOString() };

        if (formData.slug && !formData.full_url) {
            payload.full_url = `/services/${formData.slug}`;
        }

        if (editingItem) {
            await update(editingItem.id, payload);
        } else {
            await create(payload as any);
        }
        setViewMode('list');
    };

    const handleSlugChange = (val: string) => {
        const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        setFormData(prev => ({ ...prev, slug, full_url: `/services/${slug}` }));
    };

    // List Management
    const addToList = (field: keyof Service, value: any, setter?: any) => {
        if (!value) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] as any[] || []), value]
        }));
        if (setter) setter('');
    };

    const removeFromList = (field: keyof Service, index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] as any[]).filter((_, i) => i !== index)
        }));
    };

    const toggleSelection = (field: 'industry_ids' | 'country_ids' | 'linked_campaign_ids', id: string | number) => {
        const current = formData[field] as any[] || [];
        const exists = current.includes(id);
        const updated = exists
            ? current.filter(i => i !== id)
            : [...current, id];
        setFormData({ ...formData, [field]: updated });
    };

    const handleToggleAssetLink = async (asset: ContentRepositoryItem) => {
        if (!editingItem) return;
        const currentLinks = asset.linked_service_ids || [];
        const isLinked = currentLinks.includes(editingItem.id);

        const newLinks = isLinked
            ? currentLinks.filter(id => id !== editingItem.id)
            : [...currentLinks, editingItem.id];

        await updateContentAsset(asset.id, { linked_service_ids: newLinks });
    };

    const getKeywordMetric = (kw: string) => {
        const serviceUsage = services.reduce((acc, s) => {
            if (s.id === editingItem?.id) return acc;
            return acc + (s.focus_keywords?.includes(kw) ? 1 : 0);
        }, 0);

        const masterRecord = keywordsMaster.find(k => k.keyword.toLowerCase() === kw.toLowerCase());
        const vol = masterRecord ? masterRecord.search_volume.toLocaleString() : 'N/A';
        const comp = masterRecord ? masterRecord.competition : '-';

        return `Vol: ${vol} | Comp: ${comp}`;
    };

    const handleKeywordSuggest = () => alert('AI keyword suggestion coming soon.');
    const handleSecondaryKeywordSuggest = () => alert('AI keyword suggestion coming soon.');

    const handleExport = () => exportToCSV(filteredData, 'services_master_export');

    const tabs = [
        { id: 'Core', label: 'Core', icon: '💎' },
        { id: 'Navigation', label: 'Navigation', icon: '🧭' },
        { id: 'Strategic', label: 'Strategic', icon: '🎯' },
        { id: 'Content', label: 'Content', icon: '📝' },
        { id: 'SEO', label: 'SEO', icon: '🔍' },
        { id: 'SMM', label: 'SMM', icon: '📢' },
        { id: 'Technical', label: 'Technical', icon: '⚙️' },
        { id: 'Linking', label: 'Linking', icon: '🔗' },
        { id: 'Governance', label: 'Governance', icon: '⚖️' }
    ];

    if (viewMode === 'form') {
        return (
            <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden animate-slide-up">
                {/* Full-Frame Header */}
                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white shadow-sm z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode('list')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{editingItem ? `Edit Service: ${editingItem.service_name}` : 'Create New Service'}</h2>
                            <div className="flex items-center text-xs text-slate-500 mt-1">
                                <span className="font-mono bg-slate-100 px-1.5 rounded">{editingItem?.service_code || 'NEW'}</span>
                                <span className="mx-2">•</span>
                                <span>{formData.language?.toUpperCase()}</span>
                                <span className="mx-2">•</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${formData.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {formData.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setViewMode('list')} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Discard</button>
                        <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">Save Service</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 px-6 bg-white flex-shrink-0 z-30">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto space-y-8 pb-20">

                        {/* --- TAB: CORE --- */}
                        {activeTab === 'Core' && (
                            <div className="space-y-6">
                                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-6 tracking-wider flex items-center">
                                        <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded mr-2">💎</span> Identity & Taxonomy
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <Tooltip content="The primary name displayed to users in menus and headers.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Service Name *</label>
                                                    <input type="text" value={formData.service_name} onChange={(e) => { setFormData({ ...formData, service_name: e.target.value }); if (!editingItem && !formData.slug) handleSlugChange(e.target.value); }} className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="Unique internal identifier (e.g., SRV-001) for system referencing.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Service Code</label>
                                                    <input type="text" value={formData.service_code} onChange={(e) => setFormData({ ...formData, service_code: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm transition-all" placeholder="SRV-XXX" />
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="URL-friendly identifier. Auto-generated from name if empty.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Slug</label>
                                                    <input type="text" value={formData.slug} onChange={(e) => handleSlugChange(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-slate-50 transition-all font-mono text-slate-600" />
                                                </div>
                                            </Tooltip>
                                        </div>
                                        <div className="space-y-6">
                                            <Tooltip content="Language code for this specific service version (e.g., en, es).">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Language</label>
                                                    <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                        <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option>
                                                    </select>
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="A detailed description of the service offering used for internal reference and summaries.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                                                    <textarea value={formData.service_description} onChange={(e) => setFormData({ ...formData, service_description: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg h-32 text-sm focus:ring-2 focus:ring-indigo-500 resize-none transition-all" />
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>

                                {/* Master Integrations */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                                        <Tooltip content="Select relevant industries from the Industry Master table. Used for filtering and personalization.">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                                                <span className="bg-purple-100 text-purple-600 p-1 rounded mr-2">🏭</span> Target Industries
                                            </label>
                                            <div className="border border-slate-200 rounded-lg p-2 max-h-48 overflow-y-auto bg-slate-50 grid grid-cols-1 gap-1 flex-1">
                                                {industrySectors.map(ind => (
                                                    <label key={ind.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-white rounded transition-colors group">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.industry_ids?.includes(ind.industry)}
                                                            onChange={() => toggleSelection('industry_ids', ind.industry)}
                                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                                                        />
                                                        <span className="text-sm text-slate-700 group-hover:text-indigo-700 transition-colors">{ind.industry}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                                        <Tooltip content="Select target countries from the Country Master table. Determines regional availability.">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                                                <span className="bg-green-100 text-green-600 p-1 rounded mr-2">🌍</span> Target Countries
                                            </label>
                                            <div className="border border-slate-200 rounded-lg p-2 max-h-48 overflow-y-auto bg-slate-50 grid grid-cols-1 gap-1 flex-1">
                                                {countries.map(c => (
                                                    <label key={c.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-white rounded transition-colors group">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.country_ids?.includes(c.code)}
                                                            onChange={() => toggleSelection('country_ids', c.code)}
                                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                                                        />
                                                        <span className="text-sm text-slate-700 group-hover:text-indigo-700 transition-colors">{c.country_name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: NAVIGATION --- */}
                        {activeTab === 'Navigation' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded mr-2">🧭</span> Menu & Sitemap Configuration
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                                            <Tooltip content="Toggle if this page should appear in the primary navigation menu.">
                                                <label className="flex items-center space-x-3 cursor-pointer group">
                                                    <input type="checkbox" checked={formData.show_in_main_menu} onChange={(e) => setFormData({ ...formData, show_in_main_menu: e.target.checked })} className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300" />
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Show in Main Menu</span>
                                                </label>
                                            </Tooltip>
                                            <Tooltip content="Toggle if this page should appear in the footer links.">
                                                <label className="flex items-center space-x-3 cursor-pointer group">
                                                    <input type="checkbox" checked={formData.show_in_footer_menu} onChange={(e) => setFormData({ ...formData, show_in_footer_menu: e.target.checked })} className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300" />
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Show in Footer</span>
                                                </label>
                                            </Tooltip>
                                            <Tooltip content="Include this page in the auto-generated XML sitemap for search engines.">
                                                <label className="flex items-center space-x-3 cursor-pointer group">
                                                    <input type="checkbox" checked={formData.include_in_xml_sitemap} onChange={(e) => setFormData({ ...formData, include_in_xml_sitemap: e.target.checked })} className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300" />
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Include in XML Sitemap</span>
                                                </label>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <Tooltip content="Grouping label for nested menus (e.g. 'Consulting Services').">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Menu Group</label>
                                                <input type="text" value={formData.menu_group} onChange={(e) => setFormData({ ...formData, menu_group: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Products" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Numeric order for sorting within the menu group.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Menu Position Order</label>
                                                <input type="number" value={formData.menu_position} onChange={(e) => setFormData({ ...formData, menu_position: parseInt(e.target.value) })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Label used in breadcrumb navigation trail.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Breadcrumb Label</label>
                                                <input type="text" value={formData.breadcrumb_label} onChange={(e) => setFormData({ ...formData, breadcrumb_label: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                                    <Tooltip content="Priority hint for search engine crawlers (0.0 to 1.0).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sitemap Priority</label>
                                            <select value={formData.sitemap_priority} onChange={(e) => setFormData({ ...formData, sitemap_priority: parseFloat(e.target.value) })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value={1.0}>1.0 (Highest)</option>
                                                <option value={0.8}>0.8 (High)</option>
                                                <option value={0.5}>0.5 (Medium)</option>
                                                <option value={0.3}>0.3 (Low)</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Expected frequency of page updates.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Change Frequency</label>
                                            <select value={formData.sitemap_changefreq} onChange={(e) => setFormData({ ...formData, sitemap_changefreq: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: STRATEGIC --- */}
                        {activeTab === 'Strategic' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                    <span className="bg-red-100 text-red-600 p-1.5 rounded mr-2">🎯</span> Strategy & Targeting
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Tooltip content="Defines the editorial structure of the page (Linked to Content Type Master).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Content Type</label>
                                            <select value={formData.content_type} onChange={(e) => setFormData({ ...formData, content_type: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                {contentTypes.map(ct => (
                                                    <option key={ct.id} value={ct.content_type}>{ct.content_type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Target stage in the customer funnel.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Buyer Journey Stage</label>
                                            <select value={formData.buyer_journey_stage} onChange={(e) => setFormData({ ...formData, buyer_journey_stage: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option>Awareness</option>
                                                <option>Consideration</option>
                                                <option>Decision</option>
                                                <option>Retention</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Primary Call-to-Action text.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Primary CTA Label</label>
                                            <input type="text" value={formData.primary_cta_label} onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Get Started" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Destination URL for the primary CTA.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Primary CTA URL</label>
                                            <input type="text" value={formData.primary_cta_url} onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="https://..." />
                                        </div>
                                    </Tooltip>
                                </div>

                                <div className="mt-4">
                                    <Tooltip content="Associate this service with active marketing campaigns (Linked to Campaign Master).">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Linked Campaigns</label>
                                        <div className="border border-slate-200 rounded-lg p-4 max-h-40 overflow-y-auto bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {campaigns.map(camp => (
                                                <label key={camp.id} className="flex items-center space-x-2 cursor-pointer bg-white p-2 rounded border border-slate-100 hover:border-indigo-300 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.linked_campaign_ids?.includes(camp.id)}
                                                        onChange={() => toggleSelection('linked_campaign_ids', camp.id)}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                                                    />
                                                    <span className="text-sm text-slate-700 font-medium">{camp.campaign_name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: CONTENT --- */}
                        {activeTab === 'Content' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                    <span className="bg-yellow-100 text-yellow-600 p-1.5 rounded mr-2">📝</span> Content Structure
                                </h3>
                                <div className="space-y-6">
                                    <Tooltip content="The main H1 tag for the page. Essential for SEO.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">H1 Heading</label>
                                            <input type="text" value={formData.h1} onChange={(e) => setFormData({ ...formData, h1: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800" />
                                        </div>
                                    </Tooltip>

                                    <Tooltip content="List of H2 subheadings. Defines the document outline.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">H2 Headings</label>
                                            <div className="flex gap-2 mb-3">
                                                <input type="text" value={tempH2} onChange={(e) => setTempH2(e.target.value)} className="flex-1 p-3 border border-slate-300 rounded-lg text-sm" placeholder="Add H2..." />
                                                <button onClick={() => addToList('h2_list', tempH2, setTempH2)} className="bg-indigo-50 text-indigo-600 px-6 rounded-lg font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors">+</button>
                                            </div>
                                            <ul className="space-y-2">
                                                {formData.h2_list?.map((h, i) => (
                                                    <li key={i} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                        <span className="font-medium text-slate-700">{h}</span>
                                                        <button onClick={() => removeFromList('h2_list', i)} className="text-slate-400 hover:text-red-500 font-bold p-1 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Tooltip>

                                    <Tooltip content="Main body copy. Supports Markdown formatting.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Body Content</label>
                                            <textarea value={formData.body_content} onChange={(e) => setFormData({ ...formData, body_content: e.target.value })} className="w-full p-4 border border-slate-300 rounded-lg h-96 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500" placeholder="# Write content here..." />
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: SEO --- */}
                        {activeTab === 'SEO' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <header className="flex flex-col gap-1">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Search Engine Optimization</p>
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <span className="text-green-600">🔍</span> Organic Visibility Controls
                                    </h3>
                                </header>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="p-5 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-green-50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wide text-green-600">Meta Title</span>
                                            <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${((formData.meta_title?.length || 0) > 60) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {formData.meta_title?.length || 0}/60
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.meta_title}
                                            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                            className="w-full p-3 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-slate-300"
                                            placeholder="e.g. Enterprise Marketing Solutions"
                                        />
                                    </div>

                                    <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 lg:col-span-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Meta Description</span>
                                            <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${((formData.meta_description?.length || 0) > 160) ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                                                {formData.meta_description?.length || 0}/160
                                            </span>
                                        </div>
                                        <textarea
                                            value={formData.meta_description}
                                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none placeholder:text-slate-400 leading-relaxed h-28"
                                            placeholder="High-level promise plus differentiator for this service..."
                                        />
                                    </div>

                                    <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 lg:col-span-3">
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Focus Keywords</p>
                                                <p className="text-xs text-slate-500">Primary phrases we actively monitor</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={handleKeywordSuggest} className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-white transition">AI Suggest</button>
                                                <span className="text-[10px] font-mono text-slate-400">{formData.focus_keywords?.length || 0} tracked</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={tempKeyword}
                                                onChange={(e) => setTempKeyword(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addToList('focus_keywords', tempKeyword, setTempKeyword)}
                                                className="flex-1 p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="Add focus keyword..."
                                            />
                                            <button
                                                onClick={() => addToList('focus_keywords', tempKeyword, setTempKeyword)}
                                                className="bg-green-600 text-white px-4 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center shrink-0"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-lg p-4 min-h-[160px] grid gap-3 lg:grid-cols-2">
                                            {formData.focus_keywords && formData.focus_keywords.length > 0 ? (
                                                formData.focus_keywords.map((k, idx) => (
                                                    <div key={`${k}-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-green-200 transition-colors">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">{k}</p>
                                                            <p className="text-[11px] text-slate-500 font-mono">{getKeywordMetric(k)}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromList('focus_keywords', idx)}
                                                            className="text-slate-300 hover:text-red-500 transition-colors font-bold"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="lg:col-span-2 h-full flex flex-col items-center justify-center text-slate-400 text-sm italic min-h-[120px]">
                                                    <span className="opacity-50 text-4xl mb-2">🏷️</span>
                                                    No keywords added.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Secondary Keywords</p>
                                                <p className="text-xs text-slate-500">Semantic helpers & support terms</p>
                                            </div>
                                            <button onClick={handleSecondaryKeywordSuggest} className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition">AI Suggest</button>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={tempSecondaryKeyword}
                                                onChange={(e) => setTempSecondaryKeyword(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword)}
                                                className="flex-1 p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Add supporting keyword..."
                                            />
                                            <button
                                                onClick={() => addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword)}
                                                className="bg-indigo-600 text-white px-4 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center shrink-0"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 min-h-[140px] overflow-y-auto space-y-2">
                                            {formData.secondary_keywords && formData.secondary_keywords.length > 0 ? (
                                                formData.secondary_keywords.map((k, idx) => (
                                                    <div key={`${k}-${idx}`} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-700">{k}</p>
                                                            <p className="text-[11px] text-slate-400 font-mono">{getKeywordMetric(k)}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromList('secondary_keywords', idx)}
                                                            className="text-slate-300 hover:text-red-500 transition-colors font-bold"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-500 text-center py-6">No secondary keywords yet.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-5">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">SEO Score</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={100}
                                                    value={formData.seo_score ?? 0}
                                                    onChange={(e) => setFormData({ ...formData, seo_score: parseInt(e.target.value) })}
                                                    className="flex-1 accent-green-500"
                                                />
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={formData.seo_score ?? 0}
                                                    onChange={(e) => setFormData({ ...formData, seo_score: parseInt(e.target.value) })}
                                                    className="w-16 p-2 border border-slate-200 rounded text-center font-mono text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-2">Ranking Summary</p>
                                            <textarea
                                                value={formData.ranking_summary}
                                                onChange={(e) => setFormData({ ...formData, ranking_summary: e.target.value })}
                                                className="w-full p-3 border border-slate-200 rounded-lg text-sm h-32 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Capture SERP positions, rich snippets, competitive notes..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: SMM --- */}
                        {activeTab === 'SMM' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                    <span className="bg-pink-100 text-pink-600 p-1.5 rounded mr-2">📢</span> Social Media Metadata
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Tooltip content="Open Graph Title (Facebook, LinkedIn). Defaults to SEO Title if empty.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">OG Title</label>
                                                <input type="text" value={formData.og_title} onChange={(e) => setFormData({ ...formData, og_title: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Twitter Card Title. Defaults to OG Title if empty.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Twitter Title</label>
                                                <input type="text" value={formData.twitter_title} onChange={(e) => setFormData({ ...formData, twitter_title: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Tooltip content="Open Graph Description.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">OG Description</label>
                                                <textarea value={formData.og_description} onChange={(e) => setFormData({ ...formData, og_description: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg h-24 text-sm resize-none" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Twitter Card Description.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Twitter Description</label>
                                                <textarea value={formData.twitter_description} onChange={(e) => setFormData({ ...formData, twitter_description: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg h-24 text-sm resize-none" />
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <Tooltip content="URL of the image to display on social shares.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Social Share Image URL</label>
                                            <input type="text" value={formData.og_image_url} onChange={(e) => setFormData({ ...formData, og_image_url: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono text-slate-600" placeholder="https://..." />
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: TECHNICAL --- */}
                        {activeTab === 'Technical' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                    <span className="bg-gray-100 text-gray-600 p-1.5 rounded mr-2">⚙️</span> Technical SEO Configuration
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Tooltip content="Schema.org type (e.g. Service, Product, Article).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Schema Type</label>
                                            <input type="text" value={formData.schema_type_id} onChange={(e) => setFormData({ ...formData, schema_type_id: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="Service" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Canonical URL to prevent duplicate content issues.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Canonical URL</label>
                                            <input type="text" value={formData.canonical_url} onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono text-slate-600" placeholder="https://..." />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Robots meta tag indexing instruction.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Robots Index</label>
                                            <select value={formData.robots_index} onChange={(e) => setFormData({ ...formData, robots_index: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value="index">Index</option>
                                                <option value="noindex">No Index</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Robots meta tag following instruction.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Robots Follow</label>
                                            <select value={formData.robots_follow} onChange={(e) => setFormData({ ...formData, robots_follow: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value="follow">Follow</option>
                                                <option value="nofollow">No Follow</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                </div>

                                <div className="mt-4">
                                    <Tooltip content="List of URLs that should 301 redirect to this service page.">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">301 Redirects (From)</label>
                                        <div className="flex gap-2 mb-3">
                                            <input type="text" value={tempRedirect} onChange={(e) => setTempRedirect(e.target.value)} className="flex-1 p-3 border border-slate-300 rounded-lg text-sm" placeholder="/old-url" />
                                            <button onClick={() => addToList('redirect_from_urls', tempRedirect, setTempRedirect)} className="bg-slate-100 text-slate-600 px-6 rounded-lg font-bold border border-slate-200 hover:bg-slate-200 transition-colors">+</button>
                                        </div>
                                        <ul className="space-y-2">
                                            {formData.redirect_from_urls?.map((url, i) => (
                                                <li key={i} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                    <span className="font-mono text-slate-600">{url}</span>
                                                    <button onClick={() => removeFromList('redirect_from_urls', i)} className="text-slate-400 hover:text-red-500 font-bold p-1 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </Tooltip>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: LINKING (ASSETS) --- */}
                        {activeTab === 'Linking' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded mr-2">🔗</span> Asset Management
                                </h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Left: Linked Assets */}
                                    <div className="flex flex-col h-[600px]">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex justify-between items-center">
                                            <span>Attached Assets</span>
                                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{linkedAssets.length}</span>
                                        </h4>
                                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-3 space-y-3">
                                            {linkedAssets.length > 0 ? linkedAssets.map(asset => (
                                                <div key={asset.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors group">
                                                    <div className="flex items-center space-x-3 overflow-hidden">
                                                        <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm ${asset.asset_format === 'image' ? 'bg-purple-500' : 'bg-blue-500'
                                                            }`}>
                                                            {asset.asset_type ? asset.asset_type.slice(0, 2) : 'NA'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-sm text-slate-800 truncate" title={asset.content_title_clean}>{asset.content_title_clean}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mt-0.5">{asset.status}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleAssetLink(asset)}
                                                        className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Unlink Asset"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            )) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                                    <p className="text-sm italic">No assets linked.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Available Assets */}
                                    <div className="flex flex-col h-[600px]">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Add Assets from Library</h4>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                placeholder="Search repository..."
                                                value={assetSearch}
                                                onChange={(e) => setAssetSearch(e.target.value)}
                                                className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-white p-3 space-y-3">
                                            {availableAssets.length > 0 ? availableAssets.map(asset => (
                                                <div key={asset.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-colors group cursor-pointer" onClick={() => handleToggleAssetLink(asset)}>
                                                    <div className="flex items-center space-x-3 overflow-hidden">
                                                        <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold uppercase">
                                                            {asset.asset_type ? asset.asset_type.slice(0, 2) : 'NA'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-sm text-slate-700 truncate">{asset.content_title_clean}</p>
                                                            <p className="text-[10px] text-slate-400 mt-0.5">ID: {asset.id}</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-indigo-600 opacity-0 group-hover:opacity-100 text-xs font-bold bg-indigo-50 px-3 py-1.5 rounded transition-all">
                                                        Link
                                                    </button>
                                                </div>
                                            )) : (
                                                <div className="p-10 text-center text-sm text-slate-400">
                                                    {assetSearch ? 'No matching assets found.' : 'Search to find assets.'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: GOVERNANCE --- */}
                        {activeTab === 'Governance' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                    <span className="bg-teal-100 text-teal-600 p-1.5 rounded mr-2">⚖️</span> Governance & Metadata
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Tooltip content="Select the brand this service belongs to from the Brand Master.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Brand</label>
                                            <select value={formData.brand_id} onChange={(e) => setFormData({ ...formData, brand_id: parseInt(e.target.value) })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                <option value={0}>Select Brand...</option>
                                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Person responsible for maintaining this service content.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Content Owner</label>
                                            <select value={formData.content_owner_id} onChange={(e) => setFormData({ ...formData, content_owner_id: parseInt(e.target.value) })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                <option value={0}>Select Owner...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Current lifecycle status of the service page.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                <option>Draft</option><option>Published</option><option>Archived</option><option>In Progress</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Created At</label>
                                        <input type="text" value={formData.created_at ? new Date(formData.created_at).toLocaleDateString() : '-'} readOnly className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-sm font-mono" />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in w-full h-full overflow-y-auto p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Service Master</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage service offerings, metadata, content structures, and connectivity.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={handleExport} className="text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors hover:bg-slate-50">Export</button>
                    <button onClick={handleCreateClick} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center">
                        <span className="mr-1 text-lg">+</span> Add Service
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input type="search" className="block w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[140px]">
                        <option>All Status</option>
                        <option>Published</option>
                        <option>Draft</option>
                        <option>Archived</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <Table
                    columns={[
                        {
                            header: 'Service Code',
                            accessor: (item: Service) => (
                                <Tooltip content="Internal ID">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 text-xs">{item.service_code}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">{item.language}</span>
                                    </div>
                                </Tooltip>
                            ),
                            className: "font-mono w-24"
                        },
                        {
                            header: 'Service Name',
                            accessor: (item: Service) => (
                                <div>
                                    <div className="font-bold text-slate-800 text-sm hover:text-indigo-600 transition-colors">{item.service_name}</div>
                                    <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{item.full_url}</div>
                                </div>
                            )
                        },
                        { header: 'Type', accessor: 'content_type' as keyof Service, className: "text-xs text-slate-600 font-medium" },
                        {
                            header: 'Linked Assets',
                            accessor: (item: Service) => {
                                const count = contentAssets.filter(a => a.linked_service_ids?.includes(item.id)).length;
                                return (
                                    <Tooltip content="Number of assets linked to this service">
                                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-100">{count}</span>
                                    </Tooltip>
                                );
                            },
                            className: "text-center"
                        },
                        { header: 'Status', accessor: (item: Service) => getStatusBadge(item.status) },
                        {
                            header: 'Actions',
                            accessor: (item: Service) => (
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(item)} className="text-slate-500 hover:text-indigo-600 font-medium text-xs transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-600 font-medium text-xs transition-colors">Delete</button>
                                </div>
                            )
                        }
                    ]}
                    data={filteredData}
                    title={`Service Registry (${filteredData.length})`}
                />
            </div>
        </div>
    );
};

export default ServiceMasterView;

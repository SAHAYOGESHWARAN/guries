import React, { useState, useMemo } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import { getStatusBadge, SparkIcon } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type {
    Service, SubServiceItem, ContentRepositoryItem, Keyword, ContentTypeItem,
    Brand, User, IndustrySectorItem, CountryMasterItem, PersonaMasterItem, FormMasterItem
} from '../types';
import { runQuery } from '../utils/gemini';

const STATUSES = ['All Status', 'Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'];

const ServiceMasterView: React.FC = () => {
    const { data: services, create, update, remove } = useData<Service>('services');
    const { data: subServices } = useData<SubServiceItem>('subServices');
    const { data: contentAssets, update: updateContentAsset } = useData<ContentRepositoryItem>('content');
    const { data: keywordsMaster } = useData<Keyword>('keywords');
    const { data: contentTypes } = useData<ContentTypeItem>('contentTypes');
    const { data: brands } = useData<Brand>('brands');
    const { data: users } = useData<User>('users');
    const { data: industrySectors } = useData<IndustrySectorItem>('industrySectors');
    const { data: countries } = useData<CountryMasterItem>('countries');
    const { data: personas } = useData<PersonaMasterItem>('personas');
    const { data: forms } = useData<FormMasterItem>('forms');

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [activeTab, setActiveTab] = useState<'Core' | 'Navigation' | 'Strategic' | 'Content' | 'SEO' | 'SMM' | 'Technical' | 'Linking' | 'Governance'>('Core');
    const [editingItem, setEditingItem] = useState<Service | null>(null);
    const [isAiSuggesting, setIsAiSuggesting] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);

    // Asset Search
    const [assetSearch, setAssetSearch] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Service>>({
        service_name: '', service_code: '', slug: '', full_url: '', menu_heading: '', short_tagline: '',
        service_description: '', status: 'Draft', language: 'en',
        industry_ids: [], country_ids: [],
        h1: '', h2_list: [], h3_list: [], h4_list: [], h5_list: [], body_content: '',
        meta_title: '', meta_description: '', focus_keywords: [], secondary_keywords: [],
        og_title: '', og_description: '', og_image_url: '', og_type: 'website',
        twitter_title: '', twitter_description: '', twitter_image_url: '',
        linkedin_title: '', linkedin_description: '', linkedin_image_url: '',
        facebook_title: '', facebook_description: '', facebook_image_url: '',
        instagram_title: '', instagram_description: '', instagram_image_url: '',
        show_in_main_menu: false, show_in_footer_menu: false, menu_position: 0,
        include_in_xml_sitemap: true, sitemap_priority: 0.8, sitemap_changefreq: 'monthly',
        content_type: 'Pillar', buyer_journey_stage: 'Awareness',
        robots_index: 'index', robots_follow: 'follow', schema_type_id: 'Service',
        brand_id: 0, content_owner_id: 0, has_subservices: false,
        faq_section_enabled: false, faq_content: []
    });

    // Helpers
    const [tempH2, setTempH2] = useState('');
    const [tempH3, setTempH3] = useState('');
    const [tempH4, setTempH4] = useState('');
    const [tempKeyword, setTempKeyword] = useState('');
    const [tempSecondaryKeyword, setTempSecondaryKeyword] = useState('');
    const [tempFaqQuestion, setTempFaqQuestion] = useState('');
    const [tempFaqAnswer, setTempFaqAnswer] = useState('');

    const filteredData = services.filter(item => {
        const matchesSearch = item.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
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
            .slice(0, 10);
    }, [contentAssets, editingItem, assetSearch]);

    const linkedSubServices = useMemo(() => {
        if (!editingItem) return [];
        return subServices.filter(s => s.parent_service_id === editingItem.id);
    }, [subServices, editingItem]);

    const handleCreateClick = () => {
        resetForm();
        setEditingItem(null);
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
            faq_content: item.faq_content || []
        });
        setActiveTab('Core');
        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this service? This will affect linked sub-services and assets.')) await remove(id);
    };

    const handleSave = async () => {
        if (!formData.service_name) return alert("Service Name is required");

        const now = new Date().toISOString();
        const payload = {
            ...formData,
            updated_at: now,
            subservice_count: linkedSubServices.length,
            asset_count: linkedAssets.length
        };

        if (editingItem) {
            await update(editingItem.id, payload);
        } else {
            payload.created_at = now;
            await create(payload as any);
        }
        setViewMode('list');
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            service_name: '', service_code: '', slug: '', full_url: '', menu_heading: '', short_tagline: '',
            service_description: '', status: 'Draft', language: 'en',
            industry_ids: [], country_ids: [],
            h1: '', h2_list: [], h3_list: [], h4_list: [], h5_list: [], body_content: '',
            meta_title: '', meta_description: '', focus_keywords: [], secondary_keywords: [],
            og_title: '', og_description: '', og_image_url: '', og_type: 'website',
            twitter_title: '', twitter_description: '', twitter_image_url: '',
            linkedin_title: '', linkedin_description: '', linkedin_image_url: '',
            facebook_title: '', facebook_description: '', facebook_image_url: '',
            instagram_title: '', instagram_description: '', instagram_image_url: '',
            show_in_main_menu: false, show_in_footer_menu: false, menu_position: 0,
            include_in_xml_sitemap: true, sitemap_priority: 0.8, sitemap_changefreq: 'monthly',
            content_type: 'Pillar', buyer_journey_stage: 'Awareness',
            robots_index: 'index', robots_follow: 'follow', schema_type_id: 'Service',
            brand_id: 0, content_owner_id: 0, has_subservices: false,
            faq_section_enabled: false, faq_content: []
        });
        setActiveTab('Core');
    };

    const handleSlugChange = (val: string) => {
        const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        setFormData((prev: any) => ({ ...prev, slug, full_url: `/services/${slug}` }));
    };

    const handleCopyFullUrl = () => {
        if (!formData.full_url) return;
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            alert('Clipboard API unavailable in this environment.');
            return;
        }
        navigator.clipboard.writeText(formData.full_url)
            .then(() => {
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 1500);
            })
            .catch(() => alert('Unable to copy URL to clipboard.'));
    };

    const toggleSelection = (field: 'industry_ids' | 'country_ids' | 'secondary_persona_ids', value: any) => {
        const current = (formData[field] as any[]) || [];
        const updated = current.includes(value)
            ? current.filter((v: any) => v !== value)
            : [...current, value];
        setFormData({ ...formData, [field]: updated });
    };

    const addToList = (field: string, value: string, setter: any) => {
        if (!value.trim()) return;
        setFormData((prev: any) => ({
            ...prev,
            [field]: [...(prev[field] as string[] || []), value]
        }));
        setter('');
    };

    const removeFromList = (field: string, index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: (prev[field] as string[]).filter((_, i) => i !== index)
        }));
    };

    const addFaq = () => {
        if (!tempFaqQuestion.trim() || !tempFaqAnswer.trim()) return;
        setFormData((prev: any) => ({
            ...prev,
            faq_content: [...(prev.faq_content || []), { question: tempFaqQuestion, answer: tempFaqAnswer }]
        }));
        setTempFaqQuestion('');
        setTempFaqAnswer('');
    };

    const removeFaq = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            faq_content: (prev.faq_content || []).filter((_: any, i: number) => i !== index)
        }));
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

    const handleAiSuggest = async () => {
        if (!formData.service_name) return alert("Enter Service Name first");
        setIsAiSuggesting(true);
        try {
            const prompt = `Generate comprehensive content structure for a service page named "${formData.service_name}".
            Return JSON: { "h1": "...", "description": "...", "h2s": ["..."], "h3s": ["..."], "meta_title": "...", "meta_description": "...", "focus_keywords": ["..."], "faqs": [{"question": "...", "answer": "..."}] }`;
            const res = await runQuery(prompt, { model: 'gemini-2.0-flash-exp' });
            const jsonMatch = res.text.match(/\{[\s\S]*\}/);
            const json = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

            if (json.h1) {
                setFormData((prev: any) => ({
                    ...prev,
                    h1: json.h1,
                    service_description: json.description || prev.service_description,
                    h2_list: json.h2s || [],
                    h3_list: json.h3s || [],
                    meta_title: json.meta_title,
                    meta_description: json.meta_description,
                    focus_keywords: json.focus_keywords || [],
                    faq_content: json.faqs || []
                }));
            }
        } catch (e) { alert("AI Suggestion failed."); }
        finally { setIsAiSuggesting(false); }
    };

    const getKeywordMetric = (kw: string) => {
        const masterRecord = keywordsMaster.find(k => k.keyword.toLowerCase() === kw.toLowerCase());
        const vol = masterRecord ? masterRecord.search_volume.toLocaleString() : 'N/A';
        const comp = masterRecord ? masterRecord.competition : '-';
        return `Vol: ${vol} | Comp: ${comp}`;
    };

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
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white shadow-sm z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode('list')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{editingItem ? `Edit Service: ${editingItem.service_name}` : 'Create New Service'}</h2>
                            <p className="text-xs text-slate-500">Comprehensive service master with SEO, SMM, and content management.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setViewMode('list')} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Discard</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors">Save Changes</button>
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto space-y-8 pb-20">
                        {/* CORE TAB */}
                        {activeTab === 'Core' && (
                            <div className="space-y-6">
                                {/* Core Identification Section */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-200 px-8 py-5">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                                            <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3 text-base">💎</span>
                                            <span>Core Identification</span>
                                        </h3>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        {/* Identity Fields */}
                                        <div className="grid gap-6 lg:grid-cols-3">
                                            <Tooltip content="Unique service name displayed across the platform">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2.5 tracking-wide">Service Name <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        value={formData.service_name}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, service_name: e.target.value });
                                                            if (!editingItem) handleSlugChange(e.target.value);
                                                        }}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="e.g., Technical SEO Audit"
                                                    />
                                                </div>
                                            </Tooltip>

                                            <Tooltip content="Short internal code for reference (e.g., SRV-SEO-01)">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2.5 tracking-wide">Service Code</label>
                                                    <input
                                                        type="text"
                                                        value={formData.service_code}
                                                        onChange={(e) => setFormData({ ...formData, service_code: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="SRV-SEO-01"
                                                    />
                                                </div>
                                            </Tooltip>

                                            <Tooltip content="URL-friendly slug (auto-generated from service name)">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2.5 tracking-wide">Slug</label>
                                                    <input
                                                        type="text"
                                                        value={formData.slug}
                                                        onChange={(e) => handleSlugChange(e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                                                        placeholder="technical-seo-audit"
                                                    />
                                                </div>
                                            </Tooltip>
                                        </div>

                                        {/* Full URL Display */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
                                            <label className="block text-xs font-bold text-blue-900 uppercase mb-2 tracking-wide">Full URL</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={formData.full_url}
                                                    readOnly
                                                    className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg text-sm font-mono bg-white text-blue-900"
                                                />
                                                <button
                                                    onClick={handleCopyFullUrl}
                                                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold"
                                                >
                                                    {copiedUrl ? '✓ Copied' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Menu & Display Fields */}
                                        <div className="grid gap-6 lg:grid-cols-2">
                                            <Tooltip content="Text used in navigation menus (can be shorter than service name)">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2.5 tracking-wide">Menu Heading</label>
                                                    <input
                                                        type="text"
                                                        value={formData.menu_heading}
                                                        onChange={(e) => setFormData({ ...formData, menu_heading: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="SEO Audit"
                                                    />
                                                </div>
                                            </Tooltip>

                                            <Tooltip content="One-line pitch used in cards and listings">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2.5 tracking-wide">Short Tagline</label>
                                                    <input
                                                        type="text"
                                                        value={formData.short_tagline}
                                                        onChange={(e) => setFormData({ ...formData, short_tagline: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="Comprehensive technical SEO analysis"
                                                    />
                                                </div>
                                            </Tooltip>
                                        </div>

                                        {/* Service Description */}
                                        <Tooltip content="Core description of the service (what & why)">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase mb-2.5 tracking-wide">Service Description</label>
                                                <textarea
                                                    value={formData.service_description}
                                                    onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                                                    rows={5}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Detailed description of what this service offers and why it matters..."
                                                />
                                            </div>
                                        </Tooltip>

                                        {/* Status & Language */}
                                        <div className="grid gap-6 lg:grid-cols-3">
                                            <Tooltip content="Current status of this service">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2.5 tracking-wide">Status</label>
                                                    <select
                                                        value={formData.status}
                                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        {STATUSES.filter(s => s !== 'All Status').map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                            </Tooltip>

                                            <Tooltip content="Primary language for this service">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2.5 tracking-wide">Language</label>
                                                    <select
                                                        value={formData.language}
                                                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        <option value="en">English (en)</option>
                                                        <option value="en-IN">English India (en-IN)</option>
                                                        <option value="en-US">English US (en-US)</option>
                                                        <option value="en-GB">English UK (en-GB)</option>
                                                    </select>
                                                </div>
                                            </Tooltip>

                                            <Tooltip content="AI-powered content suggestions">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2.5 tracking-wide">AI Assistant</label>
                                                    <button
                                                        onClick={handleAiSuggest}
                                                        disabled={isAiSuggesting}
                                                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        {isAiSuggesting ? (
                                                            <>
                                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <SparkIcon className="w-4 h-4" />
                                                                AI Suggest
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </Tooltip>
                                        </div>

                                        {/* Master Integrations */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                                <div className="bg-gradient-to-r from-purple-50 to-slate-50 border-b border-slate-200 px-6 py-4">
                                                    <Tooltip content="Select relevant industries from the Industry Master table">
                                                        <label className="block text-xs font-bold text-slate-700 uppercase flex items-center tracking-wide">
                                                            <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mr-3 text-base">🏭</span>
                                                            <span>Target Industries</span>
                                                        </label>
                                                    </Tooltip>
                                                </div>
                                                <div className="p-4 flex-1">
                                                    <div className="border border-slate-200 rounded-lg p-3 max-h-64 overflow-y-auto bg-slate-50 space-y-1.5">
                                                        {industrySectors.map(ind => (
                                                            <label key={ind.id} className="flex items-center space-x-3 cursor-pointer p-2.5 hover:bg-white rounded-lg transition-all group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.industry_ids?.includes(ind.industry)}
                                                                    onChange={() => toggleSelection('industry_ids', ind.industry)}
                                                                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                                                                />
                                                                <span className="text-sm text-slate-700 group-hover:text-indigo-700 transition-colors font-medium">{ind.industry}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                                <div className="bg-gradient-to-r from-green-50 to-slate-50 border-b border-slate-200 px-6 py-4">
                                                    <Tooltip content="Select target countries from the Country Master table">
                                                        <label className="block text-xs font-bold text-slate-700 uppercase flex items-center tracking-wide">
                                                            <span className="bg-green-100 text-green-600 p-1.5 rounded-lg mr-3 text-base">🌍</span>
                                                            <span>Target Countries</span>
                                                        </label>
                                                    </Tooltip>
                                                </div>
                                                <div className="p-4 flex-1">
                                                    <div className="border border-slate-200 rounded-lg p-3 max-h-64 overflow-y-auto bg-slate-50 space-y-1.5">
                                                        {countries.map(c => (
                                                            <label key={c.id} className="flex items-center space-x-3 cursor-pointer p-2.5 hover:bg-white rounded-lg transition-all group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.country_ids?.includes(c.code)}
                                                                    onChange={() => toggleSelection('country_ids', c.code)}
                                                                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                                                                />
                                                                <span className="text-sm text-slate-700 group-hover:text-indigo-700 transition-colors font-medium">{c.country_name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NAVIGATION TAB */}
                        {activeTab === 'Navigation' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center">
                                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">🧭</span>
                                    Navigation Configuration
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.show_in_main_menu}
                                                onChange={(e) => setFormData({ ...formData, show_in_main_menu: e.target.checked })}
                                                className="rounded text-indigo-600 h-5 w-5"
                                            />
                                            <span className="text-sm font-medium">Show in Main Menu</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.show_in_footer_menu}
                                                onChange={(e) => setFormData({ ...formData, show_in_footer_menu: e.target.checked })}
                                                className="rounded text-indigo-600 h-5 w-5"
                                            />
                                            <span className="text-sm font-medium">Show in Footer Menu</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Menu Group</label>
                                        <input
                                            type="text"
                                            value={formData.menu_group}
                                            onChange={(e) => setFormData({ ...formData, menu_group: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            placeholder="Services"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Menu Position</label>
                                        <input
                                            type="number"
                                            value={formData.menu_position}
                                            onChange={(e) => setFormData({ ...formData, menu_position: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Breadcrumb Label</label>
                                        <input
                                            type="text"
                                            value={formData.breadcrumb_label}
                                            onChange={(e) => setFormData({ ...formData, breadcrumb_label: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-4">Sitemap Settings</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="flex items-center space-x-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.include_in_xml_sitemap}
                                                    onChange={(e) => setFormData({ ...formData, include_in_xml_sitemap: e.target.checked })}
                                                    className="rounded text-indigo-600 h-5 w-5"
                                                />
                                                <span className="text-sm font-medium">Include in XML Sitemap</span>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Priority (0.0-1.0)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="1"
                                                value={formData.sitemap_priority}
                                                onChange={(e) => setFormData({ ...formData, sitemap_priority: parseFloat(e.target.value) })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Change Frequency</label>
                                            <select
                                                value={formData.sitemap_changefreq}
                                                onChange={(e) => setFormData({ ...formData, sitemap_changefreq: e.target.value as any })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STRATEGIC TAB */}
                        {activeTab === 'Strategic' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center">
                                    <span className="bg-red-100 text-red-600 p-2 rounded-lg mr-3">🎯</span>
                                    Strategic Mapping
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Content Type</label>
                                        <select
                                            value={formData.content_type}
                                            onChange={(e) => setFormData({ ...formData, content_type: e.target.value as any })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        >
                                            {contentTypes.map(ct => <option key={ct.id} value={ct.content_type}>{ct.content_type}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Buyer Journey Stage</label>
                                        <select
                                            value={formData.buyer_journey_stage}
                                            onChange={(e) => setFormData({ ...formData, buyer_journey_stage: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        >
                                            <option value="Awareness">Awareness</option>
                                            <option value="Consideration">Consideration</option>
                                            <option value="Decision">Decision</option>
                                            <option value="Retention">Retention</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Primary Persona</label>
                                        <select
                                            value={formData.primary_persona_id}
                                            onChange={(e) => setFormData({ ...formData, primary_persona_id: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        >
                                            <option value={0}>Select Persona...</option>
                                            {personas.map(p => <option key={p.id} value={p.id}>{p.persona_name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Form</label>
                                        <select
                                            value={formData.form_id}
                                            onChange={(e) => setFormData({ ...formData, form_id: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        >
                                            <option value={0}>Select Form...</option>
                                            {forms.map(f => <option key={f.id} value={f.id}>{f.form_name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Primary CTA Label</label>
                                        <input
                                            type="text"
                                            value={formData.primary_cta_label}
                                            onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            placeholder="Book a Call"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Primary CTA URL</label>
                                        <input
                                            type="text"
                                            value={formData.primary_cta_url}
                                            onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            placeholder="/contact"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Target Segment Notes</label>
                                    <textarea
                                        value={formData.target_segment_notes}
                                        onChange={(e) => setFormData({ ...formData, target_segment_notes: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Notes on ICP (industry size, geos, ticket size)..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* CONTENT TAB */}
                        {activeTab === 'Content' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center">
                                    <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">📝</span>
                                    Content Block
                                </h3>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">H1 Heading</label>
                                    <input
                                        type="text"
                                        value={formData.h1}
                                        onChange={(e) => setFormData({ ...formData, h1: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Main page heading"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">H2 Headings</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={tempH2}
                                            onChange={(e) => setTempH2(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addToList('h2_list', tempH2, setTempH2)}
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                            placeholder="Add H2 heading..."
                                        />
                                        <button
                                            onClick={() => addToList('h2_list', tempH2, setTempH2)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(formData.h2_list || []).map((h2, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                                                <span className="flex-1 text-sm">{h2}</span>
                                                <button
                                                    onClick={() => removeFromList('h2_list', i)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-bold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">H3 Headings</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={tempH3}
                                            onChange={(e) => setTempH3(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addToList('h3_list', tempH3, setTempH3)}
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                            placeholder="Add H3 heading..."
                                        />
                                        <button
                                            onClick={() => addToList('h3_list', tempH3, setTempH3)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(formData.h3_list || []).map((h3, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                                                <span className="flex-1 text-sm">{h3}</span>
                                                <button
                                                    onClick={() => removeFromList('h3_list', i)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-bold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Body Content</label>
                                    <textarea
                                        value={formData.body_content}
                                        onChange={(e) => setFormData({ ...formData, body_content: e.target.value })}
                                        rows={10}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-mono"
                                        placeholder="Main content block (HTML/Markdown)..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* SEO TAB */}
                        {activeTab === 'SEO' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center">
                                    <span className="bg-yellow-100 text-yellow-600 p-2 rounded-lg mr-3">🔍</span>
                                    SEO Metadata
                                </h3>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Meta Title</label>
                                    <input
                                        type="text"
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        placeholder="SEO meta title (50-60 characters)"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{(formData.meta_title || '').length} / 60 characters</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Meta Description</label>
                                    <textarea
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        placeholder="SEO meta description (150-160 characters)"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{(formData.meta_description || '').length} / 160 characters</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Focus Keywords</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={tempKeyword}
                                            onChange={(e) => setTempKeyword(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addToList('focus_keywords', tempKeyword, setTempKeyword)}
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                            placeholder="Add focus keyword..."
                                        />
                                        <button
                                            onClick={() => addToList('focus_keywords', tempKeyword, setTempKeyword)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(formData.focus_keywords || []).map((kw, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                                                <span className="flex-1 text-sm font-medium">{kw}</span>
                                                <span className="text-xs text-slate-500">{getKeywordMetric(kw)}</span>
                                                <button
                                                    onClick={() => removeFromList('focus_keywords', i)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-bold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Secondary Keywords</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={tempSecondaryKeyword}
                                            onChange={(e) => setTempSecondaryKeyword(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword)}
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                            placeholder="Add secondary keyword..."
                                        />
                                        <button
                                            onClick={() => addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(formData.secondary_keywords || []).map((kw, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                                                <span className="flex-1 text-sm">{kw}</span>
                                                <button
                                                    onClick={() => removeFromList('secondary_keywords', i)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-bold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SMM TAB */}
                        {activeTab === 'SMM' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center">
                                    <span className="bg-pink-100 text-pink-600 p-2 rounded-lg mr-3">📢</span>
                                    Social Media Meta (Default)
                                </h3>

                                {/* Open Graph */}
                                <div className="border-b pb-6">
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-4">Open Graph (Default)</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">OG Title</label>
                                            <input
                                                type="text"
                                                value={formData.og_title}
                                                onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">OG Description</label>
                                            <textarea
                                                value={formData.og_description}
                                                onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">OG Image URL</label>
                                            <input
                                                type="text"
                                                value={formData.og_image_url}
                                                onChange={(e) => setFormData({ ...formData, og_image_url: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Twitter */}
                                <div className="border-b pb-6">
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-4">Twitter</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Twitter Title</label>
                                            <input
                                                type="text"
                                                value={formData.twitter_title}
                                                onChange={(e) => setFormData({ ...formData, twitter_title: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Twitter Description</label>
                                            <textarea
                                                value={formData.twitter_description}
                                                onChange={(e) => setFormData({ ...formData, twitter_description: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Twitter Image URL</label>
                                            <input
                                                type="text"
                                                value={formData.twitter_image_url}
                                                onChange={(e) => setFormData({ ...formData, twitter_image_url: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* LinkedIn */}
                                <div className="border-b pb-6">
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-4">LinkedIn</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">LinkedIn Title</label>
                                            <input
                                                type="text"
                                                value={formData.linkedin_title}
                                                onChange={(e) => setFormData({ ...formData, linkedin_title: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">LinkedIn Description</label>
                                            <textarea
                                                value={formData.linkedin_description}
                                                onChange={(e) => setFormData({ ...formData, linkedin_description: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">LinkedIn Image URL</label>
                                            <input
                                                type="text"
                                                value={formData.linkedin_image_url}
                                                onChange={(e) => setFormData({ ...formData, linkedin_image_url: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Facebook */}
                                <div className="border-b pb-6">
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-4">Facebook</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Facebook Title</label>
                                            <input
                                                type="text"
                                                value={formData.facebook_title}
                                                onChange={(e) => setFormData({ ...formData, facebook_title: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Facebook Description</label>
                                            <textarea
                                                value={formData.facebook_description}
                                                onChange={(e) => setFormData({ ...formData, facebook_description: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Facebook Image URL</label>
                                            <input
                                                type="text"
                                                value={formData.facebook_image_url}
                                                onChange={(e) => setFormData({ ...formData, facebook_image_url: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Instagram */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-4">Instagram</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Instagram Title</label>
                                            <input
                                                type="text"
                                                value={formData.instagram_title}
                                                onChange={(e) => setFormData({ ...formData, instagram_title: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Instagram Description</label>
                                            <textarea
                                                value={formData.instagram_description}
                                                onChange={(e) => setFormData({ ...formData, instagram_description: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Instagram Image URL</label>
                                            <input
                                                type="text"
                                                value={formData.instagram_image_url}
                                                onChange={(e) => setFormData({ ...formData, instagram_image_url: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TECHNICAL TAB */}
                        {activeTab === 'Technical' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center">
                                    <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">⚙️</span>
                                    Technical SEO
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Robots Index</label>
                                        <select
                                            value={formData.robots_index}
                                            onChange={(e) => setFormData({ ...formData, robots_index: e.target.value as any })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        >
                                            <option value="index">Index</option>
                                            <option value="noindex">No Index</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Robots Follow</label>
                                        <select
                                            value={formData.robots_follow}
                                            onChange={(e) => setFormData({ ...formData, robots_follow: e.target.value as any })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        >
                                            <option value="follow">Follow</option>
                                            <option value="nofollow">No Follow</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Schema Type</label>
                                        <select
                                            value={formData.schema_type_id}
                                            onChange={(e) => setFormData({ ...formData, schema_type_id: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        >
                                            <option value="Service">Service</option>
                                            <option value="Product">Product</option>
                                            <option value="Article">Article</option>
                                            <option value="FAQ">FAQ</option>
                                            <option value="HowTo">HowTo</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Canonical URL</label>
                                    <input
                                        type="text"
                                        value={formData.canonical_url}
                                        onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        placeholder="https://example.com/services/..."
                                    />
                                </div>

                                {/* FAQ Section */}
                                <div className="border-t pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-bold text-slate-600 uppercase">FAQ Section</h4>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.faq_section_enabled}
                                                onChange={(e) => setFormData({ ...formData, faq_section_enabled: e.target.checked })}
                                                className="rounded text-indigo-600 h-5 w-5"
                                            />
                                            <span className="text-sm font-medium">Enable FAQ</span>
                                        </label>
                                    </div>

                                    {formData.faq_section_enabled && (
                                        <>
                                            <div className="space-y-4 mb-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Question</label>
                                                    <input
                                                        type="text"
                                                        value={tempFaqQuestion}
                                                        onChange={(e) => setTempFaqQuestion(e.target.value)}
                                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                                        placeholder="FAQ question..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Answer</label>
                                                    <textarea
                                                        value={tempFaqAnswer}
                                                        onChange={(e) => setTempFaqAnswer(e.target.value)}
                                                        rows={3}
                                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                                        placeholder="FAQ answer..."
                                                    />
                                                </div>
                                                <button
                                                    onClick={addFaq}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                                                >
                                                    Add FAQ
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {(formData.faq_content || []).map((faq: any, i: number) => (
                                                    <div key={i} className="bg-slate-50 p-4 rounded-lg">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="font-bold text-sm">{faq.question}</p>
                                                            <button
                                                                onClick={() => removeFaq(i)}
                                                                className="text-red-600 hover:text-red-800 text-sm font-bold"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-slate-600">{faq.answer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* LINKING TAB */}
                        {activeTab === 'Linking' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center">
                                    <span className="bg-teal-100 text-teal-600 p-2 rounded-lg mr-3">🔗</span>
                                    Linking & Relationships
                                </h3>

                                {/* Sub-Services */}
                                <div className="border-b pb-6">
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-4">Sub-Services ({linkedSubServices.length})</h4>
                                    {linkedSubServices.length > 0 ? (
                                        <div className="space-y-2">
                                            {linkedSubServices.map(sub => (
                                                <div key={sub.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                                                    <span className="text-sm font-medium">{sub.sub_service_name}</span>
                                                    <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(sub.status)}`}>{sub.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">No sub-services linked yet.</p>
                                    )}
                                </div>

                                {/* Linked Assets */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-4">Linked Assets ({linkedAssets.length})</h4>
                                    {linkedAssets.length > 0 ? (
                                        <div className="space-y-2 mb-4">
                                            {linkedAssets.map(asset => (
                                                <div key={asset.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{asset.content_title_clean}</p>
                                                        <p className="text-xs text-slate-500">{asset.asset_type} • {asset.status}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleAssetLink(asset)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-bold"
                                                    >
                                                        Unlink
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 mb-4">No assets linked yet.</p>
                                    )}

                                    {/* Add Assets */}
                                    <div className="border-t pt-4">
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Add Assets</label>
                                        <input
                                            type="text"
                                            value={assetSearch}
                                            onChange={(e) => setAssetSearch(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm mb-3"
                                            placeholder="Search assets..."
                                        />
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {availableAssets.map(asset => (
                                                <div key={asset.id} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg hover:border-indigo-300 transition-colors">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{asset.content_title_clean}</p>
                                                        <p className="text-xs text-slate-500">{asset.asset_type} • {asset.status}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleAssetLink(asset)}
                                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-bold"
                                                    >
                                                        Link
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* GOVERNANCE TAB */}
                        {activeTab === 'Governance' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center">
                                    <span className="bg-gray-100 text-gray-600 p-2 rounded-lg mr-3">⚖️</span>
                                    Ownership & Governance
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Brand</label>
                                        <select
                                            value={formData.brand_id}
                                            onChange={(e) => setFormData({ ...formData, brand_id: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        >
                                            <option value={0}>Select Brand...</option>
                                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Content Owner</label>
                                        <select
                                            value={formData.content_owner_id}
                                            onChange={(e) => setFormData({ ...formData, content_owner_id: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        >
                                            <option value={0}>Select Owner...</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Business Unit</label>
                                    <input
                                        type="text"
                                        value={formData.business_unit}
                                        onChange={(e) => setFormData({ ...formData, business_unit: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        placeholder="e.g., Marketing, R&D, Consulting"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Change Log Link</label>
                                    <input
                                        type="text"
                                        value={formData.change_log_link}
                                        onChange={(e) => setFormData({ ...formData, change_log_link: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Link to doc / Notion / Git / diff history"
                                    />
                                </div>

                                {editingItem && (
                                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                        <p className="text-xs text-slate-600"><span className="font-bold">Created:</span> {new Date(editingItem.created_at || '').toLocaleString()}</p>
                                        <p className="text-xs text-slate-600"><span className="font-bold">Updated:</span> {new Date(editingItem.updated_at || '').toLocaleString()}</p>
                                        <p className="text-xs text-slate-600"><span className="font-bold">Version:</span> {editingItem.version_number || 1}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // LIST VIEW
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Service Master</h1>
                    <p className="text-sm text-slate-600">Comprehensive service management with SEO, SMM, and content blocks</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={handleCreateClick}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                        + Create Service
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Table */}
            <Table
                columns={[
                    { key: 'service_name', label: 'Service Name', sortable: true },
                    { key: 'service_code', label: 'Code', sortable: true },
                    { key: 'slug', label: 'Slug', sortable: false },
                    { key: 'status', label: 'Status', sortable: true },
                    { key: 'subservice_count', label: 'Sub-Services', sortable: true },
                    { key: 'asset_count', label: 'Assets', sortable: true },
                    { key: 'updated_at', label: 'Updated', sortable: true }
                ]}
                data={filteredData.map(item => ({
                    ...item,
                    service_name: (
                        <div>
                            <p className="font-medium text-slate-900">{item.service_name}</p>
                            <p className="text-xs text-slate-500">{item.short_tagline || item.menu_heading}</p>
                        </div>
                    ),
                    status: <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(item.status)}`}>{item.status}</span>,
                    subservice_count: <span className="text-sm font-medium">{item.subservice_count || 0}</span>,
                    asset_count: <span className="text-sm font-medium">{item.asset_count || 0}</span>,
                    updated_at: <span className="text-xs text-slate-600">{new Date(item.updated_at || '').toLocaleDateString()}</span>
                }))}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default ServiceMasterView;


import React, { useState, useMemo } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { Service, ContentRepositoryItem, User, Brand, Campaign, IndustrySectorItem, CountryMasterItem, Keyword, ContentTypeItem, PersonaMasterItem, FormMasterItem, ServiceLink, ServiceImage, FAQItem } from '../types';

const SERVICE_STATUS_OPTIONS = ['Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'] as const;
const FALLBACK_CONTENT_TYPES: ContentTypeItem[] = [
    { id: 1, content_type: 'Pillar', category: 'Core', description: 'Long-form primary page', default_attributes: [], status: 'active' },
    { id: 2, content_type: 'Cluster', category: 'Supporting', description: 'Supporting topic page', default_attributes: [], status: 'active' },
    { id: 3, content_type: 'Landing', category: 'Conversion', description: 'Campaign landing page', default_attributes: [], status: 'active' },
    { id: 4, content_type: 'Blog', category: 'Editorial', description: 'Blog article', default_attributes: [], status: 'active' },
    { id: 5, content_type: 'Case Study', category: 'Proof', description: 'Customer story', default_attributes: [], status: 'active' },
    { id: 6, content_type: 'Sales Page', category: 'Conversion', description: 'Bottom-funnel page', default_attributes: [], status: 'active' }
];

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
    const { data: personas } = useData<PersonaMasterItem>('personas');
    const { data: forms } = useData<FormMasterItem>('forms');

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [editingItem, setEditingItem] = useState<Service | null>(null);
    const [activeTab, setActiveTab] = useState<'Core' | 'Navigation' | 'Strategic' | 'Content' | 'SEO' | 'SMM' | 'Technical' | 'Linking' | 'Governance'>('Core');
    const [copiedUrl, setCopiedUrl] = useState(false);

    // Asset Picker State within Full Frame
    const [assetSearch, setAssetSearch] = useState('');

    const createInitialFormState = (): Partial<Service> => ({
        service_name: '', service_code: '', slug: '', full_url: '',
        menu_heading: '', short_tagline: '',
        service_description: '', status: 'Draft', language: 'en',
        menu_group: '', menu_position: 0,
        show_in_main_menu: false, show_in_footer_menu: false,
        parent_menu_section: '',
        include_in_xml_sitemap: true,
        industry_ids: [], country_ids: [],
        linked_campaign_ids: [],
        h1: '', h2_list: [], h3_list: [], h4_list: [], h5_list: [], body_content: '',
        internal_links: [], external_links: [], image_alt_texts: [],
        word_count: 0, reading_time_minutes: 0,
        meta_title: '', meta_description: '', focus_keywords: [], secondary_keywords: [],
        seo_score: 0, ranking_summary: '',
        og_title: '', og_description: '', og_image_url: '', og_type: 'website',
        twitter_title: '', twitter_description: '', twitter_image_url: '',
        schema_type_id: 'Service', robots_index: 'index', robots_follow: 'follow', robots_custom: '',
        canonical_url: '', redirect_from_urls: [], hreflang_group_id: undefined,
        core_web_vitals_status: 'Good', tech_seo_status: 'Ok',
        sitemap_priority: 0.8, sitemap_changefreq: 'monthly',
        faq_section_enabled: false, faq_content: [],
        content_type: 'Pillar',
        buyer_journey_stage: 'Awareness',
        target_segment_notes: '',
        primary_persona_id: undefined,
        secondary_persona_ids: [],
        form_id: undefined,
        primary_cta_label: '', primary_cta_url: '',
        brand_id: 0,
        business_unit: '',
        content_owner_id: 0,
        created_by: undefined,
        updated_by: undefined,
        version_number: 1,
        change_log_link: ''
    });

    // Form State
    const [formData, setFormData] = useState<Partial<Service>>(() => createInitialFormState());

    // Helper inputs
    const [tempH2, setTempH2] = useState('');
    const [tempH3, setTempH3] = useState('');
    const [tempH4, setTempH4] = useState('');
    const [tempH5, setTempH5] = useState('');
    const [tempKeyword, setTempKeyword] = useState('');
    const [tempSecondaryKeyword, setTempSecondaryKeyword] = useState('');
    const [tempRedirect, setTempRedirect] = useState('');
    const [tempInternalLink, setTempInternalLink] = useState<ServiceLink>({ anchor_text: '', url: '', rel: '', target_type: '' });
    const [tempExternalLink, setTempExternalLink] = useState<ServiceLink>({ anchor_text: '', url: '', rel: '', target_type: '' });
    const [tempImage, setTempImage] = useState<ServiceImage>({ url: '', alt_text: '', context: '' });
    const [tempFaq, setTempFaq] = useState<FAQItem>({ question: '', answer: '' });

    // Computed Data
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredData = services.filter(item => {
        const matchesSearch = !normalizedQuery || [
            item.service_name,
            item.service_code,
            item.menu_heading,
            item.short_tagline,
            item.full_url
        ].some(value => (value || '').toLowerCase().includes(normalizedQuery));
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

    const availableContentTypes = contentTypes.length ? contentTypes : FALLBACK_CONTENT_TYPES;

    // Handlers
    const handleCreateClick = () => {
        setEditingItem(null);
        setFormData(createInitialFormState());
        setActiveTab('Core');
        setViewMode('form');
    };

    const handleEdit = (item: Service) => {
        setEditingItem(item);
        setFormData({
            ...item,
            menu_heading: item.menu_heading || '',
            short_tagline: item.short_tagline || '',
            full_url: item.full_url || '',
            menu_group: item.menu_group || '',
            business_unit: item.business_unit || '',
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
            internal_links: item.internal_links || [],
            external_links: item.external_links || [],
            image_alt_texts: item.image_alt_texts || [],
            word_count: item.word_count || 0,
            reading_time_minutes: item.reading_time_minutes || 0,
            redirect_from_urls: item.redirect_from_urls || [],
            parent_menu_section: item.parent_menu_section || '',
            secondary_persona_ids: item.secondary_persona_ids || [],
            primary_persona_id: item.primary_persona_id ?? undefined,
            target_segment_notes: item.target_segment_notes || '',
            form_id: item.form_id ?? undefined,
            include_in_xml_sitemap: typeof item.include_in_xml_sitemap === 'boolean' ? item.include_in_xml_sitemap : true,
            sitemap_priority: item.sitemap_priority || 0.8,
            sitemap_changefreq: item.sitemap_changefreq || 'monthly',
            core_web_vitals_status: item.core_web_vitals_status || 'Good',
            tech_seo_status: item.tech_seo_status || 'Ok',
            og_type: item.og_type || 'website',
            og_image_url: item.og_image_url || '',
            twitter_image_url: item.twitter_image_url || '',
            robots_custom: item.robots_custom || '',
            hreflang_group_id: item.hreflang_group_id ?? undefined,
            faq_section_enabled: item.faq_section_enabled || false,
            brand_id: item.brand_id || 0,
            content_owner_id: item.content_owner_id || 0,
            created_by: item.created_by ?? undefined,
            updated_by: item.updated_by ?? undefined,
            version_number: item.version_number || 1,
            change_log_link: item.change_log_link || '',
            primary_cta_label: item.primary_cta_label || '',
            primary_cta_url: item.primary_cta_url || ''
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

    const addLink = (field: 'internal_links' | 'external_links', link: ServiceLink, setter: React.Dispatch<React.SetStateAction<ServiceLink>>) => {
        if (!link.anchor_text?.trim() || !link.url?.trim()) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...((prev[field] as ServiceLink[]) || []), link]
        }));
        setter({ anchor_text: '', url: '', rel: '', target_type: '' });
    };

    const addImageAlt = (image: ServiceImage) => {
        if (!image.url?.trim() || !image.alt_text?.trim()) return;
        setFormData(prev => ({
            ...prev,
            image_alt_texts: [...((prev.image_alt_texts as ServiceImage[]) || []), image]
        }));
        setTempImage({ url: '', alt_text: '', context: '' });
    };

    const addFaqItem = (faq: FAQItem) => {
        if (!faq.question?.trim() || !faq.answer?.trim()) return;
        setFormData(prev => ({
            ...prev,
            faq_content: [...((prev.faq_content as FAQItem[]) || []), faq]
        }));
        setTempFaq({ question: '', answer: '' });
    };

    const toggleSelection = (field: 'industry_ids' | 'country_ids' | 'linked_campaign_ids' | 'secondary_persona_ids', id: string | number) => {
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
            <div className="fixed inset-x-0 bottom-0 top-16 z-[60] bg-white flex flex-col overflow-hidden animate-slide-up">
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
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                        <div className="space-y-5">
                                            <Tooltip content="The primary name displayed to users in menus and headers.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Service Name *</label>
                                                    <input
                                                        type="text"
                                                        value={formData.service_name}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, service_name: e.target.value });
                                                            if (!editingItem && !formData.slug) handleSlugChange(e.target.value);
                                                        }}
                                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                                    />
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="Unique internal identifier (e.g., SRV-001) for system referencing.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Service Code</label>
                                                    <input
                                                        type="text"
                                                        value={formData.service_code}
                                                        onChange={(e) => setFormData({ ...formData, service_code: e.target.value })}
                                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm transition-all"
                                                        placeholder="SRV-XXX"
                                                    />
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="Label used inside the navigation menu for this service.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Menu Heading</label>
                                                    <input
                                                        type="text"
                                                        value={formData.menu_heading}
                                                        onChange={(e) => setFormData({ ...formData, menu_heading: e.target.value })}
                                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm transition-all"
                                                        placeholder="Consulting & Advisory"
                                                    />
                                                </div>
                                            </Tooltip>
                                        </div>
                                        <div className="space-y-5">
                                            <Tooltip content="URL-friendly identifier. Auto-generated from name if empty.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Slug</label>
                                                    <input
                                                        type="text"
                                                        value={formData.slug}
                                                        onChange={(e) => handleSlugChange(e.target.value)}
                                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-slate-50 transition-all font-mono text-slate-600"
                                                    />
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="Canonical URL path used on Guires Marketing OS.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full URL</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={formData.full_url}
                                                            onChange={(e) => setFormData({ ...formData, full_url: e.target.value })}
                                                            className="flex-1 p-3 border border-slate-300 rounded-lg text-sm bg-slate-50 font-mono text-slate-600"
                                                            placeholder="/services/enterprise-marketing"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleCopyFullUrl}
                                                            className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors ${copiedUrl ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-slate-300 text-slate-600 bg-white hover:bg-slate-50'}`}
                                                        >
                                                            {copiedUrl ? 'Copied' : 'Copy'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="Current lifecycle state used across dashboards and filters.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                                                    <select
                                                        value={formData.status}
                                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Service['status'] })}
                                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all"
                                                    >
                                                        {SERVICE_STATUS_OPTIONS.map(status => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </Tooltip>
                                        </div>
                                        <div className="space-y-5">
                                            <Tooltip content="Language code for this specific service version (e.g., en, es).">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Language</label>
                                                    <select
                                                        value={formData.language}
                                                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all"
                                                    >
                                                        <option value="en">English</option>
                                                        <option value="es">Spanish</option>
                                                        <option value="fr">French</option>
                                                        <option value="de">German</option>
                                                    </select>
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="Concise positioning line used in hero sections and cards.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Short Tagline</label>
                                                    <input
                                                        type="text"
                                                        value={formData.short_tagline}
                                                        onChange={(e) => setFormData({ ...formData, short_tagline: e.target.value })}
                                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm transition-all"
                                                        placeholder="Full-funnel marketing acceleration"
                                                    />
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className="mt-8 border-t border-slate-100 pt-6">
                                        <Tooltip content="A detailed description of the service offering used for internal reference and summaries.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Service Description</label>
                                                <textarea
                                                    value={formData.service_description}
                                                    onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                                                    className="w-full p-4 border border-slate-300 rounded-lg h-32 text-sm focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                                                    placeholder="Describe the intent, promise, and key differentiators..."
                                                />
                                            </div>
                                        </Tooltip>
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
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <Tooltip content="Grouping label for nested menus (e.g. 'Consulting Services').">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Menu Group</label>
                                                <input type="text" value={formData.menu_group} onChange={(e) => setFormData({ ...formData, menu_group: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Products" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Optional parent section this service nests under (e.g. 'Solutions').">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Parent Menu Section</label>
                                                <input
                                                    type="text"
                                                    value={formData.parent_menu_section || ''}
                                                    onChange={(e) => setFormData({ ...formData, parent_menu_section: e.target.value })}
                                                    className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                                                    placeholder="e.g. Solutions"
                                                />
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
                                            <select value={formData.content_type || ''} onChange={(e) => setFormData({ ...formData, content_type: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value="" disabled>Select content type...</option>
                                                {availableContentTypes.map(ct => (
                                                    <option key={ct.id} value={ct.content_type}>{ct.content_type}</option>
                                                ))}
                                                {formData.content_type && !availableContentTypes.some(ct => ct.content_type === formData.content_type) && (
                                                    <option value={formData.content_type}>{formData.content_type}</option>
                                                )}
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
                                    <Tooltip content="Primary persona from Persona Master to align messaging.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Primary Persona</label>
                                            <select
                                                value={formData.primary_persona_id ?? ''}
                                                onChange={(e) => setFormData({ ...formData, primary_persona_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                                className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white"
                                            >
                                                <option value="">Select persona...</option>
                                                {personas.map(persona => (
                                                    <option key={persona.id} value={persona.id}>{persona.persona_name}</option>
                                                ))}
                                                {formData.primary_persona_id && !personas.some(p => p.id === formData.primary_persona_id) && (
                                                    <option value={formData.primary_persona_id}>Persona #{formData.primary_persona_id}</option>
                                                )}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Associate a lead capture form or workflow.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Linked Form</label>
                                            <select
                                                value={formData.form_id ?? ''}
                                                onChange={(e) => setFormData({ ...formData, form_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                                className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white"
                                            >
                                                <option value="">No linked form</option>
                                                {forms.map(form => (
                                                    <option key={form.id} value={form.id}>{form.form_name}</option>
                                                ))}
                                                {formData.form_id && !forms.some(f => f.id === formData.form_id) && (
                                                    <option value={formData.form_id}>Form #{formData.form_id}</option>
                                                )}
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

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <Tooltip content="Document ICP notes or positioning guidance for this service.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target Segment Notes</label>
                                            <textarea
                                                value={formData.target_segment_notes || ''}
                                                onChange={(e) => setFormData({ ...formData, target_segment_notes: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-lg text-sm h-28 resize-none"
                                                placeholder="e.g. Mid-market healthcare providers, 200-500 employees."
                                            />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Select additional personas that should inherit this service.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Secondary Personas</label>
                                            <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-100">
                                                {personas.length === 0 && (
                                                    <div className="p-3 text-xs text-slate-400 text-center">No personas available. Add entries under Persona Master.</div>
                                                )}
                                                {personas.map(persona => (
                                                    <label key={persona.id} className="flex items-center justify-between px-3 py-2 text-sm">
                                                        <span className="text-slate-700">{persona.persona_name}</span>
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 text-indigo-600 border-slate-300 rounded"
                                                            checked={Boolean(formData.secondary_persona_ids?.includes(persona.id))}
                                                            onChange={() => toggleSelection('secondary_persona_ids', persona.id)}
                                                        />
                                                    </label>
                                                ))}
                                            </div>
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
                                <div className="space-y-8">
                                    <Tooltip content="The main H1 tag for the page. Essential for SEO.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">H1 Heading</label>
                                            <input type="text" value={formData.h1} onChange={(e) => setFormData({ ...formData, h1: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800" />
                                        </div>
                                    </Tooltip>

                                    {[{ label: 'H2 Headings', field: 'h2_list', temp: tempH2, setter: setTempH2 },
                                    { label: 'H3 Headings', field: 'h3_list', temp: tempH3, setter: setTempH3 },
                                    { label: 'H4 Headings', field: 'h4_list', temp: tempH4, setter: setTempH4 },
                                    { label: 'H5 Headings', field: 'h5_list', temp: tempH5, setter: setTempH5 }].map(config => (
                                        <div key={config.field}>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{config.label}</label>
                                            <div className="flex gap-2 mb-3">
                                                <input
                                                    type="text"
                                                    value={config.temp}
                                                    onChange={(e) => config.setter(e.target.value)}
                                                    className="flex-1 p-3 border border-slate-300 rounded-lg text-sm"
                                                    placeholder={`Add ${config.label.replace(' Headings', '')}...`}
                                                />
                                                <button
                                                    onClick={() => addToList(config.field as keyof Service, config.temp, config.setter)}
                                                    className="bg-indigo-50 text-indigo-600 px-6 rounded-lg font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <ul className="space-y-2">
                                                {(((formData[config.field as keyof Service] as string[] | undefined) || []).length)
                                                    ? ((formData[config.field as keyof Service] as string[] | undefined) || []).map((heading, i) => (
                                                        <li key={`${config.field}-${i}`} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                            <span className="font-medium text-slate-700 truncate">{heading}</span>
                                                            <button onClick={() => removeFromList(config.field as keyof Service, i)} className="text-slate-400 hover:text-red-500 font-bold p-1 transition-colors">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </li>
                                                    ))
                                                    : <li className="text-xs text-slate-400 text-center py-3 border border-dashed border-slate-200 rounded-lg">No {config.label.toLowerCase()} yet.</li>}
                                            </ul>
                                        </div>
                                    ))}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Tooltip content="Approximate total word count to help editorial planning.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Word Count</label>
                                                <input
                                                    type="number"
                                                    value={formData.word_count ?? 0}
                                                    onChange={(e) => setFormData({ ...formData, word_count: parseInt(e.target.value || '0') })}
                                                    className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                                                    min={0}
                                                />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Reading time estimation shown on landing pages (minutes).">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reading Time (Minutes)</label>
                                                <input
                                                    type="number"
                                                    value={formData.reading_time_minutes ?? 0}
                                                    onChange={(e) => setFormData({ ...formData, reading_time_minutes: parseInt(e.target.value || '0') })}
                                                    className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                                                    min={0}
                                                />
                                            </div>
                                        </Tooltip>
                                    </div>

                                    <Tooltip content="Main body copy. Supports Markdown formatting.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Body Content</label>
                                            <textarea value={formData.body_content} onChange={(e) => setFormData({ ...formData, body_content: e.target.value })} className="w-full p-4 border border-slate-300 rounded-lg h-80 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500" placeholder="# Write content here..." />
                                        </div>
                                    </Tooltip>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Internal Links</h4>
                                                <span className="text-[10px] text-slate-400 font-mono">{formData.internal_links?.length || 0}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <input type="text" value={tempInternalLink.anchor_text} onChange={(e) => setTempInternalLink(prev => ({ ...prev, anchor_text: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded text-sm" placeholder="Anchor text" />
                                                <input type="text" value={tempInternalLink.url} onChange={(e) => setTempInternalLink(prev => ({ ...prev, url: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded text-sm font-mono" placeholder="/supporting-page" />
                                                <button onClick={() => addLink('internal_links', tempInternalLink, setTempInternalLink)} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition">Add Internal Link</button>
                                            </div>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {formData.internal_links?.length ? formData.internal_links.map((link, idx) => (
                                                    <div key={`internal-${idx}`} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 text-sm">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-slate-800 truncate">{link.anchor_text}</p>
                                                            <p className="text-[11px] text-slate-500 font-mono truncate">{link.url}</p>
                                                        </div>
                                                        <button onClick={() => removeFromList('internal_links', idx)} className="text-slate-400 hover:text-red-500 transition">✕</button>
                                                    </div>
                                                )) : <p className="text-xs text-slate-400 text-center py-2">No links yet.</p>}
                                            </div>
                                        </div>

                                        <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">External Links</h4>
                                                <span className="text-[10px] text-slate-400 font-mono">{formData.external_links?.length || 0}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <input type="text" value={tempExternalLink.anchor_text} onChange={(e) => setTempExternalLink(prev => ({ ...prev, anchor_text: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded text-sm" placeholder="Anchor text" />
                                                <input type="text" value={tempExternalLink.url} onChange={(e) => setTempExternalLink(prev => ({ ...prev, url: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded text-sm font-mono" placeholder="https://partner-site.com" />
                                                <button onClick={() => addLink('external_links', tempExternalLink, setTempExternalLink)} className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition">Add External Link</button>
                                            </div>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {formData.external_links?.length ? formData.external_links.map((link, idx) => (
                                                    <div key={`external-${idx}`} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 text-sm">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-slate-800 truncate">{link.anchor_text}</p>
                                                            <p className="text-[11px] text-slate-500 font-mono truncate">{link.url}</p>
                                                        </div>
                                                        <button onClick={() => removeFromList('external_links', idx)} className="text-slate-400 hover:text-red-500 transition">✕</button>
                                                    </div>
                                                )) : <p className="text-xs text-slate-400 text-center py-2">No links yet.</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Image Alt Texts</h4>
                                            <span className="text-[10px] text-slate-400 font-mono">{formData.image_alt_texts?.length || 0}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <input type="text" value={tempImage.url} onChange={(e) => setTempImage(prev => ({ ...prev, url: e.target.value }))} className="p-2.5 border border-slate-200 rounded text-sm font-mono" placeholder="Image URL" />
                                            <input type="text" value={tempImage.alt_text} onChange={(e) => setTempImage(prev => ({ ...prev, alt_text: e.target.value }))} className="p-2.5 border border-slate-200 rounded text-sm" placeholder="Alt text" />
                                            <input type="text" value={tempImage.context} onChange={(e) => setTempImage(prev => ({ ...prev, context: e.target.value }))} className="p-2.5 border border-slate-200 rounded text-sm" placeholder="Usage context" />
                                        </div>
                                        <button onClick={() => addImageAlt(tempImage)} className="w-full mt-2 bg-slate-800 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-900 transition">Add Image Alt Mapping</button>
                                        <div className="space-y-2 max-h-52 overflow-y-auto">
                                            {formData.image_alt_texts?.length ? formData.image_alt_texts.map((img, idx) => (
                                                <div key={`img-${idx}`} className="flex items-start justify-between border border-slate-200 rounded-lg p-3 text-sm">
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800 truncate">{img.alt_text}</p>
                                                        <p className="text-[11px] text-slate-500 font-mono truncate">{img.url}</p>
                                                        {img.context && <p className="text-[11px] text-slate-400 mt-1 truncate">{img.context}</p>}
                                                    </div>
                                                    <button onClick={() => removeFromList('image_alt_texts', idx)} className="text-slate-400 hover:text-red-500 transition">✕</button>
                                                </div>
                                            )) : <p className="text-xs text-slate-400 text-center py-2">No image metadata documented yet.</p>}
                                        </div>
                                    </div>
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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <Tooltip content="Image used by Open Graph previews.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">OG Image URL</label>
                                                <input type="text" value={formData.og_image_url || ''} onChange={(e) => setFormData({ ...formData, og_image_url: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono text-slate-600" placeholder="https://..." />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Controls how social platforms render the preview card.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">OG Type</label>
                                                <select value={formData.og_type || 'website'} onChange={(e) => setFormData({ ...formData, og_type: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="website">Website</option>
                                                    <option value="article">Article</option>
                                                    <option value="product">Product</option>
                                                </select>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Image used for Twitter card previews.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Twitter Image URL</label>
                                                <input type="text" value={formData.twitter_image_url || ''} onChange={(e) => setFormData({ ...formData, twitter_image_url: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono text-slate-600" placeholder="https://..." />
                                            </div>
                                        </Tooltip>
                                    </div>
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
                                    <Tooltip content="Group ID for hreflang management (links related locales).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hreflang Group ID</label>
                                            <input type="number" value={formData.hreflang_group_id ?? ''} onChange={(e) => setFormData({ ...formData, hreflang_group_id: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="e.g. 42" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Custom robots directives (each on new line).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Robots Custom</label>
                                            <textarea value={formData.robots_custom || ''} onChange={(e) => setFormData({ ...formData, robots_custom: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm h-28 font-mono" placeholder="User-agent: *&#10;Disallow: /preview" />
                                        </div>
                                    </Tooltip>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                    <Tooltip content="Flag whether this URL should appear in the XML sitemap.">
                                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-slate-600 uppercase">Include in Sitemap</p>
                                                <p className="text-[11px] text-slate-500">Controls XML feed visibility</p>
                                            </div>
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={!!formData.include_in_xml_sitemap} onChange={(e) => setFormData({ ...formData, include_in_xml_sitemap: e.target.checked })} className="sr-only" />
                                                <span className={`w-10 h-5 flex items-center rounded-full p-1 transition ${formData.include_in_xml_sitemap ? 'bg-green-500' : 'bg-slate-300'}`}>
                                                    <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${formData.include_in_xml_sitemap ? 'translate-x-4' : ''}`}></span>
                                                </span>
                                            </label>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Measured Core Web Vitals performance state.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Core Web Vitals Status</label>
                                            <select value={formData.core_web_vitals_status || 'Good'} onChange={(e) => setFormData({ ...formData, core_web_vitals_status: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value="Good">Good</option>
                                                <option value="Needs Improvement">Needs Improvement</option>
                                                <option value="Poor">Poor</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Overall technical SEO health indicator.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tech SEO Status</label>
                                            <select value={formData.tech_seo_status || 'Ok'} onChange={(e) => setFormData({ ...formData, tech_seo_status: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value="Ok">OK</option>
                                                <option value="Warning">Warning</option>
                                                <option value="Critical">Critical</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Tooltip content="Priority hint for search engine crawlers (0.0 to 1.0).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sitemap Priority</label>
                                            <select value={formData.sitemap_priority ?? 0.8} onChange={(e) => setFormData({ ...formData, sitemap_priority: parseFloat(e.target.value) })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value={1.0}>1.0 (Highest)</option>
                                                <option value={0.8}>0.8 (High)</option>
                                                <option value={0.5}>0.5 (Medium)</option>
                                                <option value={0.3}>0.3 (Low)</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Expected frequency of updates for sitemap pinging.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sitemap Frequency</label>
                                            <select value={formData.sitemap_changefreq || 'monthly'} onChange={(e) => setFormData({ ...formData, sitemap_changefreq: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
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

                                <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-600 uppercase">FAQ Section</p>
                                            <p className="text-[11px] text-slate-500">Control schema-ready Q&A block</p>
                                        </div>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={formData.faq_section_enabled} onChange={(e) => setFormData({ ...formData, faq_section_enabled: e.target.checked })} className="sr-only" />
                                            <span className={`w-10 h-5 flex items-center bg-slate-300 rounded-full p-1 transition ${formData.faq_section_enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                                                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${formData.faq_section_enabled ? 'translate-x-4' : ''}`}></span>
                                            </span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input type="text" value={tempFaq.question} onChange={(e) => setTempFaq(prev => ({ ...prev, question: e.target.value }))} className="p-2.5 border border-slate-200 rounded text-sm" placeholder="Question" />
                                        <input type="text" value={tempFaq.answer} onChange={(e) => setTempFaq(prev => ({ ...prev, answer: e.target.value }))} className="p-2.5 border border-slate-200 rounded text-sm" placeholder="Answer" />
                                    </div>
                                    <button onClick={() => addFaqItem(tempFaq)} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition">Add FAQ</button>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {formData.faq_content?.length ? formData.faq_content.map((faq, idx) => (
                                            <div key={`faq-${idx}`} className="bg-white rounded-lg border border-slate-200 p-3 text-sm flex justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800 truncate">{faq.question}</p>
                                                    <p className="text-[11px] text-slate-500 truncate">{faq.answer}</p>
                                                </div>
                                                <button onClick={() => removeFromList('faq_content', idx)} className="text-slate-400 hover:text-red-500 transition">✕</button>
                                            </div>
                                        )) : <p className="text-xs text-slate-400 text-center py-2">No FAQ entries yet.</p>}
                                    </div>
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
                                    <Tooltip content="Business unit or pod responsible for this service (optional metadata).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Business Unit</label>
                                            <input
                                                type="text"
                                                value={formData.business_unit || ''}
                                                onChange={(e) => setFormData({ ...formData, business_unit: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all"
                                                placeholder="Growth Marketing"
                                            />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Record the user who originally created this service (for audit trails).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Created By</label>
                                            <select value={formData.created_by ?? ''} onChange={(e) => setFormData({ ...formData, created_by: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                <option value="">Select user...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Latest editor responsible for modifications.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Updated By</label>
                                            <select value={formData.updated_by ?? ''} onChange={(e) => setFormData({ ...formData, updated_by: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                <option value="">Select user...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Created At</label>
                                        <input type="text" value={formData.created_at ? new Date(formData.created_at).toLocaleDateString() : '-'} readOnly className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-sm font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Updated At</label>
                                        <input type="text" value={formData.updated_at ? new Date(formData.updated_at).toLocaleString() : '-'} readOnly className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-sm font-mono" />
                                    </div>
                                    <Tooltip content="Versioning helps coordinate approvals and publishing.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Version Number</label>
                                            <input type="number" value={formData.version_number ?? 1} min={1} onChange={(e) => setFormData({ ...formData, version_number: parseInt(e.target.value || '1') })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Link to release notes or Jira change request describing the last update.">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Change Log Link</label>
                                            <input type="text" value={formData.change_log_link || ''} onChange={(e) => setFormData({ ...formData, change_log_link: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono" placeholder="https://notion.so/changelog" />
                                        </div>
                                    </Tooltip>
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
                        {SERVICE_STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
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
                                    <div className="text-[11px] text-slate-500 truncate max-w-[220px]">{item.short_tagline || 'No tagline defined'}</div>
                                </div>
                            )
                        },
                        {
                            header: 'Menu Heading',
                            accessor: (item: Service) => (
                                <div>
                                    <div className="font-semibold text-slate-700 text-sm">{item.menu_heading || '—'}</div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">Menu #{item.menu_position ?? 0}</div>
                                </div>
                            ),
                            className: "min-w-[140px]"
                        },
                        {
                            header: 'Full URL',
                            accessor: (item: Service) => (
                                item.full_url ? (
                                    <a
                                        href={item.full_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-mono text-indigo-600 hover:underline truncate block max-w-[200px]"
                                        title={item.full_url}
                                    >
                                        {item.full_url}
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate-400">—</span>
                                )
                            )
                        },
                        { header: 'Type', accessor: 'content_type' as keyof Service, className: "text-xs text-slate-600 font-medium" },
                        { header: 'Status', accessor: (item: Service) => getStatusBadge(item.status) },
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

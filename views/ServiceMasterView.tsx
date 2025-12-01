
import React, { useState, useMemo, useEffect } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import { getStatusBadge, SparkIcon } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import { runQuery } from '../utils/gemini';
import type { Service, ContentRepositoryItem, User, Brand, Campaign, IndustrySectorItem, CountryMasterItem, Keyword, ContentTypeItem, SubServiceItem } from '../types';

const ServiceMasterView: React.FC = () => {
    const { data: services, create, update, remove } = useData<Service>('services');
    const { data: subServices } = useData<SubServiceItem>('subServices');
    const { data: contentAssets, update: updateContentAsset } = useData<ContentRepositoryItem>('content');
    const { data: keywordsMaster } = useData<Keyword>('keywords');
    
    // Master Data for Dropdowns/Selectors
    const { data: users } = useData<User>('users');
    const { data: brands } = useData<Brand>('brands');
    const { data: campaigns } = useData<Campaign>('campaigns');
    const { data: industrySectors } = useData<IndustrySectorItem>('industrySectors');
    const { data: countries } = useData<CountryMasterItem>('countries');
    const { data: contentTypes } = useData<ContentTypeItem>('contentTypes');
    
    // AI State
    const [isAiSuggesting, setIsAiSuggesting] = useState(false);

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
        menu_heading: '', short_tagline: '', service_description: '', status: 'Draft', language: 'en',
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
        show_in_main_menu: false, show_in_footer_menu: false, menu_position: 0, menu_group: '', 
        parent_menu_section: '', breadcrumb_label: '', include_in_xml_sitemap: true,
        content_type: 'Pillar', buyer_journey_stage: 'Awareness',
        linked_campaign_ids: [], secondary_persona_ids: [], primary_persona_id: 0,
        target_segment_notes: '', primary_cta_label: '', primary_cta_url: '', form_id: 0,
        knowledge_topic_id: 0, featured_asset_id: 0, primary_subservice_id: 0,
        has_subservices: false, subservice_count: 0, asset_count: 0,
        brand_id: 0, business_unit: '', content_owner_id: 0, created_by: 0, updated_by: 0,
        version_number: 1, change_log_link: ''
    });

    // Helper inputs
    const [tempH2, setTempH2] = useState('');
    const [tempH3, setTempH3] = useState('');
    const [tempH4, setTempH4] = useState('');
    const [tempH5, setTempH5] = useState('');
    const [tempKeyword, setTempKeyword] = useState('');
    const [tempSecondaryKeyword, setTempSecondaryKeyword] = useState('');
    const [tempRedirect, setTempRedirect] = useState('');
    const [tempInternalLink, setTempInternalLink] = useState({ url: '', anchor_text: '', target_type: 'service' });
    const [tempExternalLink, setTempExternalLink] = useState({ url: '', anchor_text: '', rel: 'nofollow' });
    const [tempImageAlt, setTempImageAlt] = useState({ image_id: '', alt_text: '', context: '' });
    const [tempFAQ, setTempFAQ] = useState({ question: '', answer: '' });
    const metaTitleCount = formData.meta_title?.length || 0;
    const metaDescriptionCount = formData.meta_description?.length || 0;
    const focusKeywordCount = formData.focus_keywords?.length || 0;
    const secondaryKeywordCount = formData.secondary_keywords?.length || 0;
    const headingCounts = {
        h2: formData.h2_list?.length || 0,
        h3: formData.h3_list?.length || 0,
        h4: formData.h4_list?.length || 0,
        h5: formData.h5_list?.length || 0
    };
    const totalHeadings = headingCounts.h2 + headingCounts.h3 + headingCounts.h4 + headingCounts.h5;
    const contentWordCount = formData.word_count || formData.body_content?.split(/\s+/).filter(Boolean).length || 0;
    const readingMinutes = formData.reading_time_minutes || Math.ceil(contentWordCount / 200);
    const internalLinkCount = formData.internal_links?.length || 0;
    const externalLinkCount = formData.external_links?.length || 0;
    const imageAltCount = formData.image_alt_texts?.length || 0;
    const socialPreviewReady = !!(formData.og_title && formData.og_description && formData.og_image_url);
    const twitterPreviewReady = !!(formData.twitter_title && formData.twitter_description);

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

    const linkedSubServices = useMemo(() => {
        if (!editingItem) return [];
        return subServices.filter(s => s.parent_service_id === editingItem.id);
    }, [subServices, editingItem]);

    // Auto-calculate word count and reading time
    useEffect(() => {
        if (formData.body_content) {
            const words = formData.body_content.trim().split(/\s+/).filter(w => w.length > 0).length;
            const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words/min
            setFormData(prev => ({ ...prev, word_count: words, reading_time_minutes: readingTime }));
        }
    }, [formData.body_content]);

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
            menu_heading: '', short_tagline: '', service_description: '', status: 'Draft', language: 'en', content_type: 'Pillar',
            h1: '', h2_list: [], h3_list: [], h4_list: [], h5_list: [], body_content: '',
            internal_links: [], external_links: [], image_alt_texts: [],
            meta_title: '', meta_description: '', focus_keywords: [], secondary_keywords: [],
            industry_ids: [], country_ids: [], linked_campaign_ids: [],
            redirect_from_urls: [], faq_content: [], faq_section_enabled: false,
            primary_persona_id: 0, secondary_persona_ids: [],
            menu_group: '', parent_menu_section: '', breadcrumb_label: '', include_in_xml_sitemap: true,
            buyer_journey_stage: 'Awareness', target_segment_notes: '', primary_cta_label: '', primary_cta_url: '', form_id: 0,
            brand_id: 0, business_unit: '', content_owner_id: 0, created_by: 0, updated_by: 0,
            version_number: 1, change_log_link: '', has_subservices: false, subservice_count: 0, asset_count: 0
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
            redirect_from_urls: item.redirect_from_urls || [],
            internal_links: item.internal_links || [],
            external_links: item.external_links || [],
            image_alt_texts: item.image_alt_texts || [],
            secondary_persona_ids: item.secondary_persona_ids || [],
            menu_heading: item.menu_heading || '',
            short_tagline: item.short_tagline || '',
            menu_group: item.menu_group || '',
            parent_menu_section: item.parent_menu_section || '',
            breadcrumb_label: item.breadcrumb_label || '',
            include_in_xml_sitemap: item.include_in_xml_sitemap !== undefined ? item.include_in_xml_sitemap : true,
            business_unit: item.business_unit || '',
            created_by: item.created_by || 0,
            updated_by: item.updated_by || 0,
            version_number: item.version_number || 1,
            change_log_link: item.change_log_link || '',
            target_segment_notes: item.target_segment_notes || '',
            primary_cta_label: item.primary_cta_label || '',
            primary_cta_url: item.primary_cta_url || '',
            form_id: item.form_id || 0
        });
        setActiveTab('Core');
        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if(confirm('Delete this service?')) await remove(id);
    };

    const handleSave = async () => {
        if (!formData.service_name) return alert("Service Name is required");
        const payload = { ...formData, updated_at: new Date().toISOString() };
        
        if (formData.slug && !formData.full_url) {
            payload.full_url = `/services/${formData.slug}`;
        }

        // Ensure arrays are properly formatted
        payload.h2_list = formData.h2_list || [];
        payload.h3_list = formData.h3_list || [];
        payload.h4_list = formData.h4_list || [];
        payload.h5_list = formData.h5_list || [];
        payload.focus_keywords = formData.focus_keywords || [];
        payload.secondary_keywords = formData.secondary_keywords || [];
        payload.internal_links = formData.internal_links || [];
        payload.external_links = formData.external_links || [];
        payload.image_alt_texts = formData.image_alt_texts || [];
        payload.faq_content = formData.faq_content || [];
        payload.industry_ids = formData.industry_ids || [];
        payload.country_ids = formData.country_ids || [];
        payload.linked_campaign_ids = formData.linked_campaign_ids || [];
        payload.secondary_persona_ids = formData.secondary_persona_ids || [];
        payload.redirect_from_urls = formData.redirect_from_urls || [];

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

    const addInternalLink = () => {
        if (!tempInternalLink.url || !tempInternalLink.anchor_text) return;
        setFormData(prev => ({
            ...prev,
            internal_links: [...(prev.internal_links || []), { ...tempInternalLink }]
        }));
        setTempInternalLink({ url: '', anchor_text: '', target_type: 'service' });
    };

    const addExternalLink = () => {
        if (!tempExternalLink.url || !tempExternalLink.anchor_text) return;
        setFormData(prev => ({
            ...prev,
            external_links: [...(prev.external_links || []), { ...tempExternalLink }]
        }));
        setTempExternalLink({ url: '', anchor_text: '', rel: 'nofollow' });
    };

    const addImageAlt = () => {
        if (!tempImageAlt.image_id || !tempImageAlt.alt_text) return;
        setFormData(prev => ({
            ...prev,
            image_alt_texts: [...(prev.image_alt_texts || []), { ...tempImageAlt }]
        }));
        setTempImageAlt({ image_id: '', alt_text: '', context: '' });
    };

    const addFAQ = () => {
        if (!tempFAQ.question || !tempFAQ.answer) return;
        setFormData(prev => ({
            ...prev,
            faq_content: [...(prev.faq_content || []), { ...tempFAQ }]
        }));
        setTempFAQ({ question: '', answer: '' });
    };

    const generateFAQs = async () => {
        if (!formData.service_description && !formData.body_content) {
            alert('Please add service description or body content first');
            return;
        }
        setIsAiSuggesting(true);
        try {
            const prompt = `Generate 5-7 relevant FAQ questions and answers for a service with this description: "${formData.service_description || formData.body_content}". 
Return as JSON array: [{"question": "...", "answer": "..."}, ...]`;
            const result = await runQuery(prompt);
            try {
                const faqs = JSON.parse(result.text);
                if (Array.isArray(faqs)) {
                    setFormData(prev => ({
                        ...prev,
                        faq_content: [...(prev.faq_content || []), ...faqs]
                    }));
                }
            } catch (e) {
                console.error('Failed to parse FAQ JSON', e);
            }
        } catch (error) {
            console.error('FAQ generation failed', error);
        } finally {
            setIsAiSuggesting(false);
        }
    };


    const suggestInternalLinks = async () => {
        if (!formData.body_content) return;
        setIsAiSuggesting(true);
        try {
            const prompt = `Analyze this content and suggest 3-5 internal linking opportunities to other services. 
Content: "${formData.body_content.substring(0, 1000)}"
Available services: ${services.map(s => s.service_name).join(', ')}
Return as JSON: [{"url": "/services/slug", "anchor_text": "...", "target_type": "service"}, ...]`;
            const result = await runQuery(prompt);
            try {
                const links = JSON.parse(result.text);
                if (Array.isArray(links)) {
                    setFormData(prev => ({
                        ...prev,
                        internal_links: [...(prev.internal_links || []), ...links]
                    }));
                }
            } catch (e) {
                console.error('Failed to parse links JSON', e);
            }
        } catch (error) {
            console.error('Link suggestion failed', error);
        } finally {
            setIsAiSuggesting(false);
        }
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
        
        return `Vol: ${vol} | Comp: ${comp} | Used in ${serviceUsage} other Service(s)`;
    };

    const handleExport = () => exportToCSV(filteredData, 'services_master_export');

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
                <div className="border-b border-slate-200 px-6 bg-white flex-shrink-0">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-hide">
                        {['Core', 'Navigation', 'Strategic', 'Content', 'SEO', 'SMM', 'Technical', 'Linking', 'Governance'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto space-y-12 pb-20">
                        
                        {/* --- TAB: CORE --- */}
                        {activeTab === 'Core' && (
                            <div className="space-y-10">
                                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-6">Identity & Taxonomy</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Tooltip content="The primary name displayed to users in menus and headers.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Service Name *</label>
                                                <input type="text" value={formData.service_name} onChange={(e) => { setFormData({...formData, service_name: e.target.value}); if(!editingItem && !formData.slug) handleSlugChange(e.target.value); }} className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Unique internal identifier (e.g., SRV-001) for system referencing.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Service Code</label>
                                                <input type="text" value={formData.service_code} onChange={(e) => setFormData({...formData, service_code: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="SRV-XXX" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Shorter text used in navigation menus (can be different from service name).">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Menu Heading</label>
                                                <input type="text" value={formData.menu_heading} onChange={(e) => setFormData({...formData, menu_heading: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="Short menu text" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="One-line pitch used in cards and listings.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Short Tagline</label>
                                                <input type="text" value={formData.short_tagline} onChange={(e) => setFormData({...formData, short_tagline: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="One-line description" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="URL-friendly identifier. Auto-generated from name if empty.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Slug</label>
                                                <input type="text" value={formData.slug} onChange={(e) => handleSlugChange(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-slate-50" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Language code for this specific service version (e.g., en, es).">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Language</label>
                                                <select value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option>
                                                </select>
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div className="mt-8">
                                        <Tooltip content="A detailed description of the service offering used for internal reference and summaries.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                                                <textarea value={formData.service_description} onChange={(e) => setFormData({...formData, service_description: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg h-32 text-sm focus:ring-2 focus:ring-indigo-500" />
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>

                                {/* Master Integrations */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                        <Tooltip content="Select relevant industries from the Industry Master table. Used for filtering and personalization.">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Target Industries (Master Linked)</label>
                                            <div className="border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto bg-slate-50 grid grid-cols-1 gap-2">
                                                {industrySectors.map(ind => (
                                                    <label key={ind.id} className="flex items-center space-x-3 cursor-pointer p-2.5 hover:bg-white rounded transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={formData.industry_ids?.includes(ind.industry)}
                                                            onChange={() => toggleSelection('industry_ids', ind.industry)}
                                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                                                        />
                                                        <span className="text-sm text-slate-700">{ind.industry}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                        <Tooltip content="Select target countries from the Country Master table. Determines regional availability.">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Target Countries (Master Linked)</label>
                                            <div className="border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto bg-slate-50 grid grid-cols-1 gap-2">
                                                {countries.map(c => (
                                                    <label key={c.id} className="flex items-center space-x-3 cursor-pointer p-2.5 hover:bg-white rounded transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={formData.country_ids?.includes(c.code)}
                                                            onChange={() => toggleSelection('country_ids', c.code)}
                                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                                                        />
                                                        <span className="text-sm text-slate-700">{c.country_name}</span>
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
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-6">Menu & Sitemap Configuration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <Tooltip content="Toggle if this page should appear in the primary navigation menu.">
                                            <label className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                                <input type="checkbox" checked={formData.show_in_main_menu} onChange={(e) => setFormData({...formData, show_in_main_menu: e.target.checked})} className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500" />
                                                <span className="text-sm font-bold text-slate-700">Show in Main Menu</span>
                                            </label>
                                        </Tooltip>
                                        <Tooltip content="Toggle if this page should appear in the footer links.">
                                            <label className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                                <input type="checkbox" checked={formData.show_in_footer_menu} onChange={(e) => setFormData({...formData, show_in_footer_menu: e.target.checked})} className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500" />
                                                <span className="text-sm font-bold text-slate-700">Show in Footer</span>
                                            </label>
                                        </Tooltip>
                                        <Tooltip content="Include this page in the auto-generated XML sitemap for search engines.">
                                            <label className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                                <input type="checkbox" checked={formData.include_in_xml_sitemap} onChange={(e) => setFormData({...formData, include_in_xml_sitemap: e.target.checked})} className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500" />
                                                <span className="text-sm font-bold text-slate-700">Include in XML Sitemap</span>
                                            </label>
                                        </Tooltip>
                                    </div>
                                    <div className="space-y-6">
                                        <Tooltip content="Grouping label for nested menus (e.g. 'Consulting Services').">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Menu Group</label>
                                                <input type="text" value={formData.menu_group} onChange={(e) => setFormData({...formData, menu_group: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Products" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Numeric order for sorting within the menu group.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Menu Position Order</label>
                                                <input type="number" value={formData.menu_position} onChange={(e) => setFormData({...formData, menu_position: parseInt(e.target.value)})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Label used in breadcrumb navigation trail.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Breadcrumb Label</label>
                                                <input type="text" value={formData.breadcrumb_label} onChange={(e) => setFormData({...formData, breadcrumb_label: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="If nested under a mega-menu heading, specify the parent section name.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Parent Menu Section</label>
                                                <input type="text" value={formData.parent_menu_section || ''} onChange={(e) => setFormData({...formData, parent_menu_section: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Consulting Services" />
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                                    <Tooltip content="Priority hint for search engine crawlers (0.0 to 1.0).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sitemap Priority</label>
                                            <select value={formData.sitemap_priority} onChange={(e) => setFormData({...formData, sitemap_priority: parseFloat(e.target.value)})} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value={1.0}>1.0 (Highest)</option>
                                                <option value={0.8}>0.8 (High)</option>
                                                <option value={0.5}>0.5 (Medium)</option>
                                                <option value={0.3}>0.3 (Low)</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Expected frequency of page updates.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Change Frequency</label>
                                            <select value={formData.sitemap_changefreq} onChange={(e) => setFormData({...formData, sitemap_changefreq: e.target.value as any})} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
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
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-6">Strategy & Targeting</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Tooltip content="Defines the editorial structure of the page (Linked to Content Type Master).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Content Type</label>
                                            <select value={formData.content_type} onChange={(e) => setFormData({...formData, content_type: e.target.value as any})} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                {contentTypes.map(ct => (
                                                    <option key={ct.id} value={ct.content_type}>{ct.content_type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Target stage in the customer funnel.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Buyer Journey Stage</label>
                                            <select value={formData.buyer_journey_stage} onChange={(e) => setFormData({...formData, buyer_journey_stage: e.target.value as any})} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option>Awareness</option>
                                                <option>Consideration</option>
                                                <option>Decision</option>
                                                <option>Retention</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Primary persona for this service (from Persona Master).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary Persona ID</label>
                                            <input type="number" value={formData.primary_persona_id || 0} onChange={(e) => setFormData({...formData, primary_persona_id: parseInt(e.target.value) || 0})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="Persona ID" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Secondary personas (multi-select).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Secondary Persona IDs</label>
                                            <input type="text" value={formData.secondary_persona_ids?.join(', ') || ''} onChange={(e) => setFormData({...formData, secondary_persona_ids: e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="Comma-separated IDs" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Primary Call-to-Action text.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary CTA Label</label>
                                            <input type="text" value={formData.primary_cta_label} onChange={(e) => setFormData({...formData, primary_cta_label: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Get Started" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Destination URL for the primary CTA.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary CTA URL</label>
                                            <input type="text" value={formData.primary_cta_url} onChange={(e) => setFormData({...formData, primary_cta_url: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="https://..." />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Linked Form ID (Zoho/HubSpot/internal).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Form ID</label>
                                            <input type="number" value={formData.form_id || 0} onChange={(e) => setFormData({...formData, form_id: parseInt(e.target.value) || 0})} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="Form ID" />
                                        </div>
                                    </Tooltip>
                                </div>
                                
                                <div className="mt-8">
                                    <Tooltip content="Notes on target segment (industry size, geos, ticket size).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Segment Notes</label>
                                            <textarea value={formData.target_segment_notes} onChange={(e) => setFormData({...formData, target_segment_notes: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg h-32 text-sm" placeholder="ICP details..." />
                                        </div>
                                    </Tooltip>
                                </div>
                                
                                <div className="mt-8">
                                    <Tooltip content="Associate this service with active marketing campaigns (Linked to Campaign Master).">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Linked Campaigns</label>
                                        <div className="border border-slate-200 rounded-lg p-4 max-h-40 overflow-y-auto bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {campaigns.map(camp => (
                                                <label key={camp.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white rounded transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={formData.linked_campaign_ids?.includes(camp.id)}
                                                        onChange={() => toggleSelection('linked_campaign_ids', camp.id)}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                                                    />
                                                    <span className="text-sm text-slate-700">{camp.campaign_name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: CONTENT --- */}
                        {activeTab === 'Content' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-10">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-6">Page Content Structure</h3>

                                {/* Content snapshot */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                                        <p className="text-[11px] uppercase font-bold text-slate-500 tracking-widest">Word Count</p>
                                        <div className="flex items-end justify-between mt-3">
                                            <span className="text-2xl font-bold text-slate-900">{contentWordCount}</span>
                                            <span className="text-xs font-semibold text-slate-500">~{readingMinutes} min read</span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                                        <p className="text-[11px] uppercase font-bold text-slate-500 tracking-widest">Structured Headings</p>
                                        <div className="flex items-end justify-between mt-3">
                                            <span className="text-2xl font-bold text-slate-900">{totalHeadings}</span>
                                            <span className="text-xs font-semibold text-slate-500">H2:{headingCounts.h2} / H3:{headingCounts.h3}</span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                                        <p className="text-[11px] uppercase font-bold text-slate-500 tracking-widest">Internal Links</p>
                                        <div className="flex items-end justify-between mt-3">
                                            <span className="text-2xl font-bold text-slate-900">{internalLinkCount}</span>
                                            <span className="text-xs font-semibold text-slate-500">{externalLinkCount} external</span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-4 bg-indigo-50">
                                        <p className="text-[11px] uppercase font-bold text-indigo-600 tracking-widest">Media Alt Coverage</p>
                                        <div className="flex items-end justify-between mt-3">
                                            <span className="text-2xl font-bold text-indigo-700">{imageAltCount}</span>
                                            <span className="text-xs font-semibold text-indigo-500">Alt tags</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <Tooltip content="The main H1 tag for the page. Essential for SEO.">
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="block text-xs font-bold text-slate-600 uppercase">H1 Heading</label>
                                                    <button onClick={async () => {
                                                    if (!formData.service_description && !formData.body_content) {
                                                        alert('Please add service description or body content first');
                                                        return;
                                                    }
                                                    setIsAiSuggesting(true);
                                                    try {
                                                        const prompt = `Suggest an optimal H1 heading for SEO and clarity for this service: "${formData.service_description || formData.body_content?.substring(0, 500)}". 
Return just the H1 text, optimized for SEO with focus keywords.`;
                                                        const result = await runQuery(prompt);
                                                        setFormData(prev => ({ ...prev, h1: result.text.trim().replace(/['"]/g, '') }));
                                                    } catch (error) {
                                                        console.error('H1 suggestion failed', error);
                                                    } finally {
                                                        setIsAiSuggesting(false);
                                                    }
                                                }} disabled={isAiSuggesting} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                    {SparkIcon} {isAiSuggesting ? 'Suggesting...' : 'AI Suggest'}
                                                </button>
                                            </div>
                                                <input type="text" value={formData.h1} onChange={(e) => setFormData({...formData, h1: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="Craft a compelling primary headline" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="List of H2 subheadings. Defines the document outline.">
                                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.25)]">
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="block text-xs font-bold text-slate-600 uppercase">H2 Headings</label>
                                                    <button onClick={async () => {
                                                    if (!formData.service_description && !formData.body_content) {
                                                        alert('Please add service description or body content first');
                                                        return;
                                                    }
                                                    setIsAiSuggesting(true);
                                                    try {
                                                        const prompt = `Suggest 5-7 optimal H2 headings for SEO and content structure for this service: "${formData.service_description || formData.body_content?.substring(0, 500)}". 
Return as JSON array: ["H2 heading 1", "H2 heading 2", ...]`;
                                                        const result = await runQuery(prompt);
                                                        try {
                                                            const h2s = JSON.parse(result.text);
                                                            if (Array.isArray(h2s)) {
                                                                setFormData(prev => ({ ...prev, h2_list: [...(prev.h2_list || []), ...h2s] }));
                                                            }
                                                        } catch (e) {
                                                            console.error('Failed to parse H2 JSON', e);
                                                        }
                                                    } catch (error) {
                                                        console.error('H2 suggestion failed', error);
                                                    } finally {
                                                        setIsAiSuggesting(false);
                                                    }
                                                }} disabled={isAiSuggesting} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                    {SparkIcon} {isAiSuggesting ? 'Suggesting...' : 'AI Suggest Structure'}
                                                </button>
                                            </div>
                                            <div className="flex gap-3 mb-3">
                                                <input type="text" value={tempH2} onChange={(e) => setTempH2(e.target.value)} className="flex-1 p-3 border border-slate-300 rounded-lg text-sm" placeholder="Add H2..." />
                                                <button onClick={() => addToList('h2_list', tempH2, setTempH2)} className="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold text-xs shadow hover:bg-slate-800">Add</button>
                                            </div>
                                            <ul className="space-y-3">
                                                {formData.h2_list?.map((h, i) => (
                                                    <li key={i} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                        <span className="font-medium text-slate-700">{h}</span>
                                                        <button onClick={() => removeFromList('h2_list', i)} className="text-slate-400 hover:text-red-500 font-bold p-1.5 hover:bg-red-50 rounded">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                            {(!formData.h2_list || formData.h2_list.length === 0) && (
                                                <div className="text-xs text-slate-400 italic text-center py-3 border border-dashed border-slate-200 rounded-lg mt-3">No H2 headings yet. Add at least three for readability.</div>
                                            )}
                                        </div>
                                    </Tooltip>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <Tooltip content="List of H3 subheadings.">
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                                <label className="block text-xs font-bold text-slate-600 uppercase mb-3">H3 Headings</label>
                                            <div className="flex gap-3 mb-3">
                                                <input type="text" value={tempH3} onChange={(e) => setTempH3(e.target.value)} className="flex-1 p-3 border border-slate-300 rounded-lg text-sm" placeholder="Add H3..." />
                                                    <button onClick={() => addToList('h3_list', tempH3, setTempH3)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-xs">Add</button>
                                            </div>
                                            <ul className="space-y-3">
                                                {formData.h3_list?.map((h, i) => (
                                                    <li key={i} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                        <span className="font-medium text-slate-700">{h}</span>
                                                        <button onClick={() => removeFromList('h3_list', i)} className="text-slate-400 hover:text-red-500 font-bold p-1.5 hover:bg-red-50 rounded">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="List of H4 subheadings.">
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-3">H4 Headings</label>
                                            <div className="flex gap-3 mb-3">
                                                <input type="text" value={tempH4} onChange={(e) => setTempH4(e.target.value)} className="flex-1 p-3 border border-slate-300 rounded-lg text-sm" placeholder="Add H4..." />
                                                <button onClick={() => addToList('h4_list', tempH4, setTempH4)} className="bg-slate-100 text-slate-600 px-5 py-2 rounded-lg font-bold border border-slate-200 hover:bg-slate-200">+</button>
                                            </div>
                                            <ul className="space-y-3">
                                                {formData.h4_list?.map((h, i) => (
                                                    <li key={i} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                        <span className="font-medium text-slate-700">{h}</span>
                                                        <button onClick={() => removeFromList('h4_list', i)} className="text-slate-400 hover:text-red-500 font-bold p-1.5 hover:bg-red-50 rounded">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="List of H5 subheadings.">
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-3">H5 Headings</label>
                                            <div className="flex gap-3 mb-3">
                                                <input type="text" value={tempH5} onChange={(e) => setTempH5(e.target.value)} className="flex-1 p-3 border border-slate-300 rounded-lg text-sm" placeholder="Add H5..." />
                                                <button onClick={() => addToList('h5_list', tempH5, setTempH5)} className="bg-slate-100 text-slate-600 px-5 py-2 rounded-lg font-bold border border-slate-200 hover:bg-slate-200">+</button>
                                            </div>
                                            <ul className="space-y-3">
                                                {formData.h5_list?.map((h, i) => (
                                                    <li key={i} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                        <span className="font-medium text-slate-700">{h}</span>
                                                        <button onClick={() => removeFromList('h5_list', i)} className="text-slate-400 hover:text-red-500 font-bold p-1.5 hover:bg-red-50 rounded">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Tooltip>
                                    </div>

                                    <Tooltip content="Main body copy. Supports Markdown formatting. Word count and reading time are auto-calculated.">
                                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-inner">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="block text-xs font-bold text-slate-600 uppercase">Body Content</label>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span>{contentWordCount} words</span>
                                                    <span>•</span>
                                                    <span>~{readingMinutes} min read</span>
                                                </div>
                                            </div>
                                            <textarea value={formData.body_content} onChange={(e) => setFormData({...formData, body_content: e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl h-96 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 bg-slate-50" placeholder="# Write content here..." />
                                        </div>
                                    </Tooltip>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Internal Links */}
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase">Internal Links</label>
                                                    <p className="text-[12px] text-slate-500">{internalLinkCount} contextual links added</p>
                                                </div>
                                                <button onClick={suggestInternalLinks} disabled={isAiSuggesting} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                    {SparkIcon} {isAiSuggesting ? 'Suggesting...' : 'AI Suggest'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 mb-3">
                                                <input type="text" value={tempInternalLink.url} onChange={(e) => setTempInternalLink({...tempInternalLink, url: e.target.value})} className="p-3 border border-slate-300 rounded-lg text-sm bg-white" placeholder="URL" />
                                                <input type="text" value={tempInternalLink.anchor_text} onChange={(e) => setTempInternalLink({...tempInternalLink, anchor_text: e.target.value})} className="p-3 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Anchor Text" />
                                                <select value={tempInternalLink.target_type} onChange={(e) => setTempInternalLink({...tempInternalLink, target_type: e.target.value})} className="p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="service">Service</option>
                                                    <option value="subservice">Sub-service</option>
                                                    <option value="asset">Asset</option>
                                                </select>
                                            </div>
                                            <button onClick={addInternalLink} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 mb-3">+ Add Link</button>
                                            <ul className="space-y-3">
                                                {formData.internal_links?.map((link: any, i: number) => (
                                                    <li key={i} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-slate-200">
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{link.anchor_text}</p>
                                                            <p className="text-[12px] text-slate-500">{link.url}</p>
                                                        </div>
                                                        <button onClick={() => removeFromList('internal_links', i)} className="text-slate-400 hover:text-red-500 font-bold p-1.5 hover:bg-red-50 rounded">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </li>
                                                ))}
                                                {internalLinkCount === 0 && (
                                                    <p className="text-xs text-slate-400 italic text-center">No internal links yet.</p>
                                                )}
                                            </ul>
                                        </div>

                                        {/* External Links */}
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-4">External Links</label>
                                            <div className="grid grid-cols-3 gap-3 mb-3">
                                                <input type="text" value={tempExternalLink.url} onChange={(e) => setTempExternalLink({...tempExternalLink, url: e.target.value})} className="p-3 border border-slate-300 rounded-lg text-sm bg-white" placeholder="URL" />
                                                <input type="text" value={tempExternalLink.anchor_text} onChange={(e) => setTempExternalLink({...tempExternalLink, anchor_text: e.target.value})} className="p-3 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Anchor Text" />
                                                <select value={tempExternalLink.rel} onChange={(e) => setTempExternalLink({...tempExternalLink, rel: e.target.value})} className="p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="nofollow">nofollow</option>
                                                    <option value="follow">follow</option>
                                                    <option value="noopener">noopener</option>
                                                </select>
                                            </div>
                                            <button onClick={addExternalLink} className="bg-white text-indigo-600 px-5 py-2 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-50 mb-3">+ Add Link</button>
                                            <ul className="space-y-3">
                                                {formData.external_links?.map((link: any, i: number) => (
                                                    <li key={i} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-slate-200">
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{link.anchor_text}</p>
                                                            <p className="text-[12px] text-slate-500">{link.url} ({link.rel})</p>
                                                        </div>
                                                        <button onClick={() => removeFromList('external_links', i)} className="text-slate-400 hover:text-red-500 font-bold p-1.5 hover:bg-red-50 rounded">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Image Alt Texts */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-4">Image Alt Texts</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                            <input type="text" value={tempImageAlt.image_id} onChange={(e) => setTempImageAlt({...tempImageAlt, image_id: e.target.value})} className="p-3 border border-slate-300 rounded-lg text-sm bg-slate-50" placeholder="Image ID/URL" />
                                            <input type="text" value={tempImageAlt.alt_text} onChange={(e) => setTempImageAlt({...tempImageAlt, alt_text: e.target.value})} className="p-3 border border-slate-300 rounded-lg text-sm bg-slate-50" placeholder="Alt Text" />
                                            <input type="text" value={tempImageAlt.context} onChange={(e) => setTempImageAlt({...tempImageAlt, context: e.target.value})} className="p-3 border border-slate-300 rounded-lg text-sm bg-slate-50" placeholder="Context" />
                                        </div>
                                        <button onClick={addImageAlt} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 mb-3">+ Add Alt Text</button>
                                        <ul className="space-y-3">
                                            {formData.image_alt_texts?.map((img: any, i: number) => (
                                                <li key={i} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{img.image_id}</p>
                                                        <p className="text-[12px] text-slate-500">{img.alt_text} – {img.context}</p>
                                                    </div>
                                                    <button onClick={() => removeFromList('image_alt_texts', i)} className="text-slate-400 hover:text-red-500 font-bold p-1.5 hover:bg-red-50 rounded">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </li>
                                            ))}
                                            {imageAltCount === 0 && (
                                                <p className="text-xs text-slate-400 italic text-center">No media assets documented yet.</p>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: SEO --- */}
                        {activeTab === 'SEO' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-6">Search Engine Optimization</h3>

                                {/* Snapshot cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                                        <p className="text-[11px] uppercase font-bold text-slate-500 tracking-widest">Meta Title</p>
                                        <div className="flex items-end justify-between mt-3">
                                            <span className="text-2xl font-bold text-slate-900">{metaTitleCount}/60</span>
                                            <span className={`text-xs font-semibold ${metaTitleCount > 60 ? 'text-red-500' : metaTitleCount >= 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {metaTitleCount > 60 ? 'Trim it' : metaTitleCount >= 50 ? 'Perfect' : 'Add more'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                                        <p className="text-[11px] uppercase font-bold text-slate-500 tracking-widest">Meta Description</p>
                                        <div className="flex items-end justify-between mt-3">
                                            <span className="text-2xl font-bold text-slate-900">{metaDescriptionCount}/160</span>
                                            <span className={`text-xs font-semibold ${metaDescriptionCount > 160 ? 'text-red-500' : metaDescriptionCount >= 140 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {metaDescriptionCount > 160 ? 'Trim it' : metaDescriptionCount >= 140 ? 'Perfect' : 'Add more'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                                        <p className="text-[11px] uppercase font-bold text-slate-500 tracking-widest">Focus Keywords</p>
                                        <div className="flex items-end justify-between mt-3">
                                            <span className="text-2xl font-bold text-slate-900">{focusKeywordCount}</span>
                                            <span className="text-xs font-semibold text-slate-500">{secondaryKeywordCount} secondary</span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-4 bg-indigo-50">
                                        <p className="text-[11px] uppercase font-bold text-indigo-600 tracking-widest">SEO Score</p>
                                        <div className="flex items-end justify-between mt-3">
                                            <span className="text-2xl font-bold text-indigo-700">{formData.seo_score ?? 0}</span>
                                            <span className="text-xs font-semibold text-indigo-500">/100</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Tooltip content="The <title> tag. Optimal length: 50-60 characters.">
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-600 uppercase">Meta Title</p>
                                                    <p className="text-[12px] text-slate-500">Displayed in SERP headline</p>
                                                </div>
                                                <span className={`text-xs font-mono px-3 py-1 rounded-full ${metaTitleCount > 60 ? 'bg-red-50 text-red-600' : 'bg-slate-200 text-slate-600'}`}>{metaTitleCount}/60</span>
                                            </div>
                                            <input type="text" value={formData.meta_title} onChange={(e) => setFormData({...formData, meta_title: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="e.g. Technical SEO Audit & Optimization Services" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="The meta description tag. Optimal length: 150-160 characters.">
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-600 uppercase">Meta Description</p>
                                                    <p className="text-[12px] text-slate-500">Persuasive summary for SERP</p>
                                                </div>
                                                <span className={`text-xs font-mono px-3 py-1 rounded-full ${metaDescriptionCount > 160 ? 'bg-red-50 text-red-600' : 'bg-slate-200 text-slate-600'}`}>{metaDescriptionCount}/160</span>
                                            </div>
                                            <textarea value={formData.meta_description} onChange={(e) => setFormData({...formData, meta_description: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg h-28 text-sm focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="Summarize the value prop, include CTA & brand mention." />
                                        </div>
                                    </Tooltip>
                                    
                                    {/* Keyword Manager with Metrics */}
                                    <Tooltip content="Primary keywords. Automatically calculates usage count from system data.">
                                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.25)]">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-600 uppercase">Focus Keywords</p>
                                                    <p className="text-[12px] text-slate-500">Include product/service + intent keywords</p>
                                                </div>
                                                <button onClick={async () => {
                                                    if (!formData.service_description && !formData.service_name) {
                                                        alert('Please add service name or description first');
                                                        return;
                                                    }
                                                    setIsAiSuggesting(true);
                                                    try {
                                                        const prompt = `Suggest 5-7 focus keywords for SEO for this service: "${formData.service_name}. ${formData.service_description || ''}". 
Return as JSON array: ["keyword1", "keyword2", ...]`;
                                                        const result = await runQuery(prompt);
                                                        try {
                                                            const keywords = JSON.parse(result.text);
                                                            if (Array.isArray(keywords)) {
                                                                setFormData(prev => ({ ...prev, focus_keywords: [...(prev.focus_keywords || []), ...keywords] }));
                                                            }
                                                        } catch (e) {
                                                            console.error('Failed to parse keywords JSON', e);
                                                        }
                                                    } catch (error) {
                                                        console.error('Keyword suggestion failed', error);
                                                    } finally {
                                                        setIsAiSuggesting(false);
                                                    }
                                                }} disabled={isAiSuggesting} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                    {SparkIcon} {isAiSuggesting ? 'Suggesting...' : 'AI Suggest Keywords'}
                                                </button>
                                            </div>
                                            <div className="flex gap-3 mb-4">
                                                <input type="text" value={tempKeyword} onChange={(e) => setTempKeyword(e.target.value)} className="flex-1 p-3 border border-slate-300 rounded-lg text-sm" placeholder="Add Keyword..." />
                                                <button onClick={() => addToList('focus_keywords', tempKeyword, setTempKeyword)} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700">Add</button>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {formData.focus_keywords?.map((k, idx) => (
                                                    <div key={idx} className="bg-indigo-50 border border-indigo-100 rounded-lg pl-3 pr-2 py-1.5 flex items-center shadow-sm">
                                                        <div className="flex flex-col mr-3">
                                                            <span className="text-sm font-semibold text-indigo-900">{k}</span>
                                                            <span className="text-[10px] text-indigo-500 font-mono tracking-wide">{getKeywordMetric(k)}</span>
                                                        </div>
                                                        <button onClick={() => removeFromList('focus_keywords', idx)} className="text-slate-400 hover:text-red-500 p-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!formData.focus_keywords || formData.focus_keywords.length === 0) && (
                                                    <p className="text-sm text-slate-400 italic">No keywords added.</p>
                                                )}
                                            </div>
                                        </div>
                                    </Tooltip>

                                    {/* Secondary Keywords */}
                                    <Tooltip content="Supporting/secondary keywords for this service.">
                                        <div className="bg-white border border-slate-200 rounded-xl p-5">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase">Secondary Keywords</label>
                                                    <p className="text-[12px] text-slate-500">Semantic and long-tail variants</p>
                                                </div>
                                                <button onClick={async () => {
                                                    if (!formData.service_description && !formData.service_name) {
                                                        alert('Please add service name or description first');
                                                        return;
                                                    }
                                                    setIsAiSuggesting(true);
                                                    try {
                                                        const prompt = `Suggest 5-7 secondary/supporting keywords for SEO for this service: "${formData.service_name}. ${formData.service_description || ''}". 
Return as JSON array: ["keyword1", "keyword2", ...]`;
                                                        const result = await runQuery(prompt);
                                                        try {
                                                            const keywords = JSON.parse(result.text);
                                                            if (Array.isArray(keywords)) {
                                                                setFormData(prev => ({ ...prev, secondary_keywords: [...(prev.secondary_keywords || []), ...keywords] }));
                                                            }
                                                        } catch (e) {
                                                            console.error('Failed to parse keywords JSON', e);
                                                        }
                                                    } catch (error) {
                                                        console.error('Keyword suggestion failed', error);
                                                    } finally {
                                                        setIsAiSuggesting(false);
                                                    }
                                                }} disabled={isAiSuggesting} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                    {SparkIcon} {isAiSuggesting ? 'Suggesting...' : 'AI Suggest'}
                                                </button>
                                            </div>
                                            <div className="flex gap-2 mb-3">
                                                <input type="text" value={tempSecondaryKeyword} onChange={(e) => setTempSecondaryKeyword(e.target.value)} className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Add Secondary Keyword..." />
                                                <button onClick={() => addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword)} className="bg-slate-900 text-white px-4 rounded-lg text-xs font-bold border border-slate-900 hover:bg-slate-800">Add</button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.secondary_keywords?.map((k, idx) => (
                                                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-2 py-1.5 flex items-center">
                                                        <span className="text-sm font-medium text-slate-600 mr-2">{k}</span>
                                                        <button onClick={() => removeFromList('secondary_keywords', idx)} className="text-slate-400 hover:text-red-500 p-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Tooltip>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Tooltip content="SEO score from internal scoring tool (0-100).">
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Score</label>
                                                <input type="number" min="0" max="100" value={formData.seo_score || 0} onChange={(e) => setFormData({...formData, seo_score: parseInt(e.target.value) || 0})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Notes on top 3-5 keyword rankings or comments.">
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ranking Summary</label>
                                                <textarea value={formData.ranking_summary} onChange={(e) => setFormData({...formData, ranking_summary: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg h-20 text-sm bg-white" placeholder="Top keyword rankings, SERP notes, cannibalization warnings..." />
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: SMM --- */}
                        {activeTab === 'SMM' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-6">Social Media Metadata</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                                        <p className="text-[11px] uppercase font-bold text-slate-500 tracking-widest">OG Preview</p>
                                        <div className="flex items-end justify-between mt-3">
                                            <span className={`text-sm font-semibold ${socialPreviewReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {socialPreviewReady ? 'Ready for share' : 'Incomplete'}
                                            </span>
                                            <span className="text-xs text-slate-500">Title + Desc + Image</span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                                        <p className="text-[11px] uppercase font-bold text-slate-500 tracking-widest">Twitter Card</p>
                                        <div className="flex items-end justify-between mt-3">
                                            <span className={`text-sm font-semibold ${twitterPreviewReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {twitterPreviewReady ? 'Ready' : 'Needs copy'}
                                            </span>
                                            <span className="text-xs text-slate-500">Title + Desc</span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-4 bg-indigo-50">
                                        <p className="text-[11px] uppercase font-bold text-indigo-600 tracking-widest">Share Image</p>
                                        <div className="flex items-end justify-between mt-3">
                                            <span className="text-sm font-semibold text-indigo-700">{formData.og_image_url ? 'Set' : 'Missing'}</span>
                                            <span className="text-xs text-indigo-500 break-all truncate max-w-[120px]">{formData.og_image_url || 'Add URL'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Tooltip content="Open Graph Title (Facebook, LinkedIn). Defaults to SEO Title if empty.">
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">OG Title</label>
                                                <input type="text" value={formData.og_title} onChange={(e) => setFormData({...formData, og_title: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" placeholder="e.g. Technical SEO Services – Brand Name" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Twitter Card Title. Defaults to OG Title if empty.">
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Twitter Title</label>
                                                <input type="text" value={formData.twitter_title} onChange={(e) => setFormData({...formData, twitter_title: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Shorter title for X/Twitter" />
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Tooltip content="Open Graph Description.">
                                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">OG Description</label>
                                                <textarea value={formData.og_description} onChange={(e) => setFormData({...formData,og_description: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg h-24 text-sm" placeholder="Add persuasive copy for LinkedIn/Facebook preview" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Twitter Card Description.">
                                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Twitter Description</label>
                                                <textarea value={formData.twitter_description} onChange={(e) => setFormData({...formData, twitter_description: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg h-24 text-sm" placeholder="125 char limit recommended" />
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Tooltip content="URL of the image to display on social shares.">
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Social Share Image URL</label>
                                                <input type="text" value={formData.og_image_url} onChange={(e) => setFormData({...formData, og_image_url: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" placeholder="https://..." />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Open Graph type to control render.">
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">OG Type</label>
                                                <select value={formData.og_type || 'website'} onChange={(e) => setFormData({...formData, og_type: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="website">Website</option>
                                                    <option value="article">Article</option>
                                                    <option value="product">Product</option>
                                                </select>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: TECHNICAL --- */}
                        {activeTab === 'Technical' && (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-2 mb-4">Technical SEO Configuration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Tooltip content="Schema.org type (e.g. Service, Product, Article).">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Schema Type</label>
                                                <button onClick={async () => {
                                                    if (!formData.service_description) return;
                                                    setIsAiSuggesting(true);
                                                    try {
                                                        const prompt = `Suggest the best Schema.org type and required schema fields for this service: "${formData.service_description}". 
Return JSON: {"type": "Service", "fields": ["name", "description", "provider", ...]}`;
                                                        const result = await runQuery(prompt);
                                                        try {
                                                            const schema = JSON.parse(result.text);
                                                            if (schema.type) {
                                                                setFormData(prev => ({ ...prev, schema_type_id: schema.type }));
                                                            }
                                                            if (schema.fields && Array.isArray(schema.fields)) {
                                                                alert(`Suggested Schema Type: ${schema.type}\nRecommended Fields: ${schema.fields.join(', ')}`);
                                                            }
                                                        } catch (e) {
                                                            const suggestedType = result.text.trim().replace(/['"]/g, '');
                                                            setFormData(prev => ({ ...prev, schema_type_id: suggestedType }));
                                                        }
                                                    } catch (error) {
                                                        console.error('Schema suggestion failed', error);
                                                    } finally {
                                                        setIsAiSuggesting(false);
                                                    }
                                                }} disabled={isAiSuggesting} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                    {SparkIcon} {isAiSuggesting ? 'Suggesting...' : 'AI Suggest Type & Fields'}
                                                </button>
                                            </div>
                                            <input type="text" value={formData.schema_type_id} onChange={(e) => setFormData({...formData, schema_type_id: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Service" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Canonical URL to prevent duplicate content issues.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Canonical URL</label>
                                            <input type="text" value={formData.canonical_url} onChange={(e) => setFormData({...formData, canonical_url: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="https://..." />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Robots meta tag indexing instruction.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Robots Index</label>
                                            <select value={formData.robots_index} onChange={(e) => setFormData({...formData, robots_index: e.target.value as any})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value="index">Index</option>
                                                <option value="noindex">No Index</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Robots meta tag following instruction.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Robots Follow</label>
                                            <select value={formData.robots_follow} onChange={(e) => setFormData({...formData, robots_follow: e.target.value as any})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value="follow">Follow</option>
                                                <option value="nofollow">No Follow</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Custom robots meta tag if needed (e.g., noindex, nofollow, noarchive).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Robots Custom</label>
                                            <input type="text" value={formData.robots_custom} onChange={(e) => setFormData({...formData, robots_custom: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="e.g. noindex, nofollow" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Hreflang group ID for multi-language/country variants.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hreflang Group ID</label>
                                            <input type="number" value={formData.hreflang_group_id || 0} onChange={(e) => setFormData({...formData, hreflang_group_id: parseInt(e.target.value) || 0})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Group ID" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Core Web Vitals status.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Core Web Vitals Status</label>
                                            <select value={formData.core_web_vitals_status} onChange={(e) => setFormData({...formData, core_web_vitals_status: e.target.value as any})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value="Good">Good</option>
                                                <option value="Needs Improvement">Needs Improvement</option>
                                                <option value="Poor">Poor</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Technical SEO status.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tech SEO Status</label>
                                            <select value={formData.tech_seo_status} onChange={(e) => setFormData({...formData, tech_seo_status: e.target.value as any})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value="Ok">Ok</option>
                                                <option value="Warning">Warning</option>
                                                <option value="Critical">Critical</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                </div>
                                
                                <div className="mt-4">
                                    <Tooltip content="List of URLs that should 301 redirect to this service page.">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">301 Redirects (From)</label>
                                        <div className="flex gap-2 mb-2">
                                            <input type="text" value={tempRedirect} onChange={(e) => setTempRedirect(e.target.value)} className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="/old-url" />
                                            <button onClick={() => addToList('redirect_from_urls', tempRedirect, setTempRedirect)} className="bg-slate-100 text-slate-600 px-4 rounded-lg font-bold border border-slate-200 hover:bg-slate-200">+</button>
                                        </div>
                                        <ul className="space-y-2">
                                            {formData.redirect_from_urls?.map((url, i) => (
                                                <li key={i} className="flex justify-between items-center text-sm bg-slate-50 p-2.5 rounded border border-slate-200">
                                                    <span className="font-mono text-slate-600">{url}</span>
                                                    <button onClick={() => removeFromList('redirect_from_urls', i)} className="text-slate-400 hover:text-red-500 font-bold p-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </Tooltip>
                                </div>

                                {/* FAQ Section */}
                                <div className="mt-6 border-t border-slate-200 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <Tooltip content="Enable FAQ section for this service page.">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={formData.faq_section_enabled} onChange={(e) => setFormData({...formData, faq_section_enabled: e.target.checked})} className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500" />
                                                    <span className="text-sm font-bold text-slate-700">Enable FAQ Section</span>
                                                </label>
                                            </Tooltip>
                                        </div>
                                        {formData.faq_section_enabled && (
                                            <button onClick={generateFAQs} disabled={isAiSuggesting} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                {SparkIcon} {isAiSuggesting ? 'Generating...' : 'AI Generate FAQs'}
                                            </button>
                                        )}
                                    </div>
                                    {formData.faq_section_enabled && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" value={tempFAQ.question} onChange={(e) => setTempFAQ({...tempFAQ, question: e.target.value})} className="p-2 border border-slate-300 rounded-lg text-sm" placeholder="Question" />
                                                <input type="text" value={tempFAQ.answer} onChange={(e) => setTempFAQ({...tempFAQ, answer: e.target.value})} className="p-2 border border-slate-300 rounded-lg text-sm" placeholder="Answer" />
                                            </div>
                                            <button onClick={addFAQ} className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100">+ Add FAQ</button>
                                            <ul className="space-y-2">
                                                {formData.faq_content?.map((faq: any, i: number) => (
                                                    <li key={i} className="bg-slate-50 p-3 rounded border border-slate-200">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-bold text-sm text-slate-800">{faq.question}</span>
                                                            <button onClick={() => removeFromList('faq_content', i)} className="text-slate-400 hover:text-red-500 font-bold p-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-slate-600">{faq.answer}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- TAB: LINKING (ASSETS & SUB-SERVICES) --- */}
                        {activeTab === 'Linking' && (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-2 mb-4">Sub-Services & Asset Management</h3>
                                
                                {/* Sub-Services Section */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase">
                                            Linked Sub-Services
                                            <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 rounded-full">{linkedSubServices.length}</span>
                                        </h4>
                                        <div className="text-xs text-slate-500">
                                            {formData.has_subservices ? 'Has Sub-services' : 'No Sub-services'}
                                            {formData.subservice_count > 0 && ` (${formData.subservice_count} total)`}
                                        </div>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 max-h-64 overflow-y-auto">
                                        {linkedSubServices.length > 0 ? (
                                            <div className="space-y-2">
                                                {linkedSubServices.map(sub => (
                                                    <div key={sub.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                                        <div>
                                                            <p className="font-medium text-sm text-slate-800">{sub.sub_service_name}</p>
                                                            <p className="text-[10px] text-slate-500">{sub.full_url || sub.slug}</p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${sub.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {sub.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic text-center py-4">No sub-services linked. Create sub-services in the Sub-Service Master view.</p>
                                        )}
                                    </div>
                                    {formData.primary_subservice_id && (
                                        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                            <p className="text-xs font-bold text-indigo-700 uppercase mb-1">Primary Sub-Service</p>
                                            <p className="text-sm text-indigo-900">
                                                {linkedSubServices.find(s => s.id === formData.primary_subservice_id)?.sub_service_name || `ID: ${formData.primary_subservice_id}`}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Assets Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left: Linked Assets */}
                                    <div className="flex flex-col h-[500px]">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex justify-between">
                                            <span>Attached Assets</span>
                                            <span className="bg-indigo-100 text-indigo-700 px-2 rounded-full">{linkedAssets.length}</span>
                                        </h4>
                                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 space-y-2">
                                            {linkedAssets.length > 0 ? linkedAssets.map(asset => (
                                                <div key={asset.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors group p-3">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center space-x-3 overflow-hidden flex-1">
                                                            <div className={`w-8 h-8 flex-shrink-0 rounded-md flex items-center justify-center text-xs font-bold text-white uppercase ${
                                                                asset.asset_type === 'image' ? 'bg-purple-500' : asset.asset_type === 'video' ? 'bg-red-500' : 'bg-blue-500'
                                                            }`}>
                                                                {asset.asset_type ? asset.asset_type.slice(0,2).toUpperCase() : 'NA'}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-medium text-sm text-slate-800 truncate" title={asset.content_title_clean}>{asset.content_title_clean}</p>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    <span className="text-[10px] text-slate-500 uppercase bg-slate-100 px-1.5 rounded">{asset.status}</span>
                                                                    {asset.asset_type && <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 rounded">{asset.asset_type}</span>}
                                                                    {asset.asset_category && <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 rounded">{asset.asset_category}</span>}
                                                                    {asset.asset_format && <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 rounded">{asset.asset_format}</span>}
                                                                </div>
                                                                {asset.full_url && (
                                                                    <p className="text-[10px] text-slate-400 font-mono truncate mt-1" title={asset.full_url}>{asset.full_url}</p>
                                                                )}
                                                                {asset.id && (
                                                                    <p className="text-[10px] text-slate-400 mt-0.5">ID: {asset.id}</p>
                                                                )}
                                                                {asset.ai_qc_report && (
                                                                    <p className="text-[10px] text-indigo-600 mt-1">QC Score: {asset.ai_qc_report.score || 'N/A'}/100</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleToggleAssetLink(asset)} 
                                                            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                            title="Unlink Asset"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                                    <p className="text-sm italic">No assets linked.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Available Assets */}
                                    <div className="flex flex-col h-[500px]">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Add Assets from Library</h4>
                                        <div className="mb-2">
                                            <input 
                                                type="text" 
                                                placeholder="Search repository..." 
                                                value={assetSearch}
                                                onChange={(e) => setAssetSearch(e.target.value)}
                                                className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-white p-2 space-y-2">
                                            {availableAssets.length > 0 ? availableAssets.map(asset => (
                                                <div key={asset.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-colors group cursor-pointer" onClick={() => handleToggleAssetLink(asset)}>
                                                    <div className="flex items-center space-x-3 overflow-hidden">
                                                        <div className="w-8 h-8 flex-shrink-0 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold uppercase">
                                                            {asset.asset_type ? asset.asset_type.slice(0,2) : 'NA'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-sm text-slate-700 truncate">{asset.content_title_clean}</p>
                                                            <p className="text-[10px] text-slate-400">ID: {asset.id}</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-indigo-600 opacity-0 group-hover:opacity-100 text-xs font-bold bg-indigo-50 px-2 py-1 rounded">
                                                        Link
                                                    </button>
                                                </div>
                                            )) : (
                                                <div className="p-4 text-center text-sm text-slate-400">
                                                    {assetSearch ? 'No matching assets found.' : 'Search to find assets.'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Linking Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                                    <Tooltip content="Link to Knowledge Hub / Topic Master.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Knowledge Topic ID</label>
                                            <input type="number" value={formData.knowledge_topic_id || 0} onChange={(e) => setFormData({...formData, knowledge_topic_id: parseInt(e.target.value) || 0})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Knowledge Topic ID" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Key article/video to feature on this service page.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Featured Asset ID</label>
                                            <input type="number" value={formData.featured_asset_id || 0} onChange={(e) => setFormData({...formData, featured_asset_id: parseInt(e.target.value) || 0})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Asset ID" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Highlighted sub-service on service page.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Sub-Service ID</label>
                                            <select value={formData.primary_subservice_id || 0} onChange={(e) => setFormData({...formData, primary_subservice_id: parseInt(e.target.value) || 0})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value={0}>None</option>
                                                {linkedSubServices.map(sub => (
                                                    <option key={sub.id} value={sub.id}>{sub.sub_service_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </Tooltip>
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Sub-Services</p>
                                        <p className="text-2xl font-bold text-slate-800">{formData.subservice_count || 0}</p>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Assets</p>
                                        <p className="text-2xl font-bold text-slate-800">{linkedAssets.length}</p>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Featured Asset</p>
                                        <p className="text-sm font-medium text-slate-600">{formData.featured_asset_id ? `ID: ${formData.featured_asset_id}` : 'None'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: GOVERNANCE --- */}
                        {activeTab === 'Governance' && (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-2 mb-4">Ownership, Governance & Versioning</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Tooltip content="Select the brand this service belongs to from the Brand Master.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Brand</label>
                                            <select value={formData.brand_id || 0} onChange={(e) => setFormData({...formData, brand_id: parseInt(e.target.value)})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value={0}>Select Brand...</option>
                                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Business unit or department (e.g., Marketing, R&D, Consulting).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Unit</label>
                                            <input type="text" value={formData.business_unit || ''} onChange={(e) => setFormData({...formData, business_unit: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Marketing" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Person responsible for maintaining this service content.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content Owner</label>
                                            <select value={formData.content_owner_id || 0} onChange={(e) => setFormData({...formData, content_owner_id: parseInt(e.target.value)})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value={0}>Select Owner...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="User who created this service record.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Created By</label>
                                            <select value={formData.created_by || 0} onChange={(e) => setFormData({...formData, created_by: parseInt(e.target.value)})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value={0}>Select User...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="User who last updated this service record.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Updated By</label>
                                            <select value={formData.updated_by || 0} onChange={(e) => setFormData({...formData, updated_by: parseInt(e.target.value)})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option value={0}>Select User...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Current lifecycle status of the service page.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                                                <option>Draft</option><option>Published</option><option>Archived</option><option>In Progress</option><option>QC</option><option>Approved</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Version number for tracking content iterations.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Version Number</label>
                                            <input type="number" value={formData.version_number || 1} onChange={(e) => setFormData({...formData, version_number: parseInt(e.target.value)})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" min="1" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Link to change log document (Notion, Git, diff history, etc.).">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Change Log Link</label>
                                            <input type="url" value={formData.change_log_link || ''} onChange={(e) => setFormData({...formData, change_log_link: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="https://..." />
                                        </div>
                                    </Tooltip>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Created At</label>
                                        <input type="text" value={formData.created_at ? new Date(formData.created_at).toLocaleString() : '-'} readOnly className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Updated At</label>
                                        <input type="text" value={formData.updated_at ? new Date(formData.updated_at).toLocaleString() : '-'} readOnly className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 text-sm" />
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

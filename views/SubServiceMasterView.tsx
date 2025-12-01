
import React, { useState, useMemo } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import { getStatusBadge, SparkIcon } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { SubServiceItem, Service, ContentRepositoryItem, Keyword, ContentTypeItem, Brand, User } from '../types';
import { runQuery } from '../utils/gemini';

const STATUSES = ['All Status', 'Published', 'Draft', 'Archived'];

const SubServiceMasterView: React.FC = () => {
    const { data: subServices, create, update, remove } = useData<SubServiceItem>('subServices');
    const { data: services } = useData<Service>('services');
    const { data: contentAssets, update: updateContentAsset } = useData<ContentRepositoryItem>('content');
    const { data: keywordsMaster } = useData<Keyword>('keywords');
    const { data: contentTypes } = useData<ContentTypeItem>('contentTypes');
    const { data: brands } = useData<Brand>('brands');
    const { data: users } = useData<User>('users');

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [parentFilter, setParentFilter] = useState('All Parent Services');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [activeTab, setActiveTab] = useState<'Core' | 'Navigation' | 'Strategic' | 'Content' | 'SEO' | 'SMM' | 'Technical' | 'Linking' | 'Governance'>('Core');
    const [editingItem, setEditingItem] = useState<SubServiceItem | null>(null);
    const [isAiSuggesting, setIsAiSuggesting] = useState(false);

    // Asset Search
    const [assetSearch, setAssetSearch] = useState('');

    // Form State (Extended)
    const [formData, setFormData] = useState<any>({
        sub_service_name: '', parent_service_id: 0, slug: '', full_url: '', description: '', status: 'Draft',
        h1: '', h2_list: [], h3_list: [], body_content: '',
        meta_title: '', meta_description: '', focus_keywords: [],
        og_title: '', og_description: '', og_image_url: '',
        assets_linked: 0,
        // Extended fields
        menu_position: 0, breadcrumb_label: '', include_in_xml_sitemap: true,
        content_type: 'Cluster', buyer_journey_stage: 'Consideration', primary_cta_label: '', primary_cta_url: '',
        robots_index: 'index', robots_follow: 'follow', canonical_url: '', schema_type_id: 'Service',
        brand_id: 0, content_owner_id: 0
    });

    // Helpers
    const [tempH2, setTempH2] = useState('');
    const [tempKeyword, setTempKeyword] = useState('');

    const filteredData = subServices.filter(item => {
        const matchesSearch = item.sub_service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
        const parentName = services.find(s => s.id === item.parent_service_id)?.service_name || '';
        const matchesParent = parentFilter === 'All Parent Services' || parentName === parentFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        return matchesSearch && matchesParent && matchesStatus;
    });

    const linkedAssets = useMemo(() => {
        if (!editingItem) return [];
        return contentAssets.filter(a => a.linked_sub_service_ids?.includes(editingItem.id));
    }, [contentAssets, editingItem]);

    const availableAssets = useMemo(() => {
        if (!editingItem) return [];
        return contentAssets
            .filter(a => !a.linked_sub_service_ids?.includes(editingItem.id))
            .filter(a => a.content_title_clean.toLowerCase().includes(assetSearch.toLowerCase()))
            .slice(0, 10);
    }, [contentAssets, editingItem, assetSearch]);

    const handleCreateClick = () => {
        resetForm();
        setEditingItem(null);
        setViewMode('form');
    };

    const handleEdit = (item: SubServiceItem) => {
        setEditingItem(item);
        setFormData({
            ...item,
            h2_list: item.h2_list || [],
            h3_list: item.h3_list || [],
            focus_keywords: item.focus_keywords || (item.keywords ? item.keywords : []),
            // Ensure extended fields have defaults if missing in older records
            menu_position: (item as any).menu_position || 0,
            include_in_xml_sitemap: (item as any).include_in_xml_sitemap ?? true,
            robots_index: (item as any).robots_index || 'index'
        });
        setActiveTab('Core');
        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this sub-service?')) await remove(id);
    };

    const handleSave = async () => {
        if (!formData.sub_service_name) return alert("Name is required");

        const payload = {
            ...formData,
            updated_at: new Date().toISOString(),
            keywords: formData.focus_keywords
        };

        if (editingItem) {
            await update(editingItem.id, payload);
        } else {
            await create(payload as any);
        }
        setViewMode('list');
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            sub_service_name: '', parent_service_id: 0, slug: '', full_url: '', description: '', status: 'Draft',
            h1: '', h2_list: [], h3_list: [], body_content: '',
            meta_title: '', meta_description: '', focus_keywords: [],
            og_title: '', og_description: '', og_image_url: '', assets_linked: 0,
            menu_position: 0, breadcrumb_label: '', include_in_xml_sitemap: true,
            content_type: 'Cluster', buyer_journey_stage: 'Consideration', primary_cta_label: '', primary_cta_url: '',
            robots_index: 'index', robots_follow: 'follow', canonical_url: '', schema_type_id: 'Service',
            brand_id: 0, content_owner_id: 0
        });
        setActiveTab('Core');
    };

    const handleSlugChange = (val: string) => {
        const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        const parent = services.find(s => s.id === formData.parent_service_id);
        const parentSlug = parent ? parent.slug : 'service';
        setFormData((prev: any) => ({ ...prev, slug, full_url: `/services/${parentSlug}/${slug}` }));
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

    const handleToggleAssetLink = async (asset: ContentRepositoryItem) => {
        if (!editingItem) return;
        const currentLinks = asset.linked_sub_service_ids || [];
        const isLinked = currentLinks.includes(editingItem.id);

        const newLinks = isLinked
            ? currentLinks.filter(id => id !== editingItem.id)
            : [...currentLinks, editingItem.id];

        await updateContentAsset(asset.id, { linked_sub_service_ids: newLinks });
    };

    const handleAiSuggest = async () => {
        if (!formData.sub_service_name) return alert("Enter Sub-Service Name first");
        setIsAiSuggesting(true);
        try {
            const prompt = `Generate content structure for a sub-service page named "${formData.sub_service_name}".
            Context: Parent service is "${services.find(s => s.id === formData.parent_service_id)?.service_name || 'General'}".
            Return JSON: { "h1": "...", "description": "...", "h2s": ["..."], "meta_title": "...", "meta_description": "..." }`;
            const res = await runQuery(prompt, { model: 'gemini-2.5-flash' });
            const jsonMatch = res.text.match(/\{[\s\S]*\}/);
            const json = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

            if (json.h1) {
                setFormData((prev: any) => ({
                    ...prev,
                    h1: json.h1,
                    description: json.description || prev.description,
                    h2_list: json.h2s || [],
                    meta_title: json.meta_title,
                    meta_description: json.meta_description
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

    const handleExport = () => exportToCSV(filteredData, 'sub_services_master_export');

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
                            <h2 className="text-xl font-bold text-slate-900">{editingItem ? `Edit Sub-Service: ${editingItem.sub_service_name}` : 'Create New Sub-Service'}</h2>
                            <p className="text-xs text-slate-500">Manage specialized offerings linked to main services.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setViewMode('list')} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Discard</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors">Save Changes</button>
                    </div>
                </div>

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

                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto space-y-8 pb-20">
                        {activeTab === 'Core' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                    <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded mr-2">💎</span> Core Identification
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <Tooltip content="Official name of the sub-service.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sub-Service Name *</label>
                                                <input type="text" value={formData.sub_service_name} onChange={(e) => { setFormData({ ...formData, sub_service_name: e.target.value }); handleSlugChange(e.target.value); }} className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="The parent service this belongs to. Linked to Service Master.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Parent Service *</label>
                                                <select value={formData.parent_service_id} onChange={(e) => setFormData({ ...formData, parent_service_id: parseInt(e.target.value) })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                    <option value={0}>Select Parent...</option>
                                                    {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                                </select>
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div className="space-y-6">
                                        <Tooltip content="URL Slug (auto-generated).">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Slug</label>
                                                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-slate-50 font-mono text-slate-600 transition-all" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Full accessible URL path.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full URL</label>
                                                <input type="text" value={formData.full_url} readOnly className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-500 font-mono" />
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4">
                                    <Tooltip content="Short summary for listings and internal reference.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg h-24 text-sm focus:ring-2 focus:ring-indigo-500 resize-none transition-all" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Current publication status.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                {STATUSES.filter(s => s !== 'All Status').map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Navigation' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded mr-2">🧭</span> Navigation Configuration
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Tooltip content="Breadcrumb label override.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Breadcrumb Label</label>
                                            <input type="text" value={formData.breadcrumb_label} onChange={(e) => setFormData({ ...formData, breadcrumb_label: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm transition-all" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Order in sub-menu list.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Menu Position</label>
                                            <input type="number" value={formData.menu_position} onChange={(e) => setFormData({ ...formData, menu_position: parseInt(e.target.value) })} className="w-full p-3 border border-slate-300 rounded-lg text-sm transition-all" />
                                        </div>
                                    </Tooltip>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <Tooltip content="Include in XML Sitemap for indexing.">
                                        <label className="flex items-center space-x-3 cursor-pointer group">
                                            <input type="checkbox" checked={formData.include_in_xml_sitemap} onChange={(e) => setFormData({ ...formData, include_in_xml_sitemap: e.target.checked })} className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300" />
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Include in XML Sitemap</span>
                                        </label>
                                    </Tooltip>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Strategic' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                    <span className="bg-red-100 text-red-600 p-1.5 rounded mr-2">🎯</span> Strategic Goals
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Tooltip content="Type of content structure.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Content Type</label>
                                            <select value={formData.content_type} onChange={(e) => setFormData({ ...formData, content_type: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                {contentTypes.map(ct => <option key={ct.id} value={ct.content_type}>{ct.content_type}</option>)}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Stage in funnel.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Buyer Journey</label>
                                            <select value={formData.buyer_journey_stage} onChange={(e) => setFormData({ ...formData, buyer_journey_stage: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                <option>Awareness</option><option>Consideration</option><option>Decision</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Primary Call To Action.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">CTA Label</label>
                                            <input type="text" value={formData.primary_cta_label} onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm transition-all" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Primary CTA Link.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">CTA URL</label>
                                            <input type="text" value={formData.primary_cta_url} onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm transition-all" />
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Content' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                    <div className="flex items-center text-indigo-800 font-bold text-sm"><SparkIcon /> <span className="ml-2">AI Content Assistant</span></div>
                                    <button onClick={handleAiSuggest} disabled={isAiSuggesting} className="bg-white text-indigo-600 px-4 py-2 rounded-lg shadow-sm text-xs font-bold hover:bg-indigo-50 disabled:opacity-50 transition-colors">
                                        {isAiSuggesting ? 'Generating...' : 'Auto-Generate Structure'}
                                    </button>
                                </div>

                                <Tooltip content="Main H1 for the page.">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">H1 Heading</label>
                                        <input type="text" value={formData.h1} onChange={(e) => setFormData({ ...formData, h1: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 transition-all" />
                                    </div>
                                </Tooltip>

                                <Tooltip content="List of H2 subheadings for document outline.">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">H2 Headings</label>
                                        <div className="flex gap-2 mb-3">
                                            <input type="text" value={tempH2} onChange={(e) => setTempH2(e.target.value)} className="flex-1 p-3 border border-slate-300 rounded-lg text-sm" placeholder="Add H2..." />
                                            <button onClick={() => addToList('h2_list', tempH2, setTempH2)} className="bg-slate-100 px-6 rounded-lg font-bold text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors">+</button>
                                        </div>
                                        <ul className="space-y-2">
                                            {formData.h2_list?.map((h: string, i: number) => (
                                                <li key={i} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                    <span className="font-medium text-slate-700">{h}</span>
                                                    <button onClick={() => removeFromList('h2_list', i)} className="text-slate-400 hover:text-red-500 transition-colors font-bold p-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Tooltip>

                                <Tooltip content="Main content body (Markdown supported).">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Body Content</label>
                                        <textarea value={formData.body_content} onChange={(e) => setFormData({ ...formData, body_content: e.target.value })} className="w-full p-4 border border-slate-300 rounded-lg h-96 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 transition-all" />
                                    </div>
                                </Tooltip>
                            </div>
                        )}

                        {/* --- TAB: SEO --- */}
                        {activeTab === 'SEO' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-6 tracking-wider flex items-center">
                                    <span className="bg-green-100 text-green-600 p-1.5 rounded mr-2">🔍</span> Search Engine Optimization
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                                    {/* Left Column: Meta Data */}
                                    <div className="flex flex-col gap-6">
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Meta Title</label>
                                                <span className={`text-[10px] font-mono font-bold ${(formData.meta_title?.length || 0) > 60 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {formData.meta_title?.length || 0}/60
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.meta_title}
                                                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all placeholder:text-slate-300"
                                                placeholder="e.g. Sub-Service Name - Brand"
                                            />
                                        </div>

                                        <div className="space-y-1 flex-1 flex flex-col">
                                            <div className="flex justify-between items-center">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Meta Description</label>
                                                <span className={`text-[10px] font-mono font-bold ${(formData.meta_description?.length || 0) > 160 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {formData.meta_description?.length || 0}/160
                                                </span>
                                            </div>
                                            <textarea
                                                value={formData.meta_description}
                                                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all placeholder:text-slate-300 leading-relaxed flex-1 min-h-[140px]"
                                                placeholder="Brief summary of the sub-service for search results..."
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column: Keywords */}
                                    <div className="flex flex-col gap-2 h-full">
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Focus Keywords</label>
                                                <span className="text-[10px] font-mono font-bold text-slate-400">{formData.focus_keywords?.length || 0} tracked</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={tempKeyword}
                                                    onChange={(e) => setTempKeyword(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addToList('focus_keywords', tempKeyword, setTempKeyword)}
                                                    className="flex-1 p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                                                    placeholder="Add keyword..."
                                                />
                                                <button
                                                    onClick={() => addToList('focus_keywords', tempKeyword, setTempKeyword)}
                                                    className="bg-green-600 text-white px-4 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center shrink-0 w-[50px]"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-y-auto shadow-inner mt-4 min-h-[180px]">
                                            {formData.focus_keywords && formData.focus_keywords.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.focus_keywords.map((k: string, idx: number) => (
                                                        <div key={`${k}-${idx}`} className="group bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm flex items-center transition-all hover:border-green-300 hover:shadow-md">
                                                            <span className="mr-2">{k}</span>
                                                            <span className="text-[9px] text-slate-400 border-l border-slate-200 pl-2 mr-2 font-mono">{getKeywordMetric(k)}</span>
                                                            <button
                                                                onClick={() => removeFromList('focus_keywords', idx)}
                                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm italic">
                                                    <span className="opacity-50 text-4xl mb-2">🏷️</span>
                                                    No focus keywords defined
                                                </div>
                                            )}
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
                                    <span className="bg-gray-100 text-gray-600 p-1.5 rounded mr-2">⚙️</span> Technical SEO
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Tooltip content="Schema Type.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Schema Type</label>
                                            <input type="text" value={formData.schema_type_id} onChange={(e) => setFormData({ ...formData, schema_type_id: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm transition-all" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Canonical URL.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Canonical URL</label>
                                            <input type="text" value={formData.canonical_url} onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono text-slate-600 transition-all" />
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Robots Index.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Robots Index</label>
                                            <select value={formData.robots_index} onChange={(e) => setFormData({ ...formData, robots_index: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                <option value="index">Index</option><option value="noindex">No Index</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Robots Follow.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Robots Follow</label>
                                            <select value={formData.robots_follow} onChange={(e) => setFormData({ ...formData, robots_follow: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                <option value="follow">Follow</option><option value="nofollow">No Follow</option>
                                            </select>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        )}

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
                                                            <p className="font-medium text-sm text-slate-800 truncate" title={asset.content_title_clean}>{asset.content_title_clean}</p>
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
                                                            <p className="font-medium text-sm text-slate-700 truncate">{asset.content_title_clean}</p>
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

                        {activeTab === 'Governance' && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                    <span className="bg-teal-100 text-teal-600 p-1.5 rounded mr-2">⚖️</span> Governance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Tooltip content="Brand Association.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Brand</label>
                                            <select value={formData.brand_id} onChange={(e) => setFormData({ ...formData, brand_id: parseInt(e.target.value) })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                <option value={0}>Select Brand...</option>
                                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Content Owner.">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Owner</label>
                                            <select value={formData.content_owner_id} onChange={(e) => setFormData({ ...formData, content_owner_id: parseInt(e.target.value) })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white transition-all">
                                                <option value={0}>Select Owner...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
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
        <div className="space-y-6 h-full overflow-y-auto w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sub-Service Master</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage granular service offerings linked to main services.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handleExport} className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg text-xs font-medium shadow-sm hover:bg-slate-50 transition-colors">Export</button>
                    <button onClick={handleCreateClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center">
                        <span className="mr-1 text-lg">+</span> Add Sub-Service
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input type="search" className="block w-full pl-10 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Search sub-services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[140px]">
                    <option>All Parent Services</option>
                    {services.map(s => <option key={s.id} value={s.service_name}>{s.service_name}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[140px]">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <Table
                    columns={[
                        { header: 'Sub-Service Name', accessor: 'sub_service_name' as keyof SubServiceItem, className: 'font-bold text-slate-800' },
                        {
                            header: 'Parent Service',
                            accessor: (item: SubServiceItem) => {
                                const parent = services.find(s => s.id === item.parent_service_id);
                                return (
                                    <Tooltip content="Parent Service Name">
                                        <span className="text-slate-600 text-sm font-medium bg-slate-50 px-2 py-0.5 rounded">{parent?.service_name || '-'}</span>
                                    </Tooltip>
                                );
                            }
                        },
                        { header: 'Slug', accessor: 'slug' as keyof SubServiceItem, className: 'font-mono text-xs text-slate-500' },
                        {
                            header: 'Linked Assets',
                            accessor: (item: SubServiceItem) => {
                                const count = contentAssets.filter(a => a.linked_sub_service_ids?.includes(item.id)).length;
                                return (
                                    <Tooltip content="Number of assets linked">
                                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-100">{count}</span>
                                    </Tooltip>
                                );
                            },
                            className: "text-center"
                        },
                        { header: 'Status', accessor: (item: SubServiceItem) => getStatusBadge(item.status) },
                        {
                            header: 'Actions',
                            accessor: (item: SubServiceItem) => (
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(item)} className="text-slate-500 hover:text-blue-600 text-xs font-bold transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-600 text-xs font-bold transition-colors">Del</button>
                                </div>
                            )
                        }
                    ]}
                    data={filteredData}
                    title={`Sub-Service Registry (${filteredData.length})`}
                />
            </div>
        </div>
    );
};

export default SubServiceMasterView;

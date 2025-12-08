import React, { useState, useMemo } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import SocialMetaForm from '../components/SocialMetaForm';
import AssetLinker from '../components/AssetLinker';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { SubServiceItem, Service, ContentRepositoryItem, Brand, User, ContentTypeItem, Keyword } from '../types';

const STATUSES = ['All Status', 'Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'];
const FALLBACK_CONTENT_TYPES: ContentTypeItem[] = [
    { id: 1, content_type: 'Pillar', category: 'Core', description: 'Long-form primary page', default_attributes: [], status: 'active' },
    { id: 2, content_type: 'Cluster', category: 'Supporting', description: 'Supporting topic page', default_attributes: [], status: 'active' },
    { id: 3, content_type: 'Landing', category: 'Conversion', description: 'Campaign landing page', default_attributes: [], status: 'active' },
    { id: 4, content_type: 'Blog', category: 'Editorial', description: 'Blog article', default_attributes: [], status: 'active' }
];

const SubServiceMasterView: React.FC = () => {
    const { data: subServices = [], create, update, remove } = useData<SubServiceItem>('subServices');
    const { data: services = [] } = useData<Service>('services');
    const { data: contentAssets = [], update: updateContentAsset, refresh: refreshContentAssets } = useData<ContentRepositoryItem>('content');
    const { data: brands = [] } = useData<Brand>('brands');
    const { data: users = [] } = useData<User>('users');
    const { data: contentTypes = [] } = useData<ContentTypeItem>('contentTypes');
    const { data: keywordsMaster = [] } = useData<Keyword>('keywords');

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [parentFilter, setParentFilter] = useState('All Parent Services');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [editingItem, setEditingItem] = useState<SubServiceItem | null>(null);
    const [activeTab, setActiveTab] = useState<'Core' | 'SEO' | 'SMM' | 'Linking' | 'Governance'>('Core');
    const [assetSearch, setAssetSearch] = useState('');
    const [copiedUrl, setCopiedUrl] = useState(false);

    // Form State
    const [formData, setFormData] = useState<any>({
        sub_service_name: '',
        parent_service_id: 0,
        sub_service_code: '',
        slug: '',
        full_url: '',
        description: '',
        status: 'Draft',
        language: 'en',
        content_type: 'Cluster',
        buyer_journey_stage: 'Consideration',
        h1: '',
        meta_title: '',
        meta_description: '',
        focus_keywords: [],
        secondary_keywords: [],
        og_title: '',
        og_description: '',
        og_image_url: '',
        og_type: 'website',
        twitter_title: '',
        twitter_description: '',
        twitter_image_url: '',
        linkedin_title: '',
        linkedin_description: '',
        linkedin_image_url: '',
        facebook_title: '',
        facebook_description: '',
        facebook_image_url: '',
        instagram_title: '',
        instagram_description: '',
        instagram_image_url: '',
        brand_id: 0,
        content_owner_id: 0,
        primary_cta_label: '',
        primary_cta_url: ''
    });

    // Temp inputs for arrays
    const [tempKeyword, setTempKeyword] = useState('');
    const [tempSecondaryKeyword, setTempSecondaryKeyword] = useState('');

    const availableContentTypes = contentTypes.length ? contentTypes : FALLBACK_CONTENT_TYPES;

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
        return contentAssets.filter(a => {
            const links = Array.isArray(a.linked_sub_service_ids) ? a.linked_sub_service_ids : [];
            return links.map(String).includes(String(editingItem.id));
        });
    }, [contentAssets, editingItem]);

    const availableAssets = useMemo(() => {
        if (!editingItem) return [];
        const searchLower = assetSearch.toLowerCase().trim();
        return contentAssets
            .filter(a => {
                // Check if asset is not already linked
                const links = Array.isArray(a.linked_sub_service_ids) ? a.linked_sub_service_ids : [];
                const isLinked = links.map(String).includes(String(editingItem.id));
                if (isLinked) return false;

                // Check if asset matches search query (if any)
                if (!searchLower) return true;
                const title = (a.content_title_clean || '').toLowerCase();
                const assetType = (a.asset_type || '').toLowerCase();
                const status = (a.status || '').toLowerCase();
                return title.includes(searchLower) || assetType.includes(searchLower) || status.includes(searchLower);
            })
            .slice(0, 20); // Increased limit to show more results
    }, [contentAssets, editingItem, assetSearch]);

    const handleCreateClick = () => {
        setEditingItem(null);
        setFormData({
            sub_service_name: '',
            parent_service_id: 0,
            sub_service_code: '',
            slug: '',
            full_url: '',
            description: '',
            status: 'Draft',
            language: 'en',
            content_type: 'Cluster',
            buyer_journey_stage: 'Consideration',
            h1: '',
            meta_title: '',
            meta_description: '',
            focus_keywords: [],
            secondary_keywords: [],
            og_title: '',
            og_description: '',
            og_image_url: '',
            og_type: 'website',
            twitter_title: '',
            twitter_description: '',
            twitter_image_url: '',
            linkedin_title: '',
            linkedin_description: '',
            linkedin_image_url: '',
            facebook_title: '',
            facebook_description: '',
            facebook_image_url: '',
            instagram_title: '',
            instagram_description: '',
            instagram_image_url: '',
            brand_id: 0,
            content_owner_id: 0,
            primary_cta_label: '',
            primary_cta_url: ''
        });
        setActiveTab('Core');
        setViewMode('form');
    };

    const handleEdit = (item: SubServiceItem) => {
        setEditingItem(item);
        setFormData({
            ...item,
            focus_keywords: item.focus_keywords || [],
            secondary_keywords: item.secondary_keywords || [],
            content_type: item.content_type || 'Cluster',
            buyer_journey_stage: item.buyer_journey_stage || 'Consideration',
            h1: item.h1 || '',
            primary_cta_label: item.primary_cta_label || '',
            primary_cta_url: item.primary_cta_url || '',
            og_type: item.og_type || 'website',
            og_title: item.og_title || '',
            og_description: item.og_description || '',
            og_image_url: item.og_image_url || '',
            twitter_title: item.twitter_title || '',
            twitter_description: item.twitter_description || '',
            twitter_image_url: item.twitter_image_url || '',
            linkedin_title: item.linkedin_title || '',
            linkedin_description: item.linkedin_description || '',
            linkedin_image_url: item.linkedin_image_url || '',
            facebook_title: item.facebook_title || '',
            facebook_description: item.facebook_description || '',
            facebook_image_url: item.facebook_image_url || '',
            instagram_title: item.instagram_title || '',
            instagram_description: item.instagram_description || '',
            instagram_image_url: item.instagram_image_url || ''
        });
        setActiveTab('Core');
        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this sub-service?')) {
            await remove(id);
        }
    };

    const handleSave = async () => {
        if (!formData.sub_service_name) {
            return alert("Sub-Service Name is required");
        }
        if (!formData.parent_service_id || formData.parent_service_id === 0) {
            return alert("Parent Service is required");
        }

        const now = new Date().toISOString();
        const payload = {
            ...formData,
            updated_at: now,
            slug: formData.slug || formData.sub_service_name.toLowerCase().replace(/ /g, '-')
        };

        if (formData.slug && !formData.full_url) {
            payload.full_url = `/services/${formData.slug}`;
        }

        if (editingItem) {
            await update(editingItem.id, payload);
        } else {
            payload.created_at = now;
            await create(payload as any);
        }
        setViewMode('list');
        setEditingItem(null);
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

    const handleToggleAssetLink = async (asset: ContentRepositoryItem) => {
        if (!editingItem) return;
        const currentLinks = Array.isArray(asset.linked_sub_service_ids) ? asset.linked_sub_service_ids : [];
        const isLinked = currentLinks.map(String).includes(String(editingItem.id));
        const newLinks = isLinked
            ? currentLinks.filter(id => String(id) !== String(editingItem.id))
            : [...currentLinks, editingItem.id];

        try {
            // Update the asset with new links - the useData hook now updates state immediately
            await updateContentAsset(asset.id, { linked_sub_service_ids: newLinks });

            // Force a refresh to ensure we have the latest data
            await refreshContentAssets();
        } catch (e) {
            console.error('Asset link update error:', e);
            // Even if there's an error, try to refresh to show current state
            try {
                await refreshContentAssets();
            } catch (refreshError) {
                console.error('Refresh error:', refreshError);
            }
        }
    };

    const addToList = (field: string, value: any, setter?: any) => {
        if (!value) return;
        setFormData((prev: any) => ({
            ...prev,
            [field]: [...(prev[field] || []), value]
        }));
        if (setter) setter('');
    };

    const removeFromList = (field: string, index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: (prev[field] || []).filter((_: any, i: number) => i !== index)
        }));
    };

    const getKeywordMetric = (kw: string) => {
        const masterRecord = keywordsMaster.find(k => k.keyword.toLowerCase() === kw.toLowerCase());
        const vol = masterRecord ? masterRecord.search_volume.toLocaleString() : 'N/A';
        const comp = masterRecord ? masterRecord.competition : '-';
        return `Vol: ${vol} | Comp: ${comp}`;
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'sub_services_export');
    };

    const tabs = [
        { id: 'Core', label: 'Core', icon: '💎' },
        { id: 'SEO', label: 'SEO', icon: '🔍' },
        { id: 'SMM', label: 'SMM', icon: '📢' },
        { id: 'Linking', label: 'Linking', icon: '🔗' },
        { id: 'Governance', label: 'Governance', icon: '⚖️' }
    ];

    if (viewMode === 'form') {
        return (
            <div className="fixed inset-x-0 bottom-0 top-16 z-[60] bg-white flex flex-col overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white shadow-sm z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode('list')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{editingItem ? `Edit Sub-Service: ${editingItem.sub_service_name}` : 'Create New Sub-Service'}</h2>
                            <div className="flex items-center text-xs text-slate-500 mt-1">
                                <span className="font-mono bg-slate-100 px-1.5 rounded">{editingItem?.sub_service_code || formData.sub_service_code || 'NEW'}</span>
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
                        <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">Save Sub-Service</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 px-6 bg-white flex-shrink-0 z-30">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
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
                            <div className="space-y-10">
                                {/* 1. SUB-SERVICE IDENTITY CARD */}
                                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50 rounded-2xl border-2 border-indigo-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white overflow-hidden">
                                        <div className="absolute top-0 right-0 opacity-10">
                                            <span className="text-9xl">🏷️</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">💎</span>
                                                <h3 className="text-2xl font-bold">Sub-Service Identity</h3>
                                            </div>
                                            <p className="text-indigo-100 text-sm">Core naming and classification</p>
                                        </div>
                                    </div>

                                    <div className="p-10">
                                        <div className="space-y-8">
                                            {/* Row 1 - Parent Service & Sub-Service Name */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Tooltip content="Select the parent service this sub-service belongs to">
                                                    <div className="bg-white rounded-xl border-2 border-indigo-100 p-6 hover:border-indigo-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🔗</span>
                                                            Parent Service
                                                            <span className="text-red-500 ml-auto">*</span>
                                                        </label>
                                                        <select
                                                            value={formData.parent_service_id}
                                                            onChange={(e) => setFormData({ ...formData, parent_service_id: parseInt(e.target.value) })}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                                        >
                                                            <option value={0}>Select Parent Service...</option>
                                                            {services.map(s => (
                                                                <option key={s.id} value={s.id}>{s.service_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </Tooltip>

                                                <Tooltip content="Name of the sub-service (visible in lists and URLs)">
                                                    <div className="bg-white rounded-xl border-2 border-purple-100 p-6 hover:border-purple-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">📝</span>
                                                            Sub-Service Name
                                                            <span className="text-red-500 ml-auto">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.sub_service_name}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setFormData({ ...formData, sub_service_name: val });
                                                                if (!editingItem && !formData.slug) handleSlugChange(val);
                                                            }}
                                                            placeholder="Enter sub-service name..."
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white transition-all focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                        />
                                                    </div>
                                                </Tooltip>
                                            </div>

                                            {/* Row 2 - Sub-Service Code & Status */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Tooltip content="Unique internal identifier (e.g., SUB-001)">
                                                    <div className="bg-white rounded-xl border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🔐</span>
                                                            Sub-Service Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.sub_service_code}
                                                            onChange={(e) => setFormData({ ...formData, sub_service_code: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono font-medium transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                            placeholder="SUB-XXX"
                                                        />
                                                    </div>
                                                </Tooltip>

                                                <Tooltip content="Publication status">
                                                    <div className="bg-white rounded-xl border-2 border-emerald-100 p-6 hover:border-emerald-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">📊</span>
                                                            Status
                                                        </label>
                                                        <select
                                                            value={formData.status}
                                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                        >
                                                            {STATUSES.filter(s => s !== 'All Status').map(status => (
                                                                <option key={status} value={status}>{status}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. WEB PRESENCE CARD */}
                                <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 rounded-2xl border-2 border-blue-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-10 text-white overflow-hidden">
                                        <div className="absolute top-0 right-0 opacity-10">
                                            <span className="text-9xl">🔗</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">🌐</span>
                                                <h3 className="text-2xl font-bold">Web Presence</h3>
                                            </div>
                                            <p className="text-blue-100 text-sm">URL, slug, and accessibility</p>
                                        </div>
                                    </div>

                                    <div className="p-10">
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Tooltip content="URL-friendly slug (auto-generated from name)">
                                                    <div className="bg-white rounded-xl border-2 border-cyan-100 p-6 hover:border-cyan-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🔗</span>
                                                            URL Slug
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.slug}
                                                            onChange={(e) => handleSlugChange(e.target.value)}
                                                            placeholder="auto-generated-from-name"
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                                                        />
                                                    </div>
                                                </Tooltip>

                                                <Tooltip content="Full URL path for this sub-service">
                                                    <div className="bg-white rounded-xl border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🌍</span>
                                                            Full URL
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={formData.full_url}
                                                                onChange={(e) => setFormData({ ...formData, full_url: e.target.value })}
                                                                placeholder="/services/sub-service-name"
                                                                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                            />
                                                            {formData.full_url && (
                                                                <button
                                                                    onClick={handleCopyFullUrl}
                                                                    className={`px-4 py-3 rounded-lg font-bold transition-all ${copiedUrl ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                                                >
                                                                    {copiedUrl ? '✓' : '📋'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Tooltip>
                                            </div>

                                            {/* Description - Big Box */}
                                            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border-2 border-indigo-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                                                <Tooltip content="Comprehensive description of the sub-service, its purpose, features, and benefits">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <label className="flex items-center gap-3 text-sm font-bold text-indigo-900 uppercase tracking-wider">
                                                                <span className="bg-indigo-100 p-2 rounded-lg text-xl">📄</span>
                                                                <div>
                                                                    <div>Description</div>
                                                                    <div className="text-[10px] text-slate-500 normal-case font-normal tracking-normal mt-0.5">
                                                                        Provide a detailed overview of this sub-service
                                                                    </div>
                                                                </div>
                                                            </label>
                                                            <span className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold ${(formData.description?.length || 0) > 500 ? 'bg-red-100 text-red-700 border-2 border-red-300' : 'bg-slate-100 text-slate-700 border-2 border-slate-300'}`}>
                                                                {formData.description?.length || 0}/500
                                                            </span>
                                                        </div>
                                                        <textarea
                                                            value={formData.description || ''}
                                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                            placeholder="Describe the sub-service in detail...&#10;&#10;• What is this sub-service?&#10;• What problems does it solve?&#10;• What are the key features and benefits?&#10;• Who is the target audience?&#10;• How does it relate to the parent service?"
                                                            className="w-full px-5 py-4 border-2 border-indigo-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all resize-none shadow-inner leading-relaxed"
                                                            rows={12}
                                                        />
                                                        <div className="flex items-start gap-2 text-xs text-slate-600 bg-white rounded-lg p-3 border border-slate-200">
                                                            <span className="text-base">💡</span>
                                                            <div>
                                                                <strong className="text-slate-700">Tip:</strong> A well-written description helps with SEO, user understanding, and internal documentation. Include keywords naturally and focus on value propositions.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. CONTENT STRATEGY CARD */}
                                <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-slate-50 rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-10 text-white overflow-hidden">
                                        <div className="absolute top-0 right-0 opacity-10">
                                            <span className="text-9xl">🎯</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">📝</span>
                                                <h3 className="text-2xl font-bold">Content Strategy</h3>
                                            </div>
                                            <p className="text-amber-100 text-sm">Content type, journey stage, and heading</p>
                                        </div>
                                    </div>

                                    <div className="p-10">
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Tooltip content="Type of content for this sub-service">
                                                    <div className="bg-white rounded-xl border-2 border-amber-100 p-6 hover:border-amber-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">📑</span>
                                                            Content Type
                                                        </label>
                                                        <select
                                                            value={formData.content_type}
                                                            onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                                        >
                                                            {availableContentTypes.map(ct => (
                                                                <option key={ct.id} value={ct.content_type}>{ct.content_type}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </Tooltip>

                                                <Tooltip content="Buyer journey stage this content targets">
                                                    <div className="bg-white rounded-xl border-2 border-orange-100 p-6 hover:border-orange-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🛤️</span>
                                                            Buyer Journey Stage
                                                        </label>
                                                        <select
                                                            value={formData.buyer_journey_stage}
                                                            onChange={(e) => setFormData({ ...formData, buyer_journey_stage: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                                        >
                                                            <option value="Awareness">Awareness</option>
                                                            <option value="Consideration">Consideration</option>
                                                            <option value="Decision">Decision</option>
                                                            <option value="Retention">Retention</option>
                                                        </select>
                                                    </div>
                                                </Tooltip>
                                            </div>

                                            {/* H1 Heading */}
                                            <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                                                <Tooltip content="Main H1 heading for the page">
                                                    <div>
                                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                                                            <span className="text-sm">📌</span>
                                                            H1 Heading
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.h1}
                                                            onChange={(e) => setFormData({ ...formData, h1: e.target.value })}
                                                            placeholder="Main page heading..."
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                                        />
                                                    </div>
                                                </Tooltip>
                                            </div>

                                            {/* CTA Section */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Tooltip content="Primary call-to-action button label">
                                                    <div className="bg-white rounded-xl border-2 border-green-100 p-6 hover:border-green-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🎯</span>
                                                            Primary CTA Label
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.primary_cta_label}
                                                            onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })}
                                                            placeholder="Get Started"
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                                        />
                                                    </div>
                                                </Tooltip>

                                                <Tooltip content="Primary call-to-action URL">
                                                    <div className="bg-white rounded-xl border-2 border-teal-100 p-6 hover:border-teal-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🔗</span>
                                                            Primary CTA URL
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.primary_cta_url}
                                                            onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })}
                                                            placeholder="/contact"
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                                                        />
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: SEO --- */}
                        {activeTab === 'SEO' && (
                            <div className="space-y-10">
                                {/* SEO Metadata Card */}
                                <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-slate-50 rounded-2xl border-2 border-green-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-10 text-white overflow-hidden">
                                        <div className="absolute top-0 right-0 opacity-10">
                                            <span className="text-9xl">🔍</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">📊</span>
                                                <h3 className="text-2xl font-bold">SEO Metadata</h3>
                                            </div>
                                            <p className="text-green-100 text-sm">Search engine visibility and metadata</p>
                                        </div>
                                    </div>

                                    <div className="p-10">
                                        <div className="space-y-6">
                                            <div className="bg-white rounded-xl border-2 border-green-100 p-6 hover:border-green-300 transition-colors">
                                                <div className="flex justify-between items-center mb-3">
                                                    <label className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-widest">
                                                        <span className="text-sm">📝</span>
                                                        Meta Title
                                                    </label>
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold ${(formData.meta_title?.length || 0) > 60 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {formData.meta_title?.length || 0}/60
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.meta_title || ''}
                                                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                                    placeholder="Sub-Service Name - Brand | Compelling Value Proposition"
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                                />
                                                <p className="text-xs text-slate-500 mt-2">💡 Optimal length: 50-60 characters for best display in search results</p>
                                            </div>

                                            <div className="bg-white rounded-xl border-2 border-emerald-100 p-6 hover:border-emerald-300 transition-colors">
                                                <div className="flex justify-between items-center mb-3">
                                                    <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest">
                                                        <span className="text-sm">📄</span>
                                                        Meta Description
                                                    </label>
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold ${(formData.meta_description?.length || 0) > 160 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {formData.meta_description?.length || 0}/160
                                                    </span>
                                                </div>
                                                <textarea
                                                    value={formData.meta_description || ''}
                                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                                    placeholder="Write a compelling summary that encourages clicks from search results. Include key benefits and a call-to-action."
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                                                    rows={4}
                                                />
                                                <p className="text-xs text-slate-500 mt-2">💡 Optimal length: 150-160 characters for complete display in search results</p>
                                            </div>

                                            {/* Keywords Section */}
                                            <div className="bg-white rounded-xl border-2 border-blue-100 p-6">
                                                <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                                                    <span className="text-sm">🎯</span>
                                                    Focus Keywords
                                                </label>
                                                <div className="flex gap-2 mb-3">
                                                    <input
                                                        type="text"
                                                        value={tempKeyword}
                                                        onChange={(e) => setTempKeyword(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (addToList('focus_keywords', tempKeyword, setTempKeyword), e.preventDefault())}
                                                        placeholder="Add focus keyword..."
                                                        className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <button
                                                        onClick={() => addToList('focus_keywords', tempKeyword, setTempKeyword)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(formData.focus_keywords || []).map((kw: string, idx: number) => (
                                                        <div key={idx} className="group relative">
                                                            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-medium">
                                                                {kw}
                                                                <button
                                                                    onClick={() => removeFromList('focus_keywords', idx)}
                                                                    className="text-blue-600 hover:text-red-600 transition-colors"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                                                {getKeywordMetric(kw)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-xl border-2 border-indigo-100 p-6">
                                                <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3">
                                                    <span className="text-sm">🔖</span>
                                                    Secondary Keywords
                                                </label>
                                                <div className="flex gap-2 mb-3">
                                                    <input
                                                        type="text"
                                                        value={tempSecondaryKeyword}
                                                        onChange={(e) => setTempSecondaryKeyword(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword), e.preventDefault())}
                                                        placeholder="Add secondary keyword..."
                                                        className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                    <button
                                                        onClick={() => addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword)}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(formData.secondary_keywords || []).map((kw: string, idx: number) => (
                                                        <span key={idx} className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-lg text-xs font-medium">
                                                            {kw}
                                                            <button
                                                                onClick={() => removeFromList('secondary_keywords', idx)}
                                                                className="text-indigo-600 hover:text-red-600 transition-colors"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: SMM --- */}
                        {activeTab === 'SMM' && (
                            <div className="space-y-10">
                                <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="p-6">
                                        <SocialMetaForm formData={formData} setFormData={setFormData} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: LINKING --- */}
                        {activeTab === 'Linking' && (
                            <div className="space-y-10">
                                {editingItem ? (
                                    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-slate-50 rounded-2xl border-2 border-purple-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-10 text-white overflow-hidden">
                                            <div className="absolute top-0 right-0 opacity-10">
                                                <span className="text-9xl">🔗</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">📎</span>
                                                    <h3 className="text-2xl font-bold">Content Assets</h3>
                                                </div>
                                                <p className="text-purple-100 text-sm">Link related content assets to this sub-service</p>
                                            </div>
                                        </div>

                                        <AssetLinker
                                            linkedAssets={linkedAssets}
                                            availableAssets={availableAssets}
                                            assetSearch={assetSearch}
                                            setAssetSearch={setAssetSearch}
                                            onToggle={handleToggleAssetLink}
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border-2 border-amber-300 shadow-lg overflow-hidden">
                                        <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6 text-white overflow-hidden">
                                            <div className="absolute top-0 right-0 opacity-10">
                                                <span className="text-9xl">💾</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">💡</span>
                                                    <h3 className="text-2xl font-bold">Asset Linking Unavailable</h3>
                                                </div>
                                                <p className="text-amber-100 text-sm">Complete the setup steps below to enable asset linking</p>
                                            </div>
                                        </div>

                                        <div className="p-10">
                                            <div className="max-w-3xl mx-auto">
                                                <div className="text-center mb-8">
                                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
                                                        <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-slate-800 mb-3">Save Sub-Service First</h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        You need to save this sub-service before you can link content assets to it.
                                                        This ensures all relationships are properly tracked in the system.
                                                    </p>
                                                </div>

                                                <div className="bg-white rounded-xl border-2 border-amber-200 p-6 mb-6">
                                                    <h5 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                        </svg>
                                                        Steps to Enable Asset Linking
                                                    </h5>
                                                    <ol className="space-y-3">
                                                        <li className="flex items-start gap-3">
                                                            <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-slate-800">Fill in Required Fields</p>
                                                                <p className="text-xs text-slate-600 mt-1">Complete the <strong>Parent Service</strong> and <strong>Sub-Service Name</strong> in the Core tab</p>
                                                            </div>
                                                        </li>
                                                        <li className="flex items-start gap-3">
                                                            <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-slate-800">Save the Sub-Service</p>
                                                                <p className="text-xs text-slate-600 mt-1">Click the <strong>"Save Sub-Service"</strong> button at the top right</p>
                                                            </div>
                                                        </li>
                                                        <li className="flex items-start gap-3">
                                                            <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-slate-800">Return to Linking Tab</p>
                                                                <p className="text-xs text-slate-600 mt-1">After saving, edit the sub-service again and navigate to this Linking tab to connect assets</p>
                                                            </div>
                                                        </li>
                                                    </ol>
                                                </div>

                                                <div className="text-center">
                                                    <button
                                                        onClick={() => setActiveTab('Core')}
                                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                                                        </svg>
                                                        Go to Core Tab
                                                    </button>
                                                </div>

                                                <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-semibold text-blue-900 mb-1">Why is this required?</p>
                                                            <p className="text-xs text-blue-700 leading-relaxed">
                                                                Asset linking requires a valid sub-service ID to create proper database relationships.
                                                                Once saved, you'll be able to link images, videos, documents, and other media assets from your content repository.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- TAB: GOVERNANCE --- */}
                        {activeTab === 'Governance' && (
                            <div className="space-y-10">
                                <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-slate-50 rounded-2xl border-2 border-teal-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-10 text-white overflow-hidden">
                                        <div className="absolute top-0 right-0 opacity-10">
                                            <span className="text-9xl">⚖️</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">👥</span>
                                                <h3 className="text-2xl font-bold">Governance & Ownership</h3>
                                            </div>
                                            <p className="text-teal-100 text-sm">Ownership and management assignments</p>
                                        </div>
                                    </div>

                                    <div className="p-10">
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Tooltip content="Associated brand for this sub-service">
                                                    <div className="bg-white rounded-xl border-2 border-cyan-100 p-6 hover:border-cyan-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🏢</span>
                                                            Brand
                                                        </label>
                                                        <select
                                                            value={formData.brand_id || 0}
                                                            onChange={(e) => setFormData({ ...formData, brand_id: parseInt(e.target.value) || 0 })}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer"
                                                        >
                                                            <option value={0}>Select Brand...</option>
                                                            {brands.map(b => (
                                                                <option key={b.id} value={b.id}>{b.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </Tooltip>

                                                <Tooltip content="Person responsible for managing this sub-service content">
                                                    <div className="bg-white rounded-xl border-2 border-teal-100 p-6 hover:border-teal-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">👤</span>
                                                            Content Owner
                                                        </label>
                                                        <select
                                                            value={formData.content_owner_id || 0}
                                                            onChange={(e) => setFormData({ ...formData, content_owner_id: parseInt(e.target.value) || 0 })}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all cursor-pointer"
                                                        >
                                                            <option value={0}>Select Owner...</option>
                                                            {users.map(u => (
                                                                <option key={u.id} value={u.id}>{u.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </Tooltip>
                                            </div>

                                            {/* Auto-Generated Metadata */}
                                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-lg">🕒</span>
                                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Auto-Generated Metadata</h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wide">Record ID</label>
                                                        <div className="px-4 py-3 border-2 border-slate-300 rounded-lg bg-white text-slate-700 text-sm font-mono font-bold">
                                                            {editingItem?.id || '—'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wide">Created Date</label>
                                                        <div className="px-4 py-3 border-2 border-slate-300 rounded-lg bg-white text-slate-700 text-sm font-mono">
                                                            {(editingItem as any)?.created_at
                                                                ? new Date((editingItem as any).created_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: '2-digit'
                                                                })
                                                                : 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wide">Last Modified</label>
                                                        <div className="px-4 py-3 border-2 border-slate-300 rounded-lg bg-white text-slate-700 text-sm font-mono">
                                                            {(editingItem as any)?.updated_at
                                                                ? new Date((editingItem as any).updated_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: '2-digit'
                                                                })
                                                                : 'Just now'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div >
        );
    }

    // List View
    return (
        <div className="space-y-6 animate-fade-in w-full h-full overflow-y-auto p-6 ui-surface">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sub-Service Master</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage sub-service offerings linked to main services</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleExport}
                        className="text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors hover:bg-slate-50"
                    >
                        Export
                    </button>
                    <button
                        onClick={handleCreateClick}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        <span className="mr-1 text-lg">+</span> Add Sub-Service
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            className="block w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Search sub-services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        value={parentFilter}
                        onChange={(e) => setParentFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[140px]"
                    >
                        <option>All Parent Services</option>
                        {services.map(s => (
                            <option key={s.id} value={s.service_name}>{s.service_name}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[140px]"
                    >
                        {STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <Table
                    columns={[
                        {
                            header: 'Sub-Service Name',
                            accessor: (item: SubServiceItem) => (
                                <div>
                                    <div className="font-bold text-slate-800 text-sm hover:text-indigo-600 transition-colors">
                                        {item.sub_service_name}
                                    </div>
                                    {item.sub_service_code && (
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{item.sub_service_code}</div>
                                    )}
                                </div>
                            )
                        },
                        {
                            header: 'Parent Service',
                            accessor: (item: SubServiceItem) => {
                                const parent = services.find(s => s.id === item.parent_service_id);
                                return (
                                    <Tooltip content="Parent Service">
                                        <span className="text-slate-600 text-sm font-medium bg-slate-50 px-2 py-1 rounded">
                                            {parent?.service_name || '-'}
                                        </span>
                                    </Tooltip>
                                );
                            }
                        },
                        {
                            header: 'Content Type',
                            accessor: (item: SubServiceItem) => (
                                <Tooltip content="Content type classification">
                                    <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">
                                        {item.content_type || 'Cluster'}
                                    </span>
                                </Tooltip>
                            )
                        },
                        {
                            header: 'Slug',
                            accessor: 'slug',
                            className: 'font-mono text-xs text-slate-500'
                        },
                        {
                            header: 'Linked Assets',
                            accessor: (item: SubServiceItem) => {
                                const count = contentAssets.filter(a => a.linked_sub_service_ids?.includes(item.id)).length;
                                return (
                                    <Tooltip content="Number of assets linked">
                                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-100">
                                            {count}
                                        </span>
                                    </Tooltip>
                                );
                            },
                            className: "text-center"
                        },
                        {
                            header: 'Status',
                            accessor: (item: SubServiceItem) => getStatusBadge(item.status)
                        },
                        {
                            header: 'Actions',
                            accessor: (item: SubServiceItem) => (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="text-slate-500 hover:text-indigo-600 font-medium text-xs transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-slate-500 hover:text-red-600 font-medium text-xs transition-colors"
                                    >
                                        Delete
                                    </button>
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

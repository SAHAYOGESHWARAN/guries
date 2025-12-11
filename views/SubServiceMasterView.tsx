import React, { useState, useMemo } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import SocialMetaForm from '../components/SocialMetaForm';
import ServiceAssetLinker from '../components/ServiceAssetLinker';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { SubServiceItem, Service, ContentRepositoryItem, AssetLibraryItem, Brand, User, ContentTypeItem, Keyword } from '../types';

const STATUSES = ['All Status', 'Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'];
const CONTENT_TYPES = ['Pillar', 'Cluster', 'Landing', 'Blog', 'Case Study', 'Sales Page'];
const BUYER_JOURNEY_STAGES = ['Awareness', 'Consideration', 'Decision', 'Retention'];
const SCHEMA_TYPES = ['Service', 'Product', 'Organization', 'Article'];

const AVAILABLE_INSIGHTS = [
    { id: 1, title: 'Blog: SEO Best Practices', type: 'Blog', status: 'Ready' },
    { id: 2, title: 'Whitepaper: Content Strategy', type: 'Whitepaper', status: 'Ready' },
    { id: 3, title: 'Case Study: E-commerce Success', type: 'Case Study', status: 'Ready' },
    { id: 4, title: 'Video: SEO Tutorial', type: 'Video', status: 'Ready' }
];

const AVAILABLE_ASSETS = [
    { id: 1, name: 'Image: Hero Banner', type: 'Image', status: 'Ready' },
    { id: 2, name: 'PDF: Service Guide', type: 'PDF', status: 'Ready' },
    { id: 3, name: 'Video: Demo', type: 'Video', status: 'Ready' },
    { id: 4, name: 'Icon: Service Logo', type: 'Icon', status: 'Ready' },
    { id: 5, name: 'Infographic: Stats', type: 'Infographic', status: 'Ready' },
    { id: 6, name: 'Template: Proposal', type: 'Template', status: 'Ready' }
];

const SubServiceMasterView: React.FC = () => {
    const { data: subServices = [], create, update, remove } = useData<SubServiceItem>('subServices');
    const { data: services = [] } = useData<Service>('services');
    const { data: contentAssets = [], update: updateContentAsset, refresh: refreshContentAssets } = useData<ContentRepositoryItem>('content');
    const { data: libraryAssets = [], update: updateLibraryAsset, refresh: refreshLibraryAssets } = useData<AssetLibraryItem>('assetLibrary');
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
    const [activeFormTab, setActiveFormTab] = useState<'general' | 'seo' | 'insights' | 'assets'>('general');
    const [activeTab, setActiveTab] = useState('Core');

    // Form State
    const [formData, setFormData] = useState<Partial<SubServiceItem>>({
        sub_service_name: '',
        parent_service_id: 0,
        slug: '',
        full_url: '',
        description: '',
        status: 'Draft',
        language: 'en',
        content_type: 'Cluster',
        buyer_journey_stage: 'Consideration',
        h1: '',
        h2_list: [],
        h3_list: [],
        meta_title: '',
        meta_description: '',
        focus_keywords: [],
        secondary_keywords: [],
        og_title: '',
        og_description: '',
        og_image_url: '',
        og_type: 'website',
        schema_type_id: 'Service',
        primary_cta_label: '',
        primary_cta_url: '',
        brand_id: 0,
        content_owner_id: 0
    });

    // Additional form state
    const [h2Headings, setH2Headings] = useState<string[]>([]);
    const [h3Headings, setH3Headings] = useState<string[]>([]);
    const [tempH2, setTempH2] = useState('');
    const [tempH3, setTempH3] = useState('');
    const [tempKeyword, setTempKeyword] = useState('');
    const [tempSecondaryKeyword, setTempSecondaryKeyword] = useState('');
    const [linkedInsights, setLinkedInsights] = useState<any[]>([]);
    const [linkedAssets, setLinkedAssets] = useState<any[]>([]);
    const [contentReady, setContentReady] = useState(false);
    const [assetsReady, setAssetsReady] = useState(false);
    const [seoScore, setSeoScore] = useState(75);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [assetSearch, setAssetSearch] = useState('');
    const [repositoryFilter, setRepositoryFilter] = useState('All');

    // Helper functions
    const addKeyword = (field: 'focus_keywords' | 'secondary_keywords', keyword: string) => {
        if (!keyword.trim()) return;
        const currentKeywords = formData[field] || [];
        if (!currentKeywords.includes(keyword.trim())) {
            setFormData(prev => ({
                ...prev,
                [field]: [...currentKeywords, keyword.trim()]
            }));
        }
    };

    const removeKeyword = (field: 'focus_keywords' | 'secondary_keywords', index: number) => {
        const currentKeywords = formData[field] || [];
        setFormData(prev => ({
            ...prev,
            [field]: currentKeywords.filter((_, i) => i !== index)
        }));
    };

    const addH2Heading = () => {
        if (tempH2.trim()) {
            setH2Headings([...h2Headings, tempH2.trim()]);
            setFormData(prev => ({ ...prev, h2_list: [...h2Headings, tempH2.trim()] }));
            setTempH2('');
        }
    };

    const removeH2Heading = (index: number) => {
        const newH2s = h2Headings.filter((_, i) => i !== index);
        setH2Headings(newH2s);
        setFormData(prev => ({ ...prev, h2_list: newH2s }));
    };

    const addH3Heading = () => {
        if (tempH3.trim()) {
            setH3Headings([...h3Headings, tempH3.trim()]);
            setFormData(prev => ({ ...prev, h3_list: [...h3Headings, tempH3.trim()] }));
            setTempH3('');
        }
    };

    const removeH3Heading = (index: number) => {
        const newH3s = h3Headings.filter((_, i) => i !== index);
        setH3Headings(newH3s);
        setFormData(prev => ({ ...prev, h3_list: newH3s }));
    };

    const toggleInsight = (insight: any) => {
        const isSelected = linkedInsights.some(i => i.id === insight.id);
        if (isSelected) {
            setLinkedInsights(linkedInsights.filter(i => i.id !== insight.id));
        } else {
            setLinkedInsights([...linkedInsights, { ...insight, priority: linkedInsights.length + 1 }]);
        }
    };

    const toggleAsset = (asset: any) => {
        const isSelected = linkedAssets.some(a => a.id === asset.id);
        if (isSelected) {
            setLinkedAssets(linkedAssets.filter(a => a.id !== asset.id));
        } else {
            setLinkedAssets([...linkedAssets, asset]);
        }
    };

    const enhanceWithAI = () => {
        // Mock AI enhancement
        alert('AI enhancement feature would analyze your content and suggest improvements for SEO, meta descriptions, and schema markup.');
    };

    const handleSlugChange = (val: string) => {
        const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        const parentService = services.find(s => s.id === formData.parent_service_id);
        const parentSlug = parentService?.slug || 'service';
        setFormData(prev => ({ ...prev, slug, full_url: `/services/${parentSlug}/${slug}` }));
    };

    const filteredData = subServices.filter(item => {
        const matchesSearch = item.sub_service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
        const parentName = services.find(s => s.id === item.parent_service_id)?.service_name || '';
        const matchesParent = parentFilter === 'All Parent Services' || parentName === parentFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        return matchesSearch && matchesParent && matchesStatus;
    });

    // Linked and Available Assets from Asset Library
    const linkedLibraryAssets = useMemo(() => {
        if (!editingItem) return [];
        return libraryAssets.filter(a => {
            const links = Array.isArray(a.linked_sub_service_ids) ? a.linked_sub_service_ids : [];
            return links.map(String).includes(String(editingItem.id));
        });
    }, [libraryAssets, editingItem]);

    const availableLibraryAssets = useMemo(() => {
        if (!editingItem) return [];
        const searchLower = assetSearch.toLowerCase().trim();
        return libraryAssets
            .filter(a => {
                // Check if asset is not already linked
                const links = Array.isArray(a.linked_sub_service_ids) ? a.linked_sub_service_ids : [];
                const isLinked = links.map(String).includes(String(editingItem.id));
                if (isLinked) return false;

                // Check repository filter
                if (repositoryFilter !== 'All' && a.repository !== repositoryFilter) return false;

                // Check if asset matches search query (if any)
                if (!searchLower) return true;
                const name = (a.name || '').toLowerCase();
                const assetType = (a.type || '').toLowerCase();
                const repository = (a.repository || '').toLowerCase();
                return name.includes(searchLower) || assetType.includes(searchLower) || repository.includes(searchLower);
            })
            .slice(0, 20); // Limit to show 20 results
    }, [libraryAssets, editingItem, assetSearch, repositoryFilter]);

    const availableContentTypes = useMemo(() => {
        return contentTypes.length > 0 ? contentTypes : CONTENT_TYPES.map(type => ({ content_type: type }));
    }, [contentTypes]);

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

    const handleToggleLibraryLink = async (asset: AssetLibraryItem) => {
        if (!editingItem) return;
        const currentLinks = Array.isArray(asset.linked_sub_service_ids) ? asset.linked_sub_service_ids : [];
        const isLinked = currentLinks.map(String).includes(String(editingItem.id));
        const newLinks = isLinked
            ? currentLinks.filter(id => String(id) !== String(editingItem.id))
            : [...currentLinks, editingItem.id];

        try {
            // Update the library asset with new links
            await updateLibraryAsset(asset.id, { linked_sub_service_ids: newLinks });

            // Force a refresh to ensure we have the latest data
            await refreshLibraryAssets();
        } catch (e) {
            console.error('Library asset link update error:', e);
            // Even if there's an error, try to refresh to show current state
            try {
                await refreshLibraryAssets();
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

    if (viewMode === 'list') {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Sub-Services Master</h1>
                        <p className="text-slate-600 mt-1">Manage your sub-services with complete SEO and content configuration</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Export CSV
                        </button>
                        <button
                            onClick={handleCreateClick}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-lg transition-all"
                        >
                            Add Sub-Service
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search sub-services..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Parent Service</label>
                            <select
                                value={parentFilter}
                                onChange={(e) => setParentFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                                <option value="All Parent Services">All Parent Services</option>
                                {services.map(service => (
                                    <option key={service.id} value={service.service_name}>{service.service_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                                {STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <Table
                        data={filteredData}
                        columns={[
                            {
                                header: 'Sub-Service Name',
                                accessor: (item: SubServiceItem) => (
                                    <div>
                                        <div className="font-medium text-slate-900">{item.sub_service_name}</div>
                                        <div className="text-sm text-slate-500">{item.slug}</div>
                                    </div>
                                )
                            },
                            {
                                header: 'Parent Service',
                                accessor: (item: SubServiceItem) => {
                                    const parent = services.find(s => s.id === item.parent_service_id);
                                    return parent ? parent.service_name : 'Unknown';
                                }
                            },
                            {
                                header: 'Content Type',
                                accessor: (item: SubServiceItem) => item.content_type || 'Cluster'
                            },
                            {
                                header: 'Status',
                                accessor: (item: SubServiceItem) => getStatusBadge(item.status)
                            },
                            {
                                header: 'Actions',
                                accessor: (item: SubServiceItem) => (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-x-0 bottom-0 top-16 z-[60] bg-white flex flex-col overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('list')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {editingItem ? `Edit Sub-Service: ${editingItem.sub_service_name}` : 'Add New Sub-Service'}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">Create a new sub-service with complete SEO and content configuration</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setViewMode('list')}
                        className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={() => {
                            setFormData(prev => ({ ...prev, status: 'Published' }));
                            handleSave();
                        }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-lg transition-all"
                    >
                        Create Sub-Service
                    </button>
                </div>
            </div>

            {/* Form Tabs */}
            <div className="border-b border-slate-200 px-6 bg-white flex-shrink-0">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'general', label: 'General Info', icon: '📋' },
                        { id: 'seo', label: 'SEO & Content', icon: '🔍' },
                        { id: 'insights', label: 'Linked Insights', icon: '💡' },
                        { id: 'assets', label: 'Linked Assets', icon: '🎨' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFormTab(tab.id as any)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${activeFormTab === tab.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                <div className="max-w-4xl mx-auto space-y-8 pb-20">

                    {/* General Info Tab */}
                    {activeFormTab === 'general' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="text-xl">📋</span>
                                    General Info
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Parent Service */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Parent Service <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.parent_service_id || 0}
                                            onChange={(e) => setFormData(prev => ({ ...prev, parent_service_id: parseInt(e.target.value) }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                                        >
                                            <option value={0}>Select parent service</option>
                                            {services.map(service => (
                                                <option key={service.id} value={service.id}>{service.service_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sub-Service Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Sub-Service Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.sub_service_name || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData(prev => ({ ...prev, sub_service_name: val }));
                                                if (!editingItem && !formData.slug) handleSlugChange(val);
                                            }}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            placeholder="Enter sub-service name"
                                        />
                                    </div>

                                    {/* URL Slug */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            URL Slug <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                value={formData.slug || ''}
                                                onChange={(e) => handleSlugChange(e.target.value)}
                                                className="flex-1 px-4 py-3 border border-slate-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                                                placeholder="sub-service-name"
                                            />
                                            <button
                                                onClick={handleCopyFullUrl}
                                                className={`px-4 py-3 border border-l-0 border-slate-300 rounded-r-lg text-sm font-medium transition-all ${copiedUrl
                                                    ? 'bg-green-50 text-green-700 border-green-300'
                                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {copiedUrl ? '✓ Copied' : 'Copy URL'}
                                            </button>
                                        </div>
                                        {formData.full_url && (
                                            <p className="text-xs text-slate-500 mt-1 font-mono">{formData.full_url}</p>
                                        )}
                                    </div>

                                    {/* Content Type */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Content Type</label>
                                        <select
                                            value={formData.content_type || 'Cluster'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                                        >
                                            {availableContentTypes.map(ct => (
                                                <option key={ct.content_type} value={ct.content_type}>{ct.content_type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Buyer Journey Stage */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Buyer Journey Stage</label>
                                        <select
                                            value={formData.buyer_journey_stage || 'Consideration'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, buyer_journey_stage: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                                        >
                                            {BUYER_JOURNEY_STAGES.map(stage => (
                                                <option key={stage} value={stage}>{stage}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                                        <select
                                            value={formData.status || 'Draft'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                                        >
                                            {STATUSES.filter(s => s !== 'All Status').map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mt-6">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                                        placeholder="Describe your sub-service..."
                                    />
                                </div>

                                {/* CTA Section */}
                                <div className="mt-6">
                                    <h4 className="text-md font-semibold text-slate-700 mb-4">Call to Action</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">CTA Label</label>
                                            <input
                                                type="text"
                                                value={formData.primary_cta_label || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, primary_cta_label: e.target.value }))}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                                placeholder="Get Started"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">CTA URL</label>
                                            <input
                                                type="text"
                                                value={formData.primary_cta_url || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, primary_cta_url: e.target.value }))}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                                placeholder="/contact"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEO Tab */}
                    {activeFormTab === 'seo' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="text-xl">🔍</span>
                                    SEO & Content Structure
                                </h3>

                                {/* H1 */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">H1 Heading</label>
                                    <input
                                        type="text"
                                        value={formData.h1 || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, h1: e.target.value }))}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="Main heading for the page"
                                    />
                                </div>

                                {/* Meta Title & Description */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Meta Title</label>
                                        <input
                                            type="text"
                                            value={formData.meta_title || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            placeholder="SEO title for search engines"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Meta Description</label>
                                        <textarea
                                            value={formData.meta_description || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                                            placeholder="SEO description for search engines"
                                        />
                                    </div>
                                </div>

                                {/* Keywords */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Focus Keywords */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Focus Keywords</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={tempKeyword}
                                                onChange={(e) => setTempKeyword(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (addToList('focus_keywords', tempKeyword, setTempKeyword), e.preventDefault())}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Add focus keyword"
                                            />
                                            <button
                                                onClick={() => addToList('focus_keywords', tempKeyword, setTempKeyword)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {(formData.focus_keywords || []).map((kw, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                                                    <div>
                                                        <span className="font-medium">{kw}</span>
                                                        <div className="text-xs text-slate-500">{getKeywordMetric(kw)}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromList('focus_keywords', idx)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Secondary Keywords */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Secondary Keywords</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={tempSecondaryKeyword}
                                                onChange={(e) => setTempSecondaryKeyword(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword), e.preventDefault())}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Add secondary keyword"
                                            />
                                            <button
                                                onClick={() => addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {(formData.secondary_keywords || []).map((kw, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                                                    <span>{kw}</span>
                                                    <button
                                                        onClick={() => removeFromList('secondary_keywords', idx)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Meta */}
                            <SocialMetaForm
                                formData={formData}
                                setFormData={setFormData}
                            />
                        </div>
                    )}

                    {/* Insights Tab */}
                    {activeFormTab === 'insights' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="text-xl">💡</span>
                                    Linked Insights
                                </h3>
                                <p className="text-slate-600 mb-6">Link relevant content insights to this sub-service</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-slate-700 mb-4">Available Insights</h4>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {AVAILABLE_INSIGHTS.map(insight => (
                                                <div key={insight.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                                    <div>
                                                        <div className="font-medium">{insight.title}</div>
                                                        <div className="text-sm text-slate-500">{insight.type}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleInsight(insight)}
                                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${linkedInsights.some(i => i.id === insight.id)
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {linkedInsights.some(i => i.id === insight.id) ? 'Linked' : 'Link'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-slate-700 mb-4">Linked Insights ({linkedInsights.length})</h4>
                                        <div className="space-y-2">
                                            {linkedInsights.map(insight => (
                                                <div key={insight.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <div>
                                                        <div className="font-medium text-green-900">{insight.title}</div>
                                                        <div className="text-sm text-green-600">Priority: {insight.priority}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleInsight(insight)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Assets Tab */}
                    {activeFormTab === 'assets' && (
                        <div className="space-y-8">
                            {editingItem ? (
                                <ServiceAssetLinker
                                    linkedAssets={linkedLibraryAssets}
                                    availableAssets={availableLibraryAssets}
                                    assetSearch={assetSearch}
                                    setAssetSearch={setAssetSearch}
                                    onToggle={handleToggleLibraryLink}
                                    totalAssets={libraryAssets.length}
                                    allAssets={libraryAssets}
                                    repositoryFilter={repositoryFilter}
                                    setRepositoryFilter={setRepositoryFilter}
                                />
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🎨</div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Asset Linking</h3>
                                        <p className="text-slate-600">Save the sub-service first to link assets from the Asset Library</p>
                                        <button
                                            onClick={() => setActiveFormTab('general')}
                                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Go to General Info
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Governance Tab */}
                    {activeTab === 'Governance' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="text-xl">⚖️</span>
                                Governance & Ownership
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Brand */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
                                    <select
                                        value={formData.brand_id || 0}
                                        onChange={(e) => setFormData(prev => ({ ...prev, brand_id: parseInt(e.target.value) }))}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                                    >
                                        <option value={0}>Select brand</option>
                                        {brands.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Content Owner */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Content Owner</label>
                                    <select
                                        value={formData.content_owner_id || 0}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content_owner_id: parseInt(e.target.value) }))}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                                    >
                                        <option value={0}>Select content owner</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Timestamps */}
                            {editingItem && (
                                <div className="mt-6 pt-6 border-t border-slate-200">
                                    <h4 className="font-semibold text-slate-700 mb-4">Timestamps</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                        <div>
                                            <span className="text-slate-500">Created:</span>
                                            <span className="ml-2 font-medium">{editingItem.created_at ? new Date(editingItem.created_at).toLocaleString() : 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Updated:</span>
                                            <span className="ml-2 font-medium">{editingItem.updated_at ? new Date(editingItem.updated_at).toLocaleString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubServiceMasterView;
import React, { useState, useMemo } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import SocialMetaForm from '../components/SocialMetaForm';
import AssetLinker from '../components/AssetLinker';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { SubServiceItem, Service, ContentRepositoryItem, Brand, User } from '../types';

const STATUSES = ['All Status', 'Published', 'Draft', 'Archived'];

const SubServiceMasterView: React.FC = () => {
    const { data: subServices = [], create, update, remove } = useData<SubServiceItem>('subServices');
    const { data: services = [] } = useData<Service>('services');
    const { data: contentAssets = [], update: updateContentAsset, refresh: refreshContentAssets } = useData<ContentRepositoryItem>('content');
    const { data: brands = [] } = useData<Brand>('brands');
    const brandsLoaded = Array.isArray(brands) && brands.length > 0;
    const { data: users = [] } = useData<User>('users');

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [parentFilter, setParentFilter] = useState('All Parent Services');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [editingItem, setEditingItem] = useState<SubServiceItem | null>(null);
    const [assetSearch, setAssetSearch] = useState('');

    // Form State
    const [formData, setFormData] = useState<any>({
        sub_service_name: '',
        parent_service_id: 0,
        slug: '',
        description: '',
        status: 'Draft',
        meta_title: '',
        meta_description: '',
        og_title: '',
        og_description: '',
        og_image_url: '',
        twitter_title: '',
        twitter_description: '',
        twitter_image_url: '',
        social_meta: {
            linkedin: { title: '', description: '', image_url: '' },
            facebook: { title: '', description: '', image_url: '' },
            instagram: { title: '', description: '', image_url: '' }
        },
        brand_id: 0,
        content_owner_id: 0
    });

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
        setEditingItem(null);
        setFormData({
            sub_service_name: '',
            parent_service_id: 0,
            slug: '',
            description: '',
            status: 'Draft',
            meta_title: '',
            meta_description: '',
            og_title: '',
            og_description: '',
            og_image_url: '',
            twitter_title: '',
            twitter_description: '',
            twitter_image_url: '',
            social_meta: {
                linkedin: { title: '', description: '', image_url: '' },
                facebook: { title: '', description: '', image_url: '' },
                instagram: { title: '', description: '', image_url: '' }
            },
            brand_id: 0,
            content_owner_id: 0
        });
        setViewMode('form');
    };

    const handleEdit = (item: SubServiceItem) => {
        setEditingItem(item);
        setFormData({
            ...item,
            social_meta: (item as any).social_meta || {
                linkedin: { title: '', description: '', image_url: '' },
                facebook: { title: '', description: '', image_url: '' },
                instagram: { title: '', description: '', image_url: '' }
            }
        });
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
        setFormData((prev: any) => ({ ...prev, slug }));
    };

    const handleToggleAssetLink = async (asset: ContentRepositoryItem) => {
        if (!editingItem) return;

        const currentLinks = Array.isArray(asset.linked_sub_service_ids) ? asset.linked_sub_service_ids : [];
        const isLinked = currentLinks.map(String).includes(String(editingItem.id));
        const newLinks = isLinked
            ? currentLinks.filter(id => String(id) !== String(editingItem.id))
            : [...currentLinks, editingItem.id];

        try {
            await updateContentAsset(asset.id, { linked_sub_service_ids: newLinks });
        } catch (e) {
            // ignore errors for optimistic behavior
        } finally {
            try { await refreshContentAssets(); } catch (e) { /* ignore */ }
        }
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'sub_services_export');
    };

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
                            <p className="text-xs text-slate-500 mt-1">Manage sub-service details, metadata, and asset connections</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setViewMode('list')} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Discard</button>
                        <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">Save Sub-Service</button>
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="max-w-5xl mx-auto space-y-8 pb-20">

                        {/* Core Information Card */}
                        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50 rounded-2xl border-2 border-indigo-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white overflow-hidden">
                                <div className="absolute top-0 right-0 opacity-10">
                                    <div className="w-40 h-40 rounded-full bg-white"></div>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold">Core Information</h3>
                                    <p className="text-indigo-100 text-sm mt-1">Sub-service name, parent service, and URL slug</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-10">
                                <div className="space-y-8">
                                    {/* Row 1: Parent Service & Sub-Service Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Tooltip content="Select the parent service this sub-service belongs to">
                                            <div className="bg-white border-2 border-indigo-100 rounded-2xl p-5 shadow-sm hover:border-indigo-200 transition-colors space-y-3">
                                                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px]">1</span>
                                                    Parent Service
                                                    <span className="text-red-500 text-base leading-none">*</span>
                                                </div>
                                                <select
                                                    value={formData.parent_service_id}
                                                    onChange={(e) => setFormData({ ...formData, parent_service_id: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium bg-slate-50 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                                >
                                                    <option value={0}>Select Parent Service...</option>
                                                    {services.map(s => (
                                                        <option key={s.id} value={s.id}>{s.service_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </Tooltip>

                                        <Tooltip content="Name of the sub-service (visible in lists and URLs)">
                                            <div className="bg-white border-2 border-indigo-100 rounded-2xl p-5 shadow-sm hover:border-indigo-200 transition-colors space-y-3">
                                                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px]">2</span>
                                                    Sub-Service Name
                                                    <span className="text-red-500 text-base leading-none">*</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.sub_service_name}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData({ ...formData, sub_service_name: val });
                                                        if (!formData.slug) handleSlugChange(val);
                                                    }}
                                                    placeholder="Enter sub-service name..."
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium bg-white transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </Tooltip>
                                    </div>

                                    {/* Row 2: URL Slug & Status */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Tooltip content="URL-friendly slug (auto-generated from name)">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">URL Slug</label>
                                                <input
                                                    type="text"
                                                    value={formData.slug}
                                                    onChange={(e) => handleSlugChange(e.target.value)}
                                                    placeholder="auto-generated-from-name"
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-mono bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                                />
                                            </div>
                                        </Tooltip>

                                        <Tooltip content="Publication status">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Status</label>
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                                >
                                                    <option value="Draft">Draft</option>
                                                    <option value="Published">Published</option>
                                                    <option value="Archived">Archived</option>
                                                </select>
                                            </div>
                                        </Tooltip>
                                    </div>

                                    {/* Description */}
                                    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-xl border-2 border-slate-200 p-6">
                                        <Tooltip content="Brief description of the sub-service">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label>
                                                    <span className={`text-[10px] font-mono font-bold ${(formData.description?.length || 0) > 500 ? 'text-red-500' : 'text-slate-600'}`}>
                                                        {formData.description?.length || 0}/500
                                                    </span>
                                                </div>
                                                <textarea
                                                    value={formData.description || ''}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Describe the sub-service, its purpose, and key features..."
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none h-32"
                                                />
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEO Metadata Card */}
                        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-green-50 to-slate-50 border-b border-slate-200 px-8 py-8">
                                <div className="flex items-center gap-3">
                                    <span className="bg-green-100 text-green-600 p-2.5 rounded-lg text-lg">🔍</span>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">SEO Metadata</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Search engine visibility and metadata</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Meta Title</label>
                                            <span className={`text-[10px] font-mono font-bold ${(formData.meta_title?.length || 0) > 60 ? 'text-red-500' : 'text-green-600'}`}>
                                                {formData.meta_title?.length || 0}/60
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.meta_title || ''}
                                            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                            placeholder="Sub-Service Name - Brand"
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Meta Description</label>
                                            <span className={`text-[10px] font-mono font-bold ${(formData.meta_description?.length || 0) > 160 ? 'text-red-500' : 'text-green-600'}`}>
                                                {formData.meta_description?.length || 0}/160
                                            </span>
                                        </div>
                                        <textarea
                                            value={formData.meta_description || ''}
                                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                            placeholder="Brief summary for search results..."
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none h-24"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Metadata Card (refactored) */}
                        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-6">
                                {/* Use reusable SocialMetaForm component */}
                                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                                {/* @ts-ignore */}
                                <SocialMetaForm formData={formData} setFormData={setFormData} />
                            </div>
                        </div>

                        {/* Governance Card */}
                        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 px-8 py-8">
                                <div className="flex items-center gap-3">
                                    <span className="bg-teal-100 text-teal-600 p-2.5 rounded-lg text-lg">⚖️</span>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Governance & Ownership</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Ownership and management assignments</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Tooltip content="Associated brand">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Brand</label>
                                            <select
                                                value={formData.brand_id || 0}
                                                onChange={(e) => setFormData({ ...formData, brand_id: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                                            >
                                                <option value={0}>Select Brand...</option>
                                                {brands.map(b => (
                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </Tooltip>

                                    <Tooltip content="Content owner/manager">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Content Owner</label>
                                            <select
                                                value={formData.content_owner_id || 0}
                                                onChange={(e) => setFormData({ ...formData, content_owner_id: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                                            >
                                                <option value={0}>Select Owner...</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </Tooltip>
                                </div>

                                <div className="border-t border-slate-200 pt-6">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Auto-Generated Metadata</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 tracking-wide">Record ID</label>
                                            <input
                                                type="text"
                                                value={editingItem?.id || 'New Record'}
                                                readOnly
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-sm font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 tracking-wide">Created</label>
                                            <input
                                                type="text"
                                                value={(editingItem as any)?.created_at ? new Date((editingItem as any).created_at).toLocaleDateString() : 'N/A'}
                                                readOnly
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-sm font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 tracking-wide">Modified</label>
                                            <input
                                                type="text"
                                                value={(editingItem as any)?.updated_at ? new Date((editingItem as any).updated_at).toLocaleDateString() : 'Just now'}
                                                readOnly
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Asset Linking Card (refactored) */}
                        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Use reusable AssetLinker component */}
                            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                            {/* @ts-ignore */}
                            <AssetLinker linkedAssets={linkedAssets} availableAssets={availableAssets} assetSearch={assetSearch} setAssetSearch={setAssetSearch} onToggle={handleToggleAssetLink} />
                        </div>
                    </div>
                </div>
            </div>
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
                    <button onClick={handleExport} className="text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors hover:bg-slate-50">Export</button>
                    <button onClick={handleCreateClick} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center">
                        <span className="mr-1 text-lg">+</span> Add Sub-Service
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input type="search" className="block w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="Search sub-services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[140px]">
                        <option>All Parent Services</option>
                        {services.map(s => (
                            <option key={s.id} value={s.service_name}>{s.service_name}</option>
                        ))}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[140px]">
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
                                    <div className="font-bold text-slate-800 text-sm hover:text-indigo-600 transition-colors">{item.sub_service_name}</div>
                                </div>
                            )
                        },
                        {
                            header: 'Parent Service',
                            accessor: (item: SubServiceItem) => {
                                const parent = services.find(s => s.id === item.parent_service_id);
                                return (
                                    <Tooltip content="Parent Service">
                                        <span className="text-slate-600 text-sm font-medium bg-slate-50 px-2 py-1 rounded">{parent?.service_name || '-'}</span>
                                    </Tooltip>
                                );
                            }
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
                                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-100">{count}</span>
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
                                    <button onClick={() => handleEdit(item)} className="text-slate-500 hover:text-indigo-600 font-medium text-xs transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-600 font-medium text-xs transition-colors">Delete</button>
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

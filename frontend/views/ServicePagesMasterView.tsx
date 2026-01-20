import React, { useState, useMemo, useEffect } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { SubServiceItem, Service, Brand, User, ContentTypeItem } from '../types';

const STATUSES = ['All Status', 'Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'];

interface ServicePagesMasterViewProps {
    onNavigate?: (view: string, id?: number) => void;
}

const ServicePagesMasterView: React.FC<ServicePagesMasterViewProps> = ({ onNavigate }) => {
    const { data: subServices = [], create, update, remove, refresh: refreshSubServices, loading } = useData<SubServiceItem>('subServices');
    const { data: services = [], refresh: refreshServices } = useData<Service>('services');
    const { data: brands = [], refresh: refreshBrands } = useData<Brand>('brands');
    const { data: users = [], refresh: refreshUsers } = useData<User>('users');
    const { data: contentTypes = [], refresh: refreshContentTypes } = useData<ContentTypeItem>('contentTypes');

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'form' | 'view'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [parentFilter, setParentFilter] = useState('All Parent Services');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [contentTypeFilter, setContentTypeFilter] = useState('All Types');
    const [brandFilter, setBrandFilter] = useState('All Brands');
    const [editingItem, setEditingItem] = useState<SubServiceItem | null>(null);
    const [activeTab, setActiveTab] = useState<'Overview' | 'SEO' | 'CTA' | 'LinkedAssets'>('Overview');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Form State
    const [formData, setFormData] = useState<any>({
        sub_service_name: '',
        parent_service_id: 0,
        slug: '',
        full_url: '',
        description: '',
        status: 'Draft',
        h1: '',
        meta_title: '',
        meta_description: '',
        focus_keywords: [],
        primary_cta_label: '',
        primary_cta_url: '',
        og_title: '',
        og_description: '',
        og_image_url: '',
    });

    const filteredData = subServices.filter(item => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const matchesSearch = !normalizedQuery || [
            item.sub_service_name,
            item.slug,
            item.description,
            item.h1,
            item.meta_title,
        ].some(value => (value || '').toLowerCase().includes(normalizedQuery));

        const parentName = services.find(s => s.id === item.parent_service_id)?.service_name || '';
        const matchesParent = parentFilter === 'All Parent Services' || parentName === parentFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        const matchesContentType = contentTypeFilter === 'All Types' || item.content_type === contentTypeFilter;

        const parentService = services.find(s => s.id === item.parent_service_id);
        const parentBrand = parentService?.brand_id ? brands.find(b => b.id === parentService.brand_id)?.name : null;
        const matchesBrand = brandFilter === 'All Brands' || parentBrand === brandFilter;

        return matchesSearch && matchesParent && matchesStatus && matchesContentType && matchesBrand;
    });

    const handleCreateClick = () => {
        setEditingItem(null);
        setFormData({
            sub_service_name: '',
            parent_service_id: 0,
            slug: '',
            full_url: '',
            description: '',
            status: 'Draft',
            h1: '',
            meta_title: '',
            meta_description: '',
            focus_keywords: [],
            primary_cta_label: '',
            primary_cta_url: '',
            og_title: '',
            og_description: '',
            og_image_url: '',
        });
        setActiveTab('Overview');
        setViewMode('form');
    };

    const handleView = (item: SubServiceItem) => {
        setEditingItem(item);
        setFormData(item);
        setActiveTab('Overview');
        setViewMode('view');
    };

    const handleEdit = (item: SubServiceItem) => {
        setEditingItem(item);
        setFormData(item);
        setActiveTab('Overview');
        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this service page?')) {
            await remove(id);
        }
    };

    const handleSave = async () => {
        if (!formData.sub_service_name) {
            return alert("Service Page Name is required");
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

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                refreshSubServices?.(),
                refreshServices?.(),
                refreshBrands?.(),
                refreshUsers?.(),
                refreshContentTypes?.(),
            ]);
            setTimeout(() => setIsRefreshing(false), 800);
        } catch (error) {
            console.error('Refresh failed:', error);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    refreshSubServices?.(),
                    refreshServices?.(),
                    refreshBrands?.(),
                    refreshUsers?.(),
                    refreshContentTypes?.(),
                ]);
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };
        loadData();
    }, []);

    const isViewMode = viewMode === 'view';

    const getInputClasses = (baseClasses: string) => {
        return isViewMode
            ? `${baseClasses} bg-slate-50 cursor-not-allowed opacity-75`
            : baseClasses;
    };

    if (viewMode === 'form' || viewMode === 'view') {
        return (
            <div className="fixed inset-x-0 bottom-0 top-16 z-[60] bg-white flex flex-col overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white shadow-sm z-40">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {isViewMode ? 'View Service Page' : (editingItem ? 'Edit Service Page' : 'Add New Service Page')}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {isViewMode ? 'View complete service page information' : 'Create a new service page with SEO and CTA configuration'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setViewMode('list')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 px-6 bg-white flex-shrink-0 z-30">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'Overview', label: '📋 Overview', icon: '📋' },
                            { id: 'SEO', label: '🔍 SEO & Content', icon: '🔍' },
                            { id: 'CTA', label: '🎯 Call-to-Action Configuration', icon: '🎯' },
                            { id: 'LinkedAssets', label: '🔗 Linked Assets & Insights', icon: '🔗' }
                        ].map((tab) => (
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-4xl">
                        {activeTab === 'Overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Service Page Name *</label>
                                        <input
                                            type="text"
                                            value={formData.sub_service_name}
                                            onChange={(e) => setFormData({ ...formData, sub_service_name: e.target.value })}
                                            disabled={isViewMode}
                                            className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500")}
                                            placeholder="Enter service page name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Parent Service *</label>
                                        <select
                                            value={formData.parent_service_id}
                                            onChange={(e) => setFormData({ ...formData, parent_service_id: parseInt(e.target.value) })}
                                            disabled={isViewMode}
                                            className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500")}
                                        >
                                            <option value={0}>Select Parent Service</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.id}>{s.service_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            disabled={isViewMode}
                                            className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500")}
                                            placeholder="service-page-slug"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Full URL</label>
                                        <input
                                            type="text"
                                            value={formData.full_url}
                                            disabled={true}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed opacity-75"
                                            placeholder="/services/service-page-slug"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        disabled={isViewMode}
                                        className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24")}
                                        placeholder="Enter service page description"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            disabled={isViewMode}
                                            className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500")}
                                        >
                                            {STATUSES.filter(s => s !== 'All Status').map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">H1 Heading</label>
                                        <input
                                            type="text"
                                            value={formData.h1}
                                            onChange={(e) => setFormData({ ...formData, h1: e.target.value })}
                                            disabled={isViewMode}
                                            className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500")}
                                            placeholder="Main heading for the page"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'SEO' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Meta Title</label>
                                    <input
                                        type="text"
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                        disabled={isViewMode}
                                        className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500")}
                                        placeholder="SEO meta title (50-60 characters)"
                                        maxLength={60}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{formData.meta_title?.length || 0}/60 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Meta Description</label>
                                    <textarea
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        disabled={isViewMode}
                                        className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20")}
                                        placeholder="SEO meta description (150-160 characters)"
                                        maxLength={160}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{formData.meta_description?.length || 0}/160 characters</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">OG Title</label>
                                        <input
                                            type="text"
                                            value={formData.og_title}
                                            onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                                            disabled={isViewMode}
                                            className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500")}
                                            placeholder="Open Graph title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">OG Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.og_image_url}
                                            onChange={(e) => setFormData({ ...formData, og_image_url: e.target.value })}
                                            disabled={isViewMode}
                                            className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500")}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">OG Description</label>
                                    <textarea
                                        value={formData.og_description}
                                        onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                                        disabled={isViewMode}
                                        className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20")}
                                        placeholder="Open Graph description"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'CTA' && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <h3 className="font-semibold text-blue-900 mb-2">🎯 Call-to-Action Configuration</h3>
                                    <p className="text-sm text-blue-800">Configure the primary call-to-action button for this service page</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">CTA Label</label>
                                        <input
                                            type="text"
                                            value={formData.primary_cta_label}
                                            onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })}
                                            disabled={isViewMode}
                                            className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500")}
                                            placeholder="e.g., Get Started, Learn More"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">CTA URL</label>
                                        <input
                                            type="text"
                                            value={formData.primary_cta_url}
                                            onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })}
                                            disabled={isViewMode}
                                            className={getInputClasses("w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500")}
                                            placeholder="https://example.com/action"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <h4 className="font-medium text-slate-900 mb-3">Preview</h4>
                                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                        {formData.primary_cta_label || 'CTA Button'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'LinkedAssets' && (
                            <div className="space-y-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                    <h3 className="font-semibold text-green-900 mb-2">🔗 Linked Assets & Insights</h3>
                                    <p className="text-sm text-green-800">Link content assets and insights to this service page</p>
                                </div>

                                <div className="text-center py-8 text-slate-500">
                                    <p>No linked assets yet. Link assets from the Asset Library to enhance this service page.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={() => setViewMode('list')}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    {!isViewMode && (
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Save Changes
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-4 bg-white shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Service Pages Master</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage all service pages with SEO and CTA configuration</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            {isRefreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
                        </button>
                        <button
                            onClick={handleCreateClick}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            + Add Service Page
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="border-b border-slate-200 px-6 py-4 bg-white space-y-4">
                <div className="flex gap-4">
                    <input
                        type="search"
                        placeholder="Search service pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <select
                        value={parentFilter}
                        onChange={(e) => setParentFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option>All Parent Services</option>
                        {services.map(s => (
                            <option key={s.id} value={s.service_name}>{s.service_name}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <select
                        value={contentTypeFilter}
                        onChange={(e) => setContentTypeFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option>All Types</option>
                        {contentTypes.map(ct => (
                            <option key={ct.id} value={ct.content_type}>{ct.content_type}</option>
                        ))}
                    </select>
                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option>All Brands</option>
                        {brands.map(b => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-slate-100 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">Service Page</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">Parent Service</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">URL</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">Status</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">CTA</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-900 font-medium">{item.sub_service_name}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{services.find(s => s.id === item.parent_service_id)?.service_name || '-'}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{item.full_url || '-'}</td>
                                <td className="px-6 py-4 text-sm">{getStatusBadge(item.status)}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{item.primary_cta_label || '-'}</td>
                                <td className="px-6 py-4 text-sm flex gap-2">
                                    <button onClick={() => handleView(item)} className="text-indigo-600 hover:text-indigo-700">View</button>
                                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-700">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <p>No service pages found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicePagesMasterView;

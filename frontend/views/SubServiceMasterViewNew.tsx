import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { SubServiceItem, Service } from '../types';

const SubServiceMasterViewNew: React.FC = () => {
    const { data: subServices = [], create, update, remove, refresh } = useData<SubServiceItem>('subServices');
    const { data: services = [] } = useData<Service>('services');

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [parentServiceFilter, setParentServiceFilter] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [editingItem, setEditingItem] = useState<SubServiceItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<SubServiceItem>>({
        sub_service_name: '',
        parent_service_id: 0,
        slug: '',
        full_url: '',
        description: '',
        status: 'Draft',
        meta_title: '',
        meta_description: '',
        h1: '',
    });

    // Filter sub-services
    const filteredSubServices = useMemo(() => {
        return subServices.filter(item => {
            const matchesSearch = !searchQuery ||
                item.sub_service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesParent = !parentServiceFilter || item.parent_service_id === parentServiceFilter;
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

            return matchesSearch && matchesParent && matchesStatus;
        });
    }, [subServices, searchQuery, parentServiceFilter, statusFilter]);

    // Get parent service name
    const getParentServiceName = (parentServiceId: number) => {
        return services.find(s => s.id === parentServiceId)?.service_name || 'Unknown';
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingItem) {
                await update(editingItem.id, formData);
            } else {
                await create(formData);
            }
            resetForm();
            setViewMode('list');
            refresh();
        } catch (error) {
            console.error('Failed to save sub-service:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit
    const handleEdit = (item: SubServiceItem) => {
        setEditingItem(item);
        setFormData(item);
        setViewMode('form');
    };

    // Handle delete
    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this sub-service?')) {
            try {
                await remove(id);
                refresh();
            } catch (error) {
                console.error('Failed to delete sub-service:', error);
            }
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            sub_service_name: '',
            parent_service_id: 0,
            slug: '',
            full_url: '',
            description: '',
            status: 'Draft',
            meta_title: '',
            meta_description: '',
            h1: '',
        });
        setEditingItem(null);
    };

    // List View
    if (viewMode === 'list') {
        return (
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Sub-Service Master</h1>
                        <p className="text-slate-600 mt-1">Manage sub-services and their mappings to parent services</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setViewMode('form');
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        + Create Sub-Service
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search sub-services..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Parent Service</label>
                        <select
                            value={parentServiceFilter || ''}
                            onChange={(e) => setParentServiceFilter(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">All Services</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.service_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option>All</option>
                            <option>Draft</option>
                            <option>Published</option>
                            <option>Archived</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setParentServiceFilter(null);
                                setStatusFilter('All');
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Sub-Service Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Parent Service</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Slug</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredSubServices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No sub-services found
                                    </td>
                                </tr>
                            ) : (
                                filteredSubServices.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.sub_service_name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{getParentServiceName(item.parent_service_id)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.slug}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                                                    item.status === 'Draft' ? 'bg-slate-100 text-slate-700' :
                                                        'bg-amber-100 text-amber-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm space-x-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="text-sm text-slate-600">
                    Showing {filteredSubServices.length} of {subServices.length} sub-services
                </div>
            </div>
        );
    }

    // Form View
    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {editingItem ? 'Edit Sub-Service' : 'Create Sub-Service'}
                    </h1>
                    <p className="text-slate-600 mt-1">
                        {editingItem ? 'Update sub-service details' : 'Add a new sub-service to the system'}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setViewMode('list');
                        resetForm();
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700"
                >
                    ← Back to List
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sub-Service Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sub-Service Name *</label>
                        <input
                            type="text"
                            value={formData.sub_service_name || ''}
                            onChange={(e) => setFormData({ ...formData, sub_service_name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., On-Page SEO"
                            required
                        />
                    </div>

                    {/* Parent Service */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Parent Service *</label>
                        <select
                            value={formData.parent_service_id || ''}
                            onChange={(e) => setFormData({ ...formData, parent_service_id: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            required
                        >
                            <option value="">Select parent service</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.service_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                        <input
                            type="text"
                            value={formData.slug || ''}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., on-page-seo"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                            value={formData.status || 'Draft'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option>Draft</option>
                            <option>Published</option>
                            <option>Archived</option>
                        </select>
                    </div>
                </div>

                {/* Full URL */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full URL</label>
                    <input
                        type="url"
                        value={formData.full_url || ''}
                        onChange={(e) => setFormData({ ...formData, full_url: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://example.com/services/seo/on-page-seo"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                        placeholder="Describe this sub-service..."
                    />
                </div>

                {/* SEO Fields */}
                <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">SEO Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">H1 Tag</label>
                            <input
                                type="text"
                                value={formData.h1 || ''}
                                onChange={(e) => setFormData({ ...formData, h1: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Main heading"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                            <input
                                type="text"
                                value={formData.meta_title || ''}
                                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="SEO title (50-60 chars)"
                            />
                        </div>
                    </div>
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                        <textarea
                            value={formData.meta_description || ''}
                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                            placeholder="SEO description (150-160 chars)"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-slate-200">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : editingItem ? 'Update Sub-Service' : 'Create Sub-Service'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setViewMode('list');
                            resetForm();
                        }}
                        className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubServiceMasterViewNew;

import React, { useState } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { SubServiceItem, Service, ContentRepositoryItem } from '../types';

const STATUSES = ['All Status', 'Published', 'Draft', 'Archived'];

const SubServiceMasterView: React.FC = () => {
    const { data: subServices, create, update, remove } = useData<SubServiceItem>('subServices');
    const { data: services } = useData<Service>('services');
    const { data: contentAssets } = useData<ContentRepositoryItem>('content');

    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [parentFilter, setParentFilter] = useState('All Parent Services');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [editingItem, setEditingItem] = useState<SubServiceItem | null>(null);
    const [formData, setFormData] = useState<any>({
        sub_service_name: '',
        parent_service_id: 0,
        slug: '',
        description: '',
        status: 'Draft',
        meta_title: '',
        meta_description: ''
    });

    const filteredData = subServices.filter(item => {
        const matchesSearch = item.sub_service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
        const parentName = services.find(s => s.id === item.parent_service_id)?.service_name || '';
        const matchesParent = parentFilter === 'All Parent Services' || parentName === parentFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        return matchesSearch && matchesParent && matchesStatus;
    });

    const handleCreateClick = () => {
        setEditingItem(null);
        setFormData({
            sub_service_name: '',
            parent_service_id: 0,
            slug: '',
            description: '',
            status: 'Draft',
            meta_title: '',
            meta_description: ''
        });
        setViewMode('form');
    };

    const handleEdit = (item: SubServiceItem) => {
        setEditingItem(item);
        setFormData(item);
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

    const handleExport = () => {
        exportToCSV(filteredData, 'sub_services_export');
    };

    if (viewMode === 'form') {
        return (
            <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-slide-up overflow-hidden">
                {/* Header */}
                <div className="border-b border-slate-200 px-8 py-6 flex justify-between items-center bg-white shadow-sm z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode('list')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{editingItem ? `Edit: ${editingItem.sub_service_name}` : 'Create Sub-Service'}</h2>
                            <p className="text-xs text-slate-500">Manage sub-service details and SEO metadata</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setViewMode('list')} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Discard</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">Save</button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div className="max-w-4xl mx-auto space-y-8 pb-20">
                        {/* Core Section */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-200 px-8 py-5">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Core Information</h3>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Tooltip content="Select the parent service this sub-service belongs to">
                                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Parent Service *</label>
                                        </Tooltip>
                                        <select
                                            value={formData.parent_service_id}
                                            onChange={(e) => setFormData({ ...formData, parent_service_id: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        >
                                            <option value={0}>Select Parent Service...</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.id}>{s.service_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Sub-Service Name *</label>
                                        <input
                                            type="text"
                                            value={formData.sub_service_name}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, sub_service_name: val });
                                                if (!formData.slug) handleSlugChange(val);
                                            }}
                                            placeholder="Enter sub-service name..."
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Tooltip content="URL-friendly slug (auto-generated from name)">
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">URL Slug</label>
                                    </Tooltip>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => handleSlugChange(e.target.value)}
                                        placeholder="auto-generated-from-name"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <Tooltip content="Brief description of the sub-service">
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Description</label>
                                    </Tooltip>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the sub-service..."
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none h-32"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Published">Published</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Tooltip content="Record ID (auto-generated)">
                                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Record ID</label>
                                        </Tooltip>
                                        <input
                                            type="text"
                                            value={editingItem?.id || 'New Record'}
                                            readOnly
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEO Section */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-slate-50 border-b border-slate-200 px-8 py-5">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                                    <span className="bg-green-100 text-green-600 p-2 rounded mr-3">🔍</span>
                                    SEO Metadata
                                </h3>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Meta Title</label>
                                        <span className={`text-[10px] font-mono font-bold ${(formData.meta_title?.length || 0) > 60 ? 'text-red-500' : 'text-green-600'}`}>
                                            {formData.meta_title?.length || 0}/60
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                        placeholder="Sub-Service Name - Brand"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
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
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        placeholder="Brief summary for search results..."
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none h-24"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Sub-Service Master</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage sub-service offerings linked to main services</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">Export</button>
                    <button onClick={handleCreateClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">+ Add</button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <svg className="absolute inset-y-0 left-0 w-4 h-4 text-slate-400 mt-3 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="search"
                        className="block w-full pl-10 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Search sub-services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    value={parentFilter}
                    onChange={(e) => setParentFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 text-sm rounded-lg px-3 py-2.5 min-w-[140px]"
                >
                    <option>All Parent Services</option>
                    {services.map(s => (
                        <option key={s.id} value={s.service_name}>{s.service_name}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 text-sm rounded-lg px-3 py-2.5 min-w-[140px]"
                >
                    {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <Table
                    columns={[
                        { header: 'Sub-Service Name', accessor: 'sub_service_name', className: 'font-bold text-slate-800' },
                        {
                            header: 'Parent Service',
                            accessor: (item: SubServiceItem) => {
                                const parent = services.find(s => s.id === item.parent_service_id);
                                return <span className="text-slate-600 text-sm">{parent?.service_name || '-'}</span>;
                            }
                        },
                        { header: 'Slug', accessor: 'slug', className: 'font-mono text-xs text-slate-500' },
                        {
                            header: 'Linked Assets',
                            accessor: (item: SubServiceItem) => {
                                const count = contentAssets.filter(a => a.linked_sub_service_ids?.includes(item.id)).length;
                                return <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{count}</span>;
                            }
                        },
                        { header: 'Status', accessor: (item: SubServiceItem) => getStatusBadge(item.status) },
                        {
                            header: 'Actions',
                            accessor: (item: SubServiceItem) => (
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(item)} className="text-slate-500 hover:text-blue-600 text-xs font-bold transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-600 text-xs font-bold transition-colors">Delete</button>
                                </div>
                            )
                        }
                    ]}
                    data={filteredData}
                    title={`Sub-Services (${filteredData.length})`}
                />
            </div>
        </div>
    );
};

export default SubServiceMasterView;

import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { ContentTypeItem } from '../types';
import { ChevronDown, Plus, Edit2, Trash2, Download, Search, X, Eye, EyeOff } from 'lucide-react';

const CATEGORIES = ['Blog', 'Pillar', 'Landing Page', 'Case Study', 'Whitepaper', 'Guide', 'Article', 'Tutorial', 'News', 'Product', 'Service', 'Other'];
const CONTENT_OWNER_ROLES = ['Content Writer', 'Designer', 'Developer', 'SEO Specialist', 'Manager', 'Other'];

const ContentTypeMasterView: React.FC = () => {
    const { data: items, create, update, remove, loading } = useData<ContentTypeItem>('content-types');

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentTypeItem | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<ContentTypeItem>>({
        content_type: '',
        category: '',
        description: '',
        default_wordcount_min: 500,
        default_wordcount_max: 2000,
        default_graphic_requirements: '',
        default_qc_checklist: '',
        seo_focus_keywords_required: 1,
        social_media_applicable: 1,
        estimated_creation_hours: 4,
        content_owner_role: '',
        use_in_campaigns: 1,
        status: 'active'
    });

    // Get unique categories from items
    const uniqueCategories = useMemo(() => [...new Set(items.map(i => i.category))].filter(Boolean).sort(), [items]);

    // Filter data
    const filteredData = useMemo(() => {
        return items.filter(item => {
            const matchesSearch =
                item.content_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            const matchesStatus = !statusFilter || item.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [items, searchQuery, categoryFilter, statusFilter]);

    const handleOpenModal = (item?: ContentTypeItem) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({
                content_type: '',
                category: '',
                description: '',
                default_wordcount_min: 500,
                default_wordcount_max: 2000,
                default_graphic_requirements: '',
                default_qc_checklist: '',
                seo_focus_keywords_required: 1,
                social_media_applicable: 1,
                estimated_creation_hours: 4,
                content_owner_role: '',
                use_in_campaigns: 1,
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSave = async () => {
        if (!formData.content_type || !formData.category) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            if (editingItem) {
                await update(editingItem.id, formData);
            } else {
                await create(formData as ContentTypeItem);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this content type?')) {
            try {
                await remove(id);
            } catch (error) {
                console.error('Error deleting:', error);
                alert('Failed to delete. Please try again.');
            }
        }
    };

    const handleExport = () => {
        const csv = [
            ['Content Type', 'Category', 'Description', 'Min Words', 'Max Words', 'Creation Hours', 'Owner Role', 'SEO Required', 'Social Applicable', 'Use in Campaigns', 'Status'],
            ...filteredData.map(item => [
                item.content_type,
                item.category,
                item.description || '',
                item.default_wordcount_min || '',
                item.default_wordcount_max || '',
                item.estimated_creation_hours || '',
                item.content_owner_role || '',
                item.seo_focus_keywords_required ? 'Yes' : 'No',
                item.social_media_applicable ? 'Yes' : 'No',
                item.use_in_campaigns ? 'Yes' : 'No',
                item.status
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content-type-master-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Content Type Master</h1>
                    <p className="text-slate-500 mt-1">Manage content types, categories, and default attributes for campaigns</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors"
                    >
                        <Plus size={16} />
                        Add Content Type
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search content types, categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={18} className="text-slate-400" />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-8"></th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Content Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Word Count</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Creation Hours</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Owner Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                        No records found
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map(item => (
                                    <React.Fragment key={item.id}>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                                >
                                                    {expandedRow === item.id ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.content_type}</td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {item.default_wordcount_min}-{item.default_wordcount_max}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {item.estimated_creation_hours}h
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{item.content_owner_role || '-'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {item.status === 'active' ? '✓ Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(item)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRow === item.id && (
                                            <tr className="bg-slate-50 border-t-2 border-slate-200">
                                                <td colSpan={8} className="px-6 py-4">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                                                            <p className="text-sm text-slate-700">{item.description}</p>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <h4 className="font-semibold text-slate-900 mb-2">Flags</h4>
                                                                <ul className="text-sm space-y-1">
                                                                    <li>SEO Keywords Required: {item.seo_focus_keywords_required ? '✓ Yes' : '✗ No'}</li>
                                                                    <li>Social Media Applicable: {item.social_media_applicable ? '✓ Yes' : '✗ No'}</li>
                                                                    <li>Use in Campaigns: {item.use_in_campaigns ? '✓ Yes' : '✗ No'}</li>
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-slate-900 mb-2">Graphic Requirements</h4>
                                                                <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-32">
                                                                    {item.default_graphic_requirements ? JSON.stringify(JSON.parse(item.default_graphic_requirements), null, 2) : 'None'}
                                                                </pre>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-semibold text-slate-900 mb-2">QC Checklist</h4>
                                                            <div className="text-sm bg-slate-100 p-3 rounded">
                                                                {item.default_qc_checklist ? (
                                                                    <ul className="space-y-1">
                                                                        {JSON.parse(item.default_qc_checklist).map((check: any, idx: number) => (
                                                                            <li key={idx}>
                                                                                {check.mandatory ? '✓' : '○'} {check.item}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : 'None'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
                    Showing {filteredData.length} of {items.length} records
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingItem ? 'Edit Content Type' : 'Add New Content Type'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 hover:bg-slate-100 rounded transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Content Type <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.content_type || ''}
                                            onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                                            placeholder="e.g., Blog, Pillar, Landing Page"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.category || ''}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="">Select a category...</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe this content type and its use cases..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>

                            {/* Word Count */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Default Word Count Range</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Minimum Words
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.default_wordcount_min || 500}
                                            onChange={(e) => setFormData({ ...formData, default_wordcount_min: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Maximum Words
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.default_wordcount_max || 2000}
                                            onChange={(e) => setFormData({ ...formData, default_wordcount_max: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Creation & Ownership */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Creation & Ownership</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Estimated Creation Hours
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={formData.estimated_creation_hours || 4}
                                            onChange={(e) => setFormData({ ...formData, estimated_creation_hours: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Content Owner Role
                                        </label>
                                        <select
                                            value={formData.content_owner_role || ''}
                                            onChange={(e) => setFormData({ ...formData, content_owner_role: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="">Select a role...</option>
                                            {CONTENT_OWNER_ROLES.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Flags */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Flags & Settings</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.seo_focus_keywords_required === 1}
                                            onChange={(e) => setFormData({ ...formData, seo_focus_keywords_required: e.target.checked ? 1 : 0 })}
                                            className="w-4 h-4 rounded border-slate-300"
                                        />
                                        <span className="text-sm text-slate-700">SEO Focus Keywords Required</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.social_media_applicable === 1}
                                            onChange={(e) => setFormData({ ...formData, social_media_applicable: e.target.checked ? 1 : 0 })}
                                            className="w-4 h-4 rounded border-slate-300"
                                        />
                                        <span className="text-sm text-slate-700">Applicable for Social Media</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.use_in_campaigns === 1}
                                            onChange={(e) => setFormData({ ...formData, use_in_campaigns: e.target.checked ? 1 : 0 })}
                                            className="w-4 h-4 rounded border-slate-300"
                                        />
                                        <span className="text-sm text-slate-700">Can be Used in Campaigns</span>
                                    </label>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={formData.status || 'active'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                                <strong>Note:</strong> Graphic requirements and QC checklists can be configured in advanced settings after creation.
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                {editingItem ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentTypeMasterView;

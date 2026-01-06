import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import type { User, Service, Task } from '../types';

interface SeoAssetsListViewProps {
    onNavigate?: (view: string, id?: number) => void;
}

interface SeoAssetItem {
    id: number;
    asset_id?: string; // Auto-generated SEO Asset ID from backend (e.g., SEO-0001)
    thumbnail_url?: string;
    name: string;
    asset_type?: string;
    asset_category?: string;
    content_type?: string;
    linked_service_id?: number;
    linked_task_id?: number;
    qc_status?: string;
    version_number?: string;
    designed_by?: number;
    created_at?: string;
    created_by?: number;
    updated_by?: number;
    updated_at?: string;
    usage_count?: number;
    status?: string;
    workflow_stage?: string;
}

// QC Status badge colors
const getQcStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
        'QC Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'QC Pending' },
        'Pass': { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
        'Approved': { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
        'Fail': { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
        'Rejected': { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
        'Rework': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Rework' },
        'Waiting': { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Pending' },
    };
    const config = statusMap[status] || { bg: 'bg-slate-100', text: 'text-slate-600', label: status || 'N/A' };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
};

// Generate SEO Asset ID (use backend value if available, otherwise generate)
const generateSeoAssetId = (id: number, assetId?: string): string => {
    return assetId || `SEO-${String(id).padStart(4, '0')}`;
};

const SeoAssetsListView: React.FC<SeoAssetsListViewProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

    // Data hooks
    const { data: users = [] } = useData<User>('users');
    const { data: services = [] } = useData<Service>('services');
    const { data: tasks = [] } = useData<Task>('tasks');

    // State
    const [seoAssets, setSeoAssets] = useState<SeoAssetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Fetch SEO Assets
    useEffect(() => {
        const fetchSeoAssets = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${apiUrl}/seo-assets`);
                if (response.ok) {
                    const data = await response.json();
                    setSeoAssets(data);
                } else {
                    // Fallback to asset library with SEO filter
                    const fallbackResponse = await fetch(`${apiUrl}/assetLibrary`);
                    if (fallbackResponse.ok) {
                        const allAssets = await fallbackResponse.json();
                        const seoOnly = allAssets.filter((a: any) => a.application_type === 'seo');
                        setSeoAssets(seoOnly);
                    }
                }
            } catch (error) {
                console.error('Error fetching SEO assets:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSeoAssets();
    }, [apiUrl]);

    // Get user name by ID
    const getUserName = (userId?: number): string => {
        if (!userId) return '-';
        const foundUser = users.find(u => u.id === userId);
        return foundUser?.name || '-';
    };

    // Get service name by ID
    const getServiceName = (serviceId?: number): string => {
        if (!serviceId) return '-';
        const foundService = services.find(s => s.id === serviceId);
        return foundService?.service_name || '-';
    };

    // Get task name by ID
    const getTaskName = (taskId?: number): string => {
        if (!taskId) return '-';
        const foundTask = tasks.find(t => t.id === taskId);
        return foundTask?.name || '-';
    };

    // Format date
    const formatDate = (dateStr?: string): string => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter and sort assets
    const filteredAssets = seoAssets
        .filter(asset => {
            const matchesSearch = !searchQuery ||
                asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                asset.asset_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                generateSeoAssetId(asset.id, asset.asset_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
                asset.asset_type?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'all' || asset.qc_status === filterStatus;
            const matchesType = filterType === 'all' || asset.asset_type === filterType;

            return matchesSearch && matchesStatus && matchesType;
        })
        .sort((a, b) => {
            let aVal: any = a[sortBy as keyof SeoAssetItem];
            let bVal: any = b[sortBy as keyof SeoAssetItem];

            if (sortBy === 'created_at' || sortBy === 'updated_at') {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });

    // Get unique asset types for filter
    const assetTypes = [...new Set(seoAssets.map(a => a.asset_type).filter(Boolean))];

    // Handle delete
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this SEO asset?')) return;

        try {
            const response = await fetch(`${apiUrl}/seo-assets/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setSeoAssets(seoAssets.filter(a => a.id !== id));
            } else {
                alert('Failed to delete asset');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete asset');
        }
    };

    // Handle sort
    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    // Sort indicator
    const SortIndicator = ({ column }: { column: string }) => {
        if (sortBy !== column) return null;
        return (
            <svg className={`w-4 h-4 ml-1 inline ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        );
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40">
            {/* Header */}
            <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">SEO Assets</h1>
                            <p className="text-sm text-slate-500">{filteredAssets.length} assets found</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate?.('seo-asset-upload')}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium text-sm hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25 transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Upload New SEO Asset
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex-1 relative">
                        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, ID, or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                    >
                        <option value="all">All QC Status</option>
                        <option value="QC Pending">QC Pending</option>
                        <option value="Pass">Approved</option>
                        <option value="Fail">Rejected</option>
                        <option value="Rework">Rework</option>
                    </select>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                    >
                        <option value="all">All Asset Types</option>
                        {assetTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-6">
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium">No SEO assets found</p>
                            <p className="text-sm">Create your first SEO asset to get started</p>
                            <button
                                onClick={() => onNavigate?.('seo-asset-upload')}
                                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                            >
                                Upload New Asset
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            <button onClick={() => handleSort('id')} className="flex items-center hover:text-slate-800">
                                                ID <SortIndicator column="id" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Thumbnail</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            <button onClick={() => handleSort('name')} className="flex items-center hover:text-slate-800">
                                                Asset Name <SortIndicator column="name" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Asset Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Asset Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Content Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Linked Service</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Linked Task</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">QC Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Version</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Designer</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            <button onClick={() => handleSort('created_at')} className="flex items-center hover:text-slate-800">
                                                Uploaded At <SortIndicator column="created_at" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Created By</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Updated By</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            <button onClick={() => handleSort('usage_count')} className="flex items-center hover:text-slate-800">
                                                Usage <SortIndicator column="usage_count" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAssets.map((asset) => (
                                        <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                                            {/* ID */}
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                                    {generateSeoAssetId(asset.id, asset.asset_id)}
                                                </span>
                                            </td>
                                            {/* Thumbnail */}
                                            <td className="px-4 py-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                                                    {asset.thumbnail_url ? (
                                                        <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </td>
                                            {/* Asset Name */}
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-800 text-sm max-w-[200px] truncate" title={asset.name}>
                                                    {asset.name || '-'}
                                                </p>
                                            </td>
                                            {/* Asset Type */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">{asset.asset_type || '-'}</span>
                                            </td>
                                            {/* Asset Category */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">{asset.asset_category || '-'}</span>
                                            </td>
                                            {/* Content Type */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">{asset.content_type || '-'}</span>
                                            </td>
                                            {/* Linked Service */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">{getServiceName(asset.linked_service_id)}</span>
                                            </td>
                                            {/* Linked Task */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600 max-w-[150px] truncate block" title={getTaskName(asset.linked_task_id)}>
                                                    {getTaskName(asset.linked_task_id)}
                                                </span>
                                            </td>
                                            {/* QC Status */}
                                            <td className="px-4 py-3">
                                                {getQcStatusBadge(asset.qc_status || '')}
                                            </td>
                                            {/* Version */}
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-sm text-slate-600">{asset.version_number || 'v1.0'}</span>
                                            </td>
                                            {/* Designer */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">{getUserName(asset.designed_by)}</span>
                                            </td>
                                            {/* Uploaded At */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-500">{formatDate(asset.created_at)}</span>
                                            </td>
                                            {/* Created By */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">{getUserName(asset.created_by)}</span>
                                            </td>
                                            {/* Updated By */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">{getUserName(asset.updated_by)}</span>
                                            </td>
                                            {/* Usage Count */}
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                                                    {asset.usage_count || 0}
                                                </span>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => onNavigate?.('seo-asset-edit', asset.id)}
                                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => onNavigate?.('seo-asset-view', asset.id)}
                                                        className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(asset.id)}
                                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeoAssetsListView;

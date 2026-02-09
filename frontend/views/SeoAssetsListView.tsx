import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import type { User, Service, Task, Campaign, Project } from '../types';

interface SeoAssetsListViewProps {
    onNavigate?: (view: string, id?: number) => void;
}

interface SeoAssetItem {
    id: number;
    asset_id?: string;
    name: string;
    seo_title?: string;
    asset_type?: string;
    linked_service_id?: number;
    linked_task_id?: number;
    linked_campaign_id?: number;
    linked_project_id?: number;
    qc_status?: string;
    status?: string;
    workflow_stage?: string;
    version_number?: string;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    seo_domains?: any[];
}

// Column definitions
const ALL_COLUMNS = [
    { key: 'select', label: '', width: '40px', sortable: false },
    { key: 'name', label: 'Task', width: 'auto', sortable: true },
    { key: 'id', label: 'ID', width: '60px', sortable: true },
    { key: 'asset_type', label: 'Type', width: '80px', sortable: true },
    { key: 'workflow_stage', label: 'Section', width: '100px', sortable: true },
    { key: 'linked_project_id', label: 'Projects', width: '120px', sortable: true },
    { key: 'qc_status', label: 'Tags', width: '80px', sortable: true },
    { key: 'created_at', label: 'Start', width: '100px', sortable: true },
    { key: 'updated_at', label: 'Due', width: '100px', sortable: true },
    { key: 'status', label: 'Custom Fields', width: '120px', sortable: true },
    { key: 'created_by', label: 'Assigned', width: '80px', sortable: true },
    { key: 'actions', label: '', width: '60px', sortable: false },
];

const SeoAssetsListView: React.FC<SeoAssetsListViewProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

    // Data hooks
    const { data: users = [] } = useData<User>('users');
    const { data: services = [] } = useData<Service>('services');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');

    // State
    const [seoAssets, setSeoAssets] = useState<SeoAssetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.key));
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const columnMenuRef = useRef<HTMLDivElement>(null);

    // Fetch SEO Assets
    useEffect(() => {
        const fetchSeoAssets = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${apiUrl}/seo-assets`);
                if (response.ok) {
                    const data = await response.json();
                    setSeoAssets(Array.isArray(data) ? data : data.data || []);
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error fetching SEO assets:', error);
                }
                setSeoAssets([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSeoAssets();
    }, [apiUrl]);

    // Close column menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
                setShowColumnMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper functions
    const getUserName = (userId?: number): string => {
        if (!userId) return '-';
        const foundUser = users.find(u => u.id === userId);
        return foundUser?.name || '-';
    };

    const getProjectName = (projectId?: number): string => {
        if (!projectId) return '-';
        const found = projects.find(p => p.id === projectId);
        return found?.project_name || '-';
    };

    const formatDate = (dateStr?: string): string => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    // Filter and sort
    const filteredAssets = seoAssets
        .filter(asset => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                asset.name?.toLowerCase().includes(q) ||
                asset.seo_title?.toLowerCase().includes(q) ||
                asset.asset_type?.toLowerCase().includes(q) ||
                String(asset.id).includes(q)
            );
        })
        .sort((a, b) => {
            let aVal: any = a[sortBy as keyof SeoAssetItem];
            let bVal: any = b[sortBy as keyof SeoAssetItem];
            if (sortBy === 'created_at' || sortBy === 'updated_at') {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            }
            if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
            return aVal < bVal ? 1 : -1;
        });

    // Pagination
    const totalPages = Math.ceil(filteredAssets.length / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const paginatedAssets = filteredAssets.slice(startIndex, startIndex + entriesPerPage);

    // Handle sort
    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Handle row selection
    const toggleRowSelection = (id: number) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };

    const toggleAllRows = () => {
        if (selectedRows.length === paginatedAssets.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedAssets.map(a => a.id));
        }
    };

    // Export functions
    const copyToClipboard = () => {
        const headers = ALL_COLUMNS.filter(c => visibleColumns.includes(c.key) && c.key !== 'select' && c.key !== 'actions').map(c => c.label);
        const rows = filteredAssets.map(asset => [
            asset.name || asset.seo_title || '-',
            asset.id,
            asset.asset_type || '-',
            asset.workflow_stage || '-',
            getProjectName(asset.linked_project_id),
            asset.qc_status || '-',
            formatDate(asset.created_at),
            formatDate(asset.updated_at),
            asset.status || '-',
            getUserName(asset.created_by)
        ]);
        const text = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const exportCSV = () => {
        const headers = ['Task', 'ID', 'Type', 'Section', 'Projects', 'Tags', 'Start', 'Due', 'Custom Fields', 'Assigned'];
        const rows = filteredAssets.map(asset => [
            `"${asset.name || asset.seo_title || '-'}"`,
            asset.id,
            asset.asset_type || '-',
            asset.workflow_stage || '-',
            getProjectName(asset.linked_project_id),
            asset.qc_status || '-',
            formatDate(asset.created_at),
            formatDate(asset.updated_at),
            asset.status || '-',
            getUserName(asset.created_by)
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'seo-assets.csv';
        a.click();
    };

    const printTable = () => {
        window.print();
    };

    // Toggle column visibility
    const toggleColumn = (key: string) => {
        setVisibleColumns(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            'Pass': 'bg-green-100 text-green-700',
            'Approved': 'bg-green-100 text-green-700',
            'QC Pending': 'bg-yellow-100 text-yellow-700',
            'Pending': 'bg-yellow-100 text-yellow-700',
            'Fail': 'bg-red-100 text-red-700',
            'Rejected': 'bg-red-100 text-red-700',
            'Rework': 'bg-orange-100 text-orange-700',
        };
        return colors[status] || 'bg-slate-100 text-slate-600';
    };

    return (
        <div className="h-full flex flex-col bg-white w-full">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-lg font-semibold text-slate-800">SEO Assets</h1>
                    <button
                        onClick={() => onNavigate?.('seo-asset-upload')}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span>Show</span>
                        <select
                            value={entriesPerPage}
                            onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="border border-slate-300 rounded px-2 py-1 text-xs"
                        >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>entries</span>
                        <span className="text-slate-400 mx-2">|</span>
                        <span>{filteredAssets.length} total</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            placeholder="Search..."
                            className="border border-slate-300 rounded px-2 py-1 text-xs w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-1">
                        <button onClick={copyToClipboard} className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50">Copy</button>
                        <button onClick={exportCSV} className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50">CSV</button>
                        <button onClick={exportCSV} className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50">Excel</button>
                        <button onClick={printTable} className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50">Print</button>
                        <div className="relative" ref={columnMenuRef}>
                            <button
                                onClick={() => setShowColumnMenu(!showColumnMenu)}
                                className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                            >
                                Columns
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {showColumnMenu && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded shadow-lg z-20 py-1 min-w-[150px]">
                                    {ALL_COLUMNS.filter(c => c.key !== 'select' && c.key !== 'actions').map(col => (
                                        <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-xs">
                                            <input
                                                type="checkbox"
                                                checked={visibleColumns.includes(col.key)}
                                                onChange={() => toggleColumn(col.key)}
                                                className="rounded"
                                            />
                                            {col.label}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width Table */}
            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <table className="w-full text-xs border-collapse">
                        <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
                            <tr>
                                {visibleColumns.includes('select') && (
                                    <th className="px-2 py-2 text-left w-8 border-r border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.length === paginatedAssets.length && paginatedAssets.length > 0}
                                            onChange={toggleAllRows}
                                            className="rounded w-3 h-3"
                                        />
                                    </th>
                                )}
                                {ALL_COLUMNS.filter(c => visibleColumns.includes(c.key) && c.key !== 'select').map(col => (
                                    <th
                                        key={col.key}
                                        className="px-2 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200 border-r border-slate-200 whitespace-nowrap"
                                        onClick={() => col.sortable && handleSort(col.key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            {col.sortable && (
                                                <span className="text-slate-400 text-[10px]">
                                                    {sortBy === col.key ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length} className="px-2 py-8 text-center text-slate-500">
                                        No SEO assets found
                                    </td>
                                </tr>
                            ) : (
                                paginatedAssets.map((asset, idx) => (
                                    <tr key={asset.id} className={`hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        {visibleColumns.includes('select') && (
                                            <td className="px-2 py-1.5 border-r border-slate-100">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(asset.id)}
                                                    onChange={() => toggleRowSelection(asset.id)}
                                                    className="rounded w-3 h-3"
                                                />
                                            </td>
                                        )}
                                        {visibleColumns.includes('name') && (
                                            <td className="px-2 py-1.5 border-r border-slate-100">
                                                <a
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); onNavigate?.('seo-asset-edit', asset.id); }}
                                                    className="text-blue-600 hover:underline font-medium truncate block max-w-[200px]"
                                                    title={asset.name || asset.seo_title || 'Untitled'}
                                                >
                                                    {asset.name || asset.seo_title || 'Untitled'}
                                                </a>
                                            </td>
                                        )}
                                        {visibleColumns.includes('id') && (
                                            <td className="px-2 py-1.5 text-slate-600 border-r border-slate-100">{asset.id}</td>
                                        )}
                                        {visibleColumns.includes('asset_type') && (
                                            <td className="px-2 py-1.5 border-r border-slate-100">
                                                {asset.asset_type && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                                                        {asset.asset_type}
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.includes('workflow_stage') && (
                                            <td className="px-2 py-1.5 text-slate-600 border-r border-slate-100">{asset.workflow_stage || '-'}</td>
                                        )}
                                        {visibleColumns.includes('linked_project_id') && (
                                            <td className="px-2 py-1.5 text-slate-600 border-r border-slate-100">{getProjectName(asset.linked_project_id)}</td>
                                        )}
                                        {visibleColumns.includes('qc_status') && (
                                            <td className="px-2 py-1.5 border-r border-slate-100">
                                                {asset.qc_status && (
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusBadge(asset.qc_status)}`}>
                                                        {asset.qc_status}
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.includes('created_at') && (
                                            <td className="px-2 py-1.5 text-slate-600 border-r border-slate-100 whitespace-nowrap">{formatDate(asset.created_at)}</td>
                                        )}
                                        {visibleColumns.includes('updated_at') && (
                                            <td className="px-2 py-1.5 text-slate-600 border-r border-slate-100 whitespace-nowrap">{formatDate(asset.updated_at)}</td>
                                        )}
                                        {visibleColumns.includes('status') && (
                                            <td className="px-2 py-1.5 text-slate-600 border-r border-slate-100">{asset.status || '-'}</td>
                                        )}
                                        {visibleColumns.includes('created_by') && (
                                            <td className="px-2 py-1.5 border-r border-slate-100">
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-medium">
                                                    {getUserName(asset.created_by)?.charAt(0) || '?'}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.includes('actions') && (
                                            <td className="px-2 py-1.5">
                                                <button
                                                    onClick={() => onNavigate?.('seo-asset-edit', asset.id)}
                                                    className="p-1 text-slate-400 hover:text-blue-600"
                                                    title="Edit"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex-shrink-0 border-t border-slate-200 px-4 py-2 flex items-center justify-between bg-slate-50">
                    <div className="text-xs text-slate-600">
                        Showing {startIndex + 1}-{Math.min(startIndex + entriesPerPage, filteredAssets.length)} of {filteredAssets.length}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 border border-slate-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                        >
                            First
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-2 py-1 border border-slate-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                        >
                            Prev
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                            if (page > totalPages || page < 1) return null;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-2 py-1 border rounded text-xs ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 hover:bg-white'}`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 border border-slate-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                        >
                            Next
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 border border-slate-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                        >
                            Last
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeoAssetsListView;

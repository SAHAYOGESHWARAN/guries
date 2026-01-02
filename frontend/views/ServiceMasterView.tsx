import React, { useState, useMemo, useEffect } from 'react';
import Tooltip from '../components/Tooltip';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { Service, SubServiceItem, ContentRepositoryItem, AssetLibraryItem, User, Brand, IndustrySectorItem, Keyword, ContentTypeItem } from '../types';

const SERVICE_STATUS_OPTIONS = ['Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'] as const;

const ServiceMasterView: React.FC = () => {
    const { data: services = [], create, update, remove, refresh: refreshServices, loading } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: contentAssets = [] } = useData<ContentRepositoryItem>('content');
    const { data: libraryAssets = [] } = useData<AssetLibraryItem>('assetLibrary');
    const { data: keywordsMaster = [] } = useData<Keyword>('keywords');
    const { data: users = [] } = useData<User>('users');
    const { data: brands = [] } = useData<Brand>('brands');
    const { data: industries = [] } = useData<IndustrySectorItem>('industrySectors');
    const { data: contentTypes = [] } = useData<ContentTypeItem>('contentTypes');

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [industryFilter, setIndustryFilter] = useState('All Industries');
    const [sectorFilter, setSectorFilter] = useState('All Sectors');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // Computed Data
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredData = useMemo(() => {
        return services.filter(item => {
            const matchesSearch = !normalizedQuery || [
                item.service_name,
                item.service_code,
                item.menu_heading,
                item.short_tagline,
                item.full_url,
                item.service_description,
                item.business_unit
            ].some(value => (value || '').toLowerCase().includes(normalizedQuery));

            const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;

            // Industry filter
            const industryIds = item.industry_ids || [];
            const matchesIndustry = industryFilter === 'All Industries' ||
                industryIds.some(id => {
                    const industry = industries.find(ind => ind.id === parseInt(String(id)));
                    return industry?.industry === industryFilter;
                });

            // Sector filter (business_unit)
            const matchesSector = sectorFilter === 'All Sectors' || item.business_unit === sectorFilter;

            return matchesSearch && matchesStatus && matchesIndustry && matchesSector;
        });
    }, [services, normalizedQuery, statusFilter, industryFilter, sectorFilter, industries]);

    // Get unique sectors from services
    const uniqueSectors = useMemo(() => {
        const sectors = new Set<string>();
        services.forEach(s => {
            if (s.business_unit) sectors.add(s.business_unit);
        });
        return Array.from(sectors);
    }, [services]);

    // Helper functions
    const getSubServicesForService = (serviceId: number) => {
        return subServices.filter((s: SubServiceItem) => s.parent_service_id === serviceId);
    };

    const getLinkedAssetsCount = (serviceId: number) => {
        const contentCount = contentAssets.filter(a => {
            const links = Array.isArray(a.linked_service_ids) ? a.linked_service_ids : [];
            return links.map(String).includes(String(serviceId));
        }).length;
        const libraryCount = libraryAssets.filter(a => {
            const links = Array.isArray(a.linked_service_ids) ? a.linked_service_ids : [];
            return links.map(String).includes(String(serviceId));
        }).length;
        return contentCount + libraryCount;
    };

    const getKeywordUsageCount = (serviceId: number) => {
        return keywordsMaster.filter(k => k.mapped_service === String(serviceId)).length;
    };

    const calculateHealthScore = (item: Service) => {
        let score = 0;
        if (item.service_name) score += 15;
        if (item.service_code) score += 10;
        if (item.slug) score += 10;
        if (item.meta_title) score += 15;
        if (item.meta_description) score += 15;
        if (item.h1) score += 10;
        if (item.focus_keywords && item.focus_keywords.length > 0) score += 15;
        if (item.body_content) score += 10;
        return score;
    };

    const getHealthScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, { bg: string; text: string; dot: string }> = {
            'Published': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
            'Draft': { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
            'In Progress': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
            'QC': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
            'Approved': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
            'Archived': { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' }
        };
        return colors[status] || colors['Draft'];
    };

    const toggleRowExpand = (serviceId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(serviceId)) {
                newSet.delete(serviceId);
            } else {
                newSet.add(serviceId);
            }
            return newSet;
        });
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshServices();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleExport = () => {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `services_master_export_${timestamp}`;

        const exportData = filteredData.map(item => {
            const industryIds = item.industry_ids || [];
            const industryNames = industryIds.map(id => {
                const industry = industries.find(ind => ind.id === parseInt(String(id)));
                return industry?.industry || '';
            }).filter(Boolean).join('; ');

            return {
                'Service Name': item.service_name || '',
                'Service Code': item.service_code || '',
                'Industry Sector': industryNames,
                'Sub-Services': getSubServicesForService(item.id).length,
                'Linked Assets': getLinkedAssetsCount(item.id),
                'Linked Insights': getKeywordUsageCount(item.id),
                'Health Score': `${calculateHealthScore(item)}%`,
                'Status': item.status || '',
                'Updated At': item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''
            };
        });

        exportToCSV(exportData, filename);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this service?')) await remove(id);
    };

    const formatTimeAgo = (dateStr: string | undefined) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        return 'Just now';
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="h-full overflow-y-auto bg-slate-50">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Service / Sub-Service Master</h1>
                        <p className="text-slate-500 text-xs mt-0.5">Manage all service offerings and their sub-categories</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-xs font-medium shadow-sm hover:bg-slate-50 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-xs font-medium shadow-sm hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
                        >
                            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 flex items-center gap-1">
                            <span className="text-lg">+</span> Add New Service
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        {/* Search */}
                        <div className="relative w-full lg:w-96">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="search"
                                className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="Search services... (Ctrl+K)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Industry Filter */}
                            <select
                                value={industryFilter}
                                onChange={(e) => setIndustryFilter(e.target.value)}
                                className="bg-white border border-slate-300 text-sm rounded-lg py-2 px-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 min-w-[140px]"
                            >
                                <option value="All Industries">All Industries</option>
                                {industries.map(ind => (
                                    <option key={ind.id} value={ind.industry}>{ind.industry}</option>
                                ))}
                            </select>

                            {/* Sector Filter */}
                            <select
                                value={sectorFilter}
                                onChange={(e) => setSectorFilter(e.target.value)}
                                className="bg-white border border-slate-300 text-sm rounded-lg py-2 px-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 min-w-[120px]"
                            >
                                <option value="All Sectors">All Sectors</option>
                                {uniqueSectors.map(sector => (
                                    <option key={sector} value={sector}>{sector}</option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white border border-slate-300 text-sm rounded-lg py-2 px-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 min-w-[120px]"
                            >
                                <option value="All Status">All Status</option>
                                {SERVICE_STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-700">
                                Service Registry ({filteredData.length})
                            </h2>
                            <span className="text-xs text-slate-500">
                                {expandedRows.size > 0 && `${expandedRows.size} expanded`}
                            </span>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="w-10 px-4 py-3"></th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Service Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Service Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Industry Sector</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Sub-Services</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Linked Assets</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Linked Insights</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Health Score</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Updated</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={11} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                                <span className="text-sm text-slate-500">Loading services...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm text-slate-500">No services found</span>
                                                <span className="text-xs text-slate-400">Try adjusting your filters</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((service) => {
                                        const subServicesForService = getSubServicesForService(service.id);
                                        const hasSubServices = subServicesForService.length > 0;
                                        const isExpanded = expandedRows.has(service.id);
                                        const healthScore = calculateHealthScore(service);
                                        const statusColors = getStatusColor(service.status);
                                        const industryIds = service.industry_ids || [];
                                        const industryNames = industryIds.map(id => {
                                            const industry = industries.find(ind => ind.id === parseInt(String(id)));
                                            return industry?.industry || '';
                                        }).filter(Boolean);

                                        return (
                                            <React.Fragment key={service.id}>
                                                {/* Service Row */}
                                                <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-indigo-50/30' : ''}`}>
                                                    {/* Expand Button */}
                                                    <td className="px-4 py-3">
                                                        {hasSubServices && (
                                                            <button
                                                                onClick={() => toggleRowExpand(service.id)}
                                                                className="p-1 rounded hover:bg-slate-200 transition-colors"
                                                            >
                                                                <svg
                                                                    className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </td>

                                                    {/* Service Name */}
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-slate-800 text-sm">{service.service_name}</div>
                                                        {service.short_tagline && (
                                                            <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{service.short_tagline}</div>
                                                        )}
                                                    </td>

                                                    {/* Service Code */}
                                                    <td className="px-4 py-3">
                                                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                            {service.service_code || '-'}
                                                        </span>
                                                    </td>

                                                    {/* Industry Sector */}
                                                    <td className="px-4 py-3">
                                                        {industryNames.length > 0 ? (
                                                            <Tooltip content={industryNames.join(', ')}>
                                                                <span className="text-xs text-slate-700">
                                                                    {industryNames[0]}
                                                                    {industryNames.length > 1 && (
                                                                        <span className="ml-1 text-indigo-600">+{industryNames.length - 1}</span>
                                                                    )}
                                                                </span>
                                                            </Tooltip>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">-</span>
                                                        )}
                                                    </td>

                                                    {/* Sub-Services Count */}
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-sm font-semibold ${hasSubServices ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                            {subServicesForService.length}
                                                        </span>
                                                    </td>

                                                    {/* Linked Assets */}
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="text-sm font-semibold text-indigo-600">
                                                            {getLinkedAssetsCount(service.id)}
                                                        </span>
                                                    </td>

                                                    {/* Linked Insights */}
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="text-sm font-semibold text-indigo-600">
                                                            {getKeywordUsageCount(service.id)}
                                                        </span>
                                                    </td>

                                                    {/* Health Score */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${getHealthScoreColor(healthScore)} rounded-full transition-all`}
                                                                    style={{ width: `${healthScore}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-700 w-8">{healthScore}%</span>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`}></span>
                                                            {service.status}
                                                        </span>
                                                    </td>

                                                    {/* Updated */}
                                                    <td className="px-4 py-3">
                                                        <Tooltip content={service.updated_at ? new Date(service.updated_at).toLocaleString() : 'Never'}>
                                                            <span className="text-xs text-slate-500">{formatTimeAgo(service.updated_at)}</span>
                                                        </Tooltip>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(service.id)}
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Sub-Services Rows (Expanded) */}
                                                {isExpanded && subServicesForService.map((subService) => {
                                                    const subHealthScore = (() => {
                                                        let score = 0;
                                                        if (subService.sub_service_name) score += 20;
                                                        if (subService.sub_service_code) score += 15;
                                                        if (subService.meta_title) score += 20;
                                                        if (subService.meta_description) score += 20;
                                                        if (subService.h1) score += 15;
                                                        if (subService.focus_keywords && subService.focus_keywords.length > 0) score += 10;
                                                        return score;
                                                    })();
                                                    const subStatusColors = getStatusColor(subService.status);

                                                    return (
                                                        <tr key={`sub-${subService.id}`} className="bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                                                            {/* Indent indicator */}
                                                            <td className="px-4 py-2.5">
                                                                <div className="flex items-center justify-center">
                                                                    <div className="w-4 h-4 border-l-2 border-b-2 border-slate-300 rounded-bl"></div>
                                                                </div>
                                                            </td>

                                                            {/* Sub-Service Name */}
                                                            <td className="px-4 py-2.5">
                                                                <div className="pl-4">
                                                                    <div className="font-medium text-slate-700 text-sm">{subService.sub_service_name}</div>
                                                                </div>
                                                            </td>

                                                            {/* Sub-Service Code */}
                                                            <td className="px-4 py-2.5">
                                                                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                                    {subService.sub_service_code || '-'}
                                                                </span>
                                                            </td>

                                                            {/* Industry (inherited) */}
                                                            <td className="px-4 py-2.5">
                                                                <span className="text-xs text-slate-400 italic">Inherited</span>
                                                            </td>

                                                            {/* Sub-Services (N/A) */}
                                                            <td className="px-4 py-2.5 text-center">
                                                                <span className="text-xs text-slate-400">-</span>
                                                            </td>

                                                            {/* Linked Assets */}
                                                            <td className="px-4 py-2.5 text-center">
                                                                <span className="text-sm font-medium text-slate-600">
                                                                    {libraryAssets.filter(a => {
                                                                        const links = Array.isArray(a.linked_sub_service_ids) ? a.linked_sub_service_ids : [];
                                                                        return links.map(String).includes(String(subService.id));
                                                                    }).length}
                                                                </span>
                                                            </td>

                                                            {/* Linked Insights */}
                                                            <td className="px-4 py-2.5 text-center">
                                                                <span className="text-sm font-medium text-slate-600">0</span>
                                                            </td>

                                                            {/* Health Score */}
                                                            <td className="px-4 py-2.5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full ${getHealthScoreColor(subHealthScore)} rounded-full`}
                                                                            style={{ width: `${subHealthScore}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-slate-600">{subHealthScore}%</span>
                                                                </div>
                                                            </td>

                                                            {/* Status */}
                                                            <td className="px-4 py-2.5">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${subStatusColors.bg} ${subStatusColors.text}`}>
                                                                    <span className={`w-1 h-1 rounded-full ${subStatusColors.dot}`}></span>
                                                                    {subService.status}
                                                                </span>
                                                            </td>

                                                            {/* Updated */}
                                                            <td className="px-4 py-2.5">
                                                                <span className="text-xs text-slate-400">{formatTimeAgo(subService.updated_at)}</span>
                                                            </td>

                                                            {/* Actions */}
                                                            <td className="px-4 py-2.5 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceMasterView;

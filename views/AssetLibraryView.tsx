import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service } from '../types';

const AssetLibraryView: React.FC = () => {
    const { data: assets = [], refresh } = useData<AssetLibraryItem>('assetLibrary');
    const { data: services = [] } = useData<Service>('services');

    const [searchQuery, setSearchQuery] = useState('');
    const [repositoryFilter, setRepositoryFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [selectedAsset, setSelectedAsset] = useState<AssetLibraryItem | null>(null);

    // Auto-refresh on mount
    React.useEffect(() => {
        refresh?.();
    }, []);

    // Get unique repositories and types
    const repositories = useMemo(() => {
        const repos = new Set<string>();
        assets.forEach(a => {
            if (a.repository) repos.add(a.repository);
        });
        return ['All', ...Array.from(repos).sort()];
    }, [assets]);

    const assetTypes = useMemo(() => {
        const types = new Set<string>();
        assets.forEach(a => {
            if (a.type) types.add(a.type);
        });
        return ['All', ...Array.from(types).sort()];
    }, [assets]);

    // Filter assets
    const filteredAssets = useMemo(() => {
        const query = (searchQuery || '').toLowerCase().trim();

        return assets.filter(a => {
            if (repositoryFilter !== 'All' && a.repository !== repositoryFilter) return false;
            if (typeFilter !== 'All' && a.type !== typeFilter) return false;

            if (!query) return true;

            const name = (a.name || '').toLowerCase();
            const type = (a.type || '').toLowerCase();
            const repository = (a.repository || '').toLowerCase();
            const status = (a.usage_status || '').toLowerCase();

            return name.includes(query) || type.includes(query) || repository.includes(query) || status.includes(query);
        });
    }, [assets, searchQuery, repositoryFilter, typeFilter]);

    // Get linked services for an asset
    const getLinkedServices = (asset: AssetLibraryItem) => {
        if (!asset.linked_service_ids || asset.linked_service_ids.length === 0) return [];
        return services.filter(s => asset.linked_service_ids?.map(String).includes(String(s.id)));
    };

    const getAssetTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Image': 'from-green-500 to-emerald-600',
            'Video': 'from-red-500 to-rose-600',
            'Document': 'from-orange-500 to-amber-600',
            'Archive': 'from-purple-500 to-violet-600',
            'article': 'from-blue-500 to-indigo-600',
            'video': 'from-red-500 to-rose-600',
            'graphic': 'from-pink-500 to-fuchsia-600',
            'guide': 'from-cyan-500 to-teal-600',
        };
        return colors[type] || 'from-slate-500 to-slate-600';
    };

    const getAssetTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            'Image': '🖼️',
            'Video': '🎥',
            'Document': '📄',
            'Archive': '📦',
            'article': '📰',
            'video': '🎬',
            'graphic': '🎨',
            'guide': '📚',
            'listicle': '📋',
            'how-to': '🔧',
        };
        return icons[type] || '📁';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'Available': 'bg-green-100 text-green-700 border-green-200',
            'In Use': 'bg-blue-100 text-blue-700 border-blue-200',
            'Archived': 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <div className="h-full flex flex-col w-full overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-10 shadow-xl">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">Asset Library</h1>
                                <p className="text-indigo-100 text-lg">Browse and manage all media assets linked to services</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="bg-white bg-opacity-20 px-6 py-4 rounded-2xl backdrop-blur-sm">
                                <div className="text-center">
                                    <p className="text-5xl font-bold text-white">{filteredAssets.length}</p>
                                    <p className="text-sm text-indigo-100 font-semibold uppercase tracking-wide mt-1">Assets</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border-b-2 border-slate-200 px-8 py-6 shadow-sm">
                <div className="max-w-7xl mx-auto space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search assets by name, type, repository, or status..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-5 text-slate-400 hover:text-slate-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Repository</label>
                            <select
                                value={repositoryFilter}
                                onChange={(e) => setRepositoryFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer text-sm font-medium"
                            >
                                {repositories.map(repo => (
                                    <option key={repo} value={repo}>{repo}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Asset Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer text-sm font-medium"
                            >
                                {assetTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {(repositoryFilter !== 'All' || typeFilter !== 'All' || searchQuery) && (
                            <button
                                onClick={() => {
                                    setRepositoryFilter('All');
                                    setTypeFilter('All');
                                    setSearchQuery('');
                                }}
                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all text-sm font-bold flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Asset Grid */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    {filteredAssets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAssets.map(asset => {
                                const linkedServices = getLinkedServices(asset);
                                return (
                                    <div
                                        key={asset.id}
                                        onClick={() => setSelectedAsset(asset)}
                                        className="bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
                                    >
                                        {/* Asset Preview */}
                                        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                            {asset.thumbnail_url || asset.file_url ? (
                                                <img
                                                    src={asset.thumbnail_url || asset.file_url}
                                                    alt={asset.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getAssetTypeColor(asset.type)} text-white`}>
                                                    <span className="text-6xl mb-3">{getAssetTypeIcon(asset.type)}</span>
                                                    <span className="text-sm font-bold uppercase tracking-wider opacity-90">{asset.type}</span>
                                                </div>
                                            )}
                                            {/* Type Badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getAssetTypeColor(asset.type)} shadow-lg backdrop-blur-sm`}>
                                                    <span>{getAssetTypeIcon(asset.type)}</span>
                                                    {asset.type}
                                                </span>
                                            </div>
                                            {/* Status Badge */}
                                            <div className="absolute top-3 right-3">
                                                <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getStatusColor(asset.usage_status)} backdrop-blur-sm`}>
                                                    {asset.usage_status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Asset Info */}
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors" title={asset.name}>
                                                {asset.name}
                                            </h3>

                                            <div className="space-y-3">
                                                {/* Repository */}
                                                <div className="flex items-center gap-2 text-sm">
                                                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                    </svg>
                                                    <span className="text-slate-600 font-medium truncate">{asset.repository}</span>
                                                </div>

                                                {/* Linked Services */}
                                                <div className="flex items-start gap-2 text-sm">
                                                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                    <div className="flex-1 min-w-0">
                                                        {linkedServices.length > 0 ? (
                                                            <div className="space-y-1">
                                                                <span className="text-slate-600 font-semibold">{linkedServices.length} Service{linkedServices.length !== 1 ? 's' : ''}</span>
                                                                <div className="text-xs text-slate-500 space-y-0.5">
                                                                    {linkedServices.slice(0, 2).map(s => (
                                                                        <div key={s.id} className="truncate">• {s.service_name}</div>
                                                                    ))}
                                                                    {linkedServices.length > 2 && (
                                                                        <div className="text-indigo-600 font-semibold">+ {linkedServices.length - 2} more</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Not linked</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Asset ID */}
                                                <div className="pt-2 border-t border-slate-100">
                                                    <span className="text-xs font-mono text-slate-400">ID: {asset.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="bg-white rounded-full p-12 mb-8 shadow-xl">
                                <span className="text-9xl opacity-50">
                                    {searchQuery || repositoryFilter !== 'All' || typeFilter !== 'All' ? '🔍' : '📚'}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-3">
                                {searchQuery || repositoryFilter !== 'All' || typeFilter !== 'All' ? 'No Assets Found' : 'No Assets Yet'}
                            </h3>
                            <p className="text-slate-500 text-center max-w-md">
                                {searchQuery || repositoryFilter !== 'All' || typeFilter !== 'All'
                                    ? 'No assets match your current filters. Try adjusting your search criteria.'
                                    : 'Upload assets in the Assets module to see them here.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Asset Detail Modal */}
            {selectedAsset && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6"
                    onClick={() => setSelectedAsset(null)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`bg-gradient-to-r ${getAssetTypeColor(selectedAsset.type)} px-8 py-6 text-white`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="bg-white bg-opacity-20 p-3 rounded-xl flex-shrink-0">
                                        <span className="text-4xl">{getAssetTypeIcon(selectedAsset.type)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-2xl font-bold mb-2">{selectedAsset.name}</h2>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                                                {selectedAsset.type}
                                            </span>
                                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                                                {selectedAsset.repository}
                                            </span>
                                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                                                {selectedAsset.usage_status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedAsset(null)}
                                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                            <div className="space-y-6">
                                {/* Preview */}
                                {(selectedAsset.thumbnail_url || selectedAsset.file_url) && (
                                    <div className="bg-slate-100 rounded-2xl p-4">
                                        <img
                                            src={selectedAsset.thumbnail_url || selectedAsset.file_url}
                                            alt={selectedAsset.name}
                                            className="w-full h-auto max-h-96 object-contain rounded-xl"
                                        />
                                    </div>
                                )}

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Asset ID</label>
                                        <p className="text-lg font-mono text-slate-900">{selectedAsset.id}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Date Added</label>
                                        <p className="text-lg text-slate-900">
                                            {selectedAsset.date ? new Date(selectedAsset.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                        </p>
                                    </div>
                                    {selectedAsset.asset_category && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Category</label>
                                            <p className="text-lg text-slate-900">{selectedAsset.asset_category}</p>
                                        </div>
                                    )}
                                    {selectedAsset.asset_format && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Format</label>
                                            <p className="text-lg text-slate-900">{selectedAsset.asset_format}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Linked Services */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 uppercase mb-3">Linked Services</label>
                                    {getLinkedServices(selectedAsset).length > 0 ? (
                                        <div className="space-y-2">
                                            {getLinkedServices(selectedAsset).map(service => (
                                                <div key={service.id} className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-slate-900">{service.service_name}</p>
                                                        <p className="text-sm text-slate-600">{service.service_code}</p>
                                                    </div>
                                                    <span className="text-indigo-600 font-mono text-sm">ID: {service.id}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 italic bg-slate-50 rounded-xl p-4 text-center">
                                            This asset is not linked to any services yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default AssetLibraryView;

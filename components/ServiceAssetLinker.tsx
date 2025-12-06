import React from 'react';
import type { AssetLibraryItem } from '../types';

type Props = {
    linkedAssets: AssetLibraryItem[];
    availableAssets: AssetLibraryItem[];
    assetSearch: string;
    setAssetSearch: (v: string) => void;
    onToggle: (asset: AssetLibraryItem) => void;
    totalAssets: number;
};

const ServiceAssetLinker: React.FC<Props> = ({
    linkedAssets,
    availableAssets,
    assetSearch,
    setAssetSearch,
    onToggle,
    totalAssets
}) => {
    const getAssetTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Image': 'bg-green-500',
            'Video': 'bg-red-500',
            'Document': 'bg-orange-500',
            'Archive': 'bg-purple-500',
        };
        return colors[type] || 'bg-slate-500';
    };

    const getAssetTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            'Image': '🖼️',
            'Video': '🎥',
            'Document': '📄',
            'Archive': '📦',
        };
        return icons[type] || '📁';
    };

    return (
        <div className="space-y-6">
            {/* Professional Asset Linking Interface */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 border-b-2 border-blue-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Asset Library Management</h3>
                                <p className="text-blue-100 text-sm mt-1">Link media assets from the Asset Module to this service</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white bg-opacity-20 px-5 py-3 rounded-xl">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-white">{linkedAssets.length}</p>
                                    <p className="text-xs text-blue-100 font-semibold uppercase tracking-wide">Linked</p>
                                </div>
                            </div>
                            <div className="bg-white bg-opacity-20 px-5 py-3 rounded-xl">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-white">{availableAssets.length}</p>
                                    <p className="text-xs text-blue-100 font-semibold uppercase tracking-wide">Available</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Panel: Linked Assets */}
                        <div className="flex flex-col">
                            {/* Panel Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl px-6 py-4 border-b-2 border-indigo-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white">Linked Assets</h4>
                                            <p className="text-xs text-indigo-100">Currently connected media</p>
                                        </div>
                                    </div>
                                    <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                                        <span className="text-2xl font-bold text-white">{linkedAssets.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Linked Assets List */}
                            <div className="flex-1 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-b-2xl border-2 border-indigo-200 border-t-0 p-4 min-h-[600px] max-h-[700px]">
                                <div className="h-full overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {linkedAssets.length > 0 ? linkedAssets.map(asset => (
                                        <div key={asset.id} className="bg-white rounded-xl border-2 border-indigo-200 shadow-sm hover:shadow-md transition-all group p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    {/* Asset Preview/Icon */}
                                                    {asset.thumbnail_url ? (
                                                        <img
                                                            src={asset.thumbnail_url}
                                                            alt={asset.name}
                                                            className="w-14 h-14 flex-shrink-0 rounded-xl object-cover shadow-md border-2 border-indigo-100"
                                                        />
                                                    ) : (
                                                        <div className={`w-14 h-14 flex-shrink-0 rounded-xl flex flex-col items-center justify-center text-white shadow-md ${getAssetTypeColor(asset.type)}`}>
                                                            <span className="text-2xl">{getAssetTypeIcon(asset.type)}</span>
                                                            <span className="text-[9px] font-bold uppercase mt-1 opacity-90">
                                                                {asset.type ? String(asset.type).slice(0, 3) : 'N/A'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Asset Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-bold text-sm text-slate-800 mb-2 line-clamp-2" title={asset.name}>
                                                            {asset.name}
                                                        </h5>
                                                        <div className="flex flex-wrap gap-2 items-center">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${asset.type === 'Image' ? 'bg-green-100 text-green-700' :
                                                                    asset.type === 'Video' ? 'bg-red-100 text-red-700' :
                                                                        asset.type === 'Document' ? 'bg-orange-100 text-orange-700' :
                                                                            'bg-purple-100 text-purple-700'
                                                                }`}>
                                                                {asset.type}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                                {asset.repository}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">ID: {asset.id}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Unlink Button */}
                                                <button
                                                    onClick={() => onToggle(asset)}
                                                    className="flex-shrink-0 p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border-2 border-transparent hover:border-red-200"
                                                    title="Unlink this asset"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                            <div className="bg-white rounded-full p-8 mb-6 shadow-lg">
                                                <span className="text-7xl opacity-50">🔗</span>
                                            </div>
                                            <h5 className="text-lg font-bold text-slate-700 mb-2">No Assets Linked</h5>
                                            <p className="text-sm text-slate-500 max-w-xs">
                                                Search and link media assets from the Asset Library to connect them with this service.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: Available Assets */}
                        <div className="flex flex-col">
                            {/* Panel Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-t-2xl px-6 py-4 border-b-2 border-blue-700">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Asset Library</h4>
                                        <p className="text-xs text-blue-100">Browse and link media assets</p>
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 border-t-0 border-b-0 p-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by name, type, or repository..."
                                        value={assetSearch}
                                        onChange={(e) => setAssetSearch(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 border-2 border-blue-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm"
                                    />
                                    {assetSearch && (
                                        <button
                                            onClick={() => setAssetSearch('')}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Available Assets List */}
                            <div className="flex-1 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-b-2xl border-2 border-blue-200 border-t-0 p-4 min-h-[600px] max-h-[700px]">
                                <div className="h-full overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {availableAssets.length > 0 ? availableAssets.map(asset => (
                                        <div
                                            key={asset.id}
                                            onClick={() => onToggle(asset)}
                                            className="bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all group p-4 cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    {/* Asset Preview/Icon */}
                                                    {asset.thumbnail_url ? (
                                                        <img
                                                            src={asset.thumbnail_url}
                                                            alt={asset.name}
                                                            className="w-14 h-14 flex-shrink-0 rounded-xl object-cover shadow-md border-2 border-blue-100"
                                                        />
                                                    ) : (
                                                        <div className={`w-14 h-14 flex-shrink-0 rounded-xl flex flex-col items-center justify-center text-white shadow-md ${getAssetTypeColor(asset.type)}`}>
                                                            <span className="text-2xl">{getAssetTypeIcon(asset.type)}</span>
                                                            <span className="text-[9px] font-bold uppercase mt-1 opacity-90">
                                                                {asset.type ? String(asset.type).slice(0, 3) : 'N/A'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Asset Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-bold text-sm text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors" title={asset.name}>
                                                            {asset.name}
                                                        </h5>
                                                        <div className="flex flex-wrap gap-2 items-center">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${asset.type === 'Image' ? 'bg-green-100 text-green-700' :
                                                                    asset.type === 'Video' ? 'bg-red-100 text-red-700' :
                                                                        asset.type === 'Document' ? 'bg-orange-100 text-orange-700' :
                                                                            'bg-purple-100 text-purple-700'
                                                                }`}>
                                                                {asset.type}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                                {asset.repository}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">ID: {asset.id}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Link Button */}
                                                <button className="flex-shrink-0 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-700 shadow-sm border-2 border-blue-700">
                                                    + Link
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                            <div className="bg-white rounded-full p-8 mb-6 shadow-lg">
                                                <span className="text-7xl opacity-50">
                                                    {assetSearch ? '🔍' : '📚'}
                                                </span>
                                            </div>
                                            <h5 className="text-lg font-bold text-slate-700 mb-2">
                                                {assetSearch ? 'No Matching Assets' : totalAssets === 0 ? 'No Assets Available' : 'All Assets Linked'}
                                            </h5>
                                            <p className="text-sm text-slate-500 max-w-xs">
                                                {assetSearch
                                                    ? `No assets found matching "${assetSearch}". Try a different search term.`
                                                    : totalAssets === 0
                                                        ? 'No assets in the Asset Library yet. Upload some assets first in the Assets module.'
                                                        : 'All available assets are already linked to this service.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer with Tips */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t-2 border-amber-200 px-8 py-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-amber-100 p-3 rounded-xl flex-shrink-0">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h5 className="text-sm font-bold text-amber-900 mb-2">Asset Linking Tips</h5>
                            <ul className="text-xs text-amber-800 space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600 font-bold">•</span>
                                    <span><strong>Link relevant media</strong> - Connect images, videos, and documents that support this service</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600 font-bold">•</span>
                                    <span><strong>Organize by repository</strong> - Use repository tags to categorize assets by purpose</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600 font-bold">•</span>
                                    <span><strong>Keep it updated</strong> - Regularly review and update linked assets to ensure relevance</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600 font-bold">•</span>
                                    <span><strong>Upload first</strong> - Assets must be uploaded in the Assets module before they can be linked here</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
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

export default ServiceAssetLinker;

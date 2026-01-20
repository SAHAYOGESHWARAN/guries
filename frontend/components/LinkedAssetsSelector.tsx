import React, { useState, useMemo } from 'react';
import type { AssetLibraryItem } from '../types';

interface LinkedAssetsSelectorProps {
    assets: AssetLibraryItem[];
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
}

const LinkedAssetsSelector: React.FC<LinkedAssetsSelectorProps> = ({
    assets,
    selectedIds,
    onSelectionChange
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    const assetTypes = useMemo(() => {
        const types = new Set(assets.map(a => a.type).filter(Boolean));
        return ['All', ...Array.from(types)];
    }, [assets]);

    const filteredAssets = useMemo(() => {
        let filtered = assets;

        if (typeFilter !== 'All') {
            filtered = filtered.filter(a => a.type === typeFilter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                (a.name || '').toLowerCase().includes(query) ||
                (a.type || '').toLowerCase().includes(query) ||
                (a.asset_category || '').toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [assets, searchQuery, typeFilter]);

    const toggleSelection = (id: number) => {
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter(sid => sid !== id)
            : [...selectedIds, id];
        onSelectionChange(newIds);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📦</span>
                <h3 className="text-lg font-bold text-slate-900">Linked Assets</h3>
                <span className="ml-auto text-sm text-slate-500 font-medium">
                    {selectedIds.length} selected
                </span>
            </div>

            <div className="flex gap-3">
                <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    {assetTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50">
                {filteredAssets.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p className="text-sm">No assets found</p>
                    </div>
                ) : (
                    filteredAssets.map((asset) => (
                        <label
                            key={asset.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(asset.id)}
                                onChange={() => toggleSelection(asset.id)}
                                className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 truncate">{asset.name}</div>
                                <div className="text-xs text-slate-500 mt-1 space-x-2">
                                    <span className="inline-block bg-slate-200 px-2 py-1 rounded">
                                        {asset.type}
                                    </span>
                                    {asset.asset_category && (
                                        <span className="inline-block bg-slate-200 px-2 py-1 rounded">
                                            {asset.asset_category}
                                        </span>
                                    )}
                                    {asset.status && (
                                        <span className="inline-block bg-slate-200 px-2 py-1 rounded">
                                            {asset.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </label>
                    ))
                )}
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-indigo-900 mb-2">Selected Assets:</div>
                    <div className="flex flex-wrap gap-2">
                        {selectedIds.map(id => {
                            const asset = assets.find(a => a.id === id);
                            return asset ? (
                                <span
                                    key={id}
                                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm"
                                >
                                    {asset.name}
                                    <button
                                        onClick={() => toggleSelection(id)}
                                        className="hover:opacity-70 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinkedAssetsSelector;

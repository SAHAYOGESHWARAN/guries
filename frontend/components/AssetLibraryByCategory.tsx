import React, { useState, useEffect, useMemo } from 'react';
import Tooltip from './Tooltip';
import type { AssetLibraryItem } from '../types';

interface AssetLibraryCategoryProps {
    linkedAssets: AssetLibraryItem[];
    onToggle: (asset: AssetLibraryItem) => Promise<void>;
    totalAssets: number;
}

const AssetLibraryByCategory: React.FC<AssetLibraryCategoryProps> = ({
    linkedAssets,
    onToggle,
    totalAssets
}) => {
    const [repositories, setRepositories] = useState<string[]>([]);
    const [selectedRepository, setSelectedRepository] = useState<string>('All');
    const [assetsByRepository, setAssetsByRepository] = useState<Record<string, AssetLibraryItem[]>>({});
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch repositories and assets
    useEffect(() => {
        const fetchRepositories = async () => {
            try {
                setLoading(true);
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3003/api/v1';

                // Fetch available repositories
                const reposRes = await fetch(`${apiUrl}/asset-categories/repositories`);
                const reposData = await reposRes.json();
                const repoNames = Array.isArray(reposData)
                    ? reposData.map((r: any) => r.repository).filter(Boolean)
                    : ['Web', 'SEO', 'SMM'];

                setRepositories(repoNames);

                // Fetch assets for each repository
                const assetsByRepo: Record<string, AssetLibraryItem[]> = {};
                for (const repo of repoNames) {
                    const assetsRes = await fetch(`${apiUrl}/asset-categories/by-repository?repository=${repo}`);
                    const assetsData = await assetsRes.json();
                    assetsByRepo[repo] = Array.isArray(assetsData) ? assetsData : [];
                }
                setAssetsByRepository(assetsByRepo);
            } catch (error) {
                console.error('Error fetching repositories:', error);
                // Set default repositories if fetch fails
                setRepositories(['Web', 'SEO', 'SMM']);
            } finally {
                setLoading(false);
            }
        };

        fetchRepositories();
    }, []);

    // Filter assets based on search and selected repository
    const filteredAssets = useMemo(() => {
        let assets: AssetLibraryItem[] = [];

        if (selectedRepository === 'All') {
            assets = Object.values(assetsByRepository).flat();
        } else {
            assets = assetsByRepository[selectedRepository] || [];
        }

        if (!searchQuery.trim()) return assets;

        const query = searchQuery.toLowerCase();
        return assets.filter(asset =>
            (asset.name || '').toLowerCase().includes(query) ||
            (asset.type || '').toLowerCase().includes(query) ||
            (asset.asset_category || '').toLowerCase().includes(query)
        );
    }, [assetsByRepository, selectedRepository, searchQuery]);

    const getRepositoryIcon = (repo: string) => {
        switch (repo.toLowerCase()) {
            case 'web':
                return '🌐';
            case 'seo':
                return '🔍';
            case 'smm':
                return '📢';
            default:
                return '📦';
        }
    };

    const getRepositoryColor = (repo: string) => {
        switch (repo.toLowerCase()) {
            case 'web':
                return 'bg-blue-100 border-blue-300 text-blue-700';
            case 'seo':
                return 'bg-green-100 border-green-300 text-green-700';
            case 'smm':
                return 'bg-purple-100 border-purple-300 text-purple-700';
            default:
                return 'bg-slate-100 border-slate-300 text-slate-700';
        }
    };

    const isAssetLinked = (assetId: number) => {
        return linkedAssets.some(a => a.id === assetId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-600">Loading asset categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50 rounded-2xl border-2 border-indigo-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10">
                    <span className="text-9xl">📦</span>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">🏷️</span>
                        <h3 className="text-2xl font-bold">Asset Library by Category</h3>
                    </div>
                    <p className="text-indigo-100 text-sm">Browse and link assets from Web, SEO, and SMM repositories</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
                {/* Search Bar */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search assets by name, type, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedRepository('All')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedRepository === 'All'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300'
                            }`}
                    >
                        📦 All Categories ({filteredAssets.length})
                    </button>
                    {repositories.map((repo) => (
                        <button
                            key={repo}
                            onClick={() => setSelectedRepository(repo)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${selectedRepository === repo
                                    ? `${getRepositoryColor(repo)} bg-opacity-100 shadow-md`
                                    : `${getRepositoryColor(repo)} bg-opacity-20 border-2 hover:bg-opacity-30`
                                }`}
                        >
                            <span>{getRepositoryIcon(repo)}</span>
                            {repo} ({assetsByRepository[repo]?.length || 0})
                        </button>
                    ))}
                </div>

                {/* Assets Grid */}
                {filteredAssets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAssets.map((asset) => {
                            const isLinked = isAssetLinked(asset.id);
                            return (
                                <Tooltip
                                    key={asset.id}
                                    content={`${asset.name} - ${asset.type || 'Asset'}`}
                                >
                                    <div
                                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${isLinked
                                                ? 'bg-green-50 border-green-300 shadow-md'
                                                : 'bg-white border-slate-200 hover:border-indigo-300'
                                            }`}
                                        onClick={() => onToggle(asset)}
                                    >
                                        {/* Asset Thumbnail */}
                                        {asset.thumbnail_url ? (
                                            <img
                                                src={asset.thumbnail_url}
                                                alt={asset.name}
                                                className="w-full h-32 object-cover rounded-lg mb-3"
                                            />
                                        ) : (
                                            <div className="w-full h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg mb-3 flex items-center justify-center">
                                                <span className="text-3xl">📄</span>
                                            </div>
                                        )}

                                        {/* Asset Info */}
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-sm text-slate-900 line-clamp-2">
                                                {asset.name}
                                            </h4>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                    {asset.type || 'Asset'}
                                                </span>
                                                {asset.asset_category && (
                                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                                        {asset.asset_category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Link Status */}
                                            <div className="pt-2 border-t border-slate-200">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggle(asset);
                                                    }}
                                                    className={`w-full py-2 rounded text-xs font-bold transition-all ${isLinked
                                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                        }`}
                                                >
                                                    {isLinked ? '✓ Linked' : '+ Link Asset'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Tooltip>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500 text-sm">No assets found in this category</p>
                    </div>
                )}

                {/* Summary */}
                <div className="bg-white rounded-lg border-2 border-slate-200 p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Total Assets</p>
                            <p className="text-2xl font-bold text-slate-900">{totalAssets}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Linked</p>
                            <p className="text-2xl font-bold text-green-600">{linkedAssets.length}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Available</p>
                            <p className="text-2xl font-bold text-indigo-600">{filteredAssets.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetLibraryByCategory;

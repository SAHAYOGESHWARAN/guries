import React, { useState, useEffect } from 'react';
import type { AssetLibraryItem } from '../types';

interface LinkedAssetsDisplayProps {
    serviceId?: number;
    subServiceId?: number;
    onAssetsLoaded?: (assets: AssetLibraryItem[]) => void;
}

const LinkedAssetsDisplay: React.FC<LinkedAssetsDisplayProps> = ({
    serviceId,
    subServiceId,
    onAssetsLoaded
}) => {
    const [linkedAssets, setLinkedAssets] = useState<AssetLibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLinkedAssets = async () => {
            setLoading(true);
            setError(null);

            try {
                const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
                const endpoint = serviceId
                    ? `/services/${serviceId}/linked-assets`
                    : subServiceId
                        ? `/sub-services/${subServiceId}/linked-assets`
                        : null;

                if (!endpoint) {
                    setError('No service or sub-service ID provided');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${apiUrl}${endpoint}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch linked assets: ${response.statusText}`);
                }

                const data = await response.json();
                setLinkedAssets(Array.isArray(data) ? data : []);
                onAssetsLoaded?.(Array.isArray(data) ? data : []);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load linked assets';
                setError(message);
                console.error('Error fetching linked assets:', err);
            } finally {
                setLoading(false);
            }
        };

        if (serviceId || subServiceId) {
            fetchLinkedAssets();
        }
    }, [serviceId, subServiceId, onAssetsLoaded]);

    const getAssetTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Image': 'bg-green-500',
            'Video': 'bg-red-500',
            'Document': 'bg-orange-500',
            'Archive': 'bg-purple-500',
            'article': 'bg-blue-500',
        };
        return colors[type] || 'bg-slate-500';
    };

    const getAssetTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            'Image': '🖼️',
            'Video': '🎥',
            'Document': '📄',
            'Archive': '📦',
            'article': '📝',
        };
        return icons[type] || '📁';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="text-red-600 text-2xl">⚠️</div>
                    <div>
                        <h4 className="font-bold text-red-900 mb-1">Error Loading Assets</h4>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (linkedAssets.length === 0) {
        return (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">🔗</div>
                <h4 className="font-bold text-slate-700 mb-2">No Linked Assets</h4>
                <p className="text-sm text-slate-600">
                    No assets have been linked to this {serviceId ? 'service' : 'sub-service'} yet.
                </p>
            </div>
        );
    }

    // Workflow status visibility (Requirement 4)
    const getWorkflowStatusDisplay = (asset: AssetLibraryItem) => {
        if (asset.workflow_stage === 'Moved to CW') {
            return { text: 'CW is working on this asset', color: 'from-purple-500 to-violet-500', icon: '✍️' };
        }
        if (asset.workflow_stage === 'Moved to GD') {
            return { text: 'GD is working on this asset', color: 'from-pink-500 to-rose-500', icon: '🎨' };
        }
        if (asset.workflow_stage === 'Moved to WD') {
            return { text: 'WD is working on this asset', color: 'from-indigo-500 to-blue-500', icon: '💻' };
        }
        return null;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Web Repository</h3>
                    <p className="text-sm text-slate-600">{linkedAssets.length} asset(s) connected</p>
                </div>
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
                    {linkedAssets.length}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {linkedAssets.map(asset => {
                    const workflowStatus = getWorkflowStatusDisplay(asset);
                    return (
                        <div
                            key={asset.id}
                            className="bg-white rounded-xl border-2 border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all overflow-hidden"
                        >
                            {/* Workflow Status Banner (Requirement 4) */}
                            {workflowStatus && (
                                <div className={`bg-gradient-to-r ${workflowStatus.color} text-white py-2 px-3 flex items-center gap-2`}>
                                    <span className="text-sm">{workflowStatus.icon}</span>
                                    <span className="text-xs font-semibold">{workflowStatus.text}</span>
                                </div>
                            )}

                            {/* Asset Preview */}
                            <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                                {asset.thumbnail_url ? (
                                    <img
                                        src={asset.thumbnail_url}
                                        alt={asset.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className={`w-full h-full flex flex-col items-center justify-center text-white text-4xl ${getAssetTypeColor(asset.type)}`}>
                                        {getAssetTypeIcon(asset.type)}
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-3 py-1 rounded-full text-xs font-bold text-slate-700">
                                    {asset.type}
                                </div>
                            </div>

                            {/* Asset Info */}
                            <div className="p-4">
                                <h4 className="font-bold text-slate-800 mb-2 line-clamp-2 text-sm" title={asset.name}>
                                    {asset.name}
                                </h4>

                                {asset.web_description && (
                                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                                        {asset.web_description}
                                    </p>
                                )}

                                <div className="space-y-2 text-xs">
                                    {asset.status && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">Status:</span>
                                            <span className={`px-2 py-1 rounded font-semibold ${asset.status === 'Published' ? 'bg-green-100 text-green-700' :
                                                    asset.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {asset.status}
                                            </span>
                                        </div>
                                    )}

                                    {asset.qc_status && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">QC:</span>
                                            <span className={`px-2 py-1 rounded font-semibold ${asset.qc_status === 'Approved' || asset.qc_status === 'Pass' ? 'bg-green-100 text-green-700' :
                                                    asset.qc_status === 'QC Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {asset.qc_status}
                                            </span>
                                        </div>
                                    )}

                                    {asset.workflow_stage && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">Workflow:</span>
                                            <span className="px-2 py-1 rounded font-semibold bg-blue-100 text-blue-700">
                                                {asset.workflow_stage}
                                            </span>
                                        </div>
                                    )}

                                    {asset.seo_score !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">SEO Score:</span>
                                            <span className="font-bold text-blue-600">{asset.seo_score}/100</span>
                                        </div>
                                    )}

                                    {asset.version_number && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">Version:</span>
                                            <span className="font-mono text-slate-700">{asset.version_number}</span>
                                        </div>
                                    )}
                                </div>

                                {asset.file_url && (
                                    <a
                                        href={asset.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                                    >
                                        View Asset
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LinkedAssetsDisplay;

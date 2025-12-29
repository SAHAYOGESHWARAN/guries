import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import AssetUsagePanel from './AssetUsagePanel';
import ReworkIndicator from './ReworkIndicator';
import type { AssetLibraryItem, Service, SubServiceItem, User, Task, Campaign, Project, ContentRepositoryItem, AssetTypeMasterItem, QcChecklistItemResult } from '../types';

interface AssetDetailSidePanelProps {
    asset: AssetLibraryItem;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (asset: AssetLibraryItem) => void;
    onNavigate?: (view: string, id?: number) => void;
}

type TabType = 'metadata' | 'mapping' | 'qc' | 'usage';

const AssetDetailSidePanel: React.FC<AssetDetailSidePanelProps> = ({
    asset,
    isOpen,
    onClose,
    onEdit,
    onNavigate
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('metadata');

    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: users = [] } = useData<User>('users');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');
    const { data: repositoryItems = [] } = useData<ContentRepositoryItem>('content');
    const { data: assetTypes = [] } = useData<AssetTypeMasterItem>('asset-type-master');

    // Create a memoized user lookup map for O(1) access instead of O(n) find operations
    const usersMap = useMemo(() => {
        const map = new Map<number, User>();
        users.forEach(u => map.set(u.id, u));
        return map;
    }, [users]);

    // Get asset type master data for dimensions/size/format
    const assetTypeMaster = useMemo(() => {
        if (!asset.type) return null;
        return assetTypes.find(at =>
            at.asset_type_name?.toLowerCase() === asset.type?.toLowerCase()
        );
    }, [assetTypes, asset.type]);

    if (!isOpen) return null;

    // Helper functions
    const getLinkedService = () => {
        const serviceId = asset.linked_service_id || (asset.linked_service_ids && asset.linked_service_ids[0]);
        return serviceId ? services.find(s => s.id === serviceId) : null;
    };

    const getLinkedSubService = () => {
        const subServiceId = asset.linked_sub_service_id || (asset.linked_sub_service_ids && asset.linked_sub_service_ids[0]);
        return subServiceId ? subServices.find(ss => ss.id === subServiceId) : null;
    };

    const getLinkedTask = () => {
        const taskId = asset.linked_task_id || asset.linked_task;
        return taskId ? tasks.find(t => t.id === taskId) : null;
    };

    const getLinkedCampaign = () => {
        return asset.linked_campaign_id ? campaigns.find(c => c.id === asset.linked_campaign_id) : null;
    };

    const getLinkedProject = () => {
        return asset.linked_project_id ? projects.find(p => p.id === asset.linked_project_id) : null;
    };

    const getLinkedRepositoryItem = () => {
        return asset.linked_repository_item_id ? repositoryItems.find(r => r.id === asset.linked_repository_item_id) : null;
    };

    const getCreatedByUser = () => {
        return asset.created_by ? usersMap.get(asset.created_by) : null;
    };

    const getUpdatedByUser = () => {
        return asset.updated_by ? usersMap.get(asset.updated_by) : null;
    };

    const getDesignedByUser = () => {
        return asset.designed_by ? usersMap.get(asset.designed_by) : null;
    };

    const getQCReviewer = () => {
        return asset.qc_reviewer_id ? usersMap.get(asset.qc_reviewer_id) : null;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'QC Approved':
            case 'Published':
                return 'bg-green-100 text-green-800';
            case 'Pending QC Review':
                return 'bg-amber-100 text-amber-800';
            case 'QC Rejected':
            case 'Rework Required':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    // Format file size
    const formatFileSize = (bytes?: number) => {
        if (!bytes) return assetTypeMaster?.file_size || '-';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // Get dimensions from asset type master or asset
    const getDimensions = () => {
        return asset.dimensions || assetTypeMaster?.dimensions || '-';
    };

    // Get file format
    const getFileFormat = () => {
        if (asset.file_type) return asset.file_type.toUpperCase();
        return assetTypeMaster?.file_formats || '-';
    };

    const tabs = [
        { id: 'metadata' as TabType, label: 'Metadata', icon: '📋' },
        { id: 'mapping' as TabType, label: 'Mapping & Links', icon: '🔗' },
        { id: 'qc' as TabType, label: 'QC Panel', icon: '✅' },
        { id: 'usage' as TabType, label: 'Usage', icon: '📊' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Side Panel */}
            <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{asset.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(asset.status || 'Draft')}`}>
                                        {asset.status || 'Draft'}
                                    </span>
                                    <span className="text-xs text-slate-500">ID: {asset.id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(asset)}
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Rework Indicator - Show prominently for users when asset needs rework */}
                    {asset.status === 'Rework Required' && (
                        <div className="mt-4">
                            <ReworkIndicator
                                asset={asset}
                                onEdit={onEdit}
                                compact={false}
                            />
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4 border-b border-slate-200 -mb-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <span className="mr-1.5">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Metadata Tab */}
                    {activeTab === 'metadata' && (
                        <div className="space-y-6">
                            {/* Asset Preview */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Preview</h3>
                                {asset.thumbnail_url ? (
                                    <img
                                        src={asset.thumbnail_url}
                                        alt={asset.name}
                                        className="w-full max-h-48 object-contain rounded-lg border border-slate-200"
                                    />
                                ) : (
                                    <div className="w-full h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                                        <span className="text-4xl">📄</span>
                                    </div>
                                )}
                            </div>

                            {/* Asset Metadata - Matching Specification */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200">
                                    <h3 className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                                        <span>📋</span> Asset Metadata
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Asset ID - Auto generated */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Asset ID</label>
                                            <p className="text-sm font-semibold text-slate-900 mt-1">{asset.id}</p>
                                        </div>

                                        {/* Asset Type - Dropdown (read-only) */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Asset Type</label>
                                            <div className="mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                                                {asset.type || '-'}
                                            </div>
                                        </div>

                                        {/* Content Type - Dropdown (read-only) */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Content Type</label>
                                            <div className="mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                                                {asset.content_type || '-'}
                                            </div>
                                        </div>

                                        {/* Asset Category */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Asset Category</label>
                                            <div className="mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                                                {asset.asset_category || '-'}
                                            </div>
                                        </div>

                                        {/* Asset Format */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Asset Format</label>
                                            <div className="mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                                                {asset.asset_format || '-'}
                                            </div>
                                        </div>

                                        {/* Application Type */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Application Type</label>
                                            <div className="mt-1">
                                                {asset.application_type ? (
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${asset.application_type === 'web' ? 'bg-blue-100 text-blue-700' :
                                                        asset.application_type === 'seo' ? 'bg-green-100 text-green-700' :
                                                            asset.application_type === 'smm' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {asset.application_type.toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-500">-</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dimensions - From Asset Type Master */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Dimensions</label>
                                            <p className="text-sm text-slate-900 mt-1">{getDimensions()}</p>
                                            {assetTypeMaster && (
                                                <p className="text-xs text-slate-400 mt-0.5">From Asset Type Master</p>
                                            )}
                                        </div>

                                        {/* Size - From Asset Type Master */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Size</label>
                                            <p className="text-sm text-slate-900 mt-1">{formatFileSize(asset.file_size)}</p>
                                            {assetTypeMaster && !asset.file_size && (
                                                <p className="text-xs text-slate-400 mt-0.5">From Asset Type Master</p>
                                            )}
                                        </div>

                                        {/* Format - From Asset Type Master */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Format</label>
                                            <p className="text-sm text-slate-900 mt-1">{getFileFormat()}</p>
                                            {assetTypeMaster && !asset.file_type && (
                                                <p className="text-xs text-slate-400 mt-0.5">From Asset Type Master</p>
                                            )}
                                        </div>

                                        {/* Version */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Version</label>
                                            <p className="text-sm text-slate-900 mt-1">{asset.version_number || 'v1.0'}</p>
                                        </div>

                                        {/* Repository */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Repository</label>
                                            <p className="text-sm text-slate-900 mt-1">{asset.repository || '-'}</p>
                                        </div>

                                        {/* Usage Count */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Usage Count</label>
                                            <p className="text-sm text-slate-900 mt-1">{asset.usage_count ?? 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Keywords */}
                            {asset.keywords && asset.keywords.length > 0 && (
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
                                        <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                                            <span>🏷️</span> Keywords
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {asset.keywords.map((keyword, index) => (
                                                <span key={index} className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* File Download */}
                            {asset.file_url && (
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                                        <h3 className="text-sm font-semibold text-green-700 flex items-center gap-2">
                                            <span>📥</span> File Download
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <a
                                            href={asset.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download Asset
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* User & Date Information */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <span>👤</span> User & Date Information
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Created By */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Created By</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getCreatedByUser() ? (
                                                    <>
                                                        <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                            {getCreatedByUser()?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm text-slate-900">{getCreatedByUser()?.name}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-slate-500">-</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Updated By */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Updated By</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getUpdatedByUser() ? (
                                                    <>
                                                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                            {getUpdatedByUser()?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm text-slate-900">{getUpdatedByUser()?.name}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-slate-500">-</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Designed By */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Designed By</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getDesignedByUser() ? (
                                                    <>
                                                        <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                            {getDesignedByUser()?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm text-slate-900">{getDesignedByUser()?.name}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-slate-500">-</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Created Date */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Created Date</label>
                                            <p className="text-sm text-slate-900 mt-1">
                                                {asset.created_at ? new Date(asset.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : '-'}
                                            </p>
                                        </div>

                                        {/* Last Updated Date */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Last Updated Date</label>
                                            <p className="text-sm text-slate-900 mt-1">
                                                {asset.updated_at ? new Date(asset.updated_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Web Application Fields */}
                            {asset.application_type === 'web' && (
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                                        <h3 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                                            <span>🌐</span> Web Application Fields
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Web Title</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.web_title || '-'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Web Description</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.web_description || '-'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Meta Description</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.web_meta_description || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Web URL</label>
                                                {asset.web_url ? (
                                                    <a href={asset.web_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block truncate">{asset.web_url}</a>
                                                ) : (
                                                    <p className="text-sm text-slate-500 mt-1">-</p>
                                                )}
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Web Keywords</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.web_keywords || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">H1</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.web_h1 || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">H2 (1)</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.web_h2_1 || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">H2 (2)</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.web_h2_2 || '-'}</p>
                                            </div>
                                            {asset.web_body_content && (
                                                <div className="col-span-2">
                                                    <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Body Content</label>
                                                    <p className="text-sm text-slate-900 mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">{asset.web_body_content}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SEO Application Fields */}
                            {asset.application_type === 'seo' && (
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                                        <h3 className="text-sm font-semibold text-green-700 flex items-center gap-2">
                                            <span>🔍</span> SEO Application Fields
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">SEO Title</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.seo_title || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Target URL</label>
                                                {asset.seo_target_url ? (
                                                    <a href={asset.seo_target_url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline mt-1 block truncate">{asset.seo_target_url}</a>
                                                ) : (
                                                    <p className="text-sm text-slate-500 mt-1">-</p>
                                                )}
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Focus Keyword</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.seo_focus_keyword || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Content Type</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.seo_content_type || '-'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Meta Description</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.seo_meta_description || '-'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Content Description</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.seo_content_description || '-'}</p>
                                            </div>
                                            {asset.seo_keywords && asset.seo_keywords.length > 0 && (
                                                <div className="col-span-2">
                                                    <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">SEO Keywords</label>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {asset.seo_keywords.map((kw, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{kw}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">H1</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.seo_h1 || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">H2 (1)</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.seo_h2_1 || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">H2 (2)</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.seo_h2_2 || '-'}</p>
                                            </div>
                                            {asset.seo_content_body && (
                                                <div className="col-span-2">
                                                    <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Content Body</label>
                                                    <p className="text-sm text-slate-900 mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">{asset.seo_content_body}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SMM Application Fields */}
                            {asset.application_type === 'smm' && (
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                                        <h3 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                                            <span>📱</span> SMM Application Fields
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Platform</label>
                                                <p className="text-sm text-slate-900 mt-1 capitalize">{asset.smm_platform || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Post Type</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.smm_post_type || '-'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Title</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.smm_title || '-'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Description</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.smm_description || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">URL</label>
                                                {asset.smm_url ? (
                                                    <a href={asset.smm_url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline mt-1 block truncate">{asset.smm_url}</a>
                                                ) : (
                                                    <p className="text-sm text-slate-500 mt-1">-</p>
                                                )}
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Tag</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.smm_tag || '-'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Hashtags</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.smm_hashtags || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Media Type</label>
                                                <p className="text-sm text-slate-900 mt-1 capitalize">{asset.smm_media_type || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Campaign Type</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.smm_campaign_type || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">CTA</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.smm_cta || '-'}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Target Audience</label>
                                                <p className="text-sm text-slate-900 mt-1">{asset.smm_target_audience || '-'}</p>
                                            </div>
                                            {asset.smm_media_url && (
                                                <div className="col-span-2">
                                                    <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Media URL</label>
                                                    <a href={asset.smm_media_url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline mt-1 block truncate">{asset.smm_media_url}</a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mapping & Links Tab */}
                    {activeTab === 'mapping' && (
                        <div className="space-y-6">
                            {/* Section Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                                    <span>🔗</span> Asset Linkages
                                </h3>
                                <p className="text-xs text-blue-600 mt-1">
                                    Mappings selected during asset upload from "Map Assets to Source Work" section
                                </p>
                            </div>

                            {/* Linked Task */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                                    <h3 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                                        <span>📋</span> Linked Task
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {getLinkedTask() ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">{getLinkedTask()?.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLinkedTask()?.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                        getLinkedTask()?.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {getLinkedTask()?.status}
                                                    </span>
                                                    {getLinkedTask()?.priority && (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLinkedTask()?.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                            getLinkedTask()?.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }`}>
                                                            {getLinkedTask()?.priority}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onNavigate?.('tasks', getLinkedTask()?.id)}
                                                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                            >
                                                View →
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No task linked</p>
                                    )}
                                </div>
                            </div>

                            {/* Linked Campaign */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                                    <h3 className="text-sm font-semibold text-green-700 flex items-center gap-2">
                                        <span>📢</span> Linked Campaign
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {getLinkedCampaign() ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">{getLinkedCampaign()?.campaign_name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getLinkedCampaign()?.campaign_type && (
                                                        <span className="text-xs text-slate-500">
                                                            Type: {getLinkedCampaign()?.campaign_type}
                                                        </span>
                                                    )}
                                                    {getLinkedCampaign()?.campaign_status && (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLinkedCampaign()?.campaign_status === 'Active' ? 'bg-green-100 text-green-700' :
                                                            'bg-slate-100 text-slate-700'
                                                            }`}>
                                                            {getLinkedCampaign()?.campaign_status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onNavigate?.('campaigns', getLinkedCampaign()?.id)}
                                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                                            >
                                                View →
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No campaign linked</p>
                                    )}
                                </div>
                            </div>

                            {/* Linked Project */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
                                    <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                                        <span>📁</span> Linked Project
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {getLinkedProject() ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">{getLinkedProject()?.project_name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getLinkedProject()?.project_type && (
                                                        <span className="text-xs text-slate-500">
                                                            Type: {getLinkedProject()?.project_type}
                                                        </span>
                                                    )}
                                                    {getLinkedProject()?.project_status && (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLinkedProject()?.project_status === 'Active' ? 'bg-green-100 text-green-700' :
                                                            getLinkedProject()?.project_status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }`}>
                                                            {getLinkedProject()?.project_status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onNavigate?.('projects', getLinkedProject()?.id)}
                                                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                                            >
                                                View →
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No project linked</p>
                                    )}
                                </div>
                            </div>

                            {/* Linked Service */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                                    <h3 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                                        <span>🏢</span> Linked Service
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {getLinkedService() ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">{getLinkedService()?.service_name}</p>
                                                {getLinkedService()?.service_code && (
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Code: {getLinkedService()?.service_code}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onNavigate?.('services', getLinkedService()?.id)}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                View →
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No service linked</p>
                                    )}
                                </div>
                            </div>

                            {/* Linked Sub-Service */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200">
                                    <h3 className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                                        <span>📂</span> Linked Sub-Service
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {getLinkedSubService() ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">{getLinkedSubService()?.sub_service_name}</p>
                                                {getLinkedSubService()?.status && (
                                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getLinkedSubService()?.status === 'Published' ? 'bg-green-100 text-green-700' :
                                                        getLinkedSubService()?.status === 'Draft' ? 'bg-slate-100 text-slate-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {getLinkedSubService()?.status}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onNavigate?.('subservices', getLinkedSubService()?.id)}
                                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                            >
                                                View →
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No sub-service linked</p>
                                    )}
                                </div>
                            </div>

                            {/* Linked Repository Item */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-teal-50 px-4 py-3 border-b border-teal-200">
                                    <h3 className="text-sm font-semibold text-teal-700 flex items-center gap-2">
                                        <span>📚</span> Linked Repository Item
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {getLinkedRepositoryItem() ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">{getLinkedRepositoryItem()?.content_title_clean}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getLinkedRepositoryItem()?.asset_type && (
                                                        <span className="text-xs text-slate-500">
                                                            Type: {getLinkedRepositoryItem()?.asset_type}
                                                        </span>
                                                    )}
                                                    {getLinkedRepositoryItem()?.status && (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLinkedRepositoryItem()?.status === 'published' ? 'bg-green-100 text-green-700' :
                                                            getLinkedRepositoryItem()?.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {getLinkedRepositoryItem()?.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onNavigate?.('content', getLinkedRepositoryItem()?.id)}
                                                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                                            >
                                                View →
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No repository item linked</p>
                                    )}
                                </div>
                            </div>

                            {/* Summary Card */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Linkage Summary</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center">
                                        <div className={`text-lg font-bold ${getLinkedTask() ? 'text-purple-600' : 'text-slate-300'}`}>
                                            {getLinkedTask() ? '✓' : '—'}
                                        </div>
                                        <div className="text-xs text-slate-500">Task</div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-lg font-bold ${getLinkedCampaign() ? 'text-green-600' : 'text-slate-300'}`}>
                                            {getLinkedCampaign() ? '✓' : '—'}
                                        </div>
                                        <div className="text-xs text-slate-500">Campaign</div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-lg font-bold ${getLinkedProject() ? 'text-amber-600' : 'text-slate-300'}`}>
                                            {getLinkedProject() ? '✓' : '—'}
                                        </div>
                                        <div className="text-xs text-slate-500">Project</div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-lg font-bold ${getLinkedService() ? 'text-blue-600' : 'text-slate-300'}`}>
                                            {getLinkedService() ? '✓' : '—'}
                                        </div>
                                        <div className="text-xs text-slate-500">Service</div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-lg font-bold ${getLinkedSubService() ? 'text-indigo-600' : 'text-slate-300'}`}>
                                            {getLinkedSubService() ? '✓' : '—'}
                                        </div>
                                        <div className="text-xs text-slate-500">Sub-Service</div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-lg font-bold ${getLinkedRepositoryItem() ? 'text-teal-600' : 'text-slate-300'}`}>
                                            {getLinkedRepositoryItem() ? '✓' : '—'}
                                        </div>
                                        <div className="text-xs text-slate-500">Repository</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* QC Panel Tab */}
                    {activeTab === 'qc' && (
                        <div className="space-y-6">
                            {/* Section Header */}
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                                <h3 className="text-sm font-semibold text-indigo-800 flex items-center gap-2">
                                    <span>✅</span> QC Review Results
                                </h3>
                                <p className="text-xs text-indigo-600 mt-1">
                                    Quality control results from the Asset Review / QC workflow (read-only)
                                </p>
                            </div>

                            {/* QC Summary Card */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200">
                                    <h3 className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                                        <span>📊</span> QC Summary
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {/* QC Score Display */}
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="relative">
                                            <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 ${asset.qc_score !== undefined
                                                ? asset.qc_score >= 80 ? 'border-green-500 bg-green-50'
                                                    : asset.qc_score >= 60 ? 'border-amber-500 bg-amber-50'
                                                        : 'border-red-500 bg-red-50'
                                                : 'border-slate-200 bg-slate-50'
                                                }`}>
                                                <div className="text-center">
                                                    <div className={`text-3xl font-bold ${asset.qc_score !== undefined
                                                        ? asset.qc_score >= 80 ? 'text-green-600'
                                                            : asset.qc_score >= 60 ? 'text-amber-600'
                                                                : 'text-red-600'
                                                        : 'text-slate-400'
                                                        }`}>
                                                        {asset.qc_score !== undefined ? asset.qc_score : '-'}
                                                    </div>
                                                    <div className="text-xs text-slate-500">/ 100</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QC Status, Reviewer, Date Grid */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {/* QC Status */}
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1">QC Status</label>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${asset.qc_status === 'Pass' || asset.status === 'QC Approved' ? 'bg-green-100 text-green-700' :
                                                asset.qc_status === 'Fail' || asset.status === 'QC Rejected' ? 'bg-red-100 text-red-700' :
                                                    asset.qc_status === 'Rework' || asset.status === 'Rework Required' ? 'bg-amber-100 text-amber-700' :
                                                        asset.status === 'Pending QC Review' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-slate-100 text-slate-700'
                                                }`}>
                                                {asset.qc_status || (
                                                    asset.status === 'QC Approved' ? 'Pass' :
                                                        asset.status === 'QC Rejected' ? 'Fail' :
                                                            asset.status === 'Rework Required' ? 'Rework' :
                                                                asset.status === 'Pending QC Review' ? 'Pending' :
                                                                    'Not Reviewed'
                                                )}
                                            </span>
                                        </div>

                                        {/* Reviewer */}
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1">Reviewer</label>
                                            {getQCReviewer() ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        {getQCReviewer()?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900">{getQCReviewer()?.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400">-</span>
                                            )}
                                        </div>

                                        {/* QC Date */}
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1">QC Date</label>
                                            <span className="text-sm font-medium text-slate-900">
                                                {asset.qc_reviewed_at ? new Date(asset.qc_reviewed_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rework Count */}
                                    {asset.rework_count !== undefined && asset.rework_count > 0 && (
                                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-amber-600">⚠️</span>
                                                <span className="text-sm text-amber-700">
                                                    This asset has been sent for rework <strong>{asset.rework_count}</strong> time{asset.rework_count > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AI Scores (Pre-submission) */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <span>🤖</span> AI Scores (Pre-submission)
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className={`text-3xl font-bold ${asset.seo_score !== undefined
                                                ? asset.seo_score >= 80 ? 'text-green-600'
                                                    : asset.seo_score >= 60 ? 'text-amber-600'
                                                        : 'text-red-600'
                                                : 'text-slate-400'
                                                }`}>
                                                {asset.seo_score ?? '-'}
                                            </div>
                                            <div className="text-xs text-blue-600 mt-1">SEO Score</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                                            <div className={`text-3xl font-bold ${asset.grammar_score !== undefined
                                                ? asset.grammar_score >= 80 ? 'text-green-600'
                                                    : asset.grammar_score >= 60 ? 'text-amber-600'
                                                        : 'text-red-600'
                                                : 'text-slate-400'
                                                }`}>
                                                {asset.grammar_score ?? '-'}
                                            </div>
                                            <div className="text-xs text-green-600 mt-1">Grammar Score</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* QC Checklist & Scoring */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                                    <h3 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                                        <span>📋</span> QC Checklist & Scoring
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {asset.qc_checklist_items && asset.qc_checklist_items.length > 0 ? (
                                        <div className="space-y-3">
                                            {asset.qc_checklist_items.map((item: QcChecklistItemResult, index: number) => (
                                                <div key={item.id || index} className="border border-slate-200 rounded-lg overflow-hidden">
                                                    {/* Checklist Item Header */}
                                                    <div className={`px-4 py-3 flex items-center justify-between ${item.result === 'Pass' ? 'bg-green-50' : 'bg-red-50'
                                                        }`}>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${item.result === 'Pass'
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-red-500 text-white'
                                                                }`}>
                                                                {item.result === 'Pass' ? '✓' : '✗'}
                                                            </span>
                                                            <span className="font-medium text-slate-900">{item.item_name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-sm font-bold ${item.result === 'Pass' ? 'text-green-600' : 'text-red-600'
                                                                }`}>
                                                                {item.score}/{item.max_score}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.result === 'Pass'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {item.result}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* Reviewer Comment */}
                                                    {item.reviewer_comment && (
                                                        <div className="px-4 py-2 bg-white border-t border-slate-100">
                                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Reviewer Comment</p>
                                                            <p className="text-sm text-slate-700">{item.reviewer_comment}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Total Score Summary */}
                                            <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-indigo-900">Total Checklist Score</span>
                                                    <span className="text-lg font-bold text-indigo-600">
                                                        {asset.qc_checklist_items.reduce((sum: number, item: QcChecklistItemResult) => sum + item.score, 0)}
                                                        /
                                                        {asset.qc_checklist_items.reduce((sum: number, item: QcChecklistItemResult) => sum + item.max_score, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <span className="text-2xl">📋</span>
                                            </div>
                                            <p className="text-sm text-slate-500">No QC checklist items available</p>
                                            <p className="text-xs text-slate-400 mt-1">Checklist will be populated after QC review</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QC Remarks */}
                            {asset.qc_remarks && (
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <span>💬</span> QC Remarks
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{asset.qc_remarks}</p>
                                    </div>
                                </div>
                            )}

                            {/* Submission Info */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Submission Info</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-500">Submitted By</label>
                                        <p className="text-sm font-medium text-slate-900">
                                            {asset.submitted_by ? users.find(u => u.id === asset.submitted_by)?.name || '-' : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Submitted At</label>
                                        <p className="text-sm font-medium text-slate-900">
                                            {asset.submitted_at ? new Date(asset.submitted_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Usage Panel Tab */}
                    {activeTab === 'usage' && (
                        <AssetUsagePanel asset={asset} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetDetailSidePanel;

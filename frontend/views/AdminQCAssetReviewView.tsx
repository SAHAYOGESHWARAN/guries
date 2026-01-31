import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import AssetDetailSidePanel from '../components/AssetDetailSidePanel';
import type { AssetLibraryItem, User, Service, Task, AssetCategoryMasterItem, AssetTypeMasterItem } from '../types';

type ViewMode = 'all' | 'pending' | 'rework' | 'approved' | 'rejected';

interface AdminQCAssetReviewViewProps {
    onNavigate?: (view: string, id?: number) => void;
}

/**
 * Admin QC Asset Review View
 * 
 * SECURITY: This screen is ONLY accessible to Admin accounts.
 * Permission check is enforced at both UI and API levels.
 * 
 * Features:
 * - Full QC review capabilities (approve, reject, request rework)
 * - View all assets across all users
 * - QC checklist and scoring
 * - Audit trail logging
 */
const AdminQCAssetReviewView: React.FC<AdminQCAssetReviewViewProps> = ({ onNavigate }) => {
    const { user, isAdmin, hasPermission } = useAuth();

    // SECURITY CHECK: Only admins can access this view
    const canAccessView = hasPermission('canViewAdminQCReview');

    const [selectedAsset, setSelectedAsset] = useState<AssetLibraryItem | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('pending');
    const [sidePanelAsset, setSidePanelAsset] = useState<AssetLibraryItem | null>(null);
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [qcScore, setQcScore] = useState<number>(0);
    const [qcRemarks, setQcRemarks] = useState('');

    // Application-type specific QC checklists
    const getChecklistForApplicationType = (appType: string | undefined): { [key: string]: boolean } => {
        switch (appType) {
            case 'seo':
                return {
                    'SEO Title Optimization': false,
                    'Meta Description Quality': false,
                    'Keyword Density Check': false,
                    'H1/H2 Structure': false,
                    'Internal/External Links': false,
                    'Content Readability': false
                };
            case 'smm':
                return {
                    'Platform Guidelines Compliance': false,
                    'Visual Quality & Dimensions': false,
                    'Caption & Hashtag Quality': false,
                    'Brand Voice Consistency': false,
                    'CTA Effectiveness': false,
                    'Engagement Potential': false
                };
            default: // web
                return {
                    'Brand Compliance': false,
                    'Technical Specs Met': false,
                    'Content Quality': false,
                    'SEO Optimization': false,
                    'Legal / Regulatory Check': false,
                    'Tone of Voice': false
                };
        }
    };

    const [checklistItems, setChecklistItems] = useState<{ [key: string]: boolean }>(getChecklistForApplicationType('web'));

    // Data hooks
    const { data: assetsForQC = [], loading: dataLoading, refresh: refreshAssets } = useData<AssetLibraryItem>('assetLibrary');
    const { data: users = [] } = useData<User>('users');
    const { data: services = [] } = useData<Service>('services');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: assetCategories = [] } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { data: assetTypes = [] } = useData<AssetTypeMasterItem>('asset-type-master');

    // User lookup map
    const usersMap = useMemo(() => {
        const map = new Map<number, User>();
        users.forEach(u => map.set(u.id, u));
        return map;
    }, [users]);

    // Initial load tracking
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    useEffect(() => {
        if (!dataLoading && !initialLoadDone) {
            setInitialLoadDone(true);
        }
    }, [dataLoading, initialLoadDone]);

    const loading = !initialLoadDone && dataLoading;

    // Helper functions
    const getLinkedServiceName = (asset: AssetLibraryItem): string => {
        const serviceId = asset.linked_service_id || (asset.linked_service_ids && asset.linked_service_ids[0]);
        if (!serviceId) return '-';
        return services.find(s => s.id === serviceId)?.service_name || '-';
    };

    const getLinkedTaskName = (asset: AssetLibraryItem): string => {
        const taskId = asset.linked_task_id || asset.linked_task;
        if (!taskId) return '-';
        const task = tasks.find(t => t.id === taskId);
        return task?.name || (task as any)?.task_name || '-';
    };

    const getDesignerName = (asset: AssetLibraryItem): string => {
        const designerId = asset.designed_by || asset.created_by;
        if (!designerId) return '-';
        return usersMap.get(designerId)?.name || '-';
    };

    const getSubmitterName = (asset: AssetLibraryItem): string => {
        if (!asset.submitted_by) return '-';
        return usersMap.get(asset.submitted_by)?.name || '-';
    };

    const getAssetTypeName = (asset: AssetLibraryItem): string => {
        if (!asset.type) return '-';
        const found = assetTypes.find(at => at.asset_type_name?.toLowerCase() === asset.type?.toLowerCase());
        return found?.asset_type_name || asset.type;
    };

    const getAssetCategoryName = (asset: AssetLibraryItem): string => {
        if (!asset.asset_category) return '-';
        const found = assetCategories.find(cat => cat.category_name?.toLowerCase() === asset.asset_category?.toLowerCase());
        return found?.category_name || asset.asset_category;
    };

    const getQCStatusBadge = (asset: AssetLibraryItem) => {
        const status = asset.qc_status || asset.status || 'Pending';
        if (['Pass', 'QC Approved', 'Published'].includes(status)) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Pass</span>;
        }
        if (['Fail', 'QC Rejected'].includes(status)) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Fail</span>;
        }
        if (['Rework', 'Rework Required'].includes(status)) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Rework</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending</span>;
    };

    const formatUploadDate = (asset: AssetLibraryItem): string => {
        const dateString = asset.submitted_at || asset.created_at;
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Filter assets based on view mode - Admin sees ALL assets
    const filteredAssets = useMemo(() => {
        switch (viewMode) {
            case 'pending': return assetsForQC.filter(a => a.status === 'Pending QC Review' || a.status === 'Draft' || !a.status);
            case 'rework': return assetsForQC.filter(a => a.status === 'Rework Required' || a.qc_status === 'Rework');
            case 'approved': return assetsForQC.filter(a => a.status === 'QC Approved' || a.qc_status === 'Pass' || a.status === 'Published');
            case 'rejected': return assetsForQC.filter(a => a.status === 'QC Rejected' || a.qc_status === 'Fail');
            default: return assetsForQC;
        }
    }, [assetsForQC, viewMode]);

    // Status counts
    const statusCounts = useMemo(() => ({
        all: assetsForQC.length,
        pending: assetsForQC.filter(a => a.status === 'Pending QC Review' || a.status === 'Draft' || !a.status).length,
        rework: assetsForQC.filter(a => a.status === 'Rework Required' || a.qc_status === 'Rework').length,
        approved: assetsForQC.filter(a => a.status === 'QC Approved' || a.qc_status === 'Pass' || a.status === 'Published').length,
        rejected: assetsForQC.filter(a => a.status === 'QC Rejected' || a.qc_status === 'Fail').length,
    }), [assetsForQC]);

    // Handlers
    const handleOpenSidePanel = (asset: AssetLibraryItem) => {
        setSidePanelAsset(asset);
        setShowSidePanel(true);
    };

    const handleCloseSidePanel = () => {
        setShowSidePanel(false);
        setSidePanelAsset(null);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshAssets?.();
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const handleReviewAsset = (asset: AssetLibraryItem) => {
        setSelectedAsset(asset);
        setQcScore(asset.qc_score || 0);
        setQcRemarks(asset.qc_remarks || '');
        // Set application-type specific checklist
        setChecklistItems(getChecklistForApplicationType(asset.application_type));
    };

    const handleQCSubmit = async (decision: 'approved' | 'rejected' | 'rework') => {
        if (!selectedAsset || !user) {
            alert('No asset selected or user not logged in');
            return;
        }

        setSubmitting(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            const response = await fetch(`${apiUrl}/assetLibrary/${selectedAsset.id}/qc-review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': String(user.id),
                    'X-User-Role': user.role
                },
                body: JSON.stringify({
                    qc_score: qcScore || 0,
                    qc_remarks: qcRemarks || '',
                    qc_decision: decision,
                    qc_reviewer_id: user.id,
                    user_role: user.role,
                    checklist_items: checklistItems,
                    checklist_completion: Object.values(checklistItems).every(v => v),
                    linking_active: decision === 'approved'
                })
            });

            if (response.ok) {
                const message = decision === 'approved'
                    ? 'Asset approved and linked to service!'
                    : decision === 'rework'
                        ? 'Asset sent for rework!'
                        : 'Asset rejected!';
                alert(message);
                setSelectedAsset(null);
                setQcScore(0);
                setQcRemarks('');
                handleRefresh();
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Error: ${errorData.error || 'Failed to submit QC review'}`);
            }
        } catch (error: any) {
            alert(`Failed to submit QC review: ${error.message || 'Network error'}`);
        } finally {
            setSubmitting(false);
        }
    };

    // SECURITY: Access Denied screen for non-admin users
    if (!canAccessView) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        This screen is restricted to Admin accounts only. You do not have permission to access the Admin QC Asset Review.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-amber-800">
                            <strong>Current Role:</strong> {user?.role || 'Unknown'}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                            Contact your administrator if you believe you should have access.
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate?.('assets')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Go to Assets
                    </button>
                </div>
            </div>
        );
    }


    // QC Review Detail View
    if (selectedAsset) {
        const linkedService = services.find(s => s.id === (selectedAsset.linked_service_id || selectedAsset.linked_service_ids?.[0]));

        return (
            <div className="p-6 bg-gray-100 min-h-screen">
                {/* Admin Badge */}
                <div className="mb-4 flex items-center justify-between">
                    <button onClick={() => setSelectedAsset(null)} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to List
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">
                            Admin QC Review
                        </span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                            Reviewer: {user?.name}
                        </span>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Left Panel - Asset Details */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Asset #{selectedAsset.id}</p>
                                <h1 className="text-2xl font-bold text-gray-900">{selectedAsset.name}</h1>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                        {selectedAsset.application_type?.toUpperCase() || 'WEB'}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                        {getAssetTypeName(selectedAsset)}
                                    </span>
                                    {selectedAsset.rework_count && selectedAsset.rework_count > 0 && (
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                            Rework #{selectedAsset.rework_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-xs mb-1">Submitted By</p>
                                <p className="text-sm font-semibold text-gray-800">{getSubmitterName(selectedAsset)}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatUploadDate(selectedAsset)}</p>
                            </div>
                        </div>

                        {/* Media Preview */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 h-72 flex items-center justify-center mb-6">
                            {selectedAsset.thumbnail_url || selectedAsset.file_url ? (
                                <img src={selectedAsset.thumbnail_url || selectedAsset.file_url} alt={selectedAsset.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                                <span className="text-gray-400 text-sm">No media attached</span>
                            )}
                        </div>

                        {/* Asset Info Grid */}
                        <div className="grid grid-cols-2 gap-6 mb-5">
                            <div>
                                <label className="text-rose-500 text-sm font-medium block mb-1">Description</label>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {selectedAsset.web_description || selectedAsset.seo_content_description || selectedAsset.smm_description || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-rose-500 text-sm font-medium block mb-1">Linked Service</label>
                                <p className="text-gray-700 text-sm">{linkedService?.service_name || '-'}</p>
                            </div>
                        </div>

                        {/* AI Scores */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="text-2xl font-bold text-blue-600">{selectedAsset.seo_score ?? '-'}</div>
                                <div className="text-xs text-blue-600">SEO Score</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                <div className="text-2xl font-bold text-green-600">{selectedAsset.grammar_score ?? '-'}</div>
                                <div className="text-xs text-green-600">Grammar Score</div>
                            </div>
                        </div>

                        {/* Keywords */}
                        {selectedAsset.keywords && selectedAsset.keywords.length > 0 && (
                            <div className="mb-5">
                                <label className="text-rose-500 text-sm font-medium block mb-2">Keywords</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedAsset.keywords.map((kw, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-200">{kw}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Body Content Section */}
                        {(selectedAsset.web_body_content || selectedAsset.smm_description) && (
                            <div className="mb-5">
                                <label className="text-rose-500 text-sm font-medium block mb-2">Body Content</label>
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto">
                                    <div
                                        className="prose prose-sm max-w-none text-gray-700"
                                        dangerouslySetInnerHTML={{
                                            __html: selectedAsset.web_body_content || selectedAsset.smm_description || ''
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* H1, H2 Tags Section */}
                        {(selectedAsset.web_h1 || selectedAsset.web_h2_1 || selectedAsset.web_h2_2) && (
                            <div className="mb-5">
                                <label className="text-rose-500 text-sm font-medium block mb-2">Heading Tags</label>
                                <div className="space-y-2">
                                    {selectedAsset.web_h1 && (
                                        <div className="flex items-start gap-2">
                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">H1</span>
                                            <span className="text-gray-700 text-sm">{selectedAsset.web_h1}</span>
                                        </div>
                                    )}
                                    {selectedAsset.web_h2_1 && (
                                        <div className="flex items-start gap-2">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">H2</span>
                                            <span className="text-gray-700 text-sm">{selectedAsset.web_h2_1}</span>
                                        </div>
                                    )}
                                    {selectedAsset.web_h2_2 && (
                                        <div className="flex items-start gap-2">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">H2</span>
                                            <span className="text-gray-700 text-sm">{selectedAsset.web_h2_2}</span>
                                        </div>
                                    )}
                                    {selectedAsset.web_h3_tags && selectedAsset.web_h3_tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedAsset.web_h3_tags.map((h3, i) => (
                                                <div key={i} className="flex items-start gap-1">
                                                    <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs font-bold">H3</span>
                                                    <span className="text-gray-600 text-sm">{h3}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Meta Description */}
                        {selectedAsset.web_meta_description && (
                            <div className="mb-5">
                                <label className="text-rose-500 text-sm font-medium block mb-2">Meta Description</label>
                                <p className="text-gray-700 text-sm bg-gray-50 rounded-lg border border-gray-200 p-3">
                                    {selectedAsset.web_meta_description}
                                </p>
                            </div>
                        )}

                        {/* URL Slug */}
                        {selectedAsset.web_url && (
                            <div className="mb-5">
                                <label className="text-rose-500 text-sm font-medium block mb-1">URL Slug</label>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    <span className="text-gray-700 text-sm">{selectedAsset.web_url}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - QC Assessment */}
                    <div className="w-96 bg-white rounded-xl shadow-sm border-2 border-red-200 p-5">
                        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <h3 className="text-base font-bold text-gray-900">Admin QC Assessment</h3>
                            </div>
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">ADMIN</span>
                        </div>

                        {/* QC Score Input */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">QC Score (0-100)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={qcScore}
                                onChange={(e) => setQcScore(Number(e.target.value))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                                placeholder="0"
                            />
                        </div>

                        {/* Compliance Checklist */}
                        <div className="mb-5">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Compliance Checklist</label>
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                                {Object.entries(checklistItems).map(([item, checked]) => (
                                    <label key={item} className="flex items-center gap-2.5 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => setChecklistItems(prev => ({ ...prev, [item]: e.target.checked }))}
                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        />
                                        <span className="text-gray-600 text-sm">{item}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {Object.values(checklistItems).filter(v => v).length} / {Object.keys(checklistItems).length} completed
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="mb-5">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Remarks / Feedback</label>
                            <textarea
                                value={qcRemarks}
                                onChange={(e) => setQcRemarks(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-sm"
                                placeholder="Enter detailed feedback for the asset creator..."
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleQCSubmit('rejected')}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 border-2 border-red-400 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleQCSubmit('approved')}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Approve
                                </button>
                            </div>
                            <button
                                onClick={() => handleQCSubmit('rework')}
                                disabled={submitting}
                                className="w-full px-4 py-2.5 border-2 border-orange-400 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors disabled:opacity-50 text-sm"
                            >
                                Request Rework
                            </button>
                        </div>

                        {/* Audit Notice */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                All QC actions are logged with timestamp and user identity
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main List View
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin QC Asset Review</h1>
                        <p className="text-gray-500 mt-1">Review and approve assets submitted for quality control</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold uppercase tracking-wide">
                        Admin Only
                    </span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => onNavigate?.('assets')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Assets
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 ${isRefreshing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {viewMode === 'all' ? 'All Assets' :
                            viewMode === 'pending' ? 'Pending QC Review' :
                                viewMode === 'rework' ? 'Assets Requiring Rework' :
                                    viewMode === 'approved' ? 'Approved Assets' :
                                        'Rejected Assets'}
                    </h2>
                    <span className="text-sm text-gray-500">
                        {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Status Filter Tabs */}
                <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex gap-2 flex-wrap">
                        {([
                            { key: 'pending' as ViewMode, label: 'Pending', color: 'amber' },
                            { key: 'rework' as ViewMode, label: 'Rework', color: 'orange' },
                            { key: 'approved' as ViewMode, label: 'Approved', color: 'green' },
                            { key: 'rejected' as ViewMode, label: 'Rejected', color: 'red' },
                            { key: 'all' as ViewMode, label: 'All', color: 'gray' }
                        ]).map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setViewMode(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === tab.key
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {tab.label} ({statusCounts[tab.key]})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
                        <span className="text-gray-500">Loading assets...</span>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredAssets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Assets Found</h3>
                        <p className="text-gray-500 text-sm">No assets match the "{viewMode}" filter.</p>
                    </div>
                )}

                {/* Assets Table */}
                {!loading && filteredAssets.length > 0 && (
                    <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                        <table className="w-full" style={{ minWidth: 'max-content' }}>
                            <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Thumbnail</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Asset Name</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Submitted By</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Type</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Category</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Service</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">QC Status</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Rework #</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Submitted</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                                                {asset.thumbnail_url || asset.file_url ? (
                                                    <img src={asset.thumbnail_url || asset.file_url} alt={asset.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button onClick={() => handleOpenSidePanel(asset)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm text-left hover:underline">
                                                {asset.name}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-gray-700 text-sm">{getSubmitterName(asset)}</td>
                                        <td className="px-4 py-4">
                                            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">{getAssetTypeName(asset)}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{getAssetCategoryName(asset)}</span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-700 text-sm">{getLinkedServiceName(asset)}</td>
                                        <td className="px-4 py-4">{getQCStatusBadge(asset)}</td>
                                        <td className="px-4 py-4 text-center">
                                            {asset.rework_count && asset.rework_count > 0 ? (
                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                                    {asset.rework_count}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-gray-700 text-sm">{formatUploadDate(asset)}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenSidePanel(asset)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                                                    View
                                                </button>
                                                {(asset.status !== 'QC Approved' && asset.status !== 'QC Rejected' && asset.status !== 'Published') && (
                                                    <button onClick={() => handleReviewAsset(asset)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                                                        Review
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Side Panel */}
            {showSidePanel && sidePanelAsset && (
                <AssetDetailSidePanel asset={sidePanelAsset} isOpen={showSidePanel} onClose={handleCloseSidePanel} />
            )}
        </div>
    );
};

export default AdminQCAssetReviewView;

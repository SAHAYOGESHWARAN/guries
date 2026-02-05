import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import AssetDetailSidePanel from '../components/AssetDetailSidePanel';
import type { AssetLibraryItem, User, Service, Task, AssetCategoryMasterItem, AssetTypeMasterItem } from '../types';

type ViewMode = 'all' | 'pending' | 'rework' | 'approved' | 'rejected';

interface AssetQCViewProps {
    onNavigate?: (view: string, id?: number) => void;
}

const AssetQCView: React.FC<AssetQCViewProps> = ({ onNavigate }) => {
    const [selectedAsset, setSelectedAsset] = useState<AssetLibraryItem | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('all');
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

    // Use the useData hook for real-time data
    const { data: assetsForQC = [], loading: dataLoading, refresh: refreshAssets, update: updateAsset } = useData<AssetLibraryItem>('assetLibrary');
    
    // Transform API data to match frontend interface
    const transformedAssets = useMemo(() => {
        return assetsForQC.map(asset => ({
            ...asset,
            name: asset.name || asset.asset_name || 'Untitled Asset', // Map asset_name to name with fallback
        }));
    }, [assetsForQC]);
    
    const { data: users = [] } = useData<User>('users');
    const { data: services = [] } = useData<Service>('services');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: assetCategories = [] } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { data: assetTypes = [] } = useData<AssetTypeMasterItem>('asset-type-master');
    const { user, isAdmin, hasPermission } = useAuth();

    // Debug: Log assets data state (development only)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('[AssetQCView] Assets data:', {
                count: assetsForQC.length,
                loading: dataLoading,
                isAdmin,
                userId: user?.id,
                sample: assetsForQC[0] || null
            });
        }
    }, [assetsForQC, dataLoading, isAdmin, user]);

    // Create a memoized user lookup map for O(1) access instead of O(n) find operations
    const usersMap = useMemo(() => {
        const map = new Map<number, User>();
        users.forEach(u => map.set(u.id, u));
        return map;
    }, [users]);

    const canPerformQC = isAdmin || hasPermission('canPerformQC');

    // Only show loading on initial load, not during refresh
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    useEffect(() => {
        if (!dataLoading && !initialLoadDone) {
            setInitialLoadDone(true);
        }
    }, [dataLoading, initialLoadDone]);

    const loading = !initialLoadDone && dataLoading;

    // Helper: Get linked service name from Map Assets to Source Work
    const getLinkedServiceName = (asset: AssetLibraryItem): string => {
        const serviceId = asset.linked_service_id || (asset.linked_service_ids && asset.linked_service_ids[0]);
        if (!serviceId) return '-';
        const service = services.find(s => s.id === serviceId);
        return service?.service_name || '-';
    };

    // Helper: Get linked task name
    const getLinkedTaskName = (asset: AssetLibraryItem): string => {
        const taskId = asset.linked_task_id || asset.linked_task;
        if (!taskId) return '-';
        const task = tasks.find(t => t.id === taskId);
        return task?.name || (task as any)?.task_name || '-';
    };

    // Helper: Get designer/creator name from workflow configuration
    const getDesignerName = (asset: AssetLibraryItem): string => {
        const designerId = asset.designed_by || asset.created_by;
        if (!designerId) return '-';
        return usersMap.get(designerId)?.name || '-';
    };

    // Helper: Get asset type from Asset Type Master
    const getAssetTypeName = (asset: AssetLibraryItem): string => {
        if (!asset.asset_type) return '-';
        const found = assetTypes.find(at => at.asset_type_name?.toLowerCase() === asset.asset_type?.toLowerCase());
        return found?.asset_type_name || asset.asset_type;
    };

    // Helper: Get asset category from Asset Category Master
    const getAssetCategoryName = (asset: AssetLibraryItem): string => {
        if (!asset.asset_category) return '-';
        const found = assetCategories.find(cat => cat.category_name?.toLowerCase() === asset.asset_category?.toLowerCase());
        return found?.category_name || asset.asset_category;
    };

    // Helper: Get QC status badge - updates dynamically based on QC actions
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

    // Helper: Format upload date - uses submitted_at as primary, falls back to created_at
    const formatUploadDate = (asset: AssetLibraryItem): string => {
        const dateString = asset.submitted_at || asset.created_at;
        if (!dateString) return '-';
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    // Side panel handlers - opens asset side-view panel when clicking asset name
    const handleOpenSidePanel = (asset: AssetLibraryItem) => {
        setSidePanelAsset(asset);
        setShowSidePanel(true);
    };
    const handleCloseSidePanel = () => {
        setShowSidePanel(false);
        setSidePanelAsset(null);
    };

    // Refresh assets
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshAssets?.();
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    // Helper: Check if asset belongs to current user (for non-admin filtering)
    const isUserAsset = useCallback((asset: AssetLibraryItem): boolean => {
        if (!user) return false;
        return asset.submitted_by === user.id ||
            asset.created_by === user.id ||
            asset.designed_by === user.id;
    }, [user]);

    // Filter assets based on view mode and role
    const filteredAssets = useMemo(() => {
        // First filter by role - admins see all, non-admins see only their own
        let roleFiltered = isAdmin ? transformedAssets : transformedAssets.filter(isUserAsset);

        switch (viewMode) {
            case 'pending': return roleFiltered.filter(a => a.status === 'Pending QC Review' || a.status === 'Draft' || !a.status);
            case 'rework': return roleFiltered.filter(a => a.status === 'Rework Required' || a.qc_status === 'Rework');
            case 'approved': return roleFiltered.filter(a => a.status === 'QC Approved' || a.qc_status === 'Pass' || a.status === 'Published');
            case 'rejected': return roleFiltered.filter(a => a.status === 'QC Rejected' || a.qc_status === 'Fail');
            default: return roleFiltered;
        }
    }, [transformedAssets, viewMode, isAdmin, isUserAsset]);

    // Status counts for tabs (respecting role-based filtering)
    const statusCounts = useMemo(() => {
        const roleFiltered = isAdmin ? transformedAssets : transformedAssets.filter(isUserAsset);
        return {
            all: roleFiltered.length,
            pending: roleFiltered.filter(a => a.status === 'Pending QC Review' || a.status === 'Draft' || !a.status).length,
            rework: roleFiltered.filter(a => a.status === 'Rework Required' || a.qc_status === 'Rework').length,
            approved: roleFiltered.filter(a => a.status === 'QC Approved' || a.qc_status === 'Pass' || a.status === 'Published').length,
            rejected: roleFiltered.filter(a => a.status === 'QC Rejected' || a.qc_status === 'Fail').length,
        };
    }, [transformedAssets, isAdmin, isUserAsset]);

    // Check if non-admin has rework assets (for tab highlighting)
    const hasReworkAssets = !isAdmin && statusCounts.rework > 0;

    // ADMIN: Select asset for QC review - opens QC panel
    const handleReviewAsset = (asset: AssetLibraryItem) => {
        setSelectedAsset(asset);
        setQcScore(asset.qc_score || 0);
        setQcRemarks(asset.qc_remarks || '');
        // Set application-type specific checklist
        setChecklistItems(getChecklistForApplicationType(asset.application_type));
    };

    // ADMIN: Submit QC decision - auto-links to service page on approval
    const handleQCSubmit = async (decision: 'approved' | 'rejected' | 'rework') => {
        if (!selectedAsset || !user) {
            alert('No asset selected or user not logged in');
            return;
        }

        if (!canPerformQC) {
            alert('You do not have permission to perform QC reviews. Please switch to Admin role.');
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

                // Optimistically update the local asset record so the list reflects the new QC status immediately.
                try {
                    if (updateAsset && selectedAsset && selectedAsset.id) {
                        const updates: Partial<AssetLibraryItem> = {};
                        if (decision === 'approved') {
                            updates.qc_status = 'Pass';
                            updates.status = 'QC Approved';
                        } else if (decision === 'rejected') {
                            updates.qc_status = 'Fail';
                            updates.status = 'QC Rejected';
                        } else if (decision === 'rework') {
                            updates.qc_status = 'Rework';
                            updates.status = 'Rework Required';
                        }
                        updates.qc_score = qcScore || 0;
                        updates.qc_remarks = qcRemarks || '';
                        // Fire update (will attempt server sync and also update local state)
                        await updateAsset(selectedAsset.id, updates as any);
                    }
                } catch (e) {
                    console.warn('Optimistic update failed:', e);
                }

                alert(message);
                setSelectedAsset(null);
                setQcScore(0);
                setQcRemarks('');
                setChecklistItems(getChecklistForApplicationType('web'));
                handleRefresh();
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.message || 'Failed to submit QC review';
                const errorCode = errorData.code || 'UNKNOWN_ERROR';
                console.error('QC Submit failed:', { status: response.status, errorCode, errorMessage, errorData });
                alert(`Error (${response.status}): ${errorMessage}`);
            }
        } catch (error: any) {
            console.error('QC Submit error:', error);
            const errorMessage = error.message || error.error || 'Network error occurred';
            alert(`Failed to submit QC review: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    };

    // USER: Send asset to QC stage
    const handleSendToQC = async (asset: AssetLibraryItem) => {
        if (!confirm(`Send "${asset.name || asset.name}" to QC Review?`)) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            const res = await fetch(`${apiUrl}/assetLibrary/${asset.id}/submit-qc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submitted_by: user?.id,
                    seo_score: asset.seo_score,
                    grammar_score: asset.grammar_score
                })
            });
            if (res.ok) {
                alert('Asset submitted for QC review!');
                handleRefresh();
            } else {
                const errorData = await res.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.message || 'Unknown error';
                console.error('Send to QC failed:', { status: res.status, errorData });
                alert(`Failed to submit (${res.status}): ${errorMessage}`);
            }
        } catch (error: any) {
            console.error('Send to QC error:', error);
            const errorMessage = error.message || 'Network error occurred';
            alert(`Failed to submit: ${errorMessage}`);
        }
    };

    // USER: Resubmit asset after rework
    const handleResubmitForQC = async (asset: AssetLibraryItem) => {
        if (!confirm(`Resubmit "${asset.name || asset.name}" for QC review?`)) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            const res = await fetch(`${apiUrl}/assetLibrary/${asset.id}/submit-qc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submitted_by: user?.id,
                    rework_count: (asset.rework_count || 0) + 1,
                    seo_score: asset.seo_score,
                    grammar_score: asset.grammar_score
                })
            });
            if (res.ok) {
                alert('Asset resubmitted for QC!');
                handleRefresh();
            } else {
                const errorData = await res.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.message || 'Unknown error';
                console.error('Resubmit QC failed:', { status: res.status, errorData });
                alert(`Failed to resubmit (${res.status}): ${errorMessage}`);
            }
        } catch (error: any) {
            console.error('Resubmit QC error:', error);
            const errorMessage = error.message || 'Network error occurred';
            alert(`Failed to resubmit: ${errorMessage}`);
        }
    };


    // ==================== QC REVIEW DETAIL VIEW (ADMIN) ====================
    if (selectedAsset) {
        const linkedService = services.find(s => s.id === (selectedAsset.linked_service_id || selectedAsset.linked_service_ids?.[0]));

        return (
            <div className="p-6 bg-gray-100 min-h-screen">
                {/* Back Button */}
                <button onClick={() => setSelectedAsset(null)} className="mb-4 text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to List
                </button>

                <div className="flex gap-6">
                    {/* Left Panel - Asset Details */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">#{selectedAsset.id}</p>
                                <h1 className="text-2xl font-bold text-gray-900">{selectedAsset.name || selectedAsset.name}</h1>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                        {selectedAsset.application_type?.toUpperCase() || 'WEB'}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                        {getAssetTypeName(selectedAsset)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-xs mb-1">Proposed Service Link</p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {linkedService?.service_name || 'Oncology'} → {getAssetCategoryName(selectedAsset) || 'Treatment'}
                                </p>
                                <div className="flex items-center justify-end gap-1.5 mt-1">
                                    <svg className="w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs text-orange-500">Link Inactive (Pending QC)</span>
                                </div>
                            </div>
                        </div>

                        {/* Media Preview Box - loads from stored thumbnail URL */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 h-72 flex items-center justify-center mb-6">
                            {selectedAsset.thumbnail_url || selectedAsset.file_url ? (
                                <img src={selectedAsset.thumbnail_url || selectedAsset.file_url} alt={selectedAsset.name || selectedAsset.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                                <span className="text-gray-400 text-sm">No media attached</span>
                            )}
                        </div>

                        {/* Description & Repository */}
                        <div className="grid grid-cols-2 gap-8 mb-5">
                            <div>
                                <label className="text-rose-500 text-sm font-medium block mb-1">Description</label>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {selectedAsset.web_description || selectedAsset.seo_content_description || selectedAsset.smm_description || 'Article detailing new findings in cancer research.'}
                                </p>
                            </div>
                            <div>
                                <label className="text-rose-500 text-sm font-medium block mb-1">Repository</label>
                                <p className="text-gray-700 text-sm">{selectedAsset.repository || 'Web'}</p>
                            </div>
                        </div>

                        {/* URL Slug */}
                        <div className="mb-5">
                            <label className="text-rose-500 text-sm font-medium block mb-1">URL Slug</label>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                <span className="text-gray-700 text-sm">{selectedAsset.web_url || selectedAsset.seo_target_url || '/oncology/research-2024'}</span>
                            </div>
                        </div>

                        {/* Keywords */}
                        <div className="mb-5">
                            <label className="text-rose-500 text-sm font-medium block mb-2">Keywords</label>
                            <div className="flex flex-wrap gap-2">
                                {(selectedAsset.keywords?.length ? selectedAsset.keywords : []).map((kw, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-200">{kw}</span>
                                ))}
                                {(!selectedAsset.keywords || selectedAsset.keywords.length === 0) && (
                                    <span className="text-gray-400 text-sm">No keywords specified</span>
                                )}
                            </div>
                        </div>

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

                        {/* SEO & Grammar Scores */}
                        {(selectedAsset.seo_score || selectedAsset.grammar_score) && (
                            <div className="mb-5">
                                <label className="text-rose-500 text-sm font-medium block mb-2">AI Scores</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedAsset.seo_score !== undefined && selectedAsset.seo_score !== null && (
                                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-blue-600 font-medium mb-1">SEO Score</p>
                                            <p className={`text-xl font-bold ${selectedAsset.seo_score >= 80 ? 'text-green-600' : selectedAsset.seo_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                                {selectedAsset.seo_score}
                                            </p>
                                        </div>
                                    )}
                                    {selectedAsset.grammar_score !== undefined && selectedAsset.grammar_score !== null && (
                                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-purple-600 font-medium mb-1">Grammar Score</p>
                                            <p className={`text-xl font-bold ${selectedAsset.grammar_score >= 80 ? 'text-green-600' : selectedAsset.grammar_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                                {selectedAsset.grammar_score}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - QC Assessment (Admin assigns score and submits) */}
                    <div className="w-80 bg-white rounded-xl shadow-sm border-2 border-indigo-300 p-5">
                        <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-base font-bold text-gray-900">QC Assessment</h3>
                            </div>
                            {canPerformQC ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Admin</span>
                            ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">No Access</span>
                            )}
                        </div>

                        {!canPerformQC && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-amber-800 text-xs">Switch to Admin role to perform QC reviews.</p>
                            </div>
                        )}

                        {/* QC Score Input */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">QC Score (0-100)</label>
                            <input type="number" min="0" max="100" value={qcScore} onChange={(e) => setQcScore(Number(e.target.value))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base" placeholder="0" />
                        </div>

                        {/* Compliance Checklist */}
                        <div className="mb-5">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Compliance Checklist</label>
                            <div className="space-y-2.5">
                                {Object.entries(checklistItems).map(([item, checked]) => (
                                    <label key={item} className="flex items-center gap-2.5 cursor-pointer">
                                        <input type="checkbox" checked={checked} onChange={(e) => setChecklistItems(prev => ({ ...prev, [item]: e.target.checked }))}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        <span className="text-gray-600 text-sm">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="mb-5">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Remarks / Comments</label>
                            <textarea value={qcRemarks} onChange={(e) => setQcRemarks(e.target.value)} rows={3}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm" placeholder="Enter feedback here..." />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mb-3">
                            <button onClick={() => handleQCSubmit('rejected')} disabled={submitting}
                                className="flex-1 px-4 py-2.5 border-2 border-red-400 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                Reject
                            </button>
                            <button onClick={() => handleQCSubmit('approved')} disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Approve
                            </button>
                        </div>
                        <button onClick={() => handleQCSubmit('rework')} disabled={submitting}
                            className="w-full px-4 py-2 border border-orange-400 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors disabled:opacity-50 text-sm">
                            Send for Rework
                        </button>
                    </div>
                </div >
            </div >
        );
    }


    // ==================== MAIN LIST VIEW ====================
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Asset QC Review</h1>
                        <p className="text-gray-500 mt-1">
                            {canPerformQC ? 'Review and approve assets submitted for quality control' : 'View your assets and their QC status'}
                        </p>
                    </div>
                    {/* Role Badge */}
                    {isAdmin ? (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">Admin</span>
                    ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">User</span>
                    )}
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
                        className={`px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 ${isRefreshing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
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
                        {([{ key: 'all' as ViewMode, label: 'All' }, { key: 'pending' as ViewMode, label: 'Pending' }, { key: 'rework' as ViewMode, label: 'Rework' }, { key: 'approved' as ViewMode, label: 'Approved' }, { key: 'rejected' as ViewMode, label: 'Rejected' }]).map((tab) => {
                            const isReworkHighlighted = tab.key === 'rework' && hasReworkAssets && viewMode !== 'rework';
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setViewMode(tab.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === tab.key
                                        ? 'bg-indigo-600 text-white'
                                        : isReworkHighlighted
                                            ? 'bg-orange-100 text-orange-700 border-2 border-orange-400 animate-pulse'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    {tab.label} ({statusCounts[tab.key]})
                                    {isReworkHighlighted && (
                                        <span className="ml-1.5 inline-flex items-center justify-center w-2 h-2 bg-orange-500 rounded-full"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                        <span className="text-gray-500">Loading assets...</span>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredAssets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Assets Found</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            {viewMode === 'all'
                                ? 'No assets have been uploaded yet. Upload assets from the Assets page.'
                                : `No assets match the "${viewMode}" filter.`}
                        </p>
                        {viewMode === 'all' && (
                            <button
                                onClick={() => onNavigate?.('assets')}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Go to Assets
                            </button>
                        )}
                    </div>
                )}

                {/* Assets Table */}
                {!loading && filteredAssets.length > 0 && (
                    <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                        <table className="w-full" style={{ minWidth: 'max-content' }}>
                            <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '80px' }}>Thumbnail</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '150px' }}>Asset Name</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '120px' }}>Asset Type</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '120px' }}>Category</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '130px' }}>Content Type</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '140px' }}>Linked Service</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '130px' }}>Linked Task</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '110px' }}>QC Status</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '90px' }}>Version</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '120px' }}>Designer</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '120px' }}>Uploaded At</th>
                                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '80px' }}>Usage</th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '150px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                                                {asset.thumbnail_url || asset.file_url ? (
                                                    <img src={asset.thumbnail_url || asset.file_url} alt={asset.name || asset.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button onClick={() => handleOpenSidePanel(asset)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm text-left hover:underline whitespace-nowrap">{asset.name || asset.name}</button>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap"><span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">{getAssetTypeName(asset)}</span></td>
                                        <td className="px-4 py-4 whitespace-nowrap"><span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{getAssetCategoryName(asset)}</span></td>
                                        <td className="px-4 py-4 text-gray-700 text-sm whitespace-nowrap">{asset.content_type || '-'}</td>
                                        <td className="px-4 py-4 text-gray-700 text-sm whitespace-nowrap">{getLinkedServiceName(asset)}</td>
                                        <td className="px-4 py-4 text-gray-700 text-sm whitespace-nowrap">{getLinkedTaskName(asset)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">{getQCStatusBadge(asset)}</td>
                                        <td className="px-4 py-4 text-gray-700 text-sm whitespace-nowrap">{asset.version_number || 'v1.0'}</td>
                                        <td className="px-4 py-4 text-gray-700 text-sm whitespace-nowrap">{getDesignerName(asset)}</td>
                                        <td className="px-4 py-4 text-gray-700 text-sm whitespace-nowrap">{formatUploadDate(asset)}</td>
                                        <td className="px-4 py-4 text-center whitespace-nowrap">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                {asset.usage_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {canPerformQC ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleOpenSidePanel(asset)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">View</button>
                                                    {/* Show Review button for any asset that hasn't been approved or rejected */}
                                                    {(asset.status !== 'QC Approved' && asset.status !== 'QC Rejected' && asset.status !== 'Published' && asset.qc_status !== 'Pass' && asset.qc_status !== 'Fail') && (
                                                        <button onClick={() => handleReviewAsset(asset)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Review</button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleOpenSidePanel(asset)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">View</button>
                                                    {asset.status === 'Draft' && (
                                                        <button onClick={() => handleSendToQC(asset)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Send to QC</button>
                                                    )}
                                                    {asset.status === 'Rework Required' && (
                                                        <button onClick={() => handleResubmitForQC(asset)} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">Resubmit</button>
                                                    )}
                                                </div>
                                            )}
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

export default AssetQCView;

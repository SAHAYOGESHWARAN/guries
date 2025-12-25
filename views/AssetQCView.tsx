import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import CircularScore from '../components/CircularScore';
import AssetDetailSidePanel from '../components/AssetDetailSidePanel';
import type { AssetLibraryItem, User, Service, SubServiceItem, Task, AssetCategoryMasterItem, AssetTypeMasterItem } from '../types';

const AssetQCView: React.FC = () => {
    const [assetsForQC, setAssetsForQC] = useState<AssetLibraryItem[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<AssetLibraryItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Side panel state for viewing asset details
    const [sidePanelAsset, setSidePanelAsset] = useState<AssetLibraryItem | null>(null);
    const [showSidePanel, setShowSidePanel] = useState(false);

    // QC Form State
    const [qcScore, setQcScore] = useState<number>(0);
    const [qcRemarks, setQcRemarks] = useState('');
    const [checklistItems, setChecklistItems] = useState<{ [key: string]: boolean }>({});
    const [qcDecision, setQcDecision] = useState<'approved' | 'rejected' | 'rework' | ''>('');

    const { data: users = [] } = useData<User>('users');
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: assetCategories = [] } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { data: assetTypes = [] } = useData<AssetTypeMasterItem>('asset-type-master');
    const currentUser = { id: 1, role: 'admin', name: 'Current User' }; // TODO: Get from auth context

    // Helper functions to get linked entity names
    const getLinkedServiceName = (asset: AssetLibraryItem) => {
        const serviceId = asset.linked_service_id || (asset.linked_service_ids && asset.linked_service_ids[0]);
        if (!serviceId) return '-';
        const service = services.find(s => s.id === serviceId);
        return service?.service_name || '-';
    };

    const getLinkedTaskName = (asset: AssetLibraryItem) => {
        const taskId = asset.linked_task_id || asset.linked_task;
        if (!taskId) return '-';
        const task = tasks.find(t => t.id === taskId);
        return task?.name || '-';
    };

    const getDesignerName = (asset: AssetLibraryItem) => {
        if (!asset.designed_by) return '-';
        const user = users.find(u => u.id === asset.designed_by);
        return user?.name || '-';
    };

    const getAssetTypeName = (asset: AssetLibraryItem) => {
        // First try to match with asset type master
        if (asset.type) {
            const assetType = assetTypes.find(at =>
                at.asset_type_name?.toLowerCase() === asset.type?.toLowerCase()
            );
            if (assetType) return assetType.asset_type_name;
            return asset.type;
        }
        return '-';
    };

    const getAssetCategoryName = (asset: AssetLibraryItem) => {
        if (asset.asset_category) {
            const category = assetCategories.find(cat =>
                cat.category_name?.toLowerCase() === asset.asset_category?.toLowerCase()
            );
            if (category) return category.category_name;
            return asset.asset_category;
        }
        return '-';
    };

    const getQCStatusBadge = (asset: AssetLibraryItem) => {
        const status = asset.qc_status || (asset.status === 'Pending QC Review' ? 'Pending' : asset.status);
        switch (status) {
            case 'Pass':
            case 'QC Approved':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Pass</span>;
            case 'Fail':
            case 'QC Rejected':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Fail</span>;
            case 'Rework':
            case 'Rework Required':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Rework</span>;
            case 'Pending':
            case 'Pending QC Review':
            default:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending</span>;
        }
    };

    // Handle opening asset side panel
    const handleOpenSidePanel = (asset: AssetLibraryItem) => {
        setSidePanelAsset(asset);
        setShowSidePanel(true);
    };

    const handleCloseSidePanel = () => {
        setShowSidePanel(false);
        setSidePanelAsset(null);
    };

    // Application-specific quality checklists
    const getQualityChecklist = (applicationType: string) => {
        switch (applicationType?.toLowerCase()) {
            case 'seo':
                return [
                    'Brand Compliance',
                    'Technical Specs Met',
                    'Legal / Regulatory Check',
                    'Tone of Voice',
                    'Meta title & description optimized with primary keyword',
                    'H1, H2 structure correctly applied and keyword-aligned',
                    'Image alt text optimized and relevant',
                    'Page speed and mobile responsiveness verified',
                    'Internal links added and all links functioning'
                ];
            case 'web':
                return [
                    'Brand Compliance',
                    'Technical Specs Met',
                    'Legal / Regulatory Check',
                    'Tone of Voice',
                    'All pages load smoothly without errors',
                    'Forms, buttons, and links fully functional',
                    'Website responsive across all devices',
                    'Visual consistency (fonts, spacing, colors) maintained',
                    'SSL active and no security warnings'
                ];
            case 'smm':
                return [
                    'Brand Compliance',
                    'Technical Specs Met',
                    'Legal / Regulatory Check',
                    'Tone of Voice',
                    'Caption aligned with brand tone and error-free',
                    'Correct post dimensions (image/video) used for each platform',
                    'Hashtags relevant and optimized',
                    'Visual/creative matches brand guidelines',
                    'All links, tags, and CTAs verified and functioning'
                ];
            default:
                return [
                    'Brand Compliance',
                    'Technical Specs Met',
                    'Legal / Regulatory Check',
                    'Tone of Voice',
                    'Content quality meets standards',
                    'Brand guidelines followed',
                    'Technical requirements met',
                    'All links and media functional',
                    'Overall presentation professional'
                ];
        }
    };

    // Fetch assets pending QC
    const fetchAssetsForQC = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/assetLibrary/qc/pending');
            if (response.ok) {
                const data = await response.json();
                setAssetsForQC(data);
            }
        } catch (error) {
            console.error('Failed to fetch assets for QC:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssetsForQC();
    }, []);

    const handleAssetSelect = (asset: AssetLibraryItem) => {
        setSelectedAsset(asset);
        setQcScore(0);
        setQcRemarks('');
        setQcDecision('');

        // Initialize checklist based on application type
        const checklist = getQualityChecklist(asset.application_type || '');
        const initialChecklist: { [key: string]: boolean } = {};
        checklist.forEach(item => {
            initialChecklist[item] = false;
        });
        setChecklistItems(initialChecklist);
    };

    const handleQCSubmit = async (decision: 'approved' | 'rejected' | 'rework') => {
        if (!selectedAsset) return;

        if (qcScore < 0 || qcScore > 100) {
            alert('QC Score must be between 0 and 100');
            return;
        }

        // Calculate checklist completion percentage
        const totalItems = Object.keys(checklistItems).length;
        const completedItems = Object.values(checklistItems).filter(Boolean).length;
        const checklistCompletionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/v1/assetLibrary/${selectedAsset.id}/qc-review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    qc_score: qcScore,
                    qc_remarks: qcRemarks,
                    qc_decision: decision,
                    qc_reviewer_id: currentUser.id,
                    user_role: currentUser.role,
                    checklist_completion: checklistCompletionPercentage >= 80, // 80% threshold
                    checklist_items: checklistItems
                })
            });

            if (response.ok) {
                const actionText = decision === 'approved' ? 'approved' :
                    decision === 'rejected' ? 'rejected' : 'sent for rework';
                alert(`Asset ${actionText} successfully!`);
                setSelectedAsset(null);
                fetchAssetsForQC(); // Refresh the list
            } else {
                const error = await response.json();
                alert(`Failed to submit QC review: ${error.error}`);
            }
        } catch (error) {
            console.error('QC submission failed:', error);
            alert('Failed to submit QC review');
        } finally {
            setSubmitting(false);
        }
    };

    const getSubmitterName = (submittedBy?: number) => {
        if (!submittedBy) return 'Unknown';
        const user = users.find(u => u.id === submittedBy);
        return user?.name || `User ${submittedBy}`;
    };

    const handleUserEdit = (asset: AssetLibraryItem) => {
        // Redirect to asset edit form or open edit modal
        alert(`Edit functionality for asset "${asset.name}" would be implemented here. This would redirect to the asset edit form.`);
    };

    const handleUserDelete = async (asset: AssetLibraryItem) => {
        if (!confirm(`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/assetLibrary/${asset.id}/qc-delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_role: currentUser.role,
                    user_id: currentUser.id
                })
            });

            if (response.ok) {
                alert('Asset deleted successfully!');
                fetchAssetsForQC(); // Refresh the list
            } else {
                const error = await response.json();
                alert(`Failed to delete asset: ${error.error}`);
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete asset');
        }
    };

    if (selectedAsset) {
        return (
            <div className="h-full flex flex-col w-full p-6 overflow-hidden">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-sm font-medium text-slate-500">#{selectedAsset.id}</span>
                                <h2 className="text-lg font-bold text-slate-900">{selectedAsset.name}</h2>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${selectedAsset.application_type === 'web' ? 'bg-blue-100 text-blue-800' :
                                        selectedAsset.application_type === 'seo' ? 'bg-green-100 text-green-800' :
                                            selectedAsset.application_type === 'smm' ? 'bg-purple-100 text-purple-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {selectedAsset.application_type?.toUpperCase() || 'N/A'}
                                    </span>
                                    <span className="text-slate-400">•</span>
                                    <span>Document</span>
                                </div>
                                <div className="text-slate-400">•</div>
                                <div>
                                    Submitted by {getSubmitterName(selectedAsset.submitted_by)} • {selectedAsset.submitted_at ? new Date(selectedAsset.submitted_at).toLocaleDateString() : 'Unknown date'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedAsset(null)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 border-2 border-slate-300 rounded-lg hover:bg-white transition-colors"
                        >
                            ← Back to List
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Asset Information - Read Only */}
                        <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Asset Information (Read-Only)
                            </h3>

                            {/* Proposed Service Link */}
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span className="text-sm font-medium text-blue-800">
                                            Proposed Service Link
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-slate-900">Oncology → Treatment</div>
                                        <div className="flex items-center gap-1 text-xs text-orange-600">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Link Inactive (Pending QC)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Linking Status */}
                            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-slate-700">
                                        Service Linking Status: {selectedAsset.linking_active ?
                                            <span className="text-green-600">Active (Asset can be linked to services)</span> :
                                            <span className="text-orange-600">Inactive (Linking will activate after QC approval)</span>
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-bold text-slate-700">Name:</span>
                                    <p className="text-slate-900">{selectedAsset.name}</p>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-700">Type:</span>
                                    <p className="text-slate-900">{selectedAsset.type}</p>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-700">Application:</span>
                                    <p className="text-slate-900 uppercase">{selectedAsset.application_type}</p>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-700">Repository:</span>
                                    <p className="text-slate-900">{selectedAsset.repository}</p>
                                </div>
                            </div>

                            {/* AI Scores Display */}
                            {(selectedAsset.seo_score || selectedAsset.grammar_score) && (
                                <div className="mt-6">
                                    <h4 className="font-bold text-slate-700 mb-4">AI Quality Scores</h4>
                                    <div className="flex justify-center gap-8">
                                        {selectedAsset.seo_score && (
                                            <CircularScore
                                                score={selectedAsset.seo_score}
                                                label="SEO Score"
                                                size="md"
                                            />
                                        )}
                                        {selectedAsset.grammar_score && (
                                            <CircularScore
                                                score={selectedAsset.grammar_score}
                                                label="Grammar Score"
                                                size="md"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Content Preview */}
                            {selectedAsset.application_type === 'web' && (
                                <div className="mt-4 space-y-3">
                                    <h4 className="font-bold text-slate-700">Web Content:</h4>
                                    {selectedAsset.web_title && (
                                        <div>
                                            <span className="text-xs font-bold text-slate-600">Title:</span>
                                            <p className="text-sm text-slate-900">{selectedAsset.web_title}</p>
                                        </div>
                                    )}
                                    {selectedAsset.web_description && (
                                        <div>
                                            <span className="text-xs font-bold text-slate-600">Description:</span>
                                            <p className="text-sm text-slate-900">{selectedAsset.web_description}</p>
                                        </div>
                                    )}
                                    {selectedAsset.web_keywords && (
                                        <div>
                                            <span className="text-xs font-bold text-slate-600">Keywords:</span>
                                            <p className="text-sm text-slate-900">{selectedAsset.web_keywords}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedAsset.application_type === 'smm' && (
                                <div className="mt-4 space-y-3">
                                    <h4 className="font-bold text-slate-700">SMM Content:</h4>
                                    <div>
                                        <span className="text-xs font-bold text-slate-600">Platform:</span>
                                        <p className="text-sm text-slate-900">{selectedAsset.smm_platform}</p>
                                    </div>
                                    {selectedAsset.smm_description && (
                                        <div>
                                            <span className="text-xs font-bold text-slate-600">Description:</span>
                                            <p className="text-sm text-slate-900">{selectedAsset.smm_description}</p>
                                        </div>
                                    )}
                                    {selectedAsset.smm_hashtags && (
                                        <div>
                                            <span className="text-xs font-bold text-slate-600">Hashtags:</span>
                                            <p className="text-sm text-slate-900">{selectedAsset.smm_hashtags}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Media Section */}
                            <div className="mt-6 p-4 border-2 border-dashed border-slate-200 rounded-lg text-center">
                                <svg className="w-12 h-12 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-slate-500 text-sm">No media attached</p>
                            </div>

                            {/* Additional Asset Details */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-2">Description</h4>
                                    <p className="text-sm text-slate-600">
                                        {selectedAsset.web_description || selectedAsset.smm_description || 'Article detailing new findings in cancer research.'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-2">Repository</h4>
                                    <p className="text-sm text-slate-600">{selectedAsset.repository || 'Web'}</p>
                                </div>
                            </div>

                            {/* URL Slug */}
                            <div className="mt-4">
                                <h4 className="font-bold text-slate-700 mb-2">URL Slug</h4>
                                <div className="flex items-center gap-2 text-sm">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                    </svg>
                                    <span className="text-slate-600">/oncology/research-2024</span>
                                </div>
                            </div>

                            {/* Keywords */}
                            {(selectedAsset.web_keywords || selectedAsset.smm_hashtags) && (
                                <div className="mt-4">
                                    <h4 className="font-bold text-slate-700 mb-2">Keywords</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedAsset.web_keywords || selectedAsset.smm_hashtags || 'cancer, research, medical')
                                            .split(',')
                                            .map((keyword, index) => (
                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {keyword.trim()}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* QC Assessment Panel */}
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                QC Assessment
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        QC Score (0-100) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={qcScore}
                                        onChange={(e) => setQcScore(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                        placeholder="Enter QC score (0-100)"
                                    />
                                </div>

                                {/* Compliance Checklist */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">
                                        Compliance Checklist
                                    </label>
                                    <div className="space-y-2 bg-white rounded-lg border-2 border-slate-200 p-4">
                                        {getQualityChecklist(selectedAsset.application_type || '').map((item, index) => (
                                            <label key={index} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={checklistItems[item] || false}
                                                    onChange={(e) => setChecklistItems(prev => ({
                                                        ...prev,
                                                        [item]: e.target.checked
                                                    }))}
                                                    className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 mt-0.5"
                                                />
                                                <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
                                            </label>
                                        ))}
                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600">Completion Progress:</span>
                                                <span className={`font-bold ${Object.values(checklistItems).filter(Boolean).length / Object.keys(checklistItems).length >= 0.8 ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {Object.values(checklistItems).filter(Boolean).length} / {Object.keys(checklistItems).length} items
                                                    ({Math.round((Object.values(checklistItems).filter(Boolean).length / Object.keys(checklistItems).length) * 100)}%)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Remarks / Comments
                                    </label>
                                    <textarea
                                        value={qcRemarks}
                                        onChange={(e) => setQcRemarks(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                        placeholder="Enter your QC remarks and feedback..."
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        QC Decision *
                                    </label>
                                    <div className="flex gap-4 flex-wrap">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="qc_decision"
                                                value="approved"
                                                checked={qcDecision === 'approved'}
                                                onChange={(e) => setQcDecision(e.target.value as 'approved')}
                                                className="w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500"
                                            />
                                            <span className="text-sm font-bold text-green-700">Approve</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="qc_decision"
                                                value="rejected"
                                                checked={qcDecision === 'rejected'}
                                                onChange={(e) => setQcDecision(e.target.value as 'rejected')}
                                                className="w-4 h-4 text-red-600 border-slate-300 focus:ring-red-500"
                                            />
                                            <span className="text-sm font-bold text-red-700">Reject</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="qc_decision"
                                                value="rework"
                                                checked={qcDecision === 'rework'}
                                                onChange={(e) => setQcDecision(e.target.value as 'rework')}
                                                className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500"
                                            />
                                            <span className="text-sm font-bold text-orange-700">Rework</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-purple-200">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleQCSubmit('rejected')}
                                            disabled={submitting || qcScore < 0 || qcScore > 100}
                                            className="flex-1 py-3 px-6 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            {submitting ? 'Rejecting...' : 'Reject'}
                                        </button>
                                        <button
                                            onClick={() => handleQCSubmit('approved')}
                                            disabled={submitting || qcScore < 0 || qcScore > 100}
                                            className="flex-1 py-3 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {submitting ? (
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Approving...
                                                </div>
                                            ) : (
                                                'Approve'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="h-full flex flex-col w-full p-6 overflow-hidden">
            <div className="flex justify-between items-start flex-shrink-0 w-full mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quality Control</h1>
                    <p className="text-slate-600 text-sm mt-1">Review and approve assets submitted for quality control</p>
                </div>
                <button
                    onClick={fetchAssetsForQC}
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Pending QC Review</h2>
                    <p className="text-sm text-slate-600">
                        {loading ? 'Loading...' : 'Select an item to start the quality control process.'}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <svg className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-slate-600">Loading assets for QC review...</p>
                            </div>
                        </div>
                    ) : assetsForQC.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <h3 className="text-lg font-bold text-slate-700 mb-2">No Assets for QC Review</h3>
                                <p className="text-slate-500">All assets have been reviewed or none have been submitted yet.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Thumbnail</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Asset Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Asset Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Asset Category</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Content Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Linked Service</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Linked Task</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">QC Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Version</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Designer</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Uploaded At</th>
                                        <th className="text-center py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Usage Count</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">Review Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assetsForQC.map((asset) => (
                                        <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            {/* Thumbnail */}
                                            <td className="py-3 px-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                                                    {asset.thumbnail_url ? (
                                                        <img
                                                            src={asset.thumbnail_url}
                                                            alt={asset.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Asset Name - Clickable to open side panel */}
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => handleOpenSidePanel(asset)}
                                                    className="text-left hover:text-indigo-600 transition-colors group"
                                                >
                                                    <p className="font-medium text-slate-900 group-hover:text-indigo-600 text-sm">{asset.name}</p>
                                                    <p className="text-xs text-slate-500">#{asset.id}</p>
                                                </button>
                                            </td>

                                            {/* Asset Type */}
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-700">{getAssetTypeName(asset)}</span>
                                            </td>

                                            {/* Asset Category */}
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-700">{getAssetCategoryName(asset)}</span>
                                            </td>

                                            {/* Content Type */}
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-700">{asset.content_type || '-'}</span>
                                            </td>

                                            {/* Linked Service */}
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-700">{getLinkedServiceName(asset)}</span>
                                            </td>

                                            {/* Linked Task */}
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-700">{getLinkedTaskName(asset)}</span>
                                            </td>

                                            {/* QC Status */}
                                            <td className="py-3 px-4">
                                                {getQCStatusBadge(asset)}
                                            </td>

                                            {/* Version */}
                                            <td className="py-3 px-4">
                                                <span className="text-sm font-medium text-slate-700">{asset.version_number || 'v1.0'}</span>
                                            </td>

                                            {/* Designer */}
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-700">{getDesignerName(asset)}</span>
                                            </td>

                                            {/* Uploaded At */}
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-600">
                                                    {asset.submitted_at || asset.created_at ? new Date(asset.submitted_at || asset.created_at || '').toLocaleDateString('en-US', {
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        year: 'numeric'
                                                    }) : '-'}
                                                </span>
                                            </td>

                                            {/* Usage Count */}
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                                                    {(asset as any).usage_count || 0}
                                                </span>
                                            </td>

                                            {/* Review Action */}
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2 flex-wrap">
                                                    {/* View button - always visible */}
                                                    <button
                                                        onClick={() => handleOpenSidePanel(asset)}
                                                        className="text-slate-600 hover:text-slate-800 font-medium text-xs px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
                                                    >
                                                        View
                                                    </button>

                                                    {/* Admin actions */}
                                                    {currentUser.role === 'admin' && (
                                                        <>
                                                            {asset.status === 'Pending QC Review' && (
                                                                <button
                                                                    onClick={() => handleAssetSelect(asset)}
                                                                    className="text-purple-600 hover:text-purple-800 font-medium text-xs px-2.5 py-1.5 rounded border border-purple-200 hover:bg-purple-50 transition-colors"
                                                                >
                                                                    Send to QC
                                                                </button>
                                                            )}
                                                            {asset.status === 'Rework Required' && (
                                                                <button
                                                                    onClick={() => handleAssetSelect(asset)}
                                                                    className="text-orange-600 hover:text-orange-800 font-medium text-xs px-2.5 py-1.5 rounded border border-orange-200 hover:bg-orange-50 transition-colors"
                                                                >
                                                                    Rework
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleAssetSelect(asset)}
                                                                className="text-green-600 hover:text-green-800 font-medium text-xs px-2.5 py-1.5 rounded border border-green-200 hover:bg-green-50 transition-colors"
                                                            >
                                                                Approve
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* User actions */}
                                                    {currentUser.role === 'user' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUserEdit(asset)}
                                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2.5 py-1.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleUserDelete(asset)}
                                                                className="text-red-600 hover:text-red-800 font-medium text-xs px-2.5 py-1.5 rounded border border-red-200 hover:bg-red-50 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
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

                {/* Pagination Footer */}
                {assetsForQC.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                            Showing <span className="font-semibold text-slate-900">{assetsForQC.length}</span> {assetsForQC.length === 1 ? 'asset' : 'assets'}
                        </span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-white transition-colors">
                                Previous
                            </button>
                            <button className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-white transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div >

            {/* Asset Detail Side Panel */}
            {sidePanelAsset && (
                <AssetDetailSidePanel
                    asset={sidePanelAsset}
                    isOpen={showSidePanel}
                    onClose={handleCloseSidePanel}
                    onEdit={(asset) => {
                        handleCloseSidePanel();
                        handleUserEdit(asset);
                    }}
                />
            )}
        </div >
    );
};

export default AssetQCView;
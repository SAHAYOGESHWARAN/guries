import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import CircularScore from '../components/CircularScore';
import type { AssetLibraryItem, User } from '../types';

const AssetQCView: React.FC = () => {
    const [assetsForQC, setAssetsForQC] = useState<AssetLibraryItem[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<AssetLibraryItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // QC Form State
    const [qcScore, setQcScore] = useState<number>(0);
    const [qcRemarks, setQcRemarks] = useState('');
    const [checklistItems, setChecklistItems] = useState<{ [key: string]: boolean }>({});
    const [qcDecision, setQcDecision] = useState<'approved' | 'rejected' | 'rework' | ''>('');

    const { data: users = [] } = useData<User>('users');

    // Application-specific quality checklists
    const getQualityChecklist = (applicationType: string) => {
        switch (applicationType?.toLowerCase()) {
            case 'seo':
                return [
                    'Meta title & description optimized with primary keyword',
                    'H1, H2 structure correctly applied and keyword-aligned',
                    'Image alt text optimized and relevant',
                    'Page speed and mobile responsiveness verified',
                    'Internal links added and all links functioning'
                ];
            case 'web':
                return [
                    'All pages load smoothly without errors',
                    'Forms, buttons, and links fully functional',
                    'Website responsive across all devices',
                    'Visual consistency (fonts, spacing, colors) maintained',
                    'SSL active and no security warnings'
                ];
            case 'smm':
                return [
                    'Caption aligned with brand tone and error-free',
                    'Correct post dimensions (image/video) used for each platform',
                    'Hashtags relevant and optimized',
                    'Visual/creative matches brand guidelines',
                    'All links, tags, and CTAs verified and functioning'
                ];
            default:
                return [
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

    const handleQCSubmit = async () => {
        if (!selectedAsset || !qcDecision) return;

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
                    qc_decision: qcDecision,
                    qc_reviewer_id: 1, // TODO: Get from auth context
                    checklist_completion: checklistCompletionPercentage >= 80, // 80% threshold
                    checklist_items: checklistItems
                })
            });

            if (response.ok) {
                const actionText = qcDecision === 'approved' ? 'approved' :
                    qcDecision === 'rejected' ? 'rejected' : 'sent for rework';
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

    if (selectedAsset) {
        return (
            <div className="h-full flex flex-col w-full p-6 overflow-hidden">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">QC Review - {selectedAsset.name}</h2>
                            <p className="text-slate-600 text-sm mt-0.5">
                                Submitted by {getSubmitterName(selectedAsset.submitted_by)} • {selectedAsset.submitted_at ? new Date(selectedAsset.submitted_at).toLocaleDateString() : 'Unknown date'}
                            </p>
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
                        </div>

                        {/* QC Input Fields */}
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                QC Review
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

                                {/* Application-specific Quality Checklist */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">
                                        Quality Checklist - {selectedAsset.application_type?.toUpperCase()} Application
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
                                    <button
                                        onClick={handleQCSubmit}
                                        disabled={submitting || !qcDecision || qcScore < 0 || qcScore > 100}
                                        className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all ${submitting || !qcDecision || qcScore < 0 || qcScore > 100
                                            ? 'bg-slate-400 cursor-not-allowed'
                                            : qcDecision === 'approved'
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : qcDecision === 'rejected'
                                                    ? 'bg-red-600 hover:bg-red-700'
                                                    : qcDecision === 'rework'
                                                        ? 'bg-orange-600 hover:bg-orange-700'
                                                        : 'bg-slate-400'
                                            }`}
                                    >
                                        {submitting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </div>
                                        ) : (
                                            `Submit Review - ${qcDecision === 'approved' ? 'APPROVE' : qcDecision === 'rejected' ? 'REJECT' : qcDecision === 'rework' ? 'REWORK' : 'SELECT DECISION'}`
                                        )}
                                    </button>
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
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Asset QC Review</h1>
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
                <div className="px-6 py-3 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <p className="text-sm text-slate-700 font-medium">
                        {loading ? 'Loading...' : `${assetsForQC.length} assets pending QC review`}
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
                                        <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">ID</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Title</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Type</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Category</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Linked Services</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Status</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Reworks</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Created At</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Scores (AI)</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assetsForQC.map((asset, index) => (
                                        <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-4 px-4 text-sm text-slate-600">{index + 1}</td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">{asset.name}</p>
                                                    <p className="text-xs text-slate-500">{asset.asset_category || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${asset.application_type === 'web' ? 'bg-blue-100 text-blue-800' :
                                                    asset.application_type === 'seo' ? 'bg-green-100 text-green-800' :
                                                        asset.application_type === 'smm' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {asset.application_type?.toUpperCase() || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">{asset.asset_category || 'what science can do'}</td>
                                            <td className="py-4 px-4 text-sm">
                                                {asset.linked_service_ids && asset.linked_service_ids.length > 0 ? (
                                                    <span className="text-slate-900">Oncology → Treatment</span>
                                                ) : (
                                                    <span className="text-slate-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${asset.status === 'Pending QC Review'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : asset.status === 'Rework Required'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {asset.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-center">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${(asset.rework_count || 0) > 0
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {asset.rework_count || 0}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                {asset.submitted_at ? new Date(asset.submitted_at).toLocaleDateString('en-US', {
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                                }) : 'N/A'}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex gap-1">
                                                    {asset.seo_score && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            SEO: {asset.seo_score}
                                                        </span>
                                                    )}
                                                    {asset.grammar_score && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            G: {asset.grammar_score}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => handleAssetSelect(asset)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};

export default AssetQCView;
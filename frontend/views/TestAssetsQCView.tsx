import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface TestAsset {
    id: number;
    name: string;
    type: string;
    application_type: 'web' | 'seo' | 'smm';
    status: string;
    qc_status?: string;
    seo_score: number;
    grammar_score: number;
    submitted_by: number;
    created_at: string;
    description: string;
    thumbnail_url?: string;
}

interface QCReviewData {
    qc_score: number;
    qc_remarks: string;
    qc_decision: 'approved' | 'rejected' | 'rework';
    checklist_items: { [key: string]: boolean };
}

const TestAssetsQCView: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [testAssets, setTestAssets] = useState<TestAsset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<TestAsset | null>(null);
    const [qcData, setQcData] = useState<QCReviewData>({
        qc_score: 0,
        qc_remarks: '',
        qc_decision: 'approved',
        checklist_items: {
            'Brand Compliance': false,
            'Technical Specs Met': false,
            'Content Quality': false,
            'SEO Optimization': false,
            'Legal / Regulatory Check': false,
            'Tone of Voice': false
        }
    });
    const [submitting, setSubmitting] = useState(false);
    const [approvedAssets, setApprovedAssets] = useState<number[]>([]);
    const [rejectedAssets, setRejectedAssets] = useState<number[]>([]);
    const [reworkAssets, setReworkAssets] = useState<number[]>([]);

    // Initialize test assets
    useEffect(() => {
        const assets: TestAsset[] = [
            {
                id: 1,
                name: 'Oncology Treatment Guide',
                type: 'Article',
                application_type: 'web',
                status: 'Pending QC Review',
                seo_score: 85,
                grammar_score: 92,
                submitted_by: 2,
                created_at: new Date().toISOString(),
                description: 'Comprehensive guide on modern oncology treatments and therapies',
                thumbnail_url: 'https://via.placeholder.com/400x300?text=Oncology+Guide'
            },
            {
                id: 2,
                name: 'Cardiology SEO Asset',
                type: 'Blog Post',
                application_type: 'seo',
                status: 'Pending QC Review',
                seo_score: 78,
                grammar_score: 88,
                submitted_by: 3,
                created_at: new Date().toISOString(),
                description: 'SEO-optimized content for cardiology services',
                thumbnail_url: 'https://via.placeholder.com/400x300?text=Cardiology+SEO'
            },
            {
                id: 3,
                name: 'Social Media Campaign',
                type: 'Social Post',
                application_type: 'smm',
                status: 'Pending QC Review',
                seo_score: 72,
                grammar_score: 95,
                submitted_by: 4,
                created_at: new Date().toISOString(),
                description: 'Engaging social media content for healthcare awareness',
                thumbnail_url: 'https://via.placeholder.com/400x300?text=Social+Campaign'
            },
            {
                id: 4,
                name: 'Neurology Research Paper',
                type: 'Research',
                application_type: 'web',
                status: 'Pending QC Review',
                seo_score: 88,
                grammar_score: 91,
                submitted_by: 5,
                created_at: new Date().toISOString(),
                description: 'Latest findings in neurology research and treatment',
                thumbnail_url: 'https://via.placeholder.com/400x300?text=Neurology+Research'
            },
            {
                id: 5,
                name: 'Dermatology Service Page',
                type: 'Service Page',
                application_type: 'web',
                status: 'Pending QC Review',
                seo_score: 82,
                grammar_score: 89,
                submitted_by: 6,
                created_at: new Date().toISOString(),
                description: 'Comprehensive dermatology service page with treatment options',
                thumbnail_url: 'https://via.placeholder.com/400x300?text=Dermatology+Service'
            }
        ];
        setTestAssets(assets);
    }, []);

    const handleSelectAsset = (asset: TestAsset) => {
        setSelectedAsset(asset);
        setQcData({
            qc_score: 0,
            qc_remarks: '',
            qc_decision: 'approved',
            checklist_items: {
                'Brand Compliance': false,
                'Technical Specs Met': false,
                'Content Quality': false,
                'SEO Optimization': false,
                'Legal / Regulatory Check': false,
                'Tone of Voice': false
            }
        });
    };

    const handleChecklistChange = (item: string, checked: boolean) => {
        setQcData(prev => ({
            ...prev,
            checklist_items: {
                ...prev.checklist_items,
                [item]: checked
            }
        }));
    };

    const handleSubmitQC = async () => {
        if (!selectedAsset || !user) {
            alert('No asset selected or user not logged in');
            return;
        }

        if (!isAdmin) {
            alert('Only admins can perform QC reviews');
            return;
        }

        setSubmitting(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            const response = await fetch(`${apiUrl}/assetLibrary/${selectedAsset.id}/qc-review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    qc_score: qcData.qc_score || 0,
                    qc_remarks: qcData.qc_remarks || '',
                    qc_decision: qcData.qc_decision,
                    qc_reviewer_id: user.id,
                    user_role: user.role,
                    checklist_items: qcData.checklist_items,
                    checklist_completion: Object.values(qcData.checklist_items).every(v => v),
                    linking_active: qcData.qc_decision === 'approved'
                })
            });

            if (response.ok) {
                const message = qcData.qc_decision === 'approved'
                    ? 'Asset approved successfully!'
                    : qcData.qc_decision === 'rework'
                        ? 'Asset sent for rework!'
                        : 'Asset rejected!';

                // Track approval status
                if (qcData.qc_decision === 'approved') {
                    setApprovedAssets([...approvedAssets, selectedAsset.id]);
                } else if (qcData.qc_decision === 'rejected') {
                    setRejectedAssets([...rejectedAssets, selectedAsset.id]);
                } else {
                    setReworkAssets([...reworkAssets, selectedAsset.id]);
                }

                alert(message);
                setSelectedAsset(null);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('QC error:', errorData);
                alert(`Error: ${errorData.error || 'Failed to submit QC review'}`);
            }
        } catch (error: any) {
            console.error('QC Submit error:', error);
            alert(`Failed to submit QC review: ${error.message || 'Network error'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (assetId: number) => {
        if (approvedAssets.includes(assetId)) {
            return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Approved</span>;
        }
        if (rejectedAssets.includes(assetId)) {
            return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Rejected</span>;
        }
        if (reworkAssets.includes(assetId)) {
            return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">Rework</span>;
        }
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">Pending</span>;
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
                    <p className="text-gray-600">This test page is restricted to admin users only.</p>
                </div>
            </div>
        );
    }

    if (selectedAsset) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen">
                <button
                    onClick={() => setSelectedAsset(null)}
                    className="mb-4 text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to List
                </button>

                <div className="flex gap-6">
                    {/* Asset Details */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">#{selectedAsset.id}</p>
                                <h1 className="text-2xl font-bold text-gray-900">{selectedAsset.name}</h1>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                        {selectedAsset.application_type.toUpperCase()}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                        {selectedAsset.type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Media Preview */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 h-72 flex items-center justify-center mb-6">
                            {selectedAsset.thumbnail_url ? (
                                <img src={selectedAsset.thumbnail_url} alt={selectedAsset.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                                <span className="text-gray-400 text-sm">No media attached</span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-5">
                            <label className="text-rose-500 text-sm font-medium block mb-1">Description</label>
                            <p className="text-gray-700 text-sm leading-relaxed">{selectedAsset.description}</p>
                        </div>

                        {/* AI Scores */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="text-2xl font-bold text-blue-600">{selectedAsset.seo_score}</div>
                                <div className="text-xs text-blue-600">SEO Score</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                <div className="text-2xl font-bold text-green-600">{selectedAsset.grammar_score}</div>
                                <div className="text-xs text-green-600">Grammar Score</div>
                            </div>
                        </div>
                    </div>

                    {/* QC Assessment Panel */}
                    <div className="w-96 bg-white rounded-xl shadow-sm border-2 border-indigo-300 p-5">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-base font-bold text-gray-900">QC Assessment</h3>
                        </div>

                        {/* QC Score */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">QC Score (0-100)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={qcData.qc_score}
                                onChange={(e) => setQcData({ ...qcData, qc_score: Number(e.target.value) })}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="0"
                            />
                        </div>

                        {/* Checklist */}
                        <div className="mb-5">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Compliance Checklist</label>
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                                {Object.entries(qcData.checklist_items).map(([item, checked]) => (
                                    <label key={item} className="flex items-center gap-2.5 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => handleChecklistChange(item, e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-600 text-sm">{item}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {Object.values(qcData.checklist_items).filter(v => v).length} / {Object.keys(qcData.checklist_items).length} completed
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="mb-5">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Remarks</label>
                            <textarea
                                value={qcData.qc_remarks}
                                onChange={(e) => setQcData({ ...qcData, qc_remarks: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                                placeholder="Enter feedback..."
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setQcData({ ...qcData, qc_decision: 'rejected' });
                                        setTimeout(handleSubmitQC, 0);
                                    }}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 border-2 border-red-400 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        setQcData({ ...qcData, qc_decision: 'rework' });
                                        setTimeout(handleSubmitQC, 0);
                                    }}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 border-2 border-orange-400 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition-colors disabled:opacity-50"
                                >
                                    Rework
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setQcData({ ...qcData, qc_decision: 'approved' });
                                    setTimeout(handleSubmitQC, 0);
                                }}
                                disabled={submitting}
                                className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Approve'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Assets QC Review</h1>
                <p className="text-gray-600">Review and approve test assets for deployment</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-amber-500">
                    <div className="text-2xl font-bold text-amber-600">{testAssets.length - approvedAssets.length - rejectedAssets.length - reworkAssets.length}</div>
                    <div className="text-sm text-gray-600">Pending Review</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                    <div className="text-2xl font-bold text-green-600">{approvedAssets.length}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
                    <div className="text-2xl font-bold text-red-600">{rejectedAssets.length}</div>
                    <div className="text-sm text-gray-600">Rejected</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
                    <div className="text-2xl font-bold text-orange-600">{reworkAssets.length}</div>
                    <div className="text-sm text-gray-600">Rework</div>
                </div>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testAssets.map(asset => (
                    <div
                        key={asset.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleSelectAsset(asset)}
                    >
                        {/* Thumbnail */}
                        <div className="h-40 bg-gray-100 overflow-hidden">
                            {asset.thumbnail_url ? (
                                <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 text-sm">{asset.name}</h3>
                                {getStatusBadge(asset.id)}
                            </div>

                            <p className="text-xs text-gray-600 mb-3">{asset.description}</p>

                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                    {asset.application_type.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">{asset.type}</span>
                            </div>

                            {/* Scores */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-blue-50 rounded p-2 text-center">
                                    <div className="text-sm font-bold text-blue-600">{asset.seo_score}</div>
                                    <div className="text-xs text-blue-600">SEO</div>
                                </div>
                                <div className="bg-green-50 rounded p-2 text-center">
                                    <div className="text-sm font-bold text-green-600">{asset.grammar_score}</div>
                                    <div className="text-xs text-green-600">Grammar</div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectAsset(asset);
                                }}
                                className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Review Asset
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestAssetsQCView;

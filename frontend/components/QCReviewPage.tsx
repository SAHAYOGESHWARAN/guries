import React, { useState, useEffect } from 'react';
import type { AssetLibraryItem } from '../types';

interface QCAsset extends AssetLibraryItem {
    submitted_by?: number;
    submitted_at?: string;
    qc_reviewer_id?: number;
    qc_reviewed_at?: string;
    rework_count?: number;
}

interface QCStatistics {
    pending: number;
    approved: number;
    rejected: number;
    rework: number;
    total: number;
    averageScore: number;
    approvalRate: number;
}

const QCReviewPage: React.FC = () => {
    const [assets, setAssets] = useState<QCAsset[]>([]);
    const [statistics, setStatistics] = useState<QCStatistics | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<QCAsset | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'rework'>('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1';

    useEffect(() => {
        fetchPendingAssets();
        fetchStatistics();
    }, [filter]);

    const fetchPendingAssets = async () => {
        setLoading(true);
        setError(null);

        try {
            const statusParam = filter === 'all' ? 'all' : filter === 'pending' ? 'Pending' : 'Rework';
            const response = await fetch(
                `${apiUrl}/qc-review/pending?status=${statusParam}&limit=50`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch pending assets');
            }

            const data = await response.json();
            setAssets(data.assets);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load pending assets';
            setError(message);
            console.error('Error fetching pending assets:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch(`${apiUrl}/qc-review/statistics`);

            if (!response.ok) {
                throw new Error('Failed to fetch statistics');
            }

            const data = await response.json();
            setStatistics(data);
        } catch (err) {
            console.error('Error fetching statistics:', err);
        }
    };

    const handleApprove = async (assetId: number, remarks: string, score: number) => {
        setActionLoading(true);
        setActionError(null);
        setActionSuccess(null);

        try {
            const response = await fetch(`${apiUrl}/qc-review/assets/${assetId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: assetId,
                    qc_remarks: remarks,
                    qc_score: score
                })
            });

            if (!response.ok) {
                throw new Error('Failed to approve asset');
            }

            setActionSuccess('Asset approved successfully!');
            setSelectedAsset(null);

            // Refresh data after a short delay to ensure UI updates
            setTimeout(() => {
                fetchPendingAssets();
                fetchStatistics();
            }, 500);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to approve asset';
            setActionError(message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (assetId: number, remarks: string, score: number) => {
        if (!remarks.trim()) {
            setActionError('Remarks are required for rejection');
            return;
        }

        setActionLoading(true);
        setActionError(null);
        setActionSuccess(null);

        try {
            const response = await fetch(`${apiUrl}/qc-review/assets/${assetId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: assetId,
                    qc_remarks: remarks,
                    qc_score: score
                })
            });

            if (!response.ok) {
                throw new Error('Failed to reject asset');
            }

            setActionSuccess('Asset rejected successfully!');
            setSelectedAsset(null);

            // Refresh data after a short delay to ensure UI updates
            setTimeout(() => {
                fetchPendingAssets();
                fetchStatistics();
            }, 500);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to reject asset';
            setActionError(message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRework = async (assetId: number, remarks: string, score: number) => {
        if (!remarks.trim()) {
            setActionError('Remarks are required for rework request');
            return;
        }

        setActionLoading(true);
        setActionError(null);
        setActionSuccess(null);

        try {
            const response = await fetch(`${apiUrl}/qc-review/assets/${assetId}/rework`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: assetId,
                    qc_remarks: remarks,
                    qc_score: score
                })
            });

            if (!response.ok) {
                throw new Error('Failed to request rework');
            }

            setActionSuccess('Rework requested successfully!');
            setSelectedAsset(null);

            // Refresh data after a short delay to ensure UI updates
            setTimeout(() => {
                fetchPendingAssets();
                fetchStatistics();
            }, 500);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to request rework';
            setActionError(message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="qc-review-page">
            <h1>QC Review Dashboard</h1>

            {/* Statistics */}
            {statistics && (
                <div className="statistics-grid">
                    <div className="stat-card pending">
                        <div className="stat-number">{statistics.pending}</div>
                        <div className="stat-label">Pending Review</div>
                    </div>
                    <div className="stat-card approved">
                        <div className="stat-number">{statistics.approved}</div>
                        <div className="stat-label">Approved</div>
                    </div>
                    <div className="stat-card rejected">
                        <div className="stat-number">{statistics.rejected}</div>
                        <div className="stat-label">Rejected</div>
                    </div>
                    <div className="stat-card rework">
                        <div className="stat-number">{statistics.rework}</div>
                        <div className="stat-label">Rework</div>
                    </div>
                    <div className="stat-card rate">
                        <div className="stat-number">{statistics.approvalRate}%</div>
                        <div className="stat-label">Approval Rate</div>
                    </div>
                </div>
            )}

            <div className="qc-content">
                {/* Assets List */}
                <div className="assets-list">
                    <div className="list-header">
                        <h2>Assets for Review</h2>
                        <div className="filter-buttons">
                            <button
                                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                                onClick={() => setFilter('pending')}
                            >
                                Pending
                            </button>
                            <button
                                className={`filter-btn ${filter === 'rework' ? 'active' : ''}`}
                                onClick={() => setFilter('rework')}
                            >
                                Rework
                            </button>
                            <button
                                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All
                            </button>
                        </div>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    {loading ? (
                        <div className="loading">Loading assets...</div>
                    ) : assets.length === 0 ? (
                        <div className="empty-state">No assets to review</div>
                    ) : (
                        <div className="assets-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Asset Name</th>
                                        <th>Type</th>
                                        <th>Category</th>
                                        <th>Submitted</th>
                                        <th>SEO Score</th>
                                        <th>Grammar Score</th>
                                        <th>Rework Count</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map(asset => (
                                        <tr key={asset.id} className={selectedAsset?.id === asset.id ? 'selected' : ''}>
                                            <td className="asset-name">{asset.asset_name}</td>
                                            <td>{asset.asset_type}</td>
                                            <td>{asset.asset_category}</td>
                                            <td>{new Date(asset.submitted_at || '').toLocaleDateString()}</td>
                                            <td>
                                                <span className={`score ${asset.seo_score >= 80 ? 'high' : asset.seo_score >= 60 ? 'medium' : 'low'}`}>
                                                    {asset.seo_score}/100
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`score ${asset.grammar_score >= 80 ? 'high' : asset.grammar_score >= 60 ? 'medium' : 'low'}`}>
                                                    {asset.grammar_score}/100
                                                </span>
                                            </td>
                                            <td>{asset.rework_count || 0}</td>
                                            <td>
                                                <button
                                                    className="btn-review"
                                                    onClick={() => setSelectedAsset(asset)}
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

                {/* Review Panel */}
                {selectedAsset && (
                    <QCReviewPanel
                        asset={selectedAsset}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onRework={handleRework}
                        onClose={() => setSelectedAsset(null)}
                        loading={actionLoading}
                        error={actionError}
                        success={actionSuccess}
                    />
                )}
            </div>

            <style>{`
                .qc-review-page {
                    padding: 2rem;
                    background-color: #f8f9fa;
                    min-height: 100vh;
                }

                .qc-review-page h1 {
                    margin-bottom: 2rem;
                    color: #333;
                }

                .statistics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: white;
                    border-radius: 8px;
                    padding: 1.5rem;
                    text-align: center;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .stat-number {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: #6c757d;
                }

                .stat-card.pending .stat-number { color: #ffc107; }
                .stat-card.approved .stat-number { color: #28a745; }
                .stat-card.rejected .stat-number { color: #dc3545; }
                .stat-card.rework .stat-number { color: #fd7e14; }
                .stat-card.rate .stat-number { color: #007bff; }

                .qc-content {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 2rem;
                }

                .assets-list {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .list-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .list-header h2 {
                    margin: 0;
                    font-size: 1.3rem;
                }

                .filter-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .filter-btn {
                    padding: 0.5rem 1rem;
                    border: 1px solid #dee2e6;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }

                .filter-btn:hover {
                    border-color: #007bff;
                    color: #007bff;
                }

                .filter-btn.active {
                    background-color: #007bff;
                    color: white;
                    border-color: #007bff;
                }

                .assets-table {
                    overflow-x: auto;
                }

                .assets-table table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .assets-table th {
                    background-color: #f8f9fa;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid #dee2e6;
                    font-size: 0.9rem;
                }

                .assets-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #dee2e6;
                }

                .assets-table tr:hover {
                    background-color: #f8f9fa;
                }

                .assets-table tr.selected {
                    background-color: #e7f3ff;
                }

                .asset-name {
                    font-weight: 600;
                    color: #333;
                }

                .score {
                    padding: 0.25rem 0.75rem;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .score.high {
                    background-color: #d4edda;
                    color: #155724;
                }

                .score.medium {
                    background-color: #fff3cd;
                    color: #856404;
                }

                .score.low {
                    background-color: #f8d7da;
                    color: #721c24;
                }

                .btn-review {
                    padding: 0.5rem 1rem;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: background-color 0.3s ease;
                }

                .btn-review:hover {
                    background-color: #0056b3;
                }

                .loading,
                .empty-state {
                    padding: 2rem;
                    text-align: center;
                    color: #6c757d;
                }

                .alert {
                    padding: 1rem;
                    margin: 1rem;
                    border-radius: 4px;
                }

                .alert-error {
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                }

                @media (max-width: 1200px) {
                    .qc-content {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

// QC Review Panel Component
interface QCReviewPanelProps {
    asset: QCAsset;
    onApprove: (assetId: number, remarks: string, score: number) => void;
    onReject: (assetId: number, remarks: string, score: number) => void;
    onRework: (assetId: number, remarks: string, score: number) => void;
    onClose: () => void;
    loading: boolean;
    error: string | null;
    success: string | null;
}

const QCReviewPanel: React.FC<QCReviewPanelProps> = ({
    asset,
    onApprove,
    onReject,
    onRework,
    onClose,
    loading,
    error,
    success
}) => {
    const [remarks, setRemarks] = useState('');
    const [score, setScore] = useState(asset.seo_score || 0);

    const handleApprove = () => onApprove(asset.id, remarks, score);
    const handleReject = () => onReject(asset.id, remarks, score);
    const handleRework = () => onRework(asset.id, remarks, score);

    return (
        <div className="qc-review-panel">
            <div className="panel-header">
                <h3>Review Asset</h3>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="panel-content">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="asset-info">
                    <div className="info-item">
                        <span className="label">Name:</span>
                        <span className="value">{asset.asset_name}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Type:</span>
                        <span className="value">{asset.asset_type}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">SEO Score:</span>
                        <span className="value">{asset.seo_score}/100</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Grammar Score:</span>
                        <span className="value">{asset.grammar_score}/100</span>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="qc-score">QC Score</label>
                    <input
                        id="qc-score"
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        disabled={loading}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="remarks">Remarks</label>
                    <textarea
                        id="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        disabled={loading}
                        className="form-control"
                        rows={4}
                        placeholder="Add your review remarks..."
                    />
                </div>

                <div className="action-buttons">
                    <button
                        className="btn btn-approve"
                        onClick={handleApprove}
                        disabled={loading}
                    >
                        ✅ Approve
                    </button>
                    <button
                        className="btn btn-rework"
                        onClick={handleRework}
                        disabled={loading}
                    >
                        🔄 Rework
                    </button>
                    <button
                        className="btn btn-reject"
                        onClick={handleReject}
                        disabled={loading}
                    >
                        ❌ Reject
                    </button>
                </div>
            </div>

            <style>{`
                .qc-review-panel {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    position: sticky;
                    top: 2rem;
                    max-height: calc(100vh - 4rem);
                    overflow-y: auto;
                }

                .panel-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .panel-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6c757d;
                }

                .panel-content {
                    padding: 1.5rem;
                }

                .asset-info {
                    margin-bottom: 1.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid #dee2e6;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                    font-size: 0.9rem;
                }

                .info-item .label {
                    font-weight: 600;
                    color: #6c757d;
                }

                .info-item .value {
                    color: #333;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .form-control {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    font-family: inherit;
                }

                .form-control:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
                }

                .form-control:disabled {
                    background-color: #e9ecef;
                    cursor: not-allowed;
                }

                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .btn {
                    padding: 0.75rem;
                    border: none;
                    border-radius: 4px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                }

                .btn-approve {
                    background-color: #28a745;
                    color: white;
                }

                .btn-approve:hover:not(:disabled) {
                    background-color: #218838;
                }

                .btn-rework {
                    background-color: #fd7e14;
                    color: white;
                }

                .btn-rework:hover:not(:disabled) {
                    background-color: #e56a00;
                }

                .btn-reject {
                    background-color: #dc3545;
                    color: white;
                }

                .btn-reject:hover:not(:disabled) {
                    background-color: #c82333;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .alert {
                    padding: 0.75rem;
                    border-radius: 4px;
                    margin-bottom: 1rem;
                    font-size: 0.85rem;
                }

                .alert-error {
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                }

                .alert-success {
                    background-color: #d4edda;
                    border: 1px solid #c3e6cb;
                    color: #155724;
                }
            `}</style>
        </div>
    );
};

export default QCReviewPage;

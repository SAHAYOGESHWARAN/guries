import React, { useState, useEffect } from 'react';

interface AssetStatusData {
    asset_id: number;
    asset_name: string;
    qcStatus: {
        status: string;
        label: string;
        color: string;
        icon: string;
        description: string;
    };
    linkingStatus: {
        status: string;
        label: string;
        color: string;
        icon: string;
        isStatic: boolean;
        staticCount: number;
        totalLinked: number;
        subServiceLinked: number;
        description: string;
    };
    workflowStage: {
        stage: string;
        label: string;
        color: string;
        icon: string;
        progress: number;
        description: string;
    };
    overallStatus: {
        isReady: boolean;
        readinessPercentage: number;
        nextStep: string;
    };
    timestamps: {
        created_at: string;
        submitted_at: string;
        qc_reviewed_at: string;
    };
}

interface AssetStatusDisplayProps {
    assetId: number;
    onStatusChange?: (status: AssetStatusData) => void;
}

const AssetStatusDisplay: React.FC<AssetStatusDisplayProps> = ({
    assetId,
    onStatusChange
}) => {
    const [statusData, setStatusData] = useState<AssetStatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAssetStatus();
    }, [assetId]);

    const fetchAssetStatus = async () => {
        setLoading(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1';
            const response = await fetch(`${apiUrl}/asset-status/assets/${assetId}/status`);

            if (!response.ok) {
                throw new Error(`Failed to fetch asset status: ${response.statusText}`);
            }

            const data = await response.json();
            setStatusData(data);
            onStatusChange?.(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load asset status';
            setError(message);
            console.error('Error fetching asset status:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="asset-status-display">
                <div className="loading">Loading asset status...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="asset-status-display">
                <div className="error">Error: {error}</div>
            </div>
        );
    }

    if (!statusData) {
        return (
            <div className="asset-status-display">
                <div className="error">No status data available</div>
            </div>
        );
    }

    return (
        <div className="asset-status-display">
            {/* Asset Name */}
            <div className="asset-header">
                <h2>{statusData.asset_name}</h2>
                <div className="readiness-badge">
                    <div className="readiness-circle">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" className="bg-circle" />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                className="progress-circle"
                                style={{
                                    strokeDasharray: `${statusData.overallStatus.readinessPercentage * 2.83} 283`
                                }}
                            />
                        </svg>
                        <div className="readiness-text">
                            {statusData.overallStatus.readinessPercentage}%
                        </div>
                    </div>
                    <div className="readiness-label">Ready</div>
                </div>
            </div>

            {/* Three Status Areas */}
            <div className="status-grid">
                {/* 1. QC Status */}
                <div className="status-card qc-status-card">
                    <div className="status-header">
                        <span className="status-icon">{statusData.qcStatus.icon}</span>
                        <h3>QC Status</h3>
                    </div>

                    <div className="status-content">
                        <div className="status-badge" style={{ backgroundColor: statusData.qcStatus.color }}>
                            {statusData.qcStatus.label}
                        </div>
                        <p className="status-description">{statusData.qcStatus.description}</p>

                        <div className="status-details">
                            <div className="detail-item">
                                <span className="detail-label">Current Status:</span>
                                <span className="detail-value">{statusData.qcStatus.status}</span>
                            </div>
                            {statusData.timestamps.qc_reviewed_at && (
                                <div className="detail-item">
                                    <span className="detail-label">Reviewed:</span>
                                    <span className="detail-value">
                                        {new Date(statusData.timestamps.qc_reviewed_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Linking Status */}
                <div className="status-card linking-status-card">
                    <div className="status-header">
                        <span className="status-icon">{statusData.linkingStatus.icon}</span>
                        <h3>Linking Status</h3>
                    </div>

                    <div className="status-content">
                        <div className="status-badge" style={{ backgroundColor: statusData.linkingStatus.color }}>
                            {statusData.linkingStatus.label}
                        </div>
                        <p className="status-description">{statusData.linkingStatus.description}</p>

                        <div className="status-details">
                            <div className="detail-item">
                                <span className="detail-label">Services Linked:</span>
                                <span className="detail-value">{statusData.linkingStatus.totalLinked}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Sub-Services:</span>
                                <span className="detail-value">{statusData.linkingStatus.subServiceLinked}</span>
                            </div>
                            {statusData.linkingStatus.isStatic && (
                                <div className="detail-item static-indicator">
                                    <span className="detail-label">🔒 Static Links:</span>
                                    <span className="detail-value">{statusData.linkingStatus.staticCount}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Workflow Stage */}
                <div className="status-card workflow-status-card">
                    <div className="status-header">
                        <span className="status-icon">{statusData.workflowStage.icon}</span>
                        <h3>Workflow Stage</h3>
                    </div>

                    <div className="status-content">
                        <div className="status-badge" style={{ backgroundColor: statusData.workflowStage.color }}>
                            {statusData.workflowStage.label}
                        </div>
                        <p className="status-description">{statusData.workflowStage.description}</p>

                        {/* Progress Bar */}
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${statusData.workflowStage.progress}%`,
                                    backgroundColor: statusData.workflowStage.color
                                }}
                            />
                        </div>
                        <div className="progress-text">
                            {statusData.workflowStage.progress}% Complete
                        </div>

                        <div className="status-details">
                            <div className="detail-item">
                                <span className="detail-label">Current Stage:</span>
                                <span className="detail-value">{statusData.workflowStage.stage}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overall Status & Next Step */}
            <div className="overall-status">
                <div className="next-step">
                    <h4>Next Step</h4>
                    <p>{statusData.overallStatus.nextStep}</p>
                </div>
                {statusData.overallStatus.isReady && (
                    <div className="ready-indicator">
                        <span className="ready-icon">✅</span>
                        <span className="ready-text">Asset is Ready!</span>
                    </div>
                )}
            </div>

            <style>{`
                .asset-status-display {
                    padding: 1.5rem;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                }

                .asset-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #dee2e6;
                }

                .asset-header h2 {
                    margin: 0;
                    color: #333;
                    font-size: 1.5rem;
                }

                .readiness-badge {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .readiness-circle {
                    position: relative;
                    width: 80px;
                    height: 80px;
                }

                .readiness-circle svg {
                    width: 100%;
                    height: 100%;
                    transform: rotate(-90deg);
                }

                .bg-circle {
                    fill: none;
                    stroke: #e9ecef;
                    stroke-width: 4;
                }

                .progress-circle {
                    fill: none;
                    stroke: #007bff;
                    stroke-width: 4;
                    stroke-linecap: round;
                    transition: stroke-dasharray 0.3s ease;
                }

                .readiness-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #007bff;
                }

                .readiness-label {
                    font-size: 0.85rem;
                    color: #6c757d;
                    font-weight: 600;
                }

                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .status-card {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }

                .status-card:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }

                .status-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .status-icon {
                    font-size: 1.5rem;
                }

                .status-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: #333;
                }

                .status-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .status-badge {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-align: center;
                    width: fit-content;
                }

                .status-description {
                    margin: 0;
                    color: #6c757d;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }

                .status-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid #e9ecef;
                }

                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                }

                .detail-label {
                    color: #6c757d;
                    font-weight: 500;
                }

                .detail-value {
                    color: #333;
                    font-weight: 600;
                }

                .static-indicator {
                    background-color: #fff3cd;
                    padding: 0.5rem;
                    border-radius: 4px;
                    margin-top: 0.5rem;
                }

                .static-indicator .detail-label {
                    color: #856404;
                }

                .static-indicator .detail-value {
                    color: #856404;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background-color: #e9ecef;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                }

                .progress-text {
                    font-size: 0.85rem;
                    color: #6c757d;
                    text-align: center;
                }

                .overall-status {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .next-step {
                    flex: 1;
                }

                .next-step h4 {
                    margin: 0 0 0.5rem 0;
                    color: #333;
                    font-size: 0.95rem;
                }

                .next-step p {
                    margin: 0;
                    color: #6c757d;
                    font-size: 0.9rem;
                }

                .ready-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1.5rem;
                    background-color: #d4edda;
                    border: 1px solid #c3e6cb;
                    border-radius: 4px;
                    color: #155724;
                    font-weight: 600;
                }

                .ready-icon {
                    font-size: 1.5rem;
                }

                .loading,
                .error {
                    padding: 2rem;
                    text-align: center;
                    color: #6c757d;
                }

                .error {
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                    border-radius: 4px;
                }

                @media (max-width: 768px) {
                    .status-grid {
                        grid-template-columns: 1fr;
                    }

                    .overall-status {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .asset-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    );
};

export default AssetStatusDisplay;

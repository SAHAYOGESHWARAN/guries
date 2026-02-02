import React, { useState } from 'react';

interface AssetStatusUpdaterProps {
    assetId: number;
    currentQCStatus?: string;
    currentWorkflowStage?: string;
    currentLinkingActive?: boolean;
    onStatusUpdated?: () => void;
}

const AssetStatusUpdater: React.FC<AssetStatusUpdaterProps> = ({
    assetId,
    currentQCStatus = 'Pending',
    currentWorkflowStage = 'Add',
    currentLinkingActive = false,
    onStatusUpdated
}) => {
    const [qcStatus, setQCStatus] = useState(currentQCStatus);
    const [workflowStage, setWorkflowStage] = useState(currentWorkflowStage);
    const [linkingActive, setLinkingActive] = useState(currentLinkingActive);
    const [qcRemarks, setQCRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1';

    const handleQCStatusUpdate = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${apiUrl}/asset-status/assets/${assetId}/qc-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: assetId,
                    qc_status: qcStatus,
                    qc_remarks: qcRemarks || null
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update QC status');
            }

            setSuccess('QC status updated successfully');
            onStatusUpdated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update QC status');
        } finally {
            setLoading(false);
        }
    };

    const handleWorkflowStageUpdate = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${apiUrl}/asset-status/assets/${assetId}/workflow-stage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: assetId,
                    workflow_stage: workflowStage
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update workflow stage');
            }

            setSuccess('Workflow stage updated successfully');
            onStatusUpdated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update workflow stage');
        } finally {
            setLoading(false);
        }
    };

    const handleLinkingStatusUpdate = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${apiUrl}/asset-status/assets/${assetId}/linking-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: assetId,
                    linking_active: linkingActive
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update linking status');
            }

            setSuccess('Linking status updated successfully');
            onStatusUpdated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update linking status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="asset-status-updater">
            <h3>Update Asset Status</h3>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="updater-grid">
                {/* QC Status Update */}
                <div className="updater-section">
                    <h4>QC Status</h4>
                    <div className="form-group">
                        <label htmlFor="qc-status">Status</label>
                        <select
                            id="qc-status"
                            value={qcStatus}
                            onChange={(e) => setQCStatus(e.target.value)}
                            disabled={loading}
                            className="form-control"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Pass">Pass</option>
                            <option value="Fail">Fail</option>
                            <option value="Rework">Rework</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="qc-remarks">Remarks (Optional)</label>
                        <textarea
                            id="qc-remarks"
                            value={qcRemarks}
                            onChange={(e) => setQCRemarks(e.target.value)}
                            disabled={loading}
                            className="form-control"
                            rows={3}
                            placeholder="Add QC remarks..."
                        />
                    </div>

                    <button
                        onClick={handleQCStatusUpdate}
                        disabled={loading || qcStatus === currentQCStatus}
                        className="btn btn-primary"
                    >
                        {loading ? 'Updating...' : 'Update QC Status'}
                    </button>
                </div>

                {/* Workflow Stage Update */}
                <div className="updater-section">
                    <h4>Workflow Stage</h4>
                    <div className="form-group">
                        <label htmlFor="workflow-stage">Stage</label>
                        <select
                            id="workflow-stage"
                            value={workflowStage}
                            onChange={(e) => setWorkflowStage(e.target.value)}
                            disabled={loading}
                            className="form-control"
                        >
                            <option value="Add">Add</option>
                            <option value="Submit">Submit</option>
                            <option value="QC">QC</option>
                            <option value="Approve">Approve</option>
                            <option value="Publish">Publish</option>
                        </select>
                    </div>

                    <div className="stage-info">
                        <small>Current: {currentWorkflowStage}</small>
                    </div>

                    <button
                        onClick={handleWorkflowStageUpdate}
                        disabled={loading || workflowStage === currentWorkflowStage}
                        className="btn btn-primary"
                    >
                        {loading ? 'Updating...' : 'Update Workflow Stage'}
                    </button>
                </div>

                {/* Linking Status Update */}
                <div className="updater-section">
                    <h4>Linking Status</h4>
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={linkingActive}
                                onChange={(e) => setLinkingActive(e.target.checked)}
                                disabled={loading}
                            />
                            <span>Activate Linking</span>
                        </label>
                    </div>

                    <div className="linking-info">
                        <small>
                            Current: {currentLinkingActive ? 'Active' : 'Inactive'}
                        </small>
                    </div>

                    <button
                        onClick={handleLinkingStatusUpdate}
                        disabled={loading || linkingActive === currentLinkingActive}
                        className="btn btn-primary"
                    >
                        {loading ? 'Updating...' : 'Update Linking Status'}
                    </button>
                </div>
            </div>

            <style>{`
                .asset-status-updater {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 1.5rem;
                }

                .asset-status-updater h3 {
                    margin-top: 0;
                    margin-bottom: 1.5rem;
                    color: #333;
                }

                .alert {
                    padding: 1rem;
                    border-radius: 4px;
                    margin-bottom: 1rem;
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

                .updater-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .updater-section {
                    padding: 1rem;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                    border: 1px solid #e9ecef;
                }

                .updater-section h4 {
                    margin-top: 0;
                    margin-bottom: 1rem;
                    color: #333;
                    font-size: 0.95rem;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #333;
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

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    font-weight: 500;
                    color: #333;
                }

                .checkbox-label input {
                    cursor: pointer;
                }

                .stage-info,
                .linking-info {
                    font-size: 0.85rem;
                    color: #6c757d;
                    margin-bottom: 1rem;
                }

                .btn {
                    width: 100%;
                    padding: 0.75rem;
                    border: none;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-primary {
                    background-color: #007bff;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background-color: #0056b3;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .updater-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AssetStatusUpdater;

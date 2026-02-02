import React from 'react';

interface AssetQCStatusColumnProps {
    qcStatus?: string;
    workflowStage?: string;
    linkingActive?: boolean;
    reworkCount?: number;
    showDetails?: boolean;
}

const AssetQCStatusColumn: React.FC<AssetQCStatusColumnProps> = ({
    qcStatus = 'Pending',
    workflowStage = 'Add',
    linkingActive = false,
    reworkCount = 0,
    showDetails = false
}) => {
    const getStatusBadge = (status: string) => {
        const badges: Record<string, { icon: string; color: string; label: string }> = {
            'Pending': { icon: '⏳', color: '#ffc107', label: 'Pending' },
            'Pass': { icon: '✅', color: '#28a745', label: 'Approved' },
            'Fail': { icon: '❌', color: '#dc3545', label: 'Rejected' },
            'Rework': { icon: '🔄', color: '#fd7e14', label: 'Rework' }
        };
        return badges[status] || badges['Pending'];
    };

    const getWorkflowBadge = (stage: string) => {
        const badges: Record<string, { icon: string; color: string; label: string }> = {
            'Add': { icon: '📝', color: '#6c757d', label: 'Add' },
            'Submit': { icon: '📤', color: '#17a2b8', label: 'Submit' },
            'QC': { icon: '🔍', color: '#ffc107', label: 'QC' },
            'Approve': { icon: '✔️', color: '#28a745', label: 'Approve' },
            'Publish': { icon: '🚀', color: '#007bff', label: 'Publish' }
        };
        return badges[stage] || badges['Add'];
    };

    const statusBadge = getStatusBadge(qcStatus);
    const workflowBadge = getWorkflowBadge(workflowStage);

    return (
        <div className="qc-status-column">
            <div className="status-badges">
                <div className="badge qc-badge" style={{ backgroundColor: statusBadge.color }}>
                    <span className="badge-icon">{statusBadge.icon}</span>
                    <span className="badge-text">{statusBadge.label}</span>
                </div>

                <div className="badge workflow-badge" style={{ backgroundColor: workflowBadge.color }}>
                    <span className="badge-icon">{workflowBadge.icon}</span>
                    <span className="badge-text">{workflowBadge.label}</span>
                </div>

                {linkingActive && (
                    <div className="badge linking-badge">
                        <span className="badge-icon">🔗</span>
                        <span className="badge-text">Linked</span>
                    </div>
                )}
            </div>

            {showDetails && (
                <div className="status-details">
                    {reworkCount > 0 && (
                        <div className="detail-item">
                            <span className="detail-label">Rework Count:</span>
                            <span className="detail-value">{reworkCount}</span>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .qc-status-column {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .status-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.4rem 0.8rem;
                    border-radius: 4px;
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .badge-icon {
                    font-size: 0.9rem;
                }

                .badge-text {
                    display: none;
                }

                @media (min-width: 768px) {
                    .badge-text {
                        display: inline;
                    }
                }

                .qc-badge {
                    background-color: #ffc107;
                }

                .workflow-badge {
                    background-color: #007bff;
                }

                .linking-badge {
                    background-color: #28a745;
                }

                .status-details {
                    font-size: 0.75rem;
                    color: #6c757d;
                }

                .detail-item {
                    display: flex;
                    gap: 0.5rem;
                }

                .detail-label {
                    font-weight: 600;
                }

                .detail-value {
                    color: #333;
                }
            `}</style>
        </div>
    );
};

export default AssetQCStatusColumn;

import React from 'react';

interface WorkflowStatusInlineProps {
    workflowStage: string;
    qcStatus: string;
    currentTeam?: string;
    className?: string;
}

export const AssetWorkflowStatusInline: React.FC<WorkflowStatusInlineProps> = ({
    workflowStage,
    qcStatus,
    currentTeam,
    className = ''
}) => {
    const stageConfig: Record<string, { color: string; label: string }> = {
        'Add': { color: 'bg-gray-200 text-gray-800', label: 'Draft' },
        'In Progress': { color: 'bg-blue-200 text-blue-800', label: 'In Progress' },
        'Sent to QC': { color: 'bg-yellow-200 text-yellow-800', label: 'QC' },
        'QC': { color: 'bg-yellow-200 text-yellow-800', label: 'QC' },
        'Approve': { color: 'bg-green-200 text-green-800', label: 'Approved' },
        'Published': { color: 'bg-green-200 text-green-800', label: 'Published' },
        'Rework': { color: 'bg-orange-200 text-orange-800', label: 'Rework' }
    };

    const stage = stageConfig[workflowStage] || stageConfig['Add'];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${stage.color}`}>
                {stage.label}
            </span>
            {currentTeam && (
                <span className="text-xs text-gray-600">
                    ({currentTeam})
                </span>
            )}
        </div>
    );
};

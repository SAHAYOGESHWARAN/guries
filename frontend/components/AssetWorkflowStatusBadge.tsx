import React from 'react';

interface WorkflowStatusBadgeProps {
    workflowStage: string;
    qcStatus: string;
    currentTeam?: string;
    className?: string;
}

export const AssetWorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({
    workflowStage,
    qcStatus,
    currentTeam,
    className = ''
}) => {
    // Map workflow stages to colors and labels
    const stageConfig: Record<string, { color: string; label: string; icon: string }> = {
        'Add': { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: '📝' },
        'In Progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress', icon: '⏳' },
        'Sent to QC': { color: 'bg-yellow-100 text-yellow-800', label: 'QC Review', icon: '🔍' },
        'QC': { color: 'bg-yellow-100 text-yellow-800', label: 'QC Review', icon: '🔍' },
        'Approve': { color: 'bg-green-100 text-green-800', label: 'Approved', icon: '✅' },
        'Published': { color: 'bg-green-100 text-green-800', label: 'Published', icon: '📤' },
        'Rework': { color: 'bg-orange-100 text-orange-800', label: 'Rework Needed', icon: '🔄' }
    };

    // Map QC statuses to colors
    const qcStatusConfig: Record<string, { color: string; label: string }> = {
        'Pending': { color: 'bg-yellow-50 border-yellow-200', label: 'QC Pending' },
        'Approved': { color: 'bg-green-50 border-green-200', label: 'QC Approved' },
        'Rejected': { color: 'bg-red-50 border-red-200', label: 'QC Rejected' },
        'Rework': { color: 'bg-orange-50 border-orange-200', label: 'Rework Requested' },
        'Pass': { color: 'bg-green-50 border-green-200', label: 'QC Passed' },
        'Fail': { color: 'bg-red-50 border-red-200', label: 'QC Failed' }
    };

    const stage = stageConfig[workflowStage] || stageConfig['Add'];
    const qcConfig = qcStatusConfig[qcStatus] || qcStatusConfig['Pending'];

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {/* Main Workflow Stage Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${stage.color}`}>
                <span>{stage.icon}</span>
                <span>{stage.label}</span>
            </div>

            {/* Current Team Working Badge */}
            {currentTeam && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit bg-purple-100 text-purple-800">
                    <span>👥</span>
                    <span>{currentTeam} is working on this asset</span>
                </div>
            )}

            {/* QC Status Badge */}
            {qcStatus && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit border ${qcConfig.color}`}>
                    <span>📋</span>
                    <span>{qcConfig.label}</span>
                </div>
            )}
        </div>
    );
};

// Inline badge variant for use in tables/lists
export const AssetWorkflowStatusInline: React.FC<WorkflowStatusBadgeProps> = ({
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

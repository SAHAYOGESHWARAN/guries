import React from 'react';

interface AssetWorkflowStatusTagProps {
    workflowStage?: string;
    qcStatus?: string;
    status?: string;
    linkedServiceId?: number;
    linkedSubServiceId?: number;
    serviceName?: string;
    subServiceName?: string;
    compact?: boolean;
}

export const AssetWorkflowStatusTag: React.FC<AssetWorkflowStatusTagProps> = ({
    workflowStage,
    qcStatus,
    status,
    linkedServiceId,
    linkedSubServiceId,
    serviceName,
    subServiceName,
    compact = false
}) => {
    // Determine status color and label
    const getStatusColor = (stage: string | undefined) => {
        switch (stage?.toLowerCase()) {
            case 'add':
                return 'bg-blue-100 text-blue-800';
            case 'qc':
                return 'bg-yellow-100 text-yellow-800';
            case 'approve':
                return 'bg-green-100 text-green-800';
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getQCStatusLabel = (qc: string | undefined) => {
        switch (qc?.toLowerCase()) {
            case 'qc pending':
            case 'pending':
                return 'Pending QC';
            case 'approved':
                return 'QC Approved';
            case 'rejected':
            case 'reject':
                return 'QC Rejected';
            case 'rework':
                return 'Rework Needed';
            default:
                return qc || 'Unknown';
        }
    };

    const displayStage = workflowStage || status || 'Draft';
    const displayQC = getQCStatusLabel(qcStatus);

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(displayStage)}`}>
                    {displayStage}
                </span>
                {qcStatus && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(qcStatus)}`}>
                        {displayQC}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Workflow:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(displayStage)}`}>
                    {displayStage}
                </span>
            </div>

            {qcStatus && (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">QC Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(qcStatus)}`}>
                        {displayQC}
                    </span>
                </div>
            )}

            {(linkedServiceId || linkedSubServiceId) && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded">
                    <span className="text-xs font-semibold text-blue-700">Linked to:</span>
                    <div className="flex gap-1">
                        {serviceName && (
                            <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                                {serviceName}
                            </span>
                        )}
                        {subServiceName && (
                            <span className="px-2 py-1 bg-blue-300 text-blue-900 rounded text-xs">
                                {subServiceName}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

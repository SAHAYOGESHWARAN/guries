import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * Asset Status Controller
 * Manages QC Status, Linking Status, and Workflow Stage
 */

// Get asset status (all 3 areas)
export const getAssetStatus = async (req: Request, res: Response) => {
    const { asset_id } = req.params;

    try {
        if (!asset_id) {
            return res.status(400).json({ error: 'asset_id is required' });
        }

        // Get asset details
        const assetResult = await pool.query(
            `SELECT 
                id,
                asset_name,
                qc_status,
                workflow_stage,
                linking_active,
                static_service_links,
                linked_service_ids,
                linked_sub_service_ids,
                status,
                created_at,
                submitted_at,
                qc_reviewed_at
            FROM assets WHERE id = ?`,
            [asset_id]
        );

        if (assetResult.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const asset = assetResult.rows[0];

        // Parse JSON fields
        const staticLinks = asset.static_service_links ? JSON.parse(asset.static_service_links) : [];
        const linkedServiceIds = asset.linked_service_ids ? JSON.parse(asset.linked_service_ids) : [];
        const linkedSubServiceIds = asset.linked_sub_service_ids ? JSON.parse(asset.linked_sub_service_ids) : [];

        // Get linking details
        const linkingResult = await pool.query(
            `SELECT COUNT(DISTINCT service_id) as service_count,
                    COUNT(DISTINCT sub_service_id) as sub_service_count,
                    SUM(CASE WHEN is_static = 1 THEN 1 ELSE 0 END) as static_count
             FROM service_asset_links
             WHERE asset_id = ?`,
            [asset_id]
        );

        const linkingStats = linkingResult.rows[0] || {
            service_count: 0,
            sub_service_count: 0,
            static_count: 0
        };

        // Determine QC Status
        const qcStatus = {
            status: asset.qc_status || 'Pending',
            label: getQCStatusLabel(asset.qc_status),
            color: getQCStatusColor(asset.qc_status),
            icon: getQCStatusIcon(asset.qc_status),
            description: getQCStatusDescription(asset.qc_status)
        };

        // Determine Linking Status
        const linkingStatus = {
            status: asset.linking_active ? 'Active' : 'Inactive',
            label: asset.linking_active ? 'Linked' : 'Not Linked',
            color: asset.linking_active ? '#28a745' : '#6c757d',
            icon: asset.linking_active ? '🔗' : '⚪',
            isStatic: staticLinks.length > 0,
            staticCount: staticLinks.length,
            totalLinked: linkingStats.service_count,
            subServiceLinked: linkingStats.sub_service_count,
            description: getLinkingStatusDescription(asset.linking_active, staticLinks.length)
        };

        // Determine Workflow Stage
        const workflowStage = {
            stage: asset.workflow_stage || 'Add',
            label: getWorkflowStageLabel(asset.workflow_stage),
            color: getWorkflowStageColor(asset.workflow_stage),
            icon: getWorkflowStageIcon(asset.workflow_stage),
            progress: getWorkflowProgress(asset.workflow_stage),
            description: getWorkflowStageDescription(asset.workflow_stage)
        };

        // Overall status
        const overallStatus = {
            isReady: asset.linking_active === 1 && asset.qc_status === 'Pass' && asset.workflow_stage === 'Publish',
            readinessPercentage: calculateReadiness(asset, staticLinks.length),
            nextStep: getNextStep(asset, staticLinks.length)
        };

        res.status(200).json({
            asset_id: asset.id,
            asset_name: asset.asset_name,
            qcStatus,
            linkingStatus,
            workflowStage,
            overallStatus,
            timestamps: {
                created_at: asset.created_at,
                submitted_at: asset.submitted_at,
                qc_reviewed_at: asset.qc_reviewed_at
            }
        });
    } catch (error: any) {
        console.error('Error getting asset status:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update QC Status
export const updateQCStatus = async (req: Request, res: Response) => {
    const { asset_id, qc_status, qc_remarks } = req.body;
    const updated_by = (req as any).user?.id;

    try {
        if (!asset_id || !qc_status) {
            return res.status(400).json({ error: 'asset_id and qc_status are required' });
        }

        // Validate QC status
        const validStatuses = ['Pending', 'Pass', 'Fail', 'Rework'];
        if (!validStatuses.includes(qc_status)) {
            return res.status(400).json({ error: `Invalid QC status. Must be one of: ${validStatuses.join(', ')}` });
        }

        // Update asset
        await pool.query(
            `UPDATE assets 
             SET qc_status = ?, qc_remarks = ?, qc_reviewed_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [qc_status, qc_remarks || null, asset_id]
        );

        // If Pass, activate linking
        if (qc_status === 'Pass') {
            await pool.query(
                `UPDATE assets SET linking_active = 1 WHERE id = ?`,
                [asset_id]
            );
        }

        // Log status change
        await logStatusChange(asset_id, 'qc_status', qc_status, updated_by);

        res.status(200).json({
            message: 'QC status updated successfully',
            asset_id,
            qc_status,
            linking_active: qc_status === 'Pass' ? 1 : 0
        });
    } catch (error: any) {
        console.error('Error updating QC status:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update Workflow Stage
export const updateWorkflowStage = async (req: Request, res: Response) => {
    const { asset_id, workflow_stage } = req.body;
    const updated_by = (req as any).user?.id;

    try {
        if (!asset_id || !workflow_stage) {
            return res.status(400).json({ error: 'asset_id and workflow_stage are required' });
        }

        // Validate workflow stage
        const validStages = ['Add', 'Submit', 'QC', 'Approve', 'Publish'];
        if (!validStages.includes(workflow_stage)) {
            return res.status(400).json({ error: `Invalid workflow stage. Must be one of: ${validStages.join(', ')}` });
        }

        // Update asset
        await pool.query(
            `UPDATE assets SET workflow_stage = ? WHERE id = ?`,
            [workflow_stage, asset_id]
        );

        // Log status change
        await logStatusChange(asset_id, 'workflow_stage', workflow_stage, updated_by);

        res.status(200).json({
            message: 'Workflow stage updated successfully',
            asset_id,
            workflow_stage
        });
    } catch (error: any) {
        console.error('Error updating workflow stage:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update Linking Status
export const updateLinkingStatus = async (req: Request, res: Response) => {
    const { asset_id, linking_active } = req.body;
    const updated_by = (req as any).user?.id;

    try {
        if (!asset_id || linking_active === undefined) {
            return res.status(400).json({ error: 'asset_id and linking_active are required' });
        }

        // Update asset
        await pool.query(
            `UPDATE assets SET linking_active = ? WHERE id = ?`,
            [linking_active ? 1 : 0, asset_id]
        );

        // Log status change
        await logStatusChange(asset_id, 'linking_active', linking_active ? 'Active' : 'Inactive', updated_by);

        res.status(200).json({
            message: 'Linking status updated successfully',
            asset_id,
            linking_active: linking_active ? 1 : 0
        });
    } catch (error: any) {
        console.error('Error updating linking status:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get status history
export const getStatusHistory = async (req: Request, res: Response) => {
    const { asset_id } = req.params;

    try {
        if (!asset_id) {
            return res.status(400).json({ error: 'asset_id is required' });
        }

        const result = await pool.query(
            `SELECT * FROM asset_status_log 
             WHERE asset_id = ? 
             ORDER BY changed_at DESC 
             LIMIT 50`,
            [asset_id]
        );

        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error getting status history:', error);
        res.status(500).json({ error: error.message });
    }
};

// Helper functions

function getQCStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        'Pending': 'Pending Review',
        'Pass': 'Passed QC',
        'Fail': 'Failed QC',
        'Rework': 'Rework Requested'
    };
    return labels[status] || 'Unknown';
}

function getQCStatusColor(status: string): string {
    const colors: Record<string, string> = {
        'Pending': '#ffc107',
        'Pass': '#28a745',
        'Fail': '#dc3545',
        'Rework': '#fd7e14'
    };
    return colors[status] || '#6c757d';
}

function getQCStatusIcon(status: string): string {
    const icons: Record<string, string> = {
        'Pending': '⏳',
        'Pass': '✅',
        'Fail': '❌',
        'Rework': '🔄'
    };
    return icons[status] || '❓';
}

function getQCStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
        'Pending': 'Waiting for QC review',
        'Pass': 'Passed quality check',
        'Fail': 'Failed quality check',
        'Rework': 'Requires rework before resubmission'
    };
    return descriptions[status] || 'Unknown status';
}

function getLinkingStatusDescription(isActive: boolean, staticCount: number): string {
    if (!isActive) {
        return 'Asset is not linked to any service';
    }
    if (staticCount > 0) {
        return `Asset is permanently linked to ${staticCount} service(s)`;
    }
    return 'Asset is linked to service(s)';
}

function getWorkflowStageLabel(stage: string): string {
    const labels: Record<string, string> = {
        'Add': 'Adding Asset',
        'Submit': 'Submitted for QC',
        'QC': 'Under Review',
        'Approve': 'Approved',
        'Publish': 'Published'
    };
    return labels[stage] || 'Unknown';
}

function getWorkflowStageColor(stage: string): string {
    const colors: Record<string, string> = {
        'Add': '#6c757d',
        'Submit': '#17a2b8',
        'QC': '#ffc107',
        'Approve': '#28a745',
        'Publish': '#007bff'
    };
    return colors[stage] || '#6c757d';
}

function getWorkflowStageIcon(stage: string): string {
    const icons: Record<string, string> = {
        'Add': '📝',
        'Submit': '📤',
        'QC': '🔍',
        'Approve': '✔️',
        'Publish': '🚀'
    };
    return icons[stage] || '❓';
}

function getWorkflowStageDescription(stage: string): string {
    const descriptions: Record<string, string> = {
        'Add': 'Asset is being created',
        'Submit': 'Asset submitted for quality check',
        'QC': 'Asset is under quality review',
        'Approve': 'Asset has been approved',
        'Publish': 'Asset is published and active'
    };
    return descriptions[stage] || 'Unknown stage';
}

function getWorkflowProgress(stage: string): number {
    const progress: Record<string, number> = {
        'Add': 20,
        'Submit': 40,
        'QC': 60,
        'Approve': 80,
        'Publish': 100
    };
    return progress[stage] || 0;
}

function calculateReadiness(asset: any, staticCount: number): number {
    let readiness = 0;

    // QC Status (40%)
    if (asset.qc_status === 'Pass') readiness += 40;
    else if (asset.qc_status === 'Pending') readiness += 10;
    else if (asset.qc_status === 'Rework') readiness += 5;

    // Linking Status (30%)
    if (asset.linking_active === 1) readiness += 30;
    else if (staticCount > 0) readiness += 15;

    // Workflow Stage (30%)
    const stageProgress: Record<string, number> = {
        'Add': 5,
        'Submit': 10,
        'QC': 15,
        'Approve': 25,
        'Publish': 30
    };
    readiness += stageProgress[asset.workflow_stage] || 0;

    return Math.min(readiness, 100);
}

function getNextStep(asset: any, staticCount: number): string {
    if (asset.workflow_stage !== 'Publish') {
        return `Move to ${getNextStage(asset.workflow_stage)} stage`;
    }
    if (asset.qc_status !== 'Pass') {
        return 'Submit for QC review';
    }
    if (asset.linking_active !== 1) {
        return 'Activate linking to services';
    }
    return 'Asset is ready and published';
}

function getNextStage(currentStage: string): string {
    const stages = ['Add', 'Submit', 'QC', 'Approve', 'Publish'];
    const currentIndex = stages.indexOf(currentStage);
    return stages[currentIndex + 1] || 'Publish';
}

async function logStatusChange(assetId: number, fieldName: string, newValue: string, userId?: number) {
    try {
        await pool.query(
            `INSERT INTO asset_status_log (asset_id, field_name, new_value, changed_by, changed_at)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [assetId, fieldName, newValue, userId || null]
        );
    } catch (error) {
        console.error('Error logging status change:', error);
    }
}

import { Router } from 'express';
import {
    getAssetStatus,
    updateQCStatus,
    updateWorkflowStage,
    updateLinkingStatus,
    getStatusHistory
} from '../controllers/assetStatusController';

const router = Router();

/**
 * Asset Status Routes
 * Manages QC Status, Linking Status, and Workflow Stage
 */

// Get asset status (all 3 areas)
router.get('/assets/:asset_id/status', getAssetStatus);

// Update QC Status
router.post('/assets/:asset_id/qc-status', updateQCStatus);

// Update Workflow Stage
router.post('/assets/:asset_id/workflow-stage', updateWorkflowStage);

// Update Linking Status
router.post('/assets/:asset_id/linking-status', updateLinkingStatus);

// Get status history
router.get('/assets/:asset_id/status-history', getStatusHistory);

export default router;

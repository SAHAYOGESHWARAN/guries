import { Router } from 'express';
import {
    getPendingQCAssets,
    getAssetForQCReview,
    approveAsset,
    rejectAsset,
    requestRework,
    getQCReviewHistory,
    getQCStatistics
} from '../controllers/qcReviewController';

const router = Router();

/**
 * QC Review Routes
 * Handles asset approval/rejection and QC status updates
 */

// Get all assets pending QC review
router.get('/pending', getPendingQCAssets);

// Get single asset for QC review
router.get('/assets/:asset_id', getAssetForQCReview);

// Approve asset (QC Pass)
router.post('/assets/:asset_id/approve', approveAsset);

// Reject asset (QC Fail)
router.post('/assets/:asset_id/reject', rejectAsset);

// Request rework (QC Rework)
router.post('/assets/:asset_id/rework', requestRework);

// Get QC review history for asset
router.get('/assets/:asset_id/history', getQCReviewHistory);

// Get QC statistics
router.get('/statistics', getQCStatistics);

export default router;

import { Router } from 'express';
import { createAssetWithServiceLink } from '../controllers/assetUploadController';

const router = Router();

/**
 * Asset Upload Routes
 * Handles asset creation with automatic service linking
 */

// Create asset with automatic service linking
router.post('/upload-with-service', createAssetWithServiceLink);

export default router;

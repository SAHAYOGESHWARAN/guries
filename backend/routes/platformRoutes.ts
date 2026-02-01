import express from 'express';
import * as platformController from '../controllers/platformController';

const router = express.Router();

// Get all platforms
router.get('/', platformController.getPlatforms);

// Get platform by ID
router.get('/:id', platformController.getPlatformById);

// Create new platform
router.post('/', platformController.createPlatform);

// Update platform
router.put('/:id', platformController.updatePlatform);

// Delete platform
router.delete('/:id', platformController.deletePlatform);

// Bulk update status
router.post('/bulk/update-status', platformController.bulkUpdateStatus);

export default router;


import express from 'express';
import {
    getAssetCategories,
    createAssetCategory,
    updateAssetCategory,
    deleteAssetCategory,
    getAssetsByRepository,
    getRepositories
} from '../controllers/assetCategoryController';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// New endpoints for repository-based asset filtering (must come before /:id routes)
router.get('/repositories', asyncHandler(getRepositories));
router.get('/by-repository', asyncHandler(getAssetsByRepository));

// Standard CRUD endpoints
router.get('/', asyncHandler(getAssetCategories));
router.post('/', asyncHandler(createAssetCategory));
router.put('/:id', asyncHandler(updateAssetCategory));
router.delete('/:id', asyncHandler(deleteAssetCategory));

export default router;
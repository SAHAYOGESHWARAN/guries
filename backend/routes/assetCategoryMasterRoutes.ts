import express from 'express';
import {
    getAssetCategories,
    createAssetCategory,
    updateAssetCategory,
    deleteAssetCategory
} from '../controllers/assetCategoryController';

const router = express.Router();

// Get all asset categories
router.get('/', getAssetCategories);

// Create new asset category
router.post('/', createAssetCategory);

// Update asset category
router.put('/:id', updateAssetCategory);

// Delete asset category
router.delete('/:id', deleteAssetCategory);

export default router;


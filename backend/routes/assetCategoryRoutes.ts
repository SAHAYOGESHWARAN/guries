import express from 'express';
import {
    getAssetCategories,
    createAssetCategory,
    updateAssetCategory,
    deleteAssetCategory
} from '../controllers/assetCategoryController';

const router = express.Router();

router.get('/', getAssetCategories);
router.post('/', createAssetCategory);
router.put('/:id', updateAssetCategory);
router.delete('/:id', deleteAssetCategory);

export default router;
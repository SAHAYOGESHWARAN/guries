import express from 'express';
import {
    getAssetCategories,
    createAssetCategory,
    updateAssetCategory,
    deleteAssetCategory,
    getAssetsByRepository,
    getRepositories
} from '../controllers/assetCategoryController';

const router = express.Router();

router.get('/', getAssetCategories);
router.post('/', createAssetCategory);
router.put('/:id', updateAssetCategory);
router.delete('/:id', deleteAssetCategory);

// New endpoints for repository-based asset filtering
router.get('/repositories', getRepositories);
router.get('/by-repository', getAssetsByRepository);

export default router;
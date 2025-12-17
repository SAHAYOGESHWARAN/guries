import express from 'express';
import {
    getAssetFormats,
    createAssetFormat,
    updateAssetFormat,
    deleteAssetFormat
} from '../controllers/assetFormatController';

const router = express.Router();

router.get('/', getAssetFormats);
router.post('/', createAssetFormat);
router.put('/:id', updateAssetFormat);
router.delete('/:id', deleteAssetFormat);

export default router;
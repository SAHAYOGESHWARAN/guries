const express = require('express');
const {
    getAssetFormats,
    createAssetFormat,
    updateAssetFormat,
    deleteAssetFormat
} = require('../controllers/assetFormatController');

const router = express.Router();

router.get('/', getAssetFormats);
router.post('/', createAssetFormat);
router.put('/:id', updateAssetFormat);
router.delete('/:id', deleteAssetFormat);

module.exports = router;
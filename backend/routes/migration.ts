import express from 'express';
import { addAssetLinking } from '../migrations/add-asset-linking';

const router = express.Router();

router.post('/run-asset-linking', async (req, res) => {
    try {
        const result = await addAssetLinking();
        res.json({
            success: true,
            message: 'Asset linking migration completed successfully!',
            result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Migration failed',
            error: error.message
        });
    }
});

export default router;

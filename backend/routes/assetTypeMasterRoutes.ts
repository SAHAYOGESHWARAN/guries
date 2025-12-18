import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const router = express.Router();
const dbPath = path.join(__dirname, '../mcc_db.sqlite');

// Get all asset types
router.get('/', (req, res) => {
    try {
        const db = new Database(dbPath);
        const assetTypes = db.prepare(`
            SELECT * FROM asset_type_master 
            WHERE status = 'active' 
            ORDER BY brand, asset_type_name
        `).all();
        db.close();
        res.json(assetTypes);
    } catch (error) {
        console.error('Error fetching asset types:', error);
        res.status(500).json({ error: 'Failed to fetch asset types' });
    }
});

// Get asset types by brand
router.get('/brand/:brand', (req, res) => {
    try {
        const { brand } = req.params;
        const db = new Database(dbPath);
        const assetTypes = db.prepare(`
            SELECT * FROM asset_type_master 
            WHERE brand = ? AND status = 'active' 
            ORDER BY asset_type_name
        `).all(brand);
        db.close();
        res.json(assetTypes);
    } catch (error) {
        console.error('Error fetching asset types by brand:', error);
        res.status(500).json({ error: 'Failed to fetch asset types by brand' });
    }
});

// Create new asset type
router.post('/', (req, res) => {
    try {
        const { brand, asset_type_name, word_count } = req.body;

        if (!brand || !asset_type_name) {
            return res.status(400).json({ error: 'Brand and asset type name are required' });
        }

        const db = new Database(dbPath);

        // Check if asset type already exists for this brand
        const existing = db.prepare(`
            SELECT id FROM asset_type_master 
            WHERE brand = ? AND asset_type_name = ?
        `).get(brand, asset_type_name);

        if (existing) {
            db.close();
            return res.status(409).json({ error: 'Asset type already exists for this brand' });
        }

        const result = db.prepare(`
            INSERT INTO asset_type_master (brand, asset_type_name, word_count)
            VALUES (?, ?, ?)
        `).run(brand, asset_type_name, word_count || 0);

        const newAssetType = db.prepare(`
            SELECT * FROM asset_type_master WHERE id = ?
        `).get(result.lastInsertRowid);

        db.close();
        res.status(201).json(newAssetType);
    } catch (error) {
        console.error('Error creating asset type:', error);
        res.status(500).json({ error: 'Failed to create asset type' });
    }
});

// Update asset type
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { brand, asset_type_name, word_count, status } = req.body;

        const db = new Database(dbPath);

        const result = db.prepare(`
            UPDATE asset_type_master 
            SET brand = ?, asset_type_name = ?, word_count = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(brand, asset_type_name, word_count, status || 'active', id);

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Asset type not found' });
        }

        const updatedAssetType = db.prepare(`
            SELECT * FROM asset_type_master WHERE id = ?
        `).get(id);

        db.close();
        res.json(updatedAssetType);
    } catch (error) {
        console.error('Error updating asset type:', error);
        res.status(500).json({ error: 'Failed to update asset type' });
    }
});

// Delete asset type
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database(dbPath);

        const result = db.prepare(`
            UPDATE asset_type_master 
            SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Asset type not found' });
        }

        db.close();
        res.json({ message: 'Asset type deleted successfully' });
    } catch (error) {
        console.error('Error deleting asset type:', error);
        res.status(500).json({ error: 'Failed to delete asset type' });
    }
});

export default router;
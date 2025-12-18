const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../mcc_db.sqlite');

// Get all asset categories
router.get('/', (req, res) => {
    try {
        const db = new Database(dbPath);
        const categories = db.prepare(`
            SELECT * FROM asset_category_master 
            WHERE status = 'active' 
            ORDER BY brand, category_name
        `).all();
        db.close();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching asset categories:', error);
        res.status(500).json({ error: 'Failed to fetch asset categories' });
    }
});

// Get categories by brand
router.get('/brand/:brand', (req, res) => {
    try {
        const { brand } = req.params;
        const db = new Database(dbPath);
        const categories = db.prepare(`
            SELECT * FROM asset_category_master 
            WHERE brand = ? AND status = 'active' 
            ORDER BY category_name
        `).all(brand);
        db.close();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories by brand:', error);
        res.status(500).json({ error: 'Failed to fetch categories by brand' });
    }
});

// Create new asset category
router.post('/', (req, res) => {
    try {
        const { brand, category_name, word_count } = req.body;

        if (!brand || !category_name) {
            return res.status(400).json({ error: 'Brand and category name are required' });
        }

        const db = new Database(dbPath);

        // Check if category already exists for this brand
        const existing = db.prepare(`
            SELECT id FROM asset_category_master 
            WHERE brand = ? AND category_name = ?
        `).get(brand, category_name);

        if (existing) {
            db.close();
            return res.status(409).json({ error: 'Category already exists for this brand' });
        }

        const result = db.prepare(`
            INSERT INTO asset_category_master (brand, category_name, word_count)
            VALUES (?, ?, ?)
        `).run(brand, category_name, word_count || 0);

        const newCategory = db.prepare(`
            SELECT * FROM asset_category_master WHERE id = ?
        `).get(result.lastInsertRowid);

        db.close();
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating asset category:', error);
        res.status(500).json({ error: 'Failed to create asset category' });
    }
});

// Update asset category
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { brand, category_name, word_count, status } = req.body;

        const db = new Database(dbPath);

        const result = db.prepare(`
            UPDATE asset_category_master 
            SET brand = ?, category_name = ?, word_count = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(brand, category_name, word_count, status || 'active', id);

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Asset category not found' });
        }

        const updatedCategory = db.prepare(`
            SELECT * FROM asset_category_master WHERE id = ?
        `).get(id);

        db.close();
        res.json(updatedCategory);
    } catch (error) {
        console.error('Error updating asset category:', error);
        res.status(500).json({ error: 'Failed to update asset category' });
    }
});

// Delete asset category
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database(dbPath);

        const result = db.prepare(`
            UPDATE asset_category_master 
            SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Asset category not found' });
        }

        db.close();
        res.json({ message: 'Asset category deleted successfully' });
    } catch (error) {
        console.error('Error deleting asset category:', error);
        res.status(500).json({ error: 'Failed to delete asset category' });
    }
});

module.exports = router;
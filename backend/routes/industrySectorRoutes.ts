import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const router = express.Router();
const dbPath = path.join(__dirname, '../mcc_db.sqlite');

// Get unique industries (must come before parameterized routes)
router.get('/master/industries', (req, res) => {
    try {
        const db = new Database(dbPath);
        const industries = db.prepare(`
            SELECT DISTINCT industry FROM industry_sectors 
            WHERE status != 'deleted'
            ORDER BY industry
        `).all() as any[];
        db.close();
        res.json(industries.map(i => i.industry));
    } catch (error) {
        console.error('Error fetching industries:', error);
        res.status(500).json({ error: 'Failed to fetch industries' });
    }
});

// Get sectors by industry
router.get('/master/sectors/:industry', (req, res) => {
    try {
        const { industry } = req.params;
        const db = new Database(dbPath);
        const sectors = db.prepare(`
            SELECT DISTINCT sector FROM industry_sectors 
            WHERE industry = ? AND status != 'deleted'
            ORDER BY sector
        `).all(industry) as any[];
        db.close();
        res.json(sectors.map(s => s.sector));
    } catch (error) {
        console.error('Error fetching sectors:', error);
        res.status(500).json({ error: 'Failed to fetch sectors' });
    }
});

// Get applications by industry and sector
router.get('/master/applications/:industry/:sector', (req, res) => {
    try {
        const { industry, sector } = req.params;
        const db = new Database(dbPath);
        const applications = db.prepare(`
            SELECT DISTINCT application FROM industry_sectors 
            WHERE industry = ? AND sector = ? AND status != 'deleted'
            ORDER BY application
        `).all(industry, sector) as any[];
        db.close();
        res.json(applications.map(a => a.application));
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get unique countries
router.get('/master/countries', (req, res) => {
    try {
        const db = new Database(dbPath);
        const countries = db.prepare(`
            SELECT DISTINCT country FROM industry_sectors 
            WHERE status != 'deleted'
            ORDER BY country
        `).all() as any[];
        db.close();
        res.json(countries.map(c => c.country));
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

// Get all industry/sectors
router.get('/', (req, res) => {
    try {
        const db = new Database(dbPath);
        const items = db.prepare(`
            SELECT * FROM industry_sectors 
            WHERE status != 'deleted' 
            ORDER BY industry, sector, application
        `).all();
        db.close();
        res.json(items);
    } catch (error) {
        console.error('Error fetching industry/sectors:', error);
        res.status(500).json({ error: 'Failed to fetch industry/sectors' });
    }
});

// Get by industry
router.get('/industry/:industry', (req, res) => {
    try {
        const { industry } = req.params;
        const db = new Database(dbPath);
        const items = db.prepare(`
            SELECT * FROM industry_sectors 
            WHERE industry = ? AND status != 'deleted'
            ORDER BY sector, application
        `).all(industry);
        db.close();
        res.json(items);
    } catch (error) {
        console.error('Error fetching by industry:', error);
        res.status(500).json({ error: 'Failed to fetch by industry' });
    }
});

// Get by country
router.get('/country/:country', (req, res) => {
    try {
        const { country } = req.params;
        const db = new Database(dbPath);
        const items = db.prepare(`
            SELECT * FROM industry_sectors 
            WHERE country = ? AND status != 'deleted'
            ORDER BY industry, sector
        `).all(country);
        db.close();
        res.json(items);
    } catch (error) {
        console.error('Error fetching by country:', error);
        res.status(500).json({ error: 'Failed to fetch by country' });
    }
});

// Create new industry/sector
router.post('/', (req, res) => {
    try {
        const { industry, sector, application, country, description, status } = req.body;

        if (!industry || !sector || !application || !country) {
            return res.status(400).json({
                error: 'Industry, sector, application, and country are required'
            });
        }

        const db = new Database(dbPath);

        // Check if already exists
        const existing = db.prepare(`
            SELECT id FROM industry_sectors 
            WHERE industry = ? AND sector = ? AND application = ? AND country = ?
        `).get(industry, sector, application, country);

        if (existing) {
            db.close();
            return res.status(409).json({ error: 'This industry/sector combination already exists' });
        }

        const result = db.prepare(`
            INSERT INTO industry_sectors 
            (industry, sector, application, country, description, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(industry, sector, application, country, description || '', status || 'active');

        const newItem = db.prepare(`
            SELECT * FROM industry_sectors WHERE id = ?
        `).get(result.lastInsertRowid);

        db.close();
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating industry/sector:', error);
        res.status(500).json({ error: 'Failed to create industry/sector' });
    }
});

// Update industry/sector
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { industry, sector, application, country, description, status } = req.body;

        const db = new Database(dbPath);

        const result = db.prepare(`
            UPDATE industry_sectors 
            SET industry = ?, sector = ?, application = ?, country = ?, 
                description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(industry, sector, application, country, description || '', status || 'active', id);

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Industry/sector not found' });
        }

        const updatedItem = db.prepare(`
            SELECT * FROM industry_sectors WHERE id = ?
        `).get(id);

        db.close();
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating industry/sector:', error);
        res.status(500).json({ error: 'Failed to update industry/sector' });
    }
});

// Delete industry/sector (soft delete)
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database(dbPath);

        const result = db.prepare(`
            UPDATE industry_sectors 
            SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Industry/sector not found' });
        }

        db.close();
        res.json({ message: 'Industry/sector deleted successfully' });
    } catch (error) {
        console.error('Error deleting industry/sector:', error);
        res.status(500).json({ error: 'Failed to delete industry/sector' });
    }
});

export default router;


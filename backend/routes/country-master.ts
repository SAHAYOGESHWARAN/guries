import express, { Request, Response } from 'express';
import { db } from '../config/db-sqlite';

const router = express.Router();

// Get all countries
router.get('/', (req: Request, res: Response) => {
    try {
        const countries = db.prepare(`
      SELECT * FROM country_master
      ORDER BY country_name
    `).all();

        res.json(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

// Get country by ID
router.get('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const country = db.prepare(`
      SELECT * FROM country_master WHERE id = ?
    `).get(id);

        if (!country) {
            return res.status(404).json({ error: 'Country not found' });
        }

        res.json(country);
    } catch (error) {
        console.error('Error fetching country:', error);
        res.status(500).json({ error: 'Failed to fetch country' });
    }
});

// Create new country
router.post('/', (req: Request, res: Response) => {
    try {
        const {
            country_name,
            iso_code,
            region,
            default_language,
            allowed_for_backlinks,
            allowed_for_content_targeting,
            allowed_for_smm_targeting,
            status
        } = req.body;

        // Validation
        if (!country_name || !iso_code || !region) {
            return res.status(400).json({
                error: 'Country name, ISO code, and region are required'
            });
        }

        // Insert country
        const result = db.prepare(`
      INSERT INTO country_master (
        country_name,
        iso_code,
        region,
        default_language,
        allowed_for_backlinks,
        allowed_for_content_targeting,
        allowed_for_smm_targeting,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            country_name,
            iso_code,
            region,
            default_language || null,
            allowed_for_backlinks ? 1 : 0,
            allowed_for_content_targeting ? 1 : 0,
            allowed_for_smm_targeting ? 1 : 0,
            status || 'active'
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            country_name,
            iso_code,
            region,
            default_language,
            allowed_for_backlinks,
            allowed_for_content_targeting,
            allowed_for_smm_targeting,
            status: status || 'active',
            message: 'Country created successfully'
        });
    } catch (error: any) {
        console.error('Error creating country:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({
                error: 'Country name or ISO code already exists'
            });
        }
        res.status(500).json({ error: 'Failed to create country' });
    }
});

// Update country
router.put('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            country_name,
            iso_code,
            region,
            default_language,
            allowed_for_backlinks,
            allowed_for_content_targeting,
            allowed_for_smm_targeting,
            status
        } = req.body;

        // Validation
        if (!country_name || !iso_code || !region) {
            return res.status(400).json({
                error: 'Country name, ISO code, and region are required'
            });
        }

        // Update country
        const result = db.prepare(`
      UPDATE country_master
      SET
        country_name = ?,
        iso_code = ?,
        region = ?,
        default_language = ?,
        allowed_for_backlinks = ?,
        allowed_for_content_targeting = ?,
        allowed_for_smm_targeting = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
            country_name,
            iso_code,
            region,
            default_language || null,
            allowed_for_backlinks ? 1 : 0,
            allowed_for_content_targeting ? 1 : 0,
            allowed_for_smm_targeting ? 1 : 0,
            status || 'active',
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Country not found' });
        }

        res.json({ message: 'Country updated successfully' });
    } catch (error: any) {
        console.error('Error updating country:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({
                error: 'Country name or ISO code already exists'
            });
        }
        res.status(500).json({ error: 'Failed to update country' });
    }
});

// Delete country
router.delete('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = db.prepare('DELETE FROM country_master WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Country not found' });
        }

        res.json({ message: 'Country deleted successfully' });
    } catch (error) {
        console.error('Error deleting country:', error);
        res.status(500).json({ error: 'Failed to delete country' });
    }
});

// Get countries by region
router.get('/region/:region', (req: Request, res: Response) => {
    try {
        const { region } = req.params;

        const countries = db.prepare(`
      SELECT * FROM country_master
      WHERE region = ?
      ORDER BY country_name
    `).all(region);

        res.json(countries);
    } catch (error) {
        console.error('Error fetching countries by region:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

// Get available regions
router.get('/list/regions', (req: Request, res: Response) => {
    try {
        const regions = db.prepare(`
      SELECT DISTINCT region FROM country_master
      ORDER BY region
    `).all();

        res.json(regions.map(r => r.region));
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({ error: 'Failed to fetch regions' });
    }
});

export default router;

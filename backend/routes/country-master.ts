import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

// Get all countries
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM country_master
      ORDER BY country_name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

// Get country by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT * FROM country_master WHERE id = $1
    `, [id]);

        const country = result.rows[0];

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
router.post('/', async (req: Request, res: Response) => {
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
        const result = await pool.query(`
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
            country_name,
            iso_code,
            region,
            default_language || null,
            allowed_for_backlinks ? true : false,
            allowed_for_content_targeting ? true : false,
            allowed_for_smm_targeting ? true : false,
            status || 'active'
        ]);

        res.status(201).json({
            id: result.rows[0].id,
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
        if (error.code === '23505' || error.message.includes('unique constraint')) {
            return res.status(400).json({
                error: 'Country name or ISO code already exists'
            });
        }
        res.status(500).json({ error: 'Failed to create country' });
    }
});

// Update country
router.put('/:id', async (req: Request, res: Response) => {
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
        const result = await pool.query(`
      UPDATE country_master
      SET
        country_name = $1,
        iso_code = $2,
        region = $3,
        default_language = $4,
        allowed_for_backlinks = $5,
        allowed_for_content_targeting = $6,
        allowed_for_smm_targeting = $7,
        status = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
    `, [
            country_name,
            iso_code,
            region,
            default_language || null,
            allowed_for_backlinks ? true : false,
            allowed_for_content_targeting ? true : false,
            allowed_for_smm_targeting ? true : false,
            status || 'active',
            id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Country not found' });
        }

        res.json({ message: 'Country updated successfully' });
    } catch (error: any) {
        console.error('Error updating country:', error);
        if (error.code === '23505' || error.message.includes('unique constraint')) {
            return res.status(400).json({
                error: 'Country name or ISO code already exists'
            });
        }
        res.status(500).json({ error: 'Failed to update country' });
    }
});

// Delete country
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM country_master WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Country not found' });
        }

        res.json({ message: 'Country deleted successfully' });
    } catch (error) {
        console.error('Error deleting country:', error);
        res.status(500).json({ error: 'Failed to delete country' });
    }
});

// Get countries by region
router.get('/region/:region', async (req: Request, res: Response) => {
    try {
        const { region } = req.params;

        const result = await pool.query(`
      SELECT * FROM country_master
      WHERE region = $1
      ORDER BY country_name
    `, [region]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching countries by region:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

// Get available regions
router.get('/list/regions', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT DISTINCT region FROM country_master
      ORDER BY region
    `);

        res.json(result.rows.map((r: any) => r.region));
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({ error: 'Failed to fetch regions' });
    }
});

export default router;


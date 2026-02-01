import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

// Predefined error types
const PREDEFINED_ERROR_TYPES = [
    'On-page',
    'Technical SEO',
    'Schema Errors',
    'Meta Tag Missing',
    'Image Alt Missing',
    'LCP Issue',
    'CLS Issue',
    'HTML Errors',
    'Content Thin',
    'Redirect Loops',
    'Broken Links'
];

// Get all SEO error types
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM seo_error_type_master
      ORDER BY error_type
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching SEO error types:', error);
        res.status(500).json({ error: 'Failed to fetch SEO error types' });
    }
});

// Get SEO error type by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT * FROM seo_error_type_master WHERE id = $1
    `, [id]);

        const errorType = result.rows[0];

        if (!errorType) {
            return res.status(404).json({ error: 'SEO error type not found' });
        }

        res.json(errorType);
    } catch (error) {
        console.error('Error fetching SEO error type:', error);
        res.status(500).json({ error: 'Failed to fetch SEO error type' });
    }
});

// Create new SEO error type
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            error_type,
            category,
            severity_level,
            description,
            status
        } = req.body;

        // Validation
        if (!error_type || !category || !severity_level || !description) {
            return res.status(400).json({
                error: 'Error type, category, severity level, and description are required'
            });
        }

        // Validate severity level
        if (!['Low', 'Medium', 'High'].includes(severity_level)) {
            return res.status(400).json({
                error: 'Severity level must be Low, Medium, or High'
            });
        }

        // Insert error type
        const result = await pool.query(`
      INSERT INTO seo_error_type_master (
        error_type,
        category,
        severity_level,
        description,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
            error_type,
            category,
            severity_level,
            description,
            status || 'active'
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            error_type,
            category,
            severity_level,
            description,
            status: status || 'active',
            message: 'SEO error type created successfully'
        });
    } catch (error: any) {
        console.error('Error creating SEO error type:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({
                error: 'Error type already exists'
            });
        }
        res.status(500).json({ error: 'Failed to create SEO error type' });
    }
});

// Update SEO error type
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            error_type,
            category,
            severity_level,
            description,
            status
        } = req.body;

        // Validation
        if (!error_type || !category || !severity_level || !description) {
            return res.status(400).json({
                error: 'Error type, category, severity level, and description are required'
            });
        }

        // Validate severity level
        if (!['Low', 'Medium', 'High'].includes(severity_level)) {
            return res.status(400).json({
                error: 'Severity level must be Low, Medium, or High'
            });
        }

        // Update error type
        const result = await pool.query(`
      UPDATE seo_error_type_master
      SET
        error_type = $1,
        category = $2,
        severity_level = $3,
        description = $4,
        status = $5,
        updated_at = NOW()
      WHERE id = $6
    `, [
            error_type,
            category,
            severity_level,
            description,
            status || 'active',
            id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'SEO error type not found' });
        }

        res.json({ message: 'SEO error type updated successfully' });
    } catch (error: any) {
        console.error('Error updating SEO error type:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({
                error: 'Error type already exists'
            });
        }
        res.status(500).json({ error: 'Failed to update SEO error type' });
    }
});

// Delete SEO error type
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM seo_error_type_master WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'SEO error type not found' });
        }

        res.json({ message: 'SEO error type deleted successfully' });
    } catch (error) {
        console.error('Error deleting SEO error type:', error);
        res.status(500).json({ error: 'Failed to delete SEO error type' });
    }
});

// Get predefined error types
router.get('/list/predefined', (req: Request, res: Response) => {
    try {
        res.json(PREDEFINED_ERROR_TYPES);
    } catch (error) {
        console.error('Error fetching predefined error types:', error);
        res.status(500).json({ error: 'Failed to fetch predefined error types' });
    }
});

// Get error types by category
router.get('/category/:category', async (req: Request, res: Response) => {
    try {
        const { category } = req.params;

        const result = await pool.query(`
      SELECT * FROM seo_error_type_master
      WHERE category = $1
      ORDER BY error_type
    `, [category]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching error types by category:', error);
        res.status(500).json({ error: 'Failed to fetch error types' });
    }
});

// Get error types by severity
router.get('/severity/:severity', async (req: Request, res: Response) => {
    try {
        const { severity } = req.params;

        const result = await pool.query(`
      SELECT * FROM seo_error_type_master
      WHERE severity_level = $1
      ORDER BY error_type
    `, [severity]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching error types by severity:', error);
        res.status(500).json({ error: 'Failed to fetch error types' });
    }
});

// Get available categories
router.get('/list/categories', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT DISTINCT category FROM seo_error_type_master
      ORDER BY category
    `);

        res.json(result.rows.map((c: any) => c.category));
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;


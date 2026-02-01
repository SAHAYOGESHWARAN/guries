import express, { Request, Response } from 'express';
import { db } from '../config/db';

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
router.get('/', (req: Request, res: Response) => {
    try {
        const errorTypes = db.prepare(`
      SELECT * FROM seo_error_type_master
      ORDER BY error_type
    `).all();

        res.json(errorTypes);
    } catch (error) {
        console.error('Error fetching SEO error types:', error);
        res.status(500).json({ error: 'Failed to fetch SEO error types' });
    }
});

// Get SEO error type by ID
router.get('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const errorType = db.prepare(`
      SELECT * FROM seo_error_type_master WHERE id = ?
    `).get(id);

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
router.post('/', (req: Request, res: Response) => {
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
        const result = db.prepare(`
      INSERT INTO seo_error_type_master (
        error_type,
        category,
        severity_level,
        description,
        status
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(
            error_type,
            category,
            severity_level,
            description,
            status || 'active'
        );

        res.status(201).json({
            id: result.lastInsertRowid,
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
router.put('/:id', (req: Request, res: Response) => {
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
        const result = db.prepare(`
      UPDATE seo_error_type_master
      SET
        error_type = ?,
        category = ?,
        severity_level = ?,
        description = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
            error_type,
            category,
            severity_level,
            description,
            status || 'active',
            id
        );

        if (result.changes === 0) {
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
router.delete('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = db.prepare('DELETE FROM seo_error_type_master WHERE id = ?').run(id);

        if (result.changes === 0) {
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
router.get('/category/:category', (req: Request, res: Response) => {
    try {
        const { category } = req.params;

        const errorTypes = db.prepare(`
      SELECT * FROM seo_error_type_master
      WHERE category = ?
      ORDER BY error_type
    `).all(category);

        res.json(errorTypes);
    } catch (error) {
        console.error('Error fetching error types by category:', error);
        res.status(500).json({ error: 'Failed to fetch error types' });
    }
});

// Get error types by severity
router.get('/severity/:severity', (req: Request, res: Response) => {
    try {
        const { severity } = req.params;

        const errorTypes = db.prepare(`
      SELECT * FROM seo_error_type_master
      WHERE severity_level = ?
      ORDER BY error_type
    `).all(severity);

        res.json(errorTypes);
    } catch (error) {
        console.error('Error fetching error types by severity:', error);
        res.status(500).json({ error: 'Failed to fetch error types' });
    }
});

// Get available categories
router.get('/list/categories', (req: Request, res: Response) => {
    try {
        const categories = db.prepare(`
      SELECT DISTINCT category FROM seo_error_type_master
      ORDER BY category
    `).all() as any[];

        res.json(categories.map(c => c.category));
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;

import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

export const getAssetCategories = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const categories = db.prepare(`
            SELECT id, category_name, description, status, created_at, updated_at
            FROM asset_category_master 
            WHERE status = 'active'
            ORDER BY category_name ASC
        `).all();

        res.json(categories);
    } catch (error) {
        console.error('Error fetching asset categories:', error);
        res.status(500).json({ error: 'Failed to fetch asset categories' });
    } finally {
        db.close();
    }
};

export const createAssetCategory = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const { category_name, description } = req.body;

        if (!category_name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const result = db.prepare(`
            INSERT INTO asset_category_master (category_name, description)
            VALUES (?, ?)
        `).run(category_name, description || null);

        const newCategory = db.prepare(`
            SELECT id, category_name, description, status, created_at, updated_at
            FROM asset_category_master 
            WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating asset category:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'Category name already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create asset category' });
        }
    } finally {
        db.close();
    }
};

export const updateAssetCategory = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const { id } = req.params;
        const { category_name, description, status } = req.body;

        const result = db.prepare(`
            UPDATE asset_category_master 
            SET category_name = COALESCE(?, category_name),
                description = COALESCE(?, description),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(category_name, description, status, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Asset category not found' });
        }

        const updatedCategory = db.prepare(`
            SELECT id, category_name, description, status, created_at, updated_at
            FROM asset_category_master 
            WHERE id = ?
        `).get(id);

        res.json(updatedCategory);
    } catch (error) {
        console.error('Error updating asset category:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'Category name already exists' });
        } else {
            res.status(500).json({ error: 'Failed to update asset category' });
        }
    } finally {
        db.close();
    }
};

export const deleteAssetCategory = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const { id } = req.params;

        // Soft delete by setting status to 'inactive'
        const result = db.prepare(`
            UPDATE asset_category_master 
            SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Asset category not found' });
        }

        res.json({ message: 'Asset category deleted successfully' });
    } catch (error) {
        console.error('Error deleting asset category:', error);
        res.status(500).json({ error: 'Failed to delete asset category' });
    } finally {
        db.close();
    }
};
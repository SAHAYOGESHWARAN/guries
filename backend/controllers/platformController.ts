import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

// Get all platforms
export const getPlatforms = async (req: Request, res: Response) => {
    try {
        const db = new Database(dbPath);
        const platforms = db.prepare(`
            SELECT 
                id, 
                platform_name, 
                recommended_size, 
                scheduling, 
                status, 
                created_at, 
                updated_at
            FROM platforms 
            WHERE status != 'deleted'
            ORDER BY platform_name ASC
        `).all();
        db.close();
        res.json(platforms);
    } catch (error) {
        console.error('Error fetching platforms:', error);
        res.status(500).json({ error: 'Failed to fetch platforms' });
    }
};

// Get platform by ID
export const getPlatformById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const db = new Database(dbPath);
        const platform = db.prepare(`
            SELECT * FROM platforms WHERE id = ? AND status != 'deleted'
        `).get(id);
        db.close();

        if (!platform) {
            return res.status(404).json({ error: 'Platform not found' });
        }

        res.json(platform);
    } catch (error) {
        console.error('Error fetching platform:', error);
        res.status(500).json({ error: 'Failed to fetch platform' });
    }
};

// Create new platform
export const createPlatform = async (req: Request, res: Response) => {
    try {
        const {
            platform_name,
            recommended_size,
            scheduling,
            status = 'active'
        } = req.body;

        // Validation
        if (!platform_name || !platform_name.trim()) {
            return res.status(400).json({ error: 'Platform name is required' });
        }

        if (!scheduling || !['Manual', 'Auto', 'Both'].includes(scheduling)) {
            return res.status(400).json({ error: 'Valid scheduling option is required (Manual, Auto, or Both)' });
        }

        const db = new Database(dbPath);

        // Check if platform already exists
        const existing = db.prepare(`
            SELECT id FROM platforms 
            WHERE LOWER(platform_name) = LOWER(?) AND status != 'deleted'
        `).get(platform_name.trim());

        if (existing) {
            db.close();
            return res.status(409).json({ error: 'Platform with this name already exists' });
        }

        // Insert new platform
        const result = db.prepare(`
            INSERT INTO platforms (platform_name, recommended_size, scheduling, status)
            VALUES (?, ?, ?, ?)
        `).run(
            platform_name.trim(),
            recommended_size || null,
            scheduling,
            status.toLowerCase()
        );

        // Fetch the created platform
        const newPlatform = db.prepare(`
            SELECT * FROM platforms WHERE id = ?
        `).get(result.lastInsertRowid);

        db.close();
        res.status(201).json(newPlatform);
    } catch (error) {
        console.error('Error creating platform:', error);
        res.status(500).json({ error: 'Failed to create platform' });
    }
};

// Update platform
export const updatePlatform = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            platform_name,
            recommended_size,
            scheduling,
            status
        } = req.body;

        // Validation
        if (platform_name && !platform_name.trim()) {
            return res.status(400).json({ error: 'Platform name cannot be empty' });
        }

        if (scheduling && !['Manual', 'Auto', 'Both'].includes(scheduling)) {
            return res.status(400).json({ error: 'Valid scheduling option is required (Manual, Auto, or Both)' });
        }

        const db = new Database(dbPath);

        // Check if platform exists
        const existing = db.prepare(`
            SELECT id FROM platforms WHERE id = ? AND status != 'deleted'
        `).get(id);

        if (!existing) {
            db.close();
            return res.status(404).json({ error: 'Platform not found' });
        }

        // Check for duplicate name (if updating name)
        if (platform_name) {
            const duplicate = db.prepare(`
                SELECT id FROM platforms 
                WHERE LOWER(platform_name) = LOWER(?) AND id != ? AND status != 'deleted'
            `).get(platform_name.trim(), id);

            if (duplicate) {
                db.close();
                return res.status(409).json({ error: 'Platform with this name already exists' });
            }
        }

        // Update platform
        const result = db.prepare(`
            UPDATE platforms 
            SET 
                platform_name = COALESCE(?, platform_name),
                recommended_size = COALESCE(?, recommended_size),
                scheduling = COALESCE(?, scheduling),
                status = COALESCE(?, status),
                updated_at = datetime('now')
            WHERE id = ?
        `).run(
            platform_name ? platform_name.trim() : null,
            recommended_size || null,
            scheduling || null,
            status ? status.toLowerCase() : null,
            id
        );

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Platform not found' });
        }

        // Fetch updated platform
        const updatedPlatform = db.prepare(`
            SELECT * FROM platforms WHERE id = ?
        `).get(id);

        db.close();
        res.json(updatedPlatform);
    } catch (error) {
        console.error('Error updating platform:', error);
        res.status(500).json({ error: 'Failed to update platform' });
    }
};

// Delete platform (soft delete)
export const deletePlatform = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const db = new Database(dbPath);

        // Check if platform exists
        const existing = db.prepare(`
            SELECT id FROM platforms WHERE id = ? AND status != 'deleted'
        `).get(id);

        if (!existing) {
            db.close();
            return res.status(404).json({ error: 'Platform not found' });
        }

        // Soft delete
        const result = db.prepare(`
            UPDATE platforms 
            SET status = 'deleted', updated_at = datetime('now')
            WHERE id = ?
        `).run(id);

        db.close();
        res.json({ message: 'Platform deleted successfully', id });
    } catch (error) {
        console.error('Error deleting platform:', error);
        res.status(500).json({ error: 'Failed to delete platform' });
    }
};

// Bulk operations
export const bulkUpdateStatus = async (req: Request, res: Response) => {
    try {
        const { ids, status } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Platform IDs array is required' });
        }

        if (!status || !['active', 'inactive'].includes(status.toLowerCase())) {
            return res.status(400).json({ error: 'Valid status is required (active or inactive)' });
        }

        const db = new Database(dbPath);
        const placeholders = ids.map(() => '?').join(',');

        const result = db.prepare(`
            UPDATE platforms 
            SET status = ?, updated_at = datetime('now')
            WHERE id IN (${placeholders}) AND status != 'deleted'
        `).run(status.toLowerCase(), ...ids);

        db.close();
        res.json({ message: 'Platforms updated successfully', updated: result.changes });
    } catch (error) {
        console.error('Error bulk updating platforms:', error);
        res.status(500).json({ error: 'Failed to bulk update platforms' });
    }
};





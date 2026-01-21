import Database from 'better-sqlite3';
import path from 'path';
import { Request, Response } from 'express';

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

export const getAssetFormats = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const { application_type } = req.query;

        let query = `
            SELECT id, format_name, format_type, file_extensions, max_file_size_mb, 
                   description, application_types, status, created_at, updated_at
            FROM asset_format_master 
            WHERE status = 'active'
        `;

        const params: any[] = [];

        // Filter by application type if provided
        if (application_type) {
            query += ` AND application_types LIKE ?`;
            params.push(`%"${application_type}"%`);
        }

        query += ` ORDER BY format_name ASC`;

        const formats = db.prepare(query).all(...params);

        // Parse JSON fields
        const formattedFormats = formats.map((format: any) => ({
            ...format,
            file_extensions: JSON.parse(format.file_extensions || '[]'),
            application_types: JSON.parse(format.application_types || '[]')
        }));

        res.json(formattedFormats);
    } catch (error) {
        console.error('Error fetching asset formats:', error);
        res.status(500).json({ error: 'Failed to fetch asset formats' });
    } finally {
        db.close();
    }
};

export const createAssetFormat = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const { format_name, format_type, file_extensions, max_file_size_mb, description, application_types } = req.body;

        if (!format_name || !format_type) {
            return res.status(400).json({ error: 'Format name and type are required' });
        }

        const result = db.prepare(`
            INSERT INTO asset_format_master (format_name, format_type, file_extensions, max_file_size_mb, description, application_types)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            format_name,
            format_type,
            JSON.stringify(file_extensions || []),
            max_file_size_mb || 50,
            description || null,
            JSON.stringify(application_types || [])
        );

        const newFormat = db.prepare(`
            SELECT id, format_name, format_type, file_extensions, max_file_size_mb, 
                   description, application_types, status, created_at, updated_at
            FROM asset_format_master 
            WHERE id = ?
        `).get(result.lastInsertRowid);

        // Parse JSON fields
        const formattedFormat = {
            ...(newFormat as any),
            file_extensions: JSON.parse((newFormat as any).file_extensions || '[]'),
            application_types: JSON.parse((newFormat as any).application_types || '[]')
        };

        res.status(201).json(formattedFormat);
    } catch (error: any) {
        console.error('Error creating asset format:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'Format name already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create asset format' });
        }
    } finally {
        db.close();
    }
};

export const updateAssetFormat = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const { id } = req.params;
        const { format_name, format_type, file_extensions, max_file_size_mb, description, application_types, status } = req.body;

        const result = db.prepare(`
            UPDATE asset_format_master 
            SET format_name = COALESCE(?, format_name),
                format_type = COALESCE(?, format_type),
                file_extensions = COALESCE(?, file_extensions),
                max_file_size_mb = COALESCE(?, max_file_size_mb),
                description = COALESCE(?, description),
                application_types = COALESCE(?, application_types),
                status = COALESCE(?, status),
                updated_at = datetime('now')
            WHERE id = ?
        `).run(
            format_name,
            format_type,
            file_extensions ? JSON.stringify(file_extensions) : null,
            max_file_size_mb,
            description,
            application_types ? JSON.stringify(application_types) : null,
            status,
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Asset format not found' });
        }

        const updatedFormat = db.prepare(`
            SELECT id, format_name, format_type, file_extensions, max_file_size_mb, 
                   description, application_types, status, created_at, updated_at
            FROM asset_format_master 
            WHERE id = ?
        `).get(id);

        // Parse JSON fields
        const formattedFormat = {
            ...(updatedFormat as any),
            file_extensions: JSON.parse((updatedFormat as any).file_extensions || '[]'),
            application_types: JSON.parse((updatedFormat as any).application_types || '[]')
        };

        res.json(formattedFormat);
    } catch (error: any) {
        console.error('Error updating asset format:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'Format name already exists' });
        } else {
            res.status(500).json({ error: 'Failed to update asset format' });
        }
    } finally {
        db.close();
    }
};

export const deleteAssetFormat = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const { id } = req.params;

        // Soft delete by setting status to 'inactive'
        const result = db.prepare(`
            UPDATE asset_format_master 
            SET status = 'inactive', updated_at = datetime('now')
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Asset format not found' });
        }

        res.json({ message: 'Asset format deleted successfully' });
    } catch (error) {
        console.error('Error deleting asset format:', error);
        res.status(500).json({ error: 'Failed to delete asset format' });
    } finally {
        db.close();
    }
};




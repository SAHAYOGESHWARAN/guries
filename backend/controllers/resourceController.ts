
import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

// --- Keywords ---
export const getKeywords = async (req: any, res: any) => {
    const db = new Database(dbPath);

    try {
        const keywords = db.prepare(`
            SELECT id, keyword, keyword_type, search_volume, competition, mapped_service, created_at,
                   0 as usage_count
            FROM keywords 
            ORDER BY keyword ASC
        `).all();

        res.status(200).json(keywords);
    } catch (error: any) {
        console.error('Keywords query error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        db.close();
    }
};

export const createKeyword = async (req: any, res: any) => {
    const db = new Database(dbPath);

    try {
        const { keyword, keyword_type, search_volume, competition, mapped_service } = req.body;

        const result = db.prepare(`
            INSERT INTO keywords (keyword, keyword_type, search_volume, competition, mapped_service)
            VALUES (?, ?, ?, ?, ?)
        `).run(keyword, keyword_type, search_volume || 0, competition, mapped_service);

        const newKeyword = db.prepare(`
            SELECT id, keyword, keyword_type, search_volume, competition, mapped_service, created_at
            FROM keywords 
            WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(newKeyword);
    } catch (error: any) {
        console.error('Create keyword error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        db.close();
    }
};

export const updateKeyword = async (req: any, res: any) => {
    const db = new Database(dbPath);

    try {
        const { id } = req.params;
        const { keyword, keyword_type, search_volume, competition, mapped_service } = req.body;

        const result = db.prepare(`
            UPDATE keywords 
            SET keyword = ?, keyword_type = ?, search_volume = ?, competition = ?, mapped_service = ?
            WHERE id = ?
        `).run(keyword, keyword_type, search_volume || 0, competition, mapped_service, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Keyword not found' });
        }

        const updatedKeyword = db.prepare(`
            SELECT id, keyword, keyword_type, search_volume, competition, mapped_service, created_at
            FROM keywords 
            WHERE id = ?
        `).get(id);

        res.status(200).json(updatedKeyword);
    } catch (error: any) {
        console.error('Update keyword error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        db.close();
    }
};

export const deleteKeyword = async (req: any, res: any) => {
    const db = new Database(dbPath);

    try {
        const { id } = req.params;

        const result = db.prepare(`
            DELETE FROM keywords WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Keyword not found' });
        }

        res.status(204).send();
    } catch (error: any) {
        console.error('Delete keyword error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        db.close();
    }
};

// --- Backlinks ---
export const getBacklinks = async (req: any, res: any) => {
    const db = new Database(dbPath);

    try {
        const backlinks = db.prepare(`
            SELECT * FROM backlinks ORDER BY id DESC
        `).all();

        res.status(200).json(backlinks);
    } catch (error: any) {
        console.error('Backlinks query error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        db.close();
    }
};

export const createBacklink = async (req: any, res: any) => {
    const db = new Database(dbPath);

    try {
        const { domain, platform_type, da_score, spam_score, country, pricing, status } = req.body;

        const result = db.prepare(`
            INSERT INTO backlinks (domain, platform_type, da_score, spam_score, country, pricing, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(domain, platform_type, da_score, spam_score, country, pricing, status);

        const newBacklink = db.prepare(`
            SELECT * FROM backlinks WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(newBacklink);
    } catch (error: any) {
        console.error('Create backlink error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        db.close();
    }
};

export const updateBacklink = async (req: any, res: any) => {
    const db = new Database(dbPath);

    try {
        const { id } = req.params;
        const { domain, platform_type, da_score, spam_score, country, pricing, status } = req.body;

        const result = db.prepare(`
            UPDATE backlinks 
            SET domain = ?, platform_type = ?, da_score = ?, spam_score = ?, country = ?, pricing = ?, status = ?
            WHERE id = ?
        `).run(domain, platform_type, da_score, spam_score, country, pricing, status, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Backlink not found' });
        }

        const updatedBacklink = db.prepare(`
            SELECT * FROM backlinks WHERE id = ?
        `).get(id);

        res.status(200).json(updatedBacklink);
    } catch (error: any) {
        console.error('Update backlink error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        db.close();
    }
};

export const deleteBacklink = async (req: any, res: any) => {
    const db = new Database(dbPath);

    try {
        const { id } = req.params;

        const result = db.prepare(`
            DELETE FROM backlinks WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Backlink not found' });
        }

        res.status(204).send();
    } catch (error: any) {
        console.error('Delete backlink error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        db.close();
    }
};
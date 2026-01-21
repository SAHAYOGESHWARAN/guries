
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';

export const getArticles = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM knowledge_articles ORDER BY updated_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createArticle = async (req: Request, res: Response) => {
    const { title, content, category, tags, language, author_id, status } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO knowledge_articles (title, content, category, tags, language, author_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
            [title, content, category, JSON.stringify(tags), language, author_id, status || 'draft']
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateArticle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content, category, tags, status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE knowledge_articles SET 
                title=COALESCE(?, title), 
                content=COALESCE(?, content), 
                category=COALESCE(?, category), 
                tags=COALESCE(?, tags), 
                status=COALESCE(?, status), 
                updated_at=datetime('now') 
            WHERE id=?`,
            [title, content, category, JSON.stringify(tags), status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteArticle = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM knowledge_articles WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};




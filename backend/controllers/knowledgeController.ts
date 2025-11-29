
import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getArticles = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM knowledge_articles ORDER BY updated_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createArticle = async (req: any, res: any) => {
    const { title, content, category, tags, language, author_id, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO knowledge_articles (title, content, category, tags, language, author_id, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
            [title, content, category, JSON.stringify(tags), language, author_id, status || 'draft']
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateArticle = async (req: any, res: any) => {
    const { id } = req.params;
    const { title, content, category, tags, status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE knowledge_articles SET 
                title=COALESCE($1, title), 
                content=COALESCE($2, content), 
                category=COALESCE($3, category), 
                tags=COALESCE($4, tags), 
                status=COALESCE($5, status), 
                updated_at=NOW() 
            WHERE id=$6 RETURNING *`,
            [title, content, category, JSON.stringify(tags), status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteArticle = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM knowledge_articles WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

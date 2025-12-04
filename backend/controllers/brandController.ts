import { Request, Response } from 'express';
import { pool } from '../config/db';

// Safe fallback brands when DB table is not present or empty
const FALLBACK_BRANDS = [
    { id: 1, name: 'FRL' },
    { id: 2, name: 'Beetloop' },
    { id: 3, name: 'Pubrica' },
    { id: 4, name: 'Statswork' }
];

export const getBrands = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT id, name FROM brands ORDER BY id DESC');
        if (!result.rows || result.rows.length === 0) return res.status(200).json(FALLBACK_BRANDS);
        res.status(200).json(result.rows);
    } catch (error: any) {
        // If the brands table does not exist, return fallback to keep UI usable
        if (error.code === '42P01' || /relation "brands" does not exist/i.test(error.message || '')) {
            return res.status(200).json(FALLBACK_BRANDS);
        }
        res.status(500).json({ error: error.message });
    }
};

export const createBrand = async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const result = await pool.query('INSERT INTO brands (name) VALUES ($1) RETURNING id, name', [name]);
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        if (error.code === '42P01' || /relation "brands" does not exist/i.test(error.message || '')) {
            return res.status(500).json({ error: 'Brands table missing in database. Please run migrations.' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const updateBrand = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = await pool.query('UPDATE brands SET name=$1 WHERE id=$2 RETURNING id, name', [name, id]);
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM brands WHERE id=$1', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

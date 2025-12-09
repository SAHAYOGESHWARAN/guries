
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';

export const getPromotionItems = async (req: any, res: any) => {
    try {
        // Fetch content that is approved/QC passed or updated and ready for promotion
        const result = await pool.query(`
            SELECT * FROM content_repository 
            WHERE status IN ('qc_passed', 'updated', 'ready_to_publish', 'published')
            ORDER BY last_status_update_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getForms = async (_req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM forms ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createForm = async (req: any, res: any) => {
    const { form_name, form_type, data_source, target_url, status, owner_id } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO forms (form_name, form_type, data_source, target_url, status, owner_id)
             VALUES ($1, $2, $3, $4, COALESCE($5, 'Active'), $6) RETURNING *`,
            [form_name, form_type, data_source, target_url, status, owner_id]
        );
        const newItem = result.rows[0];
        getSocket().emit('form_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateForm = async (req: any, res: any) => {
    const { id } = req.params;
    const { form_name, form_type, data_source, target_url, status, owner_id } = req.body;
    try {
        const result = await pool.query(
            `UPDATE forms SET
                form_name = COALESCE($1, form_name),
                form_type = COALESCE($2, form_type),
                data_source = COALESCE($3, data_source),
                target_url = COALESCE($4, target_url),
                status = COALESCE($5, status),
                owner_id = COALESCE($6, owner_id),
                updated_at = NOW()
             WHERE id = $7 RETURNING *`,
            [form_name, form_type, data_source, target_url, status, owner_id, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('form_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteForm = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM forms WHERE id = $1', [req.params.id]);
        getSocket().emit('form_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


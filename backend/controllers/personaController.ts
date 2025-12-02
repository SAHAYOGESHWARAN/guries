import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getPersonas = async (_req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM personas ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createPersona = async (req: any, res: any) => {
    const { persona_name, segment, role, funnel_stage, description, status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO personas (persona_name, segment, role, funnel_stage, description, status)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'Active')) RETURNING *`,
            [persona_name, segment, role, funnel_stage, description, status]
        );
        const newItem = result.rows[0];
        getSocket().emit('persona_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePersona = async (req: any, res: any) => {
    const { id } = req.params;
    const { persona_name, segment, role, funnel_stage, description, status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE personas SET
                persona_name = COALESCE($1, persona_name),
                segment = COALESCE($2, segment),
                role = COALESCE($3, role),
                funnel_stage = COALESCE($4, funnel_stage),
                description = COALESCE($5, description),
                status = COALESCE($6, status),
                updated_at = NOW()
            WHERE id = $7 RETURNING *`,
            [persona_name, segment, role, funnel_stage, description, status, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('persona_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePersona = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM personas WHERE id = $1', [req.params.id]);
        getSocket().emit('persona_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


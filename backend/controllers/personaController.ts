import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getPersonas = async (_req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM personas ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createPersona = async (req: Request, res: Response) => {
    const { persona_name, segment, role, funnel_stage, description, status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO personas (persona_name, segment, role, funnel_stage, description, status)
             VALUES (?, ?, ?, ?, ?, COALESCE(?, 'Active'))`,
            [persona_name, segment, role, funnel_stage, description, status]
        );
        const newItem = result.rows[0];
        getSocket().emit('persona_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePersona = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { persona_name, segment, role, funnel_stage, description, status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE personas SET
                persona_name = COALESCE(?, persona_name),
                segment = COALESCE(?, segment),
                role = COALESCE(?, role),
                funnel_stage = COALESCE(?, funnel_stage),
                description = COALESCE(?, description),
                status = COALESCE(?, status),
                updated_at = datetime('now')
            WHERE id = ?`,
            [persona_name, segment, role, funnel_stage, description, status, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('persona_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePersona = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM personas WHERE id = ?', [req.params.id]);
        getSocket().emit('persona_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


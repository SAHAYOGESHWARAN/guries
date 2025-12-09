
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';

// --- OKRs (Performance & Benchmark) ---
export const getOkrs = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM okrs ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createOkr = async (req: any, res: any) => {
    const { objective, type, cycle, owner, alignment, progress, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO okrs (objective, type, cycle, owner, alignment, progress, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [objective, type, cycle, owner, alignment, progress, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateOkr = async (req: any, res: any) => {
    const { id } = req.params;
    const { objective, type, cycle, owner, alignment, progress, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE okrs SET objective=$1, type=$2, cycle=$3, owner=$4, alignment=$5, progress=$6, status=$7 WHERE id=$8 RETURNING *',
            [objective, type, cycle, owner, alignment, progress, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteOkr = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM okrs WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Gold Standards ---
export const getGoldStandards = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM gold_standards ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createGoldStandard = async (req: any, res: any) => {
    const { metric_name, category, value, range, unit, evidence, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO gold_standards (metric_name, category, value, range, unit, evidence, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [metric_name, category, value, range, unit, evidence, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateGoldStandard = async (req: any, res: any) => {
    const { id } = req.params;
    const { metric_name, category, value, range, unit, evidence, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE gold_standards SET metric_name=$1, category=$2, value=$3, range=$4, unit=$5, evidence=$6, status=$7 WHERE id=$8 RETURNING *',
            [metric_name, category, value, range, unit, evidence, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteGoldStandard = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM gold_standards WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Effort Targets ---
export const getEffortTargets = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM effort_targets ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createEffortTarget = async (req: any, res: any) => {
    const { role, category, metric, monthly, weekly, daily, weightage, rules, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO effort_targets (role, category, metric, monthly, weekly, daily, weightage, rules, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [role, category, metric, monthly, weekly, daily, weightage, rules, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateEffortTarget = async (req: any, res: any) => {
    const { id } = req.params;
    const { role, category, metric, monthly, weekly, daily, weightage, rules, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE effort_targets SET role=$1, category=$2, metric=$3, monthly=$4, weekly=$5, daily=$6, weightage=$7, rules=$8, status=$9 WHERE id=$10 RETURNING *',
            [role, category, metric, monthly, weekly, daily, weightage, rules, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteEffortTarget = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM effort_targets WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

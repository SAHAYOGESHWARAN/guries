
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';

// --- OKRs (Performance & Benchmark) ---
export const getOkrs = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM okrs ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createOkr = async (req: Request, res: Response) => {
    const { objective, type, cycle, owner, alignment, progress, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO okrs (objective, type, cycle, owner, alignment, progress, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [objective, type, cycle, owner, alignment, progress, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateOkr = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { objective, type, cycle, owner, alignment, progress, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE okrs SET objective=?, type=?, cycle=?, owner=?, alignment=?, progress=?, status=? WHERE id=?',
            [objective, type, cycle, owner, alignment, progress, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteOkr = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM okrs WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Gold Standards ---
export const getGoldStandards = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM gold_standards ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createGoldStandard = async (req: Request, res: Response) => {
    const { metric_name, category, value, range, unit, evidence, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO gold_standards (metric_name, category, value, range, unit, evidence, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [metric_name, category, value, range, unit, evidence, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateGoldStandard = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { metric_name, category, value, range, unit, evidence, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE gold_standards SET metric_name=?, category=?, value=?, range=?, unit=?, evidence=?, status=? WHERE id=?',
            [metric_name, category, value, range, unit, evidence, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteGoldStandard = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM gold_standards WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Effort Targets ---
export const getEffortTargets = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM effort_targets ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createEffortTarget = async (req: Request, res: Response) => {
    const { role, category, metric, monthly, weekly, daily, weightage, rules, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO effort_targets (role, category, metric, monthly, weekly, daily, weightage, rules, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [role, category, metric, monthly, weekly, daily, weightage, rules, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateEffortTarget = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, category, metric, monthly, weekly, daily, weightage, rules, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE effort_targets SET role=?, category=?, metric=?, monthly=?, weekly=?, daily=?, weightage=?, rules=?, status=? WHERE id=?',
            [role, category, metric, monthly, weekly, daily, weightage, rules, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteEffortTarget = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM effort_targets WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

// Get Compliance Rules
export const getRules = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM compliance_rules ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new rule
export const createRule = async (req: Request, res: Response) => {
    const { rule_name, description, category, severity } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO compliance_rules (rule_name, description, category, severity) VALUES (?, ?, ?, ?)',
            [rule_name, description, category, severity]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Record an audit result
export const logAudit = async (req: Request, res: Response) => {
    const { target_type, target_id, score, violations } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO compliance_audits (target_type, target_id, score, violations, audited_at) VALUES (?, ?, ?, ?, datetime('now'))",
            [target_type, target_id, score, JSON.stringify(violations)]
        );
        const newAudit = result.rows[0];
        getSocket().emit('compliance_audit_logged', newAudit);
        res.status(201).json(newAudit);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get recent audits
export const getAudits = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM compliance_audits ORDER BY audited_at DESC LIMIT 50');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};




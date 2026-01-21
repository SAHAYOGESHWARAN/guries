
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

// --- QC Runs ---
export const getQcRuns = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM qc_runs ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createQcRun = async (req: Request, res: Response) => {
    const { target_type, target_id, qc_status, qc_owner_id, qc_checklist_version_id } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO qc_runs (
                target_type, target_id, qc_status, qc_owner_id, qc_checklist_version_id, created_at
            ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [target_type, target_id, qc_status, qc_owner_id, qc_checklist_version_id]
        );
        const newItem = result.rows[0];
        getSocket().emit('qc_run_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateQcRun = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { qc_status, final_score_percentage, analysis_report } = req.body;
    try {
        const result = await pool.query(
            `UPDATE qc_runs SET 
                qc_status = COALESCE(?, qc_status), 
                final_score_percentage = COALESCE(?, final_score_percentage),
                analysis_report = COALESCE(?, analysis_report)
            WHERE id = ?`,
            [qc_status, final_score_percentage, analysis_report, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('qc_run_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteQcRun = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM qc_runs WHERE id = ?', [req.params.id]);
        getSocket().emit('qc_run_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- QC Checklists ---
export const getChecklists = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM qc_checklists ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createChecklist = async (req: Request, res: Response) => {
    const { checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO qc_checklists (checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateChecklist = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE qc_checklists SET checklist_name=?, checklist_type=?, category=?, number_of_items=?, scoring_mode=?, pass_threshold=?, status=? WHERE id=?',
            [checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteChecklist = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM qc_checklists WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- QC Checklist Versions ---
export const getChecklistVersions = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM qc_checklist_versions ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- QC Weightage Configs ---
export const getWeightageConfigs = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM qc_weightage_configs ORDER BY asset_type ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createWeightageConfig = async (req: Request, res: Response) => {
    const { name, type, weight, mandatory, stage, asset_type } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO qc_weightage_configs (name, type, weight, mandatory, stage, asset_type) VALUES (?, ?, ?, ?, ?, ?)',
            [name, type, weight, mandatory, stage, asset_type]
        );
        const newItem = result.rows[0];
        getSocket().emit('qc_weightage_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateWeightageConfig = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { weight, mandatory, stage, name, type } = req.body;
    try {
        const result = await pool.query(
            'UPDATE qc_weightage_configs SET weight=COALESCE(?,weight), mandatory=COALESCE(?,mandatory), stage=COALESCE(?,stage), name=COALESCE(?,name), type=COALESCE(?,type) WHERE id=?',
            [weight, mandatory, stage, name, type, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('qc_weightage_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteWeightageConfig = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM qc_weightage_configs WHERE id = ?', [req.params.id]);
        getSocket().emit('qc_weightage_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

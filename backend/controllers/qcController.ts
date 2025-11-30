
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

// --- QC Runs ---
export const getQcRuns = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM qc_runs ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createQcRun = async (req: any, res: any) => {
    const { target_type, target_id, qc_status, qc_owner_id, qc_checklist_version_id } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO qc_runs (
                target_type, target_id, qc_status, qc_owner_id, qc_checklist_version_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
            [target_type, target_id, qc_status, qc_owner_id, qc_checklist_version_id]
        );
        const newItem = result.rows[0];
        getSocket().emit('qc_run_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateQcRun = async (req: any, res: any) => {
    const { id } = req.params;
    const { qc_status, final_score_percentage, analysis_report } = req.body;
    try {
        const result = await pool.query(
            `UPDATE qc_runs SET 
                qc_status = COALESCE($1, qc_status), 
                final_score_percentage = COALESCE($2, final_score_percentage),
                analysis_report = COALESCE($3, analysis_report)
            WHERE id = $4 RETURNING *`,
            [qc_status, final_score_percentage, analysis_report, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('qc_run_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteQcRun = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM qc_runs WHERE id = $1', [req.params.id]);
        getSocket().emit('qc_run_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- QC Checklists ---
export const getChecklists = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM qc_checklists ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createChecklist = async (req: any, res: any) => {
    const { checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO qc_checklists (checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateChecklist = async (req: any, res: any) => {
    const { id } = req.params;
    const { checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE qc_checklists SET checklist_name=$1, checklist_type=$2, category=$3, number_of_items=$4, scoring_mode=$5, pass_threshold=$6, status=$7 WHERE id=$8 RETURNING *',
            [checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteChecklist = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM qc_checklists WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- QC Checklist Versions ---
export const getChecklistVersions = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM qc_checklist_versions ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- QC Weightage Configs ---
export const getWeightageConfigs = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM qc_weightage_configs ORDER BY asset_type ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createWeightageConfig = async (req: any, res: any) => {
    const { name, type, weight, mandatory, stage, asset_type } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO qc_weightage_configs (name, type, weight, mandatory, stage, asset_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, type, weight, mandatory, stage, asset_type]
        );
        const newItem = result.rows[0];
        getSocket().emit('qc_weightage_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateWeightageConfig = async (req: any, res: any) => {
    const { id } = req.params;
    const { weight, mandatory, stage, name, type } = req.body;
    try {
        const result = await pool.query(
            'UPDATE qc_weightage_configs SET weight=COALESCE($1,weight), mandatory=COALESCE($2,mandatory), stage=COALESCE($3,stage), name=COALESCE($4,name), type=COALESCE($5,type) WHERE id=$6 RETURNING *',
            [weight, mandatory, stage, name, type, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('qc_weightage_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteWeightageConfig = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM qc_weightage_configs WHERE id = $1', [req.params.id]);
        getSocket().emit('qc_weightage_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

// Generic helper for master tables to reduce boilerplate
const getMaster = async (table: string, res: any) => {
    try {
        const result = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`);
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: `Failed to fetch ${table}`, details: error.message });
    }
};

const deleteMaster = async (table: string, id: string, res: any, eventName?: string) => {
    try {
        await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);

        // Emit socket event if eventName provided
        if (eventName) {
            try {
                const io = getSocket();
                io.emit(`${eventName}_deleted`, { id: parseInt(id) });
            } catch (e) {
                console.warn('Socket not available for delete event');
            }
        }

        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: `Failed to delete from ${table}`, details: error.message });
    }
};

// --- Industry / Sector ---
export const getIndustries = (req: any, res: any) => getMaster('industry_sectors', res);
export const createIndustry = async (req: any, res: any) => {
    const { industry, sector, application, country, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO industry_sectors (industry, sector, application, country, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [industry, sector, application, country, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updateIndustry = async (req: any, res: any) => {
    const { id } = req.params;
    const { industry, sector, application, country, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE industry_sectors SET industry=$1, sector=$2, application=$3, country=$4, status=$5 WHERE id=$6 RETURNING *',
            [industry, sector, application, country, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deleteIndustry = (req: any, res: any) => deleteMaster('industry_sectors', req.params.id, res);

// --- Content Types ---
export const getContentTypes = (req: any, res: any) => getMaster('content_types', res);
export const createContentType = async (req: any, res: any) => {
    const { content_type, category, description, default_attributes, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO content_types (content_type, category, description, default_attributes, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [content_type, category, description, default_attributes, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updateContentType = async (req: any, res: any) => {
    const { id } = req.params;
    const { content_type, category, description, default_attributes, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE content_types SET content_type=$1, category=$2, description=$3, default_attributes=$4, status=$5 WHERE id=$6 RETURNING *',
            [content_type, category, description, default_attributes, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deleteContentType = (req: any, res: any) => deleteMaster('content_types', req.params.id, res);

// --- Asset Types ---
export const getAssetTypes = (req: any, res: any) => getMaster('asset_types', res);
export const createAssetType = async (req: any, res: any) => {
    const { asset_type, dimension, file_formats, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO asset_types (asset_type, dimension, file_formats, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [asset_type, dimension, file_formats, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updateAssetType = async (req: any, res: any) => {
    const { id } = req.params;
    const { asset_type, dimension, file_formats, description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE asset_types SET asset_type=$1, dimension=$2, file_formats=$3, description=$4 WHERE id=$5 RETURNING *',
            [asset_type, dimension, file_formats, description, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deleteAssetType = (req: any, res: any) => deleteMaster('asset_types', req.params.id, res);

// --- Platforms ---
export const getPlatforms = (req: any, res: any) => getMaster('platforms', res);
export const createPlatform = async (req: any, res: any) => {
    const { platform_name, recommended_size, scheduling, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO platforms (platform_name, recommended_size, scheduling, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [platform_name, recommended_size, scheduling, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updatePlatform = async (req: any, res: any) => {
    const { id } = req.params;
    const { platform_name, recommended_size, scheduling, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE platforms SET platform_name=$1, recommended_size=$2, scheduling=$3, status=$4 WHERE id=$5 RETURNING *',
            [platform_name, recommended_size, scheduling, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deletePlatform = (req: any, res: any) => deleteMaster('platforms', req.params.id, res);

// --- Countries ---
export const getCountries = (req: any, res: any) => getMaster('countries', res);
export const createCountry = async (req: any, res: any) => {
    const { country_name, code, region, has_backlinks, has_content, has_smm, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO countries (country_name, code, region, has_backlinks, has_content, has_smm, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [country_name, code, region, has_backlinks, has_content, has_smm, status]
        );

        const newCountry = result.rows[0];

        // Emit socket event for real-time updates
        try {
            const io = getSocket();
            io.emit('country_created', newCountry);
            console.log('✅ Socket event emitted: country_created', newCountry.id);
        } catch (e) {
            console.warn('⚠️  Socket not available for country_created event');
        }

        res.status(201).json(newCountry);
    } catch (e: any) {
        console.error('❌ Error creating country:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const updateCountry = async (req: any, res: any) => {
    const { id } = req.params;
    const { country_name, code, region, has_backlinks, has_content, has_smm, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE countries SET country_name=$1, code=$2, region=$3, has_backlinks=$4, has_content=$5, has_smm=$6, status=$7 WHERE id=$8 RETURNING *',
            [country_name, code, region, has_backlinks, has_content, has_smm, status, id]
        );

        const updatedCountry = result.rows[0];

        // Emit socket event for real-time updates
        try {
            const io = getSocket();
            io.emit('country_updated', updatedCountry);
            console.log('✅ Socket event emitted: country_updated', updatedCountry.id);
        } catch (e) {
            console.warn('⚠️  Socket not available for country_updated event');
        }

        res.status(200).json(updatedCountry);
    } catch (e: any) {
        console.error('❌ Error updating country:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const deleteCountry = (req: any, res: any) => deleteMaster('countries', req.params.id, res, 'country');

// --- SEO Errors ---
export const getSeoErrors = (req: any, res: any) => getMaster('seo_errors', res);
export const createSeoError = async (req: any, res: any) => {
    const { error_type, category, severity, description, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO seo_errors (error_type, category, severity, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [error_type, category, severity, description, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updateSeoError = async (req: any, res: any) => {
    const { id } = req.params;
    const { error_type, category, severity, description, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE seo_errors SET error_type=$1, category=$2, severity=$3, description=$4, status=$5 WHERE id=$6 RETURNING *',
            [error_type, category, severity, description, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deleteSeoError = (req: any, res: any) => deleteMaster('seo_errors', req.params.id, res);

// --- Workflow Stages ---
export const getWorkflowStages = (req: any, res: any) => getMaster('workflow_stages', res);
export const createWorkflowStage = async (req: any, res: any) => {
    const { workflow_name, stage_order, stage_label, color_tag, active_flag } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO workflow_stages (workflow_name, stage_order, stage_label, color_tag, active_flag) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [workflow_name, stage_order, stage_label, color_tag, active_flag]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updateWorkflowStage = async (req: any, res: any) => {
    const { id } = req.params;
    const { workflow_name, stage_order, stage_label, color_tag, active_flag } = req.body;
    try {
        const result = await pool.query(
            'UPDATE workflow_stages SET workflow_name=$1, stage_order=$2, stage_label=$3, color_tag=$4, active_flag=$5 WHERE id=$6 RETURNING *',
            [workflow_name, stage_order, stage_label, color_tag, active_flag, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deleteWorkflowStage = (req: any, res: any) => deleteMaster('workflow_stages', req.params.id, res);

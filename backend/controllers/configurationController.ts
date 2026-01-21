
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
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
        await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);

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
export const createIndustry = async (req: Request, res: Response) => {
    const { industry, sector, application, country, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO industry_sectors (industry, sector, application, country, status) VALUES (?, ?, ?, ?, ?)',
            [industry, sector, application, country, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updateIndustry = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { industry, sector, application, country, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE industry_sectors SET industry=?, sector=?, application=?, country=?, status=? WHERE id=?',
            [industry, sector, application, country, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deleteIndustry = (req: any, res: any) => deleteMaster('industry_sectors', req.params.id, res);

// --- Content Types ---
export const getContentTypes = (req: any, res: any) => getMaster('content_types', res);
export const createContentType = async (req: Request, res: Response) => {
    const {
        content_type,
        category,
        description,
        default_wordcount_min,
        default_wordcount_max,
        default_graphic_requirements,
        default_qc_checklist,
        seo_focus_keywords_required,
        social_media_applicable,
        estimated_creation_hours,
        content_owner_role,
        use_in_campaigns,
        status
    } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO content_types (
                content_type, category, description,
                default_wordcount_min, default_wordcount_max,
                default_graphic_requirements, default_qc_checklist,
                seo_focus_keywords_required, social_media_applicable,
                estimated_creation_hours, content_owner_role,
                use_in_campaigns, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                content_type, category, description,
                default_wordcount_min || 500, default_wordcount_max || 2000,
                default_graphic_requirements, default_qc_checklist,
                seo_focus_keywords_required || 1, social_media_applicable || 1,
                estimated_creation_hours || 4, content_owner_role,
                use_in_campaigns || 1, status || 'active'
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updateContentType = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        content_type,
        category,
        description,
        default_wordcount_min,
        default_wordcount_max,
        default_graphic_requirements,
        default_qc_checklist,
        seo_focus_keywords_required,
        social_media_applicable,
        estimated_creation_hours,
        content_owner_role,
        use_in_campaigns,
        status
    } = req.body;
    try {
        const result = await pool.query(
            `UPDATE content_types SET
                content_type=?, category=?, description=?,
                default_wordcount_min=?, default_wordcount_max=?,
                default_graphic_requirements=?, default_qc_checklist=?,
                seo_focus_keywords_required=?, social_media_applicable=?,
                estimated_creation_hours=?, content_owner_role=?,
                use_in_campaigns=?, status=?
            WHERE id=?`,
            [
                content_type, category, description,
                default_wordcount_min, default_wordcount_max,
                default_graphic_requirements, default_qc_checklist,
                seo_focus_keywords_required, social_media_applicable,
                estimated_creation_hours, content_owner_role,
                use_in_campaigns, status, id
            ]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deleteContentType = (req: any, res: any) => deleteMaster('content_types', req.params.id, res);

// --- Asset Types ---
export const getAssetTypes = (req: any, res: any) => getMaster('asset_types', res);
export const createAssetType = async (req: Request, res: Response) => {
    const { asset_type, dimension, file_formats, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO asset_types (asset_type, dimension, file_formats, description) VALUES (?, ?, ?, ?)',
            [asset_type, dimension, file_formats, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updateAssetType = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { asset_type, dimension, file_formats, description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE asset_types SET asset_type=?, dimension=?, file_formats=?, description=? WHERE id=?',
            [asset_type, dimension, file_formats, description, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deleteAssetType = (req: any, res: any) => deleteMaster('asset_types', req.params.id, res);

// --- Asset Categories ---
export const getAssetCategories = (req: any, res: any) => getMaster('asset_category_master', res);
export const createAssetCategory = async (req: Request, res: Response) => {
    const { brand, category_name, word_count, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO asset_category_master (brand, category_name, word_count, status, updated_at) VALUES (?, ?, ?, ?, ?)',
            [brand, category_name, word_count || 0, status || 'active', new Date().toISOString()]
        );

        const newCategory = result.rows[0];

        // Emit socket event for real-time updates
        try {
            const io = getSocket();
            io.emit('asset_category_created', newCategory);
            console.log('✅ Socket event emitted: asset_category_created', newCategory.id);
        } catch (e) {
            console.warn('⚠️  Socket not available for asset_category_created event');
        }

        res.status(201).json(newCategory);
    } catch (e: any) {
        console.error('❌ Error creating asset category:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const updateAssetCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { brand, category_name, word_count, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE asset_category_master SET brand=?, category_name=?, word_count=?, status=?, updated_at=? WHERE id=?',
            [brand, category_name, word_count, status, new Date().toISOString(), id]
        );

        const updatedCategory = result.rows[0];

        // Emit socket event for real-time updates
        try {
            const io = getSocket();
            io.emit('asset_category_updated', updatedCategory);
            console.log('✅ Socket event emitted: asset_category_updated', updatedCategory.id);
        } catch (e) {
            console.warn('⚠️  Socket not available for asset_category_updated event');
        }

        res.status(200).json(updatedCategory);
    } catch (e: any) {
        console.error('❌ Error updating asset category:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const deleteAssetCategory = (req: any, res: any) => deleteMaster('asset_category_master', req.params.id, res, 'asset_category');

// --- Platforms ---
export const getPlatforms = (req: any, res: any) => getMaster('platforms', res);
export const createPlatform = async (req: Request, res: Response) => {
    const { platform_name, recommended_size, scheduling, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO platforms (platform_name, recommended_size, scheduling, status) VALUES (?, ?, ?, ?)',
            [platform_name, recommended_size, scheduling, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updatePlatform = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { platform_name, recommended_size, scheduling, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE platforms SET platform_name=?, recommended_size=?, scheduling=?, status=? WHERE id=?',
            [platform_name, recommended_size, scheduling, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deletePlatform = (req: any, res: any) => deleteMaster('platforms', req.params.id, res);

// --- Countries ---
export const getCountries = (req: any, res: any) => getMaster('countries', res);
export const createCountry = async (req: Request, res: Response) => {
    const { country_name, code, region, has_backlinks, has_content, has_smm, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO countries (country_name, code, region, has_backlinks, has_content, has_smm, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
export const updateCountry = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { country_name, code, region, has_backlinks, has_content, has_smm, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE countries SET country_name=?, code=?, region=?, has_backlinks=?, has_content=?, has_smm=?, status=? WHERE id=?',
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
export const createSeoError = async (req: Request, res: Response) => {
    const { error_type, category, severity, description, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO seo_errors (error_type, category, severity, description, status) VALUES (?, ?, ?, ?, ?)',
            [error_type, category, severity, description, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updateSeoError = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error_type, category, severity, description, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE seo_errors SET error_type=?, category=?, severity=?, description=?, status=? WHERE id=?',
            [error_type, category, severity, description, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deleteSeoError = (req: any, res: any) => deleteMaster('seo_errors', req.params.id, res);

// --- Workflow Stages ---
export const getWorkflowStages = (req: any, res: any) => getMaster('workflow_stages', res);
export const createWorkflowStage = async (req: Request, res: Response) => {
    const { workflow_name, stage_order, stage_label, color_tag, active_flag } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO workflow_stages (workflow_name, stage_order, stage_label, color_tag, active_flag) VALUES (?, ?, ?, ?, ?)',
            [workflow_name, stage_order, stage_label, color_tag, active_flag]
        );
        res.status(201).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const updateWorkflowStage = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { workflow_name, stage_order, stage_label, color_tag, active_flag } = req.body;
    try {
        const result = await pool.query(
            'UPDATE workflow_stages SET workflow_name=?, stage_order=?, stage_label=?, color_tag=?, active_flag=? WHERE id=?',
            [workflow_name, stage_order, stage_label, color_tag, active_flag, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};
export const deleteWorkflowStage = (req: any, res: any) => deleteMaster('workflow_stages', req.params.id, res);


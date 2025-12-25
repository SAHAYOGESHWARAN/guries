/**
 * Asset Usage Controller
 * 
 * Handles CRUD operations for asset usage tracking:
 * - Website URLs
 * - Social Media Posts
 * - Backlink Submissions
 * - Engagement Metrics
 */

import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

// ============================================
// WEBSITE USAGE
// ============================================

export const getAssetWebsiteUsage = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM asset_website_usage WHERE asset_id = $1 ORDER BY created_at DESC`,
            [assetId]
        );
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching website usage:', error);
        res.status(500).json({ error: error.message });
    }
};

export const addAssetWebsiteUsage = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const { website_url, page_title, added_by } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO asset_website_usage (asset_id, website_url, page_title, added_by)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [assetId, website_url, page_title, added_by]
        );

        // Update asset usage count
        await pool.query(
            `UPDATE assets SET usage_count = COALESCE(usage_count, 0) + 1 WHERE id = $1`,
            [assetId]
        );

        getSocket().emit('asset_usage_updated', { asset_id: assetId, type: 'website' });
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        console.error('Error adding website usage:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteAssetWebsiteUsage = async (req: Request, res: Response) => {
    const { assetId, usageId } = req.params;
    try {
        await pool.query(`DELETE FROM asset_website_usage WHERE id = $1 AND asset_id = $2`, [usageId, assetId]);

        // Update asset usage count
        await pool.query(
            `UPDATE assets SET usage_count = GREATEST(COALESCE(usage_count, 0) - 1, 0) WHERE id = $1`,
            [assetId]
        );

        getSocket().emit('asset_usage_updated', { asset_id: assetId, type: 'website' });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting website usage:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// SOCIAL MEDIA USAGE
// ============================================

export const getAssetSocialMediaUsage = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM asset_social_media_usage WHERE asset_id = $1 ORDER BY created_at DESC`,
            [assetId]
        );
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching social media usage:', error);
        res.status(500).json({ error: error.message });
    }
};

export const addAssetSocialMediaUsage = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const {
        platform_name, post_url, post_id, status,
        engagement_impressions, engagement_clicks, engagement_shares,
        engagement_likes, engagement_comments, posted_at, added_by
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO asset_social_media_usage 
             (asset_id, platform_name, post_url, post_id, status, 
              engagement_impressions, engagement_clicks, engagement_shares,
              engagement_likes, engagement_comments, posted_at, added_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [assetId, platform_name, post_url, post_id, status || 'Published',
                engagement_impressions || 0, engagement_clicks || 0, engagement_shares || 0,
                engagement_likes || 0, engagement_comments || 0, posted_at, added_by]
        );

        // Update asset usage count
        await pool.query(
            `UPDATE assets SET usage_count = COALESCE(usage_count, 0) + 1 WHERE id = $1`,
            [assetId]
        );

        // Recalculate engagement metrics
        await recalculateEngagementMetrics(parseInt(assetId));

        getSocket().emit('asset_usage_updated', { asset_id: assetId, type: 'social' });
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        console.error('Error adding social media usage:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateAssetSocialMediaUsage = async (req: Request, res: Response) => {
    const { assetId, usageId } = req.params;
    const {
        platform_name, post_url, status,
        engagement_impressions, engagement_clicks, engagement_shares,
        engagement_likes, engagement_comments
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE asset_social_media_usage SET
             platform_name = COALESCE($1, platform_name),
             post_url = COALESCE($2, post_url),
             status = COALESCE($3, status),
             engagement_impressions = COALESCE($4, engagement_impressions),
             engagement_clicks = COALESCE($5, engagement_clicks),
             engagement_shares = COALESCE($6, engagement_shares),
             engagement_likes = COALESCE($7, engagement_likes),
             engagement_comments = COALESCE($8, engagement_comments),
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $9 AND asset_id = $10 RETURNING *`,
            [platform_name, post_url, status, engagement_impressions, engagement_clicks,
                engagement_shares, engagement_likes, engagement_comments, usageId, assetId]
        );

        // Recalculate engagement metrics
        await recalculateEngagementMetrics(parseInt(assetId));

        getSocket().emit('asset_usage_updated', { asset_id: assetId, type: 'social' });
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        console.error('Error updating social media usage:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteAssetSocialMediaUsage = async (req: Request, res: Response) => {
    const { assetId, usageId } = req.params;
    try {
        await pool.query(`DELETE FROM asset_social_media_usage WHERE id = $1 AND asset_id = $2`, [usageId, assetId]);

        // Update asset usage count
        await pool.query(
            `UPDATE assets SET usage_count = GREATEST(COALESCE(usage_count, 0) - 1, 0) WHERE id = $1`,
            [assetId]
        );

        // Recalculate engagement metrics
        await recalculateEngagementMetrics(parseInt(assetId));

        getSocket().emit('asset_usage_updated', { asset_id: assetId, type: 'social' });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting social media usage:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// BACKLINK USAGE
// ============================================

export const getAssetBacklinkUsage = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM asset_backlink_usage WHERE asset_id = $1 ORDER BY created_at DESC`,
            [assetId]
        );
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching backlink usage:', error);
        res.status(500).json({ error: error.message });
    }
};

export const addAssetBacklinkUsage = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const { domain_name, backlink_url, anchor_text, approval_status, da_score, submitted_at, added_by } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO asset_backlink_usage 
             (asset_id, domain_name, backlink_url, anchor_text, approval_status, da_score, submitted_at, added_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [assetId, domain_name, backlink_url, anchor_text, approval_status || 'Pending', da_score, submitted_at, added_by]
        );

        // Update asset usage count
        await pool.query(
            `UPDATE assets SET usage_count = COALESCE(usage_count, 0) + 1 WHERE id = $1`,
            [assetId]
        );

        getSocket().emit('asset_usage_updated', { asset_id: assetId, type: 'backlink' });
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        console.error('Error adding backlink usage:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateAssetBacklinkUsage = async (req: Request, res: Response) => {
    const { assetId, usageId } = req.params;
    const { domain_name, backlink_url, anchor_text, approval_status, da_score, approved_at } = req.body;

    try {
        const result = await pool.query(
            `UPDATE asset_backlink_usage SET
             domain_name = COALESCE($1, domain_name),
             backlink_url = COALESCE($2, backlink_url),
             anchor_text = COALESCE($3, anchor_text),
             approval_status = COALESCE($4, approval_status),
             da_score = COALESCE($5, da_score),
             approved_at = COALESCE($6, approved_at),
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 AND asset_id = $8 RETURNING *`,
            [domain_name, backlink_url, anchor_text, approval_status, da_score, approved_at, usageId, assetId]
        );

        getSocket().emit('asset_usage_updated', { asset_id: assetId, type: 'backlink' });
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        console.error('Error updating backlink usage:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteAssetBacklinkUsage = async (req: Request, res: Response) => {
    const { assetId, usageId } = req.params;
    try {
        await pool.query(`DELETE FROM asset_backlink_usage WHERE id = $1 AND asset_id = $2`, [usageId, assetId]);

        // Update asset usage count
        await pool.query(
            `UPDATE assets SET usage_count = GREATEST(COALESCE(usage_count, 0) - 1, 0) WHERE id = $1`,
            [assetId]
        );

        getSocket().emit('asset_usage_updated', { asset_id: assetId, type: 'backlink' });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting backlink usage:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ENGAGEMENT METRICS
// ============================================

export const getAssetEngagementMetrics = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM asset_engagement_metrics WHERE asset_id = $1`,
            [assetId]
        );

        if (result.rows.length === 0) {
            // Return default metrics if none exist
            return res.status(200).json({
                asset_id: parseInt(assetId),
                total_impressions: 0,
                total_clicks: 0,
                total_shares: 0,
                total_likes: 0,
                total_comments: 0,
                ctr_percentage: 0,
                performance_summary: null
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        console.error('Error fetching engagement metrics:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateAssetEngagementMetrics = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const { performance_summary } = req.body;

    try {
        // First recalculate from social media usage
        await recalculateEngagementMetrics(parseInt(assetId));

        // Then update the performance summary if provided
        if (performance_summary) {
            await pool.query(
                `UPDATE asset_engagement_metrics SET performance_summary = $1, updated_at = CURRENT_TIMESTAMP WHERE asset_id = $2`,
                [performance_summary, assetId]
            );
        }

        const result = await pool.query(
            `SELECT * FROM asset_engagement_metrics WHERE asset_id = $1`,
            [assetId]
        );

        getSocket().emit('asset_usage_updated', { asset_id: assetId, type: 'metrics' });
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        console.error('Error updating engagement metrics:', error);
        res.status(500).json({ error: error.message });
    }
};

// Helper function to recalculate engagement metrics from social media usage
async function recalculateEngagementMetrics(assetId: number) {
    try {
        // Aggregate metrics from social media usage
        const aggregateResult = await pool.query(
            `SELECT 
                COALESCE(SUM(engagement_impressions), 0) as total_impressions,
                COALESCE(SUM(engagement_clicks), 0) as total_clicks,
                COALESCE(SUM(engagement_shares), 0) as total_shares,
                COALESCE(SUM(engagement_likes), 0) as total_likes,
                COALESCE(SUM(engagement_comments), 0) as total_comments
             FROM asset_social_media_usage WHERE asset_id = $1`,
            [assetId]
        );

        const metrics = aggregateResult.rows[0];
        const ctr = metrics.total_impressions > 0
            ? (metrics.total_clicks / metrics.total_impressions) * 100
            : 0;

        // Upsert engagement metrics
        await pool.query(
            `INSERT INTO asset_engagement_metrics 
             (asset_id, total_impressions, total_clicks, total_shares, total_likes, total_comments, ctr_percentage, last_calculated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
             ON CONFLICT (asset_id) DO UPDATE SET
             total_impressions = $2,
             total_clicks = $3,
             total_shares = $4,
             total_likes = $5,
             total_comments = $6,
             ctr_percentage = $7,
             last_calculated_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP`,
            [assetId, metrics.total_impressions, metrics.total_clicks, metrics.total_shares,
                metrics.total_likes, metrics.total_comments, ctr.toFixed(2)]
        );
    } catch (error) {
        console.error('Error recalculating engagement metrics:', error);
    }
}

// ============================================
// GET ALL USAGE DATA FOR AN ASSET
// ============================================

export const getAssetAllUsage = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    try {
        // Fetch all usage data in parallel
        const [websiteUsage, socialMediaUsage, backlinkUsage, engagementMetrics] = await Promise.all([
            pool.query(`SELECT * FROM asset_website_usage WHERE asset_id = $1 ORDER BY created_at DESC`, [assetId]),
            pool.query(`SELECT * FROM asset_social_media_usage WHERE asset_id = $1 ORDER BY created_at DESC`, [assetId]),
            pool.query(`SELECT * FROM asset_backlink_usage WHERE asset_id = $1 ORDER BY created_at DESC`, [assetId]),
            pool.query(`SELECT * FROM asset_engagement_metrics WHERE asset_id = $1`, [assetId])
        ]);

        res.status(200).json({
            website_urls: websiteUsage.rows,
            social_media_posts: socialMediaUsage.rows,
            backlink_submissions: backlinkUsage.rows,
            engagement_metrics: engagementMetrics.rows[0] || {
                total_impressions: 0,
                total_clicks: 0,
                total_shares: 0,
                total_likes: 0,
                total_comments: 0,
                ctr_percentage: 0,
                performance_summary: null
            }
        });
    } catch (error: any) {
        console.error('Error fetching all asset usage:', error);
        res.status(500).json({ error: error.message });
    }
};

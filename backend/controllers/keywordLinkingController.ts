import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

/**
 * Keyword Linking Controller
 * Handles proper linking of keywords with assets, services, and sub-services
 */

// =====================================================
// ASSET KEYWORD LINKING
// =====================================================

/**
 * Get all keywords linked to an asset
 */
export const getAssetKeywords = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const { keywordType } = req.query;

    try {
        let query = `
            SELECT 
                k.*,
                akl.keyword_type,
                akl.is_primary,
                akl.created_at as linked_at
            FROM asset_keyword_links akl
            JOIN keywords k ON akl.keyword_id = k.id
            WHERE akl.asset_id = ?
        `;

        const params: any[] = [assetId];

        if (keywordType) {
            query += ` AND akl.keyword_type = ?`;
            params.push(keywordType);
        }

        query += ` ORDER BY akl.is_primary DESC, k.keyword ASC`;

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching asset keywords:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Link keywords to an asset
 */
export const linkKeywordsToAsset = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const { keywordIds, keywordType = 'seo', isPrimary = false } = req.body;

    if (!Array.isArray(keywordIds) || keywordIds.length === 0) {
        return res.status(400).json({ error: 'keywordIds must be a non-empty array' });
    }

    try {
        const linkedKeywords = [];

        for (const keywordId of keywordIds) {
            const result = await pool.query(
                `INSERT OR REPLACE INTO asset_keyword_links 
                (asset_id, keyword_id, keyword_type, is_primary, created_at, updated_at)
                VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [assetId, keywordId, keywordType, isPrimary ? 1 : 0]
            );

            // Get the linked keyword details
            const keyword = await pool.query(
                `SELECT k.* FROM keywords k WHERE k.id = ?`,
                [keywordId]
            );

            if (keyword.rows.length > 0) {
                linkedKeywords.push(keyword.rows[0]);
            }
        }

        // Update keyword usage stats
        // await updateKeywordUsageStats(keywordIds, 'asset', 1);

        getSocket().emit('asset_keywords_linked', { assetId, keywordIds, keywordType });
        res.status(200).json({
            message: 'Keywords linked successfully',
            linkedKeywords,
            count: linkedKeywords.length
        });
    } catch (error: any) {
        console.error('Error linking keywords to asset:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Unlink keywords from an asset
 */
export const unlinkKeywordsFromAsset = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const { keywordIds, keywordType } = req.body;

    if (!Array.isArray(keywordIds) || keywordIds.length === 0) {
        return res.status(400).json({ error: 'keywordIds must be a non-empty array' });
    }

    try {
        const placeholders = keywordIds.map(() => '?').join(',');
        const params = [assetId, ...keywordIds];

        let query = `DELETE FROM asset_keyword_links WHERE asset_id = ? AND keyword_id IN (${placeholders})`;

        if (keywordType) {
            query += ` AND keyword_type = ?`;
            params.push(keywordType);
        }

        await pool.query(query, params);

        // Update keyword usage stats
        // await updateKeywordUsageStats(keywordIds, 'asset', -1);

        getSocket().emit('asset_keywords_unlinked', { assetId, keywordIds, keywordType });
        res.status(200).json({ message: 'Keywords unlinked successfully', count: keywordIds.length });
    } catch (error: any) {
        console.error('Error unlinking keywords from asset:', error);
        res.status(500).json({ error: error.message });
    }
};

// =====================================================
// SERVICE KEYWORD LINKING
// =====================================================

/**
 * Get all keywords linked to a service
 */
export const getServiceKeywords = async (req: Request, res: Response) => {
    const { serviceId } = req.params;
    const { keywordType } = req.query;

    try {
        let query = `
            SELECT 
                k.*,
                skl.keyword_type,
                skl.is_primary,
                skl.created_at as linked_at
            FROM service_keyword_links skl
            JOIN keywords k ON skl.keyword_id = k.id
            WHERE skl.service_id = ?
        `;

        const params: any[] = [serviceId];

        if (keywordType) {
            query += ` AND skl.keyword_type = ?`;
            params.push(keywordType);
        }

        query += ` ORDER BY skl.is_primary DESC, k.keyword ASC`;

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching service keywords:', error);
        res.status(500).json({ error: error.message });
    }
};
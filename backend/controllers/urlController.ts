import { Request, Response } from 'express';
import { pool } from '../config/db';
import { generateSlug, validateUrlStructure as validateUrl } from '../utils/urlSlugGenerator';

/**
 * Check if service slug already exists
 */
export const checkServiceSlugExists = async (req: Request, res: Response) => {
    const { slug, excludeId } = req.body;

    try {
        if (!slug) {
            return res.status(400).json({ error: 'Slug is required' });
        }

        let query = 'SELECT id FROM services WHERE slug = ?';
        const params: any[] = [slug];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const result = await pool.query(query, params);
        const exists = result.rows.length > 0;

        res.status(200).json({ exists, slug });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Check if sub-service slug already exists
 */
export const checkSubServiceSlugExists = async (req: Request, res: Response) => {
    const { slug, excludeId } = req.body;

    try {
        if (!slug) {
            return res.status(400).json({ error: 'Slug is required' });
        }

        let query = 'SELECT id FROM sub_services WHERE slug = ?';
        const params: any[] = [slug];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const result = await pool.query(query, params);
        const exists = result.rows.length > 0;

        res.status(200).json({ exists, slug });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Generate unique slug for service
 */
export const generateUniqueServiceSlug = async (req: Request, res: Response) => {
    const { title, excludeId } = req.body;

    try {
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Generate base slug
        const baseSlug = generateSlug(title, {
            maxLength: 100,
            separator: '-',
            lowercase: true,
            removeSpecialChars: true,
            preserveNumbers: true
        });

        // Check if slug already exists
        const checkExisting = async (testSlug: string): Promise<boolean> => {
            let query = 'SELECT id FROM services WHERE slug = ?';
            const params: any[] = [testSlug];

            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId);
            }

            const result = await pool.query(query, params);
            return result.rows.length > 0;
        };

        // Generate unique slug
        let slug = baseSlug;
        let attempt = 0;
        const maxAttempts = 10;

        while (attempt < maxAttempts) {
            const exists = await checkExisting(slug);
            
            if (!exists) {
                break;
            }

            attempt++;
            
            if (attempt === 1) {
                slug = `${baseSlug}-1`;
            } else {
                slug = slug.replace(/-\d+$/, '') + `-${attempt}`;
            }
        }

        if (attempt >= maxAttempts) {
            return res.status(500).json({ error: 'Unable to generate unique slug' });
        }

        // Generate full URL
        const fullUrl = `/services/${slug}`;

        // Validate
        const validation = validateUrl(slug, fullUrl, { type: 'service' });

        res.status(200).json({
            slug,
            fullUrl,
            isValid: validation.isValid,
            warnings: validation.warnings
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Generate unique slug for sub-service
 */
export const generateUniqueSubServiceSlug = async (req: Request, res: Response) => {
    const { title, parentServiceId, excludeId } = req.body;

    try {
        if (!title || !parentServiceId) {
            return res.status(400).json({ error: 'Title and parent service ID are required' });
        }

        // Get parent service slug
        const parentResult = await pool.query('SELECT slug FROM services WHERE id = ?', [parentServiceId]);
        const parentSlug = parentResult.rows[0]?.slug;

        if (!parentSlug) {
            return res.status(400).json({ error: 'Parent service not found' });
        }

        // Generate base slug
        const baseSlug = generateSlug(title, {
            maxLength: 100,
            separator: '-',
            lowercase: true,
            removeSpecialChars: true,
            preserveNumbers: true
        });

        // Check if slug already exists
        const checkExisting = async (testSlug: string): Promise<boolean> => {
            let query = 'SELECT id FROM sub_services WHERE slug = ?';
            const params: any[] = [testSlug];

            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId);
            }

            const result = await pool.query(query, params);
            return result.rows.length > 0;
        };

        // Generate unique slug
        let slug = baseSlug;
        let attempt = 0;
        const maxAttempts = 10;

        while (attempt < maxAttempts) {
            const exists = await checkExisting(slug);
            
            if (!exists) {
                break;
            }

            attempt++;
            
            if (attempt === 1) {
                slug = `${baseSlug}-1`;
            } else {
                slug = slug.replace(/-\d+$/, '') + `-${attempt}`;
            }
        }

        if (attempt >= maxAttempts) {
            return res.status(500).json({ error: 'Unable to generate unique slug' });
        }

        // Generate full URL
        const fullUrl = `/services/${parentSlug}/${slug}`;

        // Validate
        const validation = validateUrl(slug, fullUrl, { 
            type: 'subservice', 
            parentSlug 
        });

        res.status(200).json({
            slug,
            fullUrl,
            isValid: validation.isValid,
            warnings: validation.warnings
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Validate URL structure
 */
export const validateUrlStructureApi = async (req: Request, res: Response) => {
    const { slug, fullUrl, type, parentSlug } = req.body;

    try {
        if (!slug || !fullUrl || !type) {
            return res.status(400).json({ error: 'Slug, full URL, and type are required' });
        }

        const validation = validateUrl(slug, fullUrl, { 
            type: type as 'service' | 'subservice' | 'page' | 'asset', 
            parentSlug 
        });

        res.status(200).json(validation);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get URL suggestions based on title
 */
export const getUrlSuggestions = async (req: Request, res: Response) => {
    const { title, type, parentServiceId } = req.body;

    try {
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Generate multiple suggestions
        const suggestions = [];
        
        // SEO-friendly suggestion
        const seoSlug = generateSlug(title, {
            maxLength: 60,
            separator: '-',
            lowercase: true,
            removeSpecialChars: true,
            preserveNumbers: true,
            customReplacements: {
                '&': 'and',
                '@': 'at',
                '%': 'percent',
                '+': 'plus'
            }
        });

        suggestions.push({
            slug: seoSlug,
            fullUrl: type === 'subservice' && parentServiceId 
                ? `/services/${parentServiceId}/${seoSlug}` 
                : type === 'service' 
                    ? `/services/${seoSlug}`
                    : `/${seoSlug}`,
            type: 'SEO Friendly',
            description: 'Optimized for search engines'
        });

        // Short suggestion
        const shortSlug = generateSlug(title, {
            maxLength: 30,
            separator: '-',
            lowercase: true,
            removeSpecialChars: true,
            preserveNumbers: false
        });

        if (shortSlug !== seoSlug) {
            suggestions.push({
                slug: shortSlug,
                fullUrl: type === 'subservice' && parentServiceId 
                    ? `/services/${parentServiceId}/${shortSlug}` 
                    : type === 'service' 
                        ? `/services/${shortSlug}`
                        : `/${shortSlug}`,
                type: 'Short',
                description: 'Concise and easy to remember'
            });
        }

        // Technical suggestion
        const techSlug = generateSlug(title, {
            maxLength: 50,
            separator: '_',
            lowercase: true,
            removeSpecialChars: true,
            preserveNumbers: true
        });

        if (techSlug !== seoSlug) {
            suggestions.push({
                slug: techSlug,
                fullUrl: type === 'subservice' && parentServiceId 
                    ? `/services/${parentServiceId}/${techSlug}` 
                    : type === 'service' 
                        ? `/services/${techSlug}`
                        : `/${techSlug}`,
                type: 'Technical',
                description: 'Uses underscores instead of hyphens'
            });
        }

        res.status(200).json({ suggestions });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get URL analytics (popular patterns, etc.)
 */
export const getUrlAnalytics = async (req: Request, res: Response) => {
    try {
        // Get service URL patterns
        const serviceResult = await pool.query(`
            SELECT 
                slug,
                full_url,
                created_at,
                LENGTH(slug) as slug_length
            FROM services 
            WHERE slug IS NOT NULL 
            ORDER BY created_at DESC 
            LIMIT 100
        `);

        // Get sub-service URL patterns
        const subServiceResult = await pool.query(`
            SELECT 
                slug,
                full_url,
                parent_service_id,
                created_at,
                LENGTH(slug) as slug_length
            FROM sub_services 
            WHERE slug IS NOT NULL 
            ORDER BY created_at DESC 
            LIMIT 100
        `);

        // Analyze patterns
        const analytics = {
            totalServices: serviceResult.rows.length,
            totalSubServices: subServiceResult.rows.length,
            averageSlugLength: {
                services: serviceResult.rows.reduce((sum: number, row: any) => sum + row.slug_length, 0) / serviceResult.rows.length || 0,
                subServices: subServiceResult.rows.reduce((sum: number, row: any) => sum + row.slug_length, 0) / subServiceResult.rows.length || 0
            },
            commonPatterns: {
                hyphenated: serviceResult.rows.filter((row: any) => row.slug.includes('-')).length,
                underscored: serviceResult.rows.filter((row: any) => row.slug.includes('_')).length,
                numeric: serviceResult.rows.filter((row: any) => /\d/.test(row.slug)).length
            },
            recentUrls: {
                services: serviceResult.rows.slice(0, 10).map((row: any) => ({
                    slug: row.slug,
                    fullUrl: row.full_url,
                    createdAt: row.created_at
                })),
                subServices: subServiceResult.rows.slice(0, 10).map((row: any) => ({
                    slug: row.slug,
                    fullUrl: row.full_url,
                    parentServiceId: row.parent_service_id,
                    createdAt: row.created_at
                }))
            }
        };

        res.status(200).json(analytics);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

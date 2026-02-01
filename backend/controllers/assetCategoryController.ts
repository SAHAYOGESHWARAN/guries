import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

export const getAssetCategories = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const categories = db.prepare(`
            SELECT id, category_name, description, status, created_at, updated_at
            FROM asset_category_master 
            WHERE status = 'active'
            ORDER BY category_name ASC
        `).all();

        res.json(categories);
    } catch (error) {
        console.error('Error fetching asset categories:', error);
        res.status(500).json({ error: 'Failed to fetch asset categories' });
    } finally {
        db.close();
    }
};

export const createAssetCategory = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const { category_name, description } = req.body;

        if (!category_name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const result = db.prepare(`
            INSERT INTO asset_category_master (category_name, description)
            VALUES (?, ?)
        `).run(category_name, description || null);

        const newCategory = db.prepare(`
            SELECT id, category_name, description, status, created_at, updated_at
            FROM asset_category_master 
            WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating asset category:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'Category name already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create asset category' });
        }
    } finally {
        db.close();
    }
};

export const updateAssetCategory = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const { id } = req.params;
        const { category_name, description, status } = req.body;

        const result = db.prepare(`
            UPDATE asset_category_master 
            SET category_name = COALESCE(?, category_name),
                description = COALESCE(?, description),
                status = COALESCE(?, status),
                updated_at = datetime('now')
            WHERE id = ?
        `).run(category_name, description, status, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Asset category not found' });
        }

        const updatedCategory = db.prepare(`
            SELECT id, category_name, description, status, created_at, updated_at
            FROM asset_category_master 
            WHERE id = ?
        `).get(id);

        res.json(updatedCategory);
    } catch (error) {
        console.error('Error updating asset category:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'Category name already exists' });
        } else {
            res.status(500).json({ error: 'Failed to update asset category' });
        }
    } finally {
        db.close();
    }
};

export const deleteAssetCategory = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const { id } = req.params;

        // Soft delete by setting status to 'inactive'
        const result = db.prepare(`
            UPDATE asset_category_master 
            SET status = 'inactive', updated_at = datetime('now')
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Asset category not found' });
        }

        res.json({ message: 'Asset category deleted successfully' });
    } catch (error) {
        console.error('Error deleting asset category:', error);
        res.status(500).json({ error: 'Failed to delete asset category' });
    } finally {
        db.close();
    }
};




// Get assets by repository/category (Web, SEO, SMM)
export const getAssetsByRepository = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        const { repository } = req.query;

        if (!repository) {
            return res.status(400).json({ error: 'Repository parameter is required' });
        }

        // Map repository names to application_type values
        const repositoryToAppType: Record<string, string> = {
            'Web': 'web',
            'SEO': 'seo',
            'SMM': 'smm'
        };

        const appType = repositoryToAppType[repository as string] || (repository as string).toLowerCase();

        console.log(`Fetching assets for repository: ${repository} (appType: ${appType})`);

        const assets = db.prepare(`
            SELECT 
                id,
                asset_name as name,
                asset_type as type,
                asset_category,
                asset_format,
                content_type,
                tags as repository,
                status,
                workflow_stage,
                qc_status,
                created_at,
                updated_at,
                linked_service_id,
                linked_sub_service_id,
                linked_service_ids,
                linked_sub_service_ids,
                COALESCE(og_image_url, web_thumbnail, file_url) as thumbnail_url,
                web_url as url,
                file_url,
                og_image_url,
                application_type,
                linking_active,
                seo_score,
                grammar_score,
                ai_plagiarism_score
            FROM assets
            WHERE application_type = ?
            ORDER BY created_at DESC
        `).all(appType) as any[];

        // Ensure repository field is set correctly based on application_type
        const assetsWithRepository = assets.map(asset => ({
            ...asset,
            repository: repository as string, // Use the requested repository name (Web, SEO, SMM)
            thumbnail_url: asset.thumbnail_url || null // Ensure null instead of undefined
        }));

        console.log(`Found ${assetsWithRepository.length} assets for ${repository}`);

        res.json(assetsWithRepository);
    } catch (error) {
        console.error('Error fetching assets by repository:', error);
        res.status(500).json({ error: 'Failed to fetch assets by repository' });
    } finally {
        db.close();
    }
};

// Get all available repositories/categories (Web, SEO, SMM)
export const getRepositories = async (req: Request, res: Response) => {
    const db = new Database(dbPath);

    try {
        // Get distinct application types from assets table
        const repositories = db.prepare(`
            SELECT DISTINCT 
                CASE 
                    WHEN application_type = 'web' THEN 'Web'
                    WHEN application_type = 'seo' THEN 'SEO'
                    WHEN application_type = 'smm' THEN 'SMM'
                    ELSE application_type
                END as repository
            FROM assets
            WHERE application_type IS NOT NULL AND application_type != ''
            ORDER BY repository ASC
        `).all() as Array<{ repository: string }>;

        // Always include default categories
        const defaultCategories = ['Web', 'SEO', 'SMM'];
        const existingRepos = repositories.map((r: any) => r.repository);

        const allRepos = [
            ...repositories,
            ...defaultCategories
                .filter(cat => !existingRepos.includes(cat))
                .map(cat => ({ repository: cat }))
        ];

        // Remove duplicates and sort
        const uniqueRepos = Array.from(
            new Map(allRepos.map(r => [r.repository, r])).values()
        ).sort((a, b) => a.repository.localeCompare(b.repository));

        console.log('Available repositories:', uniqueRepos);
        res.json(uniqueRepos);
    } catch (error) {
        console.error('Error fetching repositories:', error);
        // Return default repositories on error
        res.json([
            { repository: 'Web' },
            { repository: 'SEO' },
            { repository: 'SMM' }
        ]);
    } finally {
        db.close();
    }
};


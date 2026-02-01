import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getCompetitors = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM competitor_benchmarks ORDER BY id DESC');
        // Parse JSON fields and normalize field names
        const items = result.rows.map((item: any) => ({
            ...item,
            website_url: item.website_url || item.competitor_domain,
            domain: item.domain || item.competitor_domain,
            services_offered: item.services_offered ? (typeof item.services_offered === 'string' ? JSON.parse(item.services_offered) : item.services_offered) : [],
            primary_traffic_sources: item.primary_traffic_sources ? (typeof item.primary_traffic_sources === 'string' ? JSON.parse(item.primary_traffic_sources) : item.primary_traffic_sources) : [],
            attachments: item.attachments ? (typeof item.attachments === 'string' ? JSON.parse(item.attachments) : item.attachments) : []
        }));
        res.status(200).json(items);
    } catch (error: any) {
        console.error('Error fetching competitors:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createCompetitor = async (req: Request, res: Response) => {
    const {
        competitor_name, website_url, primary_country, industry, sector,
        services_offered, notes, status,
        da, spam_score, estimated_monthly_traffic, total_keywords_ranked,
        total_backlinks, primary_traffic_sources
    } = req.body;

    try {
        // Use only columns that exist in the legacy table
        const result = await pool.query(
            `INSERT INTO competitor_benchmarks (
                competitor_name, competitor_domain, industry, sector, region,
                da, dr, monthly_traffic, total_keywords, backlinks, status, updated_on
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                competitor_name,
                website_url || null,
                industry || null,
                sector || null,
                primary_country || null,
                da || 0,
                da || 0, // dr = da for now
                estimated_monthly_traffic || 0,
                total_keywords_ranked || 0,
                total_backlinks || 0,
                status || 'Active',
                new Date().toISOString()
            ]
        );

        const newItem = {
            ...result.rows[0],
            website_url: result.rows[0].competitor_domain,
            domain: result.rows[0].competitor_domain,
            primary_country: result.rows[0].region,
            services_offered: services_offered || [],
            primary_traffic_sources: primary_traffic_sources || ['Organic'],
            attachments: [],
            spam_score: spam_score || 0,
            estimated_monthly_traffic: result.rows[0].monthly_traffic,
            total_keywords_ranked: result.rows[0].total_keywords,
            total_backlinks: result.rows[0].backlinks
        };

        getSocket().emit('competitor_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        console.error('Error creating competitor:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateCompetitor = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        competitor_name, website_url, primary_country, industry, sector,
        status, da, estimated_monthly_traffic, total_keywords_ranked, total_backlinks
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE competitor_benchmarks SET
                competitor_name=COALESCE(?, competitor_name),
                competitor_domain=COALESCE(?, competitor_domain),
                industry=COALESCE(?, industry),
                sector=COALESCE(?, sector),
                region=COALESCE(?, region),
                da=COALESCE(?, da),
                dr=COALESCE(?, dr),
                monthly_traffic=COALESCE(?, monthly_traffic),
                total_keywords=COALESCE(?, total_keywords),
                backlinks=COALESCE(?, backlinks),
                status=COALESCE(?, status),
                updated_on=?
            WHERE id=?`,
            [
                competitor_name,
                website_url,
                industry,
                sector,
                primary_country,
                da,
                da, // dr = da
                estimated_monthly_traffic,
                total_keywords_ranked,
                total_backlinks,
                status,
                new Date().toISOString(),
                id
            ]
        );

        const updatedItem = {
            ...result.rows[0],
            website_url: result.rows[0].competitor_domain,
            domain: result.rows[0].competitor_domain,
            primary_country: result.rows[0].region,
            services_offered: [],
            primary_traffic_sources: ['Organic'],
            attachments: [],
            estimated_monthly_traffic: result.rows[0].monthly_traffic,
            total_keywords_ranked: result.rows[0].total_keywords,
            total_backlinks: result.rows[0].backlinks
        };

        getSocket().emit('competitor_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        console.error('Error updating competitor:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteCompetitor = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM competitor_benchmarks WHERE id = ?', [req.params.id]);
        getSocket().emit('competitor_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting competitor:', error);
        res.status(500).json({ error: error.message });
    }
};


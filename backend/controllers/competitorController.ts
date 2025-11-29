
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getCompetitors = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM competitor_benchmarks ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createCompetitor = async (req: any, res: any) => {
    const { 
        competitor_name, domain, industry, sector, region, 
        da, dr, monthly_traffic, total_keywords, backlinks, 
        ranking_coverage, status 
    } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO competitor_benchmarks (
                competitor_name, domain, industry, sector, region, da, dr, 
                monthly_traffic, total_keywords, backlinks, ranking_coverage, status, updated_on
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) RETURNING *`,
            [
                competitor_name, domain, industry, sector, region, 
                da || 0, dr || 0, monthly_traffic || 0, total_keywords || 0, 
                backlinks || 0, ranking_coverage || 0, status || 'Active'
            ]
        );
        const newItem = result.rows[0];
        getSocket().emit('competitor_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateCompetitor = async (req: any, res: any) => {
    const { id } = req.params;
    const { 
        competitor_name, domain, industry, sector, region, 
        da, dr, monthly_traffic, total_keywords, backlinks, 
        ranking_coverage, status 
    } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE competitor_benchmarks SET 
                competitor_name=COALESCE($1, competitor_name), 
                domain=COALESCE($2, domain), 
                industry=COALESCE($3, industry),
                sector=COALESCE($4, sector),
                region=COALESCE($5, region), 
                da=COALESCE($6, da), 
                dr=COALESCE($7, dr), 
                monthly_traffic=COALESCE($8, monthly_traffic),
                total_keywords=COALESCE($9, total_keywords),
                backlinks=COALESCE($10, backlinks),
                ranking_coverage=COALESCE($11, ranking_coverage),
                status=COALESCE($12, status),
                updated_on=NOW()
            WHERE id=$13 RETURNING *`,
            [
                competitor_name, domain, industry, sector, region, 
                da, dr, monthly_traffic, total_keywords, backlinks, 
                ranking_coverage, status, id
            ]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('competitor_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCompetitor = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM competitor_benchmarks WHERE id = $1', [req.params.id]);
        getSocket().emit('competitor_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

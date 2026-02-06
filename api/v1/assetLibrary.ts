import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

// Create a connection pool
let pool: Pool | null = null;

const getPool = () => {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            console.error('[DB] DATABASE_URL not set');
            return null;
        }

        pool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
            max: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        pool.on('error', (err) => {
            console.error('[DB] Pool error:', err);
            pool = null;
        });
    }

    return pool;
};

// Initialize database schema
const initializeSchema = async (client: any) => {
    try {
        // Check if table exists
        const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'assets'
      )
    `);

        if (!result.rows[0].exists) {
            console.log('[DB] Creating assets table...');

            await client.query(`
        CREATE TABLE assets (
          id SERIAL PRIMARY KEY,
          asset_name TEXT NOT NULL,
          asset_type TEXT,
          asset_category TEXT,
          asset_format TEXT,
          status TEXT DEFAULT 'draft',
          repository TEXT,
          application_type TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            console.log('[DB] Assets table created');
        }
    } catch (err: any) {
        console.error('[DB] Schema initialization error:', err.message);
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const pool = getPool();

    if (!pool) {
        return res.status(500).json({
            success: false,
            error: 'Database connection not available',
            message: 'DATABASE_URL environment variable is not set'
        });
    }

    let client;
    try {
        client = await pool.connect();

        // Initialize schema on first connection
        await initializeSchema(client);

        if (req.method === 'GET') {
            // Get all assets
            const result = await client.query('SELECT * FROM assets ORDER BY created_at DESC LIMIT 100');

            return res.status(200).json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        }

        if (req.method === 'POST') {
            // Create new asset
            const { asset_name, asset_type, asset_category, asset_format, status, name, type, repository, application_type } = req.body;

            const assetNameValue = asset_name || name;
            if (!assetNameValue) {
                return res.status(400).json({
                    success: false,
                    error: 'asset_name or name is required'
                });
            }

            const result = await client.query(
                `INSERT INTO assets (asset_name, asset_type, asset_category, asset_format, status, repository, application_type, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
                [
                    assetNameValue,
                    asset_type || type || null,
                    asset_category || null,
                    asset_format || null,
                    status || 'draft',
                    repository || null,
                    application_type || null
                ]
            );

            const newAsset = result.rows[0];

            return res.status(201).json({
                success: true,
                asset: newAsset,
                data: newAsset,
                message: 'Asset created successfully'
            });
        }

        if (req.method === 'PUT') {
            // Update asset
            const { id } = req.query;
            const { asset_name, status } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'id is required'
                });
            }

            const result = await client.query(
                `UPDATE assets SET asset_name = $1, status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
                [asset_name, status, parseInt(id as string)]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Asset not found'
                });
            }

            return res.status(200).json({
                success: true,
                asset: result.rows[0],
                data: result.rows[0],
                message: 'Asset updated successfully'
            });
        }

        if (req.method === 'DELETE') {
            // Delete asset
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'id is required'
                });
            }

            const result = await client.query(
                'DELETE FROM assets WHERE id = $1 RETURNING id',
                [parseInt(id as string)]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Asset not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Asset deleted successfully'
            });
        }

        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });

    } catch (error: any) {
        console.error('[API] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    } finally {
        if (client) {
            client.release();
        }
    }
}

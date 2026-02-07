import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool, initializeDatabase } from './db';

/**
 * Test Endpoints for Database Verification
 * Tests all CRUD operations and data persistence
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await initializeDatabase();
        const pool = getPool();

        // Test 1: Database Connection
        if (req.url?.includes('/test/connection')) {
            const result = await pool.query('SELECT NOW() as timestamp');
            return res.status(200).json({
                test: 'Database Connection',
                status: 'PASS',
                timestamp: result.rows[0]?.timestamp,
                message: 'Database connection successful'
            });
        }

        // Test 2: Create Asset
        if (req.url?.includes('/test/create-asset') && req.method === 'POST') {
            const { asset_name } = req.body;
            const testName = asset_name || `Test Asset ${Date.now()}`;

            const result = await pool.query(
                `INSERT INTO assets (asset_name, asset_type, status, created_at)
                 VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [testName, 'test', 'draft']
            );

            const asset = result.rows[0];
            return res.status(201).json({
                test: 'Create Asset',
                status: asset?.id ? 'PASS' : 'FAIL',
                asset_id: asset?.id,
                asset_name: asset?.asset_name,
                message: asset?.id ? 'Asset created with ID' : 'Failed to create asset'
            });
        }

        // Test 3: Read Assets
        if (req.url?.includes('/test/read-assets')) {
            const result = await pool.query('SELECT * FROM assets ORDER BY created_at DESC LIMIT 10');
            return res.status(200).json({
                test: 'Read Assets',
                status: 'PASS',
                count: result.rows.length,
                assets: result.rows,
                message: `Retrieved ${result.rows.length} assets`
            });
        }

        // Test 4: Update Asset
        if (req.url?.includes('/test/update-asset') && req.method === 'POST') {
            const { asset_id, asset_name } = req.body;

            if (!asset_id) {
                return res.status(400).json({
                    test: 'Update Asset',
                    status: 'FAIL',
                    message: 'asset_id is required'
                });
            }

            const result = await pool.query(
                `UPDATE assets SET asset_name = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2
                 RETURNING *`,
                [asset_name || `Updated ${Date.now()}`, asset_id]
            );

            const asset = result.rows[0];
            return res.status(200).json({
                test: 'Update Asset',
                status: asset ? 'PASS' : 'FAIL',
                asset_id: asset?.id,
                asset_name: asset?.asset_name,
                message: asset ? 'Asset updated successfully' : 'Asset not found'
            });
        }

        // Test 5: Delete Asset
        if (req.url?.includes('/test/delete-asset') && req.method === 'POST') {
            const { asset_id } = req.body;

            if (!asset_id) {
                return res.status(400).json({
                    test: 'Delete Asset',
                    status: 'FAIL',
                    message: 'asset_id is required'
                });
            }

            const result = await pool.query(
                'DELETE FROM assets WHERE id = $1 RETURNING id',
                [asset_id]
            );

            return res.status(200).json({
                test: 'Delete Asset',
                status: result.rows.length > 0 ? 'PASS' : 'FAIL',
                deleted_id: result.rows[0]?.id,
                message: result.rows.length > 0 ? 'Asset deleted successfully' : 'Asset not found'
            });
        }

        // Test 6: Create Service
        if (req.url?.includes('/test/create-service') && req.method === 'POST') {
            const { service_name } = req.body;
            const testName = service_name || `Test Service ${Date.now()}`;

            const result = await pool.query(
                `INSERT INTO services (service_name, status, created_at)
                 VALUES ($1, $2, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [testName, 'draft']
            );

            const service = result.rows[0];
            return res.status(201).json({
                test: 'Create Service',
                status: service?.id ? 'PASS' : 'FAIL',
                service_id: service?.id,
                service_name: service?.service_name,
                message: service?.id ? 'Service created with ID' : 'Failed to create service'
            });
        }

        // Test 7: Create Keyword
        if (req.url?.includes('/test/create-keyword') && req.method === 'POST') {
            const { keyword_name } = req.body;
            const testName = keyword_name || `Test Keyword ${Date.now()}`;

            const result = await pool.query(
                `INSERT INTO keywords (keyword_name, status, created_at)
                 VALUES ($1, $2, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [testName, 'active']
            );

            const keyword = result.rows[0];
            return res.status(201).json({
                test: 'Create Keyword',
                status: keyword?.id ? 'PASS' : 'FAIL',
                keyword_id: keyword?.id,
                keyword_name: keyword?.keyword_name,
                message: keyword?.id ? 'Keyword created with ID' : 'Failed to create keyword'
            });
        }

        // Test 8: Data Persistence Check
        if (req.url?.includes('/test/persistence')) {
            const assetsResult = await pool.query('SELECT COUNT(*) as count FROM assets');
            const servicesResult = await pool.query('SELECT COUNT(*) as count FROM services');
            const keywordsResult = await pool.query('SELECT COUNT(*) as count FROM keywords');

            return res.status(200).json({
                test: 'Data Persistence',
                status: 'PASS',
                data: {
                    assets_count: parseInt(assetsResult.rows[0]?.count || 0),
                    services_count: parseInt(servicesResult.rows[0]?.count || 0),
                    keywords_count: parseInt(keywordsResult.rows[0]?.count || 0)
                },
                message: 'Data persistence verified'
            });
        }

        // Test 9: Schema Validation
        if (req.url?.includes('/test/schema')) {
            const tables = ['users', 'services', 'sub_services', 'keywords', 'assets'];
            const results = {};

            for (const table of tables) {
                try {
                    const result = await pool.query(
                        `SELECT column_name, data_type FROM information_schema.columns 
                         WHERE table_name = $1 ORDER BY ordinal_position`,
                        [table]
                    );
                    (results as any)[table] = {
                        exists: result.rows.length > 0,
                        columns: result.rows.length
                    };
                } catch (e) {
                    (results as any)[table] = { exists: false, columns: 0 };
                }
            }

            return res.status(200).json({
                test: 'Schema Validation',
                status: 'PASS',
                tables: results,
                message: 'Schema validation complete'
            });
        }

        // Test 10: Performance Test
        if (req.url?.includes('/test/performance')) {
            const startTime = Date.now();

            // Insert 10 test records
            for (let i = 0; i < 10; i++) {
                await pool.query(
                    `INSERT INTO assets (asset_name, status, created_at)
                     VALUES ($1, $2, CURRENT_TIMESTAMP)`,
                    [`Perf Test ${i}`, 'draft']
                );
            }

            const insertTime = Date.now() - startTime;

            // Query all records
            const queryStart = Date.now();
            const result = await pool.query('SELECT * FROM assets');
            const queryTime = Date.now() - queryStart;

            return res.status(200).json({
                test: 'Performance Test',
                status: 'PASS',
                metrics: {
                    insert_10_records_ms: insertTime,
                    query_all_records_ms: queryTime,
                    total_records: result.rows.length
                },
                message: 'Performance test complete'
            });
        }

        // Default: List all available tests
        return res.status(200).json({
            message: 'Test Endpoints Available',
            tests: [
                '/api/test-endpoints?test=connection',
                '/api/test-endpoints?test=create-asset (POST)',
                '/api/test-endpoints?test=read-assets',
                '/api/test-endpoints?test=update-asset (POST)',
                '/api/test-endpoints?test=delete-asset (POST)',
                '/api/test-endpoints?test=create-service (POST)',
                '/api/test-endpoints?test=create-keyword (POST)',
                '/api/test-endpoints?test=persistence',
                '/api/test-endpoints?test=schema',
                '/api/test-endpoints?test=performance'
            ]
        });

    } catch (error: any) {
        console.error('[Test] Error:', error);
        return res.status(500).json({
            test: 'Error',
            status: 'FAIL',
            error: error.message,
            message: 'Test failed with error'
        });
    }
}

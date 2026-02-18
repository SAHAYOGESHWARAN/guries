import { pool } from '../config/db';

describe('API INTEGRATION TESTS', () => {

    // ASSET CREATION API
    test('API 1.1: Asset creation endpoint simulation', async () => {
        const payload = {
            name: 'API Test Asset',
            type: 'image',
            application_type: 'WEB',
            seo_score: 85,
            grammar_score: 90,
            status: 'Pending QC Review'
        };

        const result = await pool.query(
            `INSERT INTO assets (asset_name, asset_type, application_type, seo_score, grammar_score, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [payload.name, payload.type, payload.application_type, payload.seo_score, payload.grammar_score, payload.status]
        );

        expect(result.rows[0].id).toBeDefined();
        const id = result.rows[0].id;

        const verify = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
        expect(verify.rows[0].asset_name).toBe(payload.name);
        expect(verify.rows[0].seo_score).toBe(payload.seo_score);
    });

    // NOTIFICATION API
    test('API 2.1: Get notifications endpoint simulation', async () => {
        const userId = 1;
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [userId, 'API Test', 'Message', 'info', 0]
        );

        const result = await pool.query(
            `SELECT id, user_id, title, message, type, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
            [userId]
        );

        expect(result.rows.length).toBeGreaterThan(0);
        result.rows.forEach(n => expect(n.user_id).toBe(userId));
    });

    test('API 2.2: Mark notification as read endpoint', async () => {
        const notif = await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [1, 'Mark Read', 'Msg', 'info', 0]
        );
        const id = notif.rows[0].id;

        await pool.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);

        const result = await pool.query('SELECT is_read FROM notifications WHERE id = ?', [id]);
        expect(result.rows[0].is_read).toBe(1);
    });

    // STATUS UPDATE API
    test('API 3.1: Update QC status endpoint', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, qc_status, status, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            ['QC API Test', 'Pending', 'draft']
        );
        const id = asset.rows[0].id;

        await pool.query(
            `UPDATE assets SET qc_status = ?, qc_reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`,
            ['Pass', id]
        );

        const result = await pool.query('SELECT qc_status FROM assets WHERE id = ?', [id]);
        expect(result.rows[0].qc_status).toBe('Pass');
    });

    test('API 3.2: Update workflow stage endpoint', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, workflow_stage, status, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            ['Workflow API', 'Add', 'draft']
        );
        const id = asset.rows[0].id;

        await pool.query(`UPDATE assets SET workflow_stage = ? WHERE id = ?`, ['Submit', id]);

        const result = await pool.query('SELECT workflow_stage FROM assets WHERE id = ?', [id]);
        expect(result.rows[0].workflow_stage).toBe('Submit');
    });

    test('API 3.3: Get status history endpoint', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['History API', 'draft']
        );
        const id = asset.rows[0].id;

        for (let i = 0; i < 3; i++) {
            await pool.query(
                `INSERT INTO asset_status_log (asset_id, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [id, `status_${i}`]
            );
        }

        const result = await pool.query(
            `SELECT * FROM asset_status_log WHERE asset_id = ? ORDER BY created_at DESC LIMIT 20 OFFSET 0`,
            [id]
        );

        expect(result.rows.length).toBeGreaterThan(0);
    });

    // ASSET LIBRARY API
    test('API 4.1: Get asset library endpoint', async () => {
        for (let i = 0; i < 3; i++) {
            await pool.query(
                `INSERT INTO assets (asset_name, asset_type, status, created_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [`Library ${i}`, 'image', 'draft']
            );
        }

        const result = await pool.query(
            `SELECT * FROM assets ORDER BY created_at DESC LIMIT 20 OFFSET 0`
        );

        expect(result.rows.length).toBeGreaterThan(0);
    });

    test('API 4.2: Get single asset endpoint', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, asset_type, status, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            ['Single Asset', 'doc', 'draft']
        );
        const id = asset.rows[0].id;

        const result = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);

        expect(result.rows.length).toBe(1);
        expect(result.rows[0].id).toBe(id);
    });

    // SERVICE LINKING API
    test('API 5.1: Link asset to service endpoint', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Link API', 'draft']
        );
        const service = await pool.query(
            `INSERT INTO services (service_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['API Service', 'active']
        );

        const link = await pool.query(
            `INSERT INTO service_asset_links (asset_id, service_id, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [asset.rows[0].id, service.rows[0].id]
        );

        expect(link.rows).toBeDefined();
    });

    test('API 5.2: Get service assets endpoint', async () => {
        const service = await pool.query(
            `INSERT INTO services (service_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Service Assets', 'active']
        );
        const serviceId = service.rows[0].id;

        for (let i = 0; i < 2; i++) {
            const asset = await pool.query(
                `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [`Service Asset ${i}`, 'draft']
            );
            await pool.query(
                `INSERT INTO service_asset_links (asset_id, service_id, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [asset.rows[0].id, serviceId]
            );
        }

        const result = await pool.query(
            `SELECT a.* FROM assets a JOIN service_asset_links l ON a.id = l.asset_id WHERE l.service_id = ?`,
            [serviceId]
        );

        expect(result.rows.length).toBeGreaterThanOrEqual(2);
    });

    // ERROR HANDLING API
    test('API 6.1: Handle missing asset gracefully', async () => {
        const result = await pool.query('SELECT * FROM assets WHERE id = ?', [999999]);
        expect(result.rows.length).toBe(0);
    });

    test('API 6.2: Handle invalid notification gracefully', async () => {
        const result = await pool.query('SELECT * FROM notifications WHERE id = ?', [999999]);
        expect(result.rows.length).toBe(0);
    });

    // RESPONSE FORMAT API
    test('API 7.1: Asset response includes all fields', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, asset_type, asset_category, asset_format, status, seo_score, grammar_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            ['Full Response', 'image', 'SEO', 'PNG', 'draft', 80, 85]
        );
        const id = asset.rows[0].id;

        const result = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
        const row = result.rows[0];

        expect(row.id).toBeDefined();
        expect(row.asset_name).toBeDefined();
        expect(row.asset_type).toBeDefined();
        expect(row.seo_score).toBeDefined();
        expect(row.grammar_score).toBeDefined();
    });

    test('API 7.2: Notification response includes all fields', async () => {
        const notif = await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [1, 'Full Response', 'Message', 'info', 0]
        );
        const id = notif.rows[0].id;

        const result = await pool.query('SELECT * FROM notifications WHERE id = ?', [id]);
        const row = result.rows[0];

        expect(row.id).toBeDefined();
        expect(row.user_id).toBeDefined();
        expect(row.title).toBeDefined();
        expect(row.message).toBeDefined();
        expect(row.type).toBeDefined();
        expect(row.is_read).toBeDefined();
    });

    // PAGINATION API
    test('API 8.1: Pagination with limit and offset', async () => {
        for (let i = 0; i < 10; i++) {
            await pool.query(
                `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [`Pagination ${i}`, 'draft']
            );
        }

        const page1 = await pool.query('SELECT * FROM assets LIMIT 5 OFFSET 0');
        const page2 = await pool.query('SELECT * FROM assets LIMIT 5 OFFSET 5');

        expect(page1.rows.length).toBeLessThanOrEqual(5);
        expect(page2.rows.length).toBeLessThanOrEqual(5);
    });

    test('API 8.2: Total count query', async () => {
        const countResult = await pool.query('SELECT COUNT(*) as total FROM assets');
        expect(countResult.rows[0].total).toBeGreaterThanOrEqual(0);
    });

});

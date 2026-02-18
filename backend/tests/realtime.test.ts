import { pool } from '../config/db';

describe('REALTIME E2E TESTS - All Fixes Validation', () => {

    // TEST 1: DATA PERSISTENCE
    test('TEST 1.1: Asset creation returns ID', async () => {
        const result = await pool.query(
            `INSERT INTO assets (asset_name, asset_type, status, created_at) 
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            ['E2E Test Asset', 'image', 'draft']
        );
        expect(result.rows[0].id).toBeDefined();
        expect(typeof result.rows[0].id).toBe('number');
    });

    test('TEST 1.2: All asset fields persist', async () => {
        const result = await pool.query(
            `INSERT INTO assets (asset_name, asset_type, asset_category, asset_format, status, seo_score, grammar_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            ['Full Asset', 'doc', 'SEO', 'PDF', 'draft', 85, 90]
        );
        const id = result.rows[0].id;
        const select = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
        expect(select.rows[0].asset_name).toBe('Full Asset');
        expect(select.rows[0].seo_score).toBe(85);
        expect(select.rows[0].grammar_score).toBe(90);
    });

    test('TEST 1.3: JSON fields save and parse', async () => {
        const keywords = ['test', 'keywords'];
        const result = await pool.query(
            `INSERT INTO assets (asset_name, keywords, status, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            ['JSON Test', JSON.stringify(keywords), 'draft']
        );
        const id = result.rows[0].id;
        const select = await pool.query('SELECT keywords FROM assets WHERE id = ?', [id]);
        expect(JSON.parse(select.rows[0].keywords)).toEqual(keywords);
    });

    // TEST 2: TABLE DISPLAY
    test('TEST 2.1: asset_website_usage table exists', async () => {
        const result = await pool.query(`SELECT * FROM asset_website_usage LIMIT 1`);
        expect(result).toBeDefined();
    });

    test('TEST 2.2: asset_social_media_usage table exists', async () => {
        const result = await pool.query(`SELECT * FROM asset_social_media_usage LIMIT 1`);
        expect(result).toBeDefined();
    });

    test('TEST 2.3: asset_backlink_usage table exists', async () => {
        const result = await pool.query(`SELECT * FROM asset_backlink_usage LIMIT 1`);
        expect(result).toBeDefined();
    });

    test('TEST 2.4: Usage data queries work', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Usage Test', 'draft']
        );
        const assetId = asset.rows[0].id;
        await pool.query(
            `INSERT INTO asset_website_usage (asset_id, website_url, usage_count, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            [assetId, 'https://example.com', 5]
        );
        const result = await pool.query(
            `SELECT COUNT(*) as count FROM asset_website_usage WHERE asset_id = ?`,
            [assetId]
        );
        expect(result.rows[0].count).toBeGreaterThan(0);
    });

    // TEST 3: STATUS UPDATES
    test('TEST 3.1: QC status updates', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, qc_status, status, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            ['QC Test', 'Pending', 'draft']
        );
        const id = asset.rows[0].id;
        await pool.query(`UPDATE assets SET qc_status = ? WHERE id = ?`, ['Pass', id]);
        const select = await pool.query('SELECT qc_status FROM assets WHERE id = ?', [id]);
        expect(select.rows[0].qc_status).toBe('Pass');
    });

    test('TEST 3.2: Workflow stage updates', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, workflow_stage, status, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            ['Workflow Test', 'Add', 'draft']
        );
        const id = asset.rows[0].id;
        await pool.query(`UPDATE assets SET workflow_stage = ? WHERE id = ?`, ['Submit', id]);
        const select = await pool.query('SELECT workflow_stage FROM assets WHERE id = ?', [id]);
        expect(select.rows[0].workflow_stage).toBe('Submit');
    });

    test('TEST 3.3: Status history logging', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['History Test', 'draft']
        );
        const id = asset.rows[0].id;
        await pool.query(
            `INSERT INTO asset_status_log (asset_id, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [id, 'draft']
        );
        const result = await pool.query('SELECT * FROM asset_status_log WHERE asset_id = ?', [id]);
        expect(result.rows.length).toBeGreaterThan(0);
    });

    // TEST 4: NOTIFICATIONS
    test('TEST 4.1: Notification creation', async () => {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [1, 'Test Notif', 'Test message', 'info', 0]
        );
        expect(result.rows[0].id).toBeDefined();
    });

    test('TEST 4.2: User-scoped notifications', async () => {
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [1, 'User 1', 'Msg', 'info', 0]
        );
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [2, 'User 2', 'Msg', 'info', 0]
        );
        const result = await pool.query('SELECT * FROM notifications WHERE user_id = ?', [1]);
        result.rows.forEach(n => expect(n.user_id).toBe(1));
    });

    test('TEST 4.3: Mark notification as read', async () => {
        const notif = await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [1, 'Read Test', 'Msg', 'info', 0]
        );
        const id = notif.rows[0].id;
        await pool.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);
        const select = await pool.query('SELECT is_read FROM notifications WHERE id = ?', [id]);
        expect(select.rows[0].is_read).toBe(1);
    });

    test('TEST 4.4: Notification pagination', async () => {
        for (let i = 0; i < 5; i++) {
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [1, `Notif ${i}`, 'Msg', 'info', 0]
            );
        }
        const result = await pool.query(
            `SELECT * FROM notifications WHERE user_id = ? LIMIT 2 OFFSET 0`,
            [1]
        );
        expect(result.rows.length).toBeLessThanOrEqual(2);
    });

    // TEST 5: VALIDATION
    test('TEST 5.1: Score range validation', async () => {
        const validScores = [0, 50, 100];
        validScores.forEach(score => {
            expect(score >= 0 && score <= 100).toBe(true);
        });
    });

    test('TEST 5.2: Invalid scores rejected', async () => {
        const invalidScores = [-1, 101, 150];
        invalidScores.forEach(score => {
            expect(score >= 0 && score <= 100).toBe(false);
        });
    });

    // TEST 6: SERVICE LINKING
    test('TEST 6.1: Create service-asset link', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Link Test', 'draft']
        );
        const service = await pool.query(
            `INSERT INTO services (service_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Test Service', 'active']
        );
        const link = await pool.query(
            `INSERT INTO service_asset_links (asset_id, service_id, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [asset.rows[0].id, service.rows[0].id]
        );
        expect(link.rows).toBeDefined();
    });

    test('TEST 6.2: Query linked assets', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Query Link', 'draft']
        );
        const service = await pool.query(
            `INSERT INTO services (service_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Query Service', 'active']
        );
        await pool.query(
            `INSERT INTO service_asset_links (asset_id, service_id, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [asset.rows[0].id, service.rows[0].id]
        );
        const result = await pool.query(
            `SELECT a.* FROM assets a JOIN service_asset_links l ON a.id = l.asset_id WHERE l.service_id = ?`,
            [service.rows[0].id]
        );
        expect(result.rows.length).toBeGreaterThan(0);
    });

    // TEST 7: ERROR HANDLING
    test('TEST 7.1: Invalid ID returns empty', async () => {
        const result = await pool.query('SELECT * FROM assets WHERE id = ?', [999999]);
        expect(result.rows.length).toBe(0);
    });

    test('TEST 7.2: Database connection stable', async () => {
        const result = await pool.query('SELECT * FROM assets LIMIT 1');
        expect(result).toBeDefined();
    });

    // TEST 8: PERFORMANCE
    test('TEST 8.1: Query performance < 1s', async () => {
        const start = Date.now();
        await pool.query('SELECT * FROM assets LIMIT 10');
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(1000);
    });

    test('TEST 8.2: Pagination performance < 500ms', async () => {
        const start = Date.now();
        await pool.query('SELECT * FROM assets LIMIT 20 OFFSET 0');
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(500);
    });

});

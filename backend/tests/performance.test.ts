import { pool } from '../config/db';

describe('PERFORMANCE TESTS', () => {

    // QUERY PERFORMANCE
    test('PERF 1.1: Single asset query < 100ms', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Perf Test', 'draft']
        );
        const id = asset.rows[0].id;

        const start = Date.now();
        await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
    });

    test('PERF 1.2: List query with limit < 200ms', async () => {
        const start = Date.now();
        await pool.query('SELECT * FROM assets LIMIT 20');
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(200);
    });

    test('PERF 1.3: Pagination query < 150ms', async () => {
        const start = Date.now();
        await pool.query('SELECT * FROM assets LIMIT 20 OFFSET 0');
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(150);
    });

    test('PERF 1.4: Count query < 100ms', async () => {
        const start = Date.now();
        await pool.query('SELECT COUNT(*) as total FROM assets');
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
    });

    // JOIN PERFORMANCE
    test('PERF 2.1: Asset with service link join < 150ms', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Join Test', 'draft']
        );
        const service = await pool.query(
            `INSERT INTO services (service_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Join Service', 'active']
        );
        await pool.query(
            `INSERT INTO service_asset_links (asset_id, service_id, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [asset.rows[0].id, service.rows[0].id]
        );

        const start = Date.now();
        await pool.query(
            `SELECT a.* FROM assets a
       JOIN service_asset_links l ON a.id = l.asset_id
       WHERE l.service_id = ?`,
            [service.rows[0].id]
        );
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(150);
    });

    // INSERTION PERFORMANCE
    test('PERF 3.1: Single insert < 50ms', async () => {
        const start = Date.now();
        await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Insert Test', 'draft']
        );
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(50);
    });

    test('PERF 3.2: Bulk insert 10 records < 500ms', async () => {
        const start = Date.now();
        for (let i = 0; i < 10; i++) {
            await pool.query(
                `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [`Bulk ${i}`, 'draft']
            );
        }
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(500);
    });

    // UPDATE PERFORMANCE
    test('PERF 4.1: Single update < 50ms', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Update Test', 'draft']
        );
        const id = asset.rows[0].id;

        const start = Date.now();
        await pool.query(`UPDATE assets SET status = ? WHERE id = ?`, ['active', id]);
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(50);
    });

    test('PERF 4.2: Bulk update 10 records < 500ms', async () => {
        const ids = [];
        for (let i = 0; i < 10; i++) {
            const asset = await pool.query(
                `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [`Bulk Update ${i}`, 'draft']
            );
            ids.push(asset.rows[0].id);
        }

        const start = Date.now();
        for (const id of ids) {
            await pool.query(`UPDATE assets SET status = ? WHERE id = ?`, ['active', id]);
        }
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(500);
    });

    // COMPLEX QUERY PERFORMANCE
    test('PERF 5.1: Asset with usage count < 200ms', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Usage Count', 'draft']
        );
        const id = asset.rows[0].id;

        await pool.query(
            `INSERT INTO asset_website_usage (asset_id, website_url, usage_count, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            [id, 'https://example.com', 5]
        );

        const start = Date.now();
        await pool.query(
            `SELECT a.id, COUNT(w.id) as usage_count
       FROM assets a
       LEFT JOIN asset_website_usage w ON a.id = w.asset_id
       WHERE a.id = ?
       GROUP BY a.id`,
            [id]
        );
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(200);
    });

    // NOTIFICATION QUERY PERFORMANCE
    test('PERF 6.1: User notifications query < 100ms', async () => {
        const userId = 1;
        for (let i = 0; i < 5; i++) {
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [userId, `Notif ${i}`, 'Message', 'info', 0]
            );
        }

        const start = Date.now();
        await pool.query(
            `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
            [userId]
        );
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
    });

    // STATUS LOG QUERY PERFORMANCE
    test('PERF 7.1: Status history query < 100ms', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['History Perf', 'draft']
        );
        const id = asset.rows[0].id;

        for (let i = 0; i < 5; i++) {
            await pool.query(
                `INSERT INTO asset_status_log (asset_id, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [id, `status_${i}`]
            );
        }

        const start = Date.now();
        await pool.query(
            `SELECT * FROM asset_status_log WHERE asset_id = ? ORDER BY created_at DESC LIMIT 20`,
            [id]
        );
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
    });

    // CONCURRENT OPERATIONS
    test('PERF 8.1: Concurrent reads < 300ms', async () => {
        const start = Date.now();
        await Promise.all([
            pool.query('SELECT * FROM assets LIMIT 10'),
            pool.query('SELECT * FROM notifications LIMIT 10'),
            pool.query('SELECT * FROM services LIMIT 10')
        ]);
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(300);
    });

    // MEMORY EFFICIENCY
    test('PERF 9.1: Large result set handling', async () => {
        for (let i = 0; i < 50; i++) {
            await pool.query(
                `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [`Memory Test ${i}`, 'draft']
            );
        }

        const start = Date.now();
        const result = await pool.query('SELECT * FROM assets LIMIT 50');
        const duration = Date.now() - start;

        expect(result.rows.length).toBeLessThanOrEqual(50);
        expect(duration).toBeLessThan(300);
    });

    // INDEX EFFECTIVENESS
    test('PERF 10.1: Indexed query performance', async () => {
        const start = Date.now();
        await pool.query('SELECT * FROM assets WHERE status = ? LIMIT 10', ['draft']);
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
    });

});

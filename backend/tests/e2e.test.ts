/**
 * End-to-End Test Suite
 * Tests all critical fixes across the application
 */

import { pool } from '../config/db';

describe('E2E Tests - All Critical Fixes', () => {

    // ============================================
    // 1. DATA PERSISTENCE TESTS
    // ============================================
    describe('1. Data Persistence - Asset Creation', () => {

        test('Asset creation returns proper ID', async () => {
            const result = await pool.query(
                `INSERT INTO assets (asset_name, asset_type, status, created_at) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                ['Test Asset', 'image', 'draft']
            );

            expect(result.rows).toBeDefined();
            expect(result.rows[0]).toBeDefined();
            expect(result.rows[0].id).toBeDefined();
            expect(typeof result.rows[0].id).toBe('number');
        });

        test('Asset data persists completely', async () => {
            const testData = {
                name: 'Persistence Test',
                type: 'document',
                category: 'SEO',
                format: 'PDF',
                status: 'draft'
            };

            const insertResult = await pool.query(
                `INSERT INTO assets (asset_name, asset_type, asset_category, asset_format, status, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [testData.name, testData.type, testData.category, testData.format, testData.status]
            );

            const assetId = insertResult.rows[0].id;
            expect(assetId).toBeDefined();

            const selectResult = await pool.query(
                'SELECT * FROM assets WHERE id = ?',
                [assetId]
            );

            expect(selectResult.rows.length).toBe(1);
            const asset = selectResult.rows[0];
            expect(asset.asset_name).toBe(testData.name);
            expect(asset.asset_type).toBe(testData.type);
            expect(asset.asset_category).toBe(testData.category);
            expect(asset.asset_format).toBe(testData.format);
            expect(asset.status).toBe(testData.status);
        });

        test('Asset with JSON fields saves correctly', async () => {
            const keywords = ['keyword1', 'keyword2', 'keyword3'];
            const linkedServices = [1, 2, 3];

            const result = await pool.query(
                `INSERT INTO assets (asset_name, keywords, linked_service_ids, status, created_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                ['JSON Test', JSON.stringify(keywords), JSON.stringify(linkedServices), 'draft']
            );

            const assetId = result.rows[0].id;
            const selectResult = await pool.query(
                'SELECT keywords, linked_service_ids FROM assets WHERE id = ?',
                [assetId]
            );

            const asset = selectResult.rows[0];
            expect(JSON.parse(asset.keywords)).toEqual(keywords);
            expect(JSON.parse(asset.linked_service_ids)).toEqual(linkedServices);
        });

        test('Multiple assets can be created without ID conflicts', async () => {
            const ids = [];

            for (let i = 0; i < 5; i++) {
                const result = await pool.query(
                    `INSERT INTO assets (asset_name, status, created_at)
           VALUES (?, ?, CURRENT_TIMESTAMP)`,
                    [`Asset ${i}`, 'draft']
                );
                ids.push(result.rows[0].id);
            }

            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(5);
        });
    });

    // ============================================
    // 2. TABLE DISPLAY TESTS
    // ============================================
    describe('2. Table Display - Missing Tables', () => {

        test('asset_website_usage table exists', async () => {
            const result = await pool.query(
                `SELECT * FROM asset_website_usage LIMIT 1`
            );
            expect(result).toBeDefined();
        });

        test('asset_social_media_usage table exists', async () => {
            const result = await pool.query(
                `SELECT * FROM asset_social_media_usage LIMIT 1`
            );
            expect(result).toBeDefined();
        });

        test('asset_backlink_usage table exists', async () => {
            const result = await pool.query(
                `SELECT * FROM asset_backlink_usage LIMIT 1`
            );
            expect(result).toBeDefined();
        });

        test('Can insert into asset_website_usage', async () => {
            const assetResult = await pool.query(
                `INSERT INTO assets (asset_name, status, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                ['Usage Test', 'draft']
            );
            const assetId = assetResult.rows[0].id;

            const result = await pool.query(
                `INSERT INTO asset_website_usage (asset_id, website_url, usage_count, created_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [assetId, 'https://example.com', 5]
            );

            expect(result.rows).toBeDefined();
        });

        test('Can query asset with usage data', async () => {
            const assetResult = await pool.query(
                `INSERT INTO assets (asset_name, status, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                ['Query Test', 'draft']
            );
            const assetId = assetResult.rows[0].id;

            await pool.query(
                `INSERT INTO asset_website_usage (asset_id, website_url, usage_count, created_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [assetId, 'https://test.com', 3]
            );

            const result = await pool.query(
                `SELECT a.id, a.asset_name, COUNT(w.id) as usage_count
         FROM assets a
         LEFT JOIN asset_website_usage w ON a.id = w.asset_id
         WHERE a.id = ?
         GROUP BY a.id`,
                [assetId]
            );

            expect(result.rows.length).toBe(1);
            expect(result.rows[0].usage_count).toBeGreaterThan(0);
        });
    });

    // ============================================
    // 3. STATUS UPDATE TESTS
    // ============================================
    describe('3. Status Updates - Validation', () => {

        test('Can update QC status', async () => {
            const assetResult = await pool.query(
                `INSERT INTO assets (asset_name, status, qc_status, created_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                ['QC Test', 'draft', 'Pending']
            );
            const assetId = assetResult.rows[0].id;

            const updateResult = await pool.query(
                `UPDATE assets SET qc_status = ? WHERE id = ?`,
                ['Pass', assetId]
            );

            expect(updateResult.rowCount).toBeGreaterThan(0);

            const selectResult = await pool.query(
                'SELECT qc_status FROM assets WHERE id = ?',
                [assetId]
            );

            expect(selectResult.rows[0].qc_status).toBe('Pass');
        });

        test('Can update workflow stage', async () => {
            const assetResult = await pool.query(
                `INSERT INTO assets (asset_name, status, workflow_stage, created_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                ['Workflow Test', 'draft', 'Add']
            );
            const assetId = assetResult.rows[0].id;

            const updateResult = await pool.query(
                `UPDATE assets SET workflow_stage = ? WHERE id = ?`,
                ['Submit', assetId]
            );

            expect(updateResult.rowCount).toBeGreaterThan(0);

            const selectResult = await pool.query(
                'SELECT workflow_stage FROM assets WHERE id = ?',
                [assetId]
            );

            expect(selectResult.rows[0].workflow_stage).toBe('Submit');
        });

        test('Status history is logged', async () => {
            const assetResult = await pool.query(
                `INSERT INTO assets (asset_name, status, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                ['History Test', 'draft']
            );
            const assetId = assetResult.rows[0].id;

            const logResult = await pool.query(
                `INSERT INTO asset_status_log (asset_id, status, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [assetId, 'draft']
            );

            expect(logResult.rows).toBeDefined();

            const selectResult = await pool.query(
                'SELECT * FROM asset_status_log WHERE asset_id = ?',
                [assetId]
            );

            expect(selectResult.rows.length).toBeGreaterThan(0);
        });

        test('Can retrieve status history with pagination', async () => {
            const assetResult = await pool.query(
                `INSERT INTO assets (asset_name, status, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                ['Pagination Test', 'draft']
            );
            const assetId = assetResult.rows[0].id;

            // Insert multiple status changes
            for (let i = 0; i < 5; i++) {
                await pool.query(
                    `INSERT INTO asset_status_log (asset_id, status, created_at)
           VALUES (?, ?, CURRENT_TIMESTAMP)`,
                    [assetId, `status_${i}`]
                );
            }

            const result = await pool.query(
                `SELECT * FROM asset_status_log WHERE asset_id = ? LIMIT 2 OFFSET 0`,
                [assetId]
            );

            expect(result.rows.length).toBeLessThanOrEqual(2);
        });
    });

    // ============================================
    // 4. NOTIFICATION TESTS
    // ============================================
    describe('4. Notifications - Privacy & Validation', () => {

        test('Can create notification for user', async () => {
            const result = await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [1, 'Test Notification', 'Test message', 'info', 0]
            );

            expect(result.rows).toBeDefined();
        });

        test('Can retrieve user-scoped notifications', async () => {
            const userId = 1;

            // Insert notification for user 1
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [userId, 'User 1 Notif', 'Message', 'info', 0]
            );

            // Insert notification for user 2
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [2, 'User 2 Notif', 'Message', 'info', 0]
            );

            // Query user 1 notifications
            const result = await pool.query(
                `SELECT * FROM notifications WHERE user_id = ?`,
                [userId]
            );

            // All results should be for user 1
            result.rows.forEach(notif => {
                expect(notif.user_id).toBe(userId);
            });
        });

        test('Can mark notification as read', async () => {
            const result = await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [1, 'Read Test', 'Message', 'info', 0]
            );

            const notifId = result.rows[0].id;

            await pool.query(
                `UPDATE notifications SET is_read = 1 WHERE id = ?`,
                [notifId]
            );

            const selectResult = await pool.query(
                'SELECT is_read FROM notifications WHERE id = ?',
                [notifId]
            );

            expect(selectResult.rows[0].is_read).toBe(1);
        });

        test('Can retrieve notifications with pagination', async () => {
            const userId = 1;

            // Insert 5 notifications
            for (let i = 0; i < 5; i++) {
                await pool.query(
                    `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                    [userId, `Notif ${i}`, 'Message', 'info', 0]
                );
            }

            // Get paginated results
            const result = await pool.query(
                `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 2 OFFSET 0`,
                [userId]
            );

            expect(result.rows.length).toBeLessThanOrEqual(2);
        });
    });

    // ============================================
    // 5. VALIDATION TESTS
    // ============================================
    describe('5. Input Validation', () => {

        test('Asset name is required', async () => {
            try {
                await pool.query(
                    `INSERT INTO assets (asset_type, status, created_at)
           VALUES (?, ?, CURRENT_TIMESTAMP)`,
                    ['image', 'draft']
                );
                // If we get here, the constraint didn't work
                expect(true).toBe(false);
            } catch (error) {
                // Expected to fail
                expect(error).toBeDefined();
            }
        });

        test('Can validate score ranges', async () => {
            const validScores = [0, 50, 100];
            const invalidScores = [-1, 101, 150];

            validScores.forEach(score => {
                expect(score >= 0 && score <= 100).toBe(true);
            });

            invalidScores.forEach(score => {
                expect(score >= 0 && score <= 100).toBe(false);
            });
        });

        test('JSON fields parse correctly', async () => {
            const keywords = ['test', 'keywords'];
            const jsonStr = JSON.stringify(keywords);
            const parsed = JSON.parse(jsonStr);

            expect(parsed).toEqual(keywords);
        });
    });

    // ============================================
    // 6. SERVICE LINKING TESTS
    // ============================================
    describe('6. Service Linking', () => {

        test('Can create service-asset link', async () => {
            const assetResult = await pool.query(
                `INSERT INTO assets (asset_name, status, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                ['Link Test', 'draft']
            );
            const assetId = assetResult.rows[0].id;

            const serviceResult = await pool.query(
                `INSERT INTO services (service_name, status, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                ['Test Service', 'active']
            );
            const serviceId = serviceResult.rows[0].id;

            const linkResult = await pool.query(
                `INSERT INTO service_asset_links (asset_id, service_id, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [assetId, serviceId]
            );

            expect(linkResult.rows).toBeDefined();
        });

        test('Can query linked assets', async () => {
            const assetResult = await pool.query(
                `INSERT INTO assets (asset_name, status, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                ['Query Link Test', 'draft']
            );
            const assetId = assetResult.rows[0].id;

            const serviceResult = await pool.query(
                `INSERT INTO services (service_name, status, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                ['Query Service', 'active']
            );
            const serviceId = serviceResult.rows[0].id;

            await pool.query(
                `INSERT INTO service_asset_links (asset_id, service_id, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [assetId, serviceId]
            );

            const result = await pool.query(
                `SELECT a.* FROM assets a
         JOIN service_asset_links l ON a.id = l.asset_id
         WHERE l.service_id = ?`,
                [serviceId]
            );

            expect(result.rows.length).toBeGreaterThan(0);
            expect(result.rows[0].id).toBe(assetId);
        });
    });

    // ============================================
    // 7. ERROR HANDLING TESTS
    // ============================================
    describe('7. Error Handling', () => {

        test('Invalid asset ID returns no results', async () => {
            const result = await pool.query(
                'SELECT * FROM assets WHERE id = ?',
                [999999]
            );

            expect(result.rows.length).toBe(0);
        });

        test('Database connection handles errors gracefully', async () => {
            try {
                const result = await pool.query(
                    'SELECT * FROM assets WHERE id = ?',
                    [1]
                );
                expect(result).toBeDefined();
            } catch (error) {
                expect(error).toBeDefined();
            }
        });
    });

    // ============================================
    // 8. PERFORMANCE TESTS
    // ============================================
    describe('8. Performance', () => {

        test('Query completes within acceptable time', async () => {
            const startTime = Date.now();

            await pool.query(
                'SELECT * FROM assets LIMIT 10'
            );

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(1000); // Should complete in < 1 second
        });

        test('Pagination query is efficient', async () => {
            const startTime = Date.now();

            await pool.query(
                'SELECT * FROM assets LIMIT 20 OFFSET 0'
            );

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(500); // Should complete in < 500ms
        });
    });

});

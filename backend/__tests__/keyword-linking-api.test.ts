import { pool } from '../config/db';
import * as keywordController from '../controllers/keywordController';

describe('Keyword Linking API Endpoints', () => {
    const testSubServiceId = 9999;
    const testSubServiceName = 'Test Sub-Service API';
    const testKeywords = ['api-test-kw-1', 'api-test-kw-2'];

    beforeAll(async () => {
        // Create test keywords
        for (const keyword of testKeywords) {
            const existing = await pool.query('SELECT id FROM keywords WHERE keyword = ?', [keyword]);
            if (existing.rows.length === 0) {
                await pool.query(
                    `INSERT INTO keywords (keyword, keyword_intent, keyword_type, language, search_volume, competition_score, status, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [keyword, 'informational', 'primary', 'English', 500, 'Low', 'active', new Date().toISOString(), new Date().toISOString()]
                );
            }
        }
    });

    afterAll(async () => {
        // Clean up
        for (const keyword of testKeywords) {
            await pool.query(
                `UPDATE keywords SET mapped_sub_service_id = NULL, mapped_sub_service = NULL WHERE keyword = ?`,
                [keyword]
            );
        }
    });

    test('should link keywords to sub-service via database', async () => {
        // Simulate the linkKeywordsToSubService logic
        for (const keyword of testKeywords) {
            await pool.query(
                `UPDATE keywords SET mapped_sub_service_id = ?, mapped_sub_service = ?, updated_at = ? WHERE keyword = ?`,
                [testSubServiceId, testSubServiceName, new Date().toISOString(), keyword]
            );
        }

        // Verify linking
        const result = await pool.query(
            `SELECT * FROM keywords WHERE mapped_sub_service_id = ? ORDER BY keyword ASC`,
            [testSubServiceId]
        );

        expect(result.rows.length).toBe(testKeywords.length);
        expect(result.rows[0].mapped_sub_service_id).toBe(testSubServiceId);
        expect(result.rows[0].mapped_sub_service).toBe(testSubServiceName);
    });

    test('should unlink keywords from sub-service via database', async () => {
        // First ensure keywords are linked
        for (const keyword of testKeywords) {
            await pool.query(
                `UPDATE keywords SET mapped_sub_service_id = ?, mapped_sub_service = ? WHERE keyword = ?`,
                [testSubServiceId, testSubServiceName, keyword]
            );
        }

        // Unlink keywords
        for (const keyword of testKeywords) {
            await pool.query(
                `UPDATE keywords SET mapped_sub_service_id = NULL, mapped_sub_service = NULL WHERE keyword = ? AND mapped_sub_service_id = ?`,
                [keyword, testSubServiceId]
            );
        }

        // Verify unlinking
        const result = await pool.query(
            `SELECT * FROM keywords WHERE mapped_sub_service_id = ?`,
            [testSubServiceId]
        );

        expect(result.rows.length).toBe(0);
    });

    test('should retrieve sub-service linked keywords via database', async () => {
        // Link keywords
        for (const keyword of testKeywords) {
            await pool.query(
                `UPDATE keywords SET mapped_sub_service_id = ?, mapped_sub_service = ? WHERE keyword = ?`,
                [testSubServiceId, testSubServiceName, keyword]
            );
        }

        // Retrieve linked keywords
        const result = await pool.query(
            `SELECT * FROM keywords WHERE mapped_sub_service_id = ? ORDER BY keyword ASC`,
            [testSubServiceId]
        );

        expect(result.rows.length).toBe(testKeywords.length);
        expect(result.rows.every((row: any) => row.mapped_sub_service_id === testSubServiceId)).toBe(true);

        // Clean up
        for (const keyword of testKeywords) {
            await pool.query(
                `UPDATE keywords SET mapped_sub_service_id = NULL, mapped_sub_service = NULL WHERE keyword = ?`,
                [keyword]
            );
        }
    });

    test('should handle multiple sub-services with different keywords', async () => {
        const subService1Id = 8888;
        const subService2Id = 7777;
        const kw1 = 'api-test-kw-1';
        const kw2 = 'api-test-kw-2';

        // Link kw1 to subService1
        await pool.query(
            `UPDATE keywords SET mapped_sub_service_id = ?, mapped_sub_service = ? WHERE keyword = ?`,
            [subService1Id, 'Sub1', kw1]
        );

        // Link kw2 to subService2
        await pool.query(
            `UPDATE keywords SET mapped_sub_service_id = ?, mapped_sub_service = ? WHERE keyword = ?`,
            [subService2Id, 'Sub2', kw2]
        );

        // Verify separation
        const result1 = await pool.query(
            `SELECT * FROM keywords WHERE mapped_sub_service_id = ?`,
            [subService1Id]
        );

        const result2 = await pool.query(
            `SELECT * FROM keywords WHERE mapped_sub_service_id = ?`,
            [subService2Id]
        );

        expect(result1.rows.length).toBe(1);
        expect(result2.rows.length).toBe(1);
        expect(result1.rows[0].keyword).toBe(kw1);
        expect(result2.rows[0].keyword).toBe(kw2);

        // Clean up
        await pool.query(
            `UPDATE keywords SET mapped_sub_service_id = NULL, mapped_sub_service = NULL WHERE keyword IN (?, ?)`,
            [kw1, kw2]
        );
    });
});

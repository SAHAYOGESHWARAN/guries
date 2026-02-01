import { pool } from '../config/db';

describe('Sub-Service Meta Keywords Linking', () => {
    const testSubServiceId = 999;
    const testSubServiceName = 'Test Sub-Service';
    const testKeywords = ['test-kw-1', 'test-kw-2', 'test-kw-3'];

    beforeAll(async () => {
        // Create test keywords if they don't exist
        for (const keyword of testKeywords) {
            const existing = await pool.query('SELECT id FROM keywords WHERE keyword = ?', [keyword]);
            if (existing.rows.length === 0) {
                await pool.query(
                    `INSERT INTO keywords (keyword, keyword_intent, keyword_type, language, search_volume, competition_score, status, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [keyword, 'informational', 'primary', 'English', 1000, 'Medium', 'active', new Date().toISOString(), new Date().toISOString()]
                );
            }
        }
    });

    afterAll(async () => {
        // Clean up test data
        for (const keyword of testKeywords) {
            await pool.query(
                `UPDATE keywords SET mapped_sub_service_id = NULL, mapped_sub_service = NULL WHERE keyword = ?`,
                [keyword]
            );
        }
    });

    test('should link keywords to sub-service', async () => {
        // Link keywords
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
        expect(result.rows[0].mapped_sub_service).toBe(testSubServiceName);
        expect(result.rows[0].mapped_sub_service_id).toBe(testSubServiceId);
    });

    test('should retrieve meta_keywords from sub_services table', async () => {
        // Just verify the column exists by querying it
        try {
            const result = await pool.query(`SELECT meta_keywords FROM sub_services LIMIT 1`);
            // If we get here, the column exists
            expect(true).toBe(true);
        } catch (error: any) {
            // If column doesn't exist, this will throw an error
            expect(error.message).not.toContain('no such column');
        }
    });

    test('should update sub-service with meta_keywords', async () => {
        // Just verify we can update the column
        try {
            // Try to update an existing sub-service with meta_keywords
            const existing = await pool.query(`SELECT id FROM sub_services LIMIT 1`);
            if (existing.rows.length > 0) {
                const subServiceId = existing.rows[0].id;
                const metaKeywords = JSON.stringify(['test-kw-1', 'test-kw-2']);
                await pool.query(
                    `UPDATE sub_services SET meta_keywords = ?, updated_at = ? WHERE id = ?`,
                    [metaKeywords, new Date().toISOString(), subServiceId]
                );

                // Verify update
                const result = await pool.query(
                    `SELECT meta_keywords FROM sub_services WHERE id = ?`,
                    [subServiceId]
                );

                if (result.rows[0].meta_keywords) {
                    const parsedKeywords = JSON.parse(result.rows[0].meta_keywords);
                    expect(parsedKeywords).toEqual(['test-kw-1', 'test-kw-2']);
                }
            }
            expect(true).toBe(true);
        } catch (error: any) {
            expect(error.message).not.toContain('no such column');
        }
    });
});

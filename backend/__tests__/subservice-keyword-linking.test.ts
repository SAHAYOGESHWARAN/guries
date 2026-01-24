import { pool } from '../config/db-sqlite';

describe('SubService Keyword Linking', () => {
    beforeAll(async () => {
        console.log('🔗 Database connection established for SubService Keyword Linking tests');
    });

    afterAll(async () => {
        console.log('🔗 Database connection closed');
    });

    test('should store and retrieve focus keywords for sub-services', async () => {
        const focusKeywords = ['web development', 'custom solutions'];
        const timestamp = Date.now();

        await pool.query(
            `INSERT INTO sub_services (
                sub_service_name, sub_service_code, parent_service_id, slug, full_url, description, status,
                focus_keywords, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                `Test SubService ${timestamp}`, `TSS-${timestamp}`, 1, `test-${timestamp}`,
                `/services/web/test-${timestamp}`, 'Test description', 'Draft',
                JSON.stringify(focusKeywords)
            ]
        );

        const result = await pool.query(
            'SELECT focus_keywords FROM sub_services WHERE sub_service_code = ?',
            [`TSS-${timestamp}`]
        );

        expect(result.rows.length).toBeGreaterThan(0);
        const stored = JSON.parse(result.rows[0].focus_keywords);
        expect(stored).toEqual(focusKeywords);
    });

    test('should store and retrieve secondary keywords for sub-services', async () => {
        const secondaryKeywords = ['semantic helper 1', 'semantic helper 2'];
        const timestamp = Date.now();

        await pool.query(
            `INSERT INTO sub_services (
                sub_service_name, sub_service_code, parent_service_id, slug, full_url, description, status,
                secondary_keywords, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                `Secondary Test ${timestamp}`, `SEC-${timestamp}`, 1, `secondary-${timestamp}`,
                `/services/web/secondary-${timestamp}`, 'Test description', 'Draft',
                JSON.stringify(secondaryKeywords)
            ]
        );

        const result = await pool.query(
            'SELECT secondary_keywords FROM sub_services WHERE sub_service_code = ?',
            [`SEC-${timestamp}`]
        );

        expect(result.rows.length).toBeGreaterThan(0);
        const stored = JSON.parse(result.rows[0].secondary_keywords);
        expect(stored).toEqual(secondaryKeywords);
    });

    test('should store and retrieve meta keywords for sub-services', async () => {
        const metaKeywords = ['meta 1', 'meta 2', 'meta 3'];
        const timestamp = Date.now();

        await pool.query(
            `INSERT INTO sub_services (
                sub_service_name, sub_service_code, parent_service_id, slug, full_url, description, status,
                meta_keywords, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                `Meta Test ${timestamp}`, `META-${timestamp}`, 1, `meta-${timestamp}`,
                `/services/web/meta-${timestamp}`, 'Test description', 'Draft',
                JSON.stringify(metaKeywords)
            ]
        );

        const result = await pool.query(
            'SELECT meta_keywords FROM sub_services WHERE sub_service_code = ?',
            [`META-${timestamp}`]
        );

        expect(result.rows.length).toBeGreaterThan(0);
        const stored = JSON.parse(result.rows[0].meta_keywords);
        expect(stored).toEqual(metaKeywords);
    });

    test('should handle all three keyword types together', async () => {
        const focusKeywords = ['primary 1', 'primary 2'];
        const secondaryKeywords = ['secondary 1', 'secondary 2'];
        const metaKeywords = ['meta 1', 'meta 2'];
        const timestamp = Date.now();

        await pool.query(
            `INSERT INTO sub_services (
                sub_service_name, sub_service_code, parent_service_id, slug, full_url, description, status,
                focus_keywords, secondary_keywords, meta_keywords, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                `Combined Test ${timestamp}`, `COMB-${timestamp}`, 1, `combined-${timestamp}`,
                `/services/web/combined-${timestamp}`, 'Test description', 'Draft',
                JSON.stringify(focusKeywords), JSON.stringify(secondaryKeywords), JSON.stringify(metaKeywords)
            ]
        );

        const result = await pool.query(
            'SELECT focus_keywords, secondary_keywords, meta_keywords FROM sub_services WHERE sub_service_code = ?',
            [`COMB-${timestamp}`]
        );

        expect(result.rows.length).toBeGreaterThan(0);
        expect(JSON.parse(result.rows[0].focus_keywords)).toEqual(focusKeywords);
        expect(JSON.parse(result.rows[0].secondary_keywords)).toEqual(secondaryKeywords);
        expect(JSON.parse(result.rows[0].meta_keywords)).toEqual(metaKeywords);
    });

    test('should update sub-service keywords', async () => {
        const timestamp = Date.now();
        const code = `UPD-${timestamp}`;

        // Create
        await pool.query(
            `INSERT INTO sub_services (
                sub_service_name, sub_service_code, parent_service_id, slug, full_url, description, status,
                focus_keywords, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                `Update Test ${timestamp}`, code, 1, `update-${timestamp}`,
                `/services/web/update-${timestamp}`, 'Test description', 'Draft',
                JSON.stringify(['old keyword'])
            ]
        );

        // Update
        const newKeywords = ['new keyword 1', 'new keyword 2'];
        await pool.query(
            'UPDATE sub_services SET focus_keywords = ? WHERE sub_service_code = ?',
            [JSON.stringify(newKeywords), code]
        );

        // Verify
        const result = await pool.query(
            'SELECT focus_keywords FROM sub_services WHERE sub_service_code = ?',
            [code]
        );

        expect(result.rows.length).toBeGreaterThan(0);
        expect(JSON.parse(result.rows[0].focus_keywords)).toEqual(newKeywords);
    });

    test('should handle empty keyword arrays', async () => {
        const timestamp = Date.now();

        await pool.query(
            `INSERT INTO sub_services (
                sub_service_name, sub_service_code, parent_service_id, slug, full_url, description, status,
                focus_keywords, secondary_keywords, meta_keywords, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                `Empty Test ${timestamp}`, `EMPTY-${timestamp}`, 1, `empty-${timestamp}`,
                `/services/web/empty-${timestamp}`, 'Test description', 'Draft',
                JSON.stringify([]), JSON.stringify([]), JSON.stringify([])
            ]
        );

        const result = await pool.query(
            'SELECT focus_keywords, secondary_keywords, meta_keywords FROM sub_services WHERE sub_service_code = ?',
            [`EMPTY-${timestamp}`]
        );

        expect(result.rows.length).toBeGreaterThan(0);
        expect(JSON.parse(result.rows[0].focus_keywords)).toEqual([]);
        expect(JSON.parse(result.rows[0].secondary_keywords)).toEqual([]);
        expect(JSON.parse(result.rows[0].meta_keywords)).toEqual([]);
    });

    test('should count sub-services with keywords', async () => {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN focus_keywords != '[]' AND focus_keywords != '' THEN 1 ELSE 0 END) as with_focus,
                SUM(CASE WHEN secondary_keywords != '[]' AND secondary_keywords != '' THEN 1 ELSE 0 END) as with_secondary,
                SUM(CASE WHEN meta_keywords != '[]' AND meta_keywords != '' THEN 1 ELSE 0 END) as with_meta
             FROM sub_services`
        );

        const summary = result.rows[0];
        console.log(`
🔗 SubService Keyword Linking Summary:
  - Total Sub-Services: ${summary.total}
  - With Focus Keywords: ${summary.with_focus || 0}
  - With Secondary Keywords: ${summary.with_secondary || 0}
  - With Meta Keywords: ${summary.with_meta || 0}
        `);

        expect(summary.total).toBeGreaterThan(0);
    });

    test('should preserve keyword order', async () => {
        const keywords = ['first', 'second', 'third', 'fourth'];
        const timestamp = Date.now();

        await pool.query(
            `INSERT INTO sub_services (
                sub_service_name, sub_service_code, parent_service_id, slug, full_url, description, status,
                focus_keywords, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                `Order Test ${timestamp}`, `ORD-${timestamp}`, 1, `order-${timestamp}`,
                `/services/web/order-${timestamp}`, 'Test description', 'Draft',
                JSON.stringify(keywords)
            ]
        );

        const result = await pool.query(
            'SELECT focus_keywords FROM sub_services WHERE sub_service_code = ?',
            [`ORD-${timestamp}`]
        );

        expect(result.rows.length).toBeGreaterThan(0);
        const stored = JSON.parse(result.rows[0].focus_keywords);
        expect(stored).toEqual(keywords);
        expect(stored[0]).toBe('first');
        expect(stored[3]).toBe('fourth');
    });

    test('should handle special characters in keywords', async () => {
        const keywords = ['c++ programming', 'node.js', 'web 2.0', 'seo/sem'];
        const timestamp = Date.now();

        await pool.query(
            `INSERT INTO sub_services (
                sub_service_name, sub_service_code, parent_service_id, slug, full_url, description, status,
                focus_keywords, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                `Special Test ${timestamp}`, `SPEC-${timestamp}`, 1, `special-${timestamp}`,
                `/services/web/special-${timestamp}`, 'Test description', 'Draft',
                JSON.stringify(keywords)
            ]
        );

        const result = await pool.query(
            'SELECT focus_keywords FROM sub_services WHERE sub_service_code = ?',
            [`SPEC-${timestamp}`]
        );

        expect(result.rows.length).toBeGreaterThan(0);
        const stored = JSON.parse(result.rows[0].focus_keywords);
        expect(stored).toEqual(keywords);
    });
});

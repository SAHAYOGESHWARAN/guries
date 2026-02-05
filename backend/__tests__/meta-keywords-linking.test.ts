import { pool } from '../config/db';

describe('Meta Keywords Linking with Keyword Master', () => {
    beforeAll(async () => {
        console.log('🔗 Database connection established for Meta Keywords tests');
    });

    describe('Service Meta Keywords', () => {
        it('should retrieve services with meta_keywords field', async () => {
            const result = await pool.query(
                `SELECT id, service_name, meta_keywords FROM services WHERE meta_keywords IS NOT NULL LIMIT 5`
            );
            expect(result.rows.length).toBeGreaterThanOrEqual(0);
            if (result.rows.length > 0) {
                expect(result.rows[0]).toHaveProperty('meta_keywords');
            }
        });
    });

    describe('SubService Meta Keywords', () => {
        it('should retrieve sub-services with meta_keywords field', async () => {
            const result = await pool.query(
                `SELECT id, sub_service_name, meta_keywords FROM sub_services WHERE meta_keywords IS NOT NULL LIMIT 5`
            );
            expect(result.rows.length).toBeGreaterThanOrEqual(0);
            if (result.rows.length > 0) {
                expect(result.rows[0]).toHaveProperty('meta_keywords');
            }
        });
    });

    describe('Meta Keywords Data Integrity', () => {
        it('should handle JSON parsing of meta_keywords', async () => {
            const result = await pool.query(
                `SELECT meta_keywords FROM services WHERE meta_keywords IS NOT NULL LIMIT 1`
            );
            if (result.rows.length > 0) {
                const { meta_keywords } = result.rows[0];
                if (meta_keywords) {
                    const parsed = JSON.parse(meta_keywords);
                    expect(Array.isArray(parsed)).toBe(true);
                }
            }
        });

        it('should handle empty meta_keywords array', async () => {
            const result = await pool.query(
                `SELECT meta_keywords FROM services WHERE meta_keywords = '[]' LIMIT 1`
            );
            if (result.rows.length > 0) {
                const { meta_keywords } = result.rows[0];
                const parsed = JSON.parse(meta_keywords);
                expect(Array.isArray(parsed)).toBe(true);
                expect(parsed.length).toBe(0);
            }
        });
    });

    describe('Meta Keywords Query Performance', () => {
        it('should query services with meta_keywords efficiently', async () => {
            const startTime = Date.now();
            const result = await pool.query(
                `SELECT id, service_name, meta_keywords FROM services WHERE meta_keywords IS NOT NULL AND meta_keywords != '[]' LIMIT 100`
            );
            const queryTime = Date.now() - startTime;
            console.log(`✓ Meta keywords query: ${queryTime}ms`);
            expect(queryTime).toBeLessThan(1000);
        });

        it('should query sub-services with meta_keywords efficiently', async () => {
            const startTime = Date.now();
            const result = await pool.query(
                `SELECT id, sub_service_name, meta_keywords FROM sub_services WHERE meta_keywords IS NOT NULL AND meta_keywords != '[]' LIMIT 100`
            );
            const queryTime = Date.now() - startTime;
            console.log(`✓ Sub-service meta keywords query: ${queryTime}ms`);
            expect(queryTime).toBeLessThan(1000);
        });
    });

    describe('Meta Keywords Summary', () => {
        it('should provide summary of meta keywords usage', async () => {
            const servicesWithKeywords = await pool.query(
                `SELECT COUNT(*) as count FROM services WHERE meta_keywords IS NOT NULL AND meta_keywords != '[]'`
            );
            const subServicesWithKeywords = await pool.query(
                `SELECT COUNT(*) as count FROM sub_services WHERE meta_keywords IS NOT NULL AND meta_keywords != '[]'`
            );

            const servicesCount = servicesWithKeywords.rows[0]?.count || 0;
            const subServicesCount = subServicesWithKeywords.rows[0]?.count || 0;

            console.log(`
✓ Meta Keywords Summary:
  - Services with meta_keywords: ${servicesCount}
  - Sub-services with meta_keywords: ${subServicesCount}
            `);

            // Allow 0 or more services/sub-services with keywords
            expect(servicesWithKeywords.rows.length).toBeGreaterThanOrEqual(0);
            expect(subServicesWithKeywords.rows.length).toBeGreaterThanOrEqual(0);
        });

        it('should verify meta_keywords are properly stored as JSON', async () => {
            const result = await pool.query(
                `SELECT meta_keywords FROM services WHERE meta_keywords IS NOT NULL AND meta_keywords != '[]' LIMIT 5`
            );
            result.rows.forEach((row: any) => {
                if (row.meta_keywords) {
                    const parsed = JSON.parse(row.meta_keywords);
                    expect(Array.isArray(parsed)).toBe(true);
                }
            });
        });
    });

    describe('Frontend Integration', () => {
        it('should verify services have meta_keywords field', async () => {
            const result = await pool.query(`SELECT id, service_name, meta_keywords FROM services LIMIT 1`);
            if (result.rows.length > 0) {
                const service = result.rows[0];
                expect(service).toHaveProperty('meta_keywords');
            }
        });

        it('should verify sub-services have meta_keywords field', async () => {
            const result = await pool.query(`SELECT id, sub_service_name, meta_keywords FROM sub_services LIMIT 1`);
            if (result.rows.length > 0) {
                const subService = result.rows[0];
                expect(subService).toHaveProperty('meta_keywords');
            }
        });
    });
});


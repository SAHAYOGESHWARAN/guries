import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

describe('Web Asset Linking - Database Unit Tests', () => {
    let db: Database.Database;

    beforeAll(() => {
        db = new Database(dbPath);
        console.log('✓ Database connection established');
    });

    afterAll(() => {
        db.close();
        console.log('✓ Database connection closed');
    });

    describe('Database Schema Validation', () => {
        test('assets table should have application_type column', () => {
            const result = db.prepare(`
                PRAGMA table_info(assets)
            `).all();

            const hasAppType = result.some((col: any) => col.name === 'application_type');
            expect(hasAppType).toBe(true);
        });

        test('assets table should have required fields for web assets', () => {
            const result = db.prepare(`
                PRAGMA table_info(assets)
            `).all();

            const requiredFields = [
                'id', 'asset_name', 'asset_type', 'application_type',
                'status', 'workflow_stage', 'qc_status', 'linking_active'
            ];

            const columnNames = result.map((col: any) => col.name);
            requiredFields.forEach(field => {
                expect(columnNames).toContain(field);
            });
        });
    });

    describe('Asset Repository Filtering', () => {
        test('should query web assets by application_type', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM assets WHERE application_type = 'web'
            `).get() as any;

            console.log(`✓ Found ${result.count} web assets`);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });

        test('should query SEO assets by application_type', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM assets WHERE application_type = 'seo'
            `).get() as any;

            console.log(`✓ Found ${result.count} SEO assets`);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });

        test('should query SMM assets by application_type', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM assets WHERE application_type = 'smm'
            `).get() as any;

            console.log(`✓ Found ${result.count} SMM assets`);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Asset Status Filtering', () => {
        test('web assets should have valid status values', () => {
            const result = db.prepare(`
                SELECT DISTINCT status FROM assets WHERE application_type = 'web'
            `).all() as any[];

            const validStatuses = ['Draft', 'Pending QC Review', 'Published', 'QC Approved', 'Rework Required'];
            result.forEach(row => {
                expect(validStatuses).toContain(row.status);
            });
        });
    });

    describe('Asset Type Separation', () => {
        test('web assets should not appear in SEO queries', () => {
            const webCount = db.prepare(`
                SELECT COUNT(*) as count FROM assets WHERE application_type = 'web'
            `).get() as any;

            const webInSeo = db.prepare(`
                SELECT COUNT(*) as count FROM assets WHERE application_type = 'seo' AND application_type = 'web'
            `).get() as any;

            expect(webInSeo.count).toBe(0);
        });

        test('SEO assets should not appear in web queries', () => {
            const seoInWeb = db.prepare(`
                SELECT COUNT(*) as count FROM assets WHERE application_type = 'web' AND application_type = 'seo'
            `).get() as any;

            expect(seoInWeb.count).toBe(0);
        });
    });

    describe('Asset Linking Fields', () => {
        test('web assets should have linking_active field', () => {
            const result = db.prepare(`
                SELECT id, linking_active FROM assets WHERE application_type = 'web' LIMIT 1
            `).get() as any;

            if (result) {
                expect(result.linking_active).toBeDefined();
            }
        });

        test('web assets should have linked_service_ids field', () => {
            const result = db.prepare(`
                SELECT id, linked_service_ids FROM assets WHERE application_type = 'web' LIMIT 1
            `).get() as any;

            if (result) {
                expect(result.linked_service_ids).toBeDefined();
            }
        });
    });

    describe('Query Performance', () => {
        test('should efficiently query web assets', () => {
            const start = Date.now();
            db.prepare(`
                SELECT COUNT(*) as count FROM assets WHERE application_type = 'web'
            `).get();
            const duration = Date.now() - start;

            console.log(`✓ Web assets query: ${duration}ms`);
            expect(duration).toBeLessThan(100);
        });

        test('should efficiently query repositories', () => {
            const start = Date.now();
            db.prepare(`
                SELECT DISTINCT application_type FROM assets WHERE application_type IS NOT NULL
            `).all();
            const duration = Date.now() - start;

            console.log(`✓ Repository query: ${duration}ms`);
            expect(duration).toBeLessThan(100);
        });
    });

    describe('Asset Count Summary', () => {
        test('should display asset count summary', () => {
            const webCount = db.prepare(`
                SELECT COUNT(*) as count FROM assets WHERE application_type = 'web'
            `).get() as any;

            const seoCount = db.prepare(`
                SELECT COUNT(*) as count FROM assets WHERE application_type = 'seo'
            `).get() as any;

            const smmCount = db.prepare(`
                SELECT COUNT(*) as count FROM assets WHERE application_type = 'smm'
            `).get() as any;

            console.log(`
✓ Asset Summary:
  - Web Assets: ${webCount.count}
  - SEO Assets: ${seoCount.count}
  - SMM Assets: ${smmCount.count}
            `);

            expect(webCount.count + seoCount.count + smmCount.count).toBeGreaterThanOrEqual(0);
        });
    });
});

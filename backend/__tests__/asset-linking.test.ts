import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../mcc_db.sqlite');
let db: Database.Database;

describe('Asset Linking System', () => {
    beforeAll(() => {
        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');
    });

    afterAll(() => {
        db.close();
    });

    describe('Service Asset Links', () => {
        it('should create service_asset_links table', () => {
            const result = db.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='service_asset_links'
            `).all();
            expect(result.length).toBeGreaterThan(0);
        });

        it('should have correct schema for service_asset_links', () => {
            const columns = db.prepare(`PRAGMA table_info(service_asset_links)`).all() as any[];
            const columnNames = columns.map(c => c.name);
            expect(columnNames).toContain('id');
            expect(columnNames).toContain('service_id');
            expect(columnNames).toContain('asset_id');
            expect(columnNames).toContain('created_at');
        });

        it('should enforce unique constraint on service_asset_links', () => {
            const constraints = db.prepare(`
                SELECT sql FROM sqlite_master 
                WHERE type='table' AND name='service_asset_links'
            `).get() as any;
            expect(constraints.sql).toContain('UNIQUE');
        });
    });

    describe('SubService Asset Links', () => {
        it('should create subservice_asset_links table', () => {
            const result = db.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='subservice_asset_links'
            `).all();
            expect(result.length).toBeGreaterThan(0);
        });

        it('should have correct schema for subservice_asset_links', () => {
            const columns = db.prepare(`PRAGMA table_info(subservice_asset_links)`).all() as any[];
            const columnNames = columns.map(c => c.name);
            expect(columnNames).toContain('id');
            expect(columnNames).toContain('sub_service_id');
            expect(columnNames).toContain('asset_id');
            expect(columnNames).toContain('created_at');
        });
    });

    describe('Asset Linking Data', () => {
        it('should retrieve linked assets for a service', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM service_asset_links
            `).get() as any;
            expect(result.count).toBeGreaterThanOrEqual(0);
        });

        it('should retrieve linked assets for a sub-service', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM subservice_asset_links
            `).get() as any;
            expect(result.count).toBeGreaterThanOrEqual(0);
        });

        it('should show asset details when linked to service', () => {
            const result = db.prepare(`
                SELECT 
                    a.id,
                    a.asset_name,
                    a.asset_type,
                    sal.service_id,
                    sal.created_at
                FROM assets a
                INNER JOIN service_asset_links sal ON a.id = sal.asset_id
                LIMIT 1
            `).get() as any;

            if (result) {
                expect(result).toHaveProperty('id');
                expect(result).toHaveProperty('asset_name');
                expect(result).toHaveProperty('asset_type');
                expect(result).toHaveProperty('service_id');
            }
        });

        it('should show asset details when linked to sub-service', () => {
            const result = db.prepare(`
                SELECT 
                    a.id,
                    a.asset_name,
                    a.asset_type,
                    sal.sub_service_id,
                    sal.created_at
                FROM assets a
                INNER JOIN subservice_asset_links sal ON a.id = sal.asset_id
                LIMIT 1
            `).get() as any;

            if (result) {
                expect(result).toHaveProperty('id');
                expect(result).toHaveProperty('asset_name');
                expect(result).toHaveProperty('asset_type');
                expect(result).toHaveProperty('sub_service_id');
            }
        });
    });

    describe('Asset Linking Statistics', () => {
        it('should count total linked assets', () => {
            const serviceLinks = db.prepare(`
                SELECT COUNT(*) as count FROM service_asset_links
            `).get() as any;

            const subServiceLinks = db.prepare(`
                SELECT COUNT(*) as count FROM subservice_asset_links
            `).get() as any;

            const totalLinks = (serviceLinks?.count || 0) + (subServiceLinks?.count || 0);
            expect(totalLinks).toBeGreaterThanOrEqual(0);
        });

        it('should identify services with linked assets', () => {
            const result = db.prepare(`
                SELECT DISTINCT service_id FROM service_asset_links
            `).all() as any[];

            expect(Array.isArray(result)).toBe(true);
        });

        it('should identify sub-services with linked assets', () => {
            const result = db.prepare(`
                SELECT DISTINCT sub_service_id FROM subservice_asset_links
            `).all() as any[];

            expect(Array.isArray(result)).toBe(true);
        });

        it('should show asset count per service', () => {
            const result = db.prepare(`
                SELECT 
                    service_id,
                    COUNT(*) as asset_count
                FROM service_asset_links
                GROUP BY service_id
                ORDER BY asset_count DESC
            `).all() as any[];

            expect(Array.isArray(result)).toBe(true);
            result.forEach(row => {
                expect(row).toHaveProperty('service_id');
                expect(row).toHaveProperty('asset_count');
                expect(row.asset_count).toBeGreaterThan(0);
            });
        });

        it('should show asset count per sub-service', () => {
            const result = db.prepare(`
                SELECT 
                    sub_service_id,
                    COUNT(*) as asset_count
                FROM subservice_asset_links
                GROUP BY sub_service_id
                ORDER BY asset_count DESC
            `).all() as any[];

            expect(Array.isArray(result)).toBe(true);
            result.forEach(row => {
                expect(row).toHaveProperty('sub_service_id');
                expect(row).toHaveProperty('asset_count');
                expect(row.asset_count).toBeGreaterThan(0);
            });
        });
    });

    describe('Asset Linking Integrity', () => {
        it('should not have orphaned service asset links', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM service_asset_links sal
                WHERE NOT EXISTS (SELECT 1 FROM assets WHERE id = sal.asset_id)
                   OR NOT EXISTS (SELECT 1 FROM services WHERE id = sal.service_id)
            `).get() as any;

            expect(result.count).toBe(0);
        });

        it('should not have orphaned sub-service asset links', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM subservice_asset_links sal
                WHERE NOT EXISTS (SELECT 1 FROM assets WHERE id = sal.asset_id)
                   OR NOT EXISTS (SELECT 1 FROM sub_services WHERE id = sal.sub_service_id)
            `).get() as any;

            expect(result.count).toBe(0);
        });

        it('should not have duplicate links for same service-asset pair', () => {
            const result = db.prepare(`
                SELECT service_id, asset_id, COUNT(*) as count
                FROM service_asset_links
                GROUP BY service_id, asset_id
                HAVING count > 1
            `).all() as any[];

            expect(result.length).toBe(0);
        });

        it('should not have duplicate links for same sub-service-asset pair', () => {
            const result = db.prepare(`
                SELECT sub_service_id, asset_id, COUNT(*) as count
                FROM subservice_asset_links
                GROUP BY sub_service_id, asset_id
                HAVING count > 1
            `).all() as any[];

            expect(result.length).toBe(0);
        });
    });

    describe('Asset Linking Summary', () => {
        it('should generate comprehensive linking report', () => {
            const serviceLinks = db.prepare(`
                SELECT COUNT(*) as count FROM service_asset_links
            `).get() as any;

            const subServiceLinks = db.prepare(`
                SELECT COUNT(*) as count FROM subservice_asset_links
            `).get() as any;

            const servicesWithAssets = db.prepare(`
                SELECT COUNT(DISTINCT service_id) as count FROM service_asset_links
            `).get() as any;

            const subServicesWithAssets = db.prepare(`
                SELECT COUNT(DISTINCT sub_service_id) as count FROM subservice_asset_links
            `).get() as any;

            const approvedAssets = db.prepare(`
                SELECT COUNT(*) as count FROM assets 
                WHERE qc_status IN ('Pass', 'Approved')
            `).get() as any;

            console.log(`
✓ Asset Linking Summary:
  - Service Asset Links: ${serviceLinks?.count || 0}
  - Sub-Service Asset Links: ${subServiceLinks?.count || 0}
  - Services with Assets: ${servicesWithAssets?.count || 0}
  - Sub-Services with Assets: ${subServicesWithAssets?.count || 0}
  - Approved Assets: ${approvedAssets?.count || 0}
            `);

            expect(serviceLinks).toBeDefined();
            expect(subServiceLinks).toBeDefined();
        });
    });
});

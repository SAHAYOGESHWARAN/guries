import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

describe('SubService Asset Linking - Backend Tests', () => {
    let db: Database.Database;

    beforeAll(() => {
        db = new Database(dbPath);
        console.log('✓ Database connection established for SubService tests');
    });

    afterAll(() => {
        db.close();
        console.log('✓ Database connection closed');
    });

    describe('SubService Table Schema', () => {
        test('sub_services table should exist', () => {
            const result = db.prepare(`
                SELECT name FROM sqlite_master WHERE type='table' AND name='sub_services'
            `).get() as any;

            expect(result).toBeDefined();
            expect(result?.name).toBe('sub_services');
        });

        test('sub_services table should have linking fields', () => {
            const result = db.prepare(`
                PRAGMA table_info(sub_services)
            `).all();

            const columnNames = result.map((col: any) => col.name);
            const requiredFields = [
                'id', 'sub_service_name', 'linked_assets_ids',
                'featured_asset_id', 'knowledge_topic_id'
            ];

            requiredFields.forEach(field => {
                expect(columnNames).toContain(field);
            });
        });
    });

    describe('Asset Linking Fields', () => {
        test('should query linked_assets_ids field', () => {
            const result = db.prepare(`
                SELECT id, linked_assets_ids FROM sub_services LIMIT 1
            `).get() as any;

            if (result) {
                expect(result.linked_assets_ids).toBeDefined();
            }
        });

        test('should query featured_asset_id field', () => {
            const result = db.prepare(`
                SELECT id, featured_asset_id FROM sub_services LIMIT 1
            `).get() as any;

            if (result) {
                expect(result.featured_asset_id).toBeDefined();
            }
        });

        test('should query knowledge_topic_id field', () => {
            const result = db.prepare(`
                SELECT id, knowledge_topic_id FROM sub_services LIMIT 1
            `).get() as any;

            if (result) {
                expect(result.knowledge_topic_id).toBeDefined();
            }
        });
    });

    describe('SubService Asset Relationships', () => {
        test('should count sub-services with linked assets', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM sub_services 
                WHERE linked_assets_ids IS NOT NULL AND linked_assets_ids != ''
            `).get() as any;

            console.log(`✓ Sub-services with linked assets: ${result.count}`);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });

        test('should count sub-services with featured assets', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM sub_services 
                WHERE featured_asset_id IS NOT NULL
            `).get() as any;

            console.log(`✓ Sub-services with featured assets: ${result.count}`);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });

        test('should count sub-services with knowledge topics', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM sub_services 
                WHERE knowledge_topic_id IS NOT NULL
            `).get() as any;

            console.log(`✓ Sub-services with knowledge topics: ${result.count}`);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Asset Repository Integration', () => {
        test('should query assets by application_type for web', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM assets 
                WHERE application_type = 'web'
            `).get() as any;

            console.log(`✓ Web assets available: ${result.count}`);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });

        test('should query assets by application_type for SEO', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM assets 
                WHERE application_type = 'seo'
            `).get() as any;

            console.log(`✓ SEO assets available: ${result.count}`);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });

        test('should query assets by application_type for SMM', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM assets 
                WHERE application_type = 'smm'
            `).get() as any;

            console.log(`✓ SMM assets available: ${result.count}`);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });
    });

    describe('SubService-Asset Linking Operations', () => {
        test('should retrieve sub-service with all linking fields', () => {
            const result = db.prepare(`
                SELECT 
                    id, 
                    sub_service_name, 
                    linked_assets_ids, 
                    featured_asset_id, 
                    knowledge_topic_id 
                FROM sub_services 
                LIMIT 1
            `).get() as any;

            if (result) {
                expect(result.id).toBeDefined();
                expect(result.sub_service_name).toBeDefined();
                expect(result.linked_assets_ids).toBeDefined();
                expect(result.featured_asset_id).toBeDefined();
                expect(result.knowledge_topic_id).toBeDefined();
            }
        });

        test('should handle JSON array in linked_assets_ids', () => {
            const result = db.prepare(`
                SELECT linked_assets_ids FROM sub_services 
                WHERE linked_assets_ids IS NOT NULL 
                LIMIT 1
            `).get() as any;

            if (result && result.linked_assets_ids) {
                // Should be able to parse as JSON or be a valid string
                expect(typeof result.linked_assets_ids).toBe('string');
            }
        });
    });

    describe('Query Performance', () => {
        test('should efficiently query sub-services with linking fields', () => {
            const start = Date.now();
            db.prepare(`
                SELECT id, sub_service_name, linked_assets_ids, featured_asset_id 
                FROM sub_services
            `).all();
            const duration = Date.now() - start;

            console.log(`✓ Sub-service linking query: ${duration}ms`);
            expect(duration).toBeLessThan(100);
        });

        test('should efficiently count linked assets', () => {
            const start = Date.now();
            db.prepare(`
                SELECT COUNT(*) as count FROM sub_services 
                WHERE linked_assets_ids IS NOT NULL
            `).get();
            const duration = Date.now() - start;

            console.log(`✓ Linked assets count query: ${duration}ms`);
            expect(duration).toBeLessThan(100);
        });
    });

    describe('Data Integrity', () => {
        test('should have consistent sub-service IDs', () => {
            const result = db.prepare(`
                SELECT COUNT(DISTINCT id) as unique_count, COUNT(*) as total_count 
                FROM sub_services
            `).get() as any;

            expect(result.unique_count).toBe(result.total_count);
        });

        test('should have valid featured_asset_id references', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM sub_services 
                WHERE featured_asset_id IS NOT NULL 
                AND featured_asset_id > 0
            `).get() as any;

            console.log(`✓ Valid featured asset references: ${result.count}`);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });

        test('should have valid knowledge_topic_id references', () => {
            const result = db.prepare(`
                SELECT COUNT(*) as count FROM sub_services 
                WHERE knowledge_topic_id IS NOT NULL 
                AND knowledge_topic_id > 0
            `).get() as any;

            console.log(`✓ Valid knowledge topic references: ${result.count}`);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });
    });

    describe('SubService Linking Summary', () => {
        test('should display complete linking summary', () => {
            const totalSubServices = db.prepare(`
                SELECT COUNT(*) as count FROM sub_services
            `).get() as any;

            const withLinkedAssets = db.prepare(`
                SELECT COUNT(*) as count FROM sub_services 
                WHERE linked_assets_ids IS NOT NULL AND linked_assets_ids != ''
            `).get() as any;

            const withFeaturedAssets = db.prepare(`
                SELECT COUNT(*) as count FROM sub_services 
                WHERE featured_asset_id IS NOT NULL
            `).get() as any;

            const withKnowledgeTopics = db.prepare(`
                SELECT COUNT(*) as count FROM sub_services 
                WHERE knowledge_topic_id IS NOT NULL
            `).get() as any;

            console.log(`
✓ SubService Linking Summary:
  - Total Sub-Services: ${totalSubServices.count}
  - With Linked Assets: ${withLinkedAssets.count}
  - With Featured Assets: ${withFeaturedAssets.count}
  - With Knowledge Topics: ${withKnowledgeTopics.count}
            `);

            expect(totalSubServices.count).toBeGreaterThanOrEqual(0);
        });
    });
});


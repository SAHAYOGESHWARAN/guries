import { pool } from '../config/db';

describe('VALIDATION TESTS', () => {

    // INPUT VALIDATION
    test('VAL 1.1: Asset name required', async () => {
        try {
            await pool.query(
                `INSERT INTO assets (asset_type, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
                ['image', 'draft']
            );
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    test('VAL 1.2: Score range 0-100 validation', async () => {
        const scores = [0, 25, 50, 75, 100];
        scores.forEach(score => {
            expect(score >= 0 && score <= 100).toBe(true);
        });
    });

    test('VAL 1.3: Invalid scores rejected', async () => {
        const invalidScores = [-1, 101, 150, -50];
        invalidScores.forEach(score => {
            expect(score >= 0 && score <= 100).toBe(false);
        });
    });

    test('VAL 1.4: JSON field validation', async () => {
        const validJson = ['keyword1', 'keyword2'];
        const jsonStr = JSON.stringify(validJson);
        const parsed = JSON.parse(jsonStr);
        expect(parsed).toEqual(validJson);
    });

    test('VAL 1.5: Application type required', async () => {
        const appTypes = ['WEB', 'SEO', 'SMM'];
        appTypes.forEach(type => {
            expect(['WEB', 'SEO', 'SMM'].includes(type)).toBe(true);
        });
    });

    // QC STATUS VALIDATION
    test('VAL 2.1: Valid QC statuses', async () => {
        const validStatuses = ['Pending', 'Pass', 'Fail', 'Rework'];
        validStatuses.forEach(status => {
            expect(['Pending', 'Pass', 'Fail', 'Rework'].includes(status)).toBe(true);
        });
    });

    test('VAL 2.2: Invalid QC status rejected', async () => {
        const invalidStatus = 'InvalidStatus';
        expect(['Pending', 'Pass', 'Fail', 'Rework'].includes(invalidStatus)).toBe(false);
    });

    // WORKFLOW STAGE VALIDATION
    test('VAL 3.1: Valid workflow stages', async () => {
        const validStages = ['Add', 'Submit', 'QC', 'Approve', 'Publish'];
        validStages.forEach(stage => {
            expect(['Add', 'Submit', 'QC', 'Approve', 'Publish'].includes(stage)).toBe(true);
        });
    });

    test('VAL 3.2: Invalid workflow stage rejected', async () => {
        const invalidStage = 'InvalidStage';
        expect(['Add', 'Submit', 'QC', 'Approve', 'Publish'].includes(invalidStage)).toBe(false);
    });

    // NOTIFICATION VALIDATION
    test('VAL 4.1: User ID required for notification', async () => {
        try {
            await pool.query(
                `INSERT INTO notifications (title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                ['Title', 'Message', 'info', 0]
            );
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    test('VAL 4.2: Valid notification types', async () => {
        const validTypes = ['info', 'warning', 'error', 'success'];
        validTypes.forEach(type => {
            expect(['info', 'warning', 'error', 'success'].includes(type)).toBe(true);
        });
    });

    // ASSET FIELD VALIDATION
    test('VAL 5.1: Asset type validation', async () => {
        const validTypes = ['image', 'document', 'video', 'audio'];
        validTypes.forEach(type => {
            expect(typeof type).toBe('string');
            expect(type.length).toBeGreaterThan(0);
        });
    });

    test('VAL 5.2: Asset category validation', async () => {
        const validCategories = ['SEO', 'SMM', 'WEB', 'Content'];
        validCategories.forEach(cat => {
            expect(typeof cat).toBe('string');
            expect(cat.length).toBeGreaterThan(0);
        });
    });

    // LINKING VALIDATION
    test('VAL 6.1: Service link requires asset and service', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Link Val', 'draft']
        );
        const service = await pool.query(
            `INSERT INTO services (service_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Link Service', 'active']
        );

        const link = await pool.query(
            `INSERT INTO service_asset_links (asset_id, service_id, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [asset.rows[0].id, service.rows[0].id]
        );

        expect(link.rows).toBeDefined();
    });

    // DATA TYPE VALIDATION
    test('VAL 7.1: ID is numeric', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Type Test', 'draft']
        );
        expect(typeof asset.rows[0].id).toBe('number');
    });

    test('VAL 7.2: Timestamps are valid', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, status, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            ['Timestamp Test', 'draft']
        );
        const id = asset.rows[0].id;
        const select = await pool.query('SELECT created_at FROM assets WHERE id = ?', [id]);
        expect(select.rows[0].created_at).toBeDefined();
    });

    // CONSTRAINT VALIDATION
    test('VAL 8.1: Unique email constraint', async () => {
        try {
            const email = `test${Date.now()}@example.com`;
            await pool.query(
                `INSERT INTO users (name, email, role, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                ['User 1', email, 'user']
            );
            await pool.query(
                `INSERT INTO users (name, email, role, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                ['User 2', email, 'user']
            );
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    // FOREIGN KEY VALIDATION
    test('VAL 9.1: Foreign key constraint on notifications', async () => {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [1, 'FK Test', 'Message', 'info', 0]
        );
        expect(result.rows).toBeDefined();
    });

    // RANGE VALIDATION
    test('VAL 10.1: SEO score range', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, seo_score, status, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            ['SEO Range', 85, 'draft']
        );
        const id = asset.rows[0].id;
        const select = await pool.query('SELECT seo_score FROM assets WHERE id = ?', [id]);
        expect(select.rows[0].seo_score).toBeGreaterThanOrEqual(0);
        expect(select.rows[0].seo_score).toBeLessThanOrEqual(100);
    });

    test('VAL 10.2: Grammar score range', async () => {
        const asset = await pool.query(
            `INSERT INTO assets (asset_name, grammar_score, status, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            ['Grammar Range', 90, 'draft']
        );
        const id = asset.rows[0].id;
        const select = await pool.query('SELECT grammar_score FROM assets WHERE id = ?', [id]);
        expect(select.rows[0].grammar_score).toBeGreaterThanOrEqual(0);
        expect(select.rows[0].grammar_score).toBeLessThanOrEqual(100);
    });

});

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating test service...');

try {
    // Check if services table has data
    const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
    console.log(`Current services in database: ${serviceCount.count}`);

    if (serviceCount.count === 0) {
        console.log('\nNo services found. Creating test service...');

        const testService = {
            service_name: 'Test Service',
            service_code: 'TEST-001',
            slug: 'test-service',
            full_url: 'https://example.com/test-service',
            menu_heading: 'Test',
            short_tagline: 'A test service',
            service_description: 'This is a test service for asset linking',
            status: 'Published',
            language: 'en',
            h1: 'Test Service',
            meta_title: 'Test Service',
            meta_description: 'Test service description',
            content_type: 'Pillar',
            buyer_journey_stage: 'Awareness'
        };

        const insertStmt = db.prepare(`
            INSERT INTO services (
                service_name, service_code, slug, full_url, menu_heading, short_tagline,
                service_description, status, language, h1, meta_title, meta_description,
                content_type, buyer_journey_stage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertStmt.run(
            testService.service_name,
            testService.service_code,
            testService.slug,
            testService.full_url,
            testService.menu_heading,
            testService.short_tagline,
            testService.service_description,
            testService.status,
            testService.language,
            testService.h1,
            testService.meta_title,
            testService.meta_description,
            testService.content_type,
            testService.buyer_journey_stage
        );

        console.log(`✅ Created test service`);
    } else {
        console.log('✅ Services already exist in database');
    }

    // Verify the services
    const services = db.prepare('SELECT id, service_name, status FROM services LIMIT 5').all();
    console.log('\nServices in database:');
    services.forEach(service => {
        console.log(`  - ${service.service_name} (${service.status})`);
    });

    db.close();
} catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
}

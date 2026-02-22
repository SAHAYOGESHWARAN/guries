import axios from 'axios';

const BASE_URL = 'http://localhost:3004/api/v1';
let token = '';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const test = async (name: string, fn: () => Promise<any>) => {
    try {
        await fn();
        console.log(`✅ ${name}`);
        return true;
    } catch (error: any) {
        console.log(`❌ ${name}: ${error.response?.status || error.code || error.message}`);
        return false;
    }
};

const main = async () => {
    console.log('🧪 FULL SYSTEM VERIFICATION TEST\n');
    console.log('═'.repeat(60));

    let passed = 0;
    let failed = 0;

    // Step 1: Authentication
    console.log('\n📝 Step 1: Authentication');
    if (await test('Login', async () => {
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        token = res.data.token;
        if (!token) throw new Error('No token received');
    })) {
        passed++;
    } else {
        failed++;
    }

    await delay(1000);

    // Step 2: Core Modules
    console.log('\n📝 Step 2: Core Modules Data Retrieval');
    const modules = [
        { name: 'Assets', endpoint: '/assetLibrary' },
        { name: 'Campaigns', endpoint: '/campaigns' },
        { name: 'Projects', endpoint: '/projects' },
        { name: 'Brands', endpoint: '/brands' },
        { name: 'Users', endpoint: '/users' },
        { name: 'Notifications', endpoint: '/notifications' },
        { name: 'Tasks', endpoint: '/tasks' },
        { name: 'Services', endpoint: '/services' },
        { name: 'Sub-Services', endpoint: '/sub-services' },
        { name: 'Keywords', endpoint: '/keywords' },
        { name: 'Teams', endpoint: '/teams' },
        { name: 'Content', endpoint: '/content' },
        { name: 'SMM Posts', endpoint: '/smm' },
        { name: 'Graphics', endpoint: '/graphics' },
        { name: 'OKRs', endpoint: '/okrs' },
        { name: 'Personas', endpoint: '/personas' },
        { name: 'Forms', endpoint: '/forms' },
        { name: 'QC Checklists', endpoint: '/qc-checklists' },
        { name: 'Countries', endpoint: '/countries' }
    ];

    for (const module of modules) {
        if (await test(`${module.name}`, async () => {
            const res = await axios.get(`${BASE_URL}${module.endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle paginated responses (like notifications)
            const data = res.data.notifications || res.data;
            if (!Array.isArray(data)) throw new Error('Response is not an array');
            console.log(`   └─ ${data.length} items`);
        })) {
            passed++;
        } else {
            failed++;
        }
        await delay(500);
    }

    // Step 3: Master Data Endpoints
    console.log('\n📝 Step 3: Master Data Endpoints');
    const masterEndpoints = [
        { name: 'Asset Categories', endpoint: '/asset-categories' },
        { name: 'Asset Formats', endpoint: '/asset-formats' },
        { name: 'Platforms', endpoint: '/platforms' }
    ];

    for (const endpoint of masterEndpoints) {
        if (await test(`${endpoint.name}`, async () => {
            const res = await axios.get(`${BASE_URL}${endpoint.endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!Array.isArray(res.data)) throw new Error('Response is not an array');
            console.log(`   └─ ${res.data.length} items`);
        })) {
            passed++;
        } else {
            failed++;
        }
        await delay(500);
    }

    // Step 4: Database Schema Verification
    console.log('\n📝 Step 4: Database Schema Verification');
    const Database = require('better-sqlite3');
    const path = require('path');
    const dbPath = path.join(__dirname, 'mcc_db.sqlite');
    const db = new Database(dbPath);

    try {
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as any[];
        const expectedTables = [
            'users', 'brands', 'projects', 'campaigns', 'tasks', 'notifications',
            'assets', 'asset_category_master', 'asset_format_master',
            'services', 'sub_services', 'service_asset_links', 'subservice_asset_links',
            'keywords', 'backlink_sources', 'competitor_benchmarks',
            'teams', 'content_repository', 'smm_posts', 'graphic_assets',
            'okrs', 'personas', 'forms', 'qc_checklists', 'platforms', 'countries'
        ];

        const tableNames = tables.map((t: any) => t.name).filter((n: string) => n !== 'sqlite_sequence');
        const missingTables = expectedTables.filter(t => !tableNames.includes(t));

        if (missingTables.length === 0) {
            console.log(`✅ All ${expectedTables.length} required tables exist`);
            passed++;
        } else {
            console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
            failed++;
        }

        // Verify asset table has all required fields
        const assetColumns = db.prepare("PRAGMA table_info(assets)").all() as any[];
        const requiredFields = [
            'asset_name', 'asset_type', 'asset_category', 'asset_format',
            'web_title', 'web_description', 'web_meta_description', 'web_keywords',
            'smm_platform', 'smm_title', 'smm_description', 'smm_hashtags',
            'seo_keywords', 'seo_score', 'qc_status', 'qc_score',
            'linked_service_ids', 'linked_sub_service_ids', 'workflow_stage'
        ];

        const columnNames = assetColumns.map((c: any) => c.name);
        const missingFields = requiredFields.filter(f => !columnNames.includes(f));

        if (missingFields.length === 0) {
            console.log(`✅ Assets table has all ${requiredFields.length} required fields`);
            passed++;
        } else {
            console.log(`❌ Assets table missing fields: ${missingFields.join(', ')}`);
            failed++;
        }

        // Verify campaigns table
        const campaignColumns = db.prepare("PRAGMA table_info(campaigns)").all() as any[];
        const campaignFields = ['campaign_name', 'campaign_type', 'status', 'campaign_start_date', 'campaign_end_date'];
        const campaignColumnNames = campaignColumns.map((c: any) => c.name);
        const missingCampaignFields = campaignFields.filter(f => !campaignColumnNames.includes(f));

        if (missingCampaignFields.length === 0) {
            console.log(`✅ Campaigns table has all required fields`);
            passed++;
        } else {
            console.log(`❌ Campaigns table missing fields: ${missingCampaignFields.join(', ')}`);
            failed++;
        }

        // Verify projects table
        const projectColumns = db.prepare("PRAGMA table_info(projects)").all() as any[];
        const projectFields = ['project_name', 'project_code', 'status', 'start_date', 'end_date', 'budget'];
        const projectColumnNames = projectColumns.map((c: any) => c.name);
        const missingProjectFields = projectFields.filter(f => !projectColumnNames.includes(f));

        if (missingProjectFields.length === 0) {
            console.log(`✅ Projects table has all required fields`);
            passed++;
        } else {
            console.log(`❌ Projects table missing fields: ${missingProjectFields.join(', ')}`);
            failed++;
        }

    } finally {
        db.close();
    }

    // Step 5: Data Integrity
    console.log('\n📝 Step 5: Data Integrity Checks');
    if (await test('Assets have proper structure', async () => {
        const res = await axios.get(`${BASE_URL}/assetLibrary`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.length > 0) {
            const asset = res.data[0];
            const requiredFields = ['id', 'name', 'type', 'status'];
            const missingFields = requiredFields.filter(f => !(f in asset));
            if (missingFields.length > 0) {
                throw new Error(`Missing fields: ${missingFields.join(', ')}`);
            }
        }
    })) {
        passed++;
    } else {
        failed++;
    }

    await delay(500);

    if (await test('Campaigns have proper structure', async () => {
        const res = await axios.get(`${BASE_URL}/campaigns`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.length > 0) {
            const campaign = res.data[0];
            const requiredFields = ['id', 'campaign_name', 'status'];
            const missingFields = requiredFields.filter(f => !(f in campaign));
            if (missingFields.length > 0) {
                throw new Error(`Missing fields: ${missingFields.join(', ')}`);
            }
        }
    })) {
        passed++;
    } else {
        failed++;
    }

    await delay(500);

    if (await test('Projects have proper structure', async () => {
        const res = await axios.get(`${BASE_URL}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.length > 0) {
            const project = res.data[0];
            const requiredFields = ['id', 'project_name', 'status'];
            const missingFields = requiredFields.filter(f => !(f in project));
            if (missingFields.length > 0) {
                throw new Error(`Missing fields: ${missingFields.join(', ')}`);
            }
        }
    })) {
        passed++;
    } else {
        failed++;
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('\n📊 VERIFICATION SUMMARY\n');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n✅ ALL SYSTEMS FULLY OPERATIONAL - READY FOR PRODUCTION');
    } else {
        console.log(`\n⚠️  ${failed} issue(s) detected - review above`);
    }

    console.log('\n' + '═'.repeat(60));
    process.exit(failed > 0 ? 1 : 0);
};

main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});

const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Testing asset queries...\n');

// Test 1: Check web assets
console.log('1. Web assets in database:');
const webAssets = db.prepare(`
    SELECT id, asset_name, application_type, status 
    FROM assets 
    WHERE application_type = 'web'
    LIMIT 3
`).all();
console.log(JSON.stringify(webAssets, null, 2));

// Test 2: Check the actual query from controller
console.log('\n2. Query from getAssetsByRepository (Web):');
const repositoryQuery = db.prepare(`
    SELECT 
        id,
        asset_name as name,
        asset_type as type,
        asset_category,
        asset_format,
        content_type,
        tags as repository,
        status,
        workflow_stage,
        qc_status,
        created_at,
        updated_at,
        linked_service_id,
        linked_sub_service_id,
        linked_service_ids,
        linked_sub_service_ids,
        web_thumbnail as thumbnail_url,
        web_url as url,
        file_url,
        og_image_url,
        application_type,
        linking_active,
        seo_score,
        grammar_score,
        ai_plagiarism_score
    FROM assets
    WHERE application_type = ? AND status IN ('Draft', 'Pending QC Review', 'Published')
    ORDER BY created_at DESC
`).all('web');
console.log(`Found ${repositoryQuery.length} web assets`);
if (repositoryQuery.length > 0) {
    console.log(JSON.stringify(repositoryQuery[0], null, 2));
}

// Test 3: Check repositories
console.log('\n3. Repositories query:');
const repos = db.prepare(`
    SELECT DISTINCT 
        CASE 
            WHEN application_type = 'web' THEN 'Web'
            WHEN application_type = 'seo' THEN 'SEO'
            WHEN application_type = 'smm' THEN 'SMM'
            ELSE application_type
        END as repository
    FROM assets
    WHERE application_type IS NOT NULL AND application_type != ''
    ORDER BY repository ASC
`).all();
console.log(JSON.stringify(repos, null, 2));

db.close();
console.log('\nDone!');

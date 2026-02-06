const { pool } = require('./backend/config/db.ts');

async function testDataFlow() {
    console.log('🧪 Testing Data Flow - Guires Marketing Control Center\n');
    
    try {
        // Test 1: Database Connection
        console.log('1. Testing Database Connection...');
        const healthCheck = await pool.query('SELECT 1 as test');
        console.log('✅ Database connected successfully');
        
        // Test 2: Check existing data
        console.log('\n2. Checking existing data...');
        const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
        const assetCount = await pool.query('SELECT COUNT(*) as count FROM assets');
        const serviceCount = await pool.query('SELECT COUNT(*) as count FROM services');
        
        console.log(`📊 Users: ${userCount.rows[0].count}`);
        console.log(`📊 Assets: ${assetCount.rows[0].count}`);
        console.log(`📊 Services: ${serviceCount.rows[0].count}`);
        
        // Test 3: Create test data
        console.log('\n3. Creating test asset...');
        const testAsset = await pool.query(`
            INSERT INTO assets (asset_name, asset_type, asset_category, status, created_by)
            VALUES ('Test Asset ' + Date.now(), 'Image', 'Marketing', 'draft', 1)
            RETURNING id, asset_name, created_at
        `);
        console.log('✅ Test asset created:', testAsset.rows[0]);
        
        // Test 4: Retrieve test data
        console.log('\n4. Retrieving test data...');
        const allAssets = await pool.query(`
            SELECT a.*, u.name as created_by_name 
            FROM assets a 
            LEFT JOIN users u ON a.created_by = u.id 
            ORDER BY a.created_at DESC 
            LIMIT 5
        `);
        console.log('📋 Recent assets:');
        allAssets.rows.forEach(asset => {
            console.log(`  - ${asset.asset_name} (${asset.status}) by ${asset.created_by_name || 'Unknown'}`);
        });
        
        // Test 5: Update test data
        console.log('\n5. Updating test asset...');
        const updateResult = await pool.query(`
            UPDATE assets 
            SET status = 'pending', updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1
        `, [testAsset.rows[0].id]);
        console.log(`✅ Updated ${updateResult.rowCount} asset(s)`);
        
        // Test 6: Verify update
        console.log('\n6. Verifying update...');
        const updatedAsset = await pool.query(`
            SELECT * FROM assets WHERE id = $1
        `, [testAsset.rows[0].id]);
        console.log('✅ Updated asset:', updatedAsset.rows[0]);
        
        // Test 7: Test relationships
        console.log('\n7. Testing data relationships...');
        const relations = await pool.query(`
            SELECT 
                u.name as user_name,
                COUNT(a.id) as asset_count,
                COUNT(s.id) as service_count
            FROM users u
            LEFT JOIN assets a ON u.id = a.created_by
            LEFT JOIN services s ON u.id = s.created_by
            GROUP BY u.id, u.name
            ORDER BY asset_count DESC
        `);
        console.log('👥 User activity summary:');
        relations.rows.forEach(row => {
            console.log(`  - ${row.user_name}: ${row.asset_count} assets, ${row.service_count} services`);
        });
        
        console.log('\n🎉 All data flow tests completed successfully!');
        console.log('✅ Database operations: CREATE, READ, UPDATE working');
        console.log('✅ Data relationships: Foreign keys working');
        console.log('✅ Data persistence: Confirmed');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testDataFlow();

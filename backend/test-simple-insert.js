const { pool } = require('./dist/config/db-sqlite');

async function testSimpleInsert() {
    try {
        console.log('Testing simple asset insert...');

        const result = await pool.query(
            `INSERT INTO assets (asset_name, asset_type, tags, status, created_at) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, asset_name, asset_type`,
            ['Test Asset', 'article', 'Content Repository', 'Draft', new Date().toISOString()]
        );

        console.log('Insert result:', result);
        console.log('Rows:', result.rows);

        if (result.rows && result.rows.length > 0) {
            console.log('✅ Simple insert works!');
            console.log('Created asset:', result.rows[0]);
        } else {
            console.log('❌ No rows returned');
        }

    } catch (error) {
        console.error('❌ Insert failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testSimpleInsert();
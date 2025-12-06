import { pool } from '../config/db';

export async function addAssetLinking() {
    const client = await pool.connect();

    try {
        console.log('🔄 Starting asset linking migration...');

        // Add linked_service_ids column
        await client.query(`
            ALTER TABLE assets 
            ADD COLUMN IF NOT EXISTS linked_service_ids TEXT DEFAULT '[]'
        `);
        console.log('✓ Added linked_service_ids column');

        // Add linked_sub_service_ids column
        await client.query(`
            ALTER TABLE assets 
            ADD COLUMN IF NOT EXISTS linked_sub_service_ids TEXT DEFAULT '[]'
        `);
        console.log('✓ Added linked_sub_service_ids column');

        // Create index for linked_service_ids
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_assets_linked_services 
            ON assets USING gin ((linked_service_ids::jsonb))
        `);
        console.log('✓ Created index idx_assets_linked_services');

        // Create index for linked_sub_service_ids
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_assets_linked_sub_services 
            ON assets USING gin ((linked_sub_service_ids::jsonb))
        `);
        console.log('✓ Created index idx_assets_linked_sub_services');

        // Update existing rows
        await client.query(`
            UPDATE assets 
            SET linked_service_ids = '[]' 
            WHERE linked_service_ids IS NULL
        `);

        await client.query(`
            UPDATE assets 
            SET linked_sub_service_ids = '[]' 
            WHERE linked_sub_service_ids IS NULL
        `);
        console.log('✓ Updated existing rows with empty arrays');

        console.log('✅ Asset linking migration completed successfully!');

        return { success: true };
    } catch (error: any) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

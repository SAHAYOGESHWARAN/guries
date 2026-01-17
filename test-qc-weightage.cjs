const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 QC Weightage Configuration Testing\n');

// Test 1: Verify database tables
console.log('1️⃣  Verifying database tables...');
try {
    const configsInfo = db.prepare(`PRAGMA table_info(qc_weightage_configs)`).all();
    const itemsInfo = db.prepare(`PRAGMA table_info(qc_weightage_items)`).all();
    const versionsInfo = db.prepare(`PRAGMA table_info(qc_checklist_versions)`).all();
    const usageInfo = db.prepare(`PRAGMA table_info(qc_checklist_usage)`).all();

    if (configsInfo.length === 0 || itemsInfo.length === 0 || versionsInfo.length === 0 || usageInfo.length === 0) {
        console.log('❌ One or more tables not found');
        process.exit(1);
    }

    console.log('✅ QC Weightage Configs table columns:');
    configsInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ QC Weightage Items table columns:');
    itemsInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ QC Checklist Versions table columns:');
    versionsInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ QC Checklist Usage table columns:');
    usageInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 2: Get available checklists
console.log('\n2️⃣  Getting available checklists...');
try {
    const checklists = db.prepare(`
    SELECT id, checklist_name, checklist_type FROM audit_checklists WHERE status = 'active' LIMIT 3
  `).all();

    if (checklists.length === 0) {
        console.log('⚠️  No active checklists found. Creating test checklists...');

        // Create test checklists
        const insertChecklist = db.prepare(`
      INSERT INTO audit_checklists (
        checklist_name, checklist_type, checklist_category, status
      )
      VALUES (?, ?, ?, 'active')
    `);

        insertChecklist.run('Editorial Content QC', 'Content', 'Editorial');
        insertChecklist.run('SEO Page Audit', 'SEO', 'Technical SEO');
        insertChecklist.run('Web Developer QC', 'Web', 'Technical SEO');

        console.log('✅ Created 3 test checklists');
    } else {
        console.log(`✅ Found ${checklists.length} active checklists`);
        checklists.forEach(c => console.log(`   - ${c.checklist_name} (${c.checklist_type})`));
    }
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 3: Insert QC weightage configuration
console.log('\n3️⃣  Inserting QC weightage configuration...');
try {
    const checklists = db.prepare(`
    SELECT id, checklist_type FROM audit_checklists WHERE status = 'active' LIMIT 3
  `).all();

    if (checklists.length < 3) {
        console.log('❌ Not enough checklists for test');
        process.exit(1);
    }

    const result = db.prepare(`
    INSERT INTO qc_weightage_configs (config_name, description, total_weight, is_valid, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(
        'Content QC Weightage',
        'Weightage configuration for content QC',
        100,
        1,
        'active'
    );

    const configId = result.lastInsertRowid;
    console.log(`✅ Inserted config with ID: ${configId}`);

    // Insert weightage items
    const items = [
        { weight: 30, stage: 'Draft' },
        { weight: 25, stage: 'Review' },
        { weight: 45, stage: 'Pre-Publish' }
    ];

    const insertItem = db.prepare(`
    INSERT INTO qc_weightage_items (
      config_id, checklist_id, checklist_type, weight_percentage, is_mandatory, applies_to_stage, item_order
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    items.forEach((item, index) => {
        const checklist = checklists[index];
        insertItem.run(
            configId,
            checklist.id,
            checklist.checklist_type,
            item.weight,
            1,
            item.stage,
            index + 1
        );
    });

    console.log(`✅ Inserted ${items.length} weightage items`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 4: Query configuration with items
console.log('\n4️⃣  Querying configuration with items...');
try {
    const configs = db.prepare(`
    SELECT 
      qwc.id,
      qwc.config_name,
      qwc.total_weight,
      qwc.is_valid,
      COUNT(DISTINCT qwi.id) as item_count
    FROM qc_weightage_configs qwc
    LEFT JOIN qc_weightage_items qwi ON qwc.id = qwi.config_id
    GROUP BY qwc.id
  `).all();

    console.log(`✅ Found ${configs.length} configuration(s):`);

    configs.forEach(config => {
        console.log(`\n   Config: ${config.config_name}`);
        console.log(`   Total Weight: ${config.total_weight}%`);
        console.log(`   Valid: ${config.is_valid ? 'Yes' : 'No'}`);
        console.log(`   Items: ${config.item_count}`);

        const items = db.prepare(`
      SELECT qwi.weight_percentage, qwi.applies_to_stage, ac.checklist_name
      FROM qc_weightage_items qwi
      LEFT JOIN audit_checklists ac ON qwi.checklist_id = ac.id
      WHERE qwi.config_id = ?
      ORDER BY qwi.item_order
    `).all(config.id);

        items.forEach(item => {
            console.log(`     - ${item.checklist_name}: ${item.weight_percentage}% (${item.applies_to_stage})`);
        });
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 5: Validate weightage
console.log('\n5️⃣  Validating weightage configuration...');
try {
    const config = db.prepare(`SELECT id FROM qc_weightage_configs LIMIT 1`).get();

    const items = db.prepare(`
    SELECT weight_percentage FROM qc_weightage_items WHERE config_id = ?
  `).all(config.id);

    const totalWeight = items.reduce((sum, item) => sum + item.weight_percentage, 0);
    const isValid = totalWeight === 100;

    console.log(`✅ Total weight: ${totalWeight}%`);
    console.log(`✅ Configuration is ${isValid ? 'VALID ✓' : 'INVALID ✗'}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 6: Update configuration
console.log('\n6️⃣  Updating configuration...');
try {
    const config = db.prepare(`SELECT id FROM qc_weightage_configs LIMIT 1`).get();

    const result = db.prepare(`
    UPDATE qc_weightage_configs
    SET description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run('Updated weightage configuration for content QC', config.id);

    console.log(`✅ Updated ${result.changes} configuration(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 7: Add checklist usage
console.log('\n7️⃣  Adding checklist usage...');
try {
    const checklist = db.prepare(`SELECT id FROM audit_checklists LIMIT 1`).get();

    const result = db.prepare(`
    INSERT INTO qc_checklist_usage (checklist_id, asset_type, usage_context, usage_count, last_used)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(checklist.id, 'Content', 'Editorial Review', 1);

    console.log(`✅ Added checklist usage with ID: ${result.lastInsertRowid}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 8: Query usage statistics
console.log('\n8️⃣  Querying usage statistics...');
try {
    const usage = db.prepare(`
    SELECT 
      qcu.asset_type,
      qcu.usage_context,
      qcu.usage_count,
      ac.checklist_name
    FROM qc_checklist_usage qcu
    LEFT JOIN audit_checklists ac ON qcu.checklist_id = ac.id
    ORDER BY qcu.usage_count DESC
  `).all();

    console.log(`✅ Found ${usage.length} usage record(s):`);
    usage.forEach(u => {
        console.log(`   - ${u.checklist_name}: ${u.asset_type} (${u.usage_context}) - Used ${u.usage_count} times`);
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 9: Delete configuration
console.log('\n9️⃣  Deleting configuration...');
try {
    const config = db.prepare(`SELECT id FROM qc_weightage_configs LIMIT 1`).get();

    // Delete items
    db.prepare(`DELETE FROM qc_weightage_items WHERE config_id = ?`).run(config.id);

    // Delete config
    const result = db.prepare(`DELETE FROM qc_weightage_configs WHERE id = ?`).run(config.id);

    console.log(`✅ Deleted ${result.changes} configuration(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 10: Verify deletion
console.log('\n🔟 Verifying deletion...');
try {
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM qc_weightage_configs`).get();
    console.log(`✅ Remaining configurations: ${count.cnt}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('\n✅ All database tests passed!');
db.close();

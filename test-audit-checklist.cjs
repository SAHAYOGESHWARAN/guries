const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 Audit Checklist Testing\n');

// Test 1: Verify database tables
console.log('1️⃣  Verifying database tables...');
try {
    const checklistsInfo = db.prepare(`PRAGMA table_info(audit_checklists)`).all();
    const itemsInfo = db.prepare(`PRAGMA table_info(audit_checklist_items)`).all();
    const modulesInfo = db.prepare(`PRAGMA table_info(audit_checklist_modules)`).all();
    const logsInfo = db.prepare(`PRAGMA table_info(audit_qc_score_logs)`).all();
    const campaignsInfo = db.prepare(`PRAGMA table_info(audit_linked_campaigns)`).all();

    if (checklistsInfo.length === 0 || itemsInfo.length === 0 || modulesInfo.length === 0 || logsInfo.length === 0 || campaignsInfo.length === 0) {
        console.log('❌ One or more tables not found');
        process.exit(1);
    }

    console.log('✅ Audit Checklists table columns:');
    checklistsInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ Audit Checklist Items table columns:');
    itemsInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ Audit Checklist Modules table columns:');
    modulesInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ Audit QC Score Logs table columns:');
    logsInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ Audit Linked Campaigns table columns:');
    campaignsInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 2: Insert checklist with items
console.log('\n2️⃣  Inserting checklist with items...');
try {
    const result = db.prepare(`
    INSERT INTO audit_checklists (
      checklist_name, checklist_type, checklist_category, description,
      scoring_mode, pass_threshold, rework_threshold,
      auto_fail_required, auto_fail_critical, qc_output_type, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        'Editorial Content QC',
        'Content',
        'Editorial',
        'QC checklist for editorial content',
        'weighted',
        85,
        70,
        1,
        1,
        'percentage',
        'active'
    );

    const checklistId = result.lastInsertRowid;
    console.log(`✅ Inserted checklist with ID: ${checklistId}`);

    // Insert items
    const items = [
        { name: 'Check grammar and spelling errors', severity: 'High', required: 1, score: 1 },
        { name: 'Verify all hyperlinks are working', severity: 'High', required: 1, score: 1 },
        { name: 'Confirm meta description is present', severity: 'Medium', required: 0, score: 1 },
        { name: 'Check image alt text optimization', severity: 'Medium', required: 0, score: 1 },
        { name: 'Validate heading hierarchy (H1-H6)', severity: 'Low', required: 0, score: 1 }
    ];

    const insertItem = db.prepare(`
    INSERT INTO audit_checklist_items (
      checklist_id, item_order, item_name, severity, is_required, default_score
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    items.forEach((item, index) => {
        insertItem.run(checklistId, index + 1, item.name, item.severity, item.required, item.score);
    });

    console.log(`✅ Inserted ${items.length} checklist items`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 3: Insert modules
console.log('\n3️⃣  Inserting modules...');
try {
    const modules = ['Content Campaign', 'SEO Campaign', 'Web Developer Campaign'];
    const insertModule = db.prepare(`
    INSERT INTO audit_checklist_modules (checklist_id, module_name)
    VALUES (?, ?)
  `);

    const checklistId = db.prepare(`SELECT id FROM audit_checklists LIMIT 1`).get().id;

    modules.forEach(module => {
        insertModule.run(checklistId, module);
    });

    console.log(`✅ Inserted ${modules.length} modules`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 4: Query checklist with all details
console.log('\n4️⃣  Querying checklist with all details...');
try {
    const checklists = db.prepare(`
    SELECT 
      ac.id,
      ac.checklist_name,
      ac.checklist_type,
      ac.checklist_category,
      ac.status,
      ac.scoring_mode,
      ac.pass_threshold,
      ac.rework_threshold,
      COUNT(DISTINCT aci.id) as item_count,
      COUNT(DISTINCT acm.id) as module_count
    FROM audit_checklists ac
    LEFT JOIN audit_checklist_items aci ON ac.id = aci.checklist_id
    LEFT JOIN audit_checklist_modules acm ON ac.id = acm.checklist_id
    GROUP BY ac.id
  `).all();

    console.log(`✅ Found ${checklists.length} checklist(s):`);

    checklists.forEach(checklist => {
        console.log(`\n   Checklist: ${checklist.checklist_name}`);
        console.log(`   Type: ${checklist.checklist_type}`);
        console.log(`   Category: ${checklist.checklist_category}`);
        console.log(`   Status: ${checklist.status}`);
        console.log(`   Scoring Mode: ${checklist.scoring_mode}`);
        console.log(`   Pass Threshold: ${checklist.pass_threshold}%`);
        console.log(`   Rework Threshold: ${checklist.rework_threshold}%`);
        console.log(`   Items: ${checklist.item_count}`);
        console.log(`   Modules: ${checklist.module_count}`);

        const items = db.prepare(`
      SELECT item_order, item_name, severity, is_required
      FROM audit_checklist_items
      WHERE checklist_id = ?
      ORDER BY item_order
    `).all(checklist.id);

        items.forEach(item => {
            console.log(`     - Item ${item.item_order}: ${item.item_name} (${item.severity}) ${item.is_required ? '[Required]' : ''}`);
        });
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 5: Add QC score log
console.log('\n5️⃣  Adding QC score log...');
try {
    const checklistId = db.prepare(`SELECT id FROM audit_checklists LIMIT 1`).get().id;

    const result = db.prepare(`
    INSERT INTO audit_qc_score_logs (checklist_id, asset_id, reviewed_by, score, outcome)
    VALUES (?, ?, ?, ?, ?)
  `).run(checklistId, 'AST-1042', 'Sarah Chen', 92, 'Pass');

    console.log(`✅ Added QC score log with ID: ${result.lastInsertRowid}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 6: Query score logs
console.log('\n6️⃣  Querying score logs...');
try {
    const logs = db.prepare(`
    SELECT * FROM audit_qc_score_logs
    ORDER BY review_date DESC
  `).all();

    console.log(`✅ Found ${logs.length} score log(s):`);

    logs.forEach(log => {
        console.log(`   Asset: ${log.asset_id}, Score: ${log.score}%, Outcome: ${log.outcome}, Reviewer: ${log.reviewed_by}`);
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 7: Update checklist
console.log('\n7️⃣  Updating checklist...');
try {
    const checklistId = db.prepare(`SELECT id FROM audit_checklists LIMIT 1`).get().id;

    const result = db.prepare(`
    UPDATE audit_checklists
    SET pass_threshold = ?, rework_threshold = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(90, 75, checklistId);

    console.log(`✅ Updated ${result.changes} checklist(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 8: Delete checklist
console.log('\n8️⃣  Deleting checklist...');
try {
    const checklistId = db.prepare(`SELECT id FROM audit_checklists LIMIT 1`).get().id;

    // Delete related data
    db.prepare(`DELETE FROM audit_checklist_items WHERE checklist_id = ?`).run(checklistId);
    db.prepare(`DELETE FROM audit_checklist_modules WHERE checklist_id = ?`).run(checklistId);
    db.prepare(`DELETE FROM audit_linked_campaigns WHERE checklist_id = ?`).run(checklistId);
    db.prepare(`DELETE FROM audit_qc_score_logs WHERE checklist_id = ?`).run(checklistId);

    // Delete checklist
    const result = db.prepare(`DELETE FROM audit_checklists WHERE id = ?`).run(checklistId);

    console.log(`✅ Deleted ${result.changes} checklist(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 9: Verify deletion
console.log('\n9️⃣  Verifying deletion...');
try {
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM audit_checklists`).get();
    console.log(`✅ Remaining checklists: ${count.cnt}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('\n✅ All database tests passed!');
db.close();

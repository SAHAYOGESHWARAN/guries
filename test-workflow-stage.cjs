const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 Workflow Stage Master Testing\n');

// Test 1: Verify database tables
console.log('1️⃣  Verifying database tables...');
try {
    const workflowInfo = db.prepare(`PRAGMA table_info(workflow_master_new)`).all();
    const stageInfo = db.prepare(`PRAGMA table_info(workflow_stage_items)`).all();

    if (workflowInfo.length === 0 || stageInfo.length === 0) {
        console.log('❌ Tables not found');
        process.exit(1);
    }

    console.log('✅ Workflow Master table columns:');
    workflowInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ Workflow Stage Items table columns:');
    stageInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 2: Insert workflow with stages
console.log('\n2️⃣  Inserting workflow with stages...');
try {
    const result = db.prepare(`
    INSERT INTO workflow_master_new (workflow_name, description, status)
    VALUES (?, ?, ?)
  `).run('Content Production', 'Workflow for content creation', 'active');

    const workflowId = result.lastInsertRowid;
    console.log(`✅ Inserted workflow with ID: ${workflowId}`);

    // Insert stages
    const stages = [
        { title: 'Draft', label: 'Draft', color: 'blue', qc: 0 },
        { title: 'Review', label: 'Review', color: 'orange', qc: 1 },
        { title: 'Approved', label: 'Approved', color: 'green', qc: 0 },
        { title: 'Published', label: 'Published', color: 'purple', qc: 0 }
    ];

    const insertStage = db.prepare(`
    INSERT INTO workflow_stage_items (workflow_id, stage_order, stage_title, stage_label, color_tag, mandatory_qc)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    stages.forEach((stage, index) => {
        insertStage.run(workflowId, index + 1, stage.title, stage.label, stage.color, stage.qc);
    });

    console.log(`✅ Inserted ${stages.length} stages`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 3: Query workflow with stages
console.log('\n3️⃣  Querying workflow with stages...');
try {
    const workflows = db.prepare(`SELECT * FROM workflow_master_new`).all();
    console.log(`✅ Found ${workflows.length} workflows:`);

    workflows.forEach(workflow => {
        console.log(`\n   Workflow: ${workflow.workflow_name}`);
        const stages = db.prepare(`
      SELECT * FROM workflow_stage_items WHERE workflow_id = ? ORDER BY stage_order
    `).all(workflow.id);

        stages.forEach(stage => {
            console.log(`     - Stage ${stage.stage_order}: ${stage.stage_title} (${stage.color_tag}) ${stage.mandatory_qc ? '[QC Required]' : ''}`);
        });
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 4: Update workflow
console.log('\n4️⃣  Updating workflow...');
try {
    const result = db.prepare(`
    UPDATE workflow_master_new
    SET description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE workflow_name = ?
  `).run('Updated workflow for content creation', 'Content Production');

    console.log(`✅ Updated ${result.changes} workflow(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 5: Delete workflow
console.log('\n5️⃣  Deleting workflow...');
try {
    // Delete stages first
    db.prepare(`DELETE FROM workflow_stage_items WHERE workflow_id IN (SELECT id FROM workflow_master_new WHERE workflow_name = ?)`).run('Content Production');

    // Delete workflow
    const result = db.prepare(`DELETE FROM workflow_master_new WHERE workflow_name = ?`).run('Content Production');

    console.log(`✅ Deleted ${result.changes} workflow(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 6: Verify deletion
console.log('\n6️⃣  Verifying deletion...');
try {
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM workflow_master_new`).get();
    console.log(`✅ Remaining workflows: ${count.cnt}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('\n✅ All database tests passed!');
db.close();

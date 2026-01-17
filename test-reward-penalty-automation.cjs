const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 Reward & Penalty Automation Testing\n');

// Test 1: Verify database tables
console.log('1️⃣  Verifying database tables...');
try {
    const tables = [
        'bonus_criteria_tiers',
        'reward_recommendations',
        'penalty_automation_rules',
        'penalty_records',
        'reward_history',
        'penalty_history',
        'automation_rules_config',
        'reward_penalty_analytics',
        'appeal_management'
    ];

    tables.forEach(table => {
        const info = db.prepare(`PRAGMA table_info(${table})`).all();
        if (info.length === 0) {
            throw new Error(`Table ${table} not found`);
        }
        console.log(`✅ ${table} table verified`);
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 2: Insert bonus tiers
console.log('\n2️⃣  Inserting bonus tiers...');
try {
    const insertTier = db.prepare(`
        INSERT INTO bonus_criteria_tiers (
            tier_name, tier_level, min_salary, max_salary, bonus_percentage, status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const tiers = [
        { name: 'Tier 1', level: 1, min: 0, max: 500000, bonus: 5 },
        { name: 'Tier 2', level: 2, min: 500000, max: 1000000, bonus: 10 },
        { name: 'Tier 3', level: 3, min: 1000000, max: 2000000, bonus: 15 }
    ];

    tiers.forEach(tier => {
        insertTier.run(tier.name, tier.level, tier.min, tier.max, tier.bonus, 'Active');
    });

    console.log(`✅ Inserted ${tiers.length} bonus tiers`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 3: Insert reward recommendations
console.log('\n3️⃣  Inserting reward recommendations...');
try {
    const insertRec = db.prepare(`
        INSERT INTO reward_recommendations (
            employee_id, employee_name, department, performance_score, reward_amount, approval_status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const recommendations = [
        { id: 'EMP001', name: 'John Doe', dept: 'Engineering', score: 95, amount: 15000 },
        { id: 'EMP002', name: 'Jane Smith', dept: 'Marketing', score: 92, amount: 12000 },
        { id: 'EMP003', name: 'Mike Johnson', dept: 'Sales', score: 88, amount: 10000 }
    ];

    recommendations.forEach(rec => {
        insertRec.run(rec.id, rec.name, rec.dept, rec.score, rec.amount, 'Pending');
    });

    console.log(`✅ Inserted ${recommendations.length} reward recommendations`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 4: Insert penalty rules
console.log('\n4️⃣  Inserting penalty rules...');
try {
    const insertRule = db.prepare(`
        INSERT INTO penalty_automation_rules (
            rule_name, violation_category, severity_level, penalty_amount, status
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    const rules = [
        { name: 'Unauthorized Absence', category: 'Attendance', severity: 'High', amount: 5000 },
        { name: 'Late Submission', category: 'Performance', severity: 'Medium', amount: 2000 },
        { name: 'Policy Violation', category: 'Conduct', severity: 'High', amount: 8000 }
    ];

    rules.forEach(rule => {
        insertRule.run(rule.name, rule.category, rule.severity, rule.amount, 'Active');
    });

    console.log(`✅ Inserted ${rules.length} penalty rules`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 5: Insert penalty records
console.log('\n5️⃣  Inserting penalty records...');
try {
    const insertRecord = db.prepare(`
        INSERT INTO penalty_records (
            employee_id, employee_name, department, violation_type, penalty_amount, severity, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const records = [
        { id: 'EMP004', name: 'Sarah Williams', dept: 'HR', type: 'Unauthorized Absence', amount: 5000, severity: 'High' },
        { id: 'EMP005', name: 'David Brown', dept: 'Finance', type: 'Late Submission', amount: 2000, severity: 'Medium' }
    ];

    records.forEach(rec => {
        insertRecord.run(rec.id, rec.name, rec.dept, rec.type, rec.amount, rec.severity, 'Applied');
    });

    console.log(`✅ Inserted ${records.length} penalty records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 6: Insert reward history
console.log('\n6️⃣  Inserting reward history...');
try {
    const insertHistory = db.prepare(`
        INSERT INTO reward_history (
            employee_id, employee_name, reward_type, reward_amount, reason, period, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const history = [
        { id: 'EMP001', name: 'John Doe', type: 'Bonus', amount: 15000, reason: 'Excellent Performance', period: 'Q4 2024' },
        { id: 'EMP002', name: 'Jane Smith', type: 'Incentive', amount: 12000, reason: 'Project Completion', period: 'Q4 2024' }
    ];

    history.forEach(h => {
        insertHistory.run(h.id, h.name, h.type, h.amount, h.reason, h.period, 'Completed');
    });

    console.log(`✅ Inserted reward history`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 7: Insert penalty history
console.log('\n7️⃣  Inserting penalty history...');
try {
    const insertHistory = db.prepare(`
        INSERT INTO penalty_history (
            employee_id, employee_name, penalty_type, penalty_amount, reason, period, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const history = [
        { id: 'EMP004', name: 'Sarah Williams', type: 'Deduction', amount: 5000, reason: 'Unauthorized Absence', period: 'Q4 2024' },
        { id: 'EMP005', name: 'David Brown', type: 'Fine', amount: 2000, reason: 'Late Submission', period: 'Q4 2024' }
    ];

    history.forEach(h => {
        insertHistory.run(h.id, h.name, h.type, h.amount, h.reason, h.period, 'Completed');
    });

    console.log(`✅ Inserted penalty history`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 8: Insert analytics
console.log('\n8️⃣  Inserting analytics...');
try {
    const insertAnalytics = db.prepare(`
        INSERT INTO reward_penalty_analytics (
            period, total_rewards, total_penalties, total_employees_rewarded, total_employees_penalized,
            average_reward, average_penalty, top_reward_reason, top_penalty_reason
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAnalytics.run('Q4 2024', 37000, 7000, 3, 2, 12333, 3500, 'Excellent Performance', 'Unauthorized Absence');

    console.log(`✅ Inserted analytics`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 9: Insert appeals
console.log('\n9️⃣  Inserting appeals...');
try {
    const insertAppeal = db.prepare(`
        INSERT INTO appeal_management (
            employee_id, employee_name, appeal_type, appeal_reason, appeal_status
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    insertAppeal.run('EMP004', 'Sarah Williams', 'Penalty Appeal', 'Medical emergency on that day', 'Pending');

    console.log(`✅ Inserted appeals`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 10: Verify data retrieval
console.log('\n🔟 Verifying data retrieval...');
try {
    const tiers = db.prepare('SELECT COUNT(*) as count FROM bonus_criteria_tiers').get();
    const rewards = db.prepare('SELECT COUNT(*) as count FROM reward_recommendations').get();
    const rules = db.prepare('SELECT COUNT(*) as count FROM penalty_automation_rules').get();
    const penalties = db.prepare('SELECT COUNT(*) as count FROM penalty_records').get();
    const rewardHist = db.prepare('SELECT COUNT(*) as count FROM reward_history').get();
    const penaltyHist = db.prepare('SELECT COUNT(*) as count FROM penalty_history').get();
    const analytics = db.prepare('SELECT COUNT(*) as count FROM reward_penalty_analytics').get();
    const appeals = db.prepare('SELECT COUNT(*) as count FROM appeal_management').get();

    console.log(`✅ Bonus Tiers: ${tiers.count}`);
    console.log(`✅ Reward Recommendations: ${rewards.count}`);
    console.log(`✅ Penalty Rules: ${rules.count}`);
    console.log(`✅ Penalty Records: ${penalties.count}`);
    console.log(`✅ Reward History: ${rewardHist.count}`);
    console.log(`✅ Penalty History: ${penaltyHist.count}`);
    console.log(`✅ Analytics: ${analytics.count}`);
    console.log(`✅ Appeals: ${appeals.count}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 11: Test complex queries
console.log('\n1️⃣1️⃣  Testing complex queries...');
try {
    const summary = db.prepare(`
        SELECT 
            'Rewards' as type,
            COUNT(*) as count,
            SUM(reward_amount) as total
        FROM reward_history
        UNION ALL
        SELECT 
            'Penalties' as type,
            COUNT(*) as count,
            SUM(penalty_amount) as total
        FROM penalty_history
    `).all();

    console.log(`✅ Summary query returned ${summary.length} records`);
    summary.forEach(row => {
        console.log(`   - ${row.type}: ${row.count} records, Total: ₹${row.total?.toLocaleString()}`);
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('\n✨ All tests passed successfully!\n');
db.close();

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 Employee Performance Scorecard Testing\n');

// Test 1: Verify database tables
console.log('1️⃣  Verifying database tables...');
try {
    const tables = [
        'employee_scorecards',
        'kpi_contributions',
        'qc_performance_history',
        'attendance_discipline',
        'monthly_contributions',
        'ai_performance_analysis',
        'performance_goals'
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

// Test 2: Insert employee scorecards
console.log('\n2️⃣  Inserting employee scorecards...');
try {
    const employees = [
        { id: 'EMP001', name: 'John Doe', dept: 'Engineering', pos: 'Senior Developer', mgr: 'Alice Smith' },
        { id: 'EMP002', name: 'Jane Smith', dept: 'Marketing', pos: 'Marketing Manager', mgr: 'Bob Johnson' },
        { id: 'EMP003', name: 'Mike Johnson', dept: 'Sales', pos: 'Sales Executive', mgr: 'Carol White' },
        { id: 'EMP004', name: 'Sarah Williams', dept: 'HR', pos: 'HR Specialist', mgr: 'David Brown' }
    ];

    const insertScorecard = db.prepare(`
        INSERT INTO employee_scorecards (
            employee_id, employee_name, department, position, reporting_manager,
            effort_score, qc_score, contribution_score, performance_rating,
            performance_rating_percentage, self_rating_score, uniformity_score
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    employees.forEach(emp => {
        insertScorecard.run(
            emp.id,
            emp.name,
            emp.dept,
            emp.pos,
            emp.mgr,
            75 + Math.random() * 20,
            80 + Math.random() * 15,
            78 + Math.random() * 18,
            ['Excellent', 'Good', 'Average', 'Below Average'][Math.floor(Math.random() * 4)],
            75 + Math.random() * 20,
            70 + Math.random() * 25,
            75 + Math.random() * 20
        );
    });

    console.log(`✅ Inserted ${employees.length} employee scorecards`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 3: Insert KPI contributions
console.log('\n3️⃣  Inserting KPI contributions...');
try {
    const employees = ['EMP001', 'EMP002', 'EMP003', 'EMP004'];
    const insertKpi = db.prepare(`
        INSERT INTO kpi_contributions (
            employee_id, tasks_completed, error_rate, rework_percentage
        )
        VALUES (?, ?, ?, ?)
    `);

    employees.forEach(empId => {
        insertKpi.run(
            empId,
            Math.floor(20 + Math.random() * 80),
            Math.random() * 10,
            Math.random() * 15
        );
    });

    console.log(`✅ Inserted ${employees.length} KPI contribution records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 4: Insert QC performance history
console.log('\n4️⃣  Inserting QC performance history...');
try {
    const employees = ['EMP001', 'EMP002', 'EMP003', 'EMP004'];
    const insertQcHistory = db.prepare(`
        INSERT INTO qc_performance_history (
            employee_id, date_recorded, task_name, score, status, feedback, result
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    employees.forEach(empId => {
        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            insertQcHistory.run(
                empId,
                date.toISOString(),
                `Task ${i + 1}`,
                75 + Math.random() * 20,
                ['Pass', 'Rework', 'Fail'][Math.floor(Math.random() * 3)],
                'Good work',
                'Completed'
            );
        }
    });

    console.log(`✅ Inserted QC performance history records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 5: Insert attendance & discipline
console.log('\n5️⃣  Inserting attendance & discipline data...');
try {
    const employees = ['EMP001', 'EMP002', 'EMP003', 'EMP004'];
    const insertAttendance = db.prepare(`
        INSERT INTO attendance_discipline (
            employee_id, present_days, absent_days, warnings, disciplinary_actions
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    employees.forEach(empId => {
        insertAttendance.run(
            empId,
            Math.floor(18 + Math.random() * 10),
            Math.floor(Math.random() * 5),
            Math.floor(Math.random() * 3),
            Math.floor(Math.random() * 2)
        );
    });

    console.log(`✅ Inserted ${employees.length} attendance & discipline records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 6: Insert monthly contributions
console.log('\n6️⃣  Inserting monthly contributions...');
try {
    const employees = ['EMP001', 'EMP002', 'EMP003', 'EMP004'];
    const insertMonthly = db.prepare(`
        INSERT INTO monthly_contributions (
            employee_id, month_year, contribution_percentage
        )
        VALUES (?, ?, ?)
    `);

    employees.forEach(empId => {
        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthYear = date.toISOString().substring(0, 7);
            insertMonthly.run(
                empId,
                monthYear,
                50 + Math.random() * 50
            );
        }
    });

    console.log(`✅ Inserted monthly contribution records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 7: Insert AI performance analysis
console.log('\n7️⃣  Inserting AI performance analysis...');
try {
    const employees = ['EMP001', 'EMP002', 'EMP003', 'EMP004'];
    const insertAiAnalysis = db.prepare(`
        INSERT INTO ai_performance_analysis (
            employee_id, analysis_text, strengths, areas_for_improvement, recommendations
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    employees.forEach(empId => {
        insertAiAnalysis.run(
            empId,
            'AI-generated performance analysis based on historical data',
            'Strong technical skills, good communication, reliable',
            'Time management, delegation, strategic thinking',
            'Focus on leadership development, attend management training'
        );
    });

    console.log(`✅ Inserted ${employees.length} AI performance analysis records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 8: Insert performance goals
console.log('\n8️⃣  Inserting performance goals...');
try {
    const employees = ['EMP001', 'EMP002', 'EMP003', 'EMP004'];
    const insertGoals = db.prepare(`
        INSERT INTO performance_goals (
            employee_id, goal_name, goal_description, target_value, current_value, status, due_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const goals = [
        { name: 'Increase productivity', desc: 'Increase task completion by 20%', target: 100, current: 65 },
        { name: 'Improve quality', desc: 'Reduce error rate to below 5%', target: 5, current: 8 },
        { name: 'Team collaboration', desc: 'Lead 2 cross-team projects', target: 2, current: 0 }
    ];

    employees.forEach(empId => {
        goals.forEach(goal => {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + 3);
            insertGoals.run(
                empId,
                goal.name,
                goal.desc,
                goal.target,
                goal.current,
                ['In Progress', 'Completed', 'On Hold'][Math.floor(Math.random() * 3)],
                dueDate.toISOString().substring(0, 10)
            );
        });
    });

    console.log(`✅ Inserted performance goals`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 9: Verify data retrieval
console.log('\n9️⃣  Verifying data retrieval...');
try {
    const scorecards = db.prepare('SELECT COUNT(*) as count FROM employee_scorecards').get();
    const kpis = db.prepare('SELECT COUNT(*) as count FROM kpi_contributions').get();
    const qcHistory = db.prepare('SELECT COUNT(*) as count FROM qc_performance_history').get();
    const attendance = db.prepare('SELECT COUNT(*) as count FROM attendance_discipline').get();
    const monthly = db.prepare('SELECT COUNT(*) as count FROM monthly_contributions').get();
    const aiAnalysis = db.prepare('SELECT COUNT(*) as count FROM ai_performance_analysis').get();
    const goals = db.prepare('SELECT COUNT(*) as count FROM performance_goals').get();

    console.log(`✅ Employee Scorecards: ${scorecards.count}`);
    console.log(`✅ KPI Contributions: ${kpis.count}`);
    console.log(`✅ QC Performance History: ${qcHistory.count}`);
    console.log(`✅ Attendance & Discipline: ${attendance.count}`);
    console.log(`✅ Monthly Contributions: ${monthly.count}`);
    console.log(`✅ AI Performance Analysis: ${aiAnalysis.count}`);
    console.log(`✅ Performance Goals: ${goals.count}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 10: Test complex query
console.log('\n🔟 Testing complex query...');
try {
    const result = db.prepare(`
        SELECT 
            es.employee_id,
            es.employee_name,
            es.department,
            es.performance_rating,
            COUNT(DISTINCT qph.id) as qc_reviews,
            COUNT(DISTINCT pg.id) as goals_count,
            AVG(es.effort_score) as avg_effort
        FROM employee_scorecards es
        LEFT JOIN qc_performance_history qph ON es.employee_id = qph.employee_id
        LEFT JOIN performance_goals pg ON es.employee_id = pg.employee_id
        GROUP BY es.employee_id
    `).all();

    console.log(`✅ Complex query returned ${result.length} records`);
    result.forEach(row => {
        console.log(`   - ${row.employee_name} (${row.department}): ${row.qc_reviews} reviews, ${row.goals_count} goals`);
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('\n✨ All tests passed successfully!\n');
db.close();

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 Employee Comparison Dashboard Testing\n');

// Test 1: Verify database tables
console.log('1️⃣  Verifying database tables...');
try {
    const tables = [
        'employee_performance_ranking',
        'best_performers',
        'weekly_performance_heatmap',
        'underperforming_employees',
        'performance_comparison_matrix',
        'top_performers_radar',
        'department_performance_summary'
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

// Test 2: Insert employee performance rankings
console.log('\n2️⃣  Inserting employee performance rankings...');
try {
    const employees = [
        { id: 'EMP001', name: 'John Doe', dept: 'Engineering', rank: 1, completion: 95, qc: 92, contribution: 90 },
        { id: 'EMP002', name: 'Jane Smith', dept: 'Marketing', rank: 2, completion: 88, qc: 85, contribution: 87 },
        { id: 'EMP003', name: 'Mike Johnson', dept: 'Sales', rank: 3, completion: 82, qc: 80, contribution: 83 },
        { id: 'EMP004', name: 'Sarah Williams', dept: 'HR', rank: 4, completion: 78, qc: 75, contribution: 79 },
        { id: 'EMP005', name: 'David Brown', dept: 'Engineering', rank: 5, completion: 72, qc: 70, contribution: 71 }
    ];

    const insertRanking = db.prepare(`
        INSERT INTO employee_performance_ranking (
            employee_id, employee_name, department, rank_position,
            completion_score, qc_score, contribution_score, performance_rating, trend
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    employees.forEach(emp => {
        insertRanking.run(
            emp.id,
            emp.name,
            emp.dept,
            emp.rank,
            emp.completion,
            emp.qc,
            emp.contribution,
            emp.rank <= 2 ? 'Excellent' : emp.rank <= 3 ? 'Good' : 'Average',
            emp.rank <= 2 ? 'Up' : emp.rank === 3 ? 'Stable' : 'Down'
        );
    });

    console.log(`✅ Inserted ${employees.length} employee rankings`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 3: Insert best performers
console.log('\n3️⃣  Inserting best performers...');
try {
    const bestPerformers = [
        { id: 'EMP001', name: 'John Doe', dept: 'Engineering', score: 95, achievement: 98 },
        { id: 'EMP002', name: 'Jane Smith', dept: 'Marketing', score: 88, achievement: 92 }
    ];

    const insertBest = db.prepare(`
        INSERT INTO best_performers (
            employee_id, employee_name, department, performance_score, achievement_percentage, period
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    bestPerformers.forEach(emp => {
        insertBest.run(emp.id, emp.name, emp.dept, emp.score, emp.achievement, 'Monthly');
    });

    console.log(`✅ Inserted ${bestPerformers.length} best performer records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 4: Insert weekly performance heatmap
console.log('\n4️⃣  Inserting weekly performance heatmap...');
try {
    const employees = ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005'];
    const insertHeatmap = db.prepare(`
        INSERT INTO weekly_performance_heatmap (
            employee_id, employee_name, week_number, performance_percentage, status
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    const employeeNames = {
        'EMP001': 'John Doe',
        'EMP002': 'Jane Smith',
        'EMP003': 'Mike Johnson',
        'EMP004': 'Sarah Williams',
        'EMP005': 'David Brown'
    };

    employees.forEach(empId => {
        for (let week = 1; week <= 4; week++) {
            insertHeatmap.run(
                empId,
                employeeNames[empId],
                week,
                70 + Math.random() * 30,
                Math.random() > 0.3 ? 'Normal' : 'Alert'
            );
        }
    });

    console.log(`✅ Inserted weekly performance heatmap data`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 5: Insert underperforming employees
console.log('\n5️⃣  Inserting underperforming employees...');
try {
    const underperformers = [
        { id: 'EMP005', name: 'David Brown', dept: 'Engineering', current: 45, target: 75, gap: 30, reason: 'Skill gap in new technology' }
    ];

    const insertUnder = db.prepare(`
        INSERT INTO underperforming_employees (
            employee_id, employee_name, department, current_score, target_score,
            gap, reason, detection_date, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `);

    underperformers.forEach(emp => {
        insertUnder.run(
            emp.id,
            emp.name,
            emp.dept,
            emp.current,
            emp.target,
            emp.gap,
            emp.reason,
            'Active'
        );
    });

    console.log(`✅ Inserted ${underperformers.length} underperforming employee records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 6: Insert performance comparison matrix
console.log('\n6️⃣  Inserting performance comparison matrix...');
try {
    const comparisons = [
        { emp1: 'EMP001', emp2: 'EMP002', name1: 'John Doe', name2: 'Jane Smith', metric: 'Completion Score', val1: 95, val2: 88 },
        { emp1: 'EMP001', emp2: 'EMP002', name1: 'John Doe', name2: 'Jane Smith', metric: 'QC Score', val1: 92, val2: 85 },
        { emp1: 'EMP001', emp2: 'EMP003', name1: 'John Doe', name2: 'Mike Johnson', metric: 'Completion Score', val1: 95, val2: 82 }
    ];

    const insertComparison = db.prepare(`
        INSERT INTO performance_comparison_matrix (
            employee_id_1, employee_id_2, employee_name_1, employee_name_2,
            metric_name, value_1, value_2, difference
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    comparisons.forEach(comp => {
        insertComparison.run(
            comp.emp1,
            comp.emp2,
            comp.name1,
            comp.name2,
            comp.metric,
            comp.val1,
            comp.val2,
            comp.val1 - comp.val2
        );
    });

    console.log(`✅ Inserted ${comparisons.length} comparison matrix entries`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 7: Insert top performers radar data
console.log('\n7️⃣  Inserting top performers radar data...');
try {
    const metrics = ['Technical Skills', 'Communication', 'Leadership', 'Reliability', 'Innovation'];
    const topPerformers = ['EMP001', 'EMP002'];

    const insertRadar = db.prepare(`
        INSERT INTO top_performers_radar (
            employee_id, employee_name, metric_name, metric_value
        )
        VALUES (?, ?, ?, ?)
    `);

    const employeeNames = {
        'EMP001': 'John Doe',
        'EMP002': 'Jane Smith'
    };

    topPerformers.forEach(empId => {
        metrics.forEach(metric => {
            insertRadar.run(
                empId,
                employeeNames[empId],
                metric,
                75 + Math.random() * 25
            );
        });
    });

    console.log(`✅ Inserted top performers radar data`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 8: Insert department performance summary
console.log('\n8️⃣  Inserting department performance summary...');
try {
    const departments = [
        { name: 'Engineering', avg: 85, top: 'John Doe', under: 1, total: 2 },
        { name: 'Marketing', avg: 88, top: 'Jane Smith', under: 0, total: 1 },
        { name: 'Sales', avg: 82, top: 'Mike Johnson', under: 0, total: 1 },
        { name: 'HR', avg: 78, top: 'Sarah Williams', under: 0, total: 1 }
    ];

    const insertDept = db.prepare(`
        INSERT INTO department_performance_summary (
            department, average_performance, top_performer_name, underperformer_count, total_employees
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    departments.forEach(dept => {
        insertDept.run(
            dept.name,
            dept.avg,
            dept.top,
            dept.under,
            dept.total
        );
    });

    console.log(`✅ Inserted ${departments.length} department performance summaries`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 9: Verify data retrieval
console.log('\n9️⃣  Verifying data retrieval...');
try {
    const ranking = db.prepare('SELECT COUNT(*) as count FROM employee_performance_ranking').get();
    const best = db.prepare('SELECT COUNT(*) as count FROM best_performers').get();
    const heatmap = db.prepare('SELECT COUNT(*) as count FROM weekly_performance_heatmap').get();
    const under = db.prepare('SELECT COUNT(*) as count FROM underperforming_employees').get();
    const comparison = db.prepare('SELECT COUNT(*) as count FROM performance_comparison_matrix').get();
    const radar = db.prepare('SELECT COUNT(*) as count FROM top_performers_radar').get();
    const deptSummary = db.prepare('SELECT COUNT(*) as count FROM department_performance_summary').get();

    console.log(`✅ Employee Performance Ranking: ${ranking.count}`);
    console.log(`✅ Best Performers: ${best.count}`);
    console.log(`✅ Weekly Performance Heatmap: ${heatmap.count}`);
    console.log(`✅ Underperforming Employees: ${under.count}`);
    console.log(`✅ Performance Comparison Matrix: ${comparison.count}`);
    console.log(`✅ Top Performers Radar: ${radar.count}`);
    console.log(`✅ Department Performance Summary: ${deptSummary.count}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 10: Test complex queries
console.log('\n🔟 Testing complex queries...');
try {
    // Query 1: Top 3 performers
    const topThree = db.prepare(`
        SELECT * FROM employee_performance_ranking
        ORDER BY rank_position ASC
        LIMIT 3
    `).all();

    console.log(`✅ Top 3 performers query returned ${topThree.length} records`);

    // Query 2: Department performance analysis
    const deptAnalysis = db.prepare(`
        SELECT 
            department,
            COUNT(*) as total_employees,
            AVG(completion_score) as avg_completion,
            AVG(qc_score) as avg_qc,
            AVG(contribution_score) as avg_contribution
        FROM employee_performance_ranking
        GROUP BY department
    `).all();

    console.log(`✅ Department analysis query returned ${deptAnalysis.length} departments`);
    deptAnalysis.forEach(dept => {
        console.log(`   - ${dept.department}: ${dept.total_employees} employees, Avg Completion: ${dept.avg_completion.toFixed(1)}`);
    });

    // Query 3: Performance distribution
    const distribution = db.prepare(`
        SELECT 
            performance_rating,
            COUNT(*) as count
        FROM employee_performance_ranking
        GROUP BY performance_rating
    `).all();

    console.log(`✅ Performance distribution query returned ${distribution.length} categories`);
    distribution.forEach(dist => {
        console.log(`   - ${dist.performance_rating}: ${dist.count} employees`);
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('\n✨ All tests passed successfully!\n');
db.close();

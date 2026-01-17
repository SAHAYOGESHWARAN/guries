const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 Analytics Dashboard Testing\n');

// Test 1: Verify database tables
console.log('1️⃣  Verifying database tables...');
try {
    const tables = [
        'effort_analytics',
        'performance_analytics',
        'kpi_metrics',
        'target_vs_actual',
        'team_performance_heatmap',
        'qc_performance_by_stage',
        'sla_misses_delays',
        'effort_trends',
        'keyword_analytics'
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

// Test 2: Insert effort analytics data
console.log('\n2️⃣  Inserting effort analytics data...');
try {
    const departments = ['Marketing', 'Content', 'SEO', 'Development'];
    const insertEffort = db.prepare(`
    INSERT INTO effort_analytics (
      department, effort_completion_percentage, effort_pass_percentage,
      total_tasks_completed, qc_compliance_percentage, rework_percentage
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    departments.forEach(dept => {
        insertEffort.run(
            dept,
            85 + Math.random() * 10,
            90 + Math.random() * 5,
            Math.floor(50 + Math.random() * 50),
            88 + Math.random() * 8,
            5 + Math.random() * 5
        );
    });

    console.log(`✅ Inserted ${departments.length} effort analytics records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 3: Insert performance analytics data
console.log('\n3️⃣  Inserting performance analytics data...');
try {
    const departments = ['Marketing', 'Content', 'SEO', 'Development'];
    const insertPerformance = db.prepare(`
    INSERT INTO performance_analytics (
      department, kpi_achievement_percentage, ranking_improvement,
      performance_score_percentage, engagement_score, traffic_growth_percentage, conversion_score
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    departments.forEach(dept => {
        insertPerformance.run(
            dept,
            80 + Math.random() * 15,
            Math.floor(5 + Math.random() * 20),
            82 + Math.random() * 12,
            75 + Math.random() * 20,
            10 + Math.random() * 30,
            65 + Math.random() * 25
        );
    });

    console.log(`✅ Inserted ${departments.length} performance analytics records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 4: Insert KPI metrics
console.log('\n4️⃣  Inserting KPI metrics...');
try {
    const metrics = [
        { name: 'Organic Traffic', type: 'Traffic', benchmark: 30000, current: 47000, target: 50000 },
        { name: 'Ranking', type: 'Ranking', benchmark: 15, current: 11, target: 5 },
        { name: 'Engagement Rate', type: 'Engagement', benchmark: 2.8, current: 3.6, target: 4 },
        { name: 'Conversion Rate', type: 'Conversion', benchmark: 3.5, current: 2.9, target: 4.5 }
    ];

    const insertMetric = db.prepare(`
    INSERT INTO kpi_metrics (
      metric_name, metric_type, benchmark, current_value, target_value,
      gold_standard, competitor_avg
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    metrics.forEach(m => {
        insertMetric.run(
            m.name,
            m.type,
            m.benchmark,
            m.current,
            m.target,
            m.target * 1.2,
            m.benchmark * 1.1
        );
    });

    console.log(`✅ Inserted ${metrics.length} KPI metrics`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 5: Insert team performance heatmap
console.log('\n5️⃣  Inserting team performance heatmap...');
try {
    const teams = ['Content Writer', 'SEO Specialist', 'Backlink Team', 'SMM Team', 'Web Dev'];
    const insertHeatmap = db.prepare(`
    INSERT INTO team_performance_heatmap (team_name, week_number, performance_percentage, status)
    VALUES (?, ?, ?, ?)
  `);

    for (let week = 1; week <= 4; week++) {
        teams.forEach(team => {
            const perf = 70 + Math.random() * 25;
            insertHeatmap.run(
                team,
                week,
                perf,
                perf >= 80 ? 'good' : perf >= 60 ? 'warning' : 'critical'
            );
        });
    }

    console.log(`✅ Inserted team performance heatmap data`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 6: Insert QC performance by stage
console.log('\n6️⃣  Inserting QC performance by stage...');
try {
    const stages = ['Draft', 'Review', 'Approved', 'Published'];
    const insertStage = db.prepare(`
    INSERT INTO qc_performance_by_stage (stage_name, score_percentage, status)
    VALUES (?, ?, ?)
  `);

    stages.forEach(stage => {
        const score = 75 + Math.random() * 20;
        insertStage.run(
            stage,
            score,
            score >= 80 ? 'good' : 'warning'
        );
    });

    console.log(`✅ Inserted ${stages.length} QC performance records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 7: Insert SLA misses/delays
console.log('\n7️⃣  Inserting SLA misses/delays...');
try {
    const teams = ['Content Writer', 'SEO Specialist', 'Backlink Team', 'SMM Team', 'Web Dev'];
    const insertSLA = db.prepare(`
    INSERT INTO sla_misses_delays (team_name, missed_count, delay_days)
    VALUES (?, ?, ?)
  `);

    teams.forEach(team => {
        insertSLA.run(
            team,
            Math.floor(Math.random() * 5),
            Math.floor(Math.random() * 10)
        );
    });

    console.log(`✅ Inserted ${teams.length} SLA records`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 8: Insert effort trends
console.log('\n8️⃣  Inserting effort trends...');
try {
    const insertTrend = db.prepare(`
    INSERT INTO effort_trends (week_number, effort_percentage)
    VALUES (?, ?)
  `);

    for (let week = 1; week <= 12; week++) {
        insertTrend.run(week, 70 + Math.random() * 25);
    }

    console.log(`✅ Inserted 12 weeks of effort trends`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 9: Insert keywords
console.log('\n9️⃣  Inserting keywords...');
try {
    const keywords = [
        { keyword: 'digital marketing', rank: 5, volume: 50000, traffic: 12000, conversions: 450 },
        { keyword: 'SEO services', rank: 3, volume: 35000, traffic: 8500, conversions: 280 },
        { keyword: 'content marketing', rank: 8, volume: 28000, traffic: 5200, conversions: 150 },
        { keyword: 'social media marketing', rank: 12, volume: 22000, traffic: 3800, conversions: 95 },
        { keyword: 'email marketing', rank: 15, volume: 18000, traffic: 2900, conversions: 70 }
    ];

    const insertKeyword = db.prepare(`
    INSERT INTO keyword_analytics (keyword, rank_position, search_volume, traffic_count, conversion_count)
    VALUES (?, ?, ?, ?, ?)
  `);

    keywords.forEach(k => {
        insertKeyword.run(k.keyword, k.rank, k.volume, k.traffic, k.conversions);
    });

    console.log(`✅ Inserted ${keywords.length} keywords`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 10: Query dashboard data
console.log('\n🔟 Querying dashboard data...');
try {
    const effortSummary = db.prepare(`
    SELECT 
      AVG(effort_completion_percentage) as completion,
      AVG(effort_pass_percentage) as pass_rate,
      SUM(total_tasks_completed) as total_tasks
    FROM effort_analytics
  `).get();

    const performanceSummary = db.prepare(`
    SELECT 
      AVG(kpi_achievement_percentage) as kpi_achievement,
      AVG(performance_score_percentage) as performance_score
    FROM performance_analytics
  `).get();

    const topKeywords = db.prepare(`
    SELECT keyword, traffic_count FROM keyword_analytics
    ORDER BY traffic_count DESC LIMIT 5
  `).all();

    console.log(`✅ Effort Summary: ${Math.round(effortSummary.completion)}% completion, ${effortSummary.total_tasks} tasks`);
    console.log(`✅ Performance Summary: ${Math.round(performanceSummary.kpi_achievement)}% KPI achievement`);
    console.log(`✅ Top Keywords: ${topKeywords.map(k => k.keyword).join(', ')}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('\n✅ All database tests passed!');
db.close();

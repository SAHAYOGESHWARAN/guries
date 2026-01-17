const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 AI Automatic Evaluation Engine Testing\n');

// Test 1: Verify database tables
console.log('1️⃣  Verifying database tables...');
try {
    const tables = [
        'ai_evaluation_reports',
        'ai_input_data_sources',
        'ai_performance_scores',
        'ai_risk_factors_detected',
        'ai_improvement_opportunities',
        'ai_recommendations',
        'ai_evaluation_reasoning',
        'ai_evaluation_history'
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

// Test 2: Insert evaluation reports
console.log('\n2️⃣  Inserting evaluation reports...');
try {
    const reports = [
        { id: 'RPT-2024-001', period: 'This Month', records: 2847 },
        { id: 'RPT-2024-002', period: 'Last Month', records: 2421 },
        { id: 'RPT-2024-003', period: 'This Quarter', records: 6923 }
    ];

    const insertReport = db.prepare(`
        INSERT INTO ai_evaluation_reports (
            report_id, evaluation_period, total_records, status
        )
        VALUES (?, ?, ?, ?)
    `);

    reports.forEach(report => {
        insertReport.run(report.id, report.period, report.records, 'Completed');
    });

    console.log(`✅ Inserted ${reports.length} evaluation reports`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 3: Insert input data sources
console.log('\n3️⃣  Inserting input data sources...');
try {
    const insertSource = db.prepare(`
        INSERT INTO ai_input_data_sources (
            report_id, source_name, record_count, data_type, status
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    const sources = [
        { report: 'RPT-2024-001', name: 'Employee Database', count: 1200, type: 'Structured' },
        { report: 'RPT-2024-001', name: 'Performance Logs', count: 1647, type: 'Unstructured' },
        { report: 'RPT-2024-002', name: 'HR System', count: 2421, type: 'Structured' }
    ];

    sources.forEach(source => {
        insertSource.run(source.report, source.name, source.count, source.type, 'Active');
    });

    console.log(`✅ Inserted ${sources.length} data sources`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 4: Insert performance scores
console.log('\n4️⃣  Inserting performance scores...');
try {
    const insertScore = db.prepare(`
        INSERT INTO ai_performance_scores (
            report_id, metric_name, score, trend, status
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    const scores = [
        { report: 'RPT-2024-001', metric: 'Accuracy', score: 87, trend: 'Up' },
        { report: 'RPT-2024-001', metric: 'Precision', score: 92, trend: 'Stable' },
        { report: 'RPT-2024-001', metric: 'Recall', score: 85, trend: 'Down' },
        { report: 'RPT-2024-002', metric: 'F1 Score', score: 88, trend: 'Up' }
    ];

    scores.forEach(score => {
        insertScore.run(score.report, score.metric, score.score, score.trend, 'Active');
    });

    console.log(`✅ Inserted ${scores.length} performance scores`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 5: Insert risk factors
console.log('\n5️⃣  Inserting risk factors...');
try {
    const insertRisk = db.prepare(`
        INSERT INTO ai_risk_factors_detected (
            report_id, risk_factor, severity, impact_percentage, description, recommendation, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const risks = [
        { report: 'RPT-2024-001', factor: 'Data Quality Issues', severity: 'High', impact: 15, desc: 'Missing values detected', rec: 'Implement data validation' },
        { report: 'RPT-2024-001', factor: 'Bias Detection', severity: 'Medium', impact: 8, desc: 'Gender bias in predictions', rec: 'Retrain with balanced dataset' },
        { report: 'RPT-2024-002', factor: 'Model Drift', severity: 'High', impact: 12, desc: 'Performance degradation', rec: 'Update model parameters' }
    ];

    risks.forEach(risk => {
        insertRisk.run(risk.report, risk.factor, risk.severity, risk.impact, risk.desc, risk.rec, 'Active');
    });

    console.log(`✅ Inserted ${risks.length} risk factors`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 6: Insert improvement opportunities
console.log('\n6️⃣  Inserting improvement opportunities...');
try {
    const insertOpp = db.prepare(`
        INSERT INTO ai_improvement_opportunities (
            report_id, opportunity_name, category, potential_impact, priority,
            implementation_effort, description, action_items, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const opportunities = [
        { report: 'RPT-2024-001', name: 'Feature Engineering', category: 'Model', impact: 25, priority: 'High', effort: 'Medium' },
        { report: 'RPT-2024-001', name: 'Data Augmentation', category: 'Data', impact: 18, priority: 'Medium', effort: 'High' },
        { report: 'RPT-2024-002', name: 'Hyperparameter Tuning', category: 'Model', impact: 12, priority: 'Medium', effort: 'Low' }
    ];

    opportunities.forEach(opp => {
        insertOpp.run(opp.report, opp.name, opp.category, opp.impact, opp.priority, opp.effort, 'Improve model performance', 'Action items', 'Active');
    });

    console.log(`✅ Inserted ${opportunities.length} improvement opportunities`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 7: Insert recommendations
console.log('\n7️⃣  Inserting recommendations...');
try {
    const insertRec = db.prepare(`
        INSERT INTO ai_recommendations (
            report_id, recommendation_text, category, priority, estimated_impact,
            implementation_timeline, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const recommendations = [
        { report: 'RPT-2024-001', text: 'Implement automated data quality checks', category: 'Data', priority: 'High', impact: 20, timeline: '2 weeks' },
        { report: 'RPT-2024-001', text: 'Conduct bias audit and mitigation', category: 'Ethics', priority: 'High', impact: 15, timeline: '3 weeks' },
        { report: 'RPT-2024-002', text: 'Schedule monthly model retraining', category: 'Maintenance', priority: 'Medium', impact: 10, timeline: 'Ongoing' }
    ];

    recommendations.forEach(rec => {
        insertRec.run(rec.report, rec.text, rec.category, rec.priority, rec.impact, rec.timeline, 'Active');
    });

    console.log(`✅ Inserted ${recommendations.length} recommendations`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 8: Insert evaluation reasoning
console.log('\n8️⃣  Inserting evaluation reasoning...');
try {
    const insertReasoning = db.prepare(`
        INSERT INTO ai_evaluation_reasoning (
            report_id, reasoning_section, reasoning_text, key_findings, methodology, confidence_score
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const reasoning = [
        { report: 'RPT-2024-001', section: 'Model Performance', text: 'Model shows good accuracy', findings: 'Accuracy: 87%', method: 'Cross-validation', confidence: 92 },
        { report: 'RPT-2024-001', section: 'Data Quality', text: 'Data quality issues detected', findings: '5% missing values', method: 'Statistical analysis', confidence: 88 }
    ];

    reasoning.forEach(r => {
        insertReasoning.run(r.report, r.section, r.text, r.findings, r.method, r.confidence);
    });

    console.log(`✅ Inserted evaluation reasoning`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 9: Insert evaluation history
console.log('\n9️⃣  Inserting evaluation history...');
try {
    const insertHistory = db.prepare(`
        INSERT INTO ai_evaluation_history (
            report_id, evaluation_date, overall_score, trend, key_metrics
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    const history = [
        { report: 'RPT-2024-001', date: new Date().toISOString(), score: 87, trend: 'Up', metrics: 'Accuracy: 87%, Precision: 92%' },
        { report: 'RPT-2024-001', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), score: 84, trend: 'Stable', metrics: 'Accuracy: 84%, Precision: 90%' }
    ];

    history.forEach(h => {
        insertHistory.run(h.report, h.date, h.score, h.trend, h.metrics);
    });

    console.log(`✅ Inserted evaluation history`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 10: Verify data retrieval
console.log('\n🔟 Verifying data retrieval...');
try {
    const reports = db.prepare('SELECT COUNT(*) as count FROM ai_evaluation_reports').get();
    const sources = db.prepare('SELECT COUNT(*) as count FROM ai_input_data_sources').get();
    const scores = db.prepare('SELECT COUNT(*) as count FROM ai_performance_scores').get();
    const risks = db.prepare('SELECT COUNT(*) as count FROM ai_risk_factors_detected').get();
    const opportunities = db.prepare('SELECT COUNT(*) as count FROM ai_improvement_opportunities').get();
    const recommendations = db.prepare('SELECT COUNT(*) as count FROM ai_recommendations').get();
    const reasoning = db.prepare('SELECT COUNT(*) as count FROM ai_evaluation_reasoning').get();
    const history = db.prepare('SELECT COUNT(*) as count FROM ai_evaluation_history').get();

    console.log(`✅ Evaluation Reports: ${reports.count}`);
    console.log(`✅ Data Sources: ${sources.count}`);
    console.log(`✅ Performance Scores: ${scores.count}`);
    console.log(`✅ Risk Factors: ${risks.count}`);
    console.log(`✅ Improvement Opportunities: ${opportunities.count}`);
    console.log(`✅ Recommendations: ${recommendations.count}`);
    console.log(`✅ Evaluation Reasoning: ${reasoning.count}`);
    console.log(`✅ Evaluation History: ${history.count}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 11: Test complex queries
console.log('\n1️⃣1️⃣  Testing complex queries...');
try {
    const reportSummary = db.prepare(`
        SELECT 
            r.report_id,
            r.evaluation_period,
            COUNT(DISTINCT s.id) as source_count,
            COUNT(DISTINCT p.id) as score_count,
            COUNT(DISTINCT rf.id) as risk_count,
            AVG(p.score) as avg_score
        FROM ai_evaluation_reports r
        LEFT JOIN ai_input_data_sources s ON r.report_id = s.report_id
        LEFT JOIN ai_performance_scores p ON r.report_id = p.report_id
        LEFT JOIN ai_risk_factors_detected rf ON r.report_id = rf.report_id
        GROUP BY r.report_id
    `).all();

    console.log(`✅ Report summary query returned ${reportSummary.length} records`);
    reportSummary.forEach(summary => {
        console.log(`   - ${summary.report_id}: ${summary.source_count} sources, ${summary.score_count} scores, ${summary.risk_count} risks, Avg Score: ${summary.avg_score?.toFixed(1)}`);
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('\n✨ All tests passed successfully!\n');
db.close();

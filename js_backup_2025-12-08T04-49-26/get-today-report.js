/**
 * Script to fetch and display today's report from the Marketing Control Center API
 */

import http from 'http';

const API_BASE = 'http://localhost:3001/api/v1';

// Helper function to make API request
function fetchReport() {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}/reports/today`;
        
        http.get(url, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`API Error: ${res.statusCode} - ${data.error || body}`));
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${e.message}`));
                }
            });
        }).on('error', (err) => {
            reject(new Error(`Connection error: ${err.message}. Make sure the backend server is running on port 3001.`));
        });
    });
}

// Format and display the report
function displayReport(report) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 TODAY\'S REPORT - Marketing Control Center');
    console.log('='.repeat(80));
    console.log(`Date: ${report.date}`);
    console.log(`Generated At: ${new Date(report.generatedAt).toLocaleString()}`);
    console.log('\n' + '-'.repeat(80));
    
    // Summary Section
    console.log('\n📈 SUMMARY');
    console.log('-'.repeat(80));
    console.log(`Total Activities Today: ${report.summary.totalActivities}`);
    console.log(`Tasks Completed: ${report.summary.tasksCompleted}`);
    console.log(`Tasks Created: ${report.summary.tasksCreated}`);
    console.log(`Today's Traffic: ${report.summary.todayTraffic.toLocaleString()}`);
    console.log(`Task Completion Rate: ${report.metrics.taskCompletionRate}%`);
    console.log(`Productivity Score: ${report.metrics.productivityScore}/100`);
    
    // Activities Section
    console.log('\n📋 TODAY\'S ACTIVITIES');
    console.log('-'.repeat(80));
    
    if (report.activities.campaigns.count > 0) {
        console.log(`\n🎯 Campaigns Created: ${report.activities.campaigns.count}`);
        report.activities.campaigns.items.slice(0, 5).forEach(item => {
            console.log(`   - ${item.name} (${item.type}) - ${item.status}`);
        });
    }
    
    if (report.activities.tasks.count > 0) {
        console.log(`\n✅ Tasks Created: ${report.activities.tasks.count}`);
        report.activities.tasks.items.slice(0, 5).forEach(item => {
            console.log(`   - ${item.title} - ${item.status} (Priority: ${item.priority || 'N/A'})`);
        });
    }
    
    if (report.activities.content.count > 0) {
        console.log(`\n📝 Content Created: ${report.activities.content.count}`);
        report.activities.content.items.slice(0, 5).forEach(item => {
            console.log(`   - ${item.title} (${item.type}) - Stage: ${item.stage}`);
        });
    }
    
    if (report.activities.projects.count > 0) {
        console.log(`\n📁 Projects Created: ${report.activities.projects.count}`);
        report.activities.projects.items.slice(0, 5).forEach(item => {
            console.log(`   - ${item.name} - ${item.status}`);
        });
    }
    
    if (report.activities.smmPosts.count > 0) {
        console.log(`\n📱 SMM Posts Created: ${report.activities.smmPosts.count}`);
        report.activities.smmPosts.items.slice(0, 5).forEach(item => {
            console.log(`   - ${item.platform} - ${item.status}`);
        });
    }
    
    if (report.activities.backlinks.count > 0) {
        console.log(`\n🔗 Backlinks Created: ${report.activities.backlinks.count}`);
    }
    
    if (report.activities.submissions.count > 0) {
        console.log(`\n📤 Submissions Created: ${report.activities.submissions.count}`);
        const statusCounts = report.activities.submissions.items.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {});
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   - ${status}: ${count}`);
        });
    }
    
    if (report.activities.qcRuns.count > 0) {
        console.log(`\n🔍 QC Runs: ${report.activities.qcRuns.count}`);
        report.activities.qcRuns.items.slice(0, 5).forEach(item => {
            console.log(`   - ${item.target_type} - ${item.status}`);
        });
    }
    
    // Notifications Section
    if (report.notifications.count > 0) {
        console.log('\n🔔 NOTIFICATIONS');
        console.log('-'.repeat(80));
        console.log(`Total: ${report.notifications.count}`);
        const unread = report.notifications.items.filter(n => !n.read).length;
        console.log(`Unread: ${unread}`);
        report.notifications.items.slice(0, 5).forEach(item => {
            const status = item.read ? '✓' : '○';
            console.log(`   ${status} [${item.type}] ${item.message}`);
        });
    }
    
    // Current Status Section
    console.log('\n📊 CURRENT STATUS');
    console.log('-'.repeat(80));
    console.log(`Active Campaigns: ${report.currentStatus.activeCampaigns}`);
    console.log(`Pending Tasks: ${report.currentStatus.pendingTasks}`);
    console.log(`Toxic Link Alerts: ${report.currentStatus.toxicLinkAlerts}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('Report generated successfully!');
    console.log('='.repeat(80) + '\n');
}

// Main execution
async function main() {
    try {
        console.log('Fetching today\'s report...');
        const report = await fetchReport();
        displayReport(report);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('   1. Backend server is running (npm run dev or npm start in backend/)');
        console.log('   2. Database is connected and accessible');
        console.log('   3. Server is listening on port 3001');
        process.exit(1);
    }
}

main();


const http = require('http');

const BASE_URL = 'http://localhost:3003/api/v1';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Test functions
async function testTaskSuggestions() {
    console.log('\n=== Testing Task Allocation Suggestions ===\n');

    try {
        // Create task suggestions
        console.log('1. Creating task suggestions...');
        const suggestions = [
            {
                task_id: 'TASK-001',
                task_name: 'Blog Post - SEO Optimization',
                task_type: 'Content Writing',
                priority: 'High',
                estimated_hours: 8,
                suggested_assignee_id: '1',
                suggested_assignee_name: 'Sarah Johnson',
                allocation_reason: 'High expertise in SEO content, current capacity available',
                confidence_score: 92
            },
            {
                task_id: 'TASK-002',
                task_name: 'Backlink Outreach Campaign',
                task_type: 'SEO',
                priority: 'Medium',
                estimated_hours: 6,
                suggested_assignee_id: '2',
                suggested_assignee_name: 'Mike Chen',
                allocation_reason: 'Specialized in backlink outreach, proven track record',
                confidence_score: 85
            },
            {
                task_id: 'TASK-003',
                task_name: 'Social Media Graphics',
                task_type: 'Design',
                priority: 'Low',
                estimated_hours: 4,
                suggested_assignee_id: '3',
                suggested_assignee_name: 'Emma Davis',
                allocation_reason: 'Graphic design specialist, available capacity',
                confidence_score: 78
            }
        ];

        for (const suggestion of suggestions) {
            const response = await makeRequest('POST', '/workload-allocation/task-suggestions', suggestion);
            console.log(`   ✓ Created suggestion: ${suggestion.task_name} (ID: ${response.data.id})`);
        }

        // Get all suggestions
        console.log('\n2. Fetching all task suggestions...');
        const allResponse = await makeRequest('GET', '/workload-allocation/task-suggestions');
        console.log(`   ✓ Retrieved ${allResponse.data.length} suggestions`);

        // Get suggestions with filters
        console.log('\n3. Fetching high-priority suggestions...');
        const highPriorityResponse = await makeRequest('GET', '/workload-allocation/task-suggestions?priority=High');
        console.log(`   ✓ Retrieved ${highPriorityResponse.data.length} high-priority suggestions`);

        // Get suggestions with confidence filter
        console.log('\n4. Fetching suggestions with 80%+ confidence...');
        const highConfidenceResponse = await makeRequest('GET', '/workload-allocation/task-suggestions?minConfidence=80');
        console.log(`   ✓ Retrieved ${highConfidenceResponse.data.length} high-confidence suggestions`);

        // Accept a suggestion
        if (allResponse.data.length > 0) {
            console.log('\n5. Accepting first suggestion...');
            const firstId = allResponse.data[0].id;
            const acceptResponse = await makeRequest('PUT', `/workload-allocation/task-suggestions/${firstId}/accept`);
            console.log(`   ✓ ${acceptResponse.data.message}`);
        }

        // Reject a suggestion
        if (allResponse.data.length > 1) {
            console.log('\n6. Rejecting second suggestion...');
            const secondId = allResponse.data[1].id;
            const rejectResponse = await makeRequest('PUT', `/workload-allocation/task-suggestions/${secondId}/reject`);
            console.log(`   ✓ ${rejectResponse.data.message}`);
        }

        // Get allocation statistics
        console.log('\n7. Fetching allocation statistics...');
        const statsResponse = await makeRequest('GET', '/workload-allocation/stats');
        console.log(`   ✓ Total Suggestions: ${statsResponse.data.totalSuggestions.count}`);
        console.log(`   ✓ Accepted: ${statsResponse.data.acceptedSuggestions.count}`);
        console.log(`   ✓ Rejected: ${statsResponse.data.rejectedSuggestions.count}`);
        console.log(`   ✓ Pending: ${statsResponse.data.pendingSuggestions.count}`);
        console.log(`   ✓ Average Confidence: ${statsResponse.data.averageConfidence.avg?.toFixed(2)}%`);

    } catch (error) {
        console.error('Error testing task suggestions:', error);
    }
}

async function testWorkloadForecast() {
    console.log('\n=== Testing Workload Forecast ===\n');

    try {
        // Get workload forecast
        console.log('1. Fetching workload forecast...');
        const response = await makeRequest('GET', '/workload-allocation/workload-forecast');
        console.log(`   ✓ Retrieved ${response.data.length} workload forecasts`);

        if (response.data.length > 0) {
            const forecast = response.data[0];
            console.log(`   - Employee: ${forecast.employee_name}`);
            console.log(`   - Current Workload: ${forecast.current_workload}h`);
            console.log(`   - Forecasted Workload: ${forecast.forecasted_workload}h`);
            console.log(`   - Utilization: ${forecast.utilization_percentage}%`);
            console.log(`   - Risk Level: ${forecast.risk_level}`);
        }

        // Get forecast by department
        console.log('\n2. Fetching forecast for Content department...');
        const deptResponse = await makeRequest('GET', '/workload-allocation/workload-forecast?department=Content');
        console.log(`   ✓ Retrieved ${deptResponse.data.length} forecasts for Content department`);

    } catch (error) {
        console.error('Error testing workload forecast:', error);
    }
}

async function testTeamCapacity() {
    console.log('\n=== Testing Team Capacity Utilization ===\n');

    try {
        // Get team capacity
        console.log('1. Fetching team capacity utilization...');
        const response = await makeRequest('GET', '/workload-allocation/team-capacity');
        console.log(`   ✓ Retrieved ${response.data.length} team capacity records`);

        if (response.data.length > 0) {
            const capacity = response.data[0];
            console.log(`   - Team: ${capacity.team_name}`);
            console.log(`   - Total Capacity: ${capacity.total_capacity}h`);
            console.log(`   - Allocated: ${capacity.allocated_capacity}h`);
            console.log(`   - Available: ${capacity.available_capacity}h`);
            console.log(`   - Utilization: ${capacity.utilization_percentage}%`);
        }

    } catch (error) {
        console.error('Error testing team capacity:', error);
    }
}

async function testPredictedOverloads() {
    console.log('\n=== Testing Predicted Overloads ===\n');

    try {
        // Get predicted overloads
        console.log('1. Fetching predicted overload cases...');
        const response = await makeRequest('GET', '/workload-allocation/predicted-overloads');
        console.log(`   ✓ Retrieved ${response.data.length} predicted overload cases`);

        if (response.data.length > 0) {
            const overload = response.data[0];
            console.log(`   - Employee: ${overload.employee_name}`);
            console.log(`   - Current Load: ${overload.current_load}h`);
            console.log(`   - Predicted Load: ${overload.predicted_load}h`);
            console.log(`   - Capacity: ${overload.capacity}h`);
            console.log(`   - Overload %: ${overload.overload_percentage}%`);
            console.log(`   - Severity: ${overload.severity}`);
        }

        // Get high-severity overloads
        console.log('\n2. Fetching high-severity overload cases...');
        const highResponse = await makeRequest('GET', '/workload-allocation/predicted-overloads?severity=High');
        console.log(`   ✓ Retrieved ${highResponse.data.length} high-severity cases`);

    } catch (error) {
        console.error('Error testing predicted overloads:', error);
    }
}

async function testWorkloadTrends() {
    console.log('\n=== Testing Workload Trend Forecast ===\n');

    try {
        // Get workload trends
        console.log('1. Fetching workload trend forecasts...');
        const response = await makeRequest('GET', '/workload-allocation/workload-trends');
        console.log(`   ✓ Retrieved ${response.data.length} workload trend records`);

        if (response.data.length > 0) {
            const trend = response.data[0];
            console.log(`   - Employee: ${trend.employee_name}`);
            console.log(`   - Period: ${trend.period}`);
            console.log(`   - Average Workload: ${trend.average_workload}h`);
            console.log(`   - Peak Workload: ${trend.peak_workload}h`);
            console.log(`   - Trend Direction: ${trend.trend_direction}`);
            console.log(`   - Volatility Score: ${trend.volatility_score}`);
        }

    } catch (error) {
        console.error('Error testing workload trends:', error);
    }
}

async function testSkillAllocations() {
    console.log('\n=== Testing Skill-Based Allocations ===\n');

    try {
        // Get skill allocations
        console.log('1. Fetching skill-based allocations...');
        const response = await makeRequest('GET', '/workload-allocation/skill-allocations');
        console.log(`   ✓ Retrieved ${response.data.length} skill allocation records`);

        if (response.data.length > 0) {
            const allocation = response.data[0];
            console.log(`   - Task: ${allocation.task_id}`);
            console.log(`   - Required Skill: ${allocation.required_skill}`);
            console.log(`   - Employee: ${allocation.employee_name}`);
            console.log(`   - Skill Match: ${allocation.skill_match_percentage}%`);
            console.log(`   - Experience: ${allocation.experience_years} years`);
        }

    } catch (error) {
        console.error('Error testing skill allocations:', error);
    }
}

async function testAllocationMetrics() {
    console.log('\n=== Testing Allocation Performance Metrics ===\n');

    try {
        // Get allocation metrics
        console.log('1. Fetching allocation performance metrics...');
        const response = await makeRequest('GET', '/workload-allocation/metrics');
        console.log(`   ✓ Retrieved ${response.data.length} metric records`);

        if (response.data.length > 0) {
            const metric = response.data[0];
            console.log(`   - Period: ${metric.period}`);
            console.log(`   - Total Tasks Allocated: ${metric.total_tasks_allocated}`);
            console.log(`   - Successful Allocations: ${metric.successful_allocations}`);
            console.log(`   - Failed Allocations: ${metric.failed_allocations}`);
            console.log(`   - Success Rate: ${metric.success_rate}%`);
            console.log(`   - Resource Utilization: ${metric.resource_utilization_efficiency}%`);
        }

    } catch (error) {
        console.error('Error testing allocation metrics:', error);
    }
}

async function testBulkCreate() {
    console.log('\n=== Testing Bulk Create Suggestions ===\n');

    try {
        console.log('1. Creating multiple suggestions in bulk...');
        const bulkData = {
            suggestions: [
                {
                    task_id: 'TASK-BULK-001',
                    task_name: 'Bulk Task 1',
                    task_type: 'Content',
                    priority: 'High',
                    estimated_hours: 5,
                    suggested_assignee_id: '1',
                    suggested_assignee_name: 'Sarah Johnson',
                    allocation_reason: 'Bulk allocation test',
                    confidence_score: 88
                },
                {
                    task_id: 'TASK-BULK-002',
                    task_name: 'Bulk Task 2',
                    task_type: 'SEO',
                    priority: 'Medium',
                    estimated_hours: 4,
                    suggested_assignee_id: '2',
                    suggested_assignee_name: 'Mike Chen',
                    allocation_reason: 'Bulk allocation test',
                    confidence_score: 82
                }
            ]
        };

        const response = await makeRequest('POST', '/workload-allocation/task-suggestions/bulk', bulkData);
        console.log(`   ✓ ${response.data.message}`);
        console.log(`   ✓ Created IDs: ${response.data.ids.join(', ')}`);

    } catch (error) {
        console.error('Error testing bulk create:', error);
    }
}

// Run all tests
async function runAllTests() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     AI Task Allocation Suggestions - Comprehensive Test    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    try {
        await testTaskSuggestions();
        await testWorkloadForecast();
        await testTeamCapacity();
        await testPredictedOverloads();
        await testWorkloadTrends();
        await testSkillAllocations();
        await testAllocationMetrics();
        await testBulkCreate();

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║                    ✓ All Tests Completed                   ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');
    } catch (error) {
        console.error('Fatal error during testing:', error);
    }
}

// Run tests
runAllTests();

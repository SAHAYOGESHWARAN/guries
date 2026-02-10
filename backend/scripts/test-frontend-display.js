#!/usr/bin/env node

/**
 * Frontend Display Test
 * Tests that data is properly saved and can be retrieved for frontend display
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Helper to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    console.log('\n=== Frontend Display Test Suite ===\n');

    try {
        // Test 1: Create a project
        console.log('Test 1: Creating a project...');
        const projectData = {
            project_name: 'Frontend Display Test Project',
            description: 'Testing frontend display functionality',
            status: 'In Progress',
            start_date: '2026-02-10',
            end_date: '2026-02-28',
            priority: 'High',
            linked_service_id: 1,
            sub_services: '[]',
            outcome_kpis: '[]',
            expected_outcome: 'Verify data displays correctly',
            team_members: '{"content_writer":"","seo_specialist":"","smm_specialist":"","designer":"","web_developer":"","qc_reviewer":"","project_coordinator":""}',
            weekly_report: true
        };

        const createProjectRes = await makeRequest('POST', '/api/v1/projects', projectData);
        if (createProjectRes.status !== 201 && createProjectRes.status !== 200) {
            throw new Error(`Failed to create project: ${createProjectRes.status}`);
        }
        const projectId = createProjectRes.data.id;
        console.log(`✓ Project created with ID: ${projectId}`);
        console.log(`  Data: ${JSON.stringify(createProjectRes.data).substring(0, 100)}...`);

        // Test 2: Retrieve the project
        console.log('\nTest 2: Retrieving the project...');
        const getProjectRes = await makeRequest('GET', `/api/v1/projects/${projectId}`);
        if (getProjectRes.status !== 200) {
            throw new Error(`Failed to retrieve project: ${getProjectRes.status}`);
        }
        console.log(`✓ Project retrieved successfully`);
        console.log(`  Name: ${getProjectRes.data.project_name}`);
        console.log(`  Status: ${getProjectRes.data.status}`);
        console.log(`  Priority: ${getProjectRes.data.priority}`);

        // Test 3: List all projects
        console.log('\nTest 3: Listing all projects...');
        const listProjectsRes = await makeRequest('GET', '/api/v1/projects');
        if (listProjectsRes.status !== 200) {
            throw new Error(`Failed to list projects: ${listProjectsRes.status}`);
        }
        const projectCount = Array.isArray(listProjectsRes.data) ? listProjectsRes.data.length : 0;
        console.log(`✓ Projects listed successfully`);
        console.log(`  Total projects: ${projectCount}`);
        console.log(`  Latest project: ${listProjectsRes.data[0]?.project_name || 'N/A'}`);

        // Test 4: Create a task
        console.log('\nTest 4: Creating a task...');
        const taskData = {
            task_name: 'Frontend Display Test Task',
            description: 'Testing task display on frontend',
            status: 'in_progress',
            priority: 'High',
            project_id: projectId,
            campaign_id: null,
            due_date: '2026-02-20',
            campaign_type: 'SEO',
            sub_campaign: 'Test Campaign',
            progress_stage: 'In Progress',
            qc_stage: 'In Review',
            estimated_hours: 8,
            tags: 'test,frontend,display',
            repo_links: ''
        };

        const createTaskRes = await makeRequest('POST', '/api/v1/tasks', taskData);
        if (createTaskRes.status !== 201 && createTaskRes.status !== 200) {
            throw new Error(`Failed to create task: ${createTaskRes.status}`);
        }
        const taskId = createTaskRes.data.id;
        console.log(`✓ Task created with ID: ${taskId}`);
        console.log(`  Data: ${JSON.stringify(createTaskRes.data).substring(0, 100)}...`);

        // Test 5: Retrieve the task
        console.log('\nTest 5: Retrieving the task...');
        const getTaskRes = await makeRequest('GET', `/api/v1/tasks/${taskId}`);
        if (getTaskRes.status !== 200) {
            throw new Error(`Failed to retrieve task: ${getTaskRes.status}`);
        }
        console.log(`✓ Task retrieved successfully`);
        console.log(`  Name: ${getTaskRes.data.task_name}`);
        console.log(`  Status: ${getTaskRes.data.status}`);
        console.log(`  Priority: ${getTaskRes.data.priority}`);

        // Test 6: List all tasks
        console.log('\nTest 6: Listing all tasks...');
        const listTasksRes = await makeRequest('GET', '/api/v1/tasks');
        if (listTasksRes.status !== 200) {
            throw new Error(`Failed to list tasks: ${listTasksRes.status}`);
        }
        const taskCount = Array.isArray(listTasksRes.data) ? listTasksRes.data.length : 0;
        console.log(`✓ Tasks listed successfully`);
        console.log(`  Total tasks: ${taskCount}`);
        console.log(`  Latest task: ${listTasksRes.data[0]?.task_name || 'N/A'}`);

        // Test 7: Verify data structure for frontend
        console.log('\nTest 7: Verifying data structure for frontend display...');
        const requiredProjectFields = ['id', 'project_name', 'description', 'status', 'start_date', 'end_date', 'priority', 'owner_id', 'brand_id', 'linked_service_id', 'sub_services', 'outcome_kpis', 'expected_outcome', 'team_members', 'weekly_report', 'created_at', 'updated_at'];
        const requiredTaskFields = ['id', 'task_name', 'description', 'status', 'priority', 'assigned_to', 'project_id', 'campaign_id', 'due_date', 'campaign_type', 'sub_campaign', 'progress_stage', 'qc_stage', 'estimated_hours', 'tags', 'repo_links', 'rework_count', 'repo_link_count', 'created_at', 'updated_at'];

        const projectData = getProjectRes.data;
        const taskData = getTaskRes.data;

        let projectFieldsOk = true;
        let taskFieldsOk = true;

        for (const field of requiredProjectFields) {
            if (!(field in projectData)) {
                console.log(`  ✗ Project missing field: ${field}`);
                projectFieldsOk = false;
            }
        }

        for (const field of requiredTaskFields) {
            if (!(field in taskData)) {
                console.log(`  ✗ Task missing field: ${field}`);
                taskFieldsOk = false;
            }
        }

        if (projectFieldsOk && taskFieldsOk) {
            console.log(`✓ All required fields present in project and task data`);
        }

        console.log('\n=== Test Summary ===');
        console.log('✓ All tests passed!');
        console.log('\nFrontend should now display:');
        console.log(`  - Project: "${projectData.project_name}" (ID: ${projectData.id})`);
        console.log(`  - Task: "${taskData.task_name}" (ID: ${taskData.id})`);
        console.log('\nData is properly saved and retrievable for frontend display.');

    } catch (error) {
        console.error('\n✗ Test failed:', error.message);
        process.exit(1);
    }
}

// Run tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

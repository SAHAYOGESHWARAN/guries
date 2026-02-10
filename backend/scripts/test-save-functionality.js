#!/usr/bin/env node

/**
 * Test Script: Verify Projects & Tasks Save Functionality
 * 
 * This script tests:
 * 1. Database connection
 * 2. Schema verification
 * 3. Project creation and retrieval
 * 4. Task creation and retrieval
 * 5. Data persistence
 */

const http = require('http');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`  ${title}`, 'cyan');
    log(`${'='.repeat(60)}\n`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// API request helper
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: `/api/v1${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsed,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Test functions
async function testBackendConnection() {
    logSection('Test 1: Backend Connection');

    try {
        const response = await makeRequest('GET', '/health');

        if (response.status === 200) {
            logSuccess('Backend is running on port 3001');
            logInfo(`Response: ${JSON.stringify(response.data)}`);
            return true;
        } else {
            logError(`Backend returned status ${response.status}`);
            return false;
        }
    } catch (error) {
        logError(`Cannot connect to backend: ${error.message}`);
        logWarning('Make sure backend is running: npm run dev');
        return false;
    }
}

async function testProjectCreation() {
    logSection('Test 2: Project Creation');

    const testProject = {
        project_name: `Test Project ${Date.now()}`,
        status: 'Planned',
        priority: 'High',
        description: 'Automated test project',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    try {
        logInfo(`Creating project: ${testProject.project_name}`);
        const response = await makeRequest('POST', '/projects', testProject);

        if (response.status === 201 || response.status === 200) {
            logSuccess('Project created successfully');
            logInfo(`Project ID: ${response.data.id}`);
            logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
            return { success: true, projectId: response.data.id, project: response.data };
        } else {
            logError(`Failed to create project. Status: ${response.status}`);
            logInfo(`Response: ${JSON.stringify(response.data)}`);
            return { success: false };
        }
    } catch (error) {
        logError(`Error creating project: ${error.message}`);
        return { success: false };
    }
}

async function testTaskCreation() {
    logSection('Test 3: Task Creation');

    const testTask = {
        task_name: `Test Task ${Date.now()}`,
        status: 'pending',
        priority: 'High',
        description: 'Automated test task',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress_stage: 'Not Started',
        qc_stage: 'Pending'
    };

    try {
        logInfo(`Creating task: ${testTask.task_name}`);
        const response = await makeRequest('POST', '/tasks', testTask);

        if (response.status === 201 || response.status === 200) {
            logSuccess('Task created successfully');
            logInfo(`Task ID: ${response.data.id}`);
            logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
            return { success: true, taskId: response.data.id, task: response.data };
        } else {
            logError(`Failed to create task. Status: ${response.status}`);
            logInfo(`Response: ${JSON.stringify(response.data)}`);
            return { success: false };
        }
    } catch (error) {
        logError(`Error creating task: ${error.message}`);
        return { success: false };
    }
}

async function testProjectRetrieval(projectId) {
    logSection('Test 4: Project Retrieval & Persistence');

    try {
        logInfo(`Retrieving project ID: ${projectId}`);
        const response = await makeRequest('GET', `/projects/${projectId}`);

        if (response.status === 200) {
            logSuccess('Project retrieved successfully');
            logInfo(`Project Name: ${response.data.project_name}`);
            logInfo(`Status: ${response.data.status}`);
            logInfo(`Priority: ${response.data.priority}`);
            logInfo(`Created At: ${response.data.created_at}`);
            return true;
        } else {
            logError(`Failed to retrieve project. Status: ${response.status}`);
            return false;
        }
    } catch (error) {
        logError(`Error retrieving project: ${error.message}`);
        return false;
    }
}

async function testTaskRetrieval(taskId) {
    logSection('Test 5: Task Retrieval & Persistence');

    try {
        logInfo(`Retrieving task ID: ${taskId}`);
        const response = await makeRequest('GET', `/tasks`);

        if (response.status === 200) {
            const task = response.data.find(t => t.id === taskId);
            if (task) {
                logSuccess('Task retrieved successfully');
                logInfo(`Task Name: ${task.task_name}`);
                logInfo(`Status: ${task.status}`);
                logInfo(`Priority: ${task.priority}`);
                logInfo(`Created At: ${task.created_at}`);
                return true;
            } else {
                logWarning(`Task ID ${taskId} not found in list`);
                return false;
            }
        } else {
            logError(`Failed to retrieve tasks. Status: ${response.status}`);
            return false;
        }
    } catch (error) {
        logError(`Error retrieving tasks: ${error.message}`);
        return false;
    }
}

async function testProjectsList() {
    logSection('Test 6: Projects List');

    try {
        const response = await makeRequest('GET', '/projects');

        if (response.status === 200) {
            logSuccess(`Retrieved ${response.data.length} projects`);
            if (response.data.length > 0) {
                logInfo('Sample projects:');
                response.data.slice(0, 3).forEach(p => {
                    log(`  - ${p.project_name} (${p.status})`, 'blue');
                });
            }
            return true;
        } else {
            logError(`Failed to retrieve projects. Status: ${response.status}`);
            return false;
        }
    } catch (error) {
        logError(`Error retrieving projects: ${error.message}`);
        return false;
    }
}

async function testTasksList() {
    logSection('Test 7: Tasks List');

    try {
        const response = await makeRequest('GET', '/tasks');

        if (response.status === 200) {
            logSuccess(`Retrieved ${response.data.length} tasks`);
            if (response.data.length > 0) {
                logInfo('Sample tasks:');
                response.data.slice(0, 3).forEach(t => {
                    log(`  - ${t.task_name} (${t.status})`, 'blue');
                });
            }
            return true;
        } else {
            logError(`Failed to retrieve tasks. Status: ${response.status}`);
            return false;
        }
    } catch (error) {
        logError(`Error retrieving tasks: ${error.message}`);
        return false;
    }
}

// Main test runner
async function runTests() {
    logSection('🧪 PROJECTS & TASKS SAVE FUNCTIONALITY TEST SUITE');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Test 1: Backend Connection
    const backendOk = await testBackendConnection();
    results.tests.push({ name: 'Backend Connection', passed: backendOk });
    if (backendOk) results.passed++; else results.failed++;

    if (!backendOk) {
        logError('\n❌ Backend is not running. Cannot continue tests.');
        logWarning('Start backend with: cd backend && npm run dev');
        process.exit(1);
    }

    // Test 2: Project Creation
    const projectResult = await testProjectCreation();
    results.tests.push({ name: 'Project Creation', passed: projectResult.success });
    if (projectResult.success) results.passed++; else results.failed++;

    // Test 3: Task Creation
    const taskResult = await testTaskCreation();
    results.tests.push({ name: 'Task Creation', passed: taskResult.success });
    if (taskResult.success) results.passed++; else results.failed++;

    // Test 4: Project Retrieval
    if (projectResult.success) {
        const projectRetrieved = await testProjectRetrieval(projectResult.projectId);
        results.tests.push({ name: 'Project Retrieval', passed: projectRetrieved });
        if (projectRetrieved) results.passed++; else results.failed++;
    }

    // Test 5: Task Retrieval
    if (taskResult.success) {
        const taskRetrieved = await testTaskRetrieval(taskResult.taskId);
        results.tests.push({ name: 'Task Retrieval', passed: taskRetrieved });
        if (taskRetrieved) results.passed++; else results.failed++;
    }

    // Test 6: Projects List
    const projectsList = await testProjectsList();
    results.tests.push({ name: 'Projects List', passed: projectsList });
    if (projectsList) results.passed++; else results.failed++;

    // Test 7: Tasks List
    const tasksList = await testTasksList();
    results.tests.push({ name: 'Tasks List', passed: tasksList });
    if (tasksList) results.passed++; else results.failed++;

    // Summary
    logSection('📊 TEST SUMMARY');

    results.tests.forEach(test => {
        if (test.passed) {
            logSuccess(`${test.name}`);
        } else {
            logError(`${test.name}`);
        }
    });

    log(`\nTotal: ${results.passed} passed, ${results.failed} failed`, 'cyan');

    if (results.failed === 0) {
        logSuccess('\n🎉 All tests passed! Projects and tasks are saving correctly.');
        process.exit(0);
    } else {
        logError('\n⚠️  Some tests failed. Check the output above for details.');
        process.exit(1);
    }
}

// Run tests
runTests().catch(error => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
});

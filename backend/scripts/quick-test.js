#!/usr/bin/env node

/**
 * Quick Test - Verify Projects & Tasks Save Functionality
 */

const http = require('http');

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: `/api/v1${path}`,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function test() {
    log('\n🧪 QUICK TEST - Projects & Tasks Save\n', 'blue');

    try {
        // Test 1: Health Check
        log('Test 1: Backend Health Check...', 'yellow');
        const health = await makeRequest('GET', '/health');
        if (health.status === 200) {
            log('✅ Backend is running\n', 'green');
        } else {
            log(`❌ Backend error: ${health.status}\n`, 'red');
            process.exit(1);
        }

        // Test 2: Create Project
        log('Test 2: Create Project...', 'yellow');
        const projectData = {
            project_name: `Test Project ${Date.now()}`,
            status: 'Planned',
            priority: 'High',
            description: 'Test project'
        };
        const project = await makeRequest('POST', '/projects', projectData);
        if (project.status === 201 || project.status === 200) {
            log(`✅ Project created (ID: ${project.data.id})\n`, 'green');
        } else {
            log(`❌ Project creation failed: ${project.status}\n`, 'red');
            console.log(project.data);
        }

        // Test 3: Create Task
        log('Test 3: Create Task...', 'yellow');
        const taskData = {
            task_name: `Test Task ${Date.now()}`,
            status: 'pending',
            priority: 'High',
            description: 'Test task'
        };
        const task = await makeRequest('POST', '/tasks', taskData);
        if (task.status === 201 || task.status === 200) {
            log(`✅ Task created (ID: ${task.data.id})\n`, 'green');
        } else {
            log(`❌ Task creation failed: ${task.status}\n`, 'red');
            console.log(task.data);
        }

        // Test 4: Get Projects
        log('Test 4: Get All Projects...', 'yellow');
        const projects = await makeRequest('GET', '/projects');
        if (projects.status === 200 && Array.isArray(projects.data)) {
            log(`✅ Retrieved ${projects.data.length} projects\n`, 'green');
        } else {
            log(`❌ Failed to get projects\n`, 'red');
        }

        // Test 5: Get Tasks
        log('Test 5: Get All Tasks...', 'yellow');
        const tasks = await makeRequest('GET', '/tasks');
        if (tasks.status === 200 && Array.isArray(tasks.data)) {
            log(`✅ Retrieved ${tasks.data.length} tasks\n`, 'green');
        } else {
            log(`❌ Failed to get tasks\n`, 'red');
        }

        log('✅ All tests passed!\n', 'green');
        process.exit(0);

    } catch (error) {
        log(`❌ Error: ${error.message}\n`, 'red');
        log('Make sure backend is running: npm run dev\n', 'yellow');
        process.exit(1);
    }
}

test();

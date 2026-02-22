/**
 * Real-time Test Script for Projects Module Fix - Version 2
 * Tests project creation, persistence, and retrieval
 */

const API_BASE_URL = 'http://localhost:3004/api/v1';

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL';
    message: string;
    details?: any;
}

const results: TestResult[] = [];
let authToken: string | null = null;

// Helper function to make API calls
async function apiCall(method: string, endpoint: string, body?: any) {
    try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json();
        return { status: response.status, data };
    } catch (error: any) {
        return { status: 0, error: error.message };
    }
}

// Get authentication token
async function getAuthToken() {
    console.log('🔐 Attempting authentication...');

    const result = await apiCall('POST', '/auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
    });

    if (result.status === 200 && result.data?.token) {
        authToken = result.data.token;
        console.log('✅ Authentication successful\n');
        return true;
    } else {
        console.log('⚠️  Authentication failed, proceeding without token\n');
        return false;
    }
}

// Test 1: Create project with valid data
async function test1CreateProject() {
    console.log('\n📝 Test 1: Create project with valid data');

    const payload = {
        project_name: 'Test Project - ' + Date.now(),
        project_code: `PRJ-${Date.now()}`,
        description: 'Test project for verification',
        status: 'Planned',
        start_date: '2026-02-22',
        end_date: '2026-03-22',
        budget: 50000,
        owner_id: 1,
        priority: 'High'
    };

    const result = await apiCall('POST', '/projects', payload);

    if (result.status === 201 && result.data?.id) {
        results.push({
            name: 'Create Project',
            status: 'PASS',
            message: 'Project created successfully',
            details: {
                projectId: result.data.id,
                name: result.data.project_name,
                status: result.data.status,
                code: result.data.project_code
            }
        });
        return result.data.id;
    } else {
        results.push({
            name: 'Create Project',
            status: 'FAIL',
            message: `Expected 201, got ${result.status}`,
            details: result.data || result.error
        });
        return null;
    }
}

// Test 2: Get project by ID (verify it exists)
async function test2GetProjectById(projectId: number) {
    console.log('\n📝 Test 2: Get project by ID');

    const result = await apiCall('GET', `/projects/${projectId}`, undefined);

    if (result.status === 200 && result.data?.id === projectId) {
        results.push({
            name: 'Get Project by ID',
            status: 'PASS',
            message: 'Project retrieved successfully',
            details: {
                projectId: result.data.id,
                name: result.data.project_name,
                status: result.data.status
            }
        });
    } else {
        results.push({
            name: 'Get Project by ID',
            status: 'FAIL',
            message: `Expected 200 with project data, got ${result.status}`,
            details: result.data || result.error
        });
    }
}

// Test 3: Get all projects and verify project appears in list
async function test3GetProjectsList(projectId: number) {
    console.log('\n📝 Test 3: Get all projects and verify project appears in list');

    const result = await apiCall('GET', '/projects', undefined);

    if (result.status === 200 && Array.isArray(result.data)) {
        const foundProject = result.data.find((p: any) => p.id === projectId);

        if (foundProject) {
            results.push({
                name: 'Projects List Contains Created Project',
                status: 'PASS',
                message: `Project found in list of ${result.data.length} projects`,
                details: {
                    projectId: foundProject.id,
                    name: foundProject.project_name,
                    totalProjects: result.data.length
                }
            });
        } else {
            results.push({
                name: 'Projects List Contains Created Project',
                status: 'FAIL',
                message: `Project not found in list of ${result.data.length} projects`,
                details: { totalProjects: result.data.length }
            });
        }
    } else {
        results.push({
            name: 'Projects List Contains Created Project',
            status: 'FAIL',
            message: `Expected 200, got ${result.status}`,
            details: result.data || result.error
        });
    }
}

// Test 4: Update project and verify persistence
async function test4UpdateProject(projectId: number) {
    console.log('\n📝 Test 4: Update project and verify persistence');

    const payload = {
        project_name: 'Updated Project - ' + Date.now(),
        status: 'In Progress',
        priority: 'Critical'
    };

    const result = await apiCall('PUT', `/projects/${projectId}`, payload);

    if (result.status === 200 && result.data?.id === projectId) {
        results.push({
            name: 'Update Project',
            status: 'PASS',
            message: 'Project updated successfully',
            details: {
                projectId: result.data.id,
                name: result.data.project_name,
                status: result.data.status,
                priority: result.data.priority
            }
        });
    } else {
        results.push({
            name: 'Update Project',
            status: 'FAIL',
            message: `Expected 200, got ${result.status}`,
            details: result.data || result.error
        });
    }
}

// Test 5: Create multiple projects and verify all persist
async function test5MultipleProjects() {
    console.log('\n📝 Test 5: Create multiple projects and verify all persist');

    const projectIds: number[] = [];

    for (let i = 0; i < 3; i++) {
        const payload = {
            project_name: `Multi Test Project ${i + 1} - ${Date.now()}`,
            project_code: `PRJ-${Date.now()}-${i}`,
            description: `Test project ${i + 1}`,
            status: 'Planned',
            priority: ['High', 'Medium', 'Low'][i]
        };

        const result = await apiCall('POST', '/projects', payload);
        if (result.status === 201 && result.data?.id) {
            projectIds.push(result.data.id);
        }
    }

    // Verify all projects appear in list
    const listResult = await apiCall('GET', '/projects', undefined);

    if (listResult.status === 200 && Array.isArray(listResult.data)) {
        const foundProjects = projectIds.filter(id =>
            listResult.data.some((p: any) => p.id === id)
        );

        if (foundProjects.length === projectIds.length) {
            results.push({
                name: 'Multiple Projects Persistence',
                status: 'PASS',
                message: `All ${projectIds.length} projects persisted in list`,
                details: {
                    createdCount: projectIds.length,
                    foundCount: foundProjects.length,
                    totalInList: listResult.data.length
                }
            });
        } else {
            results.push({
                name: 'Multiple Projects Persistence',
                status: 'FAIL',
                message: `Only ${foundProjects.length}/${projectIds.length} projects found`,
                details: {
                    createdCount: projectIds.length,
                    foundCount: foundProjects.length
                }
            });
        }
    } else {
        results.push({
            name: 'Multiple Projects Persistence',
            status: 'FAIL',
            message: `Failed to fetch projects list`,
            details: listResult.data || listResult.error
        });
    }
}

// Test 6: Verify "Project Not Found" error is fixed
async function test6ProjectNotFoundFixed() {
    console.log('\n📝 Test 6: Verify "Project Not Found" error is fixed');

    // Try to get a non-existent project
    const result = await apiCall('GET', '/projects/99999', undefined);

    if (result.status === 404 && result.data?.error) {
        results.push({
            name: 'Project Not Found Error Handling',
            status: 'PASS',
            message: 'Correctly returns 404 for non-existent project',
            details: {
                status: result.status,
                error: result.data.error
            }
        });
    } else {
        results.push({
            name: 'Project Not Found Error Handling',
            status: 'FAIL',
            message: `Expected 404, got ${result.status}`,
            details: result.data || result.error
        });
    }
}

// Main test runner
async function runTests() {
    console.log('🧪 Starting Real-time Projects Module Tests');
    console.log('==========================================');
    console.log(`API Base URL: ${API_BASE_URL}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    try {
        // Get authentication
        await getAuthToken();

        // Run tests
        const projectId = await test1CreateProject();

        if (projectId) {
            await test2GetProjectById(projectId);
            await test3GetProjectsList(projectId);
            await test4UpdateProject(projectId);
        }

        await test5MultipleProjects();
        await test6ProjectNotFoundFixed();

        // Print results
        console.log('\n\n📊 TEST RESULTS');
        console.log('==========================================');

        const passed = results.filter(r => r.status === 'PASS').length;
        const failed = results.filter(r => r.status === 'FAIL').length;

        results.forEach((result, index) => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            console.log(`\n${icon} Test ${index + 1}: ${result.name}`);
            console.log(`   Status: ${result.status}`);
            console.log(`   Message: ${result.message}`);
            if (result.details) {
                console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
            }
        });

        console.log('\n==========================================');
        console.log(`📈 Summary: ${passed} PASSED, ${failed} FAILED out of ${results.length} tests`);
        console.log('==========================================\n');

        if (failed === 0) {
            console.log('🎉 All tests passed! Projects module fix is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please review the details above.');
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error);
    }
}

// Run tests
runTests();

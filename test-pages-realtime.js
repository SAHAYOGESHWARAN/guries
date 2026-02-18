#!/usr/bin/env node

/**
 * Real-Time Page Testing Script
 * Tests all pages in the application for functionality and proper rendering
 * Works on Windows, Mac, and Linux
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const TIMEOUT = 5000; // 5 seconds

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

// All pages to test
const PAGES_TO_TEST = [
    // Main Pages
    { name: 'Dashboard', route: '/dashboard' },
    { name: 'Campaigns', route: '/campaigns' },
    { name: 'Keywords', route: '/keywords' },
    { name: 'Services', route: '/services' },
    { name: 'Backlinks', route: '/backlinks' },
    { name: 'Users', route: '/users' },
    { name: 'Projects', route: '/projects' },
    { name: 'Content Repository', route: '/content-repository' },
    { name: 'Service Pages', route: '/service-pages' },
    { name: 'SMM Repository', route: '/smm-repository' },
    { name: 'Assets', route: '/assets' },
    { name: 'Tasks', route: '/tasks' },
    { name: 'UX Issues', route: '/ux-issues' },
    { name: 'On-Page Errors', route: '/on-page-errors' },
    { name: 'Toxic Backlinks', route: '/toxic-backlinks' },
    { name: 'Promotion Repository', route: '/promotion-repository' },
    { name: 'Competitor Repository', route: '/competitor-repository' },
    { name: 'Competitor Backlinks', route: '/competitor-backlinks' },

    // Master Data Pages
    { name: 'Service Master', route: '/service-master' },
    { name: 'SubService Master', route: '/subservice-master' },
    { name: 'Backlink Master', route: '/backlink-master' },
    { name: 'Industry Sector Master', route: '/industry-sector-master' },
    { name: 'Content Type Master', route: '/content-type-master' },
    { name: 'Asset Type Master', route: '/asset-type-master' },
    { name: 'Asset Category Master', route: '/asset-category-master' },
    { name: 'Platform Master', route: '/platform-master' },
    { name: 'Country Master', route: '/country-master' },
    { name: 'SEO Error Type Master', route: '/seo-error-type-master' },
    { name: 'Workflow Stage Master', route: '/workflow-stage-master' },
    { name: 'User Role Master', route: '/user-role-master' },
    { name: 'Audit Checklist Master', route: '/audit-checklist-master' },
    { name: 'Backlink Source Master', route: '/backlink-source-master' },

    // Dashboard Pack
    { name: 'Performance Dashboard', route: '/performance-dashboard' },
    { name: 'Effort Dashboard', route: '/effort-dashboard' },
    { name: 'Employee Scorecard Dashboard', route: '/employee-scorecard-dashboard' },
    { name: 'Employee Comparison Dashboard', route: '/employee-comparison-dashboard' },
    { name: 'Team Leader Dashboard', route: '/team-leader-dashboard' },
    { name: 'AI Evaluation Engine', route: '/ai-evaluation-engine' },
    { name: 'Reward Penalty Automation', route: '/reward-penalty-automation' },
    { name: 'Reward Penalty Dashboard', route: '/reward-penalty-dashboard' },
    { name: 'Workload Prediction Dashboard', route: '/workload-prediction-dashboard' },
    { name: 'AI Task Allocation', route: '/ai-task-allocation' },

    // Configuration Pages
    { name: 'QC Weightage Config', route: '/qc-weightage-config' },
    { name: 'Performance Benchmark', route: '/performance-benchmark' },
    { name: 'Competitor Benchmark Master', route: '/competitor-benchmark-master' },
    { name: 'Effort Target Config', route: '/effort-target-config' },
    { name: 'Effort Unit Config', route: '/effort-unit-config' },
    { name: 'KPI Master', route: '/kpi-master' },
    { name: 'KPI Target Config', route: '/kpi-target-config' },
    { name: 'KRA Master', route: '/kra-master' },
    { name: 'Objective Master', route: '/objective-master' },
    { name: 'Scoring Engine', route: '/scoring-engine' },
    { name: 'QC Engine Config', route: '/qc-engine-config' },

    // SEO & Asset Pages
    { name: 'SEO Asset Module', route: '/seo-asset-module' },
    { name: 'SEO Assets List', route: '/seo-assets-list' },
    { name: 'SEO Asset Upload', route: '/seo-asset-upload' },
    { name: 'Web Asset Upload', route: '/web-asset-upload' },
    { name: 'SMM Asset Upload', route: '/smm-asset-upload' },
    { name: 'Asset QC', route: '/asset-qc' },
    { name: 'Admin QC Asset Review', route: '/admin-qc-asset-review' },

    // Analytics & Tracking
    { name: 'Project Analytics', route: '/project-analytics' },
    { name: 'Traffic Ranking', route: '/traffic-ranking' },
    { name: 'KPI Tracking', route: '/kpi-tracking' },
    { name: 'OKR Management', route: '/okr-management' },

    // Admin & Settings
    { name: 'Admin Console', route: '/admin-console' },
    { name: 'Admin Console Config', route: '/admin-console-config' },
    { name: 'Role Permission Matrix', route: '/role-permission-matrix' },
    { name: 'Settings', route: '/settings' },
    { name: 'User Profile', route: '/user-profile' },

    // Other Pages
    { name: 'Communication Hub', route: '/communication-hub' },
    { name: 'Knowledge Base', route: '/knowledge-base' },
    { name: 'Quality Compliance', route: '/quality-compliance' },
    { name: 'Competitor Intelligence', route: '/competitor-intelligence' },
    { name: 'Integrations', route: '/integrations' },
    { name: 'Developer Notes', route: '/developer-notes' },
    { name: 'Graphics Plan', route: '/graphics-plan' },
    { name: 'Repository Manager', route: '/repository-manager' },
    { name: 'Gold Standard Benchmark', route: '/gold-standard-benchmark' },
    { name: 'QC Review', route: '/qc-review' },
    { name: 'Automation Notifications', route: '/automation-notifications' },
    { name: 'Dashboard Config', route: '/dashboard-config' },
];

class PageTester {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.warned = 0;
        this.failed = 0;
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    async testPage(page) {
        return new Promise((resolve) => {
            const fullUrl = `${FRONTEND_URL}${page.route}`;
            const startTime = Date.now();

            const makeRequest = (urlString) => {
                const parsedUrl = new url.URL(urlString);
                const protocol = parsedUrl.protocol === 'https:' ? https : http;

                const request = protocol.get(
                    {
                        hostname: parsedUrl.hostname,
                        port: parsedUrl.port,
                        path: parsedUrl.pathname + parsedUrl.search,
                        timeout: TIMEOUT,
                        headers: {
                            'User-Agent': 'PageTester/1.0',
                        },
                    },
                    (response) => {
                        const responseTime = Date.now() - startTime;
                        const statusCode = response.statusCode;

                        let result;
                        if (statusCode === 200) {
                            result = {
                                page: page.name,
                                status: 'PASS',
                                message: '✓ Page loaded successfully',
                                responseTime,
                                statusCode,
                            };
                            this.passed++;
                        } else if (statusCode === 401) {
                            result = {
                                page: page.name,
                                status: 'WARN',
                                message: '⚠ Authentication required',
                                responseTime,
                                statusCode,
                            };
                            this.warned++;
                        } else if (statusCode === 404) {
                            result = {
                                page: page.name,
                                status: 'FAIL',
                                message: '✗ Page not found (404)',
                                responseTime,
                                statusCode,
                            };
                            this.failed++;
                        } else {
                            result = {
                                page: page.name,
                                status: 'WARN',
                                message: `⚠ Status ${statusCode}`,
                                responseTime,
                                statusCode,
                            };
                            this.warned++;
                        }

                        this.results.push(result);
                        resolve(result);
                    }
                );

                request.on('error', (error) => {
                    const responseTime = Date.now() - startTime;
                    let result;

                    if (error.code === 'ECONNREFUSED') {
                        result = {
                            page: page.name,
                            status: 'FAIL',
                            message: '✗ Connection refused',
                            responseTime,
                            error: error.code,
                        };
                    } else if (error.code === 'ENOTFOUND') {
                        result = {
                            page: page.name,
                            status: 'FAIL',
                            message: '✗ Host not found',
                            responseTime,
                            error: error.code,
                        };
                    } else if (error.code === 'ETIMEDOUT') {
                        result = {
                            page: page.name,
                            status: 'FAIL',
                            message: '✗ Request timeout',
                            responseTime,
                            error: error.code,
                        };
                    } else {
                        result = {
                            page: page.name,
                            status: 'FAIL',
                            message: `✗ Error: ${error.message}`,
                            responseTime,
                            error: error.code,
                        };
                    }

                    this.failed++;
                    this.results.push(result);
                    resolve(result);
                });

                request.on('timeout', () => {
                    request.destroy();
                    const responseTime = Date.now() - startTime;
                    const result = {
                        page: page.name,
                        status: 'FAIL',
                        message: '✗ Request timeout',
                        responseTime,
                        error: 'TIMEOUT',
                    };
                    this.failed++;
                    this.results.push(result);
                    resolve(result);
                });
            };

            makeRequest(fullUrl);
        });
    }

    async runTests() {
        this.log('\n🚀 Starting Real-Time Page Testing...\n', 'cyan');
        this.log(`Frontend URL: ${FRONTEND_URL}`, 'cyan');
        this.log(`Total pages to test: ${PAGES_TO_TEST.length}\n`, 'cyan');

        // Check if frontend is running
        this.log('Checking frontend connectivity...', 'cyan');
        const isRunning = await this.checkFrontend();
        if (!isRunning) {
            this.log(
                `✗ Frontend not running at ${FRONTEND_URL}`,
                'red'
            );
            this.log('Please start the frontend with: npm run dev:frontend\n', 'yellow');
            process.exit(1);
        }
        this.log('✓ Frontend is running\n', 'green');

        this.log('📋 Testing Pages...\n', 'cyan');

        for (let i = 0; i < PAGES_TO_TEST.length; i++) {
            const page = PAGES_TO_TEST[i];
            const result = await this.testPage(page);

            const progress = `[${String(i + 1).padStart(2)}/${PAGES_TO_TEST.length}]`;
            const statusIcon =
                result.status === 'PASS' ? '✓' : result.status === 'WARN' ? '⚠' : '✗';
            const color =
                result.status === 'PASS' ? 'green' : result.status === 'WARN' ? 'yellow' : 'red';

            this.log(
                `${progress} ${statusIcon} ${result.page.padEnd(35)} - ${result.message} (${result.responseTime}ms)`,
                color
            );

            // Small delay between requests
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        this.generateReport();
    }

    checkFrontend() {
        return new Promise((resolve) => {
            const parsedUrl = new url.URL(FRONTEND_URL);
            const protocol = parsedUrl.protocol === 'https:' ? https : http;

            const request = protocol.get(
                {
                    hostname: parsedUrl.hostname,
                    port: parsedUrl.port,
                    path: '/',
                    timeout: 3000,
                },
                () => {
                    resolve(true);
                }
            );

            request.on('error', () => {
                resolve(false);
            });

            request.on('timeout', () => {
                request.destroy();
                resolve(false);
            });
        });
    }

    generateReport() {
        const total = this.results.length;
        const passRate = total > 0 ? ((this.passed / total) * 100).toFixed(1) : 0;

        this.log('\n' + '='.repeat(80), 'cyan');
        this.log('📊 TEST REPORT', 'cyan');
        this.log('='.repeat(80) + '\n', 'cyan');

        this.log(`Total Tests: ${total}`, 'cyan');
        this.log(`✓ Passed: ${this.passed} (${passRate}%)`, 'green');
        this.log(`⚠ Warned: ${this.warned}`, 'yellow');
        this.log(`✗ Failed: ${this.failed}\n`, 'red');

        if (this.failed > 0) {
            this.log('❌ FAILED PAGES:', 'red');
            this.results
                .filter((r) => r.status === 'FAIL')
                .forEach((r) => {
                    this.log(`  - ${r.page}: ${r.message}`, 'red');
                });
            this.log('', 'reset');
        }

        if (this.warned > 0) {
            this.log('⚠️  WARNED PAGES:', 'yellow');
            this.results
                .filter((r) => r.status === 'WARN')
                .forEach((r) => {
                    this.log(`  - ${r.page}: ${r.message}`, 'yellow');
                });
            this.log('', 'reset');
        }

        const avgResponseTime = (
            this.results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / total
        ).toFixed(0);

        this.log(`⏱️  Average Response Time: ${avgResponseTime}ms`, 'cyan');
        this.log(`📅 Test Completed: ${new Date().toISOString()}`, 'cyan');
        this.log('='.repeat(80) + '\n', 'cyan');

        // Exit with appropriate code
        process.exit(this.failed > 0 ? 1 : 0);
    }
}

// Run the tester
const tester = new PageTester();
tester.runTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

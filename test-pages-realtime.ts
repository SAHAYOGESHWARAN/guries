/**
 * Real-Time Page Testing Script
 * Tests all pages in the application for functionality and proper rendering
 * Skips markdown files as requested
 */

import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
    page: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    responseTime?: number;
    statusCode?: number;
    error?: string;
}

interface PageConfig {
    name: string;
    route: string;
    requiresAuth?: boolean;
    description: string;
}

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const TEST_TIMEOUT = 10000; // 10 seconds per page

// All pages to test (excluding markdown files)
const PAGES_TO_TEST: PageConfig[] = [
    // Main Pages
    { name: 'Dashboard', route: '/dashboard', requiresAuth: true, description: 'Main dashboard view' },
    { name: 'Campaigns', route: '/campaigns', requiresAuth: true, description: 'Campaigns management' },
    { name: 'Keywords', route: '/keywords', requiresAuth: true, description: 'Keywords management' },
    { name: 'Services', route: '/services', requiresAuth: true, description: 'Services management' },
    { name: 'Backlinks', route: '/backlinks', requiresAuth: true, description: 'Backlinks management' },
    { name: 'Users', route: '/users', requiresAuth: true, description: 'Users management' },
    { name: 'Projects', route: '/projects', requiresAuth: true, description: 'Projects management' },
    { name: 'Content Repository', route: '/content-repository', requiresAuth: true, description: 'Content repository' },
    { name: 'Service Pages', route: '/service-pages', requiresAuth: true, description: 'Service pages management' },
    { name: 'SMM Repository', route: '/smm-repository', requiresAuth: true, description: 'Social media management' },
    { name: 'Assets', route: '/assets', requiresAuth: true, description: 'Assets management' },
    { name: 'Tasks', route: '/tasks', requiresAuth: true, description: 'Tasks management' },
    { name: 'UX Issues', route: '/ux-issues', requiresAuth: true, description: 'UX issues tracking' },
    { name: 'On-Page Errors', route: '/on-page-errors', requiresAuth: true, description: 'On-page errors' },
    { name: 'Toxic Backlinks', route: '/toxic-backlinks', requiresAuth: true, description: 'Toxic backlinks' },
    { name: 'Promotion Repository', route: '/promotion-repository', requiresAuth: true, description: 'Promotion repository' },
    { name: 'Competitor Repository', route: '/competitor-repository', requiresAuth: true, description: 'Competitor repository' },
    { name: 'Competitor Backlinks', route: '/competitor-backlinks', requiresAuth: true, description: 'Competitor backlinks' },

    // Master Data Pages
    { name: 'Service Master', route: '/service-master', requiresAuth: true, description: 'Service master data' },
    { name: 'SubService Master', route: '/subservice-master', requiresAuth: true, description: 'SubService master data' },
    { name: 'Backlink Master', route: '/backlink-master', requiresAuth: true, description: 'Backlink master data' },
    { name: 'Industry Sector Master', route: '/industry-sector-master', requiresAuth: true, description: 'Industry sector master' },
    { name: 'Content Type Master', route: '/content-type-master', requiresAuth: true, description: 'Content type master' },
    { name: 'Asset Type Master', route: '/asset-type-master', requiresAuth: true, description: 'Asset type master' },
    { name: 'Asset Category Master', route: '/asset-category-master', requiresAuth: true, description: 'Asset category master' },
    { name: 'Platform Master', route: '/platform-master', requiresAuth: true, description: 'Platform master' },
    { name: 'Country Master', route: '/country-master', requiresAuth: true, description: 'Country master' },
    { name: 'SEO Error Type Master', route: '/seo-error-type-master', requiresAuth: true, description: 'SEO error type master' },
    { name: 'Workflow Stage Master', route: '/workflow-stage-master', requiresAuth: true, description: 'Workflow stage master' },
    { name: 'User Role Master', route: '/user-role-master', requiresAuth: true, description: 'User role master' },
    { name: 'Audit Checklist Master', route: '/audit-checklist-master', requiresAuth: true, description: 'Audit checklist master' },
    { name: 'Backlink Source Master', route: '/backlink-source-master', requiresAuth: true, description: 'Backlink source master' },

    // Dashboard Pack
    { name: 'Performance Dashboard', route: '/performance-dashboard', requiresAuth: true, description: 'Performance dashboard' },
    { name: 'Effort Dashboard', route: '/effort-dashboard', requiresAuth: true, description: 'Effort dashboard' },
    { name: 'Employee Scorecard Dashboard', route: '/employee-scorecard-dashboard', requiresAuth: true, description: 'Employee scorecard' },
    { name: 'Employee Comparison Dashboard', route: '/employee-comparison-dashboard', requiresAuth: true, description: 'Employee comparison' },
    { name: 'Team Leader Dashboard', route: '/team-leader-dashboard', requiresAuth: true, description: 'Team leader dashboard' },
    { name: 'AI Evaluation Engine', route: '/ai-evaluation-engine', requiresAuth: true, description: 'AI evaluation engine' },
    { name: 'Reward Penalty Automation', route: '/reward-penalty-automation', requiresAuth: true, description: 'Reward penalty automation' },
    { name: 'Reward Penalty Dashboard', route: '/reward-penalty-dashboard', requiresAuth: true, description: 'Reward penalty dashboard' },
    { name: 'Workload Prediction Dashboard', route: '/workload-prediction-dashboard', requiresAuth: true, description: 'Workload prediction' },
    { name: 'AI Task Allocation', route: '/ai-task-allocation', requiresAuth: true, description: 'AI task allocation' },

    // Configuration Pages
    { name: 'QC Weightage Config', route: '/qc-weightage-config', requiresAuth: true, description: 'QC weightage configuration' },
    { name: 'Performance Benchmark', route: '/performance-benchmark', requiresAuth: true, description: 'Performance benchmark' },
    { name: 'Competitor Benchmark Master', route: '/competitor-benchmark-master', requiresAuth: true, description: 'Competitor benchmark' },
    { name: 'Effort Target Config', route: '/effort-target-config', requiresAuth: true, description: 'Effort target configuration' },
    { name: 'Effort Unit Config', route: '/effort-unit-config', requiresAuth: true, description: 'Effort unit configuration' },
    { name: 'KPI Master', route: '/kpi-master', requiresAuth: true, description: 'KPI master' },
    { name: 'KPI Target Config', route: '/kpi-target-config', requiresAuth: true, description: 'KPI target configuration' },
    { name: 'KRA Master', route: '/kra-master', requiresAuth: true, description: 'KRA master' },
    { name: 'Objective Master', route: '/objective-master', requiresAuth: true, description: 'Objective master' },
    { name: 'Scoring Engine', route: '/scoring-engine', requiresAuth: true, description: 'Scoring engine' },
    { name: 'QC Engine Config', route: '/qc-engine-config', requiresAuth: true, description: 'QC engine configuration' },

    // SEO & Asset Pages
    { name: 'SEO Asset Module', route: '/seo-asset-module', requiresAuth: true, description: 'SEO asset module' },
    { name: 'SEO Assets List', route: '/seo-assets-list', requiresAuth: true, description: 'SEO assets list' },
    { name: 'SEO Asset Upload', route: '/seo-asset-upload', requiresAuth: true, description: 'SEO asset upload' },
    { name: 'Web Asset Upload', route: '/web-asset-upload', requiresAuth: true, description: 'Web asset upload' },
    { name: 'SMM Asset Upload', route: '/smm-asset-upload', requiresAuth: true, description: 'SMM asset upload' },
    { name: 'Asset QC', route: '/asset-qc', requiresAuth: true, description: 'Asset QC' },
    { name: 'Admin QC Asset Review', route: '/admin-qc-asset-review', requiresAuth: true, description: 'Admin QC asset review' },

    // Analytics & Tracking
    { name: 'Project Analytics', route: '/project-analytics', requiresAuth: true, description: 'Project analytics' },
    { name: 'Traffic Ranking', route: '/traffic-ranking', requiresAuth: true, description: 'Traffic ranking' },
    { name: 'KPI Tracking', route: '/kpi-tracking', requiresAuth: true, description: 'KPI tracking' },
    { name: 'OKR Management', route: '/okr-management', requiresAuth: true, description: 'OKR management' },

    // Admin & Settings
    { name: 'Admin Console', route: '/admin-console', requiresAuth: true, description: 'Admin console' },
    { name: 'Admin Console Config', route: '/admin-console-config', requiresAuth: true, description: 'Admin console configuration' },
    { name: 'Role Permission Matrix', route: '/role-permission-matrix', requiresAuth: true, description: 'Role permission matrix' },
    { name: 'Settings', route: '/settings', requiresAuth: true, description: 'Settings' },
    { name: 'User Profile', route: '/user-profile', requiresAuth: true, description: 'User profile' },

    // Other Pages
    { name: 'Communication Hub', route: '/communication-hub', requiresAuth: true, description: 'Communication hub' },
    { name: 'Knowledge Base', route: '/knowledge-base', requiresAuth: true, description: 'Knowledge base' },
    { name: 'Quality Compliance', route: '/quality-compliance', requiresAuth: true, description: 'Quality compliance' },
    { name: 'Competitor Intelligence', route: '/competitor-intelligence', requiresAuth: true, description: 'Competitor intelligence' },
    { name: 'Integrations', route: '/integrations', requiresAuth: true, description: 'Integrations' },
    { name: 'Developer Notes', route: '/developer-notes', requiresAuth: true, description: 'Developer notes' },
    { name: 'Graphics Plan', route: '/graphics-plan', requiresAuth: true, description: 'Graphics plan' },
    { name: 'Repository Manager', route: '/repository-manager', requiresAuth: true, description: 'Repository manager' },
    { name: 'Gold Standard Benchmark', route: '/gold-standard-benchmark', requiresAuth: true, description: 'Gold standard benchmark' },
    { name: 'QC Review', route: '/qc-review', requiresAuth: true, description: 'QC review' },
    { name: 'Automation Notifications', route: '/automation-notifications', requiresAuth: true, description: 'Automation notifications' },
    { name: 'Dashboard Config', route: '/dashboard-config', requiresAuth: true, description: 'Dashboard configuration' },
];

class PageTester {
    private results: TestResult[] = [];
    private authToken: string | null = null;

    async initialize(): Promise<void> {
        console.log('🚀 Starting Real-Time Page Testing...\n');
        console.log(`Frontend URL: ${FRONTEND_URL}`);
        console.log(`API URL: ${API_BASE_URL}`);
        console.log(`Total pages to test: ${PAGES_TO_TEST.length}\n`);
    }

    async testPage(page: PageConfig): Promise<TestResult> {
        const startTime = Date.now();
        const url = `${FRONTEND_URL}${page.route}`;

        try {
            const response = await axios.get(url, {
                timeout: TEST_TIMEOUT,
                validateStatus: () => true, // Accept all status codes
                headers: {
                    'User-Agent': 'PageTester/1.0',
                    ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
                },
            });

            const responseTime = Date.now() - startTime;

            // Check for successful response
            if (response.status === 200) {
                // Check if page contains expected content
                const hasContent = response.data && response.data.length > 0;

                if (hasContent) {
                    return {
                        page: page.name,
                        status: 'PASS',
                        message: `✓ Page loaded successfully`,
                        responseTime,
                        statusCode: response.status,
                    };
                } else {
                    return {
                        page: page.name,
                        status: 'WARN',
                        message: `⚠ Page loaded but content is empty`,
                        responseTime,
                        statusCode: response.status,
                    };
                }
            } else if (response.status === 401 && page.requiresAuth) {
                return {
                    page: page.name,
                    status: 'WARN',
                    message: `⚠ Authentication required (expected for protected pages)`,
                    responseTime,
                    statusCode: response.status,
                };
            } else if (response.status === 404) {
                return {
                    page: page.name,
                    status: 'FAIL',
                    message: `✗ Page not found (404)`,
                    responseTime,
                    statusCode: response.status,
                };
            } else {
                return {
                    page: page.name,
                    status: 'FAIL',
                    message: `✗ Unexpected status code: ${response.status}`,
                    responseTime,
                    statusCode: response.status,
                };
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const axiosError = error as AxiosError;

            if (axiosError.code === 'ECONNREFUSED') {
                return {
                    page: page.name,
                    status: 'FAIL',
                    message: `✗ Connection refused - server not running`,
                    responseTime,
                    error: 'ECONNREFUSED',
                };
            } else if (axiosError.code === 'ENOTFOUND') {
                return {
                    page: page.name,
                    status: 'FAIL',
                    message: `✗ Host not found`,
                    responseTime,
                    error: 'ENOTFOUND',
                };
            } else {
                return {
                    page: page.name,
                    status: 'FAIL',
                    message: `✗ Error: ${axiosError.message}`,
                    responseTime,
                    error: axiosError.code,
                };
            }
        }
    }

    async runTests(): Promise<void> {
        console.log('📋 Testing Pages...\n');

        for (let i = 0; i < PAGES_TO_TEST.length; i++) {
            const page = PAGES_TO_TEST[i];
            const result = await this.testPage(page);
            this.results.push(result);

            // Print progress
            const progress = `[${i + 1}/${PAGES_TO_TEST.length}]`;
            const statusIcon = result.status === 'PASS' ? '✓' : result.status === 'WARN' ? '⚠' : '✗';
            console.log(`${progress} ${statusIcon} ${result.page.padEnd(35)} - ${result.message} (${result.responseTime}ms)`);

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    generateReport(): void {
        console.log('\n' + '='.repeat(80));
        console.log('📊 TEST REPORT');
        console.log('='.repeat(80) + '\n');

        const passed = this.results.filter(r => r.status === 'PASS').length;
        const warned = this.results.filter(r => r.status === 'WARN').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;

        console.log(`Total Tests: ${this.results.length}`);
        console.log(`✓ Passed: ${passed} (${((passed / this.results.length) * 100).toFixed(1)}%)`);
        console.log(`⚠ Warned: ${warned} (${((warned / this.results.length) * 100).toFixed(1)}%)`);
        console.log(`✗ Failed: ${failed} (${((failed / this.results.length) * 100).toFixed(1)}%)\n`);

        if (failed > 0) {
            console.log('❌ FAILED PAGES:');
            this.results
                .filter(r => r.status === 'FAIL')
                .forEach(r => {
                    console.log(`  - ${r.page}: ${r.message}`);
                });
            console.log();
        }

        if (warned > 0) {
            console.log('⚠️  WARNED PAGES:');
            this.results
                .filter(r => r.status === 'WARN')
                .forEach(r => {
                    console.log(`  - ${r.page}: ${r.message}`);
                });
            console.log();
        }

        // Calculate average response time
        const avgResponseTime = (
            this.results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / this.results.length
        ).toFixed(0);

        console.log(`⏱️  Average Response Time: ${avgResponseTime}ms`);
        console.log(`📅 Test Completed: ${new Date().toISOString()}`);
        console.log('\n' + '='.repeat(80));

        // Save report to file
        this.saveReport();
    }

    private saveReport(): void {
        const reportPath = path.join(process.cwd(), 'PAGES_TEST_REPORT.json');
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.length,
                passed: this.results.filter(r => r.status === 'PASS').length,
                warned: this.results.filter(r => r.status === 'WARN').length,
                failed: this.results.filter(r => r.status === 'FAIL').length,
            },
            results: this.results,
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Report saved to: ${reportPath}`);
    }

    async run(): Promise<void> {
        try {
            await this.initialize();
            await this.runTests();
            this.generateReport();
        } catch (error) {
            console.error('Fatal error:', error);
            process.exit(1);
        }
    }
}

// Run the tester
const tester = new PageTester();
tester.run().catch(console.error);

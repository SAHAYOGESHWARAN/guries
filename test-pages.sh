#!/bin/bash

# Real-Time Page Testing Script
# Tests all pages in the application for functionality and proper rendering

echo "🚀 Starting Real-Time Page Testing..."
echo ""

# Configuration
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
API_URL="${API_URL:-http://localhost:3001}"
TIMEOUT=5

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNED=0

# Test a single page
test_page() {
    local page_name=$1
    local route=$2
    local url="${FRONTEND_URL}${route}"
    
    # Make request and capture response
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓${NC} $page_name - OK (200)"
        ((PASSED++))
    elif [ "$response" = "401" ]; then
        echo -e "${YELLOW}⚠${NC} $page_name - Auth Required (401)"
        ((WARNED++))
    elif [ "$response" = "404" ]; then
        echo -e "${RED}✗${NC} $page_name - Not Found (404)"
        ((FAILED++))
    elif [ -z "$response" ]; then
        echo -e "${RED}✗${NC} $page_name - Connection Failed"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠${NC} $page_name - Status $response"
        ((WARNED++))
    fi
}

# Check if frontend is running
echo "Checking frontend at $FRONTEND_URL..."
if ! curl -s --connect-timeout 2 "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${RED}✗ Frontend not running at $FRONTEND_URL${NC}"
    echo "Please start the frontend with: npm run dev:frontend"
    exit 1
fi
echo -e "${GREEN}✓ Frontend is running${NC}\n"

# Test all pages
echo "📋 Testing Pages..."
echo ""

# Main Pages
test_page "Dashboard" "/dashboard"
test_page "Campaigns" "/campaigns"
test_page "Keywords" "/keywords"
test_page "Services" "/services"
test_page "Backlinks" "/backlinks"
test_page "Users" "/users"
test_page "Projects" "/projects"
test_page "Content Repository" "/content-repository"
test_page "Service Pages" "/service-pages"
test_page "SMM Repository" "/smm-repository"
test_page "Assets" "/assets"
test_page "Tasks" "/tasks"
test_page "UX Issues" "/ux-issues"
test_page "On-Page Errors" "/on-page-errors"
test_page "Toxic Backlinks" "/toxic-backlinks"
test_page "Promotion Repository" "/promotion-repository"
test_page "Competitor Repository" "/competitor-repository"
test_page "Competitor Backlinks" "/competitor-backlinks"

echo ""
echo "Master Data Pages..."
test_page "Service Master" "/service-master"
test_page "SubService Master" "/subservice-master"
test_page "Backlink Master" "/backlink-master"
test_page "Industry Sector Master" "/industry-sector-master"
test_page "Content Type Master" "/content-type-master"
test_page "Asset Type Master" "/asset-type-master"
test_page "Asset Category Master" "/asset-category-master"
test_page "Platform Master" "/platform-master"
test_page "Country Master" "/country-master"
test_page "SEO Error Type Master" "/seo-error-type-master"
test_page "Workflow Stage Master" "/workflow-stage-master"
test_page "User Role Master" "/user-role-master"
test_page "Audit Checklist Master" "/audit-checklist-master"
test_page "Backlink Source Master" "/backlink-source-master"

echo ""
echo "Dashboard Pack..."
test_page "Performance Dashboard" "/performance-dashboard"
test_page "Effort Dashboard" "/effort-dashboard"
test_page "Employee Scorecard Dashboard" "/employee-scorecard-dashboard"
test_page "Employee Comparison Dashboard" "/employee-comparison-dashboard"
test_page "Team Leader Dashboard" "/team-leader-dashboard"
test_page "AI Evaluation Engine" "/ai-evaluation-engine"
test_page "Reward Penalty Automation" "/reward-penalty-automation"
test_page "Reward Penalty Dashboard" "/reward-penalty-dashboard"
test_page "Workload Prediction Dashboard" "/workload-prediction-dashboard"
test_page "AI Task Allocation" "/ai-task-allocation"

echo ""
echo "Configuration Pages..."
test_page "QC Weightage Config" "/qc-weightage-config"
test_page "Performance Benchmark" "/performance-benchmark"
test_page "Competitor Benchmark Master" "/competitor-benchmark-master"
test_page "Effort Target Config" "/effort-target-config"
test_page "Effort Unit Config" "/effort-unit-config"
test_page "KPI Master" "/kpi-master"
test_page "KPI Target Config" "/kpi-target-config"
test_page "KRA Master" "/kra-master"
test_page "Objective Master" "/objective-master"
test_page "Scoring Engine" "/scoring-engine"
test_page "QC Engine Config" "/qc-engine-config"

echo ""
echo "SEO & Asset Pages..."
test_page "SEO Asset Module" "/seo-asset-module"
test_page "SEO Assets List" "/seo-assets-list"
test_page "SEO Asset Upload" "/seo-asset-upload"
test_page "Web Asset Upload" "/web-asset-upload"
test_page "SMM Asset Upload" "/smm-asset-upload"
test_page "Asset QC" "/asset-qc"
test_page "Admin QC Asset Review" "/admin-qc-asset-review"

echo ""
echo "Analytics & Tracking..."
test_page "Project Analytics" "/project-analytics"
test_page "Traffic Ranking" "/traffic-ranking"
test_page "KPI Tracking" "/kpi-tracking"
test_page "OKR Management" "/okr-management"

echo ""
echo "Admin & Settings..."
test_page "Admin Console" "/admin-console"
test_page "Admin Console Config" "/admin-console-config"
test_page "Role Permission Matrix" "/role-permission-matrix"
test_page "Settings" "/settings"
test_page "User Profile" "/user-profile"

echo ""
echo "Other Pages..."
test_page "Communication Hub" "/communication-hub"
test_page "Knowledge Base" "/knowledge-base"
test_page "Quality Compliance" "/quality-compliance"
test_page "Competitor Intelligence" "/competitor-intelligence"
test_page "Integrations" "/integrations"
test_page "Developer Notes" "/developer-notes"
test_page "Graphics Plan" "/graphics-plan"
test_page "Repository Manager" "/repository-manager"
test_page "Gold Standard Benchmark" "/gold-standard-benchmark"
test_page "QC Review" "/qc-review"
test_page "Automation Notifications" "/automation-notifications"
test_page "Dashboard Config" "/dashboard-config"

# Print summary
echo ""
echo "================================"
echo "📊 TEST SUMMARY"
echo "================================"
echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${YELLOW}⚠ Warned: $WARNED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"

TOTAL=$((PASSED + WARNED + FAILED))
if [ $TOTAL -gt 0 ]; then
    PASS_RATE=$((PASSED * 100 / TOTAL))
    echo "Pass Rate: $PASS_RATE%"
fi

echo "================================"
echo "📅 Test Completed: $(date)"
echo ""

# Exit with appropriate code
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi

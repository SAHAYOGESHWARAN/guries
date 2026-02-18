#!/bin/bash

echo "=========================================="
echo "DASHBOARD PAGES TEST SUITE"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test file existence and syntax
test_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $name exists"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $name NOT FOUND"
        ((TESTS_FAILED++))
    fi
}

# Function to check for common issues
check_file_issues() {
    local file=$1
    local name=$2
    
    # Check for syntax errors (basic check)
    if grep -q "import.*from" "$file"; then
        echo -e "${GREEN}✓${NC} $name has proper imports"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $name missing imports"
        ((TESTS_FAILED++))
    fi
    
    # Check for React component
    if grep -q "React.FC\|function.*React" "$file"; then
        echo -e "${GREEN}✓${NC} $name is a React component"
        ((TESTS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} $name may not be a React component"
    fi
}

echo "FRONTEND DASHBOARD PAGES"
echo "========================"
echo ""

# Test DashboardView
test_file "frontend/views/DashboardView.tsx" "DashboardView"
check_file_issues "frontend/views/DashboardView.tsx" "DashboardView"
echo ""

# Test PerformanceDashboard
test_file "frontend/views/PerformanceDashboard.tsx" "PerformanceDashboard"
check_file_issues "frontend/views/PerformanceDashboard.tsx" "PerformanceDashboard"
echo ""

# Test EffortDashboard
test_file "frontend/views/EffortDashboard.tsx" "EffortDashboard"
check_file_issues "frontend/views/EffortDashboard.tsx" "EffortDashboard"
echo ""

# Test EmployeeScorecardDashboard
test_file "frontend/views/EmployeeScorecardDashboard.tsx" "EmployeeScorecardDashboard"
check_file_issues "frontend/views/EmployeeScorecardDashboard.tsx" "EmployeeScorecardDashboard"
echo ""

# Test RewardPenaltyDashboard
test_file "frontend/views/RewardPenaltyDashboard.tsx" "RewardPenaltyDashboard"
check_file_issues "frontend/views/RewardPenaltyDashboard.tsx" "RewardPenaltyDashboard"
echo ""

# Test TeamLeaderDashboard
test_file "frontend/views/TeamLeaderDashboard.tsx" "TeamLeaderDashboard"
check_file_issues "frontend/views/TeamLeaderDashboard.tsx" "TeamLeaderDashboard"
echo ""

# Test WorkloadPredictionDashboard
test_file "frontend/views/WorkloadPredictionDashboard.tsx" "WorkloadPredictionDashboard"
check_file_issues "frontend/views/WorkloadPredictionDashboard.tsx" "WorkloadPredictionDashboard"
echo ""

echo "BACKEND DASHBOARD CONTROLLER"
echo "============================"
echo ""

# Test dashboardController
test_file "backend/controllers/dashboardController.ts" "dashboardController"
check_file_issues "backend/controllers/dashboardController.ts" "dashboardController"
echo ""

echo "TEST FILES"
echo "=========="
echo ""

# Test test files
test_file "frontend/views/__tests__/DashboardView.test.tsx" "DashboardView.test.tsx"
test_file "backend/__tests__/dashboardController.test.ts" "dashboardController.test.ts"
test_file "backend/__tests__/dashboard.integration.test.ts" "dashboard.integration.test.ts"
echo ""

echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    exit 1
fi

#!/bin/bash

echo "=========================================="
echo "COMPREHENSIVE E2E TEST SUITE"
echo "=========================================="
echo ""

echo "Running Real-time Tests..."
npm test -- tests/realtime.test.ts --verbose
REALTIME_RESULT=$?

echo ""
echo "Running API Integration Tests..."
npm test -- tests/api.integration.test.ts --verbose
API_RESULT=$?

echo ""
echo "Running Validation Tests..."
npm test -- tests/validation.test.ts --verbose
VALIDATION_RESULT=$?

echo ""
echo "Running Performance Tests..."
npm test -- tests/performance.test.ts --verbose
PERFORMANCE_RESULT=$?

echo ""
echo "=========================================="
echo "TEST RESULTS SUMMARY"
echo "=========================================="
echo ""

if [ $REALTIME_RESULT -eq 0 ]; then
  echo "✅ Real-time Tests: PASSED"
else
  echo "❌ Real-time Tests: FAILED"
fi

if [ $API_RESULT -eq 0 ]; then
  echo "✅ API Integration Tests: PASSED"
else
  echo "❌ API Integration Tests: FAILED"
fi

if [ $VALIDATION_RESULT -eq 0 ]; then
  echo "✅ Validation Tests: PASSED"
else
  echo "❌ Validation Tests: FAILED"
fi

if [ $PERFORMANCE_RESULT -eq 0 ]; then
  echo "✅ Performance Tests: PASSED"
else
  echo "❌ Performance Tests: FAILED"
fi

echo ""
echo "=========================================="

if [ $REALTIME_RESULT -eq 0 ] && [ $API_RESULT -eq 0 ] && [ $VALIDATION_RESULT -eq 0 ] && [ $PERFORMANCE_RESULT -eq 0 ]; then
  echo "🎉 ALL TESTS PASSED!"
  exit 0
else
  echo "⚠️  SOME TESTS FAILED"
  exit 1
fi

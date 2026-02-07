#!/bin/bash

# Quick Database Verification Test Script
# Run this to verify all database functionality

BASE_URL="https://guries.vercel.app"
RESULTS_FILE="test_results_$(date +%Y%m%d_%H%M%S).txt"

echo "=== Database Verification Test Suite ===" | tee $RESULTS_FILE
echo "Started: $(date)" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 1: Health Check
echo "Test 1: Health Check" | tee -a $RESULTS_FILE
echo "---" | tee -a $RESULTS_FILE
curl -s "$BASE_URL/api/health" | jq . | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 2: Connection
echo "Test 2: Database Connection" | tee -a $RESULTS_FILE
echo "---" | tee -a $RESULTS_FILE
curl -s "$BASE_URL/api/test-endpoints?test=connection" | jq . | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 3: Create Asset
echo "Test 3: Create Asset" | tee -a $RESULTS_FILE
echo "---" | tee -a $RESULTS_FILE
curl -s -X POST "$BASE_URL/api/test-endpoints?test=create-asset" \
  -H "Content-Type: application/json" \
  -d "{\"asset_name\":\"Test Asset $(date +%s)\"}" | jq . | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 4: Read Assets
echo "Test 4: Read Assets" | tee -a $RESULTS_FILE
echo "---" | tee -a $RESULTS_FILE
curl -s "$BASE_URL/api/test-endpoints?test=read-assets" | jq . | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 5: Persistence
echo "Test 5: Data Persistence" | tee -a $RESULTS_FILE
echo "---" | tee -a $RESULTS_FILE
curl -s "$BASE_URL/api/test-endpoints?test=persistence" | jq . | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 6: Schema Validation
echo "Test 6: Schema Validation" | tee -a $RESULTS_FILE
echo "---" | tee -a $RESULTS_FILE
curl -s "$BASE_URL/api/test-endpoints?test=schema" | jq . | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 7: Performance
echo "Test 7: Performance Test" | tee -a $RESULTS_FILE
echo "---" | tee -a $RESULTS_FILE
curl -s -X POST "$BASE_URL/api/test-endpoints?test=performance" | jq . | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

echo "=== Test Suite Complete ===" | tee -a $RESULTS_FILE
echo "Completed: $(date)" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE

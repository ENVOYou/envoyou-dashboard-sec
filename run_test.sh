#!/bin/bash
cd /home/husni/v1/envoyou-dashboard-sec
npx playwright test tests/e2e/auth.spec.ts --reporter=line > test_results.txt 2>&1
echo "Test completed. Results saved to test_results.txt"
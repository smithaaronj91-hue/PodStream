#!/bin/bash

# Voice Cloning Feature Integration Test Script
# This script tests the complete voice cloning workflow

set -e

echo "🧪 Voice Cloning Integration Test"
echo "=================================="
echo ""

# Configuration
API_URL="${API_URL:-http://localhost:5000/api}"
TTS_URL="${TTS_URL:-http://localhost:5002}"
TEST_USER_EMAIL="${TEST_USER_EMAIL:-test@example.com}"
TEST_USER_PASSWORD="${TEST_USER_PASSWORD:-TestPass123}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test result tracking
PASSED=0
FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    PASSED=$((PASSED + 1))
}

fail() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    FAILED=$((FAILED + 1))
}

info() {
    echo -e "${YELLOW}ℹ INFO:${NC} $1"
}

# Check if services are running
echo "1️⃣  Checking Services"
echo "-------------------"

# Check TTS Service
if curl -s -f "${TTS_URL}/health" > /dev/null 2>&1; then
    pass "TTS service is running at ${TTS_URL}"
else
    fail "TTS service not accessible at ${TTS_URL}"
    echo "   Please start the TTS service first: cd tts-service && ./start.sh"
    exit 1
fi

# Check Backend API
if curl -s -f "${API_URL}/health" > /dev/null 2>&1; then
    pass "Backend API is running at ${API_URL}"
else
    fail "Backend API not accessible at ${API_URL}"
    echo "   Please start the backend: cd backend && npm run dev"
    exit 1
fi

echo ""
echo "2️⃣  Testing Authentication"
echo "------------------------"

# Try to login (user should exist for testing)
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"${TEST_USER_PASSWORD}\"}" 2>&1)

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    pass "Authentication successful"
    info "Token obtained: ${TOKEN:0:20}..."
else
    fail "Authentication failed"
    info "Please create a test user first or update TEST_USER_EMAIL and TEST_USER_PASSWORD"
    info "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""
echo "3️⃣  Testing Voice Health Endpoint"
echo "--------------------------------"

HEALTH_RESPONSE=$(curl -s "${API_URL}/voice/health")
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    pass "Voice health check successful"
    info "Response: $HEALTH_RESPONSE"
else
    fail "Voice health check failed"
    info "Response: $HEALTH_RESPONSE"
fi

echo ""
echo "4️⃣  Testing Voice Sample Upload"
echo "------------------------------"

# Create a test audio file (very simple, won't work for actual cloning)
TEST_AUDIO_DIR="/tmp/podstream_test"
mkdir -p "$TEST_AUDIO_DIR"
TEST_AUDIO_FILE="${TEST_AUDIO_DIR}/test_sample.wav"

# Check if we can create a test file
if command -v ffmpeg &> /dev/null; then
    info "Generating test audio file with ffmpeg..."
    ffmpeg -f lavfi -i "sine=frequency=440:duration=15" -ac 1 -ar 22050 "$TEST_AUDIO_FILE" -y > /dev/null 2>&1
    
    if [ -f "$TEST_AUDIO_FILE" ]; then
        pass "Test audio file created"
        
        # Try to upload
        UPLOAD_RESPONSE=$(curl -s -X POST "${API_URL}/voice/upload" \
            -H "Authorization: Bearer ${TOKEN}" \
            -F "audio=@${TEST_AUDIO_FILE}")
        
        if echo "$UPLOAD_RESPONSE" | grep -q "sample"; then
            SAMPLE_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
            pass "Voice sample uploaded successfully (ID: $SAMPLE_ID)"
            info "Response: $UPLOAD_RESPONSE"
        else
            fail "Voice sample upload failed"
            info "Response: $UPLOAD_RESPONSE"
        fi
    else
        fail "Failed to create test audio file"
    fi
else
    info "ffmpeg not available - skipping upload test"
    info "Install ffmpeg to run complete tests"
fi

echo ""
echo "5️⃣  Testing Voice Models List"
echo "---------------------------"

MODELS_RESPONSE=$(curl -s -X GET "${API_URL}/voice/models" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$MODELS_RESPONSE" | grep -q "models"; then
    pass "Voice models list retrieved"
    info "Response: ${MODELS_RESPONSE:0:200}..."
else
    fail "Voice models list failed"
    info "Response: $MODELS_RESPONSE"
fi

echo ""
echo "6️⃣  Testing Voice Synthesis History"
echo "---------------------------------"

HISTORY_RESPONSE=$(curl -s -X GET "${API_URL}/voice/history" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$HISTORY_RESPONSE" | grep -q "history"; then
    pass "Voice synthesis history retrieved"
    info "Response: ${HISTORY_RESPONSE:0:200}..."
else
    fail "Voice synthesis history failed"
    info "Response: $HISTORY_RESPONSE"
fi

echo ""
echo "7️⃣  Testing Rate Limiting"
echo "-----------------------"

info "Checking rate limit headers..."
RATE_LIMIT_RESPONSE=$(curl -s -i -X GET "${API_URL}/voice/models" \
    -H "Authorization: Bearer ${TOKEN}" 2>&1 | head -20)

if echo "$RATE_LIMIT_RESPONSE" | grep -qi "x-ratelimit"; then
    pass "Rate limiting headers present"
else
    info "Rate limiting headers not found (may not be exposed in response)"
fi

echo ""
echo "8️⃣  Testing Authentication Required"
echo "---------------------------------"

UNAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/voice/models" 2>&1)
HTTP_CODE=$(echo "$UNAUTH_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "401" ]; then
    pass "Authentication properly enforced (401 returned)"
else
    fail "Authentication not properly enforced (got $HTTP_CODE, expected 401)"
fi

echo ""
echo "9️⃣  Testing Invalid File Upload"
echo "-----------------------------"

# Try to upload a text file (should fail)
TEST_TEXT_FILE="${TEST_AUDIO_DIR}/test.txt"
echo "This is not an audio file" > "$TEST_TEXT_FILE"

INVALID_UPLOAD=$(curl -s -X POST "${API_URL}/voice/upload" \
    -H "Authorization: Bearer ${TOKEN}" \
    -F "audio=@${TEST_TEXT_FILE}")

if echo "$INVALID_UPLOAD" | grep -qi "invalid\|unsupported\|error"; then
    pass "Invalid file properly rejected"
else
    fail "Invalid file not properly rejected"
    info "Response: $INVALID_UPLOAD"
fi

echo ""
echo "🔟 Testing Missing Parameters"
echo "---------------------------"

# Try to synthesize without required parameters
MISSING_PARAMS=$(curl -s -X POST "${API_URL}/voice/synthesize" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{}')

if echo "$MISSING_PARAMS" | grep -qi "required\|error"; then
    pass "Missing parameters properly validated"
else
    fail "Missing parameters not properly validated"
    info "Response: $MISSING_PARAMS"
fi

# Cleanup
echo ""
echo "Cleanup"
echo "-------"
rm -rf "$TEST_AUDIO_DIR"
pass "Test files cleaned up"

# Summary
echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

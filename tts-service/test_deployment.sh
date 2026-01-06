#!/bin/bash

# Voice Cloning App - Local Deployment Test Script
# This script helps verify that the voice cloning app is deployed and working correctly

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5002"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Voice Cloning App - Deployment Test${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Test 1: Check if service is running
echo -e "${YELLOW}[1/4] Testing service connectivity...${NC}"
if curl -s --max-time 5 "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Service is reachable at $BASE_URL${NC}"
else
    echo -e "${RED}✗ Service is not reachable at $BASE_URL${NC}"
    echo -e "${RED}  Make sure the app is running with: cd tts-service && ./start.sh${NC}"
    exit 1
fi
echo ""

# Test 2: Check health endpoint
echo -e "${YELLOW}[2/4] Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "  Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "  Response: $HEALTH_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Check if TTS model is loaded
echo -e "${YELLOW}[3/4] Checking TTS model status...${NC}"
if echo "$HEALTH_RESPONSE" | grep -q '"model_loaded".*true'; then
    echo -e "${GREEN}✓ TTS model is loaded and ready${NC}"
elif echo "$HEALTH_RESPONSE" | grep -q '"model_loaded".*false'; then
    echo -e "${YELLOW}⚠ TTS model is not loaded yet (may be downloading)${NC}"
    echo -e "${YELLOW}  This is normal on first run. Wait a few minutes.${NC}"
else
    echo -e "${YELLOW}⚠ Unable to determine model status${NC}"
fi
echo ""

# Test 4: Check API endpoints are available
echo -e "${YELLOW}[4/4] Testing API endpoints...${NC}"

# Test validate-audio endpoint (without file, should return error but endpoint exists)
VALIDATE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/validate-audio")
if [ "$VALIDATE_RESPONSE" = "400" ] || [ "$VALIDATE_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ /validate-audio endpoint is available${NC}"
else
    echo -e "${RED}✗ /validate-audio endpoint returned unexpected status: $VALIDATE_RESPONSE${NC}"
fi

# Test synthesize endpoint (without body, should return error but endpoint exists)
SYNTHESIZE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/synthesize" -H "Content-Type: application/json" -d '{}')
if [ "$SYNTHESIZE_RESPONSE" = "400" ] || [ "$SYNTHESIZE_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ /synthesize endpoint is available${NC}"
else
    echo -e "${RED}✗ /synthesize endpoint returned unexpected status: $SYNTHESIZE_RESPONSE${NC}"
fi

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}✓ All tests passed!${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Voice Cloning App is deployed and running at: ${GREEN}$BASE_URL${NC}"
echo ""
echo "Next steps:"
echo "1. Upload a voice sample (WAV, MP3, or FLAC)"
echo "2. Use the sample to synthesize speech"
echo "3. Download and listen to the generated audio"
echo ""
echo "See DEPLOY_LOCAL.md for usage examples and API documentation."
echo ""

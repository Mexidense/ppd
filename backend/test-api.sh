#!/bin/bash

# API Testing Script for PPD (Pay-Per-Document)
# This script tests all available API endpoints

BASE_URL="http://localhost:3000/api"
TEST_FILE="test-document.txt"

echo "🧪 PPD API Test Script"
echo "======================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create a test file if it doesn't exist
if [ ! -f "$TEST_FILE" ]; then
    echo "Creating test file..."
    echo "This is a test document for PPD API testing." > $TEST_FILE
fi

echo "${YELLOW}1. Testing GET /api/documents (List all documents)${NC}"
echo "---------------------------------------------------"
curl -s $BASE_URL/documents | jq
echo -e "\n"

echo "${YELLOW}2. Testing POST /api/documents/upload (Upload document)${NC}"
echo "--------------------------------------------------------"
UPLOAD_RESPONSE=$(curl -s -X POST $BASE_URL/documents/upload \
  -F "file=@$TEST_FILE" \
  -F "cost=9.99")
echo $UPLOAD_RESPONSE | jq

# Extract document ID from upload response
DOC_ID=$(echo $UPLOAD_RESPONSE | jq -r '.document.id')
echo -e "\n${GREEN}✓ Document ID: $DOC_ID${NC}\n"

if [ "$DOC_ID" != "null" ] && [ "$DOC_ID" != "" ]; then
    echo "${YELLOW}3. Testing GET /api/documents/[id] (Get specific document)${NC}"
    echo "-----------------------------------------------------------"
    curl -s $BASE_URL/documents/$DOC_ID | jq
    echo -e "\n"

    echo "${YELLOW}4. Testing POST /api/purchases (Create purchase)${NC}"
    echo "------------------------------------------------"
    PURCHASE_RESPONSE=$(curl -s -X POST $BASE_URL/purchases \
      -H "Content-Type: application/json" \
      -d "{
        \"address_owner\": \"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\",
        \"doc_id\": \"$DOC_ID\",
        \"transaction_id\": \"0x$(openssl rand -hex 16)\"
      }")
    echo $PURCHASE_RESPONSE | jq
    echo -e "\n"

    echo "${YELLOW}5. Testing GET /api/purchases (List all purchases)${NC}"
    echo "--------------------------------------------------"
    curl -s $BASE_URL/purchases | jq
    echo -e "\n"

    echo "${YELLOW}6. Testing GET /api/purchases/owner/[address] (Get purchases by owner)${NC}"
    echo "-----------------------------------------------------------------------"
    curl -s $BASE_URL/purchases/owner/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb | jq
    echo -e "\n"

    echo "${YELLOW}7. Testing DELETE /api/documents/[id] (Delete document)${NC}"
    echo "-------------------------------------------------------"
    read -p "Do you want to delete the test document? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        curl -s -X DELETE $BASE_URL/documents/$DOC_ID | jq
        echo -e "\n${GREEN}✓ Document deleted${NC}\n"
    else
        echo -e "\n${YELLOW}⊘ Skipped deletion${NC}\n"
    fi
else
    echo -e "${RED}✗ Failed to upload document. Make sure:${NC}"
    echo "  1. Docker is running (docker-compose up -d)"
    echo "  2. Next.js dev server is running (npm run dev)"
    echo "  3. Environment variables are set in .env.local"
fi

echo ""
echo "${GREEN}✓ API testing complete!${NC}"
echo ""
echo "Next steps:"
echo "  - Check MinIO Console: http://localhost:9001"
echo "  - View API docs: backend/API.md"


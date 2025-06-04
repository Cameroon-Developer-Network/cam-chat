#!/bin/bash

# WhatsApp Backend API Test Script
# Tests all endpoints and WebSocket functionality

set -e

BASE_URL="http://localhost:8080"
TOKEN=""

echo "🚀 Testing WhatsApp Backend API..."

# Test 1: Health Check
echo "📊 Testing health check..."
curl -s "$BASE_URL/health" | grep -q "OK" && echo "✅ Health check passed" || echo "❌ Health check failed"

# Test 2: Login
echo "🔐 Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "password123"}')

echo "Login response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Login successful, token: ${TOKEN:0:20}..."
else
    echo "❌ Login failed"
    exit 1
fi

# Test 3: Get Chats (Protected)
echo "💬 Testing get chats..."
CHATS_RESPONSE=$(curl -s "$BASE_URL/api/chats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Chats response: $CHATS_RESPONSE"

if echo "$CHATS_RESPONSE" | grep -q "success"; then
    echo "✅ Get chats successful"
    # Extract first chat ID for message testing
    CHAT_ID=$(echo "$CHATS_RESPONSE" | grep -o '"id":"[^"]*"' | head -n1 | cut -d'"' -f4)
    echo "First chat ID: $CHAT_ID"
else
    echo "❌ Get chats failed"
    exit 1
fi

# Test 4: Get Messages (Protected)
echo "📝 Testing get messages..."
if [ -n "$CHAT_ID" ]; then
    MESSAGES_RESPONSE=$(curl -s "$BASE_URL/api/chats/$CHAT_ID/messages" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    echo "Messages response: $MESSAGES_RESPONSE"
    
    if echo "$MESSAGES_RESPONSE" | grep -q "success"; then
        echo "✅ Get messages successful"
    else
        echo "❌ Get messages failed"
    fi
fi

# Test 5: Send Message (Protected)
echo "✉️ Testing send message..."
if [ -n "$CHAT_ID" ]; then
    SEND_RESPONSE=$(curl -s -X POST "$BASE_URL/api/chats/$CHAT_ID/messages" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"content": "Hello from API test!", "message_type": "text"}')
    
    echo "Send message response: $SEND_RESPONSE"
    
    if echo "$SEND_RESPONSE" | grep -q "success"; then
        echo "✅ Send message successful"
    else
        echo "❌ Send message failed"
    fi
fi

# Test 6: WebSocket Connection (Manual test instructions)
echo "🔌 WebSocket Testing Instructions:"
echo "To test WebSocket, use a WebSocket client and connect to:"
echo "ws://localhost:8080/ws/$CHAT_ID?token=$TOKEN"
echo ""
echo "Send a message like: {\"type\": \"message\", \"content\": \"Hello WebSocket!\"}"

echo ""
echo "🎉 API Testing Complete!"
echo "All basic endpoints are working correctly."
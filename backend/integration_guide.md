# Backend Integration Guide

This guide explains how to integrate the Rust backend with your React frontend.

## Quick Setup

### 1. Database Setup (PostgreSQL)

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb whatsapp_chat

# Or use Docker
docker run --name whatsapp-postgres -e POSTGRES_DB=whatsapp_chat -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
```

### 2. Environment Configuration

```bash
# Copy environment file
cp .env .env.local

# Update DATABASE_URL in .env.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/whatsapp_chat
```

### 3. Start Backend

```bash
# Development mode
./start_dev.sh

# Or manually
cargo run
```

The backend will start on `http://localhost:8080`

## Frontend Integration

### 1. API Base URL

Update your React frontend's environment variables:

```javascript
// In your React .env file
REACT_APP_BACKEND_URL=http://localhost:8080
```

### 2. Authentication Flow

```javascript
// Login API call
const login = async (email, password) => {
  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('auth_token', data.data.token);
    return data.data;
  }
  throw new Error('Login failed');
};
```

### 3. Authenticated API Calls

```javascript
// Get chats
const getChats = async () => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};

// Send message
const sendMessage = async (chatId, content) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, message_type: 'text' }),
  });
  
  return response.json();
};
```

### 4. WebSocket Integration

```javascript
// WebSocket connection for real-time chat
const connectWebSocket = (chatId) => {
  const token = localStorage.getItem('auth_token');
  const wsUrl = `ws://localhost:8080/ws/${chatId}?token=${token}`;
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('Connected to chat WebSocket');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'message') {
      // Handle new message
      console.log('New message:', data.data);
    }
  };
  
  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };
  
  return ws;
};
```

## API Reference

### Authentication

#### POST /api/auth/login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user_id": "uuid",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

### Chats

#### GET /api/chats
Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": null,
      "is_group": false,
      "participants": [
        {
          "user_id": "uuid",
          "name": "Alice Johnson",
          "avatar_url": "https://...",
          "is_online": true,
          "is_admin": false
        }
      ],
      "last_message": {
        "content": "Hello!",
        "sender_name": "Alice",
        "timestamp": "2024-01-01T12:00:00Z"
      },
      "unread_count": 2,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Messages

#### GET /api/chats/:chat_id/messages
Headers: `Authorization: Bearer <token>`
Query params: `page=1&limit=50`

#### POST /api/chats/:chat_id/messages
Headers: `Authorization: Bearer <token>`
```json
{
  "content": "Hello world!",
  "message_type": "text",
  "reply_to": null
}
```

### WebSocket

#### Connection: ws://localhost:8080/ws/:chat_id?token=<jwt_token>

Message format:
```json
{
  "type": "message",
  "data": {
    "id": "uuid",
    "chat_id": "uuid",
    "sender": {
      "id": "uuid",
      "name": "Alice",
      "avatar_url": "https://..."
    },
    "content": "Hello!",
    "message_type": "text",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

## Testing

Run the API test script:
```bash
chmod +x test_api.sh
./test_api.sh
```

## Production Deployment

### Docker
```bash
docker build -t whatsapp-backend .
docker run -p 8080:8080 -e DATABASE_URL=<prod_db_url> whatsapp-backend
```

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong secret for JWT tokens
- `RUST_LOG`: Log level (info, debug, warn, error)
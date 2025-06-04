# WhatsApp-Style Chat Backend

A high-performance Rust backend for a WhatsApp-style chat application built with Axum, PostgreSQL, and WebSockets.

## Features

- **REST API**: Login, fetch chats, fetch/send messages
- **Real-time Chat**: WebSocket connections with message broadcasting
- **Authentication**: JWT token-based auth middleware
- **Database**: PostgreSQL with SQLx migrations
- **Performance**: Async/await with Tokio runtime
- **CORS Support**: Cross-origin requests for frontend integration

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login (returns JWT token)

### Chats
- `GET /api/chats` - Get user's chats (requires auth)
- `GET /api/chats/:chat_id/messages` - Get messages for a chat (requires auth)
- `POST /api/chats/:chat_id/messages` - Send a message (requires auth)

### WebSocket
- `GET /ws/:chat_id?token=<jwt_token>` - Real-time chat connection

### Health
- `GET /health` - Health check endpoint

## Quick Start

### Prerequisites
- Rust 1.75+
- PostgreSQL 13+

### Setup

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up PostgreSQL database:**
   ```bash
   createdb whatsapp_chat
   ```

4. **Run migrations:**
   ```bash
   cargo run
   # Migrations run automatically on startup
   ```

5. **Start the server:**
   ```bash
   cargo run
   ```

The server will start on `http://localhost:8080`

## Docker Deployment

```bash
# Build the image
docker build -t whatsapp-backend .

# Run with environment variables
docker run -p 8080:8080 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/dbname \
  whatsapp-backend
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `RUST_LOG` - Log level (info, debug, warn, error)
- `JWT_SECRET` - Secret key for JWT tokens

## Project Structure

```
src/
├── main.rs          # Application entry point
├── auth/            # Authentication & JWT handling
├── db/              # Database connection & migrations
├── models/          # Data models (User, Chat, Message)
├── routes/          # REST API endpoints
└── ws/              # WebSocket handling

migrations/          # SQL migration files
```

## Performance Features

- **Connection Pooling**: SQLx connection pool for database efficiency
- **Async Operations**: Non-blocking I/O with Tokio
- **WebSocket Broadcasting**: Efficient message distribution
- **JWT Authentication**: Stateless token validation
- **Database Indexing**: Optimized queries for chat operations

## Development

### Running Tests
```bash
cargo test
```

### Database Migrations
Migrations are in the `migrations/` directory and run automatically on startup.

### Mock Data
The backend creates mock users and chats automatically for development/demo purposes.

## Integration with Frontend

The backend is designed to work with the React frontend:

1. **Authentication**: Frontend sends login requests, receives JWT tokens
2. **REST API**: Frontend makes authenticated requests for chats/messages
3. **WebSocket**: Real-time message updates via WebSocket connection
4. **CORS**: Configured to allow requests from `http://localhost:3000`
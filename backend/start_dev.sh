#!/bin/bash

# Development startup script for WhatsApp Backend

set -e

echo "🚀 Starting WhatsApp Backend Development Environment..."

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not installed. Installing..."
    
    # Detect OS and install PostgreSQL
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install postgresql
    else
        echo "❌ Unsupported OS. Please install PostgreSQL manually."
        exit 1
    fi
fi

# Start PostgreSQL service
echo "📊 Starting PostgreSQL..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo service postgresql start
elif [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start postgresql
fi

# Create database if it doesn't exist
echo "🗄️  Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE whatsapp_chat;" 2>/dev/null || echo "Database already exists"

# Set up environment
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env .env.local
    echo "Created .env.local - please update with your settings"
fi

# Build and run
echo "🔨 Building application..."
cargo build

echo "🎯 Starting server..."
echo "API will be available at: http://localhost:8080"
echo "Health check: curl http://localhost:8080/health"
echo ""

# Run the application
RUST_LOG=info cargo run
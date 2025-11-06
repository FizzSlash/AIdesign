#!/bin/bash

# Database initialization script for AI Email Designer

echo "🔧 Initializing AI Email Designer Database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

# Check if database exists
DB_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='ai_email_designer'")

if [ "$DB_EXISTS" = "1" ]; then
    echo "⚠️  Database 'ai_email_designer' already exists."
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Dropping existing database..."
        dropdb -U postgres ai_email_designer
    else
        echo "✅ Using existing database."
        exit 0
    fi
fi

# Create database
echo "📦 Creating database..."
createdb -U postgres ai_email_designer

if [ $? -ne 0 ]; then
    echo "❌ Failed to create database. Make sure PostgreSQL is running."
    exit 1
fi

# Install pgvector extension
echo "🔌 Installing pgvector extension..."
psql -U postgres ai_email_designer -c "CREATE EXTENSION IF NOT EXISTS vector;" > /dev/null

# Run schema migration
echo "📋 Running schema migration..."
psql -U postgres ai_email_designer < src/db/schema.sql > /dev/null

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations."
    exit 1
fi

# Verify tables
TABLE_COUNT=$(psql -U postgres ai_email_designer -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")

echo "✅ Database initialized successfully!"
echo "   - Database: ai_email_designer"
echo "   - Tables created: $TABLE_COUNT"
echo ""
echo "📝 Next steps:"
echo "   1. Copy .env.example to .env and fill in your API keys"
echo "   2. Run: npm install"
echo "   3. Run: npm run dev"

exit 0


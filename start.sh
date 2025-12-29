#!/bin/bash

# PodStream Quick Start Script

echo "🎙️ PodStream - Premium Podcast Platform"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker from https://www.docker.com"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Backend .env created"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend .env.local file..."
    cp frontend/.env.local.example frontend/.env.local
    echo "✅ Frontend .env.local created"
fi

echo ""
echo "🚀 Starting PodStream services..."
echo ""

# Build and start containers
docker-compose up --build

echo ""
echo "✅ PodStream is running!"
echo ""
echo "📍 Access points:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000/api"
echo "   Database:  localhost:5432"
echo ""
echo "📚 Documentation:"
echo "   Setup:     docs/SETUP.md"
echo "   API:       docs/API.md"
echo "   Database:  docs/DATABASE.md"
echo ""

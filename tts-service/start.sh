#!/bin/bash

# Voice Cloning TTS Service Start Script

echo "🎤 Starting Voice Cloning TTS Service..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Load environment variables safely
if [ -f ".env" ]; then
    set -o allexport
    source .env
    set +o allexport
fi

# Create necessary directories
mkdir -p /tmp/podstream/voice_uploads
mkdir -p /tmp/podstream/voice_models
mkdir -p /tmp/podstream/voice_output

# Start the service
echo "🚀 Starting TTS service on port ${TTS_SERVICE_PORT:-5002}..."
python app.py

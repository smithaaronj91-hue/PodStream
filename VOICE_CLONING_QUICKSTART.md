# Voice Cloning Feature Quick Start Guide

## Overview

This guide will help you quickly set up and test the voice cloning feature in PodStream.

## Prerequisites

- Node.js 16+ and npm
- Python 3.8+ and pip
- PostgreSQL database
- FFmpeg (for audio processing)
- At least 4GB RAM (for TTS model)
- Internet connection (first run downloads TTS model)

## Quick Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Python TTS Service

```bash
cd tts-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env
```

### 3. Database Setup

Run the database migration to add voice cloning tables:

```bash
# From the backend directory
cd backend
npm run migrate
```

Or manually execute the SQL from `backend/src/db/schema.sql`:

```sql
-- Voice samples table
CREATE TABLE IF NOT EXISTS voice_samples (...);

-- Voice models table
CREATE TABLE IF NOT EXISTS voice_models (...);

-- Voice synthesis history table
CREATE TABLE IF NOT EXISTS voice_synthesis_history (...);
```

### 4. Configure Environment Variables

Update your backend `.env` file:

```env
# Add these to backend/.env
TTS_SERVICE_URL=http://localhost:5001
TTS_TIMEOUT=60000
VOICE_UPLOAD_DIR=/tmp/podstream/voice_uploads
MAX_VOICE_FILE_SIZE=10485760
```

### 5. Start Services

**Terminal 1 - Start TTS Service:**
```bash
cd tts-service
./start.sh
```

**Terminal 2 - Start Backend:**
```bash
cd backend
npm run dev
```

## Testing the Feature

### 1. Check Health

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "healthy",
  "tts_model_loaded": true,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Upload Voice Sample

First, get a JWT token by logging in:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

Save the token, then upload a voice sample:

```bash
curl -X POST http://localhost:5000/api/voice/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@path/to/voice_sample.wav"
```

Expected response:
```json
{
  "message": "Voice sample uploaded successfully",
  "sample": {
    "id": 1,
    "filename": "voice_sample.wav",
    "duration": 45.5,
    "format": "wav",
    "status": "uploaded",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. Create Voice Model

```bash
curl -X POST http://localhost:5000/api/voice/clone \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sample_id": 1,
    "name": "My Voice",
    "description": "Test voice model",
    "language": "en"
  }'
```

### 4. Synthesize Speech

```bash
curl -X POST http://localhost:5000/api/voice/synthesize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": 1,
    "text": "Hello! This is a test of voice cloning.",
    "output_format": "mp3"
  }'
```

### 5. List Your Voice Models

```bash
curl -X GET http://localhost:5000/api/voice/models \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Sample Voice Recording Tips

For best results when creating voice samples:

1. **Duration**: Record 30-60 seconds of speech
2. **Content**: Read varied sentences with different emotions
3. **Environment**: Quiet room, no background noise
4. **Quality**: Use a good microphone if possible
5. **Format**: WAV format recommended (44.1kHz or 48kHz)

### Sample Recording Script

Record yourself reading this text:

> "Hello, my name is [Your Name]. I'm excited to demonstrate voice cloning technology. 
> This sample includes various emotions and speaking styles. 
> Sometimes I speak quickly and energetically! 
> Other times, I speak slowly and thoughtfully. 
> Questions can sound different, right? 
> Statements sound more confident and final. 
> Thank you for listening to this voice sample."

## Troubleshooting

### TTS Service Won't Start

**Problem**: `ModuleNotFoundError: No module named 'TTS'`

**Solution**:
```bash
cd tts-service
source venv/bin/activate
pip install -r requirements.txt
```

### Model Download Issues

**Problem**: "Failed to download TTS model"

**Solution**:
- Check internet connection
- Ensure sufficient disk space (~2GB for model)
- Try downloading manually:
```python
from TTS.api import TTS
TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")
```

### Audio Upload Fails

**Problem**: "Invalid file type"

**Solution**:
- Ensure file is WAV, MP3, or FLAC
- Check file is not corrupted
- Verify file size is under 10MB

### Database Connection Error

**Problem**: "Connection to database failed"

**Solution**:
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Run database migrations

### TTS Service Not Responding

**Problem**: Backend can't connect to TTS service

**Solution**:
1. Check TTS service is running: `curl http://localhost:5001/health`
2. Verify TTS_SERVICE_URL in backend `.env`
3. Check firewall settings

## Performance Notes

- **First synthesis**: May take 10-30 seconds (model initialization)
- **Subsequent syntheses**: 2-5 seconds for short texts
- **Voice model creation**: 5-15 seconds depending on sample length
- **RAM usage**: ~2-3GB for TTS model

## Next Steps

1. Read the full API documentation: `docs/VOICE_CLONING.md`
2. Explore advanced features (batch processing, multi-language)
3. Integrate voice cloning into your podcast workflow
4. Set up production deployment with GPU acceleration

## Getting Help

- Check logs in TTS service console
- Review backend logs for API errors
- Consult `docs/VOICE_CLONING.md` for detailed API reference
- Report issues on GitHub

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/voice/health` | GET | Check TTS service status |
| `/api/voice/upload` | POST | Upload voice sample |
| `/api/voice/clone` | POST | Create voice model |
| `/api/voice/synthesize` | POST | Generate speech |
| `/api/voice/models` | GET | List voice models |
| `/api/voice/models/:id` | GET | Get model details |
| `/api/voice/models/:id` | PATCH | Update model |
| `/api/voice/models/:id` | DELETE | Delete model |
| `/api/voice/history` | GET | Synthesis history |

For complete API documentation with examples, see `docs/VOICE_CLONING.md`.

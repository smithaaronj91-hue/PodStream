# Local Deployment Guide - Voice Cloning App

This guide will help you deploy the Voice Cloning application on your local machine.

## Prerequisites Check

Before starting, ensure you have:

- ✅ **Python 3.8+** installed
- ✅ **FFmpeg** installed (required for audio processing)
- ✅ **4GB+ RAM** available
- ✅ **~2GB disk space** for model download
- ✅ **Internet connection** (for first-time model download)

### Install Prerequisites

#### On Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install python3 python3-pip python3-venv ffmpeg
```

#### On macOS:
```bash
brew install python3 ffmpeg
```

#### On Windows:
1. Install Python from https://python.org
2. Install FFmpeg from https://ffmpeg.org/download.html

---

## Step-by-Step Deployment

### Step 1: Navigate to Application Directory

```bash
cd tts-service
```

### Step 2: Create Virtual Environment

```bash
python3 -m venv venv
```

This creates an isolated Python environment for the application.

### Step 3: Activate Virtual Environment

**On Linux/macOS:**
```bash
source venv/bin/activate
```

**On Windows:**
```cmd
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Flask (web framework)
- Coqui TTS (voice cloning AI)
- pydub (audio processing)
- librosa (audio analysis)
- And other required packages

**Note:** First installation may take 5-10 minutes.

### Step 5: Configure Environment (Optional)

```bash
cp .env.example .env
```

Edit `.env` if you need custom settings:
```bash
nano .env  # or use your preferred editor
```

Default settings work fine for most cases.

### Step 6: Start the Application

**Option A: Using the start script (Recommended)**
```bash
chmod +x start.sh  # Make it executable (first time only)
./start.sh
```

**Option B: Direct Python execution**
```bash
python app.py
```

### Step 7: Verify Deployment

Open your browser and go to:
```
http://localhost:5002/health
```

You should see:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2024-01-05T12:00:00Z"
}
```

---

## Usage Examples

### 1. Upload Voice Sample

```bash
curl -X POST http://localhost:5002/validate-audio \
  -F "audio=@your_voice_sample.wav"
```

### 2. Synthesize Speech

```bash
curl -X POST http://localhost:5002/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of voice cloning",
    "voice_sample_path": "/path/to/processed/sample.wav",
    "output_format": "mp3",
    "language": "en"
  }'
```

### 3. Download Generated Audio

```bash
curl -O http://localhost:5002/download/output_12345.mp3
```

---

## Testing the Deployment

### Quick Test Script

Save this as `test_deployment.sh`:

```bash
#!/bin/bash

echo "Testing Voice Cloning App Deployment..."

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s http://localhost:5002/health | jq .

# Test 2: Upload test audio (if you have a sample)
if [ -f "test_sample.wav" ]; then
    echo "2. Testing audio upload..."
    curl -s -X POST http://localhost:5002/validate-audio \
      -F "audio=@test_sample.wav" | jq .
else
    echo "2. Skipping audio upload test (no test_sample.wav found)"
fi

echo "✅ Deployment test complete!"
```

Run it:
```bash
chmod +x test_deployment.sh
./test_deployment.sh
```

---

## Stopping the Application

Press `Ctrl+C` in the terminal where the app is running.

---

## Restarting the Application

After stopping:

```bash
cd tts-service
source venv/bin/activate  # Activate virtual environment
./start.sh                 # Start the app
```

---

## Troubleshooting

### Issue: "python3: command not found"
**Solution:** Install Python 3.8 or higher.

### Issue: "ffmpeg: command not found"
**Solution:** Install FFmpeg:
- Ubuntu/Debian: `sudo apt-get install ffmpeg`
- macOS: `brew install ffmpeg`
- Windows: Download from ffmpeg.org

### Issue: "ModuleNotFoundError: No module named 'TTS'"
**Solution:** Activate virtual environment and reinstall:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Model fails to load
**Solution:** 
1. Check internet connection (needed for first download)
2. Ensure ~2GB disk space available
3. Check logs for specific error messages

### Issue: "Port 5002 already in use"
**Solution:** 
1. Find process using port: `lsof -i :5002` (Mac/Linux) or `netstat -ano | findstr :5002` (Windows)
2. Kill the process or use different port in `.env`

### Issue: Out of memory during synthesis
**Solution:** 
- Close other applications
- Ensure at least 4GB RAM available
- Try shorter text samples

---

## Directory Structure

After deployment, you'll see:

```
tts-service/
├── venv/                    # Virtual environment (created)
├── app.py                   # Main application
├── requirements.txt         # Dependencies
├── start.sh                # Start script
├── .env                    # Configuration (created)
├── .env.example            # Configuration template
├── Dockerfile              # Docker config (not used for local)
├── README.md               # Integration docs
├── README_STANDALONE.md    # Standalone docs
└── DEPLOY_LOCAL.md         # This file
```

And temporary directories:
```
/tmp/podstream/
├── voice_uploads/          # Uploaded audio files
├── voice_models/           # Processed voice models
└── voice_output/           # Generated audio files
```

---

## Performance Notes

### First Run
- **Model Download**: ~2GB (one-time, 5-15 minutes depending on connection)
- **Model Loading**: 10-30 seconds
- **First Synthesis**: 10-30 seconds

### Subsequent Runs
- **Model Loading**: 5-10 seconds (already downloaded)
- **Synthesis**: 2-5 seconds per request

---

## Security Considerations

For local development:
- ✅ Application runs on localhost only
- ✅ No external access by default
- ✅ File validation and sanitization enabled
- ✅ Path traversal prevention active

For production deployment, consider:
- Add authentication
- Use HTTPS
- Configure firewall rules
- Set up proper logging
- Regular security updates

---

## Next Steps

1. **Test the API**: Use curl or Postman to test endpoints
2. **Prepare voice samples**: Record 30-60 second audio clips
3. **Read the API docs**: See README_STANDALONE.md for detailed API reference
4. **Monitor resources**: Keep an eye on RAM usage during synthesis

---

## Support

If you encounter issues:

1. Check the application logs in the terminal
2. Review the troubleshooting section above
3. Ensure all prerequisites are met
4. Verify FFmpeg is installed and working: `ffmpeg -version`

---

## Success Checklist

- [ ] Prerequisites installed (Python, FFmpeg)
- [ ] Virtual environment created
- [ ] Dependencies installed successfully
- [ ] Application starts without errors
- [ ] Health endpoint returns "healthy"
- [ ] Can upload voice samples
- [ ] Can synthesize speech
- [ ] Generated audio plays correctly

---

**Deployment Status**: 🟢 Ready for Local Development

Access your voice cloning app at: **http://localhost:5002**

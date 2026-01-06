# Quick Start - Local Deployment

Get the Voice Cloning app running on your machine in 5 minutes!

## 1. Install Prerequisites

**Check if you have Python and FFmpeg:**
```bash
python3 --version  # Should be 3.8 or higher
ffmpeg -version    # Should show FFmpeg version
```

**If missing, install them:**

- **Ubuntu/Debian:** `sudo apt-get install python3 python3-venv ffmpeg`
- **macOS:** `brew install python3 ffmpeg`
- **Windows:** Download from python.org and ffmpeg.org

## 2. Deploy the App

Run this ONE command from the project root:

```bash
cd tts-service && ./start.sh
```

That's it! The script will:
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Configure directories
- ✅ Start the service

**First run takes 5-10 minutes** (downloads AI model)

## 3. Verify It's Working

Open a new terminal and run:

```bash
cd tts-service
./test_deployment.sh
```

Or simply visit: **http://localhost:5002/health**

## 4. Use the App

### Upload Voice Sample:
```bash
curl -X POST http://localhost:5002/validate-audio \
  -F "audio=@my_voice.wav"
```

### Generate Speech:
```bash
curl -X POST http://localhost:5002/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world!",
    "voice_sample_path": "/tmp/podstream/voice_uploads/sample.wav",
    "output_format": "mp3",
    "language": "en"
  }'
```

## Need Help?

- 📖 Full guide: `DEPLOY_LOCAL.md`
- 🔧 Troubleshooting: See DEPLOY_LOCAL.md
- 📚 API docs: `README_STANDALONE.md`

## Stop the App

Press `Ctrl+C` in the terminal running the app.

## Restart Later

```bash
cd tts-service
source venv/bin/activate
./start.sh
```

---

**That's it! You're ready to clone voices! 🎤**

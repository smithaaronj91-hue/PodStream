# Voice Cloning Application

An AI-powered voice cloning application using Coqui TTS XTTS v2 model for high-quality text-to-speech synthesis.

## 🎯 Features

- 🎵 **Voice Sample Upload**: Upload audio samples (WAV, MP3, FLAC) for voice cloning
- 🤖 **AI Voice Cloning**: Create realistic voice models using Coqui TTS XTTS v2
- 💬 **Text-to-Speech**: Generate speech in cloned voices
- 🌍 **Multi-language Support**: Synthesize speech in 15+ languages
- 🔒 **Secure Processing**: File validation and secure storage
- 📊 **Voice Model Management**: Create, list, and manage voice models

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- FFmpeg (for audio processing)
- 4GB+ RAM (for TTS model)
- 2GB+ disk space (for model download)

### Installation

1. **Clone and navigate to the application:**
```bash
cd tts-service
```

2. **Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Start the application:**
```bash
./start.sh
# Or manually: python app.py
```

The application will start on **http://localhost:5002**

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Upload Voice Sample
```bash
POST /validate-audio
Content-Type: multipart/form-data

Body:
- audio: audio file (WAV, MP3, or FLAC)
```

### Process Voice Sample
```bash
POST /process-voice-sample
Content-Type: application/json

{
  "file_path": "/path/to/audio.wav",
  "sample_id": "unique_id"
}
```

### Synthesize Speech
```bash
POST /synthesize
Content-Type: application/json

{
  "text": "Text to synthesize",
  "voice_sample_path": "/path/to/voice_sample.wav",
  "output_format": "mp3",
  "language": "en"
}
```

### Download Generated Audio
```bash
GET /download/{filename}
```

### Cleanup Files
```bash
POST /cleanup
Content-Type: application/json

{
  "files": ["/path/to/file1.wav"]
}
```

## ⚙️ Configuration

Environment variables (`.env`):

```bash
TTS_SERVICE_PORT=5002
VOICE_UPLOAD_DIR=/tmp/podstream/voice_uploads
VOICE_MODEL_DIR=/tmp/podstream/voice_models
VOICE_OUTPUT_DIR=/tmp/podstream/voice_output
MAX_VOICE_FILE_SIZE=10485760  # 10MB
MIN_VOICE_DURATION=10.0        # seconds
MAX_VOICE_DURATION=300.0       # seconds
DEBUG=false
```

## 🎤 Voice Sample Requirements

### Audio Specifications
- **Duration**: 10-300 seconds (30-60 seconds recommended)
- **Format**: WAV, MP3, or FLAC
- **Size**: Maximum 10MB
- **Quality**: Clear speech, minimal background noise
- **Content**: Single speaker preferred

### Best Practices
- Use high-quality recordings (44.1kHz or 48kHz sample rate)
- Avoid background music or noise
- Include varied intonations and emotions
- Record in a quiet environment

## 🌍 Supported Languages

- English (en), Spanish (es), French (fr), German (de)
- Italian (it), Portuguese (pt), Polish (pl), Turkish (tr)
- Russian (ru), Dutch (nl), Czech (cs), Arabic (ar)
- Chinese (zh-cn), Japanese (ja), Hungarian (hu), Korean (ko)

## 🐳 Docker Deployment

Build and run with Docker:

```bash
docker build -t voice-cloning-app .
docker run -p 5002:5002 voice-cloning-app
```

## 📊 Performance

- **First synthesis**: 10-30 seconds (model initialization)
- **Subsequent syntheses**: 2-5 seconds
- **Voice model creation**: 5-15 seconds
- **RAM usage**: ~2-3GB (TTS model)
- **Disk space**: ~2GB (model download on first run)

## 🔧 Troubleshooting

### Model Loading Issues
- Check internet connection (first run downloads model)
- Verify disk space for model files (~2GB)
- Ensure Python 3.8+ is installed

### Audio Quality Issues
- Use longer voice samples (30-60 seconds)
- Ensure clean, clear recordings
- Avoid heavily compressed audio files
- Match language of text to voice sample

### Port Conflicts
- Change `TTS_SERVICE_PORT` in `.env`
- Restart the application

## 🔒 Security Features

- File size and duration validation
- Path traversal prevention
- File extension validation
- Directory-restricted file operations
- Input sanitization

## 📄 License

Voice Cloning Application - Standalone TTS Service

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows Python best practices
- Security validations are maintained
- Documentation is updated

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review configuration settings
3. Check application logs

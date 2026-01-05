# Voice Cloning Application

A standalone AI-powered voice cloning application using Coqui TTS XTTS v2 model.

## Features

- 🎵 **Voice Sample Upload**: Upload audio samples (WAV, MP3, FLAC) for cloning
- 🤖 **AI Voice Cloning**: Create realistic voice models using Coqui TTS
- 💬 **Text-to-Speech**: Generate speech in cloned voices
- 📚 **Voice Library**: Manage multiple voice models
- 🌍 **Multi-language Support**: Synthesize speech in 15+ languages
- 🔒 **Secure**: Path traversal prevention, input validation, file size limits

## Quick Start

### Prerequisites

- Python 3.8+
- FFmpeg (for audio processing)
- At least 4GB RAM (for TTS model)
- ~2GB disk space (for model download on first run)

### Installation

1. Navigate to the application directory:
```bash
cd tts-service
```

2. Create virtual environment and install dependencies:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env if needed
```

4. Start the application:
```bash
./start.sh
```

The service will be available at **http://localhost:5002**

### Using Docker

```bash
cd tts-service
docker build -t voice-cloning-app .
docker run -p 5002:5002 -v voice_data:/tmp/podstream voice-cloning-app
```

## API Endpoints

### Health Check
```
GET /health
```

### Validate Audio File
```
POST /validate-audio
Content-Type: multipart/form-data
Body: audio file (WAV, MP3, FLAC)
```

### Process Voice Sample
```
POST /process-voice-sample
Content-Type: application/json
Body: { "file_path": "path", "sample_id": "id" }
```

### Synthesize Speech
```
POST /synthesize
Content-Type: application/json
Body: {
  "text": "Text to synthesize",
  "voice_sample_path": "/path/to/sample.wav",
  "output_format": "mp3",
  "language": "en"
}
```

### Download Generated Audio
```
GET /download/{filename}
```

### Cleanup Files
```
POST /cleanup
Content-Type: application/json
Body: { "files": ["/path/to/file1", "/path/to/file2"] }
```

## Audio Requirements

### Voice Samples
- **Duration**: 10-300 seconds (30-60 seconds recommended)
- **Format**: WAV, MP3, or FLAC
- **Size**: Maximum 10MB
- **Quality**: Clear speech, minimal background noise
- **Content**: Single speaker preferred

## Configuration

Environment variables (see `.env.example`):

- `TTS_SERVICE_PORT`: Port to run the service (default: 5002)
- `VOICE_UPLOAD_DIR`: Directory for uploaded voice samples
- `VOICE_MODEL_DIR`: Directory for processed voice models
- `VOICE_OUTPUT_DIR`: Directory for synthesized audio
- `MAX_VOICE_FILE_SIZE`: Maximum file size in bytes (default: 10MB)
- `MIN_VOICE_DURATION`: Minimum audio duration in seconds (default: 10)
- `MAX_VOICE_DURATION`: Maximum audio duration in seconds (default: 300)

## Supported Languages

English (en), Spanish (es), French (fr), German (de), Italian (it), Portuguese (pt), Polish (pl), Turkish (tr), Russian (ru), Dutch (nl), Czech (cs), Arabic (ar), Chinese (zh-cn), Japanese (ja), Hungarian (hu), Korean (ko)

## Security Features

- Path traversal prevention (including null bytes)
- File extension validation
- Directory-restricted cleanup operations
- Input validation and sanitization
- Secure error handling

## Performance

- **First synthesis**: 10-30 seconds (model initialization)
- **Subsequent syntheses**: 2-5 seconds
- **RAM usage**: ~2-3GB (TTS model)
- **Disk space**: ~2GB (model download)

## Troubleshooting

### Model Loading Issues
If the TTS model fails to load:
1. Check internet connection (first run downloads model)
2. Verify disk space for model files (~2GB)
3. Check Python version (3.8+ required)

### Audio Quality Issues
For better synthesis quality:
1. Use longer voice samples (30-60 seconds)
2. Ensure clean, clear recordings
3. Avoid heavily compressed audio files
4. Match language of text to voice sample

## Development

Run in debug mode:
```bash
DEBUG=true python app.py
```

## License

MIT License - See LICENSE file for details

## Credits

- **Coqui TTS**: https://github.com/coqui-ai/TTS
- **XTTS v2**: Multi-lingual voice cloning model

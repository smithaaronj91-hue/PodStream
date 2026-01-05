# Voice Cloning TTS Service

Python-based Text-to-Speech service using Coqui TTS for voice cloning capabilities.

## Features

- Voice sample validation (duration, format, quality)
- Audio preprocessing (normalization, noise reduction)
- Voice cloning using Coqui TTS XTTS v2 model
- Text-to-speech synthesis with cloned voices
- Support for multiple audio formats (WAV, MP3, FLAC)
- RESTful API for easy integration

## Requirements

- Python 3.8+
- FFmpeg (for audio processing)
- Coqui TTS library

## Installation

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration

## Usage

### Start the service

```bash
./start.sh
```

Or manually:
```bash
python app.py
```

The service will start on port 5002 by default.

## API Endpoints

### Health Check
```
GET /health
```

Returns service health status and TTS model availability.

### Validate Audio
```
POST /validate-audio
Content-Type: multipart/form-data

Body:
- audio: audio file (WAV, MP3, or FLAC)
```

Validates audio file format, duration, and quality.

### Process Voice Sample
```
POST /process-voice-sample
Content-Type: application/json

Body:
{
  "file_path": "/path/to/audio.wav",
  "sample_id": "unique_id"
}
```

Preprocesses audio for voice cloning (normalization, mono conversion).

### Synthesize Speech
```
POST /synthesize
Content-Type: application/json

Body:
{
  "text": "Text to synthesize",
  "voice_sample_path": "/path/to/voice_sample.wav",
  "output_format": "mp3",  // optional, default: wav
  "language": "en"          // optional, default: en
}
```

Generates speech using the cloned voice.

### Download Audio
```
GET /download/{filename}
```

Downloads a generated audio file.

### Cleanup Files
```
POST /cleanup
Content-Type: application/json

Body:
{
  "files": ["/path/to/file1.wav", "/path/to/file2.wav"]
}
```

Removes temporary files from the system.

## Configuration

Environment variables (see `.env.example`):

- `TTS_SERVICE_PORT`: Port to run the service (default: 5002)
- `VOICE_UPLOAD_DIR`: Directory for uploaded voice samples
- `VOICE_MODEL_DIR`: Directory for processed voice models
- `VOICE_OUTPUT_DIR`: Directory for synthesized audio
- `MAX_VOICE_FILE_SIZE`: Maximum file size in bytes (default: 10MB)
- `MIN_VOICE_DURATION`: Minimum audio duration in seconds (default: 10)
- `MAX_VOICE_DURATION`: Maximum audio duration in seconds (default: 300)
- `DEBUG`: Enable debug mode (default: false)

## Audio Requirements

### Voice Samples
- **Duration**: 10-300 seconds
- **Format**: WAV, MP3, or FLAC
- **Quality**: Clear speech, minimal background noise
- **Content**: Single speaker preferred
- **Recommended**: 30-60 seconds of clear, expressive speech

### Best Practices
- Use high-quality recordings (44.1kHz or 48kHz sample rate)
- Avoid background music or noise
- Include varied intonations and emotions
- Record in a quiet environment

## Supported Languages

The XTTS v2 model supports multiple languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Polish (pl)
- Turkish (tr)
- Russian (ru)
- Dutch (nl)
- Czech (cs)
- Arabic (ar)
- Chinese (zh-cn)
- Japanese (ja)
- Hungarian (hu)
- Korean (ko)

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

### Performance
- First synthesis may be slow (model initialization)
- GPU acceleration recommended for production
- Consider batch processing for multiple requests

## Development

Run in debug mode:
```bash
DEBUG=true python app.py
```

## Integration with PodStream Backend

The Node.js backend communicates with this service via HTTP:
- Backend sends requests to TTS service
- TTS service processes audio and returns results
- Backend stores metadata in PostgreSQL
- Audio files managed by both services

## License

Part of the PodStream project.

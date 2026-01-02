"""
Voice Cloning Service using Coqui TTS
Provides endpoints for voice sample processing and speech synthesis
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import logging
from pathlib import Path
import json
from datetime import datetime
import soundfile as sf
import librosa
import numpy as np
from TTS.api import TTS
from pydub import AudioSegment
import tempfile
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_DIR = os.getenv('VOICE_UPLOAD_DIR', '/tmp/podstream/voice_uploads')
MODEL_DIR = os.getenv('VOICE_MODEL_DIR', '/tmp/podstream/voice_models')
OUTPUT_DIR = os.getenv('VOICE_OUTPUT_DIR', '/tmp/podstream/voice_output')
MAX_FILE_SIZE = int(os.getenv('MAX_VOICE_FILE_SIZE', 10 * 1024 * 1024))  # 10MB default
MIN_DURATION = float(os.getenv('MIN_VOICE_DURATION', 10.0))  # 10 seconds
MAX_DURATION = float(os.getenv('MAX_VOICE_DURATION', 300.0))  # 5 minutes

# Supported audio formats
SUPPORTED_FORMATS = ['wav', 'mp3', 'flac']

# Initialize TTS model (using XTTS v2 for voice cloning)
tts_model = None

def init_directories():
    """Create necessary directories"""
    for directory in [UPLOAD_DIR, MODEL_DIR, OUTPUT_DIR]:
        Path(directory).mkdir(parents=True, exist_ok=True)
    logger.info("Directories initialized")

def init_tts_model():
    """Initialize the TTS model"""
    global tts_model
    try:
        # XTTS v2 supports voice cloning
        tts_model = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")
        logger.info("TTS model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load TTS model: {e}")
        tts_model = None

def validate_audio_file(file_path):
    """
    Validate audio file format, duration, and quality
    Returns: (is_valid, error_message, metadata)
    """
    try:
        # Get audio info
        audio, sr = librosa.load(file_path, sr=None)
        duration = librosa.get_duration(y=audio, sr=sr)
        
        # Check duration
        if duration < MIN_DURATION:
            return False, f"Audio too short. Minimum {MIN_DURATION} seconds required.", None
        
        if duration > MAX_DURATION:
            return False, f"Audio too long. Maximum {MAX_DURATION} seconds allowed.", None
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        metadata = {
            'duration': float(duration),
            'sample_rate': int(sr),
            'channels': 1 if audio.ndim == 1 else audio.shape[0],
            'file_size': file_size
        }
        
        return True, None, metadata
        
    except Exception as e:
        return False, f"Invalid audio file: {str(e)}", None

def preprocess_audio(input_path, output_path):
    """
    Preprocess audio: normalize, convert to mono, resample
    """
    try:
        # Load audio
        audio, sr = librosa.load(input_path, sr=22050, mono=True)
        
        # Normalize audio
        audio = librosa.util.normalize(audio)
        
        # Reduce noise (simple highpass filter)
        audio = librosa.effects.preemphasis(audio)
        
        # Save processed audio
        sf.write(output_path, audio, sr)
        
        return True, output_path
        
    except Exception as e:
        logger.error(f"Audio preprocessing failed: {e}")
        return False, str(e)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'tts_model_loaded': tts_model is not None,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/validate-audio', methods=['POST'])
def validate_audio():
    """
    Validate uploaded audio file
    Expected: multipart/form-data with 'audio' file
    """
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Check file extension
        ext = file.filename.rsplit('.', 1)[-1].lower()
        if ext not in SUPPORTED_FORMATS:
            return jsonify({
                'error': f'Unsupported format. Supported: {", ".join(SUPPORTED_FORMATS)}'
            }), 400
        
        # Save temporarily
        temp_path = os.path.join(UPLOAD_DIR, f"temp_{uuid.uuid4()}.{ext}")
        file.save(temp_path)
        
        # Validate
        is_valid, error_msg, metadata = validate_audio_file(temp_path)
        
        if not is_valid:
            os.remove(temp_path)
            return jsonify({'error': error_msg}), 400
        
        # Return validation result
        result = {
            'valid': True,
            'metadata': metadata,
            'temp_path': temp_path
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Audio validation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/process-voice-sample', methods=['POST'])
def process_voice_sample():
    """
    Process and prepare voice sample for cloning
    Expected JSON: { 'file_path': str, 'sample_id': str }
    """
    try:
        data = request.get_json()
        
        if not data or 'file_path' not in data or 'sample_id' not in data:
            return jsonify({'error': 'file_path and sample_id required'}), 400
        
        input_path = data['file_path']
        sample_id = data['sample_id']
        
        if not os.path.exists(input_path):
            return jsonify({'error': 'File not found'}), 404
        
        # Preprocess audio
        output_path = os.path.join(MODEL_DIR, f"voice_sample_{sample_id}.wav")
        success, result = preprocess_audio(input_path, output_path)
        
        if not success:
            return jsonify({'error': f'Processing failed: {result}'}), 500
        
        return jsonify({
            'success': True,
            'processed_path': output_path,
            'message': 'Voice sample processed successfully'
        })
        
    except Exception as e:
        logger.error(f"Voice sample processing error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/synthesize', methods=['POST'])
def synthesize_speech():
    """
    Synthesize speech using cloned voice
    Expected JSON: { 
        'text': str, 
        'voice_sample_path': str,
        'output_format': str (optional, default: 'wav'),
        'language': str (optional, default: 'en')
    }
    """
    try:
        if not tts_model:
            return jsonify({'error': 'TTS model not loaded'}), 503
        
        data = request.get_json()
        
        if not data or 'text' not in data or 'voice_sample_path' not in data:
            return jsonify({'error': 'text and voice_sample_path required'}), 400
        
        text = data['text']
        voice_sample_path = data['voice_sample_path']
        output_format = data.get('output_format', 'wav')
        language = data.get('language', 'en')
        
        if not os.path.exists(voice_sample_path):
            return jsonify({'error': 'Voice sample not found'}), 404
        
        if not text.strip():
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Generate unique output filename
        output_id = str(uuid.uuid4())
        output_path = os.path.join(OUTPUT_DIR, f"speech_{output_id}.wav")
        
        # Synthesize speech
        logger.info(f"Synthesizing speech with text length: {len(text)}")
        tts_model.tts_to_file(
            text=text,
            speaker_wav=voice_sample_path,
            language=language,
            file_path=output_path
        )
        
        # Convert format if needed
        if output_format != 'wav':
            converted_path = os.path.join(OUTPUT_DIR, f"speech_{output_id}.{output_format}")
            audio = AudioSegment.from_wav(output_path)
            audio.export(converted_path, format=output_format)
            os.remove(output_path)
            output_path = converted_path
        
        # Get duration
        audio_info = sf.info(output_path)
        duration = audio_info.duration
        
        return jsonify({
            'success': True,
            'output_path': output_path,
            'duration': duration,
            'format': output_format
        })
        
    except Exception as e:
        logger.error(f"Speech synthesis error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download generated audio file"""
    try:
        file_path = os.path.join(OUTPUT_DIR, filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(file_path, as_attachment=True)
        
    except Exception as e:
        logger.error(f"File download error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/cleanup', methods=['POST'])
def cleanup_files():
    """
    Clean up temporary files
    Expected JSON: { 'files': [str] }
    """
    try:
        data = request.get_json()
        
        if not data or 'files' not in data:
            return jsonify({'error': 'files list required'}), 400
        
        files_to_delete = data['files']
        deleted = []
        errors = []
        
        for file_path in files_to_delete:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    deleted.append(file_path)
            except Exception as e:
                errors.append({'file': file_path, 'error': str(e)})
        
        return jsonify({
            'deleted': deleted,
            'errors': errors
        })
        
    except Exception as e:
        logger.error(f"Cleanup error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_directories()
    init_tts_model()
    
    port = int(os.getenv('TTS_SERVICE_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'false').lower() == 'true')

# Voice Cloning API Documentation

## Overview

The Voice Cloning API allows users to upload voice samples, create voice models, and synthesize speech using AI-powered voice cloning technology.

## Base URL

```
http://localhost:5000/api/voice
```

## Authentication

All endpoints (except `/health`) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

Voice endpoints are rate-limited to prevent abuse:
- **20 requests per hour** per user
- Exceeding the limit returns HTTP 429 (Too Many Requests)

## Endpoints

### 1. Health Check

Check the status of the TTS service.

**Endpoint:** `GET /api/voice/health`

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "tts_model_loaded": true,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 2. Upload Voice Sample

Upload an audio file for voice cloning.

**Endpoint:** `POST /api/voice/upload`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `audio` (file): Audio file (WAV, MP3, or FLAC)

**File Requirements:**
- **Formats:** WAV, MP3, FLAC
- **Size:** Maximum 10MB
- **Duration:** 10-300 seconds (30-60 seconds recommended)
- **Quality:** Clear speech, minimal background noise

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/voice/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@/path/to/voice_sample.wav"
```

**Success Response (201):**
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

**Error Responses:**
- `400`: Invalid file format or duration
- `401`: Unauthorized
- `429`: Rate limit exceeded
- `500`: Server error

---

### 3. Create Voice Model

Create a voice model from an uploaded sample.

**Endpoint:** `POST /api/voice/clone`

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "sample_id": 1,
  "name": "My Voice Model",
  "description": "Optional description",
  "language": "en"
}
```

**Parameters:**
- `sample_id` (number, required): ID of uploaded voice sample
- `name` (string, required): Name for the voice model
- `description` (string, optional): Description of the voice model
- `language` (string, optional): Language code (default: "en")

**Supported Languages:**
`en`, `es`, `fr`, `de`, `it`, `pt`, `pl`, `tr`, `ru`, `nl`, `cs`, `ar`, `zh-cn`, `ja`, `hu`, `ko`

**Example:**
```bash
curl -X POST http://localhost:5000/api/voice/clone \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sample_id": 1,
    "name": "Professional Voice",
    "description": "Clear, professional speaking voice",
    "language": "en"
  }'
```

**Success Response (201):**
```json
{
  "message": "Voice model created successfully",
  "model": {
    "id": 1,
    "name": "Professional Voice",
    "description": "Clear, professional speaking voice",
    "language": "en",
    "status": "ready",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Invalid parameters or sample not ready
- `401`: Unauthorized
- `404`: Voice sample not found
- `429`: Rate limit exceeded
- `500`: Processing failed

---

### 4. Synthesize Speech

Generate speech using a cloned voice.

**Endpoint:** `POST /api/voice/synthesize`

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "model_id": 1,
  "text": "Hello, this is a test of voice synthesis.",
  "output_format": "mp3"
}
```

**Parameters:**
- `model_id` (number, required): ID of voice model to use
- `text` (string, required): Text to synthesize (max 5000 characters)
- `output_format` (string, optional): Output format - "mp3" or "wav" (default: "mp3")

**Example:**
```bash
curl -X POST http://localhost:5000/api/voice/synthesize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": 1,
    "text": "Hello, this is a demonstration of voice cloning technology.",
    "output_format": "mp3"
  }'
```

**Success Response (200):**
```json
{
  "message": "Speech synthesized successfully",
  "synthesis": {
    "id": 1,
    "audio_path": "/tmp/podstream/voice_output/speech_abc123.mp3",
    "duration": 5.2,
    "format": "mp3",
    "text_length": 67
  }
}
```

**Error Responses:**
- `400`: Invalid parameters or text too long
- `401`: Unauthorized
- `404`: Voice model not found
- `429`: Rate limit exceeded
- `500`: Synthesis failed

---

### 5. List Voice Models

Get all voice models for the authenticated user.

**Endpoint:** `GET /api/voice/models`

**Authentication:** Required

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)

**Example:**
```bash
curl -X GET "http://localhost:5000/api/voice/models?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200):**
```json
{
  "models": [
    {
      "id": 1,
      "name": "Professional Voice",
      "description": "Clear, professional speaking voice",
      "language": "en",
      "status": "ready",
      "quality_score": null,
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z",
      "sample_duration": 45.5,
      "sample_format": "wav"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

### 6. Get Voice Model Details

Get detailed information about a specific voice model.

**Endpoint:** `GET /api/voice/models/:id`

**Authentication:** Required

**Example:**
```bash
curl -X GET http://localhost:5000/api/voice/models/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200):**
```json
{
  "model": {
    "id": 1,
    "user_id": 1,
    "voice_sample_id": 1,
    "name": "Professional Voice",
    "description": "Clear, professional speaking voice",
    "model_path": "/tmp/podstream/voice_models/voice_sample_1.wav",
    "status": "ready",
    "language": "en",
    "quality_score": null,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "sample_duration": 45.5,
    "sample_format": "wav",
    "sample_filename": "voice_sample.wav"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Voice model not found

---

### 7. Update Voice Model

Update voice model metadata (name and description).

**Endpoint:** `PATCH /api/voice/models/:id`

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "Updated Voice Name",
  "description": "Updated description"
}
```

**Parameters:**
- `name` (string, optional): New name for the voice model
- `description` (string, optional): New description

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/voice/models/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Professional Voice",
    "description": "Enhanced professional speaking voice"
  }'
```

**Success Response (200):**
```json
{
  "message": "Voice model updated successfully",
  "model": {
    "id": 1,
    "name": "Updated Professional Voice",
    "description": "Enhanced professional speaking voice",
    "status": "ready",
    "language": "en",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:05:00.000Z"
  }
}
```

**Error Responses:**
- `400`: No fields to update
- `401`: Unauthorized
- `404`: Voice model not found

---

### 8. Delete Voice Model

Delete a voice model and associated files.

**Endpoint:** `DELETE /api/voice/models/:id`

**Authentication:** Required

**Example:**
```bash
curl -X DELETE http://localhost:5000/api/voice/models/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200):**
```json
{
  "message": "Voice model deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Voice model not found
- `500`: Deletion failed

---

### 9. Get Synthesis History

Get history of text-to-speech synthesis operations.

**Endpoint:** `GET /api/voice/history`

**Authentication:** Required

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)

**Example:**
```bash
curl -X GET "http://localhost:5000/api/voice/history?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200):**
```json
{
  "history": [
    {
      "id": 1,
      "user_id": 1,
      "voice_model_id": 1,
      "text_input": "Hello, this is a test...",
      "audio_output_path": "/tmp/podstream/voice_output/speech_abc123.mp3",
      "duration_seconds": 5.2,
      "format": "mp3",
      "status": "completed",
      "created_at": "2024-01-01T12:00:00.000Z",
      "model_name": "Professional Voice"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 400 | Bad Request - Invalid parameters or file format |
| 401 | Unauthorized - Missing or invalid token |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |
| 503 | Service Unavailable - TTS service not available |

## Usage Example Workflow

### Complete Flow: Upload, Clone, Synthesize

```javascript
// 1. Upload voice sample
const formData = new FormData();
formData.append('audio', audioFile);

const uploadResponse = await fetch('http://localhost:5000/api/voice/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { sample } = await uploadResponse.json();

// 2. Create voice model
const cloneResponse = await fetch('http://localhost:5000/api/voice/clone', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sample_id: sample.id,
    name: 'My Voice',
    language: 'en'
  })
});

const { model } = await cloneResponse.json();

// 3. Synthesize speech
const synthesisResponse = await fetch('http://localhost:5000/api/voice/synthesize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model_id: model.id,
    text: 'Hello! This is synthesized speech.',
    output_format: 'mp3'
  })
});

const { synthesis } = await synthesisResponse.json();
console.log('Generated audio:', synthesis.audio_path);
```

## Best Practices

### Voice Sample Quality
1. **Duration**: 30-60 seconds for best results
2. **Quality**: Use clear, high-quality recordings
3. **Environment**: Record in quiet spaces
4. **Content**: Natural, expressive speech
5. **Format**: WAV format preferred for quality

### Text Synthesis
1. Keep text under 1000 characters for faster processing
2. Use proper punctuation for natural pauses
3. Match language of text to voice model language
4. Break long texts into smaller chunks

### Rate Limiting
1. Cache voice models on client side
2. Batch synthesis requests when possible
3. Implement retry logic with exponential backoff
4. Monitor rate limit headers in responses

## Troubleshooting

### Common Issues

**Issue:** "TTS model not loaded"
- **Solution:** Check TTS service is running and healthy (`GET /health`)

**Issue:** "Audio too short"
- **Solution:** Provide at least 10 seconds of audio

**Issue:** "Voice sample is not ready for processing"
- **Solution:** Ensure sample status is "uploaded" before cloning

**Issue:** "Voice model is not ready"
- **Solution:** Wait for model status to change to "ready" after cloning

**Issue:** Rate limit exceeded
- **Solution:** Wait for the rate limit window to reset (1 hour)

## Security

- All endpoints require authentication
- File uploads are validated for type and size
- Input text is sanitized to prevent injection attacks
- Rate limiting prevents abuse
- Voice models are user-isolated (users can only access their own models)

## Performance Considerations

- First synthesis may take longer (TTS model initialization)
- Processing time depends on text length and server load
- Voice model creation is CPU-intensive
- Consider async processing for production environments
- GPU acceleration recommended for faster synthesis

---

For more information, see:
- [Main API Documentation](./API.md)
- [TTS Service Documentation](../tts-service/README.md)
- [Setup Guide](./SETUP.md)

# PodStream API Documentation

## Overview

RESTful API for the PodStream podcast platform. All endpoints return JSON responses.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "data": {},
  "error": null
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Endpoints

### Categories

#### Get All Categories
```
GET /categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "color_hex": "#3498db",
    "description": "Tech podcasts"
  }
]
```

#### Get Category by Slug
```
GET /categories/:slug
```

#### Get Podcasts by Category
```
GET /categories/:slug/podcasts?page=1&limit=20&sort=latest
```

**Query Parameters:**
- `page` (default: 1) - Page number for pagination
- `limit` (default: 20) - Items per page
- `sort` (default: latest) - Sort order: `latest`, `popular`, `trending`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Podcast Title",
      "description": "...",
      "cover_image_url": "...",
      "category_id": 1,
      "is_premium": false,
      "total_episodes": 10,
      "total_listens": 1000,
      "average_rating": 4.5,
      "created_at": "2024-01-01T00:00:00Z",
      "creator_name": "Creator Name",
      "creator_picture": "..."
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### Podcasts

#### Get All Podcasts
```
GET /podcasts?page=1&limit=20&category=technology&sort=latest&search=query
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `category` - Filter by category slug
- `sort` - Sort order
- `search` - Search by title or description

#### Get Podcast Details
```
GET /podcasts/:id
```

**Response:**
```json
{
  "id": 1,
  "title": "Podcast Title",
  "description": "...",
  "cover_image_url": "...",
  "is_premium": false,
  "total_episodes": 10,
  "total_listens": 1000,
  "average_rating": 4.5,
  "created_at": "2024-01-01T00:00:00Z",
  "creator_id": 1,
  "creator_name": "Creator Name",
  "creator_picture": "...",
  "creator_bio": "...",
  "category_name": "Technology",
  "episodes": [
    {
      "id": 1,
      "title": "Episode Title",
      "description": "...",
      "audio_url": "...",
      "duration_seconds": 3600,
      "episode_number": 1,
      "season_number": 1,
      "is_premium": false,
      "view_count": 100,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Episode Details
```
GET /podcasts/:podcastId/episodes/:episodeId
```

### Authentication

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Verify Token
```
POST /auth/verify
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "decoded": {
    "userId": 1,
    "email": "user@example.com",
    "iat": ...,
    "exp": ...
  }
}
```

### User Operations

#### Get User Profile
```
GET /users/profile
Authorization: Bearer <token>
```

#### Get User Subscriptions
```
GET /users/subscriptions
Authorization: Bearer <token>
```

#### Subscribe to Podcast
```
POST /users/subscribe/:podcastId
Authorization: Bearer <token>
```

#### Unsubscribe from Podcast
```
DELETE /users/subscribe/:podcastId
Authorization: Bearer <token>
```

#### Add to Favorites
```
POST /users/favorites/:episodeId
Authorization: Bearer <token>
```

#### Get Favorites
```
GET /users/favorites
Authorization: Bearer <token>
```

### Premium Subscriptions

#### Get Available Plans
```
GET /subscriptions/plans
```

**Response:**
```json
[
  {
    "id": "monthly",
    "name": "Premium Monthly",
    "price": 9.99,
    "currency": "USD",
    "period": "month",
    "features": [...]
  },
  {
    "id": "annual",
    "name": "Premium Annual",
    "price": 99.99,
    "currency": "USD",
    "period": "year",
    "savings": "17%",
    "features": [...]
  }
]
```

#### Create Subscription
```
POST /subscriptions/create-subscription
Content-Type: application/json

{
  "userId": 1,
  "plan": "monthly"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

## Rate Limiting

- No rate limits currently implemented
- Recommended: 100 requests per minute per IP for production

## Pagination

Most list endpoints support pagination:
- `page` - Current page (1-indexed)
- `limit` - Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

---

## Voice Cloning

### Overview

Voice cloning endpoints allow users to upload voice samples, create voice models, and synthesize speech.

**Base Path:** `/api/voice`

**Rate Limit:** 20 requests per hour per user

For detailed documentation, see [Voice Cloning API Documentation](./VOICE_CLONING.md)

### Quick Reference

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/voice/health` | GET | Check TTS service status | No |
| `/voice/upload` | POST | Upload voice sample | Yes |
| `/voice/clone` | POST | Create voice model | Yes |
| `/voice/synthesize` | POST | Generate speech | Yes |
| `/voice/models` | GET | List voice models | Yes |
| `/voice/models/:id` | GET | Get model details | Yes |
| `/voice/models/:id` | PATCH | Update model | Yes |
| `/voice/models/:id` | DELETE | Delete model | Yes |
| `/voice/history` | GET | Synthesis history | Yes |

### Example: Complete Workflow

```bash
# 1. Upload voice sample
curl -X POST http://localhost:5000/api/voice/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@voice_sample.wav"

# 2. Create voice model
curl -X POST http://localhost:5000/api/voice/clone \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sample_id": 1, "name": "My Voice", "language": "en"}'

# 3. Synthesize speech
curl -X POST http://localhost:5000/api/voice/synthesize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model_id": 1, "text": "Hello world!", "output_format": "mp3"}'

# 4. List models
curl -X GET http://localhost:5000/api/voice/models \
  -H "Authorization: Bearer YOUR_TOKEN"
```

For complete API documentation with detailed examples, parameters, and error codes, see the [Voice Cloning API Documentation](./VOICE_CLONING.md).

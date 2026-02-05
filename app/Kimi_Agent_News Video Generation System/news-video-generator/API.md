# API Documentation

Complete API reference for the News Video Generator.

## Base URL
```
http://localhost:3000/api
```

## Authentication
No authentication required by default. For production, add API key middleware.

---

## Video Generation

### Generate Videos
```http
POST /api/generate-videos
```

Triggers the complete video generation pipeline.

**Response:**
```json
{
  "success": true,
  "jobId": "uuid",
  "message": "Generated 3 videos",
  "videos": [...],
  "duration": 45000
}
```

---

## Queue Management

### Get Queue Status
```http
GET /api/queue/status
```

**Response:**
```json
{
  "success": true,
  "status": {
    "video": { "waiting": 2, "active": 1, "completed": 10, "failed": 1 },
    "processing": { "waiting": 0, "active": 0, "completed": 50 }
  }
}
```

### Pause Queue
```http
POST /api/queue/pause
```

### Resume Queue
```http
POST /api/queue/resume
```

---

## News

### Get News
```http
GET /api/news
GET /api/news?category=finance
GET /api/news?search=bitcoin
GET /api/news?refresh=true
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "articles": [...]
}
```

### Analyze News
```http
POST /api/news/analyze
```

**Body:**
```json
{
  "articles": [
    { "title": "...", "content": "...", "source": "..." }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "analyzed": [
    {
      "title": "...",
      "analysis": {
        "impactScore": 4,
        "impactCategory": "HIGH",
        "category": "finance",
        "videoWorthy": true,
        "noveltyScore": 85,
        "isDuplicate": false,
        "combinedScore": 78
      }
    }
  ]
}
```

### Filter News for Videos
```http
POST /api/news/filter
```

**Body:**
```json
{
  "articles": [...],
  "options": {
    "minScore": 60,
    "maxResults": 5,
    "requireVideoWorthy": true
  }
}
```

---

## Videos

### List Videos
```http
GET /api/videos
GET /api/videos?category=tech&limit=10
```

### Get Video Details
```http
GET /api/videos/:videoId
```

### Delete Video
```http
DELETE /api/videos/:videoId
```

---

## Storage

### Get Storage Stats
```http
GET /api/storage/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "videos": { "size": 1073741824, "sizeFormatted": "1 GB" },
    "total": { "size": 2147483648, "percentUsed": 4 },
    "limits": { "maxGB": 50, "retentionDays": 7 }
  }
}
```

### Run Cleanup
```http
POST /api/storage/cleanup
```

### Compress Videos
```http
POST /api/storage/compress
```

---

## Providers

### Get Provider Status
```http
GET /api/providers/status
```

**Response:**
```json
{
  "success": true,
  "providers": {
    "wan": { "available": true, "quota": { "used": 3, "remaining": 7 } },
    "mochi": { "available": true },
    "local": { "available": false }
  },
  "quota": { "used": 3, "remaining": 7, "limit": 10 }
}
```

---

## B-Roll

### Search B-Roll
```http
POST /api/broll/search
```

**Body:**
```json
{
  "newsItem": {
    "title": "Bitcoin surges to new highs",
    "category": "crypto"
  }
}
```

### Get Cache Stats
```http
GET /api/broll/cache
```

### Clear Cache
```http
DELETE /api/broll/cache
```

---

## Analytics

### Get Metrics
```http
GET /api/analytics
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "uptime": 3600000,
    "videos": { "generated": 15, "failed": 2, "successRate": 88 },
    "performance": { "averageGenerationTime": 45000 },
    "apiCalls": { "fal": 15, "pexels": 20, "ollama": 100 },
    "providerUsage": { "wan": 10, "template": 5 }
  }
}
```

### Get Dashboard Data
```http
GET /api/analytics/dashboard
```

### Reset Analytics
```http
POST /api/analytics/reset
```

---

## System

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "ollama": { "healthy": true, "modelAvailable": true },
  "cache": { "keys": ["allArticles"], "lastFetchTime": "..." },
  "timestamp": "..."
}
```

### Status
```http
GET /api/status
```

**Response:**
```json
{
  "success": true,
  "status": "running",
  "cache": {...},
  "storage": {...},
  "queue": {...},
  "environment": "production"
}
```

---

## Webhooks

### Test Webhook
```http
POST /api/webhooks/test
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| General API | 100 req / 15 min |
| Generate Videos | 10 req / hour |
| Pexels (via proxy) | 200 req / hour |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `429` - Rate Limited
- `500` - Server Error

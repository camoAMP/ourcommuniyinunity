# News Video Generator

A complete production-ready system that automatically aggregates financial and tech news, filters for high-impact stories using AI, generates video scripts, and creates short videos.

## Features

- **News Aggregation**: Fetches RSS feeds from CNBC, Bloomberg, Reuters, TechCrunch, CoinDesk, and more
- **AI-Powered Filtering**: Uses Ollama (llama3.2) to classify news by impact level
- **Script Generation**: Creates engaging 30-second video scripts with 3 scenes
- **Video Composition**: Combines AI-generated clips, text overlays, and narration
- **Text-to-Speech**: Uses free Microsoft Edge TTS for narration
- **REST API**: Full-featured Express.js API for control and monitoring
- **Automation**: Cron job runs every 6 hours automatically

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  RSS Feeds      │────▶│  News Aggregator│────▶│  Impact Filter  │
│  (CNBC, etc.)   │     │  (Node.js)      │     │  (Ollama AI)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Final Video    │◀────│  Video Composer │◀────│ Script Generator│
│  (MP4)          │     │  (Python)       │     │  (Ollama AI)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Express API    │
│  (REST Server)  │
└─────────────────┘
```

## Quick Start

### Prerequisites

- Ubuntu 20.04+ (or compatible Linux)
- Node.js 18+
- Python 3.10+
- 4GB+ RAM (8GB recommended)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd news-video-generator
```

2. **Run the setup script:**
```bash
bash scripts/setup.sh
```

This will:
- Install system dependencies (Node.js, Python, ffmpeg)
- Install and configure Ollama with llama3.2
- Install Node.js and Python dependencies
- Set up the directory structure
- Configure cron jobs

3. **Configure environment variables:**
```bash
cp .env.example .env
nano .env  # Edit with your settings
```

4. **Start the server:**
```bash
bash scripts/start.sh
# or
npm start
```

## API Endpoints

### Generate Videos
```bash
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

### Get News
```bash
GET /api/news
GET /api/news?category=finance
GET /api/news?search=bitcoin
GET /api/news?refresh=true
```

### List Videos
```bash
GET /api/videos
GET /api/videos?category=tech&limit=10
```

### Health Check
```bash
GET /api/health
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `OLLAMA_HOST` | http://localhost:11434 | Ollama API URL |
| `OLLAMA_MODEL` | llama3.2 | AI model for analysis |
| `FAL_API_KEY` | - | FAL.AI API key (optional) |
| `CACHE_TTL` | 7200 | News cache duration (seconds) |
| `MAX_VIDEOS_PER_RUN` | 5 | Max videos per generation |
| `TTS_VOICE` | en-US-GuyNeural | Voice for narration |

## Project Structure

```
news-video-generator/
├── src/
│   ├── services/
│   │   ├── newsAggregator.js    # RSS feed fetching
│   │   ├── impactFilter.js      # AI impact classification
│   │   └── scriptGenerator.js   # Script generation
│   ├── routes/
│   │   └── api.js               # API routes
│   ├── controllers/
│   │   └── videoController.js   # Pipeline orchestration
│   ├── utils/
│   │   └── logger.js            # Winston logging
│   └── app.js                   # Express server
├── python/
│   ├── video_generator.py       # AI video generation
│   ├── tts_generator.py         # Text-to-speech
│   ├── text_overlay.py          # Text overlays
│   ├── video_composer.py        # Main composer
│   └── script_parser.py         # Script parsing
├── scripts/
│   ├── setup.sh                 # Installation script
│   ├── start.sh                 # Server start script
│   ├── cron-job.sh              # Cron automation
│   └── generate-videos.js       # Standalone generator
├── config/
│   └── feeds.json               # RSS feed sources
├── output/
│   ├── videos/                  # Generated videos
│   ├── metadata/                # Video metadata
│   ├── temp/                    # Temporary files
│   └── logs/                    # Log files
├── package.json
├── requirements.txt
└── .env.example
```

## Ollama Setup

The system uses Ollama for local AI processing. The setup script installs it automatically.

### Manual Setup

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start service
sudo systemctl start ollama
sudo systemctl enable ollama

# Download model
ollama pull llama3.2

# Verify
ollama list
curl http://localhost:11434/api/tags
```

## Video Generation Options

### Option 1: Fallback Mode (Default)
Creates videos with text overlays and color backgrounds. No API key required.

### Option 2: FAL.AI (Cloud)
For AI-generated video clips, get a free API key at [fal.ai](https://fal.ai):

```bash
# Add to .env
FAL_API_KEY=your_key_here
```

### Option 3: Local GPU (ComfyUI + HunyuanVideo)
For local GPU generation:

1. Install ComfyUI
2. Install HunyuanVideo nodes
3. Set `USE_LOCAL_GPU=true` in .env

## Automation

The setup script configures a cron job to run every 6 hours:

```bash
# View cron jobs
crontab -l

# Edit cron jobs
crontab -e

# Manual trigger
bash scripts/cron-job.sh
```

### Cron Schedule

| Schedule | Description |
|----------|-------------|
| `0 */6 * * *` | Every 6 hours |
| `0 */12 * * *` | Every 12 hours |
| `0 0 * * *` | Daily at midnight |

## Troubleshooting

### Ollama Not Responding

```bash
# Check status
sudo systemctl status ollama

# Restart
sudo systemctl restart ollama

# Test
curl http://localhost:11434/api/tags
```

### Video Generation Fails

Check logs:
```bash
tail -f output/logs/combined.log
tail -f output/logs/error.log
```

### Python Dependencies

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Node.js Dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

## Performance Tips

1. **RAM**: 8GB+ recommended for Ollama
2. **SSD**: Use SSD for faster video processing
3. **GPU**: Optional for local video generation
4. **Cache**: News is cached for 2 hours by default

## API Rate Limits

| Endpoint | Limit |
|----------|-------|
| General API | 100 req / 15 min |
| Generate Videos | 10 req / hour |

## License

MIT License - See LICENSE file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and questions:
- Check the logs in `output/logs/`
- Review the troubleshooting section
- Open an issue on GitHub

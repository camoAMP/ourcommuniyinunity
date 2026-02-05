# Deployment Guide

Complete guide for deploying the News Video Generator to production.

## Prerequisites

- Ubuntu 20.04+ server
- 4GB+ RAM (8GB recommended)
- 50GB+ storage
- Domain name (optional, for SSL)

## Quick Deploy

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python and dependencies
sudo apt install -y python3 python3-pip python3-venv ffmpeg imagemagick

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl enable ollama
ollama pull llama3.2
```

### 2. Application Setup

```bash
# Clone repository
git clone <your-repo-url>
cd news-video-generator

# Install dependencies
npm install
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env
```

### 3. Environment Configuration

```env
NODE_ENV=production
PORT=3000

# Required
FAL_API_KEY=your_fal_api_key
OLLAMA_HOST=http://localhost:11434

# Optional but recommended
PEXELS_API_KEY=your_pexels_key
WEBHOOK_URL=https://your-app.com/webhook
ENABLE_CRON=true
```

### 4. Start with PM2

```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start src/app.js --name news-video-generator

# Save PM2 config
pm2 save
pm2 startup

# Monitor
pm2 logs
pm2 monit
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg imagemagick \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install Node dependencies
RUN npm ci --only=production

# Install Python dependencies
RUN python3 -m pip install -r requirements.txt

# Copy application
COPY . .

# Create directories
RUN mkdir -p output/videos output/metadata output/temp output/logs

EXPOSE 3000

CMD ["node", "src/app.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FAL_API_KEY=${FAL_API_KEY}
      - PEXELS_API_KEY=${PEXELS_API_KEY}
    volumes:
      - ./output:/app/output
      - ./.env:/app/.env
    restart: unless-stopped

  ollama:
    image: ollama/ollama
    volumes:
      - ollama:/root/.ollama
    restart: unless-stopped

volumes:
  ollama:
```

## Nginx Reverse Proxy

### Install Nginx

```bash
sudo apt install nginx
```

### Configuration

```nginx
# /etc/nginx/sites-available/news-video-generator
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location /videos {
        alias /path/to/output/videos;
        autoindex on;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/news-video-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring

### Setup Log Rotation

```bash
# /etc/logrotate.d/news-video-generator
/path/to/output/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 user user
}
```

### Health Check Script

```bash
#!/bin/bash
# health-check.sh

if ! curl -sf http://localhost:3000/api/health > /dev/null; then
    echo "Server unhealthy, restarting..."
    pm2 restart news-video-generator
fi
```

Add to crontab:
```bash
*/5 * * * * /path/to/health-check.sh
```

## Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/news-video-generator"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup metadata
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/metadata_$DATE.tar.gz output/metadata/

# Keep only last 7 backups
ls -t $BACKUP_DIR/metadata_*.tar.gz | tail -n +8 | xargs rm -f
```

## Troubleshooting

### High Memory Usage

```bash
# Check memory usage
pm2 logs --lines 100

# Restart if needed
pm2 restart news-video-generator

# Add swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Ollama Issues

```bash
# Check Ollama status
sudo systemctl status ollama

# Restart Ollama
sudo systemctl restart ollama

# Check model availability
curl http://localhost:11434/api/tags
```

### Disk Space Issues

```bash
# Check disk usage
df -h

# Clean up
npm run cleanup

# Or manually
rm -rf output/temp/*
find output/videos -mtime +7 -delete
```

## Security Checklist

- [ ] Use strong API keys
- [ ] Enable firewall (ufw)
- [ ] Configure rate limiting
- [ ] Use HTTPS
- [ ] Set up log monitoring
- [ ] Regular security updates
- [ ] Backup sensitive data

## Performance Tuning

### System Limits

```bash
# /etc/security/limits.conf
* soft nofile 65536
* hard nofile 65536
```

### Kernel Parameters

```bash
# /etc/sysctl.conf
net.core.somaxconn = 65535
vm.swappiness = 10
```

## Cost Optimization

### FAL.AI Free Tier

- Max 5-10 videos/day
- Use image-to-video (cheaper)
- Enable template fallback
- Compress videos to save storage

### Pexels API

- 200 requests/hour free
- Cache B-roll footage
- Use templates when possible

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  app:
    build: .
    deploy:
      replicas: 3
    environment:
      - REDIS_URL=redis://redis:6379
  
  redis:
    image: redis:alpine
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

## Support

For issues:
1. Check logs: `pm2 logs`
2. Review API docs: `/api/health`
3. Open GitHub issue

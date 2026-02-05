#!/bin/bash
# ============================================
# Cron Job Script for News Video Generator
# Runs video generation every 6 hours
# ============================================

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/output/logs/cron.log"
NODE_PATH="$(which node)"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Change to project directory
cd "$PROJECT_DIR" || exit 1

log "========================================"
log "Starting scheduled video generation"
log "========================================"

# Check if server is running
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    log "ERROR: Server is not running on port 3000"
    log "Starting server..."
    
    # Start server in background
    nohup "$NODE_PATH" "$PROJECT_DIR/src/app.js" > "$PROJECT_DIR/output/logs/server.log" 2>&1 &
    
    # Wait for server to start
    sleep 5
    
    # Check again
    if ! curl -s http://localhost:3000/api/health > /dev/null; then
        log "ERROR: Failed to start server"
        exit 1
    fi
    
    log "Server started successfully"
fi

# Run video generation
log "Triggering video generation..."

if "$NODE_PATH" "$PROJECT_DIR/scripts/generate-videos.js"; then
    log "Video generation completed successfully"
else
    log "ERROR: Video generation failed"
    exit 1
fi

log "========================================"
log "Scheduled run completed"
log "========================================"

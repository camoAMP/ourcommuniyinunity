#!/bin/bash
# ============================================
# News Video Generator - Start Script
# Starts the server with proper environment
# ============================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "========================================"
echo "News Video Generator - Starting Server"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "Warning: .env file not found. Using default configuration."
    echo "Copy .env.example to .env and customize as needed."
    echo ""
fi

# Check Ollama
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "Warning: Ollama is not running on port 11434"
    echo "Please start Ollama: sudo systemctl start ollama"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create necessary directories
mkdir -p "$PROJECT_DIR/output/videos"
mkdir -p "$PROJECT_DIR/output/metadata"
mkdir -p "$PROJECT_DIR/output/temp"
mkdir -p "$PROJECT_DIR/output/logs"

# Activate Python virtual environment if exists
if [ -d "$PROJECT_DIR/venv" ]; then
    source "$PROJECT_DIR/venv/bin/activate"
fi

cd "$PROJECT_DIR"

echo "Starting server on port ${PORT:-3000}..."
echo ""

# Start the server
exec node "$PROJECT_DIR/src/app.js"

#!/bin/bash
# ============================================
# News Video Generator - Setup Script
# Ubuntu Installation Script
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}News Video Generator - Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check Ubuntu version
if ! grep -q "Ubuntu" /etc/os-release; then
    echo -e "${YELLOW}Warning: This script is designed for Ubuntu${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ============================================
# Step 1: System Dependencies
# ============================================
echo -e "${GREEN}[1/7] Installing system dependencies...${NC}"

sudo apt-get update

# Install essential packages
sudo apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    imagemagick \
    fonts-dejavu \
    fonts-liberation \
    nodejs \
    npm

# Install Node.js 18+ if not present
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    echo -e "${YELLOW}Installing Node.js 18...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo -e "${GREEN}✓ System dependencies installed${NC}"

# ============================================
# Step 2: Ollama Installation
# ============================================
echo -e "${GREEN}[2/7] Setting up Ollama...${NC}"

if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    
    # Start Ollama service
    sudo systemctl start ollama
    sudo systemctl enable ollama
    
    echo -e "${GREEN}✓ Ollama installed${NC}"
else
    echo -e "${GREEN}✓ Ollama already installed${NC}"
fi

# Pull llama3.2 model
echo "Pulling llama3.2 model..."
ollama pull llama3.2

# Verify Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo -e "${GREEN}✓ Ollama is running and llama3.2 is available${NC}"
else
    echo -e "${RED}✗ Ollama is not responding. Please check the service.${NC}"
    exit 1
fi

# ============================================
# Step 3: Node.js Dependencies
# ============================================
echo -e "${GREEN}[3/7] Installing Node.js dependencies...${NC}"

cd "$PROJECT_DIR"
npm install

echo -e "${GREEN}✓ Node.js dependencies installed${NC}"

# ============================================
# Step 4: Python Dependencies
# ============================================
echo -e "${GREEN}[4/7] Installing Python dependencies...${NC}"

# Create Python virtual environment
python3 -m venv "$PROJECT_DIR/venv"
source "$PROJECT_DIR/venv/bin/activate"

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r "$PROJECT_DIR/requirements.txt"

echo -e "${GREEN}✓ Python dependencies installed${NC}"

# ============================================
# Step 5: Directory Structure
# ============================================
echo -e "${GREEN}[5/7] Creating directory structure...${NC}"

mkdir -p "$PROJECT_DIR/output/videos"
mkdir -p "$PROJECT_DIR/output/metadata"
mkdir -p "$PROJECT_DIR/output/temp"
mkdir -p "$PROJECT_DIR/output/logs"

echo -e "${GREEN}✓ Directory structure created${NC}"

# ============================================
# Step 6: Environment Configuration
# ============================================
echo -e "${GREEN}[6/7] Setting up environment configuration...${NC}"

if [ ! -f "$PROJECT_DIR/.env" ]; then
    cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
    echo -e "${YELLOW}⚠ Please edit .env file with your configuration${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# ============================================
# Step 7: Cron Job Setup
# ============================================
echo -e "${GREEN}[7/7] Setting up cron job...${NC}"

# Make scripts executable
chmod +x "$PROJECT_DIR/scripts/cron-job.sh"
chmod +x "$PROJECT_DIR/scripts/generate-videos.js"

# Add cron job (runs every 6 hours)
CRON_JOB="0 */6 * * * $PROJECT_DIR/scripts/cron-job.sh >> $PROJECT_DIR/output/logs/cron.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$PROJECT_DIR/scripts/cron-job.sh"; then
    echo -e "${GREEN}✓ Cron job already exists${NC}"
else
    # Add new cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo -e "${GREEN}✓ Cron job added (runs every 6 hours)${NC}"
fi

# ============================================
# Setup Complete
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Add FAL_API_KEY if you want AI video generation"
echo "3. Start the server: npm start"
echo "4. Test the API: curl http://localhost:3000/api/health"
echo ""
echo "To start the server:"
echo "  cd $PROJECT_DIR"
echo "  npm start"
echo ""
echo "To manually trigger video generation:"
echo "  node scripts/generate-videos.js"
echo ""
echo "Cron job runs every 6 hours automatically"
echo ""

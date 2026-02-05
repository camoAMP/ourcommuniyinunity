/**
 * News Video Generator - Main Application
 * Express.js server with API endpoints for automated news video generation
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const apiRoutes = require('./routes/api');
const logger = require('./utils/logger');
const cronService = require('./services/cron');
const broll = require('./services/broll');
const analytics = require('./services/analytics');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  }
});
app.use('/api/', limiter);

// Stricter rate limit for video generation
const videoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 video generations per hour
  message: {
    success: false,
    error: 'Video generation rate limit exceeded. Please try again later.'
  }
});
app.use('/api/generate-videos', videoLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// ============================================
// Static Files
// ============================================

// Serve generated videos
app.use('/videos', express.static(path.join(__dirname, '../output/videos')));

// Serve metadata
app.use('/metadata', express.static(path.join(__dirname, '../output/metadata')));

// ============================================
// API Routes
// ============================================

app.use('/api', apiRoutes);

// ============================================
// Root Endpoint
// ============================================

app.get('/', (req, res) => {
  res.json({
    name: 'News Video Generator',
    version: '1.0.0',
    description: 'High-Impact News Video Generation System',
    endpoints: {
      'POST /api/generate-videos': 'Trigger video generation pipeline',
      'GET /api/news': 'Get aggregated news articles',
      'GET /api/videos': 'List generated videos',
      'GET /api/videos/:videoId': 'Get specific video details',
      'DELETE /api/videos/:videoId': 'Delete a video',
      'GET /api/health': 'System health status',
      'GET /api/status': 'System status and statistics'
    },
    documentation: 'See README.md for full documentation',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================
// Server Startup
// ============================================

app.listen(PORT, async () => {
  logger.info('='.repeat(50));
  logger.info('News Video Generator Server Started');
  logger.info('='.repeat(50));
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API Base URL: http://localhost:${PORT}/api`);
  logger.info(`Health Check: http://localhost:${PORT}/api/health`);
  logger.info('='.repeat(50));
  
  // Initialize services
  try {
    // Initialize B-roll cache
    await broll.init();
    
    // Initialize analytics
    await analytics.init();
    
    // Start cron jobs if not in development
    if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_CRON === 'true') {
      cronService.init();
    }
    
    logger.info('Services initialized successfully');
  } catch (error) {
    logger.error('Service initialization failed:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;

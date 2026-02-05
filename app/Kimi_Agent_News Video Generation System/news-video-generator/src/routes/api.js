/**
 * API Routes
 * Defines all REST API endpoints for the news video generator
 */

const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const smartFilter = require('../services/smartFilter');
const videoProviders = require('../services/videoProviders');
const queue = require('../services/queue');
const storage = require('../services/storage');
const broll = require('../services/broll');
const analytics = require('../services/analytics');
const logger = require('../utils/logger');

// ============================================
// Video Generation Routes
// ============================================

/**
 * POST /api/generate-videos
 * Trigger the complete video generation pipeline
 */
router.post('/generate-videos', videoController.generateVideos.bind(videoController));

/**
 * GET /api/queue/status
 * Get job queue status
 */
router.get('/queue/status', async (req, res) => {
  try {
    const status = await queue.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/queue/pause
 * Pause video generation queue
 */
router.post('/queue/pause', async (req, res) => {
  try {
    await queue.pause();
    res.json({ success: true, message: 'Queue paused' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/queue/resume
 * Resume video generation queue
 */
router.post('/queue/resume', async (req, res) => {
  try {
    await queue.resume();
    res.json({ success: true, message: 'Queue resumed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// News Routes
// ============================================

/**
 * GET /api/news
 * Get current aggregated news articles
 */
router.get('/news', videoController.getNews.bind(videoController));

/**
 * POST /api/news/analyze
 * Analyze news items with smart filter
 */
router.post('/news/analyze', async (req, res) => {
  try {
    const { articles } = req.body;
    
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({
        success: false,
        error: 'Articles array is required'
      });
    }
    
    const analyzed = [];
    for (const article of articles.slice(0, 10)) {
      const result = await smartFilter.analyzeNews(article);
      analyzed.push(result);
    }
    
    res.json({
      success: true,
      analyzed,
      stats: smartFilter.getStats()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/news/filter
 * Filter articles for video generation
 */
router.post('/news/filter', async (req, res) => {
  try {
    const { articles, options = {} } = req.body;
    
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({
        success: false,
        error: 'Articles array is required'
      });
    }
    
    const filtered = await smartFilter.filterForVideos(articles, options);
    
    res.json({
      success: true,
      count: filtered.length,
      articles: filtered
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Video Management Routes
// ============================================

/**
 * GET /api/videos
 * List all generated videos
 */
router.get('/videos', videoController.getVideos.bind(videoController));

/**
 * GET /api/videos/:videoId
 * Get specific video details
 */
router.get('/videos/:videoId', videoController.getVideoById.bind(videoController));

/**
 * DELETE /api/videos/:videoId
 * Delete a video
 */
router.delete('/videos/:videoId', videoController.deleteVideo.bind(videoController));

// ============================================
// Storage Routes
// ============================================

/**
 * GET /api/storage/stats
 * Get storage statistics
 */
router.get('/storage/stats', async (req, res) => {
  try {
    const stats = await storage.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/storage/cleanup
 * Run storage cleanup
 */
router.post('/storage/cleanup', async (req, res) => {
  try {
    const result = await storage.runCleanup();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/storage/compress
 * Compress all videos
 */
router.post('/storage/compress', async (req, res) => {
  try {
    const result = await storage.compressAllVideos();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Provider Routes
// ============================================

/**
 * GET /api/providers/status
 * Get video provider status
 */
router.get('/providers/status', async (req, res) => {
  try {
    const status = await videoProviders.getProviderStatus();
    const quota = await videoProviders.checkQuota();
    
    res.json({
      success: true,
      providers: status,
      quota
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// B-Roll Routes
// ============================================

/**
 * POST /api/broll/search
 * Search for B-roll footage
 */
router.post('/broll/search', async (req, res) => {
  try {
    const { newsItem } = req.body;
    
    if (!newsItem) {
      return res.status(400).json({
        success: false,
        error: 'News item is required'
      });
    }
    
    const brollResult = await broll.getBRoll(newsItem);
    
    res.json({
      success: true,
      broll: brollResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/broll/cache
 * Get B-roll cache statistics
 */
router.get('/broll/cache', async (req, res) => {
  try {
    const stats = await broll.getCacheStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/broll/cache
 * Clear B-roll cache
 */
router.delete('/broll/cache', async (req, res) => {
  try {
    const result = await broll.clearCache();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Analytics Routes
// ============================================

/**
 * GET /api/analytics
 * Get analytics metrics
 */
router.get('/analytics', async (req, res) => {
  try {
    const metrics = analytics.getMetrics();
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/dashboard
 * Get dashboard data
 */
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const data = analytics.getDashboardData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/analytics/reset
 * Reset analytics data
 */
router.post('/analytics/reset', async (req, res) => {
  try {
    await analytics.reset();
    res.json({ success: true, message: 'Analytics reset' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Health & Status Routes
// ============================================

/**
 * GET /api/health
 * Get system health status
 */
router.get('/health', videoController.getHealth.bind(videoController));

/**
 * GET /api/status
 * Get current system status
 */
router.get('/status', async (req, res) => {
  try {
    const newsAggregator = require('../services/newsAggregator');
    const cacheStats = newsAggregator.getCacheStats();
    const storageStats = await storage.getStats();
    const queueStatus = await queue.getStatus();
    
    res.json({
      success: true,
      status: 'running',
      cache: cacheStats,
      storage: storageStats,
      queue: queueStatus,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// Impact Analysis Routes
// ============================================

/**
 * POST /api/analyze-impact
 * Analyze a specific article for impact
 */
router.post('/analyze-impact', async (req, res) => {
  try {
    const impactFilter = require('../services/impactFilter');
    const { article } = req.body;
    
    if (!article || !article.title) {
      return res.status(400).json({
        success: false,
        error: 'Article with title is required'
      });
    }
    
    const result = await impactFilter.analyzeArticle(article);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/generate-script
 * Generate a script from an article
 */
router.post('/generate-script', async (req, res) => {
  try {
    const scriptGenerator = require('../services/scriptGenerator');
    const { article } = req.body;
    
    if (!article || !article.title) {
      return res.status(400).json({
        success: false,
        error: 'Article with title is required'
      });
    }
    
    const script = await scriptGenerator.generateScript(article);
    
    res.json({
      success: true,
      script
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// Webhook Routes
// ============================================

/**
 * POST /api/webhooks/test
 * Test webhook configuration
 */
router.post('/webhooks/test', async (req, res) => {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    
    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        error: 'WEBHOOK_URL not configured'
      });
    }
    
    const response = await axios.post(webhookUrl, {
      event: 'test',
      timestamp: new Date().toISOString(),
      message: 'Webhook test'
    }, { timeout: 10000 });
    
    res.json({
      success: true,
      webhookStatus: response.status,
      message: 'Webhook test successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Webhook test failed: ${error.message}`
    });
  }
});

module.exports = router;

/**
 * Analytics Service
 * Tracks performance metrics, API usage, and system statistics
 * Provides monitoring endpoints for dashboards
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class Analytics {
  constructor() {
    this.metricsDir = path.join(__dirname, '../../output/metrics');
    this.metrics = {
      videosGenerated: 0,
      videosFailed: 0,
      apiCalls: {
        fal: 0,
        pexels: 0,
        ollama: 0
      },
      errors: [],
      generationTimes: [],
      topCategories: {},
      providerUsage: {
        wan: 0,
        mochi: 0,
        local: 0,
        template: 0
      },
      hourlyStats: new Map()
    };
    
    this.maxErrors = 100;
    this.maxGenerationTimes = 1000;
    this.startTime = Date.now();
    
    this.init();
  }

  /**
   * Initialize analytics
   */
  async init() {
    try {
      await fs.mkdir(this.metricsDir, { recursive: true });
      await this.loadMetrics();
      
      // Save metrics periodically
      setInterval(() => this.saveMetrics(), 5 * 60 * 1000); // Every 5 minutes
    } catch (error) {
      logger.error(`Analytics init failed: ${error.message}`);
    }
  }

  /**
   * Track video generation
   */
  trackVideoGenerated(provider, duration, category) {
    this.metrics.videosGenerated++;
    
    // Track provider usage
    if (this.metrics.providerUsage[provider] !== undefined) {
      this.metrics.providerUsage[provider]++;
    }
    
    // Track generation time
    this.metrics.generationTimes.push({
      timestamp: Date.now(),
      duration,
      provider
    });
    
    // Keep only recent times
    if (this.metrics.generationTimes.length > this.maxGenerationTimes) {
      this.metrics.generationTimes = this.metrics.generationTimes.slice(-this.maxGenerationTimes);
    }
    
    // Track category
    this.metrics.topCategories[category] = (this.metrics.topCategories[category] || 0) + 1;
    
    // Track hourly stats
    this.trackHourlyStat('videos', category);
  }

  /**
   * Track video generation failure
   */
  trackVideoFailed(error) {
    this.metrics.videosFailed++;
    this.trackError('video_generation', error);
  }

  /**
   * Track API call
   */
  trackApiCall(api, endpoint, success = true) {
    if (this.metrics.apiCalls[api] !== undefined) {
      this.metrics.apiCalls[api]++;
    }
    
    this.trackHourlyStat('api_calls', api);
  }

  /**
   * Track error
   */
  trackError(type, error) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      type,
      message: error.message || error,
      stack: error.stack
    });
    
    // Keep only recent errors
    if (this.metrics.errors.length > this.maxErrors) {
      this.metrics.errors = this.metrics.errors.slice(-this.maxErrors);
    }
    
    this.trackHourlyStat('errors', type);
  }

  /**
   * Track hourly statistics
   */
  trackHourlyStat(metric, subcategory) {
    const hour = new Date().toISOString().substring(0, 13); // YYYY-MM-DDTHH
    const key = `${hour}:${metric}:${subcategory}`;
    
    const current = this.metrics.hourlyStats.get(key) || 0;
    this.metrics.hourlyStats.set(key, current + 1);
    
    // Clean old stats (keep last 48 hours)
    const cutoff = Date.now() - (48 * 60 * 60 * 1000);
    for (const [k, v] of this.metrics.hourlyStats) {
      const hourTime = new Date(k.substring(0, 13) + ':00:00').getTime();
      if (hourTime < cutoff) {
        this.metrics.hourlyStats.delete(k);
      }
    }
  }

  /**
   * Get average generation time
   */
  getAverageGenerationTime() {
    if (this.metrics.generationTimes.length === 0) return 0;
    
    const total = this.metrics.generationTimes.reduce((sum, item) => sum + item.duration, 0);
    return Math.round(total / this.metrics.generationTimes.length);
  }

  /**
   * Get success rate
   */
  getSuccessRate() {
    const total = this.metrics.videosGenerated + this.metrics.videosFailed;
    if (total === 0) return 100;
    
    return Math.round((this.metrics.videosGenerated / total) * 100);
  }

  /**
   * Get top categories
   */
  getTopCategories(limit = 5) {
    return Object.entries(this.metrics.topCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([category, count]) => ({ category, count }));
  }

  /**
   * Get hourly stats for last N hours
   */
  getHourlyStats(hours = 24) {
    const stats = {};
    const now = new Date();
    
    for (let i = 0; i < hours; i++) {
      const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const hourKey = hour.toISOString().substring(0, 13);
      
      stats[hourKey] = {
        videos: 0,
        api_calls: 0,
        errors: 0
      };
      
      // Sum up stats for this hour
      for (const [key, count] of this.metrics.hourlyStats) {
        if (key.startsWith(hourKey)) {
          const metric = key.split(':')[1];
          stats[hourKey][metric] = (stats[hourKey][metric] || 0) + count;
        }
      }
    }
    
    return stats;
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return {
      uptime: Date.now() - this.startTime,
      uptimeFormatted: this.formatUptime(Date.now() - this.startTime),
      videos: {
        generated: this.metrics.videosGenerated,
        failed: this.metrics.videosFailed,
        successRate: this.getSuccessRate()
      },
      performance: {
        averageGenerationTime: this.getAverageGenerationTime(),
        averageGenerationTimeFormatted: this.formatDuration(this.getAverageGenerationTime())
      },
      apiCalls: this.metrics.apiCalls,
      providerUsage: this.metrics.providerUsage,
      topCategories: this.getTopCategories(),
      recentErrors: this.metrics.errors.slice(-10),
      hourlyStats: this.getHourlyStats(12)
    };
  }

  /**
   * Get dashboard data
   */
  getDashboardData() {
    return {
      summary: {
        totalVideos: this.metrics.videosGenerated,
        successRate: this.getSuccessRate(),
        avgGenerationTime: this.formatDuration(this.getAverageGenerationTime()),
        uptime: this.formatUptime(Date.now() - this.startTime)
      },
      charts: {
        hourly: this.getHourlyStats(24),
        categories: this.getTopCategories(10),
        providers: this.metrics.providerUsage
      },
      recent: {
        errors: this.metrics.errors.slice(-5),
        generationTimes: this.metrics.generationTimes.slice(-10)
      }
    };
  }

  /**
   * Save metrics to file
   */
  async saveMetrics() {
    try {
      const metricsPath = path.join(this.metricsDir, 'metrics.json');
      
      // Convert Map to object for JSON serialization
      const data = {
        ...this.metrics,
        hourlyStats: Object.fromEntries(this.metrics.hourlyStats),
        savedAt: new Date().toISOString()
      };
      
      await fs.writeFile(metricsPath, JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error(`Failed to save metrics: ${error.message}`);
    }
  }

  /**
   * Load metrics from file
   */
  async loadMetrics() {
    try {
      const metricsPath = path.join(this.metricsDir, 'metrics.json');
      const data = await fs.readFile(metricsPath, 'utf8');
      const parsed = JSON.parse(data);
      
      this.metrics.videosGenerated = parsed.videosGenerated || 0;
      this.metrics.videosFailed = parsed.videosFailed || 0;
      this.metrics.apiCalls = parsed.apiCalls || { fal: 0, pexels: 0, ollama: 0 };
      this.metrics.topCategories = parsed.topCategories || {};
      this.metrics.providerUsage = parsed.providerUsage || { wan: 0, mochi: 0, local: 0, template: 0 };
      
      // Restore hourly stats
      if (parsed.hourlyStats) {
        this.metrics.hourlyStats = new Map(Object.entries(parsed.hourlyStats));
      }
      
      logger.info('Metrics loaded from file');
    } catch (error) {
      // File might not exist, start fresh
      logger.info('Starting with fresh metrics');
    }
  }

  /**
   * Reset metrics
   */
  async reset() {
    this.metrics = {
      videosGenerated: 0,
      videosFailed: 0,
      apiCalls: { fal: 0, pexels: 0, ollama: 0 },
      errors: [],
      generationTimes: [],
      topCategories: {},
      providerUsage: { wan: 0, mochi: 0, local: 0, template: 0 },
      hourlyStats: new Map()
    };
    
    this.startTime = Date.now();
    
    await this.saveMetrics();
    logger.info('Metrics reset');
  }

  /**
   * Format duration in ms to readable string
   */
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  /**
   * Format uptime to readable string
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

module.exports = new Analytics();

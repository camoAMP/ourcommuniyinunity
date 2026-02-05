/**
 * B-Roll Service
 * Integrates stock footage from Pexels and other sources
 * Provides contextual video backgrounds for news stories
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

// Stock footage keywords mapping
const STOCK_KEYWORDS = {
  // Finance
  'stock market': ['stock market', 'trading', 'finance', 'wall street'],
  'bitcoin': ['bitcoin', 'cryptocurrency', 'crypto', 'blockchain'],
  'ethereum': ['ethereum', 'cryptocurrency', 'blockchain'],
  'fed': ['federal reserve', 'central bank', 'economy'],
  'earnings': ['business meeting', 'corporate', 'office'],
  'ipo': ['stock exchange', 'trading floor', 'finance'],
  'merger': ['handshake', 'business deal', 'corporate'],
  'bankruptcy': ['empty office', 'closed business', 'for sale sign'],
  
  // Tech
  'ai': ['artificial intelligence', 'technology', 'robot', 'computer'],
  'artificial intelligence': ['ai', 'technology', 'robot', 'data center'],
  'product launch': ['product reveal', 'technology', 'presentation'],
  'software': ['coding', 'programming', 'computer screen'],
  'hack': ['hacker', 'cybersecurity', 'computer code'],
  'data breach': ['security', 'hacking', 'cyber crime'],
  
  // General news
  'fire': ['fire', 'emergency', 'flames'],
  'explosion': ['explosion', 'blast', 'destruction'],
  'earthquake': ['earthquake', 'disaster', 'rubble'],
  'flood': ['flood', 'disaster', 'water damage'],
  'war': ['military', 'conflict', 'soldiers'],
  'protest': ['protest', 'demonstration', 'crowd'],
  'election': ['voting', 'ballot', 'election'],
  'arrest': ['police', 'handcuffs', 'crime'],
  'scandal': ['news press', 'media', 'controversy']
};

// Template videos for common scenarios
const VIDEO_TEMPLATES = {
  market_crash: {
    bgVideo: 'templates/market_crash_bg.mp4',
    overlays: ['red_arrows', 'falling_chart'],
    colorScheme: { r: 200, g: 50, b: 50 },  // Red
    music: 'dramatic'
  },
  market_surge: {
    bgVideo: 'templates/market_surge_bg.mp4',
    overlays: ['green_arrows', 'rising_chart'],
    colorScheme: { r: 50, g: 200, b: 50 },  // Green
    music: 'upbeat'
  },
  crypto_bull: {
    bgVideo: 'templates/crypto_bg.mp4',
    overlays: ['btc_logo', 'green_candles'],
    colorScheme: { r: 247, g: 147, b: 26 },  // Bitcoin orange
    music: 'techno'
  },
  tech_launch: {
    bgVideo: 'templates/tech_launch_bg.mp4',
    overlays: ['tech_graphics', 'glowing_lines'],
    colorScheme: { r: 50, g: 150, b: 255 },  // Tech blue
    music: 'modern'
  },
  breaking_news: {
    bgVideo: 'templates/news_bg.mp4',
    overlays: ['news_banner', 'world_map'],
    colorScheme: { r: 200, g: 0, b: 0 },  // News red
    music: 'urgent'
  },
  neutral: {
    bgVideo: 'templates/neutral_bg.mp4',
    overlays: [],
    colorScheme: { r: 100, g: 100, b: 100 },
    music: 'neutral'
  }
};

class BRollService {
  constructor() {
    this.pexelsApiKey = process.env.PEXELS_API_KEY || '';
    this.pexelsBaseUrl = 'https://api.pexels.com/videos';
    this.cacheDir = path.join(__dirname, '../../output/broll_cache');
    this.templatesDir = path.join(__dirname, '../../templates');
    this.cacheEnabled = true;
    
    // Rate limiting for Pexels (200 requests/hour on free tier)
    this.requestCount = 0;
    this.requestWindow = 60 * 60 * 1000; // 1 hour
    this.maxRequests = 200;
    this.requestTimestamps = [];
  }

  /**
   * Initialize cache directory
   */
  async init() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      logger.info('B-roll cache directory initialized');
    } catch (error) {
      logger.error(`Failed to init B-roll cache: ${error.message}`);
    }
  }

  /**
   * Check rate limit
   */
  checkRateLimit() {
    const now = Date.now();
    
    // Remove old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(
      ts => now - ts < this.requestWindow
    );
    
    return {
      remaining: this.maxRequests - this.requestTimestamps.length,
      canRequest: this.requestTimestamps.length < this.maxRequests
    };
  }

  /**
   * Log API request
   */
  logRequest() {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Search for stock footage on Pexels
   */
  async searchPexels(query, options = {}) {
    if (!this.pexelsApiKey) {
      logger.warn('Pexels API key not configured');
      return null;
    }
    
    const rateLimit = this.checkRateLimit();
    if (!rateLimit.canRequest) {
      logger.warn('Pexels rate limit exceeded');
      return null;
    }
    
    try {
      const { 
        perPage = 5, 
        orientation = 'landscape',
        size = 'large' 
      } = options;
      
      logger.info(`Searching Pexels for: ${query}`);
      
      const response = await axios.get(
        `${this.pexelsBaseUrl}/search`,
        {
          headers: {
            'Authorization': this.pexelsApiKey
          },
          params: {
            query,
            per_page: perPage,
            orientation,
            size
          },
          timeout: 10000
        }
      );
      
      this.logRequest();
      
      if (response.data?.videos?.length > 0) {
        return response.data.videos;
      }
      
      return null;
    } catch (error) {
      logger.error(`Pexels search failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Download video from URL
   */
  async downloadVideo(url, outputPath) {
    try {
      logger.info(`Downloading video to: ${outputPath}`);
      
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 60000
      });
      
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, response.data);
      
      return true;
    } catch (error) {
      logger.error(`Video download failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get cached video or download new one
   */
  async getCachedVideo(query, videoUrl) {
    const cacheKey = Buffer.from(query + videoUrl).toString('base64').substring(0, 20);
    const cachePath = path.join(this.cacheDir, `${cacheKey}.mp4`);
    
    try {
      // Check if cached
      await fs.access(cachePath);
      logger.info(`Using cached video for: ${query}`);
      return cachePath;
    } catch {
      // Download and cache
      const success = await this.downloadVideo(videoUrl, cachePath);
      return success ? cachePath : null;
    }
  }

  /**
   * Find relevant stock footage for news item
   */
  async findStockFootage(newsItem) {
    const text = `${newsItem.title} ${newsItem.content || ''}`.toLowerCase();
    
    // Find matching keywords
    const matchedKeywords = [];
    for (const [key, searchTerms] of Object.entries(STOCK_KEYWORDS)) {
      if (text.includes(key.toLowerCase())) {
        matchedKeywords.push(...searchTerms);
      }
    }
    
    // Remove duplicates
    const uniqueKeywords = [...new Set(matchedKeywords)];
    
    if (uniqueKeywords.length === 0) {
      // Default search
      uniqueKeywords.push('news', 'business');
    }
    
    // Try each keyword until we find footage
    for (const keyword of uniqueKeywords.slice(0, 3)) {
      const videos = await this.searchPexels(keyword);
      
      if (videos && videos.length > 0) {
        // Get best quality video file
        const video = videos[0];
        const videoFile = video.video_files
          .filter(vf => vf.quality === 'hd' || vf.quality === 'sd')
          .sort((a, b) => b.width - a.width)[0];
        
        if (videoFile) {
          const cachedPath = await this.getCachedVideo(keyword, videoFile.link);
          if (cachedPath) {
            return {
              path: cachedPath,
              keyword,
              duration: video.duration,
              width: videoFile.width,
              height: videoFile.height,
              source: 'pexels'
            };
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Get video template for news category
   */
  getTemplate(newsItem) {
    const text = `${newsItem.title} ${newsItem.content || ''}`.toLowerCase();
    const category = newsItem.category || 'general';
    
    // Determine template based on content
    if (text.includes('crash') || text.includes('plunge') || text.includes('collapse')) {
      return { ...VIDEO_TEMPLATES.market_crash, type: 'market_crash' };
    }
    
    if (text.includes('surge') || text.includes('rally') || text.includes('soar')) {
      return { ...VIDEO_TEMPLATES.market_surge, type: 'market_surge' };
    }
    
    if (category === 'crypto' || text.includes('bitcoin') || text.includes('crypto')) {
      return { ...VIDEO_TEMPLATES.crypto_bull, type: 'crypto_bull' };
    }
    
    if (category === 'tech' || text.includes('launch') || text.includes('product')) {
      return { ...VIDEO_TEMPLATES.tech_launch, type: 'tech_launch' };
    }
    
    if (text.includes('breaking') || text.includes('urgent') || text.includes('emergency')) {
      return { ...VIDEO_TEMPLATES.breaking_news, type: 'breaking_news' };
    }
    
    return { ...VIDEO_TEMPLATES.neutral, type: 'neutral' };
  }

  /**
   * Get B-roll for news item (stock footage or template)
   */
  async getBRoll(newsItem, options = {}) {
    const { preferStock = true, preferTemplate = false } = options;
    
    // Try stock footage first if preferred
    if (preferStock && !preferTemplate) {
      const stock = await this.findStockFootage(newsItem);
      if (stock) {
        return { ...stock, isTemplate: false };
      }
    }
    
    // Fall back to template
    const template = this.getTemplate(newsItem);
    const templatePath = path.join(this.templatesDir, template.bgVideo);
    
    // Check if template exists
    try {
      await fs.access(templatePath);
      return {
        path: templatePath,
        type: template.type,
        overlays: template.overlays,
        colorScheme: template.colorScheme,
        isTemplate: true
      };
    } catch {
      // Template doesn't exist, try stock footage
      if (!preferStock) {
        const stock = await this.findStockFootage(newsItem);
        if (stock) {
          return { ...stock, isTemplate: false };
        }
      }
    }
    
    return null;
  }

  /**
   * Get multiple B-roll clips for a story
   */
  async getMultipleBRoll(newsItem, count = 3) {
    const clips = [];
    const text = `${newsItem.title} ${newsItem.content || ''}`.toLowerCase();
    
    // Extract keywords
    const keywords = [];
    for (const [key, searchTerms] of Object.entries(STOCK_KEYWORDS)) {
      if (text.includes(key.toLowerCase())) {
        keywords.push(...searchTerms);
      }
    }
    
    const uniqueKeywords = [...new Set(keywords)].slice(0, count);
    
    for (const keyword of uniqueKeywords) {
      const videos = await this.searchPexels(keyword, { perPage: 1 });
      
      if (videos?.length > 0) {
        const video = videos[0];
        const videoFile = video.video_files
          .filter(vf => vf.quality === 'hd' || vf.quality === 'sd')
          .sort((a, b) => b.width - a.width)[0];
        
        if (videoFile) {
          const cachedPath = await this.getCachedVideo(keyword, videoFile.link);
          if (cachedPath) {
            clips.push({
              path: cachedPath,
              keyword,
              duration: video.duration,
              source: 'pexels'
            });
          }
        }
      }
    }
    
    return clips;
  }

  /**
   * Clear B-roll cache
   */
  async clearCache() {
    try {
      const files = await fs.readdir(this.cacheDir);
      
      for (const file of files) {
        await fs.unlink(path.join(this.cacheDir, file));
      }
      
      logger.info(`Cleared ${files.length} files from B-roll cache`);
      return { cleared: files.length };
    } catch (error) {
      logger.error(`Failed to clear cache: ${error.message}`);
      return { cleared: 0, error: error.message };
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const files = await fs.readdir(this.cacheDir);
      let totalSize = 0;
      
      for (const file of files) {
        const stats = await fs.stat(path.join(this.cacheDir, file));
        totalSize += stats.size;
      }
      
      return {
        files: files.length,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize)
      };
    } catch (error) {
      return { files: 0, totalSize: 0 };
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new BRollService();

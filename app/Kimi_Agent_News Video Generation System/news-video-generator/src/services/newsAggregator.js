/**
 * News Aggregator Service
 * Fetches and parses RSS feeds from multiple news sources
 * Caches results for efficient retrieval
 */

const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

// Custom RSS parser with timeout and user agent
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  customFields: {
    item: ['media:content', 'enclosure', 'content:encoded']
  }
});

class NewsAggregator {
  constructor() {
    // Cache with 2-hour TTL
    this.cache = new NodeCache({ 
      stdTTL: parseInt(process.env.CACHE_TTL) || 7200,
      checkperiod: 120
    });
    
    this.feedsConfig = null;
    this.lastFetchTime = null;
  }

  /**
   * Load feed configuration from JSON file
   */
  async loadFeedConfig() {
    try {
      const configPath = path.join(__dirname, '../../config/feeds.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.feedsConfig = JSON.parse(configData);
      logger.info('Feed configuration loaded successfully');
      return this.feedsConfig;
    } catch (error) {
      logger.error('Failed to load feed configuration:', error.message);
      throw error;
    }
  }

  /**
   * Fetch a single RSS feed with error handling
   */
  async fetchFeed(feedInfo) {
    try {
      logger.info(`Fetching feed: ${feedInfo.name} (${feedInfo.url})`);
      
      const feed = await parser.parseURL(feedInfo.url);
      
      const articles = feed.items.map(item => ({
        title: item.title?.trim() || 'Untitled',
        content: this.extractContent(item),
        summary: item.contentSnippet?.substring(0, 300) || 
                 item.content?.substring(0, 300) || 
                 '',
        source: feedInfo.name,
        category: feedInfo.category,
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        link: item.link || '',
        guid: item.guid || item.id || item.link,
        author: item.author || item.creator || 'Unknown',
        image: this.extractImage(item),
        fetchedAt: new Date().toISOString()
      }));

      logger.info(`Fetched ${articles.length} articles from ${feedInfo.name}`);
      return articles;
    } catch (error) {
      logger.error(`Failed to fetch feed ${feedInfo.name}:`, error.message);
      return []; // Return empty array on error to continue with other feeds
    }
  }

  /**
   * Extract full content from RSS item
   */
  extractContent(item) {
    // Try different content fields
    const content = item['content:encoded'] || 
                   item.content || 
                   item.contentSnippet || 
                   item.description || 
                   '';
    
    // Strip HTML tags
    return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Extract image URL from RSS item
   */
  extractImage(item) {
    // Try different image sources
    if (item.enclosure?.url) {
      return item.enclosure.url;
    }
    if (item['media:content']?.$.url) {
      return item['media:content'].$.url;
    }
    // Extract from content
    const imgMatch = item['content:encoded']?.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch) {
      return imgMatch[1];
    }
    return null;
  }

  /**
   * Fetch all configured feeds
   */
  async fetchAllFeeds() {
    // Check cache first
    const cached = this.cache.get('allArticles');
    if (cached) {
      logger.info('Returning cached articles');
      return cached;
    }

    // Load config if not loaded
    if (!this.feedsConfig) {
      await this.loadFeedConfig();
    }

    // Get enabled categories
    const enabledCategories = (process.env.ENABLED_CATEGORIES || 'finance,tech,crypto')
      .split(',')
      .map(c => c.trim());

    const allArticles = [];
    const feedPromises = [];

    // Collect all feeds from enabled categories
    for (const category of enabledCategories) {
      if (this.feedsConfig[category]) {
        for (const feed of this.feedsConfig[category]) {
          feedPromises.push(this.fetchFeed(feed));
        }
      }
    }

    // Fetch all feeds in parallel with timeout
    const results = await Promise.allSettled(feedPromises);
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        allArticles.push(...result.value);
      }
    }

    // Sort by publication date (newest first)
    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Limit total articles
    const maxArticles = parseInt(process.env.MAX_ARTICLES_TO_FETCH) || 50;
    const limitedArticles = allArticles.slice(0, maxArticles);

    // Cache results
    this.cache.set('allArticles', limitedArticles);
    this.lastFetchTime = new Date().toISOString();

    logger.info(`Total articles fetched: ${limitedArticles.length}`);
    return limitedArticles;
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(category) {
    const allArticles = await this.fetchAllFeeds();
    return allArticles.filter(article => article.category === category);
  }

  /**
   * Get recent articles (last N hours)
   */
  async getRecentArticles(hours = 24) {
    const allArticles = await this.fetchAllFeeds();
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return allArticles.filter(article => 
      new Date(article.pubDate) >= cutoffTime
    );
  }

  /**
   * Search articles by keyword
   */
  async searchArticles(keyword) {
    const allArticles = await this.fetchAllFeeds();
    const lowerKeyword = keyword.toLowerCase();
    
    return allArticles.filter(article => 
      article.title.toLowerCase().includes(lowerKeyword) ||
      article.content.toLowerCase().includes(lowerKeyword) ||
      article.summary.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Clear cache and force refresh
   */
  async refreshFeeds() {
    this.cache.del('allArticles');
    logger.info('Cache cleared, fetching fresh articles');
    return await this.fetchAllFeeds();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      keys: this.cache.keys(),
      stats: this.cache.getStats(),
      lastFetchTime: this.lastFetchTime
    };
  }
}

// Export singleton instance
module.exports = new NewsAggregator();

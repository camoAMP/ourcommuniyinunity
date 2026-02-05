/**
 * Smart Content Filter Service
 * Advanced news analysis with impact scoring, category classification,
 * video worthiness detection, and duplicate detection
 */

const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Impact categories with scores
const IMPACT_CATEGORIES = {
  CRITICAL: 5,  // Market crash, major hack, war, natural disaster
  HIGH: 4,      // Earnings surprise, acquisition, major policy change
  MEDIUM: 3,    // Product launch, regulation, leadership change
  LOW: 2,       // Routine news, minor updates
  IGNORE: 1     // Ads, press releases, fluff
};

// Keywords that indicate video worthiness
const VIDEO_WORTHY_KEYWORDS = [
  'crash', 'surge', 'explosion', 'launch', 'fire', 'breakthrough',
  'arrest', 'acquisition', 'scandal', 'collapse', 'rally', 'plunge',
  'merger', 'bankruptcy', 'ipo', 'hack', 'breach', 'scandal',
  'resign', 'fired', 'appointed', 'banned', 'approved', 'rejected',
  'record high', 'record low', 'all time', 'historic', 'unprecedented',
  'emergency', 'crisis', 'war', 'conflict', 'sanctions'
];

// Category keywords
const CATEGORY_KEYWORDS = {
  finance: ['stock', 'market', 'earnings', 'revenue', 'profit', 'loss', 'fed', 'interest rate', 'inflation', 'gdp', 'economy'],
  crypto: ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'defi', 'nft', 'token', 'mining', 'wallet'],
  tech: ['ai', 'artificial intelligence', 'software', 'app', 'product', 'launch', 'update', 'feature'],
  politics: ['election', 'government', 'policy', 'law', 'regulation', 'vote', 'congress', 'senate'],
  disaster: ['earthquake', 'flood', 'hurricane', 'fire', 'explosion', 'crash', 'accident']
};

class SmartFilter {
  constructor() {
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2';
    
    // Store for generated content hashes (for duplicate detection)
    this.generatedHashes = new Set();
    this.maxStoredHashes = 1000;
    
    // Embedding cache
    this.embeddingCache = new Map();
    this.maxCacheSize = 500;
  }

  /**
   * Analyze news with comprehensive scoring
   */
  async analyzeNews(newsItem) {
    try {
      logger.info(`Analyzing: ${newsItem.title.substring(0, 60)}...`);
      
      // Calculate various scores
      const impactScore = await this.calculateImpactScore(newsItem);
      const category = this.classifyCategory(newsItem);
      const videoWorthy = this.checkVideoWorthiness(newsItem);
      const noveltyScore = await this.calculateNovelty(newsItem);
      const isDuplicate = this.checkDuplicate(newsItem);
      
      // Combined score (0-100)
      const combinedScore = this.calculateCombinedScore({
        impactScore,
        videoWorthy,
        noveltyScore,
        isDuplicate
      });
      
      const result = {
        ...newsItem,
        analysis: {
          impactScore,
          impactCategory: this.getImpactCategory(impactScore),
          category,
          videoWorthy,
          noveltyScore,
          isDuplicate,
          combinedScore,
          analyzedAt: new Date().toISOString()
        }
      };
      
      logger.info(`Analysis complete - Score: ${combinedScore}/100, Category: ${category}, Video: ${videoWorthy}`);
      
      return result;
    } catch (error) {
      logger.error(`Analysis failed: ${error.message}`);
      
      // Return with default scores on error
      return {
        ...newsItem,
        analysis: {
          impactScore: 2,
          impactCategory: 'LOW',
          category: newsItem.category || 'general',
          videoWorthy: false,
          noveltyScore: 50,
          isDuplicate: false,
          combinedScore: 20,
          error: error.message,
          analyzedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Calculate impact score using AI
   */
  async calculateImpactScore(newsItem) {
    const prompt = `Analyze this news headline and rate its impact on a scale of 1-5:

Title: ${newsItem.title}
Content: ${newsItem.content?.substring(0, 500) || newsItem.summary}
Source: ${newsItem.source}

Rate based on:
5 = CRITICAL: Market crash, major hack, war, natural disaster, major CEO scandal
4 = HIGH: Earnings surprise, acquisition, major policy change, significant market movement
3 = MEDIUM: Product launch, regulation, leadership change, moderate market impact
2 = LOW: Routine news, minor updates, small market impact
1 = IGNORE: Ads, press releases, promotional content

Respond with ONLY a number from 1-5.`;

    try {
      const response = await this.callOllama(prompt, { temperature: 0.1, maxTokens: 5 });
      const score = parseInt(response.trim());
      
      if (score >= 1 && score <= 5) {
        return score;
      }
    } catch (error) {
      logger.warn(`AI impact scoring failed, using keyword fallback: ${error.message}`);
    }
    
    // Fallback to keyword-based scoring
    return this.keywordImpactScore(newsItem);
  }

  /**
   * Keyword-based impact scoring (fallback)
   */
  keywordImpactScore(newsItem) {
    const text = `${newsItem.title} ${newsItem.content || ''}`.toLowerCase();
    
    const criticalKeywords = ['crash', 'collapse', 'bankruptcy', 'war', 'hack', 'breach', 'emergency'];
    const highKeywords = ['surge', 'plunge', 'acquisition', 'merger', 'earnings', 'ipo', 'scandal'];
    const mediumKeywords = ['launch', 'update', 'appointed', 'resigned', 'regulation'];
    
    if (criticalKeywords.some(k => text.includes(k))) return 5;
    if (highKeywords.some(k => text.includes(k))) return 4;
    if (mediumKeywords.some(k => text.includes(k))) return 3;
    
    return 2;
  }

  /**
   * Get impact category name from score
   */
  getImpactCategory(score) {
    if (score >= 5) return 'CRITICAL';
    if (score >= 4) return 'HIGH';
    if (score >= 3) return 'MEDIUM';
    if (score >= 2) return 'LOW';
    return 'IGNORE';
  }

  /**
   * Classify news category
   */
  classifyCategory(newsItem) {
    const text = `${newsItem.title} ${newsItem.content || ''}`.toLowerCase();
    
    // Check each category
    const scores = {};
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      scores[cat] = keywords.filter(k => text.includes(k)).length;
    }
    
    // Get highest scoring category
    const bestCategory = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (bestCategory && bestCategory[1] > 0) {
      return bestCategory[0];
    }
    
    return newsItem.category || 'general';
  }

  /**
   * Check if news is video-worthy
   */
  checkVideoWorthiness(newsItem) {
    const text = `${newsItem.title} ${newsItem.content || ''}`.toLowerCase();
    
    // Check for video-worthy keywords
    const hasKeywords = VIDEO_WORTHY_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
    
    // Check for visual elements
    const visualKeywords = ['video', 'image', 'photo', 'footage', 'shows', 'captured'];
    const hasVisualElements = visualKeywords.some(kw => text.includes(kw));
    
    return hasKeywords || hasVisualElements;
  }

  /**
   * Calculate novelty score using embeddings
   */
  async calculateNovelty(newsItem) {
    try {
      // Generate embedding for the news item
      const embedding = await this.getEmbedding(newsItem.title);
      
      // Compare with cached embeddings
      let maxSimilarity = 0;
      
      for (const [cachedHash, cachedEmbedding] of this.embeddingCache) {
        const similarity = this.cosineSimilarity(embedding, cachedEmbedding);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
      
      // Cache this embedding
      this.cacheEmbedding(newsItem.title, embedding);
      
      // Novelty score: 100 = completely new, 0 = exact duplicate
      return Math.round((1 - maxSimilarity) * 100);
      
    } catch (error) {
      logger.warn(`Embedding novelty calculation failed: ${error.message}`);
      return 50; // Default medium novelty
    }
  }

  /**
   * Get embedding from Ollama
   */
  async getEmbedding(text) {
    try {
      const response = await axios.post(
        `${this.ollamaHost}/api/embeddings`,
        {
          model: this.model,
          prompt: text
        },
        { timeout: 30000 }
      );
      
      return response.data.embedding;
    } catch (error) {
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Cache embedding with LRU eviction
   */
  cacheEmbedding(text, embedding) {
    const hash = this.hashText(text);
    
    // Evict oldest if cache is full
    if (this.embeddingCache.size >= this.maxCacheSize) {
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
    }
    
    this.embeddingCache.set(hash, embedding);
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Check for duplicate content
   */
  checkDuplicate(newsItem) {
    const hash = this.hashNewsItem(newsItem);
    return this.generatedHashes.has(hash);
  }

  /**
   * Mark news item as generated
   */
  markAsGenerated(newsItem) {
    const hash = this.hashNewsItem(newsItem);
    
    // Evict oldest if too many stored
    if (this.generatedHashes.size >= this.maxStoredHashes) {
      const firstValue = this.generatedHashes.values().next().value;
      this.generatedHashes.delete(firstValue);
    }
    
    this.generatedHashes.add(hash);
  }

  /**
   * Hash news item for duplicate detection
   */
  hashNewsItem(newsItem) {
    const text = `${newsItem.title}|${newsItem.source}|${newsItem.category}`;
    return this.hashText(text);
  }

  /**
   * Hash text using MD5
   */
  hashText(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * Calculate combined score
   */
  calculateCombinedScore({ impactScore, videoWorthy, noveltyScore, isDuplicate }) {
    if (isDuplicate) return 0;
    
    // Weight factors
    const impactWeight = 0.4;
    const videoWeight = 0.3;
    const noveltyWeight = 0.3;
    
    // Normalize scores
    const normalizedImpact = (impactScore / 5) * 100;
    const videoScore = videoWorthy ? 100 : 30;
    
    // Calculate weighted score
    const combined = 
      (normalizedImpact * impactWeight) +
      (videoScore * videoWeight) +
      (noveltyScore * noveltyWeight);
    
    return Math.round(combined);
  }

  /**
   * Filter and rank articles for video generation
   */
  async filterForVideos(articles, options = {}) {
    const {
      minScore = 60,
      maxResults = 5,
      requireVideoWorthy = true,
      excludeDuplicates = true
    } = options;
    
    logger.info(`Filtering ${articles.length} articles for video generation...`);
    
    // Analyze all articles
    const analyzedArticles = [];
    
    for (const article of articles.slice(0, 30)) { // Limit to top 30
      const analyzed = await this.analyzeNews(article);
      analyzedArticles.push(analyzed);
      
      // Small delay to avoid overwhelming Ollama
      await this.sleep(200);
    }
    
    // Filter based on criteria
    let filtered = analyzedArticles.filter(a => {
      const analysis = a.analysis;
      
      if (analysis.combinedScore < minScore) return false;
      if (requireVideoWorthy && !analysis.videoWorthy) return false;
      if (excludeDuplicates && analysis.isDuplicate) return false;
      
      return true;
    });
    
    // Sort by combined score (highest first)
    filtered.sort((a, b) => b.analysis.combinedScore - a.analysis.combinedScore);
    
    // Limit results
    const results = filtered.slice(0, maxResults);
    
    // Mark selected articles as generated
    for (const article of results) {
      this.markAsGenerated(article);
    }
    
    logger.info(`Selected ${results.length} articles for video generation`);
    
    return results;
  }

  /**
   * Call Ollama API
   */
  async callOllama(prompt, options = {}) {
    const { temperature = 0.1, maxTokens = 100 } = options;
    
    const response = await axios.post(
      `${this.ollamaHost}/api/generate`,
      {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens
        }
      },
      { timeout: 60000 }
    );
    
    return response.data.response?.trim() || '';
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      cachedEmbeddings: this.embeddingCache.size,
      storedHashes: this.generatedHashes.size,
      categories: Object.keys(CATEGORY_KEYWORDS),
      videoWorthyKeywords: VIDEO_WORTHY_KEYWORDS.length
    };
  }
}

module.exports = new SmartFilter();

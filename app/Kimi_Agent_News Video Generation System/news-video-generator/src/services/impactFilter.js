/**
 * High-Impact Filter Service
 * Uses Ollama (llama3.2) to classify news articles by impact level
 * Filters for market-moving, breaking news, and significant events
 */

const axios = require('axios');
const logger = require('../utils/logger');

class ImpactFilter {
  constructor() {
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2';
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  /**
   * Build the impact analysis prompt
   */
  buildImpactPrompt(article) {
    return `Analyze this news headline and determine if it is HIGH-IMPACT (market-moving, major breaking news, significant events, earnings reports, mergers, acquisitions, regulatory changes, major product launches, CEO changes, economic indicators, geopolitical events).

Title: ${article.title}
Content: ${article.content?.substring(0, 500) || article.summary}
Source: ${article.source}
Category: ${article.category}

Consider these HIGH-IMPACT criteria:
- Market-moving financial news (earnings, M&A, stock movements)
- Breaking major events (disasters, conflicts, major announcements)
- Significant regulatory or policy changes
- Major product launches or technological breakthroughs
- Leadership changes in major companies
- Economic indicators (GDP, inflation, employment)
- Geopolitical events affecting markets

Respond with ONLY ONE WORD: HIGH or LOW`;
  }

  /**
   * Call Ollama API with retry logic
   */
  async callOllama(prompt, retries = 0) {
    try {
      const response = await axios.post(
        `${this.ollamaHost}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 10
          }
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.response?.trim().toUpperCase();
    } catch (error) {
      if (retries < this.maxRetries) {
        logger.warn(`Ollama call failed, retrying (${retries + 1}/${this.maxRetries})...`);
        await this.sleep(this.retryDelay * (retries + 1));
        return this.callOllama(prompt, retries + 1);
      }
      
      logger.error('Ollama API error:', error.message);
      throw error;
    }
  }

  /**
   * Sleep utility for retries
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Analyze a single article for impact
   */
  async analyzeArticle(article) {
    try {
      const prompt = this.buildImpactPrompt(article);
      const response = await this.callOllama(prompt);
      
      // Parse response - should be HIGH or LOW
      const isHighImpact = response.includes('HIGH');
      
      logger.info(`Article "${article.title.substring(0, 50)}..." - Impact: ${isHighImpact ? 'HIGH' : 'LOW'}`);
      
      return {
        ...article,
        impact: isHighImpact ? 'HIGH' : 'LOW',
        impactScore: isHighImpact ? 1 : 0,
        analyzedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to analyze article "${article.title}":`, error.message);
      
      // Return as LOW impact on error to avoid blocking pipeline
      return {
        ...article,
        impact: 'ERROR',
        impactScore: 0,
        error: error.message,
        analyzedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze multiple articles in parallel
   */
  async analyzeArticles(articles, maxArticles = 20) {
    // Limit to top N most recent articles
    const limitedArticles = articles.slice(0, maxArticles);
    
    logger.info(`Analyzing ${limitedArticles.length} articles for impact...`);
    
    // Process in batches to avoid overwhelming Ollama
    const batchSize = 5;
    const results = [];
    
    for (let i = 0; i < limitedArticles.length; i += batchSize) {
      const batch = limitedArticles.slice(i, i + batchSize);
      logger.info(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(limitedArticles.length / batchSize)}`);
      
      const batchPromises = batch.map(article => this.analyzeArticle(article));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < limitedArticles.length) {
        await this.sleep(500);
      }
    }
    
    return results;
  }

  /**
   * Filter for high-impact articles only
   */
  async getHighImpactArticles(articles, maxResults = 5) {
    const analyzedArticles = await this.analyzeArticles(articles);
    
    // Filter for HIGH impact only
    const highImpactArticles = analyzedArticles.filter(
      article => article.impact === 'HIGH'
    );
    
    // Sort by impact score and date
    highImpactArticles.sort((a, b) => {
      if (b.impactScore !== a.impactScore) {
        return b.impactScore - a.impactScore;
      }
      return new Date(b.pubDate) - new Date(a.pubDate);
    });
    
    // Limit results
    const limitedResults = highImpactArticles.slice(0, maxResults);
    
    logger.info(`Found ${limitedResults.length} high-impact articles out of ${articles.length} total`);
    
    return limitedResults;
  }

  /**
   * Check if Ollama is available
   */
  async checkOllamaHealth() {
    try {
      const response = await axios.get(`${this.ollamaHost}/api/tags`, {
        timeout: 5000
      });
      
      const models = response.data.models || [];
      const hasModel = models.some(m => m.name.includes(this.model));
      
      return {
        healthy: true,
        modelAvailable: hasModel,
        availableModels: models.map(m => m.name)
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        modelAvailable: false
      };
    }
  }

  /**
   * Get impact statistics from analyzed articles
   */
  getImpactStats(analyzedArticles) {
    const stats = {
      total: analyzedArticles.length,
      high: analyzedArticles.filter(a => a.impact === 'HIGH').length,
      low: analyzedArticles.filter(a => a.impact === 'LOW').length,
      error: analyzedArticles.filter(a => a.impact === 'ERROR').length
    };
    
    return stats;
  }
}

// Export singleton instance
module.exports = new ImpactFilter();

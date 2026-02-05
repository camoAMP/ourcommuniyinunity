/**
 * Video Controller
 * Handles the complete video generation pipeline
 * Orchestrates news aggregation, impact filtering, script generation, and video creation
 */

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

const newsAggregator = require('../services/newsAggregator');
const impactFilter = require('../services/impactFilter');
const scriptGenerator = require('../services/scriptGenerator');
const logger = require('../utils/logger');

class VideoController {
  constructor() {
    this.outputDir = process.env.OUTPUT_DIR || path.join(__dirname, '../../output/videos');
    this.metadataDir = process.env.METADATA_DIR || path.join(__dirname, '../../output/metadata');
    this.tempDir = process.env.TEMP_DIR || path.join(__dirname, '../../output/temp');
    this.pythonDir = path.join(__dirname, '../../python');
    this.maxVideosPerRun = parseInt(process.env.MAX_VIDEOS_PER_RUN) || 5;
  }

  /**
   * Ensure output directories exist
   */
  async ensureDirectories() {
    const dirs = [this.outputDir, this.metadataDir, this.tempDir];
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        logger.error(`Failed to create directory ${dir}:`, error.message);
      }
    }
  }

  /**
   * Run the complete video generation pipeline
   */
  async generateVideos(req, res) {
    const jobId = uuidv4();
    const startTime = Date.now();
    
    logger.info(`Starting video generation job ${jobId}`);
    
    try {
      await this.ensureDirectories();
      
      // Step 1: Fetch news articles
      logger.info('Step 1: Fetching news articles...');
      const articles = await newsAggregator.fetchAllFeeds();
      
      if (articles.length === 0) {
        return res.status(404).json({
          success: false,
          jobId,
          error: 'No articles found from news feeds'
        });
      }
      
      // Step 2: Filter for high-impact articles
      logger.info('Step 2: Filtering for high-impact articles...');
      const maxHighImpact = parseInt(process.env.MAX_HIGH_IMPACT_STORIES) || 5;
      const articlesForAnalysis = parseInt(process.env.ARTICLES_FOR_IMPACT_ANALYSIS) || 20;
      const highImpactArticles = await impactFilter.getHighImpactArticles(
        articles, 
        maxHighImpact,
        articlesForAnalysis
      );
      
      if (highImpactArticles.length === 0) {
        return res.status(200).json({
          success: true,
          jobId,
          message: 'No high-impact articles found for video generation',
          articlesAnalyzed: articles.length,
          videosGenerated: 0
        });
      }
      
      // Step 3: Generate scripts
      logger.info('Step 3: Generating video scripts...');
      const scripts = await scriptGenerator.generateScripts(highImpactArticles);
      
      // Step 4: Generate videos using Python scripts
      logger.info('Step 4: Generating videos...');
      const generatedVideos = [];
      
      for (let i = 0; i < Math.min(scripts.length, this.maxVideosPerRun); i++) {
        const script = scripts[i];
        const videoId = uuidv4();
        
        try {
          const videoResult = await this.generateVideoFromScript(script, videoId, jobId);
          generatedVideos.push(videoResult);
        } catch (error) {
          logger.error(`Failed to generate video for script ${i}:`, error.message);
        }
      }
      
      // Save metadata
      const metadata = {
        jobId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        articlesFetched: articles.length,
        highImpactArticles: highImpactArticles.length,
        videosGenerated: generatedVideos.length,
        videos: generatedVideos
      };
      
      await this.saveMetadata(metadata, jobId);
      
      // Call webhook if configured
      if (process.env.WEBHOOK_URL) {
        await this.callWebhook(metadata);
      }
      
      logger.info(`Job ${jobId} completed. Generated ${generatedVideos.length} videos`);
      
      return res.status(200).json({
        success: true,
        jobId,
        message: `Generated ${generatedVideos.length} videos`,
        videos: generatedVideos,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      logger.error(`Job ${jobId} failed:`, error.message);
      
      return res.status(500).json({
        success: false,
        jobId,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Generate video from script using Python
   */
  async generateVideoFromScript(script, videoId, jobId) {
    const { spawn } = require('child_process');
    
    const outputPath = path.join(this.outputDir, `${videoId}.mp4`);
    const scriptPath = path.join(this.tempDir, `${videoId}_script.json`);
    
    // Save script to temp file
    await fs.writeFile(scriptPath, JSON.stringify(script, null, 2));
    
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(this.pythonDir, 'video_composer.py');
      
      const pythonProcess = spawn('python3', [
        pythonScript,
        '--script', scriptPath,
        '--output', outputPath,
        '--video-id', videoId
      ]);
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        logger.info(`Python: ${data.toString().trim()}`);
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        logger.error(`Python Error: ${data.toString().trim()}`);
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            videoId,
            jobId,
            title: script.headline,
            source: script.articleSource,
            category: script.category,
            outputPath,
            filename: `${videoId}.mp4`,
            script: script,
            generatedAt: new Date().toISOString()
          });
        } else {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        }
      });
    });
  }

  /**
   * Save metadata to file
   */
  async saveMetadata(metadata, jobId) {
    const metadataPath = path.join(this.metadataDir, `${jobId}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    logger.info(`Metadata saved to: ${metadataPath}`);
  }

  /**
   * Call webhook with generation results
   */
  async callWebhook(metadata) {
    try {
      const axios = require('axios');
      await axios.post(process.env.WEBHOOK_URL, metadata, {
        timeout: 10000
      });
      logger.info('Webhook called successfully');
    } catch (error) {
      logger.error('Webhook call failed:', error.message);
    }
  }

  /**
   * Get current aggregated news
   */
  async getNews(req, res) {
    try {
      const { category, search, refresh } = req.query;
      
      let articles;
      
      if (refresh === 'true') {
        articles = await newsAggregator.refreshFeeds();
      } else {
        articles = await newsAggregator.fetchAllFeeds();
      }
      
      // Filter by category if specified
      if (category) {
        articles = articles.filter(a => a.category === category);
      }
      
      // Search if query provided
      if (search) {
        const searchLower = search.toLowerCase();
        articles = articles.filter(a => 
          a.title.toLowerCase().includes(searchLower) ||
          a.content.toLowerCase().includes(searchLower)
        );
      }
      
      return res.status(200).json({
        success: true,
        count: articles.length,
        articles
      });
    } catch (error) {
      logger.error('Failed to fetch news:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * List all generated videos
   */
  async getVideos(req, res) {
    try {
      const { category, limit = 50 } = req.query;
      
      // Read metadata directory
      const files = await fs.readdir(this.metadataDir);
      const metadataFiles = files.filter(f => f.endsWith('.json'));
      
      const videos = [];
      
      for (const file of metadataFiles) {
        try {
          const content = await fs.readFile(
            path.join(this.metadataDir, file), 
            'utf8'
          );
          const metadata = JSON.parse(content);
          
          if (metadata.videos) {
            for (const video of metadata.videos) {
              if (!category || video.category === category) {
                // Check if file exists
                const videoExists = await this.fileExists(video.outputPath);
                videos.push({
                  ...video,
                  exists: videoExists
                });
              }
            }
          }
        } catch (error) {
          logger.error(`Failed to read metadata file ${file}:`, error.message);
        }
      }
      
      // Sort by generation date (newest first)
      videos.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
      
      // Limit results
      const limitedVideos = videos.slice(0, parseInt(limit));
      
      return res.status(200).json({
        success: true,
        count: limitedVideos.length,
        total: videos.length,
        videos: limitedVideos
      });
    } catch (error) {
      logger.error('Failed to list videos:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get a specific video by ID
   */
  async getVideoById(req, res) {
    try {
      const { videoId } = req.params;
      
      // Search through metadata files
      const files = await fs.readdir(this.metadataDir);
      
      for (const file of files) {
        const content = await fs.readFile(
          path.join(this.metadataDir, file), 
          'utf8'
        );
        const metadata = JSON.parse(content);
        
        const video = metadata.videos?.find(v => v.videoId === videoId);
        if (video) {
          const videoExists = await this.fileExists(video.outputPath);
          return res.status(200).json({
            success: true,
            video: {
              ...video,
              exists: videoExists
            }
          });
        }
      }
      
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    } catch (error) {
      logger.error('Failed to get video:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete a video
   */
  async deleteVideo(req, res) {
    try {
      const { videoId } = req.params;
      
      // Find and delete video
      const files = await fs.readdir(this.metadataDir);
      
      for (const file of files) {
        const filePath = path.join(this.metadataDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const metadata = JSON.parse(content);
        
        const videoIndex = metadata.videos?.findIndex(v => v.videoId === videoId);
        if (videoIndex !== -1 && videoIndex !== undefined) {
          const video = metadata.videos[videoIndex];
          
          // Delete video file
          try {
            await fs.unlink(video.outputPath);
          } catch (e) {
            logger.warn(`Could not delete video file: ${e.message}`);
          }
          
          // Update metadata
          metadata.videos.splice(videoIndex, 1);
          await fs.writeFile(filePath, JSON.stringify(metadata, null, 2));
          
          return res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
          });
        }
      }
      
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    } catch (error) {
      logger.error('Failed to delete video:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get system health status
   */
  async getHealth(req, res) {
    try {
      const ollamaHealth = await impactFilter.checkOllamaHealth();
      const cacheStats = newsAggregator.getCacheStats();
      
      return res.status(200).json({
        success: true,
        status: 'healthy',
        ollama: ollamaHealth,
        cache: cacheStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message
      });
    }
  }
}

module.exports = new VideoController();

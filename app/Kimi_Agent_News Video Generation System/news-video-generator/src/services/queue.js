/**
 * Job Queue Service
 * Bull-based queue for video generation with rate limiting,
 * retry logic, and concurrency control
 */

const Queue = require('bull');
const logger = require('../utils/logger');
const videoProviders = require('./videoProviders');
const smartFilter = require('./smartFilter');

class VideoQueue {
  constructor() {
    // Redis configuration (using in-memory if Redis not available)
    const redisConfig = process.env.REDIS_URL ? {
      redis: process.env.REDIS_URL
    } : {};
    
    // Main video generation queue
    this.videoQueue = new Queue('video generation', {
      ...redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000  // Start with 1 minute delay
        },
        removeOnComplete: 10,  // Keep last 10 completed jobs
        removeOnFail: 5        // Keep last 5 failed jobs
      }
    });
    
    // Rate limiting queue (tracks API usage)
    this.rateLimitQueue = new Queue('rate limiting', redisConfig);
    
    // Processing queue (for non-video tasks)
    this.processingQueue = new Queue('processing', redisConfig);
    
    this.setupEventHandlers();
    this.setupProcessors();
  }

  /**
   * Setup queue event handlers
   */
  setupEventHandlers() {
    // Video queue events
    this.videoQueue.on('completed', (job, result) => {
      logger.info(`Video job ${job.id} completed: ${result.videoId}`);
    });
    
    this.videoQueue.on('failed', (job, err) => {
      logger.error(`Video job ${job.id} failed: ${err.message}`);
    });
    
    this.videoQueue.on('stalled', (job) => {
      logger.warn(`Video job ${job.id} stalled`);
    });
    
    this.videoQueue.on('progress', (job, progress) => {
      logger.info(`Video job ${job.id} progress: ${progress}%`);
    });
  }

  /**
   * Setup queue processors
   */
  setupProcessors() {
    // Process video generation with concurrency limit
    // Max 2 videos generating at once to respect API limits
    this.videoQueue.process('generate-video', 2, async (job) => {
      return this.processVideoJob(job);
    });
    
    // Process script generation
    this.processingQueue.process('generate-script', 5, async (job) => {
      return this.processScriptJob(job);
    });
    
    // Process impact analysis
    this.processingQueue.process('analyze-impact', 10, async (job) => {
      return this.processAnalysisJob(job);
    });
  }

  /**
   * Process video generation job
   */
  async processVideoJob(job) {
    const { script, videoId, options = {} } = job.data;
    
    logger.info(`Processing video job ${job.id} for video ${videoId}`);
    
    try {
      // Update progress
      await job.progress(10);
      
      // Check rate limits before starting
      const quota = await videoProviders.checkQuota();
      if (!quota.hasQuota) {
        throw new Error(`Daily video quota exceeded (${quota.used}/${quota.limit})`);
      }
      
      await job.progress(30);
      
      // Generate videos for each scene
      const scenes = script.scenes || [];
      const videoPaths = [];
      
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const outputPath = `/tmp/${videoId}_scene${i + 1}.mp4`;
        
        // Use fallback chain for generation
        const result = await videoProviders.generateWithFallback(
          scene.visual,
          outputPath,
          { maxProviders: 2 }
        );
        
        if (result.success) {
          videoPaths.push(outputPath);
        }
        
        // Update progress
        await job.progress(30 + ((i + 1) / scenes.length) * 50);
      }
      
      await job.progress(90);
      
      // Return result
      return {
        videoId,
        success: true,
        scenesGenerated: videoPaths.length,
        videoPaths,
        completedAt: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error(`Video job ${job.id} error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process script generation job
   */
  async processScriptJob(job) {
    const { article } = job.data;
    const scriptGenerator = require('./scriptGenerator');
    
    return await scriptGenerator.generateScript(article);
  }

  /**
   * Process impact analysis job
   */
  async processAnalysisJob(job) {
    const { article } = job.data;
    return await smartFilter.analyzeNews(article);
  }

  /**
   * Add video generation job to queue
   */
  async addVideoJob(script, videoId, options = {}) {
    const job = await this.videoQueue.add('generate-video', {
      script,
      videoId,
      options
    }, {
      priority: options.priority || 5,
      delay: options.delay || 0
    });
    
    logger.info(`Added video job ${job.id} to queue`);
    return job;
  }

  /**
   * Add script generation job
   */
  async addScriptJob(article, options = {}) {
    const job = await this.processingQueue.add('generate-script', {
      article
    }, {
      priority: options.priority || 3
    });
    
    return job;
  }

  /**
   * Add impact analysis job
   */
  async addAnalysisJob(article, options = {}) {
    const job = await this.processingQueue.add('analyze-impact', {
      article
    }, {
      priority: options.priority || 1
    });
    
    return job;
  }

  /**
   * Wait for job completion
   */
  async waitForJob(job, timeout = 300000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Job ${job.id} timed out after ${timeout}ms`));
      }, timeout);
      
      job.finished().then(result => {
        clearTimeout(timer);
        resolve(result);
      }).catch(err => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  /**
   * Get queue status
   */
  async getStatus() {
    const [videoCounts, processingCounts] = await Promise.all([
      this.videoQueue.getJobCounts(),
      this.processingQueue.getJobCounts()
    ]);
    
    return {
      video: videoCounts,
      processing: processingCounts,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clean old completed jobs
   */
  async cleanup() {
    await this.videoQueue.clean(24 * 3600 * 1000, 'completed');  // 24 hours
    await this.videoQueue.clean(7 * 24 * 3600 * 1000, 'failed'); // 7 days
    await this.processingQueue.clean(24 * 3600 * 1000, 'completed');
    
    logger.info('Queue cleanup completed');
  }

  /**
   * Pause queue processing
   */
  async pause() {
    await this.videoQueue.pause();
    logger.info('Video queue paused');
  }

  /**
   * Resume queue processing
   */
  async resume() {
    await this.videoQueue.resume();
    logger.info('Video queue resumed');
  }

  /**
   * Get job by ID
   */
  async getJob(jobId) {
    return await this.videoQueue.getJob(jobId);
  }

  /**
   * Remove job from queue
   */
  async removeJob(jobId) {
    const job = await this.getJob(jobId);
    if (job) {
      await job.remove();
      logger.info(`Removed job ${jobId}`);
      return true;
    }
    return false;
  }
}

// Export singleton instance
module.exports = new VideoQueue();

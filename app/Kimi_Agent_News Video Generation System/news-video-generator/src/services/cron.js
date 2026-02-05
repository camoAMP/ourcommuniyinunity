/**
 * Cron Service
 * Scheduled tasks for automation
 */

const cron = require('node-cron');
const logger = require('../utils/logger');
const storage = require('./storage');
const queue = require('./queue');
const analytics = require('./analytics');

class CronService {
  constructor() {
    this.tasks = new Map();
    this.isRunning = false;
  }

  /**
   * Initialize all cron jobs
   */
  init() {
    if (this.isRunning) {
      logger.warn('Cron service already running');
      return;
    }

    logger.info('Initializing cron service...');

    // Video generation - every 6 hours
    this.schedule('video-generation', '0 */6 * * *', async () => {
      logger.info('Running scheduled video generation...');
      const { generateVideos } = require('../../scripts/generate-videos');
      try {
        await generateVideos();
      } catch (error) {
        logger.error('Scheduled video generation failed:', error.message);
      }
    });

    // Storage cleanup - daily at 2 AM
    this.schedule('storage-cleanup', '0 2 * * *', async () => {
      logger.info('Running scheduled storage cleanup...');
      try {
        await storage.runCleanup();
      } catch (error) {
        logger.error('Storage cleanup failed:', error.message);
      }
    });

    // Queue cleanup - every 6 hours
    this.schedule('queue-cleanup', '0 */6 * * *', async () => {
      logger.info('Running scheduled queue cleanup...');
      try {
        await queue.cleanup();
      } catch (error) {
        logger.error('Queue cleanup failed:', error.message);
      }
    });

    // Analytics save - every 5 minutes
    this.schedule('analytics-save', '*/5 * * * *', async () => {
      try {
        await analytics.saveMetrics();
      } catch (error) {
        logger.error('Analytics save failed:', error.message);
      }
    });

    // Storage limit check - every hour
    this.schedule('storage-check', '0 * * * *', async () => {
      try {
        await storage.checkStorageLimit();
      } catch (error) {
        logger.error('Storage check failed:', error.message);
      }
    });

    this.isRunning = true;
    logger.info('Cron service initialized with tasks:', Array.from(this.tasks.keys()));
  }

  /**
   * Schedule a cron task
   */
  schedule(name, schedule, callback) {
    if (this.tasks.has(name)) {
      logger.warn(`Task ${name} already exists, stopping old task`);
      this.stop(name);
    }

    const task = cron.schedule(schedule, callback, {
      scheduled: true,
      timezone: process.env.TZ || 'UTC'
    });

    this.tasks.set(name, { task, schedule, callback });
    logger.info(`Scheduled task: ${name} (${schedule})`);
  }

  /**
   * Stop a specific task
   */
  stop(name) {
    const taskInfo = this.tasks.get(name);
    if (taskInfo) {
      taskInfo.task.stop();
      this.tasks.delete(name);
      logger.info(`Stopped task: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Stop all tasks
   */
  stopAll() {
    for (const [name, taskInfo] of this.tasks) {
      taskInfo.task.stop();
      logger.info(`Stopped task: ${name}`);
    }
    this.tasks.clear();
    this.isRunning = false;
  }

  /**
   * Get task status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      tasks: Array.from(this.tasks.keys()).map(name => ({
        name,
        schedule: this.tasks.get(name).schedule,
        running: this.tasks.get(name).task.getStatus() === 'scheduled'
      }))
    };
  }

  /**
   * Run a task immediately (for testing)
   */
  async runNow(name) {
    const taskInfo = this.tasks.get(name);
    if (!taskInfo) {
      throw new Error(`Task ${name} not found`);
    }

    logger.info(`Manually running task: ${name}`);
    await taskInfo.callback();
  }
}

module.exports = new CronService();

/**
 * Storage Management Service
 * Handles video storage, auto-cleanup, compression, and quota management
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const logger = require('../utils/logger');

class StorageManager {
  constructor() {
    this.outputDir = process.env.OUTPUT_DIR || path.join(__dirname, '../../output/videos');
    this.metadataDir = process.env.METADATA_DIR || path.join(__dirname, '../../output/metadata');
    this.tempDir = process.env.TEMP_DIR || path.join(__dirname, '../../output/temp');
    this.logsDir = path.join(__dirname, '../../output/logs');
    
    // Retention settings
    this.videoRetentionDays = parseInt(process.env.VIDEO_RETENTION_DAYS) || 7;
    this.tempRetentionHours = parseInt(process.env.TEMP_RETENTION_HOURS) || 24;
    this.logRetentionDays = parseInt(process.env.LOG_RETENTION_DAYS) || 30;
    
    // Storage limits
    this.maxStorageGB = parseInt(process.env.MAX_STORAGE_GB) || 50;
    this.compressionEnabled = process.env.ENABLE_COMPRESSION !== 'false';
  }

  /**
   * Get storage statistics
   */
  async getStats() {
    try {
      const [videoSize, metadataSize, tempSize, logsSize] = await Promise.all([
        this.getDirectorySize(this.outputDir),
        this.getDirectorySize(this.metadataDir),
        this.getDirectorySize(this.tempDir),
        this.getDirectorySize(this.logsDir)
      ]);
      
      const totalSize = videoSize + metadataSize + tempSize + logsSize;
      const maxBytes = this.maxStorageGB * 1024 * 1024 * 1024;
      
      return {
        videos: {
          path: this.outputDir,
          size: videoSize,
          sizeFormatted: this.formatBytes(videoSize)
        },
        metadata: {
          path: this.metadataDir,
          size: metadataSize,
          sizeFormatted: this.formatBytes(metadataSize)
        },
        temp: {
          path: this.tempDir,
          size: tempSize,
          sizeFormatted: this.formatBytes(tempSize)
        },
        logs: {
          path: this.logsDir,
          size: logsSize,
          sizeFormatted: this.formatBytes(logsSize)
        },
        total: {
          size: totalSize,
          sizeFormatted: this.formatBytes(totalSize),
          percentUsed: Math.round((totalSize / maxBytes) * 100)
        },
        limits: {
          maxGB: this.maxStorageGB,
          retentionDays: this.videoRetentionDays
        }
      };
    } catch (error) {
      logger.error(`Failed to get storage stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get directory size recursively
   */
  async getDirectorySize(dirPath) {
    try {
      const files = await fs.readdir(dirPath);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Clean up old videos
   */
  async cleanupVideos() {
    try {
      logger.info('Starting video cleanup...');
      
      const files = await fs.readdir(this.outputDir);
      const cutoffTime = Date.now() - (this.videoRetentionDays * 24 * 60 * 60 * 1000);
      
      let deletedCount = 0;
      let freedSpace = 0;
      
      for (const file of files) {
        if (!file.endsWith('.mp4')) continue;
        
        const filePath = path.join(this.outputDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          freedSpace += stats.size;
          await fs.unlink(filePath);
          deletedCount++;
          
          // Also delete associated metadata
          const metadataPath = path.join(this.metadataDir, file.replace('.mp4', '.json'));
          try {
            await fs.unlink(metadataPath);
          } catch (e) {
            // Metadata might not exist
          }
        }
      }
      
      logger.info(`Cleaned up ${deletedCount} old videos, freed ${this.formatBytes(freedSpace)}`);
      
      return {
        deleted: deletedCount,
        freedSpace,
        freedSpaceFormatted: this.formatBytes(freedSpace)
      };
    } catch (error) {
      logger.error(`Video cleanup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up temp files
   */
  async cleanupTemp() {
    try {
      logger.info('Starting temp cleanup...');
      
      const files = await fs.readdir(this.tempDir);
      const cutoffTime = Date.now() - (this.tempRetentionHours * 60 * 60 * 1000);
      
      let deletedCount = 0;
      let freedSpace = 0;
      
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          freedSpace += stats.size;
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      logger.info(`Cleaned up ${deletedCount} temp files, freed ${this.formatBytes(freedSpace)}`);
      
      return {
        deleted: deletedCount,
        freedSpace,
        freedSpaceFormatted: this.formatBytes(freedSpace)
      };
    } catch (error) {
      logger.error(`Temp cleanup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up old logs
   */
  async cleanupLogs() {
    try {
      logger.info('Starting log cleanup...');
      
      const files = await fs.readdir(this.logsDir);
      const cutoffTime = Date.now() - (this.logRetentionDays * 24 * 60 * 60 * 1000);
      
      let deletedCount = 0;
      let freedSpace = 0;
      
      for (const file of files) {
        if (!file.endsWith('.log')) continue;
        
        const filePath = path.join(this.logsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          freedSpace += stats.size;
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      logger.info(`Cleaned up ${deletedCount} old logs, freed ${this.formatBytes(freedSpace)}`);
      
      return {
        deleted: deletedCount,
        freedSpace,
        freedSpaceFormatted: this.formatBytes(freedSpace)
      };
    } catch (error) {
      logger.error(`Log cleanup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run all cleanup tasks
   */
  async runCleanup() {
    logger.info('Running full storage cleanup...');
    
    const results = await Promise.all([
      this.cleanupVideos(),
      this.cleanupTemp(),
      this.cleanupLogs()
    ]);
    
    const totalFreed = results.reduce((sum, r) => sum + r.freedSpace, 0);
    
    logger.info(`Cleanup complete. Total freed: ${this.formatBytes(totalFreed)}`);
    
    return {
      videos: results[0],
      temp: results[1],
      logs: results[2],
      totalFreed,
      totalFreedFormatted: this.formatBytes(totalFreed)
    };
  }

  /**
   * Compress video file
   */
  async compressVideo(inputPath, outputPath) {
    if (!this.compressionEnabled) {
      logger.info('Compression disabled, skipping');
      return false;
    }
    
    return new Promise((resolve, reject) => {
      logger.info(`Compressing video: ${path.basename(inputPath)}`);
      
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-vcodec', 'h264',
        '-crf', '28',        // Compression quality (lower = better quality)
        '-preset', 'faster', // Encoding speed
        '-acodec', 'aac',
        '-b:a', '64k',       // Audio bitrate
        '-movflags', '+faststart',
        '-y',                // Overwrite output
        outputPath
      ]);
      
      let stderr = '';
      
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      ffmpeg.on('close', async (code) => {
        if (code === 0) {
          // Get file sizes for comparison
          const inputStats = await fs.stat(inputPath);
          const outputStats = await fs.stat(outputPath);
          
          const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
          
          logger.info(`Compression complete: ${reduction}% size reduction`);
          
          resolve({
            success: true,
            inputSize: inputStats.size,
            outputSize: outputStats.size,
            reduction: `${reduction}%`
          });
        } else {
          reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  /**
   * Compress all videos in output directory
   */
  async compressAllVideos() {
    try {
      logger.info('Starting batch video compression...');
      
      const files = await fs.readdir(this.outputDir);
      const mp4Files = files.filter(f => f.endsWith('.mp4') && !f.includes('_compressed'));
      
      const results = [];
      
      for (const file of mp4Files) {
        const inputPath = path.join(this.outputDir, file);
        const outputPath = path.join(this.outputDir, file.replace('.mp4', '_compressed.mp4'));
        
        try {
          const result = await this.compressVideo(inputPath, outputPath);
          results.push({ file, ...result });
          
          // Replace original with compressed
          await fs.unlink(inputPath);
          await fs.rename(outputPath, inputPath);
        } catch (error) {
          logger.error(`Failed to compress ${file}: ${error.message}`);
          results.push({ file, success: false, error: error.message });
        }
      }
      
      logger.info(`Batch compression complete: ${results.filter(r => r.success).length}/${results.length} successful`);
      
      return results;
    } catch (error) {
      logger.error(`Batch compression failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if storage is approaching limit
   */
  async checkStorageLimit() {
    const stats = await this.getStats();
    const maxBytes = this.maxStorageGB * 1024 * 1024 * 1024;
    
    const isNearLimit = stats.total.size > (maxBytes * 0.9);  // 90% full
    const isCritical = stats.total.size > (maxBytes * 0.95);  // 95% full
    
    if (isCritical) {
      logger.warn(`CRITICAL: Storage at ${stats.total.percentUsed}% capacity`);
      
      // Auto-cleanup if critical
      await this.runCleanup();
    } else if (isNearLimit) {
      logger.warn(`WARNING: Storage at ${stats.total.percentUsed}% capacity`);
    }
    
    return {
      percentUsed: stats.total.percentUsed,
      isNearLimit,
      isCritical
    };
  }

  /**
   * Get video file info
   */
  async getVideoInfo(videoPath) {
    try {
      const stats = await fs.stat(videoPath);
      
      return {
        path: videoPath,
        filename: path.basename(videoPath),
        size: stats.size,
        sizeFormatted: this.formatBytes(stats.size),
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete video and associated files
   */
  async deleteVideo(videoId) {
    try {
      const videoPath = path.join(this.outputDir, `${videoId}.mp4`);
      const metadataPath = path.join(this.metadataDir, `${videoId}.json`);
      
      // Delete video
      try {
        await fs.unlink(videoPath);
      } catch (e) {
        // Video might not exist
      }
      
      // Delete metadata
      try {
        await fs.unlink(metadataPath);
      } catch (e) {
        // Metadata might not exist
      }
      
      logger.info(`Deleted video: ${videoId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete video ${videoId}: ${error.message}`);
      return false;
    }
  }
}

module.exports = new StorageManager();

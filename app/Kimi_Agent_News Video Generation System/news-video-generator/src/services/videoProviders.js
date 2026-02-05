/**
 * Video Providers Service
 * Multi-provider fallback chain for video generation
 * Supports FAL.AI (WAN, Mochi), ComfyUI local GPU, and fallback templates
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const { spawn } = require('child_process');

class VideoProviders {
  constructor() {
    this.providers = [
      { 
        name: 'wan', 
        type: 'fal', 
        model: 'fal-ai/wan/v2',
        priority: 1,
        costPerVideo: 1.0  // relative cost
      },
      { 
        name: 'mochi', 
        type: 'fal', 
        model: 'fal-ai/mochi/v1',
        priority: 2,
        costPerVideo: 0.8
      },
      { 
        name: 'wan-fast', 
        type: 'fal', 
        model: 'fal-ai/wan/fast',
        priority: 3,
        costPerVideo: 0.5
      },
      { 
        name: 'local', 
        type: 'comfy', 
        host: process.env.COMFYUI_HOST || 'http://localhost:8188',
        priority: 0,  // Try local first if available
        costPerVideo: 0
      }
    ];
    
    this.falApiKey = process.env.FAL_API_KEY || '';
    this.useLocalGpu = process.env.USE_LOCAL_GPU === 'true';
    this.resolution = process.env.VIDEO_RESOLUTION || '720p';
    this.duration = parseInt(process.env.VIDEO_DURATION_PER_SCENE) || 5;
    
    // Track API usage for rate limiting
    this.usageLog = new Map();
    this.maxDailyVideos = parseInt(process.env.MAX_DAILY_VIDEOS) || 10;
  }

  /**
   * Check if we have API quota available
   */
  async checkQuota(providerName = 'all') {
    const today = new Date().toISOString().split('T')[0];
    const key = `${providerName}_${today}`;
    const used = this.usageLog.get(key) || 0;
    
    return {
      used,
      remaining: this.maxDailyVideos - used,
      limit: this.maxDailyVideos,
      hasQuota: used < this.maxDailyVideos
    };
  }

  /**
   * Log API usage
   */
  logUsage(providerName) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${providerName}_${today}`;
    const current = this.usageLog.get(key) || 0;
    this.usageLog.set(key, current + 1);
    logger.info(`Logged usage for ${providerName}: ${current + 1}/${this.maxDailyVideos}`);
  }

  /**
   * Generate video with fallback chain
   */
  async generateWithFallback(prompt, outputPath, options = {}) {
    const { 
      preferLocal = true, 
      maxProviders = 3,
      skipTemplates = false 
    } = options;
    
    // Sort providers by priority
    let sortedProviders = [...this.providers].sort((a, b) => a.priority - b.priority);
    
    // Filter based on configuration
    if (!this.useLocalGpu) {
      sortedProviders = sortedProviders.filter(p => p.type !== 'comfy');
    }
    
    if (!this.falApiKey) {
      sortedProviders = sortedProviders.filter(p => p.type !== 'fal');
    }
    
    // Limit number of providers to try
    sortedProviders = sortedProviders.slice(0, maxProviders);
    
    logger.info(`Attempting video generation with ${sortedProviders.length} providers`);
    
    // Try each provider
    for (const provider of sortedProviders) {
      try {
        // Check quota for FAL providers
        if (provider.type === 'fal') {
          const quota = await this.checkQuota(provider.name);
          if (!quota.hasQuota) {
            logger.warn(`Quota exceeded for ${provider.name}, skipping`);
            continue;
          }
        }
        
        logger.info(`Trying provider: ${provider.name}`);
        const result = await this.generateVideo(provider, prompt, outputPath);
        
        if (result) {
          this.logUsage(provider.name);
          logger.info(`Success with provider: ${provider.name}`);
          return { 
            success: true, 
            provider: provider.name,
            outputPath 
          };
        }
      } catch (error) {
        logger.warn(`${provider.name} failed: ${error.message}, trying next...`);
      }
    }
    
    // All providers failed - use template fallback if not skipped
    if (!skipTemplates) {
      logger.info('All AI providers failed, using template fallback');
      return this.generateFromTemplate(prompt, outputPath);
    }
    
    throw new Error('All video providers failed');
  }

  /**
   * Generate video with specific provider
   */
  async generateVideo(provider, prompt, outputPath) {
    switch (provider.type) {
      case 'fal':
        return this.generateWithFal(provider, prompt, outputPath);
      case 'comfy':
        return this.generateWithComfyUI(provider, prompt, outputPath);
      default:
        throw new Error(`Unknown provider type: ${provider.type}`);
    }
  }

  /**
   * Generate video using FAL.AI API
   */
  async generateWithFal(provider, prompt, outputPath) {
    if (!this.falApiKey) {
      throw new Error('FAL_API_KEY not configured');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Key ${this.falApiKey}`
    };
    
    const payload = {
      prompt: prompt,
      resolution: this.resolution,
      duration: this.duration
    };
    
    // Submit generation request
    const response = await axios.post(
      `https://fal.run/${provider.model}`,
      payload,
      { 
        headers,
        timeout: 120000  // 2 minute timeout
      }
    );
    
    if (response.status !== 200) {
      throw new Error(`FAL API error: ${response.status}`);
    }
    
    const result = response.data;
    
    if (!result.video?.url) {
      throw new Error('No video URL in FAL response');
    }
    
    // Download video
    const videoResponse = await axios.get(result.video.url, {
      responseType: 'arraybuffer',
      timeout: 60000
    });
    
    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    // Save video
    await fs.writeFile(outputPath, videoResponse.data);
    
    return true;
  }

  /**
   * Generate video using local ComfyUI
   */
  async generateWithComfyUI(provider, prompt, outputPath) {
    // Check if ComfyUI is available
    try {
      await axios.get(`${provider.host}/system_stats`, { timeout: 5000 });
    } catch (error) {
      throw new Error('ComfyUI not available');
    }
    
    // ComfyUI workflow for video generation
    const workflow = {
      "1": {
        "inputs": {
          "prompt": prompt,
          "width": 1280,
          "height": 720,
          "video_length": 30,
          "steps": 30,
          "cfg": 7,
          "seed": -1
        },
        "class_type": "HunyuanVideoSampler"
      },
      "2": {
        "inputs": {
          "filename_prefix": "news_video",
          "images": ["1", 0]
        },
        "class_type": "SaveVideo"
      }
    };
    
    // Queue the workflow
    const queueResponse = await axios.post(
      `${provider.host}/prompt`,
      { prompt: workflow },
      { timeout: 30000 }
    );
    
    const promptId = queueResponse.data.prompt_id;
    
    if (!promptId) {
      throw new Error('No prompt_id from ComfyUI');
    }
    
    // Poll for completion
    const maxRetries = 60;
    for (let i = 0; i < maxRetries; i++) {
      await this.sleep(5000);
      
      const historyResponse = await axios.get(
        `${provider.host}/history/${promptId}`,
        { timeout: 10000 }
      );
      
      const history = historyResponse.data;
      
      if (history[promptId]?.outputs) {
        const outputs = history[promptId].outputs;
        
        for (const nodeId in outputs) {
          if (outputs[nodeId].videos) {
            const videoInfo = outputs[nodeId].videos[0];
            const videoUrl = `${provider.host}/view?filename=${videoInfo.filename}&type=output`;
            
            // Download video
            const videoResponse = await axios.get(videoUrl, {
              responseType: 'arraybuffer',
              timeout: 60000
            });
            
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            await fs.writeFile(outputPath, videoResponse.data);
            
            return true;
          }
        }
      }
    }
    
    throw new Error('ComfyUI generation timed out');
  }

  /**
   * Generate video from template (fallback)
   */
  async generateFromTemplate(prompt, outputPath) {
    // Use Python video composer with template mode
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '../../python/video_composer.py');
      
      const pythonProcess = spawn('python3', [
        pythonScript,
        '--template-mode',
        '--prompt', prompt,
        '--output', outputPath
      ]);
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ 
            success: true, 
            provider: 'template',
            outputPath 
          });
        } else {
          reject(new Error(`Template generation failed: ${stderr}`));
        }
      });
    });
  }

  /**
   * Generate image first, then animate (more efficient)
   */
  async generateImageToVideo(prompt, outputPath, options = {}) {
    const tempDir = process.env.TEMP_DIR || path.join(__dirname, '../../output/temp');
    const imagePath = path.join(tempDir, `frame_${Date.now()}.png`);
    
    try {
      // Step 1: Generate image using Stable Diffusion via FAL
      logger.info('Generating base image...');
      const imageResult = await this.generateImage(prompt, imagePath);
      
      if (!imageResult) {
        throw new Error('Image generation failed');
      }
      
      // Step 2: Animate image to video
      logger.info('Animating image to video...');
      return await this.animateImage(imagePath, outputPath, options);
      
    } finally {
      // Cleanup temp image
      try {
        await fs.unlink(imagePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Generate image using FAL
   */
  async generateImage(prompt, outputPath) {
    if (!this.falApiKey) {
      throw new Error('FAL_API_KEY not configured');
    }
    
    const response = await axios.post(
      'https://fal.run/fal-ai/flux/schnell',
      {
        prompt: prompt,
        image_size: 'landscape_4_3'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${this.falApiKey}`
        },
        timeout: 60000
      }
    );
    
    if (response.data?.images?.[0]?.url) {
      const imageResponse = await axios.get(response.data.images[0].url, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, imageResponse.data);
      
      return true;
    }
    
    throw new Error('No image URL in response');
  }

  /**
   * Animate image to video
   */
  async animateImage(imagePath, outputPath, options = {}) {
    if (!this.falApiKey) {
      throw new Error('FAL_API_KEY not configured');
    }
    
    // Read image as base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const response = await axios.post(
      'https://fal.run/fal-ai/luma-dream-machine/image-to-video',
      {
        image_url: `data:image/png;base64,${base64Image}`,
        duration: options.duration || this.duration
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${this.falApiKey}`
        },
        timeout: 120000
      }
    );
    
    if (response.data?.video?.url) {
      const videoResponse = await axios.get(response.data.video.url, {
        responseType: 'arraybuffer',
        timeout: 60000
      });
      
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, videoResponse.data);
      
      return { success: true, provider: 'image-to-video' };
    }
    
    throw new Error('No video URL in response');
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get provider status
   */
  async getProviderStatus() {
    const status = {};
    
    for (const provider of this.providers) {
      try {
        if (provider.type === 'fal') {
          const quota = await this.checkQuota(provider.name);
          status[provider.name] = {
            available: quota.hasQuota,
            quota: quota
          };
        } else if (provider.type === 'comfy') {
          try {
            await axios.get(`${provider.host}/system_stats`, { timeout: 5000 });
            status[provider.name] = { available: true };
          } catch {
            status[provider.name] = { available: false };
          }
        }
      } catch (error) {
        status[provider.name] = { 
          available: false, 
          error: error.message 
        };
      }
    }
    
    return status;
  }
}

module.exports = new VideoProviders();

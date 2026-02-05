#!/usr/bin/env node
/**
 * Standalone Video Generation Script
 * Can be run directly or via cron job
 * Usage: node scripts/generate-videos.js
 */

require('dotenv').config();

const axios = require('axios');
const logger = require('../src/utils/logger');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function generateVideos() {
  logger.info('='.repeat(50));
  logger.info('Starting scheduled video generation');
  logger.info('='.repeat(50));
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/generate-videos`, {}, {
      timeout: 30 * 60 * 1000, // 30 minute timeout for video generation
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      logger.info('Video generation completed successfully');
      logger.info(`Videos generated: ${response.data.videos?.length || 0}`);
      logger.info(`Job ID: ${response.data.jobId}`);
      logger.info(`Duration: ${response.data.duration}ms`);
    } else {
      logger.warn('Video generation completed with warnings:');
      logger.warn(response.data.message || 'Unknown warning');
    }
    
    return response.data;
    
  } catch (error) {
    if (error.response) {
      logger.error('API Error:', error.response.data);
    } else if (error.request) {
      logger.error('No response from API. Is the server running?');
    } else {
      logger.error('Error:', error.message);
    }
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateVideos()
    .then(() => {
      logger.info('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { generateVideos };

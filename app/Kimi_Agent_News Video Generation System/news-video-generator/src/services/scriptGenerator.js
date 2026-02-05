/**
 * Script Generator Service
 * Creates 30-second video scripts from high-impact news articles
 * Uses Ollama (llama3.2) for AI-powered script generation
 */

const axios = require('axios');
const logger = require('../utils/logger');

class ScriptGenerator {
  constructor() {
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2';
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  /**
   * Build the script generation prompt
   */
  buildScriptPrompt(article) {
    return `Create a compelling 30-second video script for this breaking news story. Make it engaging, newsworthy, and suitable for a professional news broadcast.

Title: ${article.title}
Content: ${article.content?.substring(0, 800) || article.summary}
Source: ${article.source}
Category: ${article.category}

FORMAT REQUIREMENTS:
- Create exactly 3 scenes
- Each scene should have a clear visual description (1-2 sentences)
- Each narration should be maximum 2 sentences, conversational but professional
- Total script should be readable in approximately 30 seconds
- Use present tense for urgency
- Include specific visual elements that can be generated as video

OUTPUT FORMAT:
SCENE 1: [Visual description - what viewers see]
NARRATION: [What the narrator says - max 2 sentences]

SCENE 2: [Visual description - what viewers see]
NARRATION: [What the narrator says - max 2 sentences]

SCENE 3: [Visual description - what viewers see]
NARRATION: [What the narrator says - max 2 sentences]

HEADLINE: [Short, punchy headline for the video]`;
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
            temperature: 0.7,
            num_predict: 800
          }
        },
        {
          timeout: 60000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.response?.trim();
    } catch (error) {
      if (retries < this.maxRetries) {
        logger.warn(`Ollama script generation failed, retrying (${retries + 1}/${this.maxRetries})...`);
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
   * Parse the generated script into structured format
   */
  parseScript(rawScript, article) {
    try {
      const scenes = [];
      const lines = rawScript.split('\n').filter(line => line.trim());
      
      let currentScene = null;
      let headline = article.title;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Parse headline
        if (trimmedLine.startsWith('HEADLINE:')) {
          headline = trimmedLine.replace('HEADLINE:', '').trim();
          continue;
        }
        
        // Parse scene
        if (trimmedLine.startsWith('SCENE')) {
          if (currentScene) {
            scenes.push(currentScene);
          }
          currentScene = {
            sceneNumber: scenes.length + 1,
            visual: trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim(),
            narration: ''
          };
        }
        
        // Parse narration
        if (trimmedLine.startsWith('NARRATION:') && currentScene) {
          currentScene.narration = trimmedLine.replace('NARRATION:', '').trim();
        }
      }
      
      // Add last scene
      if (currentScene) {
        scenes.push(currentScene);
      }
      
      // Validate script
      if (scenes.length < 2) {
        logger.warn('Script has fewer than 2 scenes, using fallback');
        return this.generateFallbackScript(article);
      }
      
      return {
        headline,
        scenes: scenes.slice(0, 3), // Ensure max 3 scenes
        fullText: rawScript,
        articleTitle: article.title,
        articleSource: article.source,
        articleLink: article.link,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to parse script:', error.message);
      return this.generateFallbackScript(article);
    }
  }

  /**
   * Generate a fallback script if AI generation fails
   */
  generateFallbackScript(article) {
    logger.info('Generating fallback script for:', article.title);
    
    return {
      headline: article.title,
      scenes: [
        {
          sceneNumber: 1,
          visual: `Breaking news graphic with ${article.source} logo, dramatic lighting`,
          narration: `Breaking news from ${article.source}. ${article.title}`
        },
        {
          sceneNumber: 2,
          visual: `News studio setting with professional backdrop related to ${article.category}`,
          narration: article.summary?.substring(0, 150) || 'Details are emerging on this developing story.'
        },
        {
          sceneNumber: 3,
          visual: 'Closing graphic with source attribution and call to action',
          narration: `Stay tuned for more updates on this story. Reporting from ${article.source}.`
        }
      ],
      fullText: 'Fallback script generated',
      articleTitle: article.title,
      articleSource: article.source,
      articleLink: article.link,
      generatedAt: new Date().toISOString(),
      isFallback: true
    };
  }

  /**
   * Generate script for a single article
   */
  async generateScript(article) {
    try {
      logger.info(`Generating script for: ${article.title.substring(0, 50)}...`);
      
      const prompt = this.buildScriptPrompt(article);
      const rawScript = await this.callOllama(prompt);
      
      const script = this.parseScript(rawScript, article);
      script.articleId = article.guid || article.link;
      script.category = article.category;
      
      logger.info(`Script generated with ${script.scenes.length} scenes`);
      
      return script;
    } catch (error) {
      logger.error(`Failed to generate script for "${article.title}":`, error.message);
      return this.generateFallbackScript(article);
    }
  }

  /**
   * Generate scripts for multiple articles
   */
  async generateScripts(articles) {
    logger.info(`Generating scripts for ${articles.length} articles...`);
    
    const scripts = [];
    
    // Process sequentially to avoid overwhelming Ollama
    for (const article of articles) {
      const script = await this.generateScript(article);
      scripts.push(script);
      
      // Small delay between generations
      await this.sleep(500);
    }
    
    logger.info(`Generated ${scripts.length} scripts`);
    return scripts;
  }

  /**
   * Combine all narration text for TTS
   */
  getFullNarration(script) {
    return script.scenes
      .map(scene => scene.narration)
      .filter(n => n)
      .join(' ');
  }

  /**
   * Get visual prompts for video generation
   */
  getVisualPrompts(script) {
    return script.scenes.map(scene => ({
      sceneNumber: scene.sceneNumber,
      prompt: scene.visual,
      narration: scene.narration
    }));
  }

  /**
   * Save script to file
   */
  async saveScript(script, outputPath) {
    const fs = require('fs').promises;
    await fs.writeFile(outputPath, JSON.stringify(script, null, 2));
    logger.info(`Script saved to: ${outputPath}`);
  }
}

// Export singleton instance
module.exports = new ScriptGenerator();

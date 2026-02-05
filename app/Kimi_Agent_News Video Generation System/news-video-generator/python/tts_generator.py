#!/usr/bin/env python3
"""
Text-to-Speech Generator Module
Generates narration audio using edge-tts (free Microsoft Edge TTS)
"""

import os
import asyncio
import edge_tts
from pathlib import Path
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TTSGenerator:
    """Text-to-speech generation using edge-tts"""
    
    def __init__(self):
        self.voice = os.getenv('TTS_VOICE', 'en-US-GuyNeural')
        self.rate = os.getenv('TTS_RATE', '+0%')
        
    async def generate_audio_async(self, text: str, output_path: str) -> bool:
        """
        Generate audio from text using edge-tts (async)
        
        Args:
            text: Text to convert to speech
            output_path: Path to save the audio file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Generating TTS audio: {text[:50]}...")
            
            # Ensure output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Create communicate instance
            communicate = edge_tts.Communicate(
                text=text,
                voice=self.voice,
                rate=self.rate
            )
            
            # Save audio
            await communicate.save(output_path)
            
            logger.info(f"Audio saved to: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"TTS generation failed: {str(e)}")
            return False
            
    def generate_audio(self, text: str, output_path: str) -> bool:
        """
        Generate audio from text (sync wrapper)
        
        Args:
            text: Text to convert to speech
            output_path: Path to save the audio file
            
        Returns:
            True if successful, False otherwise
        """
        return asyncio.run(self.generate_audio_async(text, output_path))
        
    def generate_narration(self, scenes: list, output_path: str) -> bool:
        """
        Generate narration audio from scene narrations
        
        Args:
            scenes: List of scene dictionaries with 'narration' key
            output_path: Path to save the audio file
            
        Returns:
            True if successful, False otherwise
        """
        # Combine all narrations
        full_text = ' '.join([
            scene.get('narration', '') 
            for scene in scenes 
            if scene.get('narration')
        ])
        
        if not full_text:
            logger.error("No narration text found in scenes")
            return False
            
        return self.generate_audio(full_text, output_path)


def get_available_voices():
    """Get list of available voices"""
    voices = [
        'en-US-GuyNeural',
        'en-US-JennyNeural',
        'en-US-AriaNeural',
        'en-GB-SoniaNeural',
        'en-GB-RyanNeural',
        'en-AU-NatashaNeural',
        'en-AU-WilliamNeural'
    ]
    return voices


def main():
    """Test the TTS generator"""
    generator = TTSGenerator()
    
    test_text = "Breaking news: Major market movement detected. Stay tuned for updates."
    output_path = "test_audio.mp3"
    
    success = generator.generate_audio(test_text, output_path)
    
    if success:
        print(f"Audio generated successfully: {output_path}")
    else:
        print("Audio generation failed")


if __name__ == "__main__":
    main()

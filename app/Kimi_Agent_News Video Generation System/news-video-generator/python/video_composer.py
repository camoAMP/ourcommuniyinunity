#!/usr/bin/env python3
"""
Video Composer Module
Main orchestrator for video generation pipeline
Combines all components: video generation, TTS, text overlays
"""

import os
import sys
import json
import argparse
import tempfile
from pathlib import Path
from typing import Dict, List, Optional
import logging

# Import our modules
from video_generator import VideoGenerator
from tts_generator import TTSGenerator
from text_overlay import TextOverlay

# MoviePy imports
from moviepy.editor import (
    VideoFileClip, AudioFileClip, CompositeVideoClip, 
    TextClip, ColorClip, concatenate_videoclips
)
from moviepy.video.fx.all import fadein, fadeout
from PIL import Image
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class VideoComposer:
    """Orchestrates the complete video composition pipeline"""
    
    def __init__(self):
        self.video_generator = VideoGenerator()
        self.tts_generator = TTSGenerator()
        self.text_overlay = TextOverlay()
        self.temp_dir = os.getenv('TEMP_DIR', './output/temp')
        
    def create_fallback_video(
        self, 
        script: Dict, 
        output_path: str,
        duration: int = 30
    ) -> bool:
        """
        Create a fallback video with text and color backgrounds
        Used when AI video generation is not available
        
        Args:
            script: Script dictionary with scenes
            output_path: Output video path
            duration: Total video duration in seconds
            
        Returns:
            True if successful
        """
        try:
            logger.info("Creating fallback video with text overlays...")
            
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            scenes = script.get('scenes', [])
            if not scenes:
                logger.error("No scenes in script")
                return False
                
            # Create clips for each scene
            scene_duration = duration / len(scenes)
            clips = []
            
            for i, scene in enumerate(scenes):
                # Create color background
                colors = [
                    (20, 30, 60),    # Dark blue
                    (40, 20, 60),    # Dark purple
                    (20, 50, 50)     # Dark teal
                ]
                bg_color = colors[i % len(colors)]
                
                # Create background clip
                bg_clip = ColorClip(
                    size=(1280, 720),
                    color=bg_color,
                    duration=scene_duration
                )
                
                # Add text overlay
                title = script.get('headline', 'Breaking News')
                source = script.get('articleSource', 'News Source')
                
                # Create title text clip
                title_clip = TextClip(
                    title,
                    fontsize=48,
                    color='white',
                    font='Arial-Bold',
                    method='caption',
                    size=(1200, 200),
                    align='center'
                ).set_duration(scene_duration).set_position(('center', 200))
                
                # Create source text clip
                source_clip = TextClip(
                    f"Source: {source}",
                    fontsize=24,
                    color='lightgray',
                    font='Arial'
                ).set_duration(scene_duration).set_position(('center', 450))
                
                # Create narration text clip
                narration = scene.get('narration', '')
                if narration:
                    narration_clip = TextClip(
                        narration,
                        fontsize=28,
                        color='yellow',
                        font='Arial',
                        method='caption',
                        size=(1200, 150),
                        align='center'
                    ).set_duration(scene_duration).set_position(('center', 550))
                    
                    scene_clip = CompositeVideoClip([
                        bg_clip, title_clip, source_clip, narration_clip
                    ])
                else:
                    scene_clip = CompositeVideoClip([
                        bg_clip, title_clip, source_clip
                    ])
                
                # Add fade transitions
                scene_clip = fadein(scene_clip, 0.5)
                scene_clip = fadeout(scene_clip, 0.5)
                
                clips.append(scene_clip)
                
            # Concatenate all scenes
            final_video = concatenate_videoclips(clips, method="compose")
            
            # Add audio narration
            audio_path = os.path.join(self.temp_dir, f"{os.path.basename(output_path)}_audio.mp3")
            if self.tts_generator.generate_narration(scenes, audio_path):
                try:
                    audio = AudioFileClip(audio_path)
                    
                    # Trim or loop audio to match video duration
                    if audio.duration > final_video.duration:
                        audio = audio.subclip(0, final_video.duration)
                    elif audio.duration < final_video.duration:
                        # Loop audio if too short
                        audio = audio.loop(duration=final_video.duration)
                        
                    final_video = final_video.set_audio(audio)
                except Exception as e:
                    logger.warning(f"Could not add audio: {e}")
                    
            # Write final video
            final_video.write_videofile(
                output_path,
                fps=24,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile=os.path.join(self.temp_dir, 'temp_audio.m4a'),
                remove_temp=True
            )
            
            # Clean up
            final_video.close()
            for clip in clips:
                clip.close()
                
            logger.info(f"Fallback video saved to: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Fallback video creation failed: {e}")
            return False
            
    def compose_video(
        self, 
        script: Dict, 
        output_path: str,
        use_ai_video: bool = False
    ) -> bool:
        """
        Compose complete video from script
        
        Args:
            script: Script dictionary with scenes
            output_path: Output video path
            use_ai_video: Whether to use AI video generation (requires API key)
            
        Returns:
            True if successful
        """
        try:
            logger.info(f"Composing video: {script.get('headline', 'Untitled')}")
            
            scenes = script.get('scenes', [])
            if not scenes:
                logger.error("No scenes in script")
                return False
                
            # If AI video generation is enabled and configured
            if use_ai_video and os.getenv('FAL_API_KEY'):
                return self._compose_with_ai_video(script, output_path)
            else:
                # Use fallback method
                return self.create_fallback_video(script, output_path)
                
        except Exception as e:
            logger.error(f"Video composition failed: {e}")
            return False
            
    def _compose_with_ai_video(self, script: Dict, output_path: str) -> bool:
        """
        Compose video using AI-generated clips
        
        Args:
            script: Script dictionary
            output_path: Output video path
            
        Returns:
            True if successful
        """
        try:
            scenes = script.get('scenes', [])
            video_id = Path(output_path).stem
            
            # Generate video clips for each scene
            video_paths = self.video_generator.generate_scene_videos(
                scenes,
                self.temp_dir,
                video_id
            )
            
            if not video_paths:
                logger.warning("No AI videos generated, falling back to text video")
                return self.create_fallback_video(script, output_path)
                
            # Load video clips
            clips = []
            for video_path in video_paths:
                try:
                    clip = VideoFileClip(video_path)
                    clips.append(clip)
                except Exception as e:
                    logger.warning(f"Could not load clip {video_path}: {e}")
                    
            if not clips:
                return self.create_fallback_video(script, output_path)
                
            # Concatenate clips
            final_video = concatenate_videoclips(clips, method="compose")
            
            # Add text overlays
            # TODO: Add text overlays to video frames
            
            # Add audio narration
            audio_path = os.path.join(self.temp_dir, f"{video_id}_audio.mp3")
            if self.tts_generator.generate_narration(scenes, audio_path):
                try:
                    audio = AudioFileClip(audio_path)
                    
                    # Adjust audio duration
                    if audio.duration > final_video.duration:
                        audio = audio.subclip(0, final_video.duration)
                    elif audio.duration < final_video.duration:
                        audio = audio.loop(duration=final_video.duration)
                        
                    final_video = final_video.set_audio(audio)
                except Exception as e:
                    logger.warning(f"Could not add audio: {e}")
                    
            # Write final video
            final_video.write_videofile(
                output_path,
                fps=24,
                codec='libx264',
                audio_codec='aac'
            )
            
            # Clean up
            final_video.close()
            for clip in clips:
                clip.close()
                
            logger.info(f"Video saved to: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"AI video composition failed: {e}")
            return self.create_fallback_video(script, output_path)


def main():
    """Main entry point for command-line usage"""
    parser = argparse.ArgumentParser(description='Compose video from script')
    parser.add_argument('--script', required=True, help='Path to script JSON file')
    parser.add_argument('--output', required=True, help='Output video path')
    parser.add_argument('--video-id', help='Video ID')
    parser.add_argument('--use-ai', action='store_true', help='Use AI video generation')
    
    args = parser.parse_args()
    
    # Load script
    with open(args.script, 'r') as f:
        script = json.load(f)
        
    # Compose video
    composer = VideoComposer()
    success = composer.compose_video(script, args.output, args.use_ai)
    
    if success:
        print(f"SUCCESS:{args.output}")
        sys.exit(0)
    else:
        print("FAILED")
        sys.exit(1)


if __name__ == "__main__":
    main()

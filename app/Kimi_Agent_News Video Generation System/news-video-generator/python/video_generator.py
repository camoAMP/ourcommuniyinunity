#!/usr/bin/env python3
"""
Video Generator Module
Generates video clips using FAL.AI WAN 2.2 API or local ComfyUI
"""

import os
import json
import time
import requests
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class VideoGenerator:
    """Video generation using FAL.AI or local ComfyUI"""
    
    def __init__(self):
        self.fal_api_key = os.getenv('FAL_API_KEY', '')
        self.fal_model = os.getenv('FAL_MODEL', 'fal-ai/wan/v2')
        self.use_local_gpu = os.getenv('USE_LOCAL_GPU', 'false').lower() == 'true'
        self.comfyui_host = os.getenv('COMFYUI_HOST', 'http://localhost:8188')
        self.resolution = os.getenv('VIDEO_RESOLUTION', '720p')
        self.duration = int(os.getenv('VIDEO_DURATION_PER_SCENE', '5'))
        
    def generate_with_fal(self, prompt: str, output_path: str) -> bool:
        """
        Generate video using FAL.AI WAN 2.2 API
        
        Args:
            prompt: Visual description for video generation
            output_path: Path to save the generated video
            
        Returns:
            True if successful, False otherwise
        """
        if not self.fal_api_key:
            logger.error("FAL_API_KEY not set")
            return False
            
        try:
            logger.info(f"Generating video with FAL.AI: {prompt[:50]}...")
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Key {self.fal_api_key}'
            }
            
            payload = {
                'prompt': prompt,
                'resolution': self.resolution,
                'duration': self.duration
            }
            
            # Submit generation request
            response = requests.post(
                f'https://fal.run/{self.fal_model}',
                headers=headers,
                json=payload,
                timeout=120
            )
            
            if response.status_code != 200:
                logger.error(f"FAL.AI API error: {response.status_code} - {response.text}")
                return False
                
            result = response.json()
            
            if 'video' not in result or 'url' not in result['video']:
                logger.error(f"Invalid response from FAL.AI: {result}")
                return False
                
            video_url = result['video']['url']
            
            # Download video
            logger.info(f"Downloading video from: {video_url}")
            video_response = requests.get(video_url, timeout=60)
            
            if video_response.status_code == 200:
                # Ensure output directory exists
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                
                with open(output_path, 'wb') as f:
                    f.write(video_response.content)
                    
                logger.info(f"Video saved to: {output_path}")
                return True
            else:
                logger.error(f"Failed to download video: {video_response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"FAL.AI generation failed: {str(e)}")
            return False
            
    def generate_with_comfyui(self, prompt: str, output_path: str) -> bool:
        """
        Generate video using local ComfyUI instance
        
        Args:
            prompt: Visual description for video generation
            output_path: Path to save the generated video
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Generating video with ComfyUI: {prompt[:50]}...")
            
            # ComfyUI API workflow for HunyuanVideo
            workflow = {
                "1": {
                    "inputs": {
                        "prompt": prompt,
                        "width": 1280,
                        "height": 720,
                        "video_length": 30,  # frames
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
            }
            
            # Queue the workflow
            response = requests.post(
                f'{self.comfyui_host}/prompt',
                json={'prompt': workflow},
                timeout=30
            )
            
            if response.status_code != 200:
                logger.error(f"ComfyUI API error: {response.status_code}")
                return False
                
            prompt_id = response.json().get('prompt_id')
            
            if not prompt_id:
                logger.error("No prompt_id returned from ComfyUI")
                return False
                
            # Poll for completion
            max_retries = 60  # 5 minutes max
            for i in range(max_retries):
                time.sleep(5)
                
                history_response = requests.get(
                    f'{self.comfyui_host}/history/{prompt_id}',
                    timeout=10
                )
                
                if history_response.status_code == 200:
                    history = history_response.json()
                    
                    if prompt_id in history:
                        outputs = history[prompt_id].get('outputs', {})
                        
                        if outputs:
                            # Get output file
                            for node_id, node_output in outputs.items():
                                if 'videos' in node_output:
                                    video_info = node_output['videos'][0]
                                    video_filename = video_info['filename']
                                    video_subfolder = video_info.get('subfolder', '')
                                    
                                    # Download video
                                    video_url = f'{self.comfyui_host}/view?filename={video_filename}&subfolder={video_subfolder}&type=output'
                                    video_response = requests.get(video_url, timeout=60)
                                    
                                    if video_response.status_code == 200:
                                        os.makedirs(os.path.dirname(output_path), exist_ok=True)
                                        
                                        with open(output_path, 'wb') as f:
                                            f.write(video_response.content)
                                            
                                        logger.info(f"Video saved to: {output_path}")
                                        return True
                                        
            logger.error("ComfyUI generation timed out")
            return False
            
        except Exception as e:
            logger.error(f"ComfyUI generation failed: {str(e)}")
            return False
            
    def generate_video(self, prompt: str, output_path: str) -> bool:
        """
        Generate video using available method
        
        Args:
            prompt: Visual description for video generation
            output_path: Path to save the generated video
            
        Returns:
            True if successful, False otherwise
        """
        # Try local GPU first if enabled
        if self.use_local_gpu:
            logger.info("Attempting local GPU generation with ComfyUI...")
            if self.generate_with_comfyui(prompt, output_path):
                return True
            logger.warning("Local GPU generation failed, falling back to FAL.AI")
            
        # Fall back to FAL.AI
        return self.generate_with_fal(prompt, output_path)
        
    def generate_scene_videos(self, scenes: List[Dict], output_dir: str, video_id: str) -> List[str]:
        """
        Generate videos for all scenes
        
        Args:
            scenes: List of scene dictionaries with 'visual' key
            output_dir: Directory to save videos
            video_id: Base video ID
            
        Returns:
            List of paths to generated video files
        """
        video_paths = []
        
        for i, scene in enumerate(scenes):
            scene_num = i + 1
            visual_prompt = scene.get('visual', '')
            
            if not visual_prompt:
                logger.warning(f"Scene {scene_num} has no visual description, skipping")
                continue
                
            output_path = os.path.join(output_dir, f"{video_id}_scene{scene_num}.mp4")
            
            logger.info(f"Generating scene {scene_num}/{len(scenes)}...")
            
            if self.generate_video(visual_prompt, output_path):
                video_paths.append(output_path)
            else:
                logger.error(f"Failed to generate scene {scene_num}")
                
            # Small delay between generations
            time.sleep(1)
            
        return video_paths


def main():
    """Test the video generator"""
    generator = VideoGenerator()
    
    test_prompt = "Professional news studio with dramatic lighting, breaking news graphic overlay"
    output_path = "test_video.mp4"
    
    success = generator.generate_video(test_prompt, output_path)
    
    if success:
        print(f"Video generated successfully: {output_path}")
    else:
        print("Video generation failed")


if __name__ == "__main__":
    main()

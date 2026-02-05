#!/usr/bin/env python3
"""
Export Module
Multi-format video export for different platforms
"""

import os
import subprocess
from pathlib import Path
from typing import Dict, List, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Format specifications
FORMATS = {
    'horizontal': {
        'width': 1920,
        'height': 1080,
        'suffix': '_youtube',
        'platforms': ['YouTube', 'Website', 'LinkedIn']
    },
    'vertical': {
        'width': 1080,
        'height': 1920,
        'suffix': '_shorts',
        'platforms': ['TikTok', 'YouTube Shorts', 'Instagram Reels']
    },
    'square': {
        'width': 1080,
        'height': 1080,
        'suffix': '_square',
        'platforms': ['Instagram', 'Facebook']
    }
}


class VideoExporter:
    """Export videos in multiple formats"""
    
    def __init__(self):
        self.output_dir = os.getenv('OUTPUT_DIR', './output/videos')
        
    def resize_video(
        self, 
        input_path: str, 
        output_path: str, 
        width: int, 
        height: int,
        options: dict = None
    ) -> bool:
        """
        Resize video to target dimensions
        
        Args:
            input_path: Input video path
            output_path: Output video path
            width: Target width
            height: Target height
            options: Additional ffmpeg options
            
        Returns:
            True if successful
        """
        try:
            logger.info(f"Resizing video to {width}x{height}: {output_path}")
            
            # Build ffmpeg command
            cmd = [
                'ffmpeg',
                '-i', input_path,
                '-vf', f'scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:black',
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-movflags', '+faststart',
                '-y'
            ]
            
            # Add custom options
            if options:
                if 'fps' in options:
                    cmd.extend(['-r', str(options['fps'])])
                if 'bitrate' in options:
                    cmd.extend(['-b:v', options['bitrate']])
                    
            cmd.append(output_path)
            
            # Run ffmpeg
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info(f"Export complete: {output_path}")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg failed: {e.stderr}")
            return False
        except Exception as e:
            logger.error(f"Export failed: {e}")
            return False
            
    def export_format(
        self, 
        input_path: str, 
        format_name: str,
        output_dir: str = None
    ) -> Optional[str]:
        """
        Export video in specific format
        
        Args:
            input_path: Input video path
            format_name: Format name (horizontal, vertical, square)
            output_dir: Output directory (default: same as input)
            
        Returns:
            Path to exported video or None
        """
        if format_name not in FORMATS:
            logger.error(f"Unknown format: {format_name}")
            return None
            
        format_spec = FORMATS[format_name]
        
        # Determine output path
        if output_dir is None:
            output_dir = os.path.dirname(input_path)
            
        base_name = Path(input_path).stem
        output_path = os.path.join(
            output_dir, 
            f"{base_name}{format_spec['suffix']}.mp4"
        )
        
        # Resize video
        success = self.resize_video(
            input_path,
            output_path,
            format_spec['width'],
            format_spec['height']
        )
        
        return output_path if success else None
        
    def export_all_formats(
        self, 
        input_path: str,
        formats: List[str] = None,
        output_dir: str = None
    ) -> Dict[str, str]:
        """
        Export video in all formats
        
        Args:
            input_path: Input video path
            formats: List of formats to export (default: all)
            output_dir: Output directory
            
        Returns:
            Dictionary mapping format names to output paths
        """
        if formats is None:
            formats = list(FORMATS.keys())
            
        results = {}
        
        for format_name in formats:
            output_path = self.export_format(input_path, format_name, output_dir)
            if output_path:
                results[format_name] = output_path
                
        return results
        
    def export_with_captions(
        self,
        input_path: str,
        captions: List[dict],
        output_path: str,
        format_spec: dict = None
    ) -> bool:
        """
        Export video with burned-in captions
        
        Args:
            input_path: Input video path
            captions: List of caption objects with text, start, end
            output_path: Output path
            format_spec: Format specifications
            
        Returns:
            True if successful
        """
        try:
            # Create subtitle file
            srt_path = input_path.replace('.mp4', '.srt')
            self._create_srt(captions, srt_path)
            
            # Build ffmpeg command with subtitles
            cmd = [
                'ffmpeg',
                '-i', input_path,
                '-vf', f"subtitles={srt_path}:force_style='FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2'",
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-c:a', 'copy',
                '-y',
                output_path
            ]
            
            subprocess.run(cmd, capture_output=True, check=True)
            
            # Cleanup subtitle file
            os.remove(srt_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Caption export failed: {e}")
            return False
            
    def _create_srt(self, captions: List[dict], output_path: str):
        """Create SRT subtitle file"""
        with open(output_path, 'w', encoding='utf-8') as f:
            for i, caption in enumerate(captions, 1):
                start = self._format_time(caption['start'])
                end = self._format_time(caption['end'])
                
                f.write(f"{i}\n")
                f.write(f"{start} --> {end}\n")
                f.write(f"{caption['text']}\n\n")
                
    def _format_time(self, seconds: float) -> str:
        """Format seconds to SRT time format"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
        
    def get_video_info(self, video_path: str) -> Optional[dict]:
        """Get video metadata using ffprobe"""
        try:
            cmd = [
                'ffprobe',
                '-v', 'error',
                '-select_streams', 'v:0',
                '-show_entries', 'stream=width,height,duration,bit_rate',
                '-show_entries', 'format=duration,size',
                '-of', 'json',
                video_path
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            import json
            data = json.loads(result.stdout)
            
            stream = data.get('streams', [{}])[0]
            format_data = data.get('format', {})
            
            return {
                'width': stream.get('width'),
                'height': stream.get('height'),
                'duration': float(stream.get('duration', 0) or format_data.get('duration', 0)),
                'bitrate': stream.get('bit_rate'),
                'size': int(format_data.get('size', 0))
            }
            
        except Exception as e:
            logger.error(f"Failed to get video info: {e}")
            return None
            
    def create_gif_preview(
        self,
        input_path: str,
        output_path: str = None,
        duration: int = 3,
        fps: int = 10
    ) -> Optional[str]:
        """
        Create GIF preview from video
        
        Args:
            input_path: Input video path
            output_path: Output GIF path
            duration: GIF duration in seconds
            fps: Frames per second
            
        Returns:
            Path to GIF or None
        """
        if output_path is None:
            output_path = input_path.replace('.mp4', '_preview.gif')
            
        try:
            cmd = [
                'ffmpeg',
                '-i', input_path,
                '-t', str(duration),
                '-vf', f'fps={fps},scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer',
                '-loop', '0',
                '-y',
                output_path
            ]
            
            subprocess.run(cmd, capture_output=True, check=True)
            
            logger.info(f"GIF preview created: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"GIF creation failed: {e}")
            return None


def main():
    """Test video export"""
    exporter = VideoExporter()
    
    # Test info extraction
    test_video = "test_video.mp4"
    if os.path.exists(test_video):
        info = exporter.get_video_info(test_video)
        print(f"Video info: {info}")
        
        # Test format export
        for format_name in ['square', 'vertical']:
            output = exporter.export_format(test_video, format_name)
            print(f"Exported {format_name}: {output}")
    else:
        print(f"Test video not found: {test_video}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Thumbnail Generator Module
Creates engaging thumbnails for news videos
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import textwrap
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ThumbnailGenerator:
    """Generate video thumbnails with text overlays"""
    
    def __init__(self):
        self.font_size_title = 60
        self.font_size_subtitle = 36
        self.title_color = (255, 255, 255)  # White
        self.stroke_color = (0, 0, 0)  # Black outline
        self.stroke_width = 3
        
    def get_font(self, size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
        """Get font with fallback options"""
        font_paths = [
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
            '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
            '/System/Library/Fonts/Helvetica.ttc',
            'C:/Windows/Fonts/arialbd.ttf',
            'C:/Windows/Fonts/impact.ttf'
        ]
        
        for font_path in font_paths:
            if os.path.exists(font_path):
                try:
                    return ImageFont.truetype(font_path, size)
                except:
                    pass
                    
        return ImageFont.load_default()
        
    def extract_frame(self, video_path: str, time_seconds: int = 2) -> str:
        """Extract frame from video at specified time"""
        import subprocess
        
        output_path = video_path.replace('.mp4', '_frame.png')
        
        cmd = [
            'ffmpeg',
            '-i', video_path,
            '-ss', str(time_seconds),
            '-vframes', '1',
            '-q:v', '2',
            '-y',
            output_path
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            return output_path
        except subprocess.CalledProcessError as e:
            logger.error(f"Frame extraction failed: {e}")
            return None
            
    def create_gradient_background(
        self, 
        width: int, 
        height: int, 
        color_scheme: dict = None
    ) -> Image.Image:
        """Create gradient background"""
        if color_scheme is None:
            color_scheme = {'top': (20, 30, 60), 'bottom': (40, 20, 60)}
            
        img = Image.new('RGB', (width, height))
        
        for y in range(height):
            ratio = y / height
            r = int(color_scheme['top'][0] * (1 - ratio) + color_scheme['bottom'][0] * ratio)
            g = int(color_scheme['top'][1] * (1 - ratio) + color_scheme['bottom'][1] * ratio)
            b = int(color_scheme['top'][2] * (1 - ratio) + color_scheme['bottom'][2] * ratio)
            
            for x in range(width):
                img.putpixel((x, y), (r, g, b))
                
        return img
        
    def wrap_text(self, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> str:
        """Wrap text to fit within max_width"""
        words = text.split()
        lines = []
        current_line = []
        
        temp_img = Image.new('RGBA', (1, 1))
        draw = ImageDraw.Draw(temp_img)
        
        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            text_width = bbox[2] - bbox[0]
            
            if text_width <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
                
        if current_line:
            lines.append(' '.join(current_line))
            
        return '\n'.join(lines)
        
    def draw_text_with_stroke(
        self,
        draw: ImageDraw.Draw,
        text: str,
        position: tuple,
        font: ImageFont.FreeTypeFont,
        fill: tuple,
        stroke_width: int = 3,
        stroke_fill: tuple = (0, 0, 0)
    ):
        """Draw text with stroke outline"""
        x, y = position
        
        # Draw stroke
        for dx in range(-stroke_width, stroke_width + 1):
            for dy in range(-stroke_width, stroke_width + 1):
                if dx != 0 or dy != 0:
                    draw.text((x + dx, y + dy), text, font=font, fill=stroke_fill)
                    
        # Draw main text
        draw.text(position, text, font=font, fill=fill)
        
    def generate_thumbnail(
        self,
        video_path: str,
        title: str,
        output_path: str = None,
        use_frame: bool = True,
        color_scheme: dict = None
    ) -> str:
        """
        Generate thumbnail for video
        
        Args:
            video_path: Path to video file
            title: Title text to overlay
            output_path: Output path (default: video_path + '_thumb.jpg')
            use_frame: Whether to extract frame from video
            color_scheme: Color scheme for background
            
        Returns:
            Path to generated thumbnail
        """
        try:
            if output_path is None:
                output_path = video_path.replace('.mp4', '_thumb.jpg')
                
            logger.info(f"Generating thumbnail: {title[:50]}...")
            
            # Get background
            if use_frame:
                frame_path = self.extract_frame(video_path)
                if frame_path and os.path.exists(frame_path):
                    bg = Image.open(frame_path).convert('RGB')
                    # Apply blur
                    bg = bg.filter(ImageFilter.GaussianBlur(radius=5))
                    # Darken
                    bg = Image.blend(bg, Image.new('RGB', bg.size, (0, 0, 0)), 0.4)
                else:
                    bg = self.create_gradient_background(1280, 720, color_scheme)
            else:
                bg = self.create_gradient_background(1280, 720, color_scheme)
                
            # Add text overlay
            draw = ImageDraw.Draw(bg)
            
            # Title font
            title_font = self.get_font(self.font_size_title)
            
            # Wrap and draw title
            wrapped_title = self.wrap_text(title, title_font, 1200)
            
            # Calculate text position (center)
            title_bbox = draw.multilinebbox((0, 0), wrapped_title, font=title_font)
            title_width = title_bbox[2] - title_bbox[0]
            title_height = title_bbox[3] - title_bbox[1]
            
            title_x = (bg.width - title_width) // 2
            title_y = (bg.height - title_height) // 2
            
            # Draw title with stroke
            self.draw_text_with_stroke(
                draw,
                wrapped_title,
                (title_x, title_y),
                title_font,
                self.title_color,
                self.stroke_width,
                self.stroke_color
            )
            
            # Save thumbnail
            bg.save(output_path, 'JPEG', quality=90)
            
            logger.info(f"Thumbnail saved: {output_path}")
            
            # Cleanup frame if extracted
            if use_frame and frame_path and os.path.exists(frame_path):
                os.remove(frame_path)
                
            return output_path
            
        except Exception as e:
            logger.error(f"Thumbnail generation failed: {e}")
            return None
            
    def generate_square_thumbnail(
        self,
        video_path: str,
        title: str,
        output_path: str = None
    ) -> str:
        """Generate square thumbnail (for social media)"""
        try:
            if output_path is None:
                output_path = video_path.replace('.mp4', '_thumb_square.jpg')
                
            # Extract frame
            frame_path = self.extract_frame(video_path)
            
            if frame_path and os.path.exists(frame_path):
                bg = Image.open(frame_path).convert('RGB')
                
                # Crop to square (center)
                width, height = bg.size
                size = min(width, height)
                left = (width - size) // 2
                top = (height - size) // 2
                bg = bg.crop((left, top, left + size, top + size))
                
                # Resize to standard size
                bg = bg.resize((1080, 1080), Image.Resampling.LANCZOS)
            else:
                # Create gradient background
                bg = self.create_gradient_background(1080, 1080)
                
            # Add text
            draw = ImageDraw.Draw(bg)
            title_font = self.get_font(48)
            
            wrapped_title = self.wrap_text(title, title_font, 1000)
            
            title_bbox = draw.multilinebbox((0, 0), wrapped_title, font=title_font)
            title_width = title_bbox[2] - title_bbox[0]
            title_height = title_bbox[3] - title_bbox[1]
            
            title_x = (bg.width - title_width) // 2
            title_y = (bg.height - title_height) // 2
            
            self.draw_text_with_stroke(
                draw,
                wrapped_title,
                (title_x, title_y),
                title_font,
                self.title_color,
                self.stroke_width,
                self.stroke_color
            )
            
            bg.save(output_path, 'JPEG', quality=90)
            
            # Cleanup
            if frame_path and os.path.exists(frame_path):
                os.remove(frame_path)
                
            return output_path
            
        except Exception as e:
            logger.error(f"Square thumbnail generation failed: {e}")
            return None


def main():
    """Test thumbnail generation"""
    generator = ThumbnailGenerator()
    
    # Test with gradient background
    test_title = "Breaking: Major Market Movement Detected - Stocks Surge"
    
    bg = generator.create_gradient_background(1280, 720)
    output_path = "test_thumbnail.jpg"
    
    # Add text and save
    draw = ImageDraw.Draw(bg)
    title_font = generator.get_font(60)
    wrapped = generator.wrap_text(test_title, title_font, 1200)
    
    title_bbox = draw.multilinebbox((0, 0), wrapped, font=title_font)
    title_x = (1280 - (title_bbox[2] - title_bbox[0])) // 2
    title_y = (720 - (title_bbox[3] - title_bbox[1])) // 2
    
    generator.draw_text_with_stroke(
        draw, wrapped, (title_x, title_y), title_font, (255, 255, 255)
    )
    
    bg.save(output_path)
    print(f"Test thumbnail saved: {output_path}")


if __name__ == "__main__":
    main()

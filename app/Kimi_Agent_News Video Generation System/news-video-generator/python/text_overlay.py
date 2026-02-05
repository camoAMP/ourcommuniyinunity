#!/usr/bin/env python3
"""
Text Overlay Module
Adds news title, source, and other text overlays to video frames
"""

import os
from PIL import Image, ImageDraw, ImageFont
from typing import Tuple, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TextOverlay:
    """Adds text overlays to video frames"""
    
    def __init__(self):
        self.font_size_title = 48
        self.font_size_source = 24
        self.font_size_caption = 32
        self.title_color = (255, 255, 255)  # White
        self.source_color = (200, 200, 200)  # Light gray
        self.bg_color = (0, 0, 0, 180)  # Semi-transparent black
        
    def get_font(self, size: int) -> ImageFont.FreeTypeFont:
        """Get font with fallback"""
        # Try common font paths
        font_paths = [
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
            '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
            '/System/Library/Fonts/Helvetica.ttc',  # macOS
            'C:/Windows/Fonts/arial.ttf',  # Windows
        ]
        
        for font_path in font_paths:
            if os.path.exists(font_path):
                try:
                    return ImageFont.truetype(font_path, size)
                except:
                    pass
                    
        # Fallback to default font
        return ImageFont.load_default()
        
    def add_title_overlay(
        self, 
        frame: Image.Image, 
        title: str, 
        source: str,
        position: str = 'bottom'
    ) -> Image.Image:
        """
        Add title and source overlay to a frame
        
        Args:
            frame: PIL Image
            title: News title text
            source: News source
            position: 'top', 'bottom', or 'center'
            
        Returns:
            Frame with overlay
        """
        # Create a copy to avoid modifying original
        img = frame.copy().convert('RGBA')
        width, height = img.size
        
        # Create overlay layer
        overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Calculate text area
        title_font = self.get_font(self.font_size_title)
        source_font = self.get_font(self.font_size_source)
        
        # Wrap title text
        max_width = width - 80
        wrapped_title = self.wrap_text(title, title_font, max_width)
        
        # Calculate text dimensions
        title_bbox = draw.multilinebbox((0, 0), wrapped_title, font=title_font)
        title_height = title_bbox[3] - title_bbox[1]
        
        source_bbox = draw.textbbox((0, 0), source, font=source_font)
        source_height = source_bbox[3] - source_bbox[1]
        
        # Calculate background position
        padding = 20
        bg_height = title_height + source_height + padding * 3
        
        if position == 'bottom':
            bg_y = height - bg_height - 20
        elif position == 'top':
            bg_y = 20
        else:  # center
            bg_y = (height - bg_height) // 2
            
        # Draw background
        draw.rectangle(
            [(20, bg_y), (width - 20, bg_y + bg_height)],
            fill=self.bg_color
        )
        
        # Draw title text
        title_y = bg_y + padding
        draw.multiline_text(
            (40, title_y),
            wrapped_title,
            font=title_font,
            fill=self.title_color
        )
        
        # Draw source text
        source_y = title_y + title_height + padding
        draw.text(
            (40, source_y),
            f"Source: {source}",
            font=source_font,
            fill=self.source_color
        )
        
        # Composite overlay onto original image
        result = Image.alpha_composite(img, overlay)
        
        return result.convert('RGB')
        
    def add_caption_overlay(
        self,
        frame: Image.Image,
        caption: str,
        position: str = 'bottom'
    ) -> Image.Image:
        """
        Add caption overlay to a frame
        
        Args:
            frame: PIL Image
            caption: Caption text
            position: 'top', 'bottom', or 'center'
            
        Returns:
            Frame with overlay
        """
        img = frame.copy().convert('RGBA')
        width, height = img.size
        
        overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        caption_font = self.get_font(self.font_size_caption)
        
        # Wrap caption
        max_width = width - 80
        wrapped_caption = self.wrap_text(caption, caption_font, max_width)
        
        # Calculate dimensions
        caption_bbox = draw.multilinebbox((0, 0), wrapped_caption, font=caption_font)
        caption_height = caption_bbox[3] - caption_bbox[1]
        
        padding = 15
        bg_height = caption_height + padding * 2
        
        if position == 'bottom':
            bg_y = height - bg_height - 20
        elif position == 'top':
            bg_y = 20
        else:
            bg_y = (height - bg_height) // 2
            
        # Draw background
        draw.rectangle(
            [(20, bg_y), (width - 20, bg_y + bg_height)],
            fill=self.bg_color
        )
        
        # Draw caption
        draw.multiline_text(
            (40, bg_y + padding),
            wrapped_caption,
            font=caption_font,
            fill=self.title_color,
            align='center'
        )
        
        result = Image.alpha_composite(img, overlay)
        return result.convert('RGB')
        
    def wrap_text(self, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> str:
        """Wrap text to fit within max_width"""
        words = text.split()
        lines = []
        current_line = []
        
        # Create a temporary draw object
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


def main():
    """Test text overlay"""
    # Create a test image
    img = Image.new('RGB', (1280, 720), color=(50, 50, 100))
    
    overlay = TextOverlay()
    result = overlay.add_title_overlay(
        img,
        "Breaking: Major Tech Company Announces Revolutionary AI Product",
        "TechCrunch"
    )
    
    result.save('test_overlay.png')
    print("Test overlay saved to test_overlay.png")


if __name__ == "__main__":
    main()

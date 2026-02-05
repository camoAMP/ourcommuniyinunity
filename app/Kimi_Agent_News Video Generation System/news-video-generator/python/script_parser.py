#!/usr/bin/env python3
"""
Script Parser Module
Parses and validates video scripts from various formats
"""

import json
import re
from typing import Dict, List, Optional
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ScriptParser:
    """Parses video scripts from different formats"""
    
    def __init__(self):
        pass
        
    def parse_json(self, script_path: str) -> Optional[Dict]:
        """
        Parse script from JSON file
        
        Args:
            script_path: Path to JSON file
            
        Returns:
            Parsed script dictionary or None
        """
        try:
            with open(script_path, 'r', encoding='utf-8') as f:
                script = json.load(f)
                
            # Validate script structure
            if self.validate_script(script):
                return script
            else:
                logger.error("Invalid script structure")
                return None
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON: {e}")
            return None
        except FileNotFoundError:
            logger.error(f"Script file not found: {script_path}")
            return None
            
    def parse_text(self, text: str, article_info: Dict = None) -> Dict:
        """
        Parse script from raw text output
        
        Args:
            text: Raw script text
            article_info: Optional article metadata
            
        Returns:
            Structured script dictionary
        """
        scenes = []
        headline = article_info.get('title', 'Breaking News') if article_info else 'Breaking News'
        
        # Extract headline
        headline_match = re.search(r'HEADLINE:\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        if headline_match:
            headline = headline_match.group(1).strip()
            
        # Extract scenes using regex
        scene_pattern = r'SCENE\s*(\d+):\s*(.+?)(?=NARRATION:|SCENE|$)'
        narration_pattern = r'NARRATION:\s*(.+?)(?=SCENE|$)'
        
        scene_matches = re.findall(scene_pattern, text, re.DOTALL | re.IGNORECASE)
        narration_matches = re.findall(narration_pattern, text, re.DOTALL | re.IGNORECASE)
        
        for i, (scene_num, visual) in enumerate(scene_matches):
            narration = narration_matches[i].strip() if i < len(narration_matches) else ''
            
            scenes.append({
                'sceneNumber': int(scene_num),
                'visual': visual.strip(),
                'narration': narration
            })
            
        # If no scenes found, create default scenes
        if not scenes:
            logger.warning("No scenes found in text, creating default scenes")
            scenes = self._create_default_scenes(article_info)
            
        return {
            'headline': headline,
            'scenes': scenes[:3],  # Max 3 scenes
            'fullText': text,
            'articleTitle': article_info.get('title', '') if article_info else '',
            'articleSource': article_info.get('source', '') if article_info else '',
            'articleLink': article_info.get('link', '') if article_info else '',
            'generatedAt': None
        }
        
    def _create_default_scenes(self, article_info: Dict = None) -> List[Dict]:
        """Create default scenes when parsing fails"""
        title = article_info.get('title', 'Breaking News') if article_info else 'Breaking News'
        source = article_info.get('source', 'News Source') if article_info else 'News Source'
        summary = article_info.get('summary', '') if article_info else ''
        category = article_info.get('category', 'news') if article_info else 'news'
        
        return [
            {
                'sceneNumber': 1,
                'visual': f'Breaking news graphic with dramatic lighting, {source} logo visible',
                'narration': f'Breaking news from {source}. {title}'
            },
            {
                'sceneNumber': 2,
                'visual': f'Professional news studio setting with {category} themed backdrop',
                'narration': summary[:200] if summary else 'Details are emerging on this developing story.'
            },
            {
                'sceneNumber': 3,
                'visual': 'Closing graphic with source attribution and subscribe call-to-action',
                'narration': f'Stay tuned for more updates. Reporting from {source}.'
            }
        ]
        
    def validate_script(self, script: Dict) -> bool:
        """
        Validate script structure
        
        Args:
            script: Script dictionary to validate
            
        Returns:
            True if valid
        """
        required_fields = ['headline', 'scenes']
        
        for field in required_fields:
            if field not in script:
                logger.error(f"Missing required field: {field}")
                return False
                
        if not isinstance(script['scenes'], list):
            logger.error("'scenes' must be a list")
            return False
            
        if len(script['scenes']) == 0:
            logger.error("Script must have at least one scene")
            return False
            
        # Validate each scene
        for i, scene in enumerate(script['scenes']):
            if 'visual' not in scene:
                logger.error(f"Scene {i+1} missing 'visual'")
                return False
                
        return True
        
    def enhance_visual_prompts(self, script: Dict) -> Dict:
        """
        Enhance visual prompts for better video generation
        
        Args:
            script: Script dictionary
            
        Returns:
            Script with enhanced prompts
        """
        enhancements = [
            'professional quality',
            'cinematic lighting',
            '4k resolution',
            'smooth motion'
        ]
        
        for scene in script.get('scenes', []):
            visual = scene.get('visual', '')
            
            # Add enhancements if not already present
            for enhancement in enhancements:
                if enhancement.lower() not in visual.lower():
                    visual += f', {enhancement}'
                    
            scene['visual'] = visual
            
        return script
        
    def estimate_duration(self, script: Dict) -> int:
        """
        Estimate video duration based on narration
        
        Args:
            script: Script dictionary
            
        Returns:
            Estimated duration in seconds
        """
        total_words = 0
        
        for scene in script.get('scenes', []):
            narration = scene.get('narration', '')
            total_words += len(narration.split())
            
        # Average speaking rate: ~150 words per minute = 2.5 words per second
        estimated_seconds = total_words / 2.5
        
        # Add buffer for transitions
        return int(estimated_seconds + 5)
        
    def export_script(self, script: Dict, output_path: str) -> bool:
        """
        Export script to JSON file
        
        Args:
            script: Script dictionary
            output_path: Output file path
            
        Returns:
            True if successful
        """
        try:
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(script, f, indent=2, ensure_ascii=False)
                
            logger.info(f"Script exported to: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to export script: {e}")
            return False


def main():
    """Test the script parser"""
    parser = ScriptParser()
    
    # Test text parsing
    sample_text = """
    HEADLINE: Tech Giant Announces Revolutionary AI
    
    SCENE 1: Modern tech campus with glass buildings, people walking
    NARRATION: A major technology company has announced a breakthrough in artificial intelligence.
    
    SCENE 2: Close-up of computer screens showing AI interface
    NARRATION: The new system promises to transform how we interact with technology.
    
    SCENE 3: CEO speaking at press conference with company logo
    NARRATION: Industry experts are calling this a game-changing development.
    """
    
    article_info = {
        'title': 'Tech Giant Announces Revolutionary AI',
        'source': 'TechCrunch',
        'category': 'tech'
    }
    
    script = parser.parse_text(sample_text, article_info)
    
    print("Parsed Script:")
    print(json.dumps(script, indent=2))
    
    print(f"\nEstimated Duration: {parser.estimate_duration(script)} seconds")


if __name__ == "__main__":
    main()

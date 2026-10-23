"""
EcoPulse Google Gemini Safety Settings Configuration
Enforces high-safety thresholds across all Gemini multimodal and reasoning calls.
"""

from typing import List, Dict, Any

def get_gemini_safety_settings() -> List[Dict[str, str]]:
    """
    Returns standard Gemini safety settings mapped to strict blocking thresholds.
    Ensures safe, harmless multimodal text and image generation.
    """
    return [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        }
    ]

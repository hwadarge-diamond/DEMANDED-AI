"""
EcoPulse Dynamic Model Router
Directs queries to Gemini Flash by default and escalates to Gemini Pro when complex reasoning is required.
"""

from typing import Tuple, Dict, Any
from app.config import settings

class ModelRouter:
    @classmethod
    def select_model(
        cls,
        task_type: str,
        initial_confidence: float = 1.0,
        threat_score: float = 0.0,
        is_high_risk_category: bool = False,
        requires_deep_reasoning: bool = False
    ) -> Tuple[str, str]:
        """
        Determines the optimal Gemini model and records the decision rationale.
        Returns:
            model_name (str): 'gemini-1.5-flash' or 'gemini-1.5-pro'
            escalation_reason (str): Documented justification for routing choice
        """
        # 1. Check prompt injection suspicion
        if threat_score >= 0.35:
            return (
                settings.GEMINI_PRO_MODEL,
                f"ESCALATED_PRO: Elevated adversarial threat score ({threat_score:.2f}) requires Pro deep safety deliberation."
            )

        # 2. Check confidence threshold
        if initial_confidence < settings.CONFIDENCE_PRO_ESCALATION_THRESHOLD:
            return (
                settings.GEMINI_PRO_MODEL,
                f"ESCALATED_PRO: Low confidence score ({initial_confidence:.2f} < {settings.CONFIDENCE_PRO_ESCALATION_THRESHOLD}) triggered escalation."
            )

        # 3. High-risk pathogen categories (e.g. seafood, raw chicken, mixed dairy buffet)
        if is_high_risk_category and requires_deep_reasoning:
            return (
                settings.GEMINI_PRO_MODEL,
                "ESCALATED_PRO: High-risk microbiological category requires multi-step HACCP hazard verification."
            )

        # Default fast, cost-effective path
        return (
            settings.GEMINI_FLASH_MODEL,
            "ROUTED_FLASH: Standard request served by Gemini Flash for sub-400ms speed and 10x cost efficiency."
        )

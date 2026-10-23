"""
EcoPulse Intake Agent (Multimodal)
Ingests donor text, simulated voice transcripts, or food imagery.
Performs PII redaction, sandboxing, and structured extraction of food inventory.
"""

import re
import json
import httpx
from datetime import datetime
from typing import Dict, Any, Optional
from app.agents.base import BaseAgent
from app.models.schemas import IntakeResult, FoodItem, FoodCategory, StorageCondition
from app.security.pii_redactor import PIIRedactor
from app.security.sanitizer import PromptInjectionDetector
from app.config import settings

class IntakeAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="IntakeAgent", timeout_seconds=6.0, max_retries=1)

    async def process_intake(
        self,
        raw_text: str,
        image_base64: Optional[str] = None,
        audio_transcript: Optional[str] = None,
        model_name: str = "gemini-1.5-flash"
    ) -> Dict[str, Any]:
        """
        Coordinates PII redaction, sandboxing, and food item schema extraction.
        """
        # 1. Combine textual sources
        combined_text = raw_text or ""
        if audio_transcript:
            combined_text += f"\n[Voice Transcription]: {audio_transcript}"

        # 2. Redact PII
        clean_text, pii_count = PIIRedactor.redact(combined_text)

        # 3. Sandbox untrusted user data
        sandboxed = PromptInjectionDetector.sandbox_untrusted_data(clean_text)

        # 4. Execute with resilience (Live Gemini API with fallback to deterministic heuristic parser)
        async def primary_ai_call():
            if not settings.GEMINI_API_KEY:
                raise ValueError("No GEMINI_API_KEY set; activating high-fidelity deterministic parser.")
            
            # Real Google Gemini API Call via HTTPX
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
            prompt = (
                "You are the EcoPulse Intake Agent. Extract structured food rescue inventory from the following sandboxed donor report.\n"
                "Return ONLY a valid JSON object matching the IntakeResult schema.\n"
                f"{sandboxed}"
            )
            contents = [{"parts": [{"text": prompt}]}]
            if image_base64:
                contents[0]["parts"].append({
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": image_base64
                    }
                })

            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(url, json={"contents": contents})
                if resp.status_code != 200:
                    raise RuntimeError(f"Gemini API returned status {resp.status_code}")
                data = resp.json()
                raw_reply = data["candidates"][0]["content"]["parts"][0]["text"]
                # Clean Markdown JSON fences if present
                clean_json = re.sub(r"^```(?:json)?|```$", "", raw_reply.strip(), flags=re.MULTILINE).strip()
                parsed = json.loads(clean_json)
                return IntakeResult(**parsed)

        def rule_based_fallback():
            return self._deterministic_parse(clean_text, bool(image_base64))

        exec_res = await self.execute_with_resilience(
            primary_ai_call,
            rule_based_fallback,
            model_name=model_name
        )
        
        result_model: IntakeResult = exec_res["data"]
        return {
            "intake_result": result_model,
            "latency_ms": exec_res["latency_ms"],
            "model_used": exec_res["model_used"],
            "execution_path": exec_res["execution_path"],
            "pii_redacted_count": pii_count
        }

    def _deterministic_parse(self, text: str, has_image: bool) -> IntakeResult:
        """
        High-fidelity deterministic natural language rule parser for zero-downtime offline execution.
        """
        text_lower = text.lower()
        
        # Detect category
        category = FoodCategory.COOKED_MEALS
        storage = StorageCondition.ROOM_TEMP
        requires_cold = False
        urgency_hrs = 4.0
        allergens = []
        dietary = []

        if any(w in text_lower for w in ["bread", "baguette", "pastry", "croissant", "bakery", "muffins"]):
            category = FoodCategory.BAKERY
            storage = StorageCondition.ROOM_TEMP
            urgency_hrs = 24.0
            allergens.append("gluten")
            dietary.append("vegetarian")
        elif any(w in text_lower for w in ["salad", "vegetable", "fruit", "produce", "apples", "lettuce", "carrots"]):
            category = FoodCategory.PRODUCE
            storage = StorageCondition.REFRIGERATED
            requires_cold = True
            urgency_hrs = 36.0
            dietary.extend(["vegan", "vegetarian"])
        elif any(w in text_lower for w in ["milk", "cheese", "yogurt", "dairy", "butter"]):
            category = FoodCategory.DAIRY
            storage = StorageCondition.REFRIGERATED
            requires_cold = True
            urgency_hrs = 12.0
            allergens.append("dairy")
            dietary.append("vegetarian")
        elif any(w in text_lower for w in ["canned", "rice", "beans", "pasta", "dry goods", "cereal"]):
            category = FoodCategory.PACKAGED_NON_PERISHABLE
            storage = StorageCondition.ROOM_TEMP
            urgency_hrs = 72.0
            dietary.append("vegetarian")
        elif any(w in text_lower for w in ["fish", "salmon", "seafood", "shrimp", "chicken", "beef", "pork", "meat"]):
            category = FoodCategory.MEAT_SEAFOOD
            storage = StorageCondition.REFRIGERATED
            requires_cold = True
            urgency_hrs = 3.0
            if "halal" in text_lower:
                dietary.append("halal")
        else:
            # Cooked meals / buffet default
            category = FoodCategory.COOKED_MEALS
            if "hot" in text_lower or "warming" in text_lower or "chafing" in text_lower:
                storage = StorageCondition.HOT_HOLDING
                urgency_hrs = 3.0
            elif "chilled" in text_lower or "refrigerated" in text_lower or "fridge" in text_lower:
                storage = StorageCondition.REFRIGERATED
                requires_cold = True
                urgency_hrs = 8.0
            else:
                storage = StorageCondition.ROOM_TEMP
                urgency_hrs = 2.5

        if "vegetarian" in text_lower and "vegetarian" not in dietary:
            dietary.append("vegetarian")
        if "halal" in text_lower and "halal" not in dietary:
            dietary.append("halal")
        if "nuts" in text_lower or "peanut" in text_lower:
            allergens.append("peanuts")

        # Extract quantities
        weight_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:kg|kilos?|kilograms?)", text_lower)
        weight_kg = float(weight_match.group(1)) if weight_match else 25.0

        portions_match = re.search(r"(\d+)\s*(?:portions?|meals?|servings?|people|boxes)", text_lower)
        portions = int(portions_match.group(1)) if portions_match else max(10, int(weight_kg / 0.42))

        # Check packaging
        packaging = "sealed"
        if "open" in text_lower or "uncovered" in text_lower:
            packaging = "open"
        elif "covered" in text_lower or "foil" in text_lower:
            packaging = "covered"

        item = FoodItem(
            name=f"Surplus {category.value.replace('_', ' ').title()}",
            category=category,
            estimated_weight_kg=weight_kg,
            portions=portions,
            storage_condition=storage,
            packaging_integrity=packaging,
            allergens=allergens,
            dietary_tags=dietary
        )

        return IntakeResult(
            summary=f"Processed surplus food intake: {portions} portions ({weight_kg}kg) of {category.value}.",
            items=[item],
            total_weight_kg=weight_kg,
            total_portions=portions,
            urgency_hours=urgency_hrs,
            requires_refrigeration=requires_cold,
            donor_notes_clean=text.strip()
        )

intake_agent = IntakeAgent()

"""
EcoPulse Automated Efficiency & Routing Tests
Measures model routing logic (Flash by default vs Pro escalation) and multi-tier response caching.
"""

from app.efficiency.router import ModelRouter
from app.efficiency.cache import cache_engine
from app.efficiency.metrics import efficiency_tracker
from app.config import settings

def test_model_routing_default_flash():
    """
    EFFICIENCY REQUIREMENT:
    Standard requests must use the faster, cheaper Gemini Flash model.
    """
    model, reason = ModelRouter.select_model(
        task_type="intake_and_safety",
        initial_confidence=0.95,
        threat_score=0.0
    )
    assert model == settings.GEMINI_FLASH_MODEL
    assert "ROUTED_FLASH" in reason
    print("\n[EFFICIENCY TEST PASSED] Standard request routed to Gemini Flash!")

def test_model_routing_escalate_pro():
    """
    EFFICIENCY REQUIREMENT:
    Low-confidence or high-threat requests must escalate to Gemini Pro for deep reasoning.
    """
    # 1. Low confidence trigger
    model_conf, reason_conf = ModelRouter.select_model(
        task_type="intake_and_safety",
        initial_confidence=0.60, # < 0.75 threshold
        threat_score=0.0
    )
    assert model_conf == settings.GEMINI_PRO_MODEL
    assert "ESCALATED_PRO" in reason_conf

    # 2. Elevated injection threat trigger
    model_threat, reason_threat = ModelRouter.select_model(
        task_type="intake_and_safety",
        initial_confidence=0.90,
        threat_score=0.45
    )
    assert model_threat == settings.GEMINI_PRO_MODEL
    assert "ESCALATED_PRO" in reason_threat
    print("\n[EFFICIENCY TEST PASSED] Escalation logic verified for Gemini Pro!")

def test_response_caching():
    """
    Verifies that cache hits avoid redundant computation and track hit rates accurately.
    """
    namespace = "food_haccp_rules"
    key = "chilled_lasagna_40portions"
    value = {"decision": "ACCEPT", "confidence": 0.98}

    # First access - Cache Miss
    miss_val = cache_engine.get(namespace, key)
    assert miss_val is None

    # Set in cache
    cache_engine.set(namespace, key, value, ttl_seconds=600)

    # Second access - Cache Hit
    hit_val = cache_engine.get(namespace, key)
    assert hit_val is not None
    assert hit_val["decision"] == "ACCEPT"

    stats = cache_engine.stats()
    assert stats["hits"] >= 1
    print("\n[EFFICIENCY TEST PASSED] Cache engine hit and retention verified!")

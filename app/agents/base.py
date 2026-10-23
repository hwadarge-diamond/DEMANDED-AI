"""
EcoPulse Base Agent Interface
Encapsulates retry policies, execution timeouts, latency benchmarking, and graceful rule-based fallbacks.
"""

import time
import asyncio
from typing import Dict, Any, Optional
from app.efficiency.metrics import efficiency_tracker

class BaseAgent:
    def __init__(self, name: str, timeout_seconds: float = 8.0, max_retries: int = 2):
        self.name = name
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries

    async def execute_with_resilience(
        self,
        primary_callable,
        fallback_callable,
        model_name: str,
        *args,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Executes the primary agent reasoning method with retry and timeout guards.
        Degrades gracefully to deterministic rule-based fallback if API errors persist.
        """
        start_time = time.time()
        last_exception = None

        for attempt in range(self.max_retries + 1):
            try:
                # Execute with async timeout
                result = await asyncio.wait_for(
                    primary_callable(*args, **kwargs),
                    timeout=self.timeout_seconds
                )
                elapsed_ms = (time.time() - start_time) * 1000.0
                efficiency_tracker.record_call(model_name, elapsed_ms)
                return {
                    "success": True,
                    "data": result,
                    "latency_ms": round(elapsed_ms, 1),
                    "execution_path": "PRIMARY_AI_MODEL",
                    "model_used": model_name
                }
            except Exception as e:
                last_exception = e
                await asyncio.sleep(0.15 * (attempt + 1))

        # Graceful degradation to deterministic rule-based path
        fallback_start = time.time()
        fallback_result = fallback_callable(*args, **kwargs)
        fallback_ms = (time.time() - fallback_start) * 1000.0
        efficiency_tracker.record_call("fallback-rules", fallback_ms)

        return {
            "success": True,
            "data": fallback_result,
            "latency_ms": round(fallback_ms, 1),
            "execution_path": "RULE_BASED_FALLBACK",
            "model_used": "deterministic-rules-engine",
            "fallback_notice": f"AI model invocation timed out or failed: {str(last_exception)}. Safe deterministic fallback applied."
        }

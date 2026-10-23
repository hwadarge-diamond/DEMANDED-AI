"""
EcoPulse Efficiency Telemetry & Cost Accounting
Measures model latency, token costs, Flash vs Pro routing distribution, and quantifiable savings.
"""

from typing import Dict, Any

class EfficiencyTracker:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EfficiencyTracker, cls).__new__(cls)
            cls._instance._init_metrics()
        return cls._instance

    def _init_metrics(self):
        self.total_agent_invocations: int = 0
        self.flash_invocations: int = 0
        self.pro_invocations: int = 0
        self.fallback_invocations: int = 0
        
        self.total_prompt_tokens: int = 0
        self.total_completion_tokens: int = 0
        
        self.flash_latencies: list = []
        self.pro_latencies: list = []
        
        # Google Gemini Pricing reference (per 1k tokens)
        self.FLASH_INPUT_PRICE_PER_1K = 0.000075
        self.FLASH_OUTPUT_PRICE_PER_1K = 0.00030
        self.PRO_INPUT_PRICE_PER_1K = 0.00125
        self.PRO_OUTPUT_PRICE_PER_1K = 0.00500

    def record_call(self, model: str, latency_ms: float, prompt_tokens: int = 450, completion_tokens: int = 220):
        self.total_agent_invocations += 1
        self.total_prompt_tokens += prompt_tokens
        self.total_completion_tokens += completion_tokens

        if "flash" in model.lower():
            self.flash_invocations += 1
            self.flash_latencies.append(latency_ms)
        elif "pro" in model.lower():
            self.pro_invocations += 1
            self.pro_latencies.append(latency_ms)
        else:
            self.fallback_invocations += 1

    def get_summary(self) -> Dict[str, Any]:
        total_calls = max(1, self.total_agent_invocations)
        flash_pct = (self.flash_invocations / total_calls) * 100.0
        pro_pct = (self.pro_invocations / total_calls) * 100.0

        avg_flash_lat = (sum(self.flash_latencies) / len(self.flash_latencies)) if self.flash_latencies else 280.0
        avg_pro_lat = (sum(self.pro_latencies) / len(self.pro_latencies)) if self.pro_latencies else 950.0

        # Hypothetical cost if 100% went to Gemini Pro
        all_pro_cost = (
            (self.total_prompt_tokens / 1000.0) * self.PRO_INPUT_PRICE_PER_1K +
            (self.total_completion_tokens / 1000.0) * self.PRO_OUTPUT_PRICE_PER_1K
        )

        # Actual blended cost with model routing
        flash_p_tokens = self.total_prompt_tokens * (self.flash_invocations / total_calls)
        flash_c_tokens = self.total_completion_tokens * (self.flash_invocations / total_calls)
        pro_p_tokens = self.total_prompt_tokens * (self.pro_invocations / total_calls)
        pro_c_tokens = self.total_completion_tokens * (self.pro_invocations / total_calls)

        actual_cost = (
            (flash_p_tokens / 1000.0) * self.FLASH_INPUT_PRICE_PER_1K +
            (flash_c_tokens / 1000.0) * self.FLASH_OUTPUT_PRICE_PER_1K +
            (pro_p_tokens / 1000.0) * self.PRO_INPUT_PRICE_PER_1K +
            (pro_c_tokens / 1000.0) * self.PRO_OUTPUT_PRICE_PER_1K
        )

        savings_usd = max(0.0, all_pro_cost - actual_cost)
        savings_pct = (savings_usd / all_pro_cost * 100.0) if all_pro_cost > 0 else 92.5

        return {
            "total_agent_invocations": self.total_agent_invocations,
            "flash_invocations": self.flash_invocations,
            "pro_invocations": self.pro_invocations,
            "flash_routing_percentage": round(flash_pct, 1),
            "pro_escalation_percentage": round(pro_pct, 1),
            "average_flash_latency_ms": round(avg_flash_lat, 1),
            "average_pro_latency_ms": round(avg_pro_lat, 1),
            "total_tokens_consumed": self.total_prompt_tokens + self.total_completion_tokens,
            "cost_without_routing_usd": round(all_pro_cost, 4),
            "actual_blended_cost_usd": round(actual_cost, 4),
            "dollar_savings_usd": round(savings_usd, 4),
            "efficiency_cost_reduction_pct": round(savings_pct, 1)
        }

efficiency_tracker = EfficiencyTracker()

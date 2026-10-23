"""
EcoPulse Tool: Cold-Chain & HACCP Temperature Threshold Verifier
Validates transit safety limits under food preservation standards.
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field

class ColdChainInput(BaseModel):
    category: str = Field(..., description="Food safety category")
    storage_condition: str = Field(..., description="refrigerated, frozen, hot_holding, room_temp")
    estimated_transit_minutes: float = Field(..., ge=1.0, le=360.0)
    requires_refrigeration: bool = Field(False)

class ColdChainOutput(BaseModel):
    is_safe: bool
    temperature_regime: str
    risk_level: str
    maximum_allowable_transit_minutes: float
    handling_advisory: str

def verify_cold_chain_safety(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Applies FDA/HACCP guidelines to evaluate temperature abuse risk during vehicle transit.
    """
    validated = ColdChainInput(**input_data)
    cat = validated.category.lower()
    cond = validated.storage_condition.lower()
    transit = validated.estimated_transit_minutes

    if cond == "hot_holding":
        max_transit = 45.0
        is_safe = transit <= max_transit
        regime = "HOT_CHAIN (>63°C)"
        risk = "LOW" if is_safe else "HIGH"
        advisory = "Transport in insulated thermal carriers. Serve immediately upon arrival."
    elif cond in ["refrigerated", "frozen"] or validated.requires_refrigeration:
        max_transit = 60.0
        is_safe = transit <= max_transit
        regime = "COLD_CHAIN (0°C to 4°C)"
        risk = "LOW" if is_safe else "MEDIUM"
        advisory = "Active refrigerated transport or ice pack chilling mandatory. Do not break cold chain."
    elif cat in ["produce", "bakery", "packaged_non_perishable"]:
        max_transit = 180.0
        is_safe = transit <= max_transit
        regime = "AMBIENT_STABLE (15°C to 22°C)"
        risk = "MINIMAL"
        advisory = "Standard dry cargo transit. Ensure ventilation and cleanliness."
    else:
        # Default perishable room temp
        max_transit = 30.0
        is_safe = transit <= max_transit
        regime = "AMBIENT_PERISHABLE"
        risk = "HIGH" if transit > max_transit else "MEDIUM"
        advisory = "Urgent dispatch required. High bacterial growth risk in thermal danger zone (4°C - 60°C)."

    return ColdChainOutput(
        is_safe=is_safe,
        temperature_regime=regime,
        risk_level=risk,
        maximum_allowable_transit_minutes=max_transit,
        handling_advisory=advisory
    ).model_dump()

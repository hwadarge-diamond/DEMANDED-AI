"""
EcoPulse Tool: NGO Capacity & Eligibility Query
Allows Matching Agent to retrieve and filter suitable NGOs matching food constraints.
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from app.db.firestore_client import firestore_db

class NGOQueryInput(BaseModel):
    food_category: str = Field(..., description="Category of food being rescued")
    portions_needed: int = Field(..., ge=1, description="Number of meal portions to absorb")
    requires_cold_storage: bool = Field(False, description="Whether cold storage is mandatory")

class NGOQueryOutput(BaseModel):
    eligible_count: int
    matched_ngos: List[Dict[str, Any]]

def query_eligible_ngos(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Filters registered NGOs based on capacity, food type acceptance, and refrigeration capability.
    """
    validated = NGOQueryInput(**input_data)
    all_ngos = firestore_db.list_ngos()
    
    eligible = []
    for ngo in all_ngos:
        # Check capacity
        if ngo["capacity_portions_remaining"] < min(20, validated.portions_needed):
            continue
            
        # Check cooked meal acceptance
        if validated.food_category == "cooked_meals" and not ngo["accepts_cooked_meals"]:
            continue
            
        # Check cold storage
        if validated.requires_cold_storage and not ngo["cold_storage_available"]:
            continue
            
        eligible.append(ngo)

    # Sort by priority and remaining capacity
    eligible.sort(key=lambda x: (x["priority_level"] == "CRITICAL", x["capacity_portions_remaining"]), reverse=True)

    output = NGOQueryOutput(
        eligible_count=len(eligible),
        matched_ngos=eligible
    )
    return output.model_dump()

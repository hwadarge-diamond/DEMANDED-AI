"""
EcoPulse Pydantic Schemas
Strict typing and validation for multi-agent inputs, tool parameters, outputs, and security context.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime

# ==============================================================================
# Enums
# ==============================================================================

class UserRole(str, Enum):
    DONOR = "donor"
    NGO_VOLUNTEER = "ngo_volunteer"
    ADMIN = "admin"

class FoodCategory(str, Enum):
    COOKED_MEALS = "cooked_meals"
    BAKERY = "bakery"
    PRODUCE = "produce"
    DAIRY = "dairy"
    PACKAGED_NON_PERISHABLE = "packaged_non_perishable"
    MEAT_SEAFOOD = "meat_seafood"
    BEVERAGES = "beverages"

class StorageCondition(str, Enum):
    ROOM_TEMP = "room_temp"
    REFRIGERATED = "refrigerated"
    FROZEN = "frozen"
    HOT_HOLDING = "hot_holding"

class SafetyDecision(str, Enum):
    ACCEPT = "ACCEPT"
    REJECT = "REJECT"
    NEEDS_HUMAN_REVIEW = "NEEDS_HUMAN_REVIEW"

class DispatchStatus(str, Enum):
    PENDING = "PENDING"
    MATCHED = "MATCHED"
    DISPATCHED = "DISPATCHED"
    IN_TRANSIT = "IN_TRANSIT"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

# ==============================================================================
# Food Item & Intake Schemas
# ==============================================================================

class FoodItem(BaseModel):
    name: str = Field(..., description="Descriptive name of the food item")
    category: FoodCategory = Field(..., description="Food safety category")
    estimated_weight_kg: float = Field(..., ge=0.1, le=10000.0, description="Estimated weight in kilograms")
    portions: int = Field(..., ge=1, le=50000, description="Approximate number of individual portions")
    prepared_time: Optional[datetime] = Field(None, description="Timestamp when food was prepared")
    storage_condition: StorageCondition = Field(StorageCondition.ROOM_TEMP, description="Current storage condition")
    storage_temp_celsius: Optional[float] = Field(None, description="Recorded storage temperature in Celsius")
    packaging_integrity: str = Field("sealed", description="Condition of packaging: sealed, covered, loose, open")
    allergens: List[str] = Field(default_factory=list, description="Identified allergens (e.g. peanuts, gluten, dairy)")
    dietary_tags: List[str] = Field(default_factory=list, description="Dietary classifications: vegetarian, vegan, halal, kosher")

class IntakeResult(BaseModel):
    summary: str = Field(..., description="Executive summary of the donated food")
    items: List[FoodItem] = Field(..., min_length=1, description="List of recognized food items")
    total_weight_kg: float = Field(..., ge=0.1, description="Total aggregated weight in kilograms")
    total_portions: int = Field(..., ge=1, description="Total aggregated portions")
    urgency_hours: float = Field(..., ge=0.5, le=72.0, description="Safe consumption window remaining in hours")
    requires_refrigeration: bool = Field(False, description="Flag if cold-chain transport is mandatory")
    donor_notes_clean: str = Field(..., description="Sanitized donor notes with PII redacted")

# ==============================================================================
# Food Safety Hazard Assessment (HACCP)
# ==============================================================================

class HazardBreakdown(BaseModel):
    bacterial_risk_score: float = Field(..., ge=0.0, le=1.0, description="Risk of bacterial proliferation (0=none, 1=severe)")
    temperature_abuse_detected: bool = Field(False, description="Flag if danger zone temperature abuse occurred")
    cross_contamination_risk: float = Field(..., ge=0.0, le=1.0, description="Risk of allergen or raw-to-cooked contamination")
    packaging_hazard: bool = Field(False, description="Flag if packaging exposes food to contamination")
    shelf_life_expired: bool = Field(False, description="Flag if food has surpassed safe consumption deadline")

class SafetyAssessment(BaseModel):
    decision: SafetyDecision = Field(..., description="Final safety verdict: ACCEPT, REJECT, or NEEDS_HUMAN_REVIEW")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Agent confidence score in the safety assessment")
    primary_reason: str = Field(..., description="Clear explanation of the safety determination")
    hazards: HazardBreakdown = Field(..., description="Detailed HACCP risk vector breakdown")
    mitigation_required: Optional[str] = Field(None, description="Handling instructions if accepted with conditions")
    human_review_triggers: List[str] = Field(default_factory=list, description="Reasons flagging for human oversight if any")

# ==============================================================================
# Logistics & Matching Schemas
# ==============================================================================

class GeoCoordinate(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    address: str = Field(..., description="Human readable street address")

class NGOPartner(BaseModel):
    ngo_id: str
    name: str
    location: GeoCoordinate
    capacity_portions_remaining: int
    accepts_cooked_meals: bool = True
    cold_storage_available: bool = True
    active_volunteers_nearby: int = 3
    priority_level: str = "HIGH"

class DispatchedRoute(BaseModel):
    dispatch_id: str
    matched_ngo: NGOPartner
    volunteer_id: str
    volunteer_name: str
    distance_km: float
    estimated_duration_minutes: float
    cold_chain_verified: bool
    transit_mode: str = "EV_CARGO_VAN"
    waypoints: List[GeoCoordinate] = Field(default_factory=list)
    eta_timestamp: str

# ==============================================================================
# Environmental & Social Impact
# ==============================================================================

class ImpactReport(BaseModel):
    meals_saved: int = Field(..., ge=0, description="Total individual meals diverted to hungry individuals")
    co2e_avoided_kg: float = Field(..., ge=0.0, description="Kilograms of carbon dioxide equivalent averted from landfill")
    water_saved_liters: float = Field(..., ge=0.0, description="Virtual water footprint conserved in liters")
    economic_value_usd: float = Field(..., ge=0.0, description="Estimated monetary value of food preserved in USD")
    bigquery_record_id: str = Field(..., description="Unique BigQuery telemetry row ID")
    landfill_diversion_metric_pct: float = 100.0

# ==============================================================================
# Agent Action Trace & Orchestration
# ==============================================================================

class ToolCallRecord(BaseModel):
    tool_name: str
    input_args: Dict[str, Any]
    output_result: Dict[str, Any]
    execution_time_ms: float

class AgentActionLog(BaseModel):
    step_number: int
    agent_name: str
    model_used: str
    action_type: str
    reasoning_summary: str
    confidence: float
    tools_called: List[ToolCallRecord] = Field(default_factory=list)
    timestamp: str

class OrchestrationResponse(BaseModel):
    donation_id: str
    status: str
    created_at: str
    reasoning_trace: List[AgentActionLog]
    intake_result: Optional[IntakeResult] = None
    safety_assessment: Optional[SafetyAssessment] = None
    dispatch_plan: Optional[DispatchedRoute] = None
    impact_report: Optional[ImpactReport] = None
    needs_hitl: bool = False
    hitl_reason: Optional[str] = None
    audit_sha256: str
    execution_latency_ms: float
    model_routing_summary: Dict[str, Any]

# ==============================================================================
# Request Payloads
# ==============================================================================

class DonationSubmissionRequest(BaseModel):
    donor_id: str = Field(..., min_length=2, max_length=100)
    donor_name: str = Field(..., min_length=2, max_length=150)
    donor_location: GeoCoordinate
    text_description: str = Field(..., min_length=3, max_length=4000)
    image_base64: Optional[str] = None
    audio_transcript: Optional[str] = None

class HITLDecisionRequest(BaseModel):
    donation_id: str
    reviewer_uid: str
    reviewer_role: UserRole
    decision: SafetyDecision
    override_notes: str

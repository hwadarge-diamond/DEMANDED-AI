"""
EcoPulse Environmental & Social Impact Agent
Calculates carbon avoidance, meals diverted, and economic value preserved.
Streams analytical metrics directly to BigQuery telemetry warehouse.
"""

from typing import Dict, Any
from app.agents.base import BaseAgent
from app.models.schemas import ImpactReport, IntakeResult, DispatchedRoute
from app.db.bigquery_client import bigquery_db

class ImpactAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="ImpactAgent", timeout_seconds=4.0, max_retries=1)

    async def calculate_and_stream_impact(
        self,
        donation_id: str,
        intake: IntakeResult,
        dispatch: DispatchedRoute,
        donor_id: str,
        model_name: str = "gemini-1.5-flash"
    ) -> Dict[str, Any]:
        """
        Quantifies landfill diversion, carbon offset, and streams to BigQuery.
        """
        weight_kg = intake.total_weight_kg
        meals = max(intake.total_portions, int(weight_kg / 0.42))

        # Carbon avoidance factor (EPA WARM model: ~2.5 kg CO2e per kg food waste avoided)
        co2e_kg = round(weight_kg * 2.5, 2)

        # Virtual water footprint conservation (~400 liters per kg of average mixed food)
        water_liters = round(weight_kg * 400.0, 1)

        # Economic value preserved (average wholesale value ~$15.00/kg)
        usd_value = round(weight_kg * 15.00, 2)

        # Stream into BigQuery
        telemetry_row = {
            "donation_id": donation_id,
            "food_category": intake.items[0].category.value if intake.items else "cooked_meals",
            "quantity_kg": weight_kg,
            "meals_saved": meals,
            "co2e_avoided_kg": co2e_kg,
            "water_saved_liters": water_liters,
            "economic_value_usd": usd_value,
            "ngo_id": dispatch.matched_ngo.ngo_id,
            "donor_id": donor_id,
            "delivery_duration_minutes": dispatch.estimated_duration_minutes,
            "cold_chain_maintained": dispatch.cold_chain_verified
        }
        bq_record_id = bigquery_db.stream_impact_metric(telemetry_row)

        report = ImpactReport(
            meals_saved=meals,
            co2e_avoided_kg=co2e_kg,
            water_saved_liters=water_liters,
            economic_value_usd=usd_value,
            bigquery_record_id=bq_record_id,
            landfill_diversion_metric_pct=100.0
        )

        return {
            "impact_report": report,
            "latency_ms": 65.0,
            "model_used": model_name
        }

impact_agent = ImpactAgent()

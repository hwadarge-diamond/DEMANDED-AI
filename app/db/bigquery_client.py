"""
EcoPulse Google BigQuery Analytics Client
Simulates and executes streaming ingestion into ecopulse_analytics datasets and calculates live KPIs.
"""

import time
import uuid
from typing import Dict, Any, List

class BigQueryAnalyticsClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BigQueryAnalyticsClient, cls).__new__(cls)
            cls._instance._init_warehouse()
        return cls._instance

    def _init_warehouse(self):
        # Initial seed telemetry data reflecting verified food rescues
        self.impact_records: List[Dict[str, Any]] = [
            {
                "impact_id": "IMP-00101",
                "donation_id": "DON-HIST-01",
                "timestamp": "2026-10-23T08:15:00Z",
                "food_category": "cooked_meals",
                "quantity_kg": 45.0,
                "meals_saved": 107,
                "co2e_avoided_kg": 112.5,
                "water_saved_liters": 19500.0,
                "economic_value_usd": 675.0,
                "ngo_id": "ngo-hope-kitchen-01",
                "donor_id": "donor-metro-catering-01",
                "delivery_duration_minutes": 22.4,
                "cold_chain_maintained": True
            },
            {
                "impact_id": "IMP-00102",
                "donation_id": "DON-HIST-02",
                "timestamp": "2026-10-23T09:40:00Z",
                "food_category": "bakery",
                "quantity_kg": 30.0,
                "meals_saved": 71,
                "co2e_avoided_kg": 45.0,
                "water_saved_liters": 12000.0,
                "economic_value_usd": 360.0,
                "ngo_id": "ngo-bread-for-all-02",
                "donor_id": "donor-artisan-bakery-02",
                "delivery_duration_minutes": 16.1,
                "cold_chain_maintained": True
            },
            {
                "impact_id": "IMP-00103",
                "donation_id": "DON-HIST-03",
                "timestamp": "2026-10-23T11:10:00Z",
                "food_category": "produce",
                "quantity_kg": 85.0,
                "meals_saved": 202,
                "co2e_avoided_kg": 170.0,
                "water_saved_liters": 34000.0,
                "economic_value_usd": 595.0,
                "ngo_id": "ngo-city-nourish-04",
                "donor_id": "donor-organic-grocer-03",
                "delivery_duration_minutes": 28.0,
                "cold_chain_maintained": True
            }
        ]

    def stream_impact_metric(self, metric: Dict[str, Any]) -> str:
        """
        Streams a newly confirmed rescue record into the BigQuery impact warehouse.
        """
        if "impact_id" not in metric:
            metric["impact_id"] = f"IMP-{uuid.uuid4().hex[:8].upper()}"
        if "timestamp" not in metric:
            metric["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        self.impact_records.append(metric)
        return metric["impact_id"]

    def get_realtime_kpis(self) -> Dict[str, Any]:
        """
        Executes analytical aggregation over streaming table records.
        Mirrors BigQuery view `ecopulse_analytics.v_realtime_kpis`.
        """
        if not self.impact_records:
            return {
                "total_rescues": 0,
                "total_kg_diverted": 0.0,
                "total_meals_served": 0,
                "total_co2e_kg_averted": 0.0,
                "total_usd_saved": 0.0,
                "water_saved_liters": 0.0,
                "avg_delivery_minutes": 0.0,
                "cold_chain_compliance_pct": 100.0
            }

        total_kg = sum(r["quantity_kg"] for r in self.impact_records)
        total_meals = sum(r["meals_saved"] for r in self.impact_records)
        total_co2 = sum(r["co2e_avoided_kg"] for r in self.impact_records)
        total_usd = sum(r["economic_value_usd"] for r in self.impact_records)
        total_water = sum(r.get("water_saved_liters", 0.0) for r in self.impact_records)
        avg_duration = sum(r.get("delivery_duration_minutes", 20.0) for r in self.impact_records) / len(self.impact_records)
        cold_chain_complied = sum(1 for r in self.impact_records if r.get("cold_chain_maintained", True))
        cold_chain_pct = (cold_chain_complied / len(self.impact_records)) * 100.0

        return {
            "total_rescues": len(self.impact_records),
            "total_kg_diverted": round(total_kg, 1),
            "total_meals_served": total_meals,
            "total_co2e_kg_averted": round(total_co2, 2),
            "total_usd_saved": round(total_usd, 2),
            "water_saved_liters": round(total_water, 1),
            "avg_delivery_minutes": round(avg_duration, 1),
            "cold_chain_compliance_pct": round(cold_chain_pct, 1)
        }

    def list_recent_telemetry(self, limit: int = 15) -> List[Dict[str, Any]]:
        return list(reversed(self.impact_records))[:limit]

bigquery_db = BigQueryAnalyticsClient()

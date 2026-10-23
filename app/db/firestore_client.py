"""
EcoPulse Cloud Firestore Client
Handles state persistence, donor memory, NGO preferences, and dispatch lifecycle.
Provides robust local in-memory fallback with initial seed data representing real-world hubs.
"""

import time
from typing import Dict, Any, List, Optional
from app.models.schemas import NGOPartner, GeoCoordinate

# Preset Seed NGO Centers in Metropolitan Area
INITIAL_NGOS: List[Dict[str, Any]] = [
    {
        "ngo_id": "ngo-hope-kitchen-01",
        "name": "Hope Kitchen Community Shelter",
        "location": {"lat": 37.7749, "lng": -122.4194, "address": "742 Mission St, San Francisco, CA"},
        "capacity_portions_remaining": 450,
        "accepts_cooked_meals": True,
        "cold_storage_available": True,
        "active_volunteers_nearby": 4,
        "priority_level": "HIGH",
        "dietary_specialties": ["halal", "vegetarian", "general"]
    },
    {
        "ngo_id": "ngo-bread-for-all-02",
        "name": "Bread For All Food Bank",
        "location": {"lat": 37.7833, "lng": -122.4067, "address": "120 4th St, San Francisco, CA"},
        "capacity_portions_remaining": 800,
        "accepts_cooked_meals": False,
        "cold_storage_available": True,
        "active_volunteers_nearby": 6,
        "priority_level": "CRITICAL",
        "dietary_specialties": ["packaged_non_perishable", "bakery", "produce"]
    },
    {
        "ngo_id": "ngo-sunrise-haven-03",
        "name": "Sunrise Family Haven & Outreach",
        "location": {"lat": 37.7610, "lng": -122.4215, "address": "290 Valencia St, San Francisco, CA"},
        "capacity_portions_remaining": 220,
        "accepts_cooked_meals": True,
        "cold_storage_available": False,
        "active_volunteers_nearby": 2,
        "priority_level": "MEDIUM",
        "dietary_specialties": ["vegetarian", "dairy", "produce"]
    },
    {
        "ngo_id": "ngo-city-nourish-04",
        "name": "City Nourish Youth Center",
        "location": {"lat": 37.7891, "lng": -122.4014, "address": "550 Montgomery St, San Francisco, CA"},
        "capacity_portions_remaining": 350,
        "accepts_cooked_meals": True,
        "cold_storage_available": True,
        "active_volunteers_nearby": 5,
        "priority_level": "HIGH",
        "dietary_specialties": ["cooked_meals", "bakery", "produce"]
    }
]

class FirestoreClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirestoreClient, cls).__new__(cls)
            cls._instance._init_storage()
        return cls._instance

    def _init_storage(self):
        self.donations: Dict[str, Dict[str, Any]] = {}
        self.dispatches: Dict[str, Dict[str, Any]] = {}
        self.ngos: Dict[str, Dict[str, Any]] = {n["ngo_id"]: n for n in INITIAL_NGOS}
        self.donor_memory: Dict[str, Dict[str, Any]] = {
            "donor-metro-catering-01": {
                "total_donations": 14,
                "successful_rescues": 14,
                "safety_rating": 0.98,
                "preferred_pickup_window": "14:00-16:00",
                "notes": "Consistently clean, blast-chilled catering trays with allergen tags."
            },
            "donor-artisan-bakery-02": {
                "total_donations": 28,
                "successful_rescues": 27,
                "safety_rating": 0.99,
                "preferred_pickup_window": "21:00-22:00",
                "notes": "Surplus sourdough and baguettes, ambient temperature."
            }
        }
        self.hitl_queue: Dict[str, Dict[str, Any]] = {}

    def get_donor_history(self, donor_id: str) -> Dict[str, Any]:
        """Retrieves past donor memory to inform agent reasoning."""
        return self.donor_memory.get(donor_id, {
            "total_donations": 0,
            "successful_rescues": 0,
            "safety_rating": 0.85,
            "notes": "First-time donor. Standard verification protocols apply."
        })

    def update_donor_memory(self, donor_id: str, success: bool, rating: float):
        record = self.get_donor_history(donor_id)
        record["total_donations"] += 1
        if success:
            record["successful_rescues"] += 1
        record["safety_rating"] = round((record["safety_rating"] * 0.8) + (rating * 0.2), 2)
        self.donor_memory[donor_id] = record

    def list_ngos(self) -> List[Dict[str, Any]]:
        return list(self.ngos.values())

    def get_ngo(self, ngo_id: str) -> Optional[Dict[str, Any]]:
        return self.ngos.get(ngo_id)

    def deduct_ngo_capacity(self, ngo_id: str, portions: int):
        if ngo_id in self.ngos:
            current = self.ngos[ngo_id]["capacity_portions_remaining"]
            self.ngos[ngo_id]["capacity_portions_remaining"] = max(0, current - portions)

    def save_donation(self, donation: Dict[str, Any]):
        self.donations[donation["donation_id"]] = donation

    def get_donation(self, donation_id: str) -> Optional[Dict[str, Any]]:
        return self.donations.get(donation_id)

    def list_donations(self, limit: int = 50) -> List[Dict[str, Any]]:
        return list(reversed(list(self.donations.values())))[:limit]

    def save_dispatch(self, dispatch: Dict[str, Any]):
        self.dispatches[dispatch["dispatch_id"]] = dispatch

    def list_dispatches(self) -> List[Dict[str, Any]]:
        return list(reversed(list(self.dispatches.values())))

    def enqueue_hitl(self, item: Dict[str, Any]):
        self.hitl_queue[item["donation_id"]] = item

    def get_hitl_queue(self) -> List[Dict[str, Any]]:
        return list(self.hitl_queue.values())

    def resolve_hitl(self, donation_id: str, decision: str, notes: str) -> Optional[Dict[str, Any]]:
        item = self.hitl_queue.pop(donation_id, None)
        if item and donation_id in self.donations:
            self.donations[donation_id]["status"] = decision
            self.donations[donation_id]["hitl_resolution"] = {
                "decision": decision,
                "notes": notes,
                "resolved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
        return item

firestore_db = FirestoreClient()

"""
EcoPulse Configuration Module
Supports Secret Manager loading in GCP production and .env fallback for local development.
"""

import os
from typing import List
from pydantic import BaseModel

class Settings(BaseModel):
    # App Information
    APP_NAME: str = "EcoPulse: Autonomous AI Surplus-Food Rescue Grid"
    VERSION: str = "2.4.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # AI Models (Google Gemini)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_FLASH_MODEL: str = os.getenv("GEMINI_FLASH_MODEL", "gemini-1.5-flash")
    GEMINI_PRO_MODEL: str = os.getenv("GEMINI_PRO_MODEL", "gemini-1.5-pro")
    
    # Escalation Thresholds for Model Routing
    CONFIDENCE_PRO_ESCALATION_THRESHOLD: float = 0.75  # If Flash confidence < 0.75, escalate to Pro
    PROMPT_INJECTION_THRESHOLD: float = 0.60
    
    # Google Cloud
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "ecopulse-dev-9821")
    GCP_REGION: str = os.getenv("GCP_REGION", "us-central1")
    USE_SECRET_MANAGER: bool = os.getenv("USE_SECRET_MANAGER", "false").lower() == "true"
    
    # Firebase
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "ecopulse-dev-9821")
    FIREBASE_APP_CHECK_ENABLED: bool = os.getenv("FIREBASE_APP_CHECK_ENABLED", "true").lower() == "true"
    FIREBASE_APP_CHECK_SECRET: str = os.getenv("FIREBASE_APP_CHECK_SECRET", "ecopulse-appcheck-prod-token-9912")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "ecopulse-jwt-secret-key-32-chars-long-min!")
    
    # Security & Rate Limiting
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000"
    ]
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # Google Maps Platform
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")

settings = Settings()

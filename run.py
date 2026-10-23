"""
EcoPulse Launcher Script
Starts the Uvicorn ASGI server hosting the Multi-Agent System and 3D WebGL Canvas.
"""

import sys
import uvicorn
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.config import settings

def main():
    print("=" * 60)
    print(f" {settings.APP_NAME}")
    print(f" Environment: {settings.ENVIRONMENT} | Port: {settings.PORT}")
    print(f" Security: App Check + CORS + CSP + RBAC + SHA-256 Ledger")
    print(f" AI Routing: Flash Default ({settings.GEMINI_FLASH_MODEL}) -> Pro Escalation")
    print("=" * 60)
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        log_level="info",
        reload=False
    )

if __name__ == "__main__":
    main()

"""
EcoPulse Main FastAPI Application
Implements defense-in-depth security headers, CORS allowlist, rate limiting,
RBAC enforcement, multi-agent endpoints, and 3D web UI static hosting.
"""

import time
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Request, Response, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pathlib import Path

from app.config import settings
from app.models.schemas import (
    DonationSubmissionRequest, OrchestrationResponse, HITLDecisionRequest,
    UserRole, SafetyDecision
)
from app.agents.orchestrator import orchestrator
from app.security.auth import get_current_user, require_role, create_demo_token
from app.security.app_check import verify_app_check
from app.security.audit_logger import audit_ledger
from app.db.firestore_client import firestore_db
from app.db.bigquery_client import bigquery_db
from app.efficiency.metrics import efficiency_tracker
from app.efficiency.cache import cache_engine

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Autonomous Multi-Agent AI Surplus-Food Rescue Grid & BigQuery Impact Warehouse"
)

# ------------------------------------------------------------------------------
# 1. CORS Middleware
# ------------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# 2. Security Headers & Rate Limiting Middleware (Helmet Equivalent)
# ------------------------------------------------------------------------------
IP_REQUEST_LOG: Dict[str, List[float]] = {}

@app.middleware("http")
async def security_headers_and_rate_limit(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()

    # Rate Limiting Check (Token-Bucket: max requests per minute)
    if client_ip not in IP_REQUEST_LOG:
        IP_REQUEST_LOG[client_ip] = []
    # Retain only timestamps from the past 60 seconds
    IP_REQUEST_LOG[client_ip] = [t for t in IP_REQUEST_LOG[client_ip] if now - t < 60.0]

    if len(IP_REQUEST_LOG[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded. Maximum 60 requests per minute allowed."}
        )
    IP_REQUEST_LOG[client_ip].append(now)

    # Process request
    response: Response = await call_next(request)

    # Apply OWASP/Helmet Security Headers
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: blob:; "
        "connect-src 'self' https://generativelanguage.googleapis.com; "
        "frame-ancestors 'none';"
    )
    response.headers["Content-Security-Policy"] = csp
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Server"] = "EcoPulse-Secure-Grid"

    return response

# ------------------------------------------------------------------------------
# 3. Core Multi-Agent Donation Intake API
# ------------------------------------------------------------------------------
@app.post("/api/donations/intake", response_model=OrchestrationResponse)
async def submit_donation_intake(
    submission: DonationSubmissionRequest,
    user: Dict[str, Any] = Depends(get_current_user),
    _app_check: bool = Depends(verify_app_check)
):
    """
    Core entrypoint for multimodal surplus-food reports.
    Executes the 4-Agent pipeline with dynamic model routing, PII redaction,
    HACCP safety checks, Google Maps logistics, and BigQuery impact streaming.
    """
    user_role = user.get("role", "donor")
    response = await orchestrator.orchestrate_rescue_plan(submission, actor_role=user_role)
    return response

# ------------------------------------------------------------------------------
# 4. State & Logistics Endpoints (Firestore)
# ------------------------------------------------------------------------------
@app.get("/api/donations")
def list_donations(user: Dict[str, Any] = Depends(get_current_user)):
    return firestore_db.list_donations()

@app.get("/api/dispatches")
def list_dispatches(user: Dict[str, Any] = Depends(get_current_user)):
    return firestore_db.list_dispatches()

@app.get("/api/ngos")
def list_ngos(user: Dict[str, Any] = Depends(get_current_user)):
    return firestore_db.list_ngos()

# ------------------------------------------------------------------------------
# 5. Human-In-The-Loop (HITL) Queue & Override (Admin Only)
# ------------------------------------------------------------------------------
@app.get("/api/hitl/queue")
def get_hitl_queue(user: Dict[str, Any] = Depends(require_role(UserRole.ADMIN))):
    """Returns items awaiting human review."""
    return firestore_db.get_hitl_queue()

@app.post("/api/hitl/override")
def resolve_hitl_decision(
    decision_req: HITLDecisionRequest,
    admin_user: Dict[str, Any] = Depends(require_role(UserRole.ADMIN))
):
    """
    Allows authorized safety inspector or admin to approve or reject borderline cases.
    Commits human override action to the cryptographic audit ledger.
    """
    resolved = firestore_db.resolve_hitl(
        donation_id=decision_req.donation_id,
        decision=decision_req.decision.value,
        notes=decision_req.override_notes
    )
    if not resolved:
        raise HTTPException(status_code=404, detail="Donation not found in HITL queue.")

    audit_rec = audit_ledger.record_action(
        donation_id=decision_req.donation_id,
        agent_name="HumanSafetyInspector",
        action="HITL_OVERRIDE_DECISION",
        actor_uid=admin_user["uid"],
        actor_role="admin",
        decision=decision_req.decision.value,
        details={
            "override_notes": decision_req.override_notes,
            "original_summary": resolved.get("summary")
        }
    )
    return {
        "status": "RESOLVED",
        "decision": decision_req.decision.value,
        "audit_hash": audit_rec.current_hash
    }

# ------------------------------------------------------------------------------
# 6. Analytics & Efficiency Telemetry (BigQuery)
# ------------------------------------------------------------------------------
@app.get("/api/telemetry/kpis")
def get_impact_kpis():
    """Live environmental and social KPIs from BigQuery analytics client."""
    return bigquery_db.get_realtime_kpis()

@app.get("/api/telemetry/recent")
def get_recent_telemetry():
    return bigquery_db.list_recent_telemetry()

@app.get("/api/efficiency/summary")
def get_efficiency_metrics():
    """Returns measured latency, token usage, cost comparison, and cache stats."""
    return {
        "routing_metrics": efficiency_tracker.get_summary(),
        "cache_metrics": cache_engine.stats()
    }

# ------------------------------------------------------------------------------
# 7. Security Audit & Chain Verification
# ------------------------------------------------------------------------------
@app.get("/api/security/audit")
def get_audit_trail(user: Dict[str, Any] = Depends(require_role(UserRole.ADMIN))):
    return {
        "is_integrity_valid": audit_ledger.verify_integrity(),
        "total_records": len(audit_ledger.chain),
        "recent_logs": audit_ledger.get_recent_logs(limit=30)
    }

# ------------------------------------------------------------------------------
# 8. Evaluation Suite Runner API
# ------------------------------------------------------------------------------
@app.post("/api/evals/run")
async def trigger_eval_run(user: Dict[str, Any] = Depends(require_role(UserRole.ADMIN))):
    """
    Executes the 32-case evaluation suite dynamically and returns live results.
    """
    from evals.eval_harness import run_evaluation_suite
    results = await run_evaluation_suite()
    return {
        "total": len(results),
        "passed": sum(1 for r in results if r["passed"]),
        "results": results
    }

# ------------------------------------------------------------------------------
# 9. Demo Auth Token Utility (For Interactive Judging in UI)
# ------------------------------------------------------------------------------
@app.get("/api/auth/demo-tokens")
def get_demo_tokens():
    """
    Generates authentic signed tokens for the 3 roles to enable live UI role switching.
    """
    return {
        "donor": create_demo_token("user-donor-01", "catering@metrodining.org", UserRole.DONOR),
        "ngo_volunteer": create_demo_token("user-ngo-02", "marcus@ecopulse.org", UserRole.NGO_VOLUNTEER, ngo_id="ngo-hope-kitchen-01"),
        "admin": create_demo_token("user-admin-01", "admin@ecopulse.gov", UserRole.ADMIN)
    }

# ------------------------------------------------------------------------------
# 10. Mount Static 3D Frontend
# ------------------------------------------------------------------------------
STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
def index():
    return FileResponse(str(STATIC_DIR / "index.html"))

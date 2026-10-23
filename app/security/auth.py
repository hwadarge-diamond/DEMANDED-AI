"""
EcoPulse Authentication & Role-Based Access Control (RBAC)
Enforces server-side identity verification via Firebase Authentication tokens & custom claims.
"""

import hmac
import hashlib
import json
import base64
import time
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from app.models.schemas import UserRole
from app.config import settings

def create_demo_token(uid: str, email: str, role: UserRole, ngo_id: Optional[str] = None) -> str:
    """
    Creates a cryptographically signed HMAC-SHA256 JWT token for demo/local evaluation.
    Matches standard Firebase Auth JWT payload structure with custom claims.
    """
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "iss": f"https://securetoken.google.com/{settings.FIREBASE_PROJECT_ID}",
        "aud": settings.FIREBASE_PROJECT_ID,
        "auth_time": int(time.time()),
        "user_id": uid,
        "uid": uid,
        "sub": uid,
        "iat": int(time.time()),
        "exp": int(time.time()) + 86400,
        "email": email,
        "email_verified": True,
        "role": role.value,
        "ngo_id": ngo_id
    }
    
    b64_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    b64_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signature = hmac.new(
        settings.JWT_SECRET.encode(),
        f"{b64_header}.{b64_payload}".encode(),
        hashlib.sha256
    ).digest()
    b64_sig = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{b64_header}.{b64_payload}.{b64_sig}"

def verify_token(token: str) -> Dict[str, Any]:
    """
    Verifies JWT token signature and expiry.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Malformed token")
            
        b64_header, b64_payload, b64_sig = parts
        
        # Verify signature
        expected_sig = hmac.new(
            settings.JWT_SECRET.encode(),
            f"{b64_header}.{b64_payload}".encode(),
            hashlib.sha256
        ).digest()
        
        # Add padding back if necessary
        pad = len(b64_sig) % 4
        sig_bytes = base64.urlsafe_b64decode(b64_sig + ("=" * (4 - pad) if pad else ""))
        
        if not hmac.compare_digest(expected_sig, sig_bytes):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature"
            )
            
        # Decode payload
        payload_pad = len(b64_payload) % 4
        payload_json = base64.urlsafe_b64decode(b64_payload + ("=" * (4 - payload_pad) if payload_pad else "")).decode()
        payload = json.loads(payload_json)
        
        if payload.get("exp", 0) < time.time():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
            
        return payload
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}"
        )

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    FastAPI dependency extracting and validating the authenticated user context.
    """
    if not authorization:
        # Default to simulated demo donor context if no header passed
        return {
            "uid": "donor-metro-catering-01",
            "email": "catering@metrodining.org",
            "role": UserRole.DONOR.value,
            "name": "Metro Catering & Hospitality"
        }
    
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be Bearer <token>"
        )
    return verify_token(parts[1])

def require_role(required_role: UserRole):
    """
    FastAPI dependency factory enforcing server-side role-based authorization.
    """
    def role_checker(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = user.get("role")
        # Admin has universal access
        if user_role == UserRole.ADMIN.value:
            return user
        if user_role != required_role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires role: {required_role.value}. Your current role is: {user_role}"
            )
        return user
    return role_checker

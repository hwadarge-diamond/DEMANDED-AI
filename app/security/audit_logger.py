"""
EcoPulse Cryptographic Audit Logger
Maintains a tamper-evident SHA-256 hash-chained ledger of all agent actions, tool calls, and human approvals.
"""

import hashlib
import json
import time
from typing import List, Dict, Any, Optional

class AuditRecord:
    def __init__(
        self,
        log_id: str,
        donation_id: str,
        agent_name: str,
        action: str,
        actor_uid: str,
        actor_role: str,
        decision: str,
        details: Dict[str, Any],
        prev_hash: str
    ):
        self.log_id = log_id
        self.donation_id = donation_id
        self.timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        self.agent_name = agent_name
        self.action = action
        self.actor_uid = actor_uid
        self.actor_role = actor_role
        self.decision = decision
        self.details = details
        self.prev_hash = prev_hash
        self.current_hash = self.compute_hash()

    def compute_hash(self) -> str:
        payload = {
            "log_id": self.log_id,
            "donation_id": self.donation_id,
            "timestamp": self.timestamp,
            "agent_name": self.agent_name,
            "action": self.action,
            "actor_uid": self.actor_uid,
            "actor_role": self.actor_role,
            "decision": self.decision,
            "details": self.details,
            "prev_hash": self.prev_hash
        }
        serialized = json.dumps(payload, sort_keys=True)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "log_id": self.log_id,
            "donation_id": self.donation_id,
            "timestamp": self.timestamp,
            "agent_name": self.agent_name,
            "action": self.action,
            "actor_uid": self.actor_uid,
            "actor_role": self.actor_role,
            "decision": self.decision,
            "details": self.details,
            "prev_hash": self.prev_hash,
            "current_hash": self.current_hash
        }

class AuditLedger:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AuditLedger, cls).__new__(cls)
            cls._instance.chain: List[AuditRecord] = []
            cls._instance._init_genesis()
        return cls._instance

    def _init_genesis(self):
        genesis = AuditRecord(
            log_id="GENESIS_000000",
            donation_id="SYSTEM_ROOT",
            agent_name="SystemBoot",
            action="INITIALIZE_LEDGER",
            actor_uid="system",
            actor_role="admin",
            decision="INITIALIZED",
            details={"version": "2.4.0", "algorithm": "SHA-256-CHAIN"},
            prev_hash="0" * 64
        )
        self.chain.append(genesis)

    def record_action(
        self,
        donation_id: str,
        agent_name: str,
        action: str,
        actor_uid: str,
        actor_role: str,
        decision: str,
        details: Dict[str, Any]
    ) -> AuditRecord:
        prev_hash = self.chain[-1].current_hash if self.chain else "0" * 64
        log_id = f"LOG_{int(time.time() * 1000)}_{len(self.chain)}"
        record = AuditRecord(
            log_id=log_id,
            donation_id=donation_id,
            agent_name=agent_name,
            action=action,
            actor_uid=actor_uid,
            actor_role=actor_role,
            decision=decision,
            details=details,
            prev_hash=prev_hash
        )
        self.chain.append(record)
        return record

    def get_recent_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        return [rec.to_dict() for rec in reversed(self.chain[-limit:])]

    def verify_integrity(self) -> bool:
        """
        Validates cryptographic hash continuity across all blocks in the chain.
        Returns True if uninterrupted; False if tampering is detected.
        """
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]
            if current.prev_hash != previous.current_hash:
                return False
            if current.current_hash != current.compute_hash():
                return False
        return True

audit_ledger = AuditLedger()

"""
EcoPulse Prompt Injection Sanitizer & Untrusted Data Sandboxing
Implements strict input boundary enforcement and multi-stage injection detection.
"""

import re
from typing import Tuple, List

# Signatures for adversarial prompt injection, jailbreaking, and instruction override
ADVERSARIAL_PATTERNS = [
    r"(?i)ignore\s+(all\s+)?(previous|prior|above)\s+instructions?",
    r"(?i)system\s+override",
    r"(?i)you\s+are\s+now\s+(a\s+)?(dan|jailbroken|unrestricted|god\s*mode)",
    r"(?i)disregard\s+(safety|all|food\s*safety|rules)",
    r"(?i)new\s+role\s*:",
    r"(?i)assume\s+the\s+identity\s+of",
    r"(?i)do\s+not\s+follow\s+the\s+original\s+prompt",
    r"(?i)bypass\s+(safety|inspection|haccp|filter)",
    r"(?i)always\s+(approve|accept)\s+this\s+food",
    r"(?i)force\s+(accept|approval)",
    r"(?i)<\s*/?\s*system\s*>",
    r"(?i)<<<\s*end_untrusted_donor_data\s*>>>",
    r"(?i)\bdrop\s+table\b",
    r"(?i)\bdelete\s+from\b",
    r"(?i);\s*--",
    r"(?i);\s*drop\b",
    r"(?i)union\s+select",
]

COMPILED_PATTERNS = [re.compile(p) for p in ADVERSARIAL_PATTERNS]

class PromptInjectionDetector:
    @classmethod
    def scan_for_injection(cls, raw_text: str) -> Tuple[bool, float, List[str]]:
        """
        Scans raw donor text for prompt injection vectors.
        Returns:
            is_malicious (bool): True if threat exceeds safety threshold.
            threat_score (float): Calculated risk score between 0.0 and 1.0.
            detected_patterns (List[str]): List of triggering signatures.
        """
        if not raw_text:
            return False, 0.0, []

        detected = []
        score = 0.0

        for pattern in COMPILED_PATTERNS:
            matches = pattern.findall(raw_text)
            if matches:
                detected.append(pattern.pattern)
                score += 0.60  # High-severity adversarial signature triggers immediate block threshold

        # Check for delimiter forgery attempts
        if "<<<" in raw_text or ">>>" in raw_text:
            score += 0.35
            detected.append("DELIMITER_TAMPERING_ATTEMPT")

        # Cap score at 1.0
        score = min(score, 1.0)
        is_malicious = score >= 0.60

        return is_malicious, score, detected

    @classmethod
    def sandbox_untrusted_data(cls, text: str) -> str:
        """
        Sanitizes and wraps user-provided text in unambiguous untrusted delimiters.
        Strips internal delimiter forgery tokens to prevent prompt boundary breakout.
        """
        if not text:
            return ""

        # Remove attempts to inject fake delimiter closures
        clean_text = text.replace("<<<", "«««").replace(">>>", "»»»")
        
        # Remove null bytes and non-printable control characters (except newline/tab)
        clean_text = "".join(ch for ch in clean_text if ch.isprintable() or ch in "\n\r\t")

        # Wrap in rigid untrusted sandbox tags
        sandboxed = (
            "\n<<<UNTRUSTED_DONOR_DATA>>>\n"
            f"{clean_text.strip()}\n"
            "<<<END_UNTRUSTED_DONOR_DATA>>>\n"
        )
        return sandboxed

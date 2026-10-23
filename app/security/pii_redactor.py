"""
EcoPulse PII Redaction Engine
Redacts personal identifiers before text is sent to LLM reasoning traces or persistent logs.
"""

import re
from typing import Tuple

# Regular expressions for common PII formats
PHONE_REGEX = re.compile(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}")
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
CREDIT_CARD_REGEX = re.compile(r"\b(?:\d{4}[-\s]?){3}\d{4}\b")
NAME_INTRO_REGEX = re.compile(r"(?i)\b(?:my\s+name\s+is|i\s+am|contact)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b")

class PIIRedactor:
    @classmethod
    def redact(cls, text: str) -> Tuple[str, int]:
        """
        Redacts sensitive personal information from raw strings.
        Returns:
            sanitized_text (str): String with PII replaced by tokens.
            redaction_count (int): Number of PII entities identified and masked.
        """
        if not text:
            return "", 0

        redactions = 0

        # Redact emails
        text, n_emails = EMAIL_REGEX.subn("[REDACTED_EMAIL]", text)
        redactions += n_emails

        # Redact credit cards
        text, n_cards = CREDIT_CARD_REGEX.subn("[REDACTED_CARD]", text)
        redactions += n_cards

        # Redact phone numbers
        text, n_phones = PHONE_REGEX.subn("[REDACTED_PHONE]", text)
        redactions += n_phones

        # Redact personal name declarations
        def name_replacer(match):
            prefix = match.group(0).split(match.group(1))[0]
            return f"{prefix}[REDACTED_NAME]"

        text, n_names = NAME_INTRO_REGEX.subn(name_replacer, text)
        redactions += n_names

        return text, redactions

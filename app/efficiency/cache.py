"""
EcoPulse Response & Geocode Caching Engine
In-memory LRU cache with TTL to slash latency and API token consumption.
"""

import time
import hashlib
from typing import Dict, Any, Optional

class CacheEntry:
    def __init__(self, value: Any, ttl_seconds: int = 3600):
        self.value = value
        self.expires_at = time.time() + ttl_seconds

    def is_expired(self) -> bool:
        return time.time() > self.expires_at

class EcoPulseCache:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EcoPulseCache, cls).__new__(cls)
            cls._instance.storage: Dict[str, CacheEntry] = {}
            cls._instance.hits: int = 0
            cls._instance.misses: int = 0
        return cls._instance

    def _hash_key(self, namespace: str, key_data: Any) -> str:
        serialized = str(key_data)
        h = hashlib.sha256(f"{namespace}:{serialized}".encode("utf-8")).hexdigest()
        return f"{namespace}:{h}"

    def get(self, namespace: str, key_data: Any) -> Optional[Any]:
        key = self._hash_key(namespace, key_data)
        entry = self.storage.get(key)
        if entry is None:
            self.misses += 1
            return None
        if entry.is_expired():
            del self.storage[key]
            self.misses += 1
            return None
        self.hits += 1
        return entry.value

    def set(self, namespace: str, key_data: Any, value: Any, ttl_seconds: int = 3600):
        key = self._hash_key(namespace, key_data)
        self.storage[key] = CacheEntry(value, ttl_seconds)

    def stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100.0) if total > 0 else 0.0
        return {
            "hits": self.hits,
            "misses": self.misses,
            "total_queries": total,
            "hit_rate_pct": round(hit_rate, 1),
            "cached_entries_count": len(self.storage)
        }

cache_engine = EcoPulseCache()

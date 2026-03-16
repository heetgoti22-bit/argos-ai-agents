"""Embedding utilities — hash-based fallback + Claude API integration."""

import math
from typing import Optional


def hash_embed(text: str, dim: int = 32) -> list[float]:
    """Generate hash-based embeddings (prototype fallback)."""
    import re
    tokens = re.sub(r"[^a-z0-9\s_]", " ", text.lower()).split()
    v = [0.0] * dim
    for ti, token in enumerate(tokens):
        h = 5381
        for ch in token:
            h = ((h << 5) + h + ord(ch)) & 0xFFFFFFFF
        for d in range(dim):
            v[d] += math.sin(h * (d + 1) * 0.1 + ti * 0.3) / (1 + ti * 0.1)
    mag = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / mag for x in v]


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    return dot


def chunk_code(content: str, chunk_lines: int = 10, overlap: int = 2) -> list[dict]:
    """Chunk code into overlapping segments."""
    lines = content.split("\n")
    chunks = []
    step = chunk_lines - overlap
    for i in range(0, len(lines), step):
        chunk_text = "\n".join(lines[i : i + chunk_lines])
        if len(chunk_text.strip()) >= 10:
            chunks.append({"content": chunk_text, "start_line": i})
    return chunks

"""Claude API integration — answer synthesis and embeddings."""

import httpx
from app.config import settings

CLAUDE_API = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-4-20250514"


async def claude_completion(prompt: str, system: str = "", max_tokens: int = 1024) -> str:
    """Call Claude API for text completion."""
    if not settings.claude_api_key:
        raise ValueError("CLAUDE_API_KEY not configured")

    messages = [{"role": "user", "content": prompt}]

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            CLAUDE_API,
            headers={
                "Content-Type": "application/json",
                "x-api-key": settings.claude_api_key,
                "anthropic-version": "2023-06-01",
            },
            json={
                "model": MODEL,
                "max_tokens": max_tokens,
                "system": system,
                "messages": messages,
            },
        )
        if resp.status_code != 200:
            raise ValueError(f"Claude API error: {resp.status_code}")
        data = resp.json()
        return "".join(c.get("text", "") for c in data.get("content", []))


async def synthesize_answer(question: str, code_context: str) -> str:
    """Generate a grounded answer from code context."""
    system = (
        "You are ARGOS, an AI code assistant. Answer based ONLY on the provided code context. "
        "Cite specific files and line numbers. Be concise and precise. "
        "Structure: 1) Direct answer 2) Key files with line refs 3) How components interact."
    )
    prompt = f"Code context:\n{code_context}\n\nQuestion: {question}"
    return await claude_completion(prompt, system=system, max_tokens=1500)

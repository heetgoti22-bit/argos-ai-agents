from fastapi import APIRouter, HTTPException
from app.schemas import RAGQuery, RAGResult
from app.services.claude_service import synthesize_answer

router = APIRouter(prefix="/query")


@router.post("/", response_model=RAGResult)
async def query_codebase(req: RAGQuery):
    # In production: retrieve vectors from FAISS, build context, call Claude
    try:
        answer = await synthesize_answer(req.question, "# No code context loaded yet")
        return RAGResult(
            answer=answer,
            confidence="low",
            sources=[],
            method="claude-api",
        )
    except ValueError:
        return RAGResult(
            answer="Claude API not configured. Set CLAUDE_API_KEY in .env to enable RAG synthesis.",
            confidence="none",
            sources=[],
            method="fallback",
        )

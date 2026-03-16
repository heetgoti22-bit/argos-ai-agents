from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Run, LogEntry
from app.schemas import AgentRunRequest, AgentRunResponse
import uuid
import time

router = APIRouter(prefix="/agents")

AVAILABLE_AGENTS = {
    "scanner": {"name": "Repo Scanner", "status": "implemented"},
    "bugs": {"name": "Bug Detector", "status": "implemented"},
    "deps": {"name": "Dependency Analyzer", "status": "implemented"},
    "embeddings": {"name": "Embedding Indexer", "status": "prototype"},
    "refactor": {"name": "Refactor Agent", "status": "implemented"},
    "remediate": {"name": "CVE Remediator", "status": "implemented"},
}


@router.get("/")
def list_agents():
    return [{"id": k, **v} for k, v in AVAILABLE_AGENTS.items()]


@router.post("/{agent_id}/run", response_model=AgentRunResponse)
def run_agent(agent_id: str, req: AgentRunRequest, db: Session = Depends(get_db)):
    if agent_id not in AVAILABLE_AGENTS:
        raise HTTPException(status_code=404, detail="Agent not found")

    run_id = f"run-{uuid.uuid4().hex[:8]}"
    run = Run(id=run_id, repo_id=req.repo_id, agent_id=agent_id, status="queued")
    db.add(run)

    log = LogEntry(run_id=run_id, agent_id=agent_id, level="info", message=f"Agent {agent_id} queued for repo {req.repo_id}")
    db.add(log)
    db.commit()

    # In production: enqueue to Celery
    # task_queue.enqueue(agent_id, repo_id=req.repo_id, run_id=run_id)

    return AgentRunResponse(run_id=run_id, agent_id=agent_id, status="queued")

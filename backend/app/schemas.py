from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


# ── Repos ──
class RepoCreate(BaseModel):
    name: str
    url: Optional[str] = None
    source: str = "paste"
    lang: str = "Python"

class RepoOut(BaseModel):
    id: str
    name: str
    url: Optional[str]
    source: str
    lang: str
    status: str
    file_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Runs ──
class RunOut(BaseModel):
    id: str
    repo_id: str
    agent_id: str
    pipeline_id: Optional[str]
    status: str
    duration_ms: Optional[int]
    results: Optional[Any]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Agents ──
class AgentRunRequest(BaseModel):
    repo_id: str

class AgentRunResponse(BaseModel):
    run_id: str
    agent_id: str
    status: str


# ── Pipelines ──
class PipelineCreate(BaseModel):
    name: str
    agents: list[str]
    schedule: str = "Manual"

class PipelineOut(BaseModel):
    id: str
    name: str
    agents: list[str]
    schedule: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── RAG ──
class RAGQuery(BaseModel):
    question: str
    repo_id: str

class RAGResult(BaseModel):
    answer: str
    confidence: str
    sources: list[dict]
    method: str


# ── Security ──
class CredentialOut(BaseModel):
    id: str
    name: str
    algorithm: str
    status: str
    rotated_at: datetime

    class Config:
        from_attributes = True

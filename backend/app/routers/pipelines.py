from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Pipeline
from app.schemas import PipelineCreate, PipelineOut
import uuid

router = APIRouter(prefix="/pipelines")


@router.get("/", response_model=list[PipelineOut])
def list_pipelines(db: Session = Depends(get_db)):
    return db.query(Pipeline).order_by(Pipeline.created_at.desc()).all()


@router.post("/", response_model=PipelineOut)
def create_pipeline(data: PipelineCreate, db: Session = Depends(get_db)):
    pipeline = Pipeline(
        id="p-" + uuid.uuid4().hex[:8],
        name=data.name,
        agents=data.agents,
        schedule=data.schedule,
    )
    db.add(pipeline)
    db.commit()
    db.refresh(pipeline)
    return pipeline


@router.post("/{pipeline_id}/run")
def run_pipeline(pipeline_id: str, repo_id: str, db: Session = Depends(get_db)):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    # In production: enqueue pipeline stages to Celery
    return {"pipeline_id": pipeline_id, "repo_id": repo_id, "status": "queued", "stages": pipeline.agents}


@router.delete("/{pipeline_id}")
def delete_pipeline(pipeline_id: str, db: Session = Depends(get_db)):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    db.delete(pipeline)
    db.commit()
    return {"deleted": pipeline_id}

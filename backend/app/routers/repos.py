from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Repo
from app.schemas import RepoCreate, RepoOut
from app.services.github_service import fetch_github_repo
import uuid

router = APIRouter(prefix="/repos")


@router.get("/", response_model=list[RepoOut])
def list_repos(db: Session = Depends(get_db)):
    return db.query(Repo).order_by(Repo.created_at.desc()).all()


@router.post("/github")
async def connect_github_repo(url: str, db: Session = Depends(get_db)):
    try:
        files, meta = await fetch_github_repo(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    repo_id = "gh-" + uuid.uuid4().hex[:8]
    repo = Repo(
        id=repo_id, name=meta["name"], url=url,
        source="github", lang=meta["lang"],
        file_count=meta["file_count"],
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return {"id": repo_id, "name": meta["name"], "files": len(files)}


@router.post("/paste")
def paste_repo(name: str, content: str, filename: str = "main.py", db: Session = Depends(get_db)):
    repo_id = "paste-" + uuid.uuid4().hex[:8]
    repo = Repo(id=repo_id, name=name, source="paste", lang="Mixed", file_count=1)
    db.add(repo)
    db.commit()
    return {"id": repo_id, "name": name}


@router.get("/{repo_id}", response_model=RepoOut)
def get_repo(repo_id: str, db: Session = Depends(get_db)):
    repo = db.query(Repo).filter(Repo.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repo not found")
    return repo

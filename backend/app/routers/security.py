from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Credential
from app.schemas import CredentialOut
from app.services.vault_service import vault

router = APIRouter(prefix="/security")


@router.get("/credentials", response_model=list[CredentialOut])
def list_credentials(db: Session = Depends(get_db)):
    return db.query(Credential).all()


@router.get("/audit")
def get_audit_log():
    return {"audit_log": vault.get_audit_log()}


@router.post("/rotate")
def rotate_keys():
    new_key = vault.rotate()
    return {"status": "rotated", "message": "All credentials re-encrypted with new key"}

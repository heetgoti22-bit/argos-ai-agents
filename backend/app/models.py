from sqlalchemy import Column, String, Integer, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.database import Base


class Repo(Base):
    __tablename__ = "repos"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=True)
    source = Column(String, default="paste")
    lang = Column(String, default="Python")
    status = Column(String, default="ready")
    file_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Run(Base):
    __tablename__ = "runs"
    id = Column(String, primary_key=True)
    repo_id = Column(String, nullable=False)
    agent_id = Column(String, nullable=False)
    pipeline_id = Column(String, nullable=True)
    status = Column(String, default="running")
    duration_ms = Column(Integer, nullable=True)
    results = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class Pipeline(Base):
    __tablename__ = "pipelines"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    agents = Column(JSON, nullable=False)
    schedule = Column(String, default="Manual")
    created_at = Column(DateTime, server_default=func.now())


class Credential(Base):
    __tablename__ = "credentials"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    encrypted_value = Column(Text, nullable=True)
    algorithm = Column(String, default="AES-256-Fernet")
    status = Column(String, default="active")
    created_at = Column(DateTime, server_default=func.now())
    rotated_at = Column(DateTime, server_default=func.now())


class LogEntry(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String, nullable=True)
    agent_id = Column(String, nullable=False)
    level = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

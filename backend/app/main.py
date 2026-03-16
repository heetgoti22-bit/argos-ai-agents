from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.config import settings
from app.database import engine, Base
from app.routers import repos, agents, pipelines, rag, security


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    Base.metadata.create_all(bind=engine)
    print("ARGOS: Database tables created")
    yield
    # Shutdown
    print("ARGOS: Shutting down")


app = FastAPI(
    title="ARGOS AI Code Agents",
    description="Secure AI code automation platform — Developer Preview",
    version="0.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(repos.router, prefix="/api/v1", tags=["repos"])
app.include_router(agents.router, prefix="/api/v1", tags=["agents"])
app.include_router(pipelines.router, prefix="/api/v1", tags=["pipelines"])
app.include_router(rag.router, prefix="/api/v1", tags=["rag"])
app.include_router(security.router, prefix="/api/v1", tags=["security"])


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": "0.3.0",
        "service": "ARGOS AI Code Agents",
    }

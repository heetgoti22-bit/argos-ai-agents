# 🛡️ ARGOS AI Code Agents

**Secure AI Code Automation Platform — Developer Preview**

ARGOS analyzes repositories, detects vulnerabilities, and automates development workflows using AI agents with a security-first architecture.

## Features

- **Repo Scanner** — AST parsing, function/class extraction, complexity metrics
- **Bug Detector** — Static analysis (eval, hardcoded secrets, bare except, TODO)
- **Dependency Analyzer** — Real CVE scanning via OSV.dev API
- **CVE Remediator** — Auto-generate upgrade patches and PR descriptions
- **RAG Q&A** — Codebase question answering with grounded citations
- **GitHub Integration** — Fetch and analyze real public repos
- **Security** — AES-256 credential vault, Docker sandbox architecture

## Architecture

```
Frontend (React) → FastAPI Gateway → Agent Workers
                                   ↓
                        PostgreSQL + Redis + FAISS
                                   ↓
                    GitHub API · OSV.dev · Claude API
```

## Tech Stack

Python · FastAPI · React · PostgreSQL · Redis · Docker · FAISS · GitHub API · OSV.dev · Claude API

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/argos-ai-agents.git
cd argos-ai-agents

# Start with Docker
docker-compose up --build

# Visit
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

## Manual Start (without Docker)

```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Edit with your keys
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Repo Scanner | ✅ Implemented | Real AST parsing |
| Bug Detector | ✅ Implemented | 6 static analysis rules |
| Dependency Analyzer | ✅ Implemented | Real OSV.dev API |
| CVE Remediator | ✅ Implemented | Patch + PR generation |
| GitHub Fetch | ✅ Implemented | Public repos via API |
| Embedding Indexer | 🟡 Prototype | Hash-based (production: sentence-transformers) |
| RAG Synthesis | 🟡 Prototype | Claude API with fallback |
| Credential Vault | ✅ Implemented | AES-256-Fernet |
| Docker Sandbox | ✅ Code complete | Not live in browser demo |
| Persistence | ✅ Implemented | PostgreSQL via SQLAlchemy |
| Task Queue | 📋 Planned | Celery + Redis architecture |

## Known Limitations

- GitHub fetch: 40 files max, public repos only
- Embeddings: hash-based prototype (not neural)
- No auth/multi-user in current version
- API calls frontend-direct in dev; production would use backend gateway

## License

MIT

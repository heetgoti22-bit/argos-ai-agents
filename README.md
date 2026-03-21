<div align="center">

# ARGOS AI Code Agents

**Secure AI Code Automation Platform**

A private, security-first platform that analyzes repositories, detects vulnerabilities using real CVE databases, and automates development workflows through modular AI agents.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Deployed](https://img.shields.io/badge/Live-Deployed-success?style=flat-square)](https://argos-ai-agents.netlify.app)

[Live Demo](https://argos-ai-agents.netlify.app) · [API Docs](https://argos-api-55ia.onrender.com/docs) · [Report Issue](../../issues)

</div>

---

## Why ARGOS Exists

Most AI code automation tools require trusting third-party infrastructure with your source code and credentials. ARGOS was built to solve that: a fully private platform where every scan, every credential, and every workflow stays under your control.

The platform connects to real vulnerability databases (OSV.dev), real repository hosting (GitHub API), and runs actual static analysis on your code — not simulated demos.

---

## Live Deployment

| Service | URL | Status |
|---------|-----|--------|
| Frontend | [argos-ai-agents.netlify.app](https://argos-ai-agents.netlify.app) | Netlify |
| Backend API | [argos-api-55ia.onrender.com](https://argos-api-55ia.onrender.com) | Render |
| API Docs | [argos-api-55ia.onrender.com/docs](https://argos-api-55ia.onrender.com/docs) | Swagger UI |
| Health Check | [argos-api-55ia.onrender.com/health](https://argos-api-55ia.onrender.com/health) | JSON |

> Note: Render free tier spins down after inactivity. First request after idle may take 30-50 seconds.

---

## What It Does

ARGOS provides six specialized AI agents that each handle a distinct part of the code analysis and security pipeline:

**Repo Scanner** parses source files using AST (Abstract Syntax Tree) analysis, extracting functions, classes, import statements, and calculating cyclomatic complexity per file. Supports Python, JavaScript, TypeScript, and Go.

**Bug Detector** runs static analysis with six implemented rules covering security risks (eval() usage, hardcoded secrets), code quality (bare except clauses, unresolved TODOs, leftover console.log statements), and style enforcement (line length limits).

**Dependency Analyzer** parses requirements.txt and package.json manifests, then queries the OSV.dev API for every dependency to check for known CVEs. This uses real vulnerability data — not a static lookup table.

**Embedding Indexer** chunks code files into overlapping segments, generates 32-dimensional vector embeddings, and builds a cosine similarity index for semantic code search.

**Refactor Agent** analyzes complexity metrics across the codebase and identifies functions that are too long, modules with too many responsibilities, and areas where helper extraction would reduce complexity.

**CVE Remediator** combines dependency scanning with automated patch generation. When it finds a vulnerability, it generates a unified diff showing the exact version upgrade needed and drafts a complete pull request description with severity, summary, and verification steps.

---

## Architecture

```
                    ┌─────────────────┐
                    │  React Frontend  │
                    │    (Netlify)     │
                    └────────┬────────┘
                             │ HTTP
                    ┌────────▼────────┐
                    │  FastAPI Backend  │
                    │    (Render)      │
                    │                  │
                    │  /api/v1/repos   │
                    │  /api/v1/agents  │
                    │  /api/v1/query   │
                    │  /api/v1/security│
                    └──┬─────┬─────┬──┘
                       │     │     │
              ┌────────▼┐ ┌──▼───┐ ┌▼────────┐
              │  SQLite  │ │Redis │ │  Agent   │
              │   (DB)   │ │(TBD) │ │ Workers  │
              └──────────┘ └──────┘ └────┬─────┘
                                         │
                           ┌─────────────┼──────────────┐
                           │             │              │
                     ┌─────▼─────┐ ┌────▼─────┐ ┌─────▼─────┐
                     │ GitHub API│ │ OSV.dev  │ │Claude API │
                     │(Repo Fetch│ │(CVE Data)│ │(Synthesis)│
                     └───────────┘ └──────────┘ └───────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Python 3.12, FastAPI 0.115 | REST API, async request handling |
| Frontend | React 18 | Dashboard, agent controls, visualizations |
| Database | SQLite (dev/deployed), PostgreSQL (production) | Repos, runs, pipelines, credentials, logs |
| ORM | SQLAlchemy 2.0 | Schema management |
| Security | cryptography (Fernet) | AES-256 credential encryption |
| CVE Data | OSV.dev API | Real-time vulnerability lookup |
| Code Hosting | GitHub REST API | Repository ingestion |
| Deployment | Render (backend), Netlify (frontend) | Cloud hosting |
| LLM (optional) | Claude API | Answer synthesis, PR drafting |

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- Git

### Local Development

```bash
# Clone
git clone https://github.com/heetgoti22-bit/argos-ai-agents.git
cd argos-ai-agents

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm start
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Docs | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

### Docker Deployment

```bash
docker-compose up --build
```

Starts: FastAPI (8000), React (3000), PostgreSQL (5432), Redis (6379).

---

## Project Structure

```
argos-ai-agents/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Environment configuration
│   │   ├── database.py          # SQLAlchemy engine and session
│   │   ├── models.py            # DB models (Repo, Run, Pipeline, Credential, Log)
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── agents/
│   │   │   ├── scanner.py       # AST parsing and code analysis
│   │   │   ├── bug_detector.py  # Static analysis rules engine
│   │   │   ├── dep_analyzer.py  # Dependency scanning + OSV.dev
│   │   │   ├── embeddings.py    # Code chunking and vector indexing
│   │   │   └── remediator.py    # CVE patching and PR generation
│   │   ├── routers/
│   │   │   ├── repos.py         # Repository CRUD + GitHub integration
│   │   │   ├── agents.py        # Agent execution endpoints
│   │   │   ├── pipelines.py     # Pipeline orchestration
│   │   │   ├── rag.py           # Codebase Q&A endpoint
│   │   │   └── security.py      # Vault and credential management
│   │   ├── services/
│   │   │   ├── github_service.py   # GitHub API client
│   │   │   ├── osv_service.py      # OSV.dev vulnerability lookup
│   │   │   ├── claude_service.py   # LLM answer synthesis
│   │   │   └── vault_service.py    # AES-256-Fernet encryption
│   │   └── utils/
│   │       ├── analysis.py      # File analysis engine
│   │       └── embeddings.py    # Vector math utilities
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .python-version
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx              # Main application (8 tabs)
│   │   ├── index.js             # React entry point
│   │   └── hooks/
│   │       └── useApi.js        # Backend API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── render.yaml
├── README.md
└── LICENSE
```

---

## API Reference

Interactive documentation available at [argos-api-55ia.onrender.com/docs](https://argos-api-55ia.onrender.com/docs).

| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/health` | Service health check |
| `GET` | `/api/v1/repos` | List all repositories |
| `POST` | `/api/v1/repos/github?url=` | Connect a GitHub repository |
| `POST` | `/api/v1/repos/paste` | Ingest pasted code |
| `GET` | `/api/v1/agents` | List available agents |
| `POST` | `/api/v1/agents/{id}/run` | Execute an agent on a repo |
| `GET` | `/api/v1/pipelines` | List pipelines |
| `POST` | `/api/v1/pipelines` | Create a new pipeline |
| `POST` | `/api/v1/pipelines/{id}/run` | Execute a pipeline |
| `DELETE` | `/api/v1/pipelines/{id}` | Delete a pipeline |
| `POST` | `/api/v1/query` | RAG codebase Q&A |
| `GET` | `/api/v1/security/credentials` | List vault credentials |
| `GET` | `/api/v1/security/audit` | View audit log |
| `POST` | `/api/v1/security/rotate` | Rotate encryption keys |

---

## Database Schema

```sql
repos       (id, name, url, source, lang, status, file_count, created_at, updated_at)
runs        (id, repo_id, agent_id, pipeline_id, status, duration_ms, results, created_at)
pipelines   (id, name, agents, schedule, created_at)
credentials (id, name, encrypted_value, algorithm, status, created_at, rotated_at)
logs        (id, run_id, agent_id, level, message, created_at)
```

---

## Implementation Status

This is a developer preview. The table below is an honest account of what is fully implemented, what exists as a working prototype, and what is architecturally designed but not yet built.

| Component | Status | Details |
|-----------|--------|---------|
| Repo Scanner (AST parsing) | Implemented | Parses Python, JS/TS, Go. Extracts functions, classes, complexity. |
| Bug Detector (static analysis) | Implemented | 6 rules: SEC001 (eval), SEC002 (secrets), PY003 (bare except), QA001 (TODO), QA002 (console.log), STYLE001 (line length). |
| Dependency Analyzer | Implemented | Parses requirements.txt and package.json. Queries OSV.dev API for real CVE data. |
| CVE Remediator | Implemented | Generates unified diff patches and PR descriptions from OSV.dev data. PR payload drafting only — does not POST to GitHub. |
| GitHub Repo Fetching | Implemented | Fetches file trees and contents via GitHub REST API. Public repos, up to 40 files. |
| Credential Vault | Implemented | AES-256-Fernet encryption with encrypt/decrypt/rotate and audit logging. |
| Pipeline Orchestrator | Implemented | Dynamic multi-agent pipelines with custom sequences and scheduling. |
| Embedding Indexer | Prototype | Hash-based 32-dim embeddings with cosine similarity. Production: sentence-transformers. |
| RAG Answer Synthesis | Prototype | Vector search with Claude API synthesis and local fallback. |
| Docker Sandbox | Code Complete | Implementation in security/sandbox.py. Not live in deployed version. |
| Database Persistence | Implemented | SQLite in deployed version, PostgreSQL via Docker Compose. |
| Task Queue | Planned | Architecture designed for Celery + Redis. |

---

## Security Model

**Credential Encryption:** All secrets encrypted at rest using AES-256-Fernet symmetric encryption. Master key stored separately. Every operation recorded in audit log.

**Sandboxed Execution:** Agent code designed to run inside Docker containers with `network_disabled=True`, memory limits, CPU quotas, and `read_only=True` filesystem.

**Secret Scanning:** Bug Detector includes rules SEC001 and SEC002 that detect `eval()` usage and hardcoded passwords/tokens/API keys.

**Audit Logging:** Every agent execution, credential access, and key rotation is logged with timestamps.

---

## External APIs

ARGOS integrates with three external APIs. All are optional with fallback behavior.

**OSV.dev API** — Real-time vulnerability lookups. No authentication required. Used by Dependency Analyzer and CVE Remediator.

**GitHub REST API** — Repository file fetching. Works without auth (60 req/hr). Token increases to 5,000 req/hr.

**Claude API (optional)** — Answer synthesis for RAG Q&A. Falls back to local template responses when unavailable.

> In the deployed prototype, some API calls are made from the frontend for demonstration. Production deployment would route all external calls through the backend with rate limiting and cost controls.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | No | `sqlite:///./argos.db` | Database connection string |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Allowed frontend origins |
| `CLAUDE_API_KEY` | No | Empty | Anthropic API key for synthesis |
| `GITHUB_TOKEN` | No | Empty | GitHub personal access token |
| `VAULT_MASTER_KEY` | No | Auto-generated | Fernet encryption key |

---

## Deployment

### Current Deployment

- **Frontend:** Netlify (free tier) — [argos-ai-agents.netlify.app](https://argos-ai-agents.netlify.app)
- **Backend:** Render (free tier) — [argos-api-55ia.onrender.com](https://argos-api-55ia.onrender.com)

### Deploy Your Own

**Backend (Render):**
1. Fork this repo
2. Create a new Web Service on [render.com](https://render.com)
3. Root Directory: `backend`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Frontend (Netlify):**
1. Create a new site on [netlify.com](https://netlify.com)
2. Base directory: `frontend`
3. Build command: `npm install && REACT_APP_API_URL=https://your-api.onrender.com npm run build`
4. Publish directory: `frontend/build`

### Local with Docker

```bash
docker-compose up --build
```

---

## Known Limitations

- Render free tier spins down after 15 min idle (30-50s cold start)
- GitHub fetching limited to 40 files, public repos only without token
- Embeddings use hash-based approximation, not neural embeddings
- Frontend makes some API calls directly (production: backend-mediated)
- PR generation creates payload only, does not POST to GitHub
- No authentication or multi-user support
- SQLite in deployed version (PostgreSQL available via Docker)

---

## Future Work

- Neural embeddings via sentence-transformers
- GitHub App integration for private repos and webhooks
- Live Docker sandbox execution
- Celery + Redis task queue for async agents
- GitHub PR creation via API
- Scheduled pipeline execution (cron)
- Multi-user authentication
- PostgreSQL in production deployment
- Cost tracking dashboard for API usage

---

## Contributing

Contributions welcome. Please open an issue first to discuss changes.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built by [Heet Goti](https://github.com/heetgoti22-bit)**

Built with a focus on security, transparency, and honest engineering.

[Live Demo](https://argos-ai-agents.netlify.app) · [API Docs](https://argos-api-55ia.onrender.com/docs) · [GitHub](https://github.com/heetgoti22-bit/argos-ai-agents)

</div>
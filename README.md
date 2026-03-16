<div align="center">

# ARGOS AI Code Agents

**Secure AI Code Automation Platform**

A private, security-first platform that analyzes repositories, detects vulnerabilities using real CVE databases, and automates development workflows through modular AI agents.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Live Demo](https://argos-frontend.onrender.com) · [API Docs](https://argos-api.onrender.com/docs) · [Report Issue](../../issues)

</div>

---

## Why ARGOS Exists

Most AI code automation tools require trusting third-party infrastructure with your source code and credentials. ARGOS was built to solve that: a fully private platform where every scan, every credential, and every workflow stays under your control.

The platform connects to real vulnerability databases (OSV.dev), real repository hosting (GitHub API), and runs actual static analysis on your code — not simulated demos.

---

## What It Does

ARGOS provides six specialized AI agents that each handle a distinct part of the code analysis and security pipeline:

**Repo Scanner** parses source files using AST (Abstract Syntax Tree) analysis, extracting functions, classes, import statements, and calculating cyclomatic complexity per file. It supports Python, JavaScript, TypeScript, and Go.

**Bug Detector** runs static analysis with six implemented rules covering security risks (eval() usage, hardcoded secrets), code quality (bare except clauses, unresolved TODOs, leftover console.log statements), and style enforcement (line length limits).

**Dependency Analyzer** parses requirements.txt and package.json manifests, then queries the OSV.dev API for every dependency to check for known CVEs. This uses real vulnerability data — not a static lookup table.

**Embedding Indexer** chunks code files into overlapping segments, generates 32-dimensional vector embeddings, and builds a cosine similarity index for semantic code search.

**Refactor Agent** analyzes complexity metrics across the codebase and identifies functions that are too long, modules with too many responsibilities, and areas where helper extraction would reduce complexity.

**CVE Remediator** combines dependency scanning with automated patch generation. When it finds a vulnerability, it generates a unified diff showing the exact version upgrade needed and drafts a complete pull request description with severity, summary, and verification steps.

---

## Architecture

```
                    ┌─────────────────┐
                    │   React Frontend │
                    │   (Port 3000)    │
                    └────────┬────────┘
                             │ HTTP
                    ┌────────▼────────┐
                    │  FastAPI Gateway │
                    │   (Port 8000)    │
                    │                  │
                    │  /api/v1/repos   │
                    │  /api/v1/agents  │
                    │  /api/v1/query   │
                    │  /api/v1/security│
                    └──┬─────┬─────┬──┘
                       │     │     │
              ┌────────▼┐ ┌──▼──┐ ┌▼────────┐
              │PostgreSQL│ │Redis│ │  Agent   │
              │   (DB)   │ │(Queue│ │ Workers  │
              │          │ │ TBD) │ │(Sandbox) │
              └──────────┘ └─────┘ └────┬─────┘
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
| Backend | Python 3.12, FastAPI | REST API, async request handling |
| Frontend | React 18, Vanilla CSS | Dashboard, agent controls, visualizations |
| Database | PostgreSQL 16 (prod), SQLite (dev) | Repos, runs, pipelines, credentials, logs |
| ORM | SQLAlchemy 2.0, Alembic | Schema management, migrations |
| Security | cryptography (Fernet) | AES-256 credential encryption |
| CVE Data | OSV.dev API | Real-time vulnerability lookup |
| Code Hosting | GitHub REST API | Repository ingestion |
| Containers | Docker, Docker Compose | Deployment, sandboxed execution |
| LLM (optional) | Claude API | Answer synthesis, PR drafting |

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- Git

### Quick Start (Local Development)

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/argos-ai-agents.git
cd argos-ai-agents

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
pip install -r requirements.txt
cp .env.example .env            # Edit with your API keys (optional)
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm start
```

**Frontend:** http://localhost:3000
**API Docs:** http://localhost:8000/docs
**Health Check:** http://localhost:8000/health

### Docker Deployment

```bash
docker-compose up --build
```

This starts the full stack: FastAPI backend, React frontend, PostgreSQL database, and Redis.

---

## Project Structure

```
argos-ai-agents/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Environment configuration
│   │   ├── database.py          # SQLAlchemy engine and session
│   │   ├── models.py            # Database models (Repo, Run, Pipeline, Credential, Log)
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
│   │   │   ├── github_service.py   # GitHub API integration
│   │   │   ├── osv_service.py      # OSV.dev vulnerability lookup
│   │   │   ├── claude_service.py   # LLM answer synthesis
│   │   │   └── vault_service.py    # AES-256-Fernet encryption
│   │   └── utils/
│   │       ├── analysis.py      # File analysis engine
│   │       └── embeddings.py    # Vector math utilities
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx              # Main application (all 8 tabs)
│   │   ├── index.js             # React entry point
│   │   └── hooks/
│   │       └── useApi.js        # Backend API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── render.yaml                  # Render deployment blueprint
├── README.md
└── LICENSE
```

---

## API Reference

All endpoints are documented in the interactive Swagger UI at `/docs`.

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
| Dependency Analyzer | Implemented | Parses requirements.txt and package.json. Queries OSV.dev API for real CVE data per package/version. |
| CVE Remediator | Implemented | Generates unified diff patches and complete PR descriptions from OSV.dev vulnerability data. |
| GitHub Repo Fetching | Implemented | Fetches file trees and contents via GitHub REST API. Public repos, up to 40 files per repo. |
| Credential Vault | Implemented | AES-256-Fernet encryption with encrypt/decrypt/rotate operations. Audit logging for all vault access. |
| Pipeline Orchestrator | Implemented | Dynamic multi-agent pipelines. Create custom sequences, execute in order, track per-stage results. |
| Embedding Indexer | Prototype | Hash-based 32-dimensional embeddings with cosine similarity search. Production target: sentence-transformers. |
| RAG Answer Synthesis | Prototype | Retrieval from vector index with Claude API synthesis and local fallback. |
| Docker Sandbox | Code Complete | Implementation exists in security/sandbox.py. Not live-executed in browser demo. |
| Database Persistence | Implemented | PostgreSQL in production (Render), SQLite in local development. Full schema with SQLAlchemy ORM. |
| Task Queue | Planned | Architecture designed for Celery + Redis. Agent execution currently synchronous. |

---

## Security Model

ARGOS follows a security-first design. These are the implemented security mechanisms:

**Credential Encryption:** All secrets are encrypted at rest using AES-256-Fernet symmetric encryption. The master key is stored separately from encrypted values. Every encrypt, decrypt, and rotate operation is recorded in an audit log.

**Sandboxed Execution:** The `SandboxExecutor` class (security/sandbox.py) runs agent code inside Docker containers with `network_disabled=True`, memory limits, CPU quotas, and `read_only=True` filesystem. Containers are destroyed after each task.

**Secret Scanning:** The Bug Detector agent includes rules SEC001 and SEC002 that detect `eval()` usage and hardcoded passwords/tokens/API keys in source code using pattern matching.

**Least Privilege:** In the production architecture, each agent receives a scoped, short-lived token for the specific task it needs to perform. Tokens are revoked after task completion.

**Audit Logging:** Every agent execution, credential access, and key rotation is logged with timestamps in the database for compliance and debugging.

---

## External API Integration

ARGOS integrates with three external APIs. All are optional and have fallback behavior when unavailable.

**OSV.dev API** — Used by the Dependency Analyzer and CVE Remediator for real-time vulnerability lookups. No authentication required. Each dependency is queried individually by name, version, and ecosystem. Rate limits are generous for typical usage.

**GitHub REST API** — Used to fetch repository file trees and contents. Works with public repositories without authentication (60 requests/hour). Adding a GitHub token in the `.env` file increases this to 5,000 requests/hour.

**Claude API (optional)** — Used for RAG answer synthesis and PR description generation. When the API key is not configured, the system falls back to local template-based responses. In the prototype, API calls are made from the frontend for demonstration purposes. In production, all external API calls would be routed through the backend gateway with rate limiting and cost controls.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | No | `sqlite:///./argos.db` | Database connection string |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection (for future task queue) |
| `CLAUDE_API_KEY` | No | Empty | Anthropic API key for answer synthesis |
| `GITHUB_TOKEN` | No | Empty | GitHub personal access token |
| `VAULT_MASTER_KEY` | No | Auto-generated | Fernet key for credential encryption |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Allowed frontend origins |

---

## Deployment

### Render (Recommended)

The repository includes a `render.yaml` blueprint for one-click deployment:

1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect the repository
4. Render provisions PostgreSQL, the API service, and the static frontend automatically

### Docker Compose

```bash
docker-compose up --build
```

Starts: FastAPI (8000), React (3000), PostgreSQL (5432), Redis (6379).

### Manual

See [Getting Started](#getting-started) above.

---

## Known Limitations

- **GitHub fetching** is limited to 40 files per repository and public repos only without a token.
- **Embeddings** use a hash-based approximation rather than neural embeddings. Production implementation would use sentence-transformers or a dedicated embedding model.
- **Frontend API calls** go directly to external services in the prototype. Production deployment would route all external calls through the backend gateway.
- **PR generation** creates the complete payload (title, branch, body, diff) but does not POST to the GitHub API.
- **No authentication or multi-user support** in the current version.
- **Render free tier** spins down after 15 minutes of inactivity. First request after idle takes approximately 30 seconds.

---

## Future Work

- Neural embeddings via sentence-transformers (local inference)
- GitHub App integration for private repositories and webhook-triggered pipelines
- Live Docker sandbox execution with streaming output
- Celery + Redis task queue for async agent execution
- GitHub PR creation via API (POST, not just payload generation)
- Scheduled pipeline execution (cron-based)
- Multi-user authentication and role-based access
- Cost tracking dashboard for API usage
- Support for additional languages (Rust, Java, Ruby)

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built with a focus on security, transparency, and honest engineering.

</div>

"""GitHub API integration — fetch real repos."""

import httpx
import base64
from app.config import settings

GITHUB_API = "https://api.github.com"
CODE_EXTENSIONS = {".py", ".js", ".ts", ".tsx", ".jsx", ".go", ".rs", ".java", ".rb",
                   ".txt", ".json", ".yml", ".yaml", ".toml", ".md", ".cfg", ".lock", ".mod"}
MAX_FILES = 40
MAX_FILE_SIZE = 50_000


def _headers() -> dict:
    h = {"Accept": "application/vnd.github.v3+json"}
    if settings.github_token:
        h["Authorization"] = f"token {settings.github_token}"
    return h


def parse_github_url(url: str) -> tuple[str, str]:
    """Extract owner/repo from GitHub URL."""
    import re
    m = re.search(r"github\.com/([^/]+)/([^/\s#?]+)", url)
    if not m:
        raise ValueError("Invalid GitHub URL")
    return m.group(1), m.group(2).replace(".git", "")


async def fetch_repo_tree(owner: str, repo: str) -> list[dict]:
    """Fetch the full file tree from GitHub."""
    async with httpx.AsyncClient(headers=_headers(), timeout=15.0) as client:
        for branch in ("main", "master"):
            resp = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1")
            if resp.status_code == 200:
                return resp.json().get("tree", [])
        raise ValueError(f"Could not fetch tree for {owner}/{repo}")


async def fetch_file_content(owner: str, repo: str, path: str) -> str:
    """Fetch a single file's content from GitHub."""
    async with httpx.AsyncClient(headers=_headers(), timeout=10.0) as client:
        resp = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}")
        if resp.status_code != 200:
            raise ValueError(f"Failed to fetch {path}")
        data = resp.json()
        if data.get("encoding") == "base64":
            return base64.b64decode(data["content"]).decode("utf-8", errors="replace")
        return data.get("content", "")


async def fetch_github_repo(url: str) -> tuple[dict[str, str], dict]:
    """Full pipeline: URL -> files dict + metadata."""
    owner, repo = parse_github_url(url)
    tree = await fetch_repo_tree(owner, repo)

    code_files = [
        f for f in tree
        if f["type"] == "blob"
        and f.get("size", 0) < MAX_FILE_SIZE
        and any(f["path"].endswith(ext) for ext in CODE_EXTENSIONS)
    ][:MAX_FILES]

    files = {}
    for f in code_files:
        try:
            files[f["path"]] = await fetch_file_content(owner, repo, f["path"])
        except Exception:
            continue

    meta = {"name": f"{owner}/{repo}", "lang": _detect_lang(files), "file_count": len(files)}
    return files, meta


def _detect_lang(files: dict[str, str]) -> str:
    ext_counts: dict[str, int] = {}
    for path in files:
        ext = path.rsplit(".", 1)[-1] if "." in path else "unknown"
        ext_counts[ext] = ext_counts.get(ext, 0) + 1
    if not ext_counts:
        return "Unknown"
    return max(ext_counts, key=ext_counts.get)

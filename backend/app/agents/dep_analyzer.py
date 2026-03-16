"""Dependency Analyzer agent — parse manifests + query OSV.dev."""

from app.utils.analysis import detect_dependencies
from app.services.osv_service import query_osv


async def run_dep_analyzer(files: dict[str, str]) -> dict:
    """Scan dependencies and check for CVEs via OSV.dev."""
    deps = detect_dependencies(files)
    results = []

    for dep in deps:
        vulns = await query_osv(dep["name"], dep["version"], dep["ecosystem"])
        results.append({**dep, "vulns": vulns})

    total_vulns = sum(len(d["vulns"]) for d in results)

    return {
        "deps": results,
        "total_deps": len(deps),
        "total_vulns": total_vulns,
    }

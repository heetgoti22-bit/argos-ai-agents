"""Repo Scanner agent — real AST parsing and code analysis."""

from app.utils.analysis import analyze_file


async def run_scanner(files: dict[str, str]) -> dict:
    """Scan all files in a repo, return aggregated analysis."""
    analysis = {}
    total_funcs = 0
    total_classes = 0
    total_issues = []

    for path, content in files.items():
        result = analyze_file(content, path)
        analysis[path] = result
        total_funcs += len(result["functions"])
        total_classes += len(result["classes"])
        total_issues.extend(
            [{**issue, "file": path} for issue in result["issues"]]
        )

    return {
        "files": len(files),
        "functions": total_funcs,
        "classes": total_classes,
        "issues_count": len(total_issues),
        "analysis": analysis,
    }

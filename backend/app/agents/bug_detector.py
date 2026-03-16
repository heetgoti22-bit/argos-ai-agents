"""Bug Detector agent — static analysis with real rules."""

from app.utils.analysis import analyze_file


async def run_bug_detector(files: dict[str, str]) -> dict:
    """Run static analysis across all files."""
    all_issues = []
    for path, content in files.items():
        result = analyze_file(content, path)
        all_issues.extend([{**i, "file": path} for i in result["issues"]])

    critical = sum(1 for i in all_issues if i["severity"] == "critical")
    warnings = sum(1 for i in all_issues if i["severity"] == "warning")
    info = sum(1 for i in all_issues if i["severity"] == "info")

    return {
        "issues": all_issues,
        "critical": critical,
        "warnings": warnings,
        "info": info,
        "total": len(all_issues),
    }

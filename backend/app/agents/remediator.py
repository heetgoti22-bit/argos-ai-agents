"""CVE Remediator agent — detect CVEs, generate patches, draft PRs."""

from app.utils.analysis import detect_dependencies
from app.services.osv_service import query_osv


async def run_remediator(files: dict[str, str]) -> dict:
    """Full CVE remediation pipeline."""
    deps = detect_dependencies(files)
    patches = []

    for dep in deps:
        vulns = await query_osv(dep["name"], dep["version"], dep["ecosystem"])
        for v in vulns:
            fix_ver = v["fixed"] or "latest"
            patch = (
                f"--- a/{dep['source']}\n"
                f"+++ b/{dep['source']}\n"
                f"@@ upgrade @@\n"
                f"-{dep['name']}=={dep['version']}\n"
                f"+{dep['name']}=={fix_ver}"
            )
            pr_body = (
                f"## Security: Fix {v['id']} in `{dep['name']}`\n\n"
                f"**Severity:** {v['severity']}\n"
                f"**Summary:** {v['summary']}\n\n"
                f"### Changes\n"
                f"- Upgrade `{dep['name']}` from `{dep['version']}` to `{fix_ver}`\n\n"
                f"### Verification\n"
                f"- [ ] Run test suite\n"
                f"- [ ] Confirm vulnerability resolved\n\n"
                f"*ARGOS CVE Remediator — Source: OSV.dev ({v['id']})*"
            )
            patches.append({
                "dep": dep["name"],
                "version": dep["version"],
                "fix_version": fix_ver,
                "cve": v["id"],
                "severity": v["severity"],
                "summary": v["summary"],
                "source": dep["source"],
                "patch": patch,
                "pr_body": pr_body,
            })

    return {"patches": patches, "total": len(patches)}

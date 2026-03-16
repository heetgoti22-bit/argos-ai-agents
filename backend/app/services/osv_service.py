"""OSV.dev API integration — real CVE vulnerability lookup."""

import httpx
from typing import Optional

OSV_API = "https://api.osv.dev/v1/query"


async def query_osv(package_name: str, version: str, ecosystem: str) -> list[dict]:
    """Query OSV.dev for known vulnerabilities."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                OSV_API,
                json={"package": {"name": package_name, "ecosystem": ecosystem}, "version": version},
            )
            if resp.status_code != 200:
                return []
            data = resp.json()
            vulns = []
            for v in data.get("vulns", []):
                severity = "LOW"
                for s in v.get("severity", []):
                    score = s.get("score", 0)
                    if isinstance(score, (int, float)):
                        if score > 7:
                            severity = "HIGH"
                        elif score > 4:
                            severity = "MEDIUM"

                fixed_version = None
                for affected in v.get("affected", []):
                    for r in affected.get("ranges", []):
                        for event in r.get("events", []):
                            if "fixed" in event:
                                fixed_version = event["fixed"]
                                break

                vulns.append({
                    "id": v["id"],
                    "summary": v.get("summary", "No description available"),
                    "severity": severity,
                    "fixed": fixed_version,
                    "aliases": v.get("aliases", []),
                })
            return vulns
    except Exception:
        return []

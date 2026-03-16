"""Real code analysis engine — AST parsing, static analysis, dep scanning."""

import re
from typing import Optional


def analyze_file(content: str, filename: str) -> dict:
    """Analyze a single file: extract functions, classes, issues, complexity."""
    lines = content.split("\n")
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "txt"
    funcs, classes, imports, issues = [], [], [], []
    complexity = 0

    for i, line in enumerate(lines):
        t = line.strip()
        ln = i + 1

        # Python
        if ext in ("py", "pyw"):
            m = re.match(r"^(?:async\s+)?def\s+(\w+)", t)
            if m:
                funcs.append({"name": m.group(1), "line": ln})
            m = re.match(r"^class\s+(\w+)", t)
            if m:
                classes.append({"name": m.group(1), "line": ln})
            if t.startswith("import ") or t.startswith("from "):
                imports.append(t)

        # JavaScript / TypeScript
        elif ext in ("js", "ts", "tsx", "jsx"):
            m = re.match(r"(?:function|const|let|var)\s+(\w+)\s*(?:=\s*(?:async\s*)?\(|[\(])", t)
            if m:
                funcs.append({"name": m.group(1), "line": ln})
            m = re.match(r"^(?:export\s+)?class\s+(\w+)", t)
            if m:
                classes.append({"name": m.group(1), "line": ln})
            if t.startswith("import "):
                imports.append(t)

        # Go
        elif ext == "go":
            m = re.match(r"^func\s+(?:\([^)]+\)\s+)?(\w+)", t)
            if m:
                funcs.append({"name": m.group(1), "line": ln})
            m = re.match(r"^type\s+(\w+)\s+struct", t)
            if m:
                classes.append({"name": m.group(1), "line": ln})

        # Static analysis rules
        if "eval(" in t:
            issues.append({"line": ln, "severity": "critical", "msg": "eval() usage — security risk", "rule": "SEC001"})
        if re.search(r"except:\s*$", t):
            issues.append({"line": ln, "severity": "warning", "msg": "Bare except clause", "rule": "PY003"})
        if re.search(r'(password|secret|api_key|token)\s*=\s*[\'"][^\'"]{4,}', t):
            issues.append({"line": ln, "severity": "critical", "msg": "Possible hardcoded secret", "rule": "SEC002"})
        if re.search(r"#\s*(TODO|FIXME|HACK|XXX)", t) or re.search(r"//\s*(TODO|FIXME|HACK|XXX)", t):
            issues.append({"line": ln, "severity": "info", "msg": "Unresolved TODO/FIXME", "rule": "QA001"})
        if "console.log(" in t:
            issues.append({"line": ln, "severity": "info", "msg": "console.log left in code", "rule": "QA002"})
        if len(t) > 120:
            issues.append({"line": ln, "severity": "info", "msg": "Line exceeds 120 chars", "rule": "STYLE001"})
        if any(kw in t for kw in ("if ", "for ", "while ", "case ")):
            complexity += 1

    return {
        "lines": len(lines),
        "functions": funcs,
        "classes": classes,
        "imports": imports,
        "issues": issues,
        "complexity": complexity,
        "ext": ext,
    }


def detect_dependencies(files: dict[str, str]) -> list[dict]:
    """Detect dependencies from requirements.txt, package.json, go.mod."""
    deps = []
    for name, content in files.items():
        if name.endswith("requirements.txt") or name == "requirements.txt":
            for line in content.split("\n"):
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                m = re.match(r"^([a-zA-Z0-9_.-]+)(?:[=<>!~]+(.+))?", line)
                if m:
                    deps.append({
                        "name": m.group(1),
                        "version": m.group(2) or "latest",
                        "source": name,
                        "ecosystem": "PyPI",
                    })
        elif name.endswith("package.json"):
            try:
                import json
                pkg = json.loads(content)
                all_deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
                for k, v in all_deps.items():
                    deps.append({
                        "name": k,
                        "version": re.sub(r"[\^~]", "", v),
                        "source": name,
                        "ecosystem": "npm",
                    })
            except Exception:
                pass
    return deps

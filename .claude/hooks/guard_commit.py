#!/usr/bin/env python3
"""PreToolUse(Bash): block `git commit` while typecheck, lint or the quick tests fail.

Runs the same `make` targets as CI, in Docker, for the projects with pending changes only.
The integration tests need a database and stay out; CI and `make test` still run them.
"""
import json
import os
import re
import subprocess
import sys

# First folder of a changed path -> the make targets that check it.
CHECKS = {
    "backend": ["backend-typecheck", "backend-lint", "backend-test-unit"],
    "frontend": ["format-check", "frontend-typecheck", "frontend-test"],
    "infrastructure": ["infra-validate"],
}

data = json.load(sys.stdin)
cmd = data.get("tool_input", {}).get("command", "")
if not re.search(r"\bgit\s+commit\b", cmd):
    sys.exit(0)

root = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd", "")
status = subprocess.run(["git", "status", "--porcelain"], cwd=root, capture_output=True, text=True).stdout
changed = {line[3:].split("/", 1)[0] for line in status.splitlines()}
pending = [project for project in CHECKS if project in changed]
if not pending:
    sys.exit(0)

if subprocess.run(["docker", "info"], capture_output=True).returncode != 0:
    print("Commit blocked: Docker is not running, and the checks run in Docker.", file=sys.stderr)
    sys.exit(2)

for project in pending:
    for target in CHECKS[project]:
        r = subprocess.run(["make", target], cwd=root, capture_output=True, text=True)
        if r.returncode != 0:
            out = (r.stdout + r.stderr)[-2500:]
            print(f"Commit blocked: `make {target}` fails ({project}/). Fix it first.\n{out}", file=sys.stderr)
            sys.exit(2)

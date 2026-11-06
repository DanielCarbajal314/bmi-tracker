#!/usr/bin/env python3
"""PreToolUse(Bash): block package installs at the repo root.

There is no root package.json; installing there creates a phantom one that
works locally and fails CI under --frozen-lockfile.
"""
import json
import os
import re
import sys

data = json.load(sys.stdin)
cmd = data.get("tool_input", {}).get("command", "")
root = os.path.realpath(os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd", ""))
cwd = os.path.realpath(data.get("cwd", root))

INSTALL = re.compile(r"\b(bun|pnpm|npm|yarn)\s+(install|i|add)\b")
INTO_PROJECT = re.compile(r"\bcd\s+(\./)?(backend|frontend)\b|(-C|--dir|--prefix|--cwd)[ =](\./)?(backend|frontend)\b")

if not INSTALL.search(cmd):
    sys.exit(0)
if cwd != root or INTO_PROJECT.search(cmd):
    sys.exit(0)

print(
    "Blocked: package install at the repo root. There is no root package.json; "
    "run it inside backend/ or frontend/ (e.g. `cd backend && bun add <pkg>`).",
    file=sys.stderr,
)
sys.exit(2)

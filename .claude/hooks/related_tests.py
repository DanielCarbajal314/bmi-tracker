#!/usr/bin/env python3
"""PostToolUse: after an edit, run the unit test that sits next to the edited file.

The test runs in Docker, like everything else in this repo. Exit 2 feeds a failure back to
Claude; a pass, a file with no unit test, or Docker not running stays silent. Only unit tests
run here: backend/test/ holds the integration suite, which needs a database.
"""
import json
import os
import subprocess
import sys

data = json.load(sys.stdin)
path = data.get("tool_input", {}).get("file_path", "")
root = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd", "")
rel = os.path.relpath(path, root) if path else ""

# project -> (source folder, test suffixes, command that runs one test file from /app)
PROJECTS = {
    "backend": ("backend/src/", (".unit-spec.ts",), lambda test: ["bun", "test", "./" + test]),
    "frontend": (
        "frontend/src/",
        (".unit-test.ts", ".unit-test.tsx"),
        lambda test: ["bun", "--bun", "vitest", "run", test],
    ),
}


def unit_test_for(rel_path, suffixes):
    """The test that covers rel_path: the file itself when it is one, else the one in the
    tests/ folder beside it."""
    folder, name = os.path.split(rel_path)
    if any(name.endswith(suffix) for suffix in suffixes):
        return rel_path
    stem = os.path.splitext(name)[0]
    if stem == "index":  # a component folder: tests/<Component>.unit-test.tsx
        stem = os.path.basename(folder)
    for suffix in suffixes:
        candidate = os.path.join(folder, "tests", stem + suffix)
        if os.path.exists(os.path.join(root, candidate)):
            return candidate
    return None


if not rel.endswith((".ts", ".tsx")):
    sys.exit(0)

for project, (prefix, suffixes, command) in PROJECTS.items():
    if not rel.startswith(prefix):
        continue
    test = unit_test_for(rel, suffixes)
    if test is None or subprocess.run(["docker", "info"], capture_output=True).returncode != 0:
        sys.exit(0)
    in_container = test[len(project) + 1 :]  # the path from /app, inside the service
    run = subprocess.run(
        ["docker", "compose", "run", "--rm", "--no-deps", project] + command(in_container),
        cwd=root,
        capture_output=True,
        text=True,
    )
    if run.returncode != 0:
        out = (run.stdout + run.stderr)[-2500:]
        print(f"The unit test of {rel} fails ({test}):\n{out}", file=sys.stderr)
        sys.exit(2)
    sys.exit(0)

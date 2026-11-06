#!/usr/bin/env python3
"""PostToolUse: an entity edit only changes the TS mapping; remind Claude the schema needs a migration.

The auto-migrate skill asks for this; the hook makes sure it is never forgotten.
"""
import json
import os
import sys

data = json.load(sys.stdin)
path = data.get("tool_input", {}).get("file_path", "")
root = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd", "")
rel = os.path.relpath(path, root) if path else ""

if rel.startswith("backend/src/persistency/models/") and rel.endswith(".entity.ts"):
    print(
        f"Reminder (not an error): {rel} is a TypeORM entity. If the mapped columns changed, "
        'run `make migrate` and then `make migration-generate name=<DescriptiveName>`, and read the '
        "generated SQL in backend/src/migrations/ (a rename comes out as drop + create).",
        file=sys.stderr,
    )
    sys.exit(2)

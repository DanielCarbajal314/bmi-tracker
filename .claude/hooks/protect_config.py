#!/usr/bin/env python3
"""PreToolUse(Bash): Claude Code config is edited by hand only.

permissions.deny covers Edit/Write; this covers the Bash route (sed, echo >, rm...).
Only a single plain read command may mention the protected paths.
"""
import json
import re
import sys

data = json.load(sys.stdin)
cmd = data.get("tool_input", {}).get("command", "")

PROTECTED = re.compile(r"settings(\.local)?\.json|\.claude/hooks|(?<![\w/.-])hooks/")
READ_ONLY = re.compile(r"^\s*(cat|ls|head|tail|grep|wc|git (diff|status|log|show))\b")
CHAINED = re.compile(r"[>;&|`]|\$\(")

if not PROTECTED.search(cmd):
    sys.exit(0)
if READ_ONLY.match(cmd) and not CHAINED.search(cmd):
    sys.exit(0)

print(
    "Blocked: Claude Code config (.claude/settings*.json, .claude/hooks/) is edited by the user "
    "by hand. Only single plain reads are allowed.",
    file=sys.stderr,
)
sys.exit(2)

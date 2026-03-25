#!/bin/sh
set -e

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

# Alias wrapper kept for subject/test harness compatibility.
python3 "$SCRIPT_DIR/test_system.py"


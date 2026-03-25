#!/bin/sh
set -e

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

# Wrapper for system/integration tests.
# For now, this calls the existing Python integration probe.
python3 "$SCRIPT_DIR/test_system.py"


#!/bin/bash

# -------------------------------
# Auto-commit script for Simplify Slovakia
# -------------------------------

# Exit on error
set -e

# Directories to track
TRACKED_DIRS=("data" "docs")

# Timestamp for commit message
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Add tracked directories
for DIR in "${TRACKED_DIRS[@]}"; do
    if [ -d "$DIR" ]; then
        git add "$DIR"
    fi
done

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit. Everything up-to-date."
else
    git commit -m "Auto-commit: $TIMESTAMP"
    git push origin main
    echo "Changes committed and pushed at $TIMESTAMP"
fi


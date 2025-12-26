#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")"

# Stage all relevant changes
git add data/flows/ data/steps/ data/rules/ docs/

# Commit with timestamp
git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

# Push to main branch
git push origin main

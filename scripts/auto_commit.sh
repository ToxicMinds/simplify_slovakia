#!/bin/bash

# Robust auto-commit script with proper locking
# Prevents the "index.lock" errors you were seeing

LOCK_FILE="/tmp/simplify_sk_autocommit.lock"
LOG_FILE="$(dirname "$0")/../auto_commit.log"

# Exit if another instance is running
if [ -e "$LOCK_FILE" ]; then
    echo "$(date): Another commit in progress, skipping" >> "$LOG_FILE"
    exit 0
fi

# Create lock file
touch "$LOCK_FILE"

# Ensure lock file is removed on exit
trap "rm -f $LOCK_FILE" EXIT

cd "$(dirname "$0")/.." || exit 1

# Check if there are changes
if git diff --quiet && git diff --cached --quiet; then
    echo "$(date): No changes to commit" >> "$LOG_FILE"
    exit 0
fi

# Add all changes
git add -A

# Commit with timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
git commit -m "Auto-commit: update Simplify Slovakia $TIMESTAMP" >> "$LOG_FILE" 2>&1

# Push to remote
git push origin main >> "$LOG_FILE" 2>&1

echo "$(date): Successfully committed and pushed" >> "$LOG_FILE"

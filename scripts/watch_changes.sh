#!/bin/bash

# Watch for changes in key directories and auto-commit
# Updated for canonical structure

echo "Starting file watcher for Simplify Slovakia..."
echo "Monitoring: docs/, rules/, data/, backend/, frontend/, infra/, scripts/"

# Install inotify-tools if not present (Elementary OS)
if ! command -v inotifywait &> /dev/null; then
    echo "Installing inotify-tools..."
    sudo apt-get update && sudo apt-get install -y inotify-tools
fi

# Watch multiple directories
inotifywait -m -r -e close_write,moved_to,create \
    docs/ rules/ data/ backend/ frontend/ infra/ scripts/ |
while read -r directory action file; do
    echo "$(date): Change detected in $directory$file"
    ./scripts/auto_commit.sh
done

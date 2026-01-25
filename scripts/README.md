# Scripts

Developer productivity and automation.

## Available Scripts

- `auto_commit.sh` - Auto-commit changes on file save
- `watch_changes.sh` - Monitor directories for changes
- `validate_rules.py` - (Future) YAML validation
- `dev_setup.sh` - (Future) One-command local setup

## Usage

### Auto-Commit Workflow
```bash
# Start the watcher (runs in background)
./scripts/watch_changes.sh

# Now any file changes in tracked folders auto-commit
```

### Stop Auto-Commit
```bash
# Find the process
ps aux | grep watch_changes

# Kill it
kill <PID>
```

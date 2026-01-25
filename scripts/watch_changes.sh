#!/bin/bash

# Watch changes in key directories
inotifywait -m -r -e close_write data/flows data/steps data/rules docs |
while read path action file; do
    ./auto_commit.sh
done

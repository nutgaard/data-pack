#!/usr/bin/sh

tmux new-window \; \
 rename-window 'data-pack-build' \; \
 send-keys 'npm run dev-ts' C-m \; \
 split-window -v \; \
 send-keys 'npm run dev-tsc' C-m \;

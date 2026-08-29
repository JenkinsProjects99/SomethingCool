#!/usr/bin/env bash
# Per-boot startup for the Ashland Calendar Cloud Agent environment.
# Starts the PostgreSQL daemon (its process does not survive across boots) and
# waits for it to accept connections before the dev server terminal starts.
set -euo pipefail

PG_MAJOR=16

echo "[start] Starting PostgreSQL cluster..."
sudo pg_ctlcluster "${PG_MAJOR}" main start 2>/dev/null || true

echo "[start] Waiting for PostgreSQL to be ready..."
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then
    echo "[start] PostgreSQL is ready."
    exit 0
  fi
  sleep 1
done

echo "[start] PostgreSQL did not become ready in time." >&2
exit 1

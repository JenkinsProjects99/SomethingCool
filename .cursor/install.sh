#!/usr/bin/env bash
# Idempotent repository bootstrap for the Ashland Calendar Cloud Agent environment.
# Installs PostgreSQL 16 (once, persisted in the snapshot), Node dependencies,
# and prepares the database (role, database, migrations, seed).
set -euo pipefail

cd "$(dirname "$0")/.."

PG_MAJOR=16
DB_USER=ashland
DB_PASSWORD=ashland
DB_NAME=ashland_calendar

echo "[install] Ensuring PostgreSQL ${PG_MAJOR} is installed..."
if ! command -v "pg_ctlcluster" >/dev/null 2>&1 || ! ls "/usr/lib/postgresql/${PG_MAJOR}/bin/postgres" >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    "postgresql-${PG_MAJOR}" "postgresql-client-${PG_MAJOR}"
fi

echo "[install] Starting PostgreSQL cluster (needed for migrations/seed)..."
sudo pg_ctlcluster "${PG_MAJOR}" main start 2>/dev/null || true

# Wait for the server to accept connections.
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then break; fi
  sleep 1
done

echo "[install] Ensuring role and database exist..."
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;
SQL
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" \
  | grep -q 1 || sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"

echo "[install] Ensuring .env exists..."
if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "[install] Installing Node dependencies..."
npm ci

echo "[install] Applying database migrations..."
npm run db:migrate

echo "[install] Seeding data (idempotent upsert)..."
npm run seed:reload

echo "[install] Done."

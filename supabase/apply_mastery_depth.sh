#!/usr/bin/env bash
# Applies the queued Mastery Depth migrations (0007–0013) in order via psql.
#
# Why psql and not the dashboard SQL editor: several of these define plpgsql
# functions with DML (UPDATE / INSERT / RETURNING ... INTO), and the dashboard
# editor mangles such bodies. psql applies them verbatim. SELECT-only and
# ADD COLUMN migrations in this set are dashboard-safe too, but running the whole
# set through psql keeps the order correct.
#
# Usage:
#   supabase/apply_mastery_depth.sh "postgresql://USER:PASSWORD@HOST:5432/postgres"
# or set DATABASE_URL and run with no argument:
#   DATABASE_URL="postgresql://..." supabase/apply_mastery_depth.sh
#
# Get the connection string from Supabase: Project Settings > Database >
# Connection string (URI). Use the direct connection, not the pooler, for DDL.

set -euo pipefail

DB_URI="${1:-${DATABASE_URL:-}}"
if [ -z "$DB_URI" ]; then
  echo "error: pass the database URI as the first argument, or set DATABASE_URL." >&2
  exit 1
fi

DIR="$(cd "$(dirname "$0")/migrations" && pwd)"

FILES=(
  "20270000000007_admin_concept_depth.sql"
  "20270000000008_mastery_depth_clusters.sql"
  "20270000000009_admin_depth_analytics.sql"
  "20270000000010_retention_ease_factor.sql"
  "20270000000011_nba_section32_reorder.sql"
  "20270000000012_admin_cluster_crud.sql"
  "20270000000013_nba_relevant_lab.sql"
)

for f in "${FILES[@]}"; do
  path="$DIR/$f"
  if [ ! -f "$path" ]; then
    echo "error: missing migration $path" >&2
    exit 1
  fi
  echo ">> applying $f"
  # ON_ERROR_STOP makes psql exit non-zero on the first SQL error, and -1 wraps
  # each file in a single transaction so a failure rolls that file back cleanly.
  psql "$DB_URI" -v ON_ERROR_STOP=1 -1 -f "$path"
done

echo ">> done: all Mastery Depth migrations applied."

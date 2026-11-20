#!/bin/sh
set -e

# Create the SQLite database on first start (the .db file is gitignored).
# /app/database should be a persistent volume so data survives redeploys.
if [ ! -f /app/database/Ibimina_database.db ]; then
  echo "No database found - initialising..."
  (cd /app && python3 scripts/create_database.py)
fi

exec "$@"

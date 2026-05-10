#!/bin/bash
set -euo pipefail

echo "--- Applying project migrations ---"
while IFS= read -r -d '' f; do
  echo "  → $(basename "$f")"
  psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
       -v ON_ERROR_STOP=1 --file "$f"
done < <(find /migrations -name "*.sql" -print0 | sort -z)
echo "--- Migrations complete ---"

#!/usr/bin/env bash
# ios-apple-team.sh — CrewAI Apple-Team wiring (ios-dev + security em conjunto)
# Gera ios/ExportOptions.plist a partir de $APPLE_TEAM_ID sem commitar secrets.
# Uso:
#   APPLE_TEAM_ID=ABCDE12345 ./scripts/ios-apple-team.sh
#   APPLE_TEAM_ID=ABCDE12345 EXPORT_METHOD=ad-hoc ./scripts/ios-apple-team.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="$ROOT/ios/ExportOptions.plist.template"
# Gerado (gitignored) — nunca sobrescreve o placeholder versionado.
OUTPUT="${EXPORT_OPTIONS_OUTPUT:-$ROOT/ios/ExportOptions.generated.plist}"

if [[ -z "${APPLE_TEAM_ID:-}" ]]; then
  echo "ℹ️  APPLE_TEAM_ID não definido — mantendo build unsigned (CI QA/Appetize)."
  echo "   Para TestFlight/App Store: export APPLE_TEAM_ID=<TeamID> (Apple Developer → Membership)"
  exit 0
fi

if [[ ! -f "$TEMPLATE" ]]; then
  echo "❌ Template não encontrado: $TEMPLATE" >&2
  exit 1
fi

EXPORT_METHOD="${EXPORT_METHOD:-app-store}"
APPLE_TEAM_ID="$APPLE_TEAM_ID" EXPORT_METHOD="$EXPORT_METHOD" envsubst < "$TEMPLATE" > "$OUTPUT"

if grep -q "REPLACE_WITH" "$OUTPUT"; then
  echo "❌ Placeholder não substituído em $OUTPUT" >&2
  exit 1
fi

echo "✅ ExportOptions.plist gerado com teamID=$APPLE_TEAM_ID method=$EXPORT_METHOD"
echo "   (arquivo gitignored — nunca commitar com TeamID real)"

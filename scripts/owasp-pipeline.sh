#!/bin/bash

# OWASP ZAP CLI Attack Pipeline
# Usage: ./owasp-pipeline.sh --target <URL> --type <baseline|full>

set -e

# Defaults
TARGET=""
SCAN_TYPE="baseline"
REPORT_DIR="$(pwd)/artifacts"
REPORT_NAME="owasp-report-$(date +%s).html"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --target) TARGET="$2"; shift ;;
        --type) SCAN_TYPE="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

if [ -z "$TARGET" ]; then
    echo "Error: Target URL is required."
    echo "Usage: $0 --target <URL> [--type baseline|full]"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "Error: Docker is required but not installed."
    exit 1
fi

echo "====================================================="
echo "🛡️  OWASP ZAP Attack Pipeline Initialized"
echo "====================================================="
echo "Target: $TARGET"
echo "Scan Type: $SCAN_TYPE"
echo "Report will be saved to: $REPORT_DIR/$REPORT_NAME"
echo "====================================================="

# Ensure artifacts directory exists
mkdir -p "$REPORT_DIR"

if [ "$SCAN_TYPE" = "full" ]; then
    echo "🚀 Starting FULL active scan (this may take a long time)..."
    docker run --rm --add-host host.docker.internal:host-gateway -v "$REPORT_DIR":/zap/wrk/:rw -t owasp/zap2docker-stable zap-full-scan.py -t "$TARGET" -r "$REPORT_NAME" || true
else
    echo "🚀 Starting BASELINE passive scan (quick)..."
    # Note: baseline scan usually exits with non-zero if issues are found, hence the || true
    docker run --rm --add-host host.docker.internal:host-gateway -v "$REPORT_DIR":/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py -t "$TARGET" -r "$REPORT_NAME" || true
fi

echo "====================================================="
echo "✅ Scan completed!"
echo "📄 Report generated at: $REPORT_DIR/$REPORT_NAME"
echo "====================================================="

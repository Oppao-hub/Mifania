#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
DEST_DIR="$ROOT/releases"
DEST="$DEST_DIR/mifania-release.apk"

if [[ ! -f "$SRC" ]]; then
  echo "Release APK not found. Run: npm run android:release"
  echo "Expected: $SRC"
  exit 1
fi

mkdir -p "$DEST_DIR"
cp "$SRC" "$DEST"
echo "Copied to $DEST"
ls -lh "$DEST"

#!/usr/bin/env bash
set -euo pipefail

API_HOST="sfl-mifania.up.railway.app"

if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found. Install Android SDK platform-tools."
  exit 1
fi

device_count="$(adb devices | awk 'NR>1 && $2=="device" { c++ } END { print c+0 }')"

if [ "$device_count" -eq 0 ]; then
  echo ""
  echo "No Android emulator or device connected."
  echo ""
  echo "Start one first, for example:"
  echo "  ~/Library/Android/sdk/emulator/emulator -avd Pixel_7 -dns-server 8.8.8.8,8.8.4.4"
  echo ""
  echo "Or Android Studio → Device Manager → run your AVD, then:"
  echo "  npm run android:check-network"
  echo ""
  exit 1
fi

if adb shell ping -c 1 -W 5 "$API_HOST" >/dev/null 2>&1; then
  echo "OK: Emulator can resolve and reach $API_HOST"
  exit 0
fi

echo ""
echo "Emulator is connected but cannot reach $API_HOST (DNS or network issue)."
echo ""
echo "Try a cold boot, or start the AVD with Google DNS:"
echo "  ~/Library/Android/sdk/emulator/emulator -avd Pixel_7 -dns-server 8.8.8.8,8.8.4.4"
echo ""
exit 1

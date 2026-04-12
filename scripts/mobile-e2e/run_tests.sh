#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Pulsify Mobile E2E — Full Execution Script
#  Cross-Platform Testing Team
#
#  Usage:
#    bash run_tests.sh                  → runs full regression suite
#    bash run_tests.sh auth             → Module 1: Auth only
#    bash run_tests.sh register         → Auth: Registration only
#    bash run_tests.sh recovery         → Auth: Account Recovery only
#    bash run_tests.sh sso              → Auth: SSO only
#    bash run_tests.sh jwt              → Auth: JWT/Session only
#    bash run_tests.sh profile          → Module 2: Profile only
#    bash run_tests.sh social           → Module 3: Social Graph only
#    bash run_tests.sh upload           → Module 4: Upload only
#    bash run_tests.sh megajourney      → Full Mega Journey E2E
#    bash run_tests.sh regression       → All 57 test cases
# ═══════════════════════════════════════════════════════════════

set -e  # exit on any command failure

SUITE=${1:-regression}
EMULATOR_AVD="Pixel_6_API_33"
APK_REL_PATH="../../Cross/build/app/outputs/flutter-apk/app-debug.apk"
APPIUM_PORT=4723
APPIUM_PID=""
EMULATOR_PID=""

# ── Colors ──────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ── Cleanup handler (kill background processes on exit) ──────────
cleanup() {
    echo ""
    echo -e "${CYAN}[CLEANUP] Stopping background processes...${NC}"
    [ -n "$APPIUM_PID" ]   && kill $APPIUM_PID   2>/dev/null && echo "  ✓ Appium stopped"
    [ -n "$EMULATOR_PID" ] && kill $EMULATOR_PID 2>/dev/null && echo "  ✓ Emulator stopped"
}
trap cleanup EXIT

# ── Android SDK Auto-Detection ───────────────────────────────────────────────
# Inject SDK path if adb is not already on PATH (common when running from IDE
# terminals or scripts that don't source ~/.zshrc)
ANDROID_SDK_DEFAULT="$HOME/Library/Android/sdk"
if [ -z "$ANDROID_HOME" ] && [ -d "$ANDROID_SDK_DEFAULT" ]; then
    export ANDROID_HOME="$ANDROID_SDK_DEFAULT"
    export ANDROID_SDK_ROOT="$ANDROID_SDK_DEFAULT"
fi
if [ -n "$ANDROID_HOME" ]; then
    export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
fi
# ────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🎵  Pulsify Mobile E2E Test Runner${NC}"
echo -e "${CYAN}  Suite : ${YELLOW}$SUITE${NC}"
echo -e "${CYAN}  Date  : $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""

# ── Step 1: Dependency Checks ────────────────────────────────────
echo -e "${CYAN}[1/7] Checking required dependencies...${NC}"

check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        echo -e "  ${RED}✗ '$1' not found. Install it and re-run.${NC}"
        exit 1
    else
        echo -e "  ${GREEN}✓ $1 found: $(command -v $1)${NC}"
    fi
}

check_cmd node
check_cmd adb
check_cmd appium
check_cmd emulator
check_cmd npx

node_version=$(node -e "process.exit(parseInt(process.versions.node.split('.')[0]) < 20 ? 1 : 0)" 2>&1 || echo "version_fail")
if [ "$node_version" = "version_fail" ]; then
    echo -e "  ${YELLOW}⚠ Node.js < 20 detected. Upgrade recommended.${NC}"
fi

echo ""

# ── Step 2: Build APK Check ──────────────────────────────────────
echo -e "${CYAN}[2/7] Verifying Pulsify APK exists...${NC}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APK_ABS="$SCRIPT_DIR/$APK_REL_PATH"

if [ ! -f "$APK_ABS" ]; then
    echo -e "  ${YELLOW}⚠ APK not found at: $APK_ABS${NC}"
    echo -e "  ${CYAN}Building Flutter debug APK...${NC}"
    pushd "$SCRIPT_DIR/../../Cross" > /dev/null
    flutter pub get
    flutter build apk --debug
    popd > /dev/null
    echo -e "  ${GREEN}✓ APK built successfully.${NC}"
else
    echo -e "  ${GREEN}✓ APK found: $APK_ABS${NC}"
fi
echo ""

# ── Step 3: Start Emulator ───────────────────────────────────────
echo -e "${CYAN}[3/7] Starting Android Emulator ($EMULATOR_AVD)...${NC}"

# Check if emulator already running
if adb devices | grep -q "emulator-5554.*device"; then
    echo -e "  ${GREEN}✓ Emulator already running (emulator-5554 detected).${NC}"
else
    AVAILABLE_AVDS=$(emulator -list-avds 2>/dev/null)
    if ! echo "$AVAILABLE_AVDS" | grep -q "$EMULATOR_AVD"; then
        echo -e "  ${YELLOW}⚠ AVD '$EMULATOR_AVD' not found. Available:${NC}"
        echo "$AVAILABLE_AVDS" | sed 's/^/    /'
        echo -e "  ${YELLOW}Edit EMULATOR_AVD variable in this script.${NC}"
        exit 1
    fi

    emulator -avd "$EMULATOR_AVD" -no-snapshot-load -no-audio &
    EMULATOR_PID=$!
    echo -e "  ${CYAN}Waiting for emulator to boot (this can take 60-90s)...${NC}"
    adb wait-for-device

    # Wait for full boot
    BOOT_COMPLETE=""
    MAX_WAIT=120
    ELAPSED=0
    while [ "$BOOT_COMPLETE" != "1" ] && [ $ELAPSED -lt $MAX_WAIT ]; do
        sleep 5
        ELAPSED=$((ELAPSED + 5))
        BOOT_COMPLETE=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
        echo -e "  [${ELAPSED}s] Boot status: $BOOT_COMPLETE"
    done

    if [ "$BOOT_COMPLETE" != "1" ]; then
        echo -e "  ${RED}✗ Emulator did not boot within ${MAX_WAIT}s. Check Android Studio.${NC}"
        exit 1
    fi

    echo -e "  ${GREEN}✓ Emulator fully booted.${NC}"
fi
echo ""

# ── Step 4: Install APK ──────────────────────────────────────────
echo -e "${CYAN}[4/7] Installing Pulsify APK on emulator...${NC}"
adb install -r "$APK_ABS"
echo -e "  ${GREEN}✓ APK installed: com.pulsify.app${NC}"
echo ""

# ── Step 5: Push Test Assets (for Upload tests) ──────────────────
echo -e "${CYAN}[5/7] Checking test audio assets for Upload module...${NC}"
ASSETS_DIR="$SCRIPT_DIR/../../test_assets"
mkdir -p "$ASSETS_DIR"

if [ ! -f "$ASSETS_DIR/sample.mp3" ]; then
    if command -v ffmpeg &>/dev/null; then
        ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 5 -q:a 9 -acodec libmp3lame "$ASSETS_DIR/sample.mp3" -y -loglevel quiet
        ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 5 "$ASSETS_DIR/sample.wav" -y -loglevel quiet
        echo -e "  ${GREEN}✓ Test audio files generated.${NC}"
    else
        echo -e "  ${YELLOW}⚠ ffmpeg not found — skipping test audio generation.${NC}"
        echo -e "  ${YELLOW}  TC-UPLD-001-10 (format test) will be skipped.${NC}"
    fi
fi

if [ -f "$ASSETS_DIR/sample.mp3" ]; then
    adb push "$ASSETS_DIR/sample.mp3" /sdcard/Download/sample.mp3 2>/dev/null && \
    adb push "$ASSETS_DIR/sample.wav" /sdcard/Download/sample.wav 2>/dev/null && \
    echo -e "  ${GREEN}✓ Test audio files pushed to emulator /sdcard/Download/${NC}"
fi
echo ""

# ── Step 6: Start Appium Server ──────────────────────────────────
echo -e "${CYAN}[6/7] Starting Appium server on port $APPIUM_PORT...${NC}"

# Check if Appium already running
if curl -s "http://127.0.0.1:$APPIUM_PORT/status" | grep -q '"ready":true'; then
    echo -e "  ${GREEN}✓ Appium already running.${NC}"
else
    appium --address 127.0.0.1 --port $APPIUM_PORT --log-level warn &
    APPIUM_PID=$!
    echo -e "  ${CYAN}Waiting for Appium to start...${NC}"
    APPIUM_READY=false
    for i in {1..15}; do
        sleep 2
        if curl -s "http://127.0.0.1:$APPIUM_PORT/status" 2>/dev/null | grep -q '"ready":true'; then
            APPIUM_READY=true
            break
        fi
    done

    if [ "$APPIUM_READY" = false ]; then
        echo -e "  ${RED}✗ Appium failed to start. Check port $APPIUM_PORT is free.${NC}"
        exit 1
    fi

    echo -e "  ${GREEN}✓ Appium running (PID: $APPIUM_PID)${NC}"
fi
echo ""

# ── Step 7: Run Tests ────────────────────────────────────────────
echo -e "${CYAN}[7/7] Executing test suite: ${YELLOW}$SUITE${NC}"
echo -e "${CYAN}────────────────────────────────────────────────${NC}"
echo ""

set +e  # allow test failure without stopping script
npx wdio run ./wdio.conf.js --suite "$SUITE"
TEST_EXIT_CODE=$?
set -e

echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "  ${GREEN}✅  ALL TESTS PASSED — Suite: $SUITE${NC}"
else
    echo -e "  ${RED}❌  TEST FAILURES DETECTED — Suite: $SUITE${NC}"
    echo -e "  ${YELLOW}   Exit code: $TEST_EXIT_CODE${NC}"
    echo -e "  ${YELLOW}   Scroll up to see failing TC IDs and stack traces.${NC}"
fi
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""

exit $TEST_EXIT_CODE

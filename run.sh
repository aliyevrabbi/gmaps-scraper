#!/bin/bash
# ── GMapsScraper TUI Launcher (Linux/Mac) ────────────
#    Rich terminal GUI only — no classic mode.
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

PYTHON="$PROJECT_DIR/.venv/bin/python3"

clear
echo "==================================================="
echo "   _____ __  __                _____              "
echo "  / ____|  \/  |              / ____|             "
echo " | |  __| \  / | __ _ _ __   | (___   ___ _ __    "
echo " | | |_ | |\/| |/ _\` | '_ \   \___ \ / __| '__|  "
echo " | |__| | |  | | (_| | |_) |  ____) | (__| |     "
echo "  \_____|_|  |_|\__,_| .__/  |_____/ \___|_|     "
echo "                     | |                          "
echo "                     |_|                          "
echo "==================================================="
echo "       by Rabbi Aliyev  •  Rich TUI Mode"
echo ""

# ── Ensure venv exists ─────────────────────────────
if [ ! -f "$PYTHON" ]; then
    echo "[*] Virtual environment yaradılır..."
    python3 -m venv .venv || {
        echo "[!] Virtual environment yaradıla bilmədi!"
        echo "    Python3 quraşdırıldığından əmin olun."
        read -p "Hər hansı düyməyə basın..." dummy
        exit 1
    }
fi

# ── Fast dependency check ───────────────────────────
"$PYTHON" -c "import playwright, openpyxl, rich" 2>/dev/null || {
    echo "[*] Kitabxanalar quraşdırılır..."
    "$PYTHON" -m pip install --quiet playwright openpyxl rich || {
        echo "[!] Kitabxanalar quraşdırıla bilmədi!"
        echo "    İnternet bağlantını yoxla."
        read -p "Hər hansı düyməyə basın..." dummy
        exit 1
    }
    echo "[✓] Kitabxanalar hazırdır."
    echo ""
}

# ── Ensure Chromium is installed ───────────────────
"$PYTHON" -c "
from playwright.sync_api import sync_playwright
try:
    with sync_playwright() as p:
        pass
except Exception:
    exit(1)
" 2>/dev/null || {
    echo "[*] Chromium brauzeri quraşdırılır..."
    "$PYTHON" -m playwright install chromium || {
        echo "[!] Chromium quraşdırıla bilmədi!"
        read -p "Hər hansı düyməyə basın..." dummy
        exit 1
    }
    echo "[✓] Chromium hazırdır."
    echo ""
}

# ── Launch TUI ─────────────────────────────────────
echo "[*] GMapsScraper Terminal GUI başladılır..."
echo ""

"$PYTHON" tui.py
EXIT_CODE=$?

# ── Crash guard: keep window open ──────────────────
if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "===================================================="
    echo "  [!] TUI xəta ilə bağlandı (kod: $EXIT_CODE)"
    echo "===================================================="
    echo ""
    read -p "Hər hansı düyməyə basın..." dummy
fi

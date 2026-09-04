@echo off
setlocal DisableDelayedExpansion
cls
echo ===================================================
echo    _____ __  __                _____              
echo   / ____|  \/  |              / ____|             
echo  | |  __| \  / | __ _ _ __   ^| (___   ___ _ __    
echo  | | |_ | ^|^\/^| ^|/ _` ^| '_ \   \___ \ / __^| '__|  
echo  | |__^| ^| ^|  ^| ^| (_^| ^| ^|_) ^|  ____) ^| (__^| ^|     
echo   \_____^|_^|  ^|_^|\__,_^| .__/  ^|_____/ \___^|_^|     
echo                      ^| ^|                          
echo                      ^|_^|                          
echo ===================================================
echo       by Rabbi Aliyev  •  Rich TUI Mode
echo.

cd /d "%~dp0"

rem ── Ensure venv exists ─────────────────────────────
if not exist ".venv\Scripts\activate.bat" (
    echo [*] Virtual environment yaradilir...
    python -m venv .venv
    if errorlevel 1 (
        echo [!] Virtual environment yaradila bilmedi!
        pause
        exit /b 1
    )
)

call .venv\Scripts\activate.bat

rem ── Fast dependency check ──────────────────────────
python -c "import playwright, openpyxl, rich" >nul 2>&1
if errorlevel 1 (
    echo [*] Kitabxanalar qurasdirilir...
    pip install --quiet playwright openpyxl rich
    if errorlevel 1 (
        echo [!] Kitabxanalar qurasdirila bilmedi!
        echo     Internet baglantini yoxla.
        pause
        exit /b 1
    )
    echo [✓] Kitabxanalar hazirdir.
    echo.
)

rem ── Ensure Chromium is installed ──────────────────
python -c "from playwright.sync_api import sync_playwright; sync_playwright().__enter__().__exit__(None,None,None)" >nul 2>&1
if errorlevel 1 (
    echo [*] Chromium brauzeri qurasdirilir...
    playwright install chromium
    if errorlevel 1 (
        echo [!] Chromium qurasdirila bilmedi!
        pause
        exit /b 1
    )
    echo [✓] Chromium hazirdir.
    echo.
)

rem ── Launch TUI ─────────────────────────────────────
echo [*] GMapsScraper Terminal GUI basladilir...
echo.

python tui.py

rem ── Crash guard ────────────────────────────────────
if errorlevel 1 (
    echo.
    echo ===================================================
    echo   [!] TUI xeta ile baglandi.
    echo ===================================================
    echo.
)

pause

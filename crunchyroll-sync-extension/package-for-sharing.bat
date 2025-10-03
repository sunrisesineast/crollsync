@echo off
REM Package Crunchyroll Sync Extension for sharing with friends (Windows)
REM This creates a zip file that friends can install directly

echo 📦 Packaging Crunchyroll Sync Extension...
echo.

REM Make sure we're in the right directory
cd /d "%~dp0"

REM Build the extension first
echo 🔨 Building extension...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Build complete!
echo.
echo 📁 Creating distribution package...
echo.
echo Please manually create a ZIP file with these instructions:
echo.
echo 1. Create a new folder called "crunchyroll-sync-extension-dist"
echo 2. Copy these folders/files into it:
echo    - dist/
echo    - icons/
echo    - manifest.json
echo    - popup.html
echo    - offscreen.html
echo 3. Right-click the folder and select "Send to" → "Compressed (zipped) folder"
echo 4. Share the ZIP file with your friends!
echo.
echo Your friends can install it by:
echo    1. Unzipping the file
echo    2. Going to chrome://extensions
echo    3. Enabling 'Developer mode'
echo    4. Clicking 'Load unpacked'
echo    5. Selecting the unzipped folder
echo.
echo Press any key to open the current folder...
pause > nul
explorer .


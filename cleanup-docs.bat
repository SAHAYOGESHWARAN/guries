@echo off
echo ========================================
echo Documentation Cleanup
echo ========================================
echo.
echo This will organize documentation files
echo and remove redundant/outdated files.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo Creating docs folder...
if not exist "docs" mkdir docs
if not exist "docs\archive" mkdir docs\archive

echo Moving important docs to docs folder...
move /Y "PRODUCTION_READY_CHECKLIST.md" "docs\" 2>nul
move /Y "PRODUCTION_STATUS_REPORT.md" "docs\" 2>nul
move /Y "QUICK_START_PRODUCTION.md" "docs\" 2>nul
move /Y "README.md" "docs\" 2>nul
move /Y "PROJECT_REPORT.md" "docs\" 2>nul

echo Archiving old documentation...
move /Y "*FIX*.md" "docs\archive\" 2>nul
move /Y "*SUMMARY*.md" "docs\archive\" 2>nul
move /Y "*UPDATES*.md" "docs\archive\" 2>nul
move /Y "*CHANGES*.md" "docs\archive\" 2>nul
move /Y "PROJECT_TEST_REPORT*.md" "docs\archive\" 2>nul
move /Y "TEST_*.md" "docs\archive\" 2>nul
move /Y "TESTING_*.md" "docs\archive\" 2>nul

echo Keeping essential guides in root...
echo - ENV_SETUP_GUIDE.md
echo - QUICK_START.md
echo - TODO.md

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Documentation structure:
echo   docs\
echo     - PRODUCTION_READY_CHECKLIST.md
echo     - PRODUCTION_STATUS_REPORT.md
echo     - QUICK_START_PRODUCTION.md
echo     - README.md
echo     - PROJECT_REPORT.md
echo   docs\archive\
echo     - Old documentation files
echo.
pause

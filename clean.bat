@echo off
setlocal enabledelayedexpansion

echo WARNING: This will remove all build artifacts, dependencies, and cache files.

echo.
echo Stopping Turbo processes...
taskkill /F /IM turbo.exe 2>nul
if errorlevel 1 (
    echo No Turbo processes found - continuing...
) else (
    echo Turbo processes stopped
    timeout /t 2 >nul
)

echo.
echo Removing node_modules folders...
for /d /r . %%d in (node_modules) do @if exist "%%d" (
    echo Deleting: %%d
    rmdir /s /q "%%d"
)

REM ... [keep existing cleanup code] ...

echo.
echo Cleaning npm cache...
npm cache clean --force

echo.
echo Cleanup complete!

echo.
echo Installing dependencies...
npm ci

if errorlevel 1 (
    echo Error during installation - please check the logs above
    pause
    exit /b 1
)

echo.
echo Installation complete!
pause

endlocal
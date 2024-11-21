@echo off
setlocal enabledelayedexpansion

echo WARNING: This will remove all build artifacts, dependencies, and cache files.

echo.
echo Removing node_modules folders...
for /d /r . %%d in (node_modules) do @if exist "%%d" (
    echo Deleting: %%d
    rmdir /s /q "%%d"
)

echo.
echo Removing build outputs...
for /d /r . %%d in (.next out build dist) do @if exist "%%d" (
    echo Deleting: %%d
    rmdir /s /q "%%d"
)

echo.
echo Removing cache folders...
for /d /r . %%d in (.turbo) do @if exist "%%d" (
    echo Deleting: %%d
    rmdir /s /q "%%d"
)

echo.
echo Removing environment files...
echo Searching for .env files...
del /f /s .env .env.local .env.*

echo.
echo Removing TypeScript build info...
echo Searching for .tsbuildinfo files...
del /f /s *.tsbuildinfo

echo.
echo Removing package manager files...
echo Searching for package manager files...
del /f /s .pnp.*
for /d /r . %%d in (.yarn) do @if exist "%%d" (
    echo Deleting: %%d
    rmdir /s /q "%%d"
)

echo.
echo Removing log files...
echo Searching for log files...
del /f /s *.log npm-debug.log* yarn-debug.log* yarn-error.log*

echo.
echo Cleanup complete!

echo.
echo Installing dependencies...
npm install

endlocal
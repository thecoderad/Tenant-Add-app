@echo off
REM TenantHub Startup Script
REM Starts a local server to run TenantHub in a browser

echo.
echo ========================================
echo    TenantHub - Multi-Tenant Platform
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is required to run TenantHub.
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

REM Start a simple HTTP server
echo Starting TenantHub on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8000
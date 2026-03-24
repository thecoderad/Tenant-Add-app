@echo off
title TenantHub Server
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║              TenantHub - Business Management              ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

:: Kill any existing Node processes
echo [1/3] Stopping existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

:: Check if node_modules exists
if not exist "node_modules" (
    echo [2/3] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo Make sure Node.js is installed.
        echo.
        pause
        exit /b 1
    )
) else (
    echo [2/3] Dependencies ready.
)

echo [3/3] Starting server...
echo.
echo ═══════════════════════════════════════════════════════════
echo 
echo   ✓ Server starting at: http://localhost:3000
echo
echo   LOGIN CREDENTIALS:
echo   ═══════════════════════════════════════
echo   Admin:
echo     Email: admin@tenanthub.com
echo     Password: admin123
echo
echo   Demo Tenants:
echo     Care Clinic: admin@careclinic.com / clinic123
echo     Little Stars Daycare: admin@littlestars.com / daycare123
echo     Bella Salon: admin@bellasalon.com / salon123
echo     Acme Corporation: admin@acme.com / acme123
echo
echo   TENANT LOGIN URLs:
echo   ═══════════════════════════════════════
echo     http://localhost:3000/login/care-clinic
echo     http://localhost:3000/login/little-stars-daycare
echo     http://localhost:3000/login/bella-salon
echo     http://localhost:3000/login/acme-corporation
echo
echo ═══════════════════════════════════════════════════════════
echo.
echo   IMPORTANT: Keep this window open while using TenantHub!
echo   Press Ctrl+C to stop the server.
echo.
echo ═══════════════════════════════════════════════════════════
echo.

call node server.js

pause

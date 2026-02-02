@echo off
echo ================================================
echo Railway Deployment Setup
echo ================================================
echo.

where railway >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [1/4] Installing Railway CLI...
    call npm install -g @railway/cli
) else (
    echo [1/4] Railway CLI already installed
)

echo.
echo [2/4] Logging into Railway...
call railway login

echo.
echo [3/4] Initializing Railway project...
call railway init

echo.
echo [4/4] Environment Variables
echo.
echo Please set these in Railway dashboard:
echo   - JWT_SECRET (required - generate random string)
echo   - NODE_ENV=production
echo   - FRONTEND_URL (your frontend domain)
echo.

pause

echo.
echo Opening Railway dashboard...
call railway open

echo.
echo ================================================
echo Ready to deploy!
echo ================================================
echo.
echo Run: railway up
echo.
pause

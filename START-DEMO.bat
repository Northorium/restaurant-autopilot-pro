@echo off
echo ================================================
echo Restaurant Autopilot Pro - Demo Launcher
echo ================================================
echo.

cd backend

echo [1/3] Installing backend dependencies...
call npm install

echo.
echo [2/3] Starting backend server (port 3001)...
start "Restaurant Autopilot - Backend" cmd /k "node server.js"

echo.
echo [3/3] Opening frontend (port 8080)...
cd ..\frontend-manual
start "Restaurant Autopilot - Frontend" cmd /k "python -m http.server 8080 || npx http-server -p 8080"

timeout /t 3 >nul

echo.
echo ================================================
echo ✅ Demo is ready!
echo ================================================
echo.
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:3001
echo.
echo Demo Login:
echo   Email: demo@restaurant.com
echo   Password: demo123
echo.
echo Press Ctrl+C in each window to stop.
echo ================================================

start http://localhost:8080

pause

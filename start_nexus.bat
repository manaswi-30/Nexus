@echo off
title NEXUS Launcher

cd /d "%~dp0"

echo ========================================
echo        Starting NEXUS Traffic
echo ========================================

echo [1/3] Starting Backend...
start "NEXUS Backend" cmd /k "cd /d "%~dp0" && uvicorn backend.main:app --reload"

timeout /t 4 /nobreak >nul

echo [2/3] Starting Frontend...
start "NEXUS Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 4 /nobreak >nul

echo [3/3] Opening Dashboard...
start "" "http://localhost:5173"

echo.
echo ========================================
echo        NEXUS is now running
echo ========================================
echo Backend  : http://127.0.0.1:8000
echo Frontend : http://localhost:5173

timeout /t 2 /nobreak >nul
exit
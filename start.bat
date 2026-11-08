@echo off
title CommandCast - College Opportunity Radar
cd /d "%~dp0"

echo =====================================================================
echo                 COMMANDCAST - CAMPUS RADAR
echo              Relevant. Verified. Easy to act on.
echo =====================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org and try again.
    pause
    exit /b 1
)

if not exist node_modules (
    echo [1/2] First time setup: Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo [2/2] Starting development server...
echo.
echo URL: http://localhost:5173/
echo.

call npm run dev -- --open

pause

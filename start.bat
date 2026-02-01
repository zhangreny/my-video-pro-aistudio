@echo off
TITLE Video Pro Editor - Full Stack Starter
SETLOCAL

:: Set the base directory to ensure paths stay relative to the script location
SET "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

echo [1/5] Cleaning folders...
IF EXIST "resultvideos\" del /Q /S "resultvideos\*.mp4" >nul 2>&1
IF EXIST "temp_uploads\" del /Q /S "temp_uploads\*.mp4" >nul 2>&1

echo [2/5] Checking environment...
IF NOT EXIST "backend\.venv" (
    echo Error: Backend virtual environment not found.
    pause
    exit /b
)

echo [3/5] Starting Backend (Flask)...
start /B "" "backend\.venv\Scripts\python.exe" backend\app.py

echo [4/5] Starting Male Voice Remover API...
:: Use absolute path or pushd to avoid getting lost in directories
pushd ..\male_voice_remover
start /B "" ".venv\Scripts\python.exe" api.py
popd

echo [5/5] Starting Frontend (Vite)...
echo ======================================================
echo    PROJECT IS RUNNING
echo    - Frontend: http://localhost:5173
echo    - Backend:  http://localhost:5000
echo ======================================================

:: Run frontend (staying in the project root)
npm run dev

echo Stopping backend processes...
taskkill /F /IM python.exe /T >nul 2>&1
pause
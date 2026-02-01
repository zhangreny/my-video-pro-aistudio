@echo off
TITLE Video Pro Editor - Full Stack Starter
SETLOCAL

echo [0.1/3] Cleaning resultvideos folder...
IF EXIST "resultvideos\" (
    del /Q /S "resultvideos\*.mp4" >nul 2>&1
)

echo [0.2/3] Cleaning temp_uploads folder...
IF EXIST "temp_uploads\" (
    del /Q /S "temp_uploads\*.mp4" >nul 2>&1
)

echo [1/3] Checking environment...
IF NOT EXIST "backend\.venv" (
    echo Error: Backend virtual environment not found in backend\.venv
    echo Please run 'uv venv' in the backend folder first.
    pause
    exit /b
)

echo [2/3] Starting Backend (Flask) on port 5000...
start /B "" "backend\.venv\Scripts\python.exe" backend\app.py

echo [3/3] Starting Frontend (Vite)...
echo.
echo ======================================================
echo    PROJECT IS RUNNING
echo    - Frontend: http://localhost:5173
echo    - Backend:  http://localhost:5000
echo.
echo    PRESS CTRL+C IN THIS WINDOW TO STOP BOTH SERVERS
echo ======================================================
echo.

:: Run frontend in the main window
npm run dev

:: When frontend stops (Ctrl+C), kill the background backend process
echo.
echo Stopping backend processes...
taskkill /F /IM python.exe /T >nul 2>&1
echo Done.
pause
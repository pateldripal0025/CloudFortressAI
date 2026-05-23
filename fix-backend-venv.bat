@echo off
title CloudFortress AI: Fix Backend Venv
echo ====================================================================
echo   🛠️  Fixing Python AI Engine Virtual Environment (venv)
echo ====================================================================
echo.

cd backend

echo [1/3] Removing corrupted/old virtual environment...
if exist venv (
    rmdir /s /q venv
    if exist venv (
        echo   [ERROR] Failed to delete existing 'venv' directory. 
        echo           Please close any terminals/processes using the backend venv and try again.
        pause
        exit /b 1
    )
    echo   [OK] Old venv removed successfully.
) else (
    echo   [OK] No existing venv found.
)
echo.

echo [2/3] Creating a new virtual environment...
python -m venv venv
if errorlevel 1 (
    echo   [WARN] 'python' command failed. Trying 'py' command instead...
    py -m venv venv
    if errorlevel 1 (
        echo   [ERROR] Python is not installed or not in your PATH. 
        echo           Please install Python and make sure it is added to your environment variables.
        pause
        exit /b 1
    )
)
echo   [OK] Virtual environment created successfully.
echo.

echo [3/3] Activating venv and installing requirements...
call .\venv\Scripts\activate
if errorlevel 1 (
    echo   [ERROR] Failed to activate virtual environment.
    pause
    exit /b 1
)

python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo   [ERROR] Failed to install requirements.
    pause
    exit /b 1
)

echo.
echo ====================================================================
echo   🎉 Venv Fixed Successfully! You can now start CloudFortress.
echo ====================================================================
echo.
pause

@echo off
echo ============================================
echo   RouteLog Pro - Setup Script
echo ============================================
echo.

REM Backend Setup
echo [1/4] Setting up Python virtual environment...
cd /d "%~dp0backend"
python -m venv venv
call venv\Scripts\activate

echo [2/4] Installing Python dependencies...
pip install -r requirements.txt

echo [3/4] Running database migrations...
python manage.py migrate

echo [4/4] Setting up frontend...
cd /d "%~dp0frontend"
call npm install

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo To start the app:
echo   1. Open Terminal 1: cd backend ^& venv\Scripts\activate ^& python manage.py runserver
echo   2. Open Terminal 2: cd frontend ^& npm run dev
echo.
echo Then open http://localhost:5173 in your browser.
echo ============================================
pause

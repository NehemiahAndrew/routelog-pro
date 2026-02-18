@echo off
echo ============================================
echo   RouteLog Pro - Starting Backend
echo ============================================
cd /d "%~dp0backend"
call venv\Scripts\activate
python manage.py runserver

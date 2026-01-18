@echo off
REM Development server startup script for Docker on Windows
REM Usage: dev.bat

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         Pokerthing Development Server with HMR                 ║
echo ║              Docker on Windows (Docker Desktop)                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed or not in PATH
    echo    Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker daemon is not running
    echo    Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo ✓ Docker is running
echo.
echo Environment:
echo   HMR Host: localhost
echo   HMR Port: 5173
echo   HMR Protocol: ws
echo.
echo Starting development container...
echo.
echo ⏳ This may take a moment on first run...
echo.

REM Start the development container
docker-compose up dev

REM Cleanup message
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                 Development server stopped                      ║
echo ║           To restart, run: docker-compose up dev               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

pause

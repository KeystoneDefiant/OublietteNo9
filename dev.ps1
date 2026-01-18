# Development server startup script for Docker on Windows
# Usage: .\dev.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n" -NoNewline
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         Pokerthing Development Server with HMR                 ║" -ForegroundColor Cyan
Write-Host "║              Docker on Windows (Docker Desktop)                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Check if Docker is installed
try {
    $dockerVersion = docker --version 2>$null
    Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Please install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker daemon is running
try {
    docker info >$null 2>&1
    Write-Host "✓ Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker daemon is not running" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop and try again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`nEnvironment Configuration:" -ForegroundColor Yellow
Write-Host "  HMR Host: localhost" -ForegroundColor Gray
Write-Host "  HMR Port: 5173" -ForegroundColor Gray
Write-Host "  HMR Protocol: ws" -ForegroundColor Gray
Write-Host "`nStarting development container..." -ForegroundColor Yellow
Write-Host "`n⏳ This may take a moment on first run...`n" -ForegroundColor Yellow

# Start the development container
docker-compose up dev

# Cleanup message
Write-Host "`n" -NoNewline
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                 Development server stopped                      ║" -ForegroundColor Cyan
Write-Host "║           To restart, run: docker-compose up dev               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

Read-Host "Press Enter to exit"

#!/bin/bash
# Development server startup script for Docker on Windows

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Pokerthing Development Server with HMR                 ║"
echo "║              Docker on Windows (WSL2/Docker Desktop)           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✓ Docker is running"

# Determine HMR host based on environment
if grep -qE "(microsoft|WSL)" /proc/version 2>/dev/null; then
    HMR_HOST="host.docker.internal"
    echo "✓ Detected WSL2 environment"
    echo "  Using VITE_HMR_HOST=host.docker.internal"
else
    HMR_HOST="localhost"
    echo "✓ Detected Docker Desktop environment"
    echo "  Using VITE_HMR_HOST=localhost"
fi

echo ""
echo "Building and starting development container..."
echo ""

# Start the development container with HMR environment variables
docker-compose up dev \
    -e VITE_HMR_HOST=$HMR_HOST \
    -e VITE_HMR_PORT=5173 \
    -e VITE_HMR_PROTOCOL=ws

# Cleanup message
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                 Development server stopped                      ║"
echo "║           To restart, run: docker-compose up dev               ║"
echo "╚════════════════════════════════════════════════════════════════╝"

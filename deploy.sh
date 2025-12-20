#!/bin/bash
# Deploy Sambung Nyowo Healthcare App on Ubuntu Server

set -e

CONTAINER_NAME="sambungnyowo"
IMAGE_NAME="sambungnyowo"
PORT=3004

echo "🔄 Building Docker image..."
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "🛑 Stopping existing container (if any)..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo "🚀 Starting container..."

# Set ORIGIN to your domain or localhost
# For production with nginx proxy, use your domain
ORIGIN=${ORIGIN:-"http://localhost:${PORT}"}

docker run -d \
    --name $CONTAINER_NAME \
    -p ${PORT}:3000 \
    -e NODE_ENV=production \
    -e HOST=0.0.0.0 \
    -e PORT=3000 \
    -e ORIGIN=$ORIGIN \
    -v sambungnyowo-data:/app/data \
    --restart unless-stopped \
    $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════════"
    echo "  ✅ Container '$CONTAINER_NAME' is running!"
    echo "  🌐 Open: http://localhost:$PORT"
    echo "═══════════════════════════════════════════"
else
    echo "❌ Failed to start container!"
    exit 1
fi

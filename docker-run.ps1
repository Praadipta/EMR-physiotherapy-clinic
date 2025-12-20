# Build and run the Healthcare App as a single container
# Container name: sambungnyowo

$CONTAINER_NAME = "sambungnyowo"
$IMAGE_NAME = "sambungnyowo"
$PORT = 3004

Write-Host "🔄 Building Docker image..." -ForegroundColor Cyan
docker build -t $IMAGE_NAME .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "🛑 Stopping existing container (if any)..." -ForegroundColor Yellow
docker stop $CONTAINER_NAME 2>$null
docker rm $CONTAINER_NAME 2>$null

Write-Host "🚀 Starting container..." -ForegroundColor Green
docker run -d `
    --name $CONTAINER_NAME `
    -p ${PORT}:3000 `
    -e NODE_ENV=production `
    -e HOST=0.0.0.0 `
    -e PORT=3000 `
    -e ORIGIN=http://localhost:${PORT} `
    -v sambungnyowo-data:/app/data `
    --restart unless-stopped `
    $IMAGE_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ✅ Container '$CONTAINER_NAME' is running!" -ForegroundColor Green
    Write-Host "  🌐 Open: http://localhost:$PORT" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to start container!" -ForegroundColor Red
}

# PowerShell script to start the LiveKit Agent
Write-Host "Starting LiveKit Agent..." -ForegroundColor Green

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

# Check if required environment variables are set
if (-not $env:LIVEKIT_URL) {
    Write-Host "Error: LIVEKIT_URL environment variable not set" -ForegroundColor Red
    exit 1
}

if (-not $env:LIVEKIT_API_KEY) {
    Write-Host "Error: LIVEKIT_API_KEY environment variable not set" -ForegroundColor Red
    exit 1
}

if (-not $env:LIVEKIT_API_SECRET) {
    Write-Host "Error: LIVEKIT_API_SECRET environment variable not set" -ForegroundColor Red
    exit 1
}

Write-Host "Environment variables configured correctly" -ForegroundColor Green
Write-Host "LiveKit Server: $env:LIVEKIT_URL" -ForegroundColor Cyan

# Start the agent
Write-Host "Starting agent process..." -ForegroundColor Yellow
python agent.py start
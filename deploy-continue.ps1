# Taekwondo Application - Deployment Continuation (From Step 9)
# Use this when Steps 1-8 are already complete on your VPS

param(
    [Parameter(Mandatory=$false)]
    [string]$VpsIp,
    
    [Parameter(Mandatory=$false)]
    [string]$SshUser = "deploy",
    
    [Parameter(Mandatory=$false)]
    [string]$SshKeyPath
)

# Colors for output
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n================================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "================================================`n" -ForegroundColor Blue
}

# Main script
Write-Header "TAEKWONDO - DEPLOYMENT CONTINUATION (FROM STEP 9)"

Write-Info "This script continues deployment from Step 9 (Backend Setup)."
Write-Info "Use this when Steps 1-8 (system setup) are already complete."
Write-Host ""

# Check if we have SSH
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "SSH not found. Please install OpenSSH client."
    exit 1
}

# Get VPS IP if not provided
if (-not $VpsIp) {
    $VpsIp = Read-Host "Enter your VPS IP address"
}

# Construct SSH command
$sshCommand = "ssh"
if ($SshKeyPath) {
    $sshCommand += " -i `"$SshKeyPath`""
}
$sshCommand += " $SshUser@$VpsIp"

Write-Info "Testing SSH connection to $VpsIp..."

# Test SSH connection
$testConnection = Invoke-Expression "$sshCommand 'echo Connection OK'" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Cannot connect to VPS via SSH"
    exit 1
}

Write-Success "SSH connection successful"

# Upload continuation script
Write-Header "UPLOADING CONTINUATION SCRIPT"

$scriptPath = Join-Path $PSScriptRoot "deploy-continue.sh"
if (-not (Test-Path $scriptPath)) {
    Write-ErrorMsg "deploy-continue.sh not found in current directory"
    exit 1
}

Write-Info "Uploading deploy-continue.sh to VPS..."

$scpCommand = "scp"
if ($SshKeyPath) {
    $scpCommand += " -i `"$SshKeyPath`""
}
$scpCommand += " `"$scriptPath`" $SshUser@${VpsIp}:/tmp/deploy-continue.sh"

Invoke-Expression $scpCommand
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Failed to upload continuation script"
    exit 1
}

Write-Success "Continuation script uploaded"

# Execute continuation script on VPS
Write-Header "RUNNING DEPLOYMENT (STEPS 9-12)"

Write-Warning "The script will now:"
Write-Info "  Step 9:  Setup backend (install deps, build)"
Write-Info "  Step 10: Setup frontend (install deps, build)"
Write-Info "  Step 11: Start backend with PM2"
Write-Info "  Step 12: Configure Nginx"
Write-Host ""
Write-Info "Press Enter to continue or Ctrl+C to cancel..."
Read-Host

# Execute continuation script on VPS
Invoke-Expression "$sshCommand 'chmod +x /tmp/deploy-continue.sh && sudo /tmp/deploy-continue.sh'"

if ($LASTEXITCODE -eq 0) {
    Write-Success "Deployment completed successfully!"
    Write-Info "`nYour application should now be running at:"
    Write-Host "  Frontend: http://$VpsIp" -ForegroundColor Green
    Write-Host "  Backend API: http://$VpsIp:5000" -ForegroundColor Green
} else {
    Write-ErrorMsg "Deployment encountered errors. Please check the output above."
}

Write-Info "`nTo check application status, run:"
Write-Host "  ssh $SshUser@$VpsIp" -ForegroundColor Yellow
Write-Host "  pm2 status" -ForegroundColor Yellow
Write-Host "  pm2 logs taekwondo-backend" -ForegroundColor Yellow

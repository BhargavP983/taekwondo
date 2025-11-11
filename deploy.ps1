# Taekwondo Application - Windows PowerShell Deployment Script
# This script uploads the deployment script to VPS and executes it

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
Write-Header "TAEKWONDO APPLICATION - VPS DEPLOYMENT FROM WINDOWS"

# Check if we have SSH
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "SSH not found. Please install OpenSSH client:"
    Write-Info "Settings > Apps > Optional Features > Add OpenSSH Client"
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
    Write-Info "Please ensure:"
    Write-Info "  1. VPS IP address is correct"
    Write-Info "  2. SSH key is configured (if using key authentication)"
    Write-Info "  3. User '$SshUser' exists on the VPS"
    exit 1
}

Write-Success "SSH connection successful"

# Upload deployment script
Write-Header "STEP 1: Uploading Deployment Script"

$scriptPath = Join-Path $PSScriptRoot "deploy.sh"
if (-not (Test-Path $scriptPath)) {
    Write-ErrorMsg "deploy.sh not found in current directory"
    exit 1
}

Write-Info "Uploading deploy.sh to VPS..."

$scpCommand = "scp"
if ($SshKeyPath) {
    $scpCommand += " -i `"$SshKeyPath`""
}
$scpCommand += " `"$scriptPath`" $SshUser@${VpsIp}:/tmp/deploy.sh"

Invoke-Expression $scpCommand
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Failed to upload deployment script"
    exit 1
}

Write-Success "Deployment script uploaded"

# Make script executable and run it
Write-Header "STEP 2: Running Deployment on VPS"

Write-Warning "The deployment script will now run on your VPS."
Write-Warning "You may be prompted for passwords and configuration details."
Write-Info "Press Enter to continue or Ctrl+C to cancel..."
Read-Host

# Execute deployment script on VPS
Invoke-Expression "$sshCommand 'chmod +x /tmp/deploy.sh && sudo /tmp/deploy.sh'"

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

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

Write-Host "Testing SSH connection to $VpsIp..." -ForegroundColor Cyan

# Test SSH connection
$testConnection = Invoke-Expression "$sshCommand 'echo Connection OK'" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Cannot connect to VPS via SSH" -ForegroundColor Red
    Write-Host "Please ensure:" -ForegroundColor Cyan
    Write-Host "  1. VPS IP address is correct" -ForegroundColor Cyan
    Write-Host "  2. SSH key is configured (if using key authentication)" -ForegroundColor Cyan
    Write-Host "  3. User '$SshUser' exists on the VPS" -ForegroundColor Cyan
    exit 1
}

Write-Host "SSH connection successful" -ForegroundColor Green

# Upload deployment script
Write-Header "STEP 1: Uploading Deployment Script"

$scriptPath = Join-Path $PSScriptRoot "deploy.sh"
if (-not (Test-Path $scriptPath)) {
    Write-Host "deploy.sh not found in current directory" -ForegroundColor Red
    exit 1
}

Write-Host "Uploading deploy.sh to VPS..." -ForegroundColor Cyan

$scpCommand = "scp"
if ($SshKeyPath) {
    $scpCommand += " -i `"$SshKeyPath`""
}
$scpCommand += " `"$scriptPath`" $SshUser@${VpsIp}:/tmp/deploy.sh"

Invoke-Expression $scpCommand
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to upload deployment script" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment script uploaded" -ForegroundColor Green

# Make script executable and run it
Write-Header "STEP 2: Running Deployment on VPS"

Write-Host "The deployment script will now run on your VPS." -ForegroundColor Yellow
Write-Host "You may be prompted for passwords and configuration details." -ForegroundColor Yellow
Write-Host "Press Enter to continue or Ctrl+C to cancel..." -ForegroundColor Cyan
Read-Host

# Execute deployment script on VPS
Invoke-Expression "$sshCommand 'chmod +x /tmp/deploy.sh && sudo /tmp/deploy.sh'"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "`nYour application should now be running at:" -ForegroundColor Cyan
    Write-Host "  Frontend: http://$VpsIp" -ForegroundColor Green
    Write-Host "  Backend API: http://$VpsIp:5000" -ForegroundColor Green
} else {
    Write-Host "Deployment encountered errors. Please check the output above." -ForegroundColor Red
}

Write-Host "`nTo check application status, run:" -ForegroundColor Cyan
Write-Host "  ssh $SshUser@$VpsIp" -ForegroundColor Yellow
Write-Host "  pm2 status" -ForegroundColor Yellow
Write-Host "  pm2 logs taekwondo-backend" -ForegroundColor Yellow

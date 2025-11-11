# Verify and Transfer Files to VPS
# Use this to ensure all files are on your VPS before deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIp,
    
    [Parameter(Mandatory=$false)]
    [string]$SshUser = "deploy",
    
    [Parameter(Mandatory=$false)]
    [string]$SshKeyPath
)

Write-Host "`n=== File Transfer Verification ===" -ForegroundColor Blue
Write-Host "VPS IP: $VpsIp" -ForegroundColor Cyan
Write-Host "SSH User: $SshUser`n" -ForegroundColor Cyan

# Check if files are committed to git
Write-Host "Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "Uncommitted changes detected:" -ForegroundColor Red
    git status --short
    Write-Host "`nCommit and push changes first:" -ForegroundColor Yellow
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'Update files'" -ForegroundColor White
    Write-Host "  git push origin main" -ForegroundColor White
    $continue = Read-Host "`nContinue anyway? (y/N)"
    if ($continue -ne 'y') {
        exit 0
    }
}

# Construct SSH command
$sshCmd = "ssh"
if ($SshKeyPath) {
    $sshCmd += " -i `"$SshKeyPath`""
}
$sshCmd += " $SshUser@$VpsIp"

Write-Host "`nChecking if app directory exists on VPS..." -ForegroundColor Yellow
$checkDir = Invoke-Expression "$sshCmd 'test -d /home/$SshUser/apps/-taekwondo && echo EXISTS || echo MISSING'" 2>&1

if ($checkDir -match "EXISTS") {
    Write-Host "✓ App directory exists" -ForegroundColor Green
    
    Write-Host "`nPulling latest changes from git..." -ForegroundColor Yellow
    Invoke-Expression "$sshCmd 'cd /home/$SshUser/apps/-taekwondo && git pull origin main'"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Git pull successful" -ForegroundColor Green
    } else {
        Write-Host "✗ Git pull failed" -ForegroundColor Red
        Write-Host "`nTry these commands on your VPS:" -ForegroundColor Yellow
        Write-Host "  cd /home/$SshUser/apps/-taekwondo" -ForegroundColor White
        Write-Host "  git stash  # Save local changes" -ForegroundColor White
        Write-Host "  git pull origin main" -ForegroundColor White
        exit 1
    }
    
    Write-Host "`nVerifying critical files on VPS..." -ForegroundColor Yellow
    
    $criticalFiles = @(
        "frontend/pages/dashboards/CadetApplications.tsx",
        "frontend/pages/dashboards/PoomsaeApplications.tsx",
        "frontend/pages/dashboards/CertificatesList.tsx",
        "frontend/App.tsx",
        "backend/src/server.ts",
        "backend/ecosystem.config.json"
    )
    
    $allFilesExist = $true
    foreach ($file in $criticalFiles) {
        $checkFile = Invoke-Expression "$sshCmd 'test -f /home/$SshUser/apps/-taekwondo/$file && echo EXISTS || echo MISSING'" 2>&1
        
        if ($checkFile -match "EXISTS") {
            Write-Host "  ✓ $file" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $file" -ForegroundColor Red
            $allFilesExist = $false
        }
    }
    
    if ($allFilesExist) {
        Write-Host "`n✓ All critical files verified!" -ForegroundColor Green
        Write-Host "`nYou can now run:" -ForegroundColor Cyan
        Write-Host "  .\deploy-continue.ps1 -VpsIp $VpsIp" -ForegroundColor White
    } else {
        Write-Host "`n✗ Some files are missing!" -ForegroundColor Red
        Write-Host "`nTo fix:" -ForegroundColor Yellow
        Write-Host "1. Ensure files are committed locally:" -ForegroundColor White
        Write-Host "   git add ." -ForegroundColor White
        Write-Host "   git commit -m 'Add missing files'" -ForegroundColor White
        Write-Host "   git push origin main" -ForegroundColor White
        Write-Host "2. Pull on VPS:" -ForegroundColor White
        Write-Host "   ssh $SshUser@$VpsIp" -ForegroundColor White
        Write-Host "   cd /home/$SshUser/apps/-taekwondo && git pull origin main" -ForegroundColor White
    }
    
} else {
    Write-Host "✗ App directory doesn't exist on VPS" -ForegroundColor Red
    Write-Host "`nClone the repository first:" -ForegroundColor Yellow
    Write-Host "  ssh $SshUser@$VpsIp" -ForegroundColor White
    Write-Host "  mkdir -p /home/$SshUser/apps" -ForegroundColor White
    Write-Host "  cd /home/$SshUser/apps" -ForegroundColor White
    Write-Host "  git clone https://github.com/BhargavP983/-taekwondo.git" -ForegroundColor White
    Write-Host "`nOr run the full deployment:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 -VpsIp $VpsIp" -ForegroundColor White
}

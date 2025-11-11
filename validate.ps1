# Pre-Deployment Validation Script
# Run this on Windows to validate your project before deploying to VPS

param(
    [switch]$SkipBuild,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$script:passedChecks = 0
$script:failedChecks = 0
$script:warnings = 0

function Write-Check {
    param([string]$Message, [string]$Status)
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    switch ($Status) {
        "PASS" {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "✓" -NoNewline -ForegroundColor Green
            Write-Host " $Message" -ForegroundColor White
            $script:passedChecks++
        }
        "FAIL" {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "✗" -NoNewline -ForegroundColor Red
            Write-Host " $Message" -ForegroundColor White
            $script:failedChecks++
        }
        "WARN" {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "⚠" -NoNewline -ForegroundColor Yellow
            Write-Host " $Message" -ForegroundColor White
            $script:warnings++
        }
        "INFO" {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "ℹ" -NoNewline -ForegroundColor Cyan
            Write-Host " $Message" -ForegroundColor White
        }
    }
}

function Write-Section {
    param([string]$Title)
    Write-Host "`n================================================" -ForegroundColor Blue
    Write-Host $Title -ForegroundColor Blue
    Write-Host "================================================" -ForegroundColor Blue
}

# Start validation
Clear-Host
Write-Section "PRE-DEPLOYMENT VALIDATION"
Write-Host "Validating project before VPS deployment...`n" -ForegroundColor Cyan

# Check 1: Node.js version
Write-Section "1. NODE.JS ENVIRONMENT"
try {
    $nodeVersion = node --version
    $nodeMajorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeMajorVersion -ge 18) {
        Write-Check "Node.js version $nodeVersion (>= v18 required)" "PASS"
    } else {
        Write-Check "Node.js version $nodeVersion (< v18 - upgrade recommended)" "WARN"
    }
} catch {
    Write-Check "Node.js not found or not in PATH" "FAIL"
}

try {
    $npmVersion = npm --version
    Write-Check "npm version $npmVersion" "PASS"
} catch {
    Write-Check "npm not found or not in PATH" "FAIL"
}

# Check 2: Git status
Write-Section "2. GIT REPOSITORY"
try {
    $gitBranch = git rev-parse --abbrev-ref HEAD 2>$null
    if ($gitBranch) {
        Write-Check "Current branch: $gitBranch" "PASS"
        
        # Check for uncommitted changes
        $gitStatus = git status --porcelain 2>$null
        if ($gitStatus) {
            Write-Check "Uncommitted changes detected" "WARN"
            if ($Verbose) {
                Write-Host "  Modified files:" -ForegroundColor Yellow
                $gitStatus | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
            }
        } else {
            Write-Check "No uncommitted changes" "PASS"
        }
        
        # Check if remote exists
        $gitRemote = git remote get-url origin 2>$null
        if ($gitRemote) {
            Write-Check "Git remote configured: $gitRemote" "PASS"
        } else {
            Write-Check "No git remote configured" "WARN"
        }
    } else {
        Write-Check "Not a git repository" "WARN"
    }
} catch {
    Write-Check "Git not found or not in PATH" "WARN"
}

# Check 3: Backend structure
Write-Section "3. BACKEND STRUCTURE"

$backendPath = "backend"
if (Test-Path $backendPath) {
    Write-Check "Backend directory exists" "PASS"
    
    # Check package.json
    $packageJson = Join-Path $backendPath "package.json"
    if (Test-Path $packageJson) {
        Write-Check "package.json exists" "PASS"
        
        $pkg = Get-Content $packageJson | ConvertFrom-Json
        
        # Check for required scripts
        if ($pkg.scripts.build) {
            Write-Check "Build script defined: $($pkg.scripts.build)" "PASS"
        } else {
            Write-Check "Build script missing in package.json" "FAIL"
        }
        
        if ($pkg.scripts.start) {
            Write-Check "Start script defined: $($pkg.scripts.start)" "PASS"
        } else {
            Write-Check "Start script missing in package.json" "FAIL"
        }
    } else {
        Write-Check "package.json not found" "FAIL"
    }
    
    # Check .env.example
    $envExample = Join-Path $backendPath ".env.example"
    if (Test-Path $envExample) {
        Write-Check ".env.example exists" "PASS"
        
        $envContent = Get-Content $envExample -Raw
        
        # Check for critical variables
        $requiredVars = @("NODE_ENV", "PORT", "MONGODB_URI", "JWT_SECRET", "TEMPLATE_PATH", "UPLOAD_DIR")
        foreach ($var in $requiredVars) {
            if ($envContent -match $var) {
                Write-Check "$var defined in .env.example" "PASS"
            } else {
                Write-Check "$var missing in .env.example" "FAIL"
            }
        }
    } else {
        Write-Check ".env.example not found" "WARN"
    }
    
    # Check templates directory
    $templatesDir = Join-Path $backendPath "src\templates"
    if (Test-Path $templatesDir) {
        Write-Check "Templates directory exists" "PASS"
        
        $templateFiles = Get-ChildItem $templatesDir -File
        if ($templateFiles.Count -gt 0) {
            Write-Check "Found $($templateFiles.Count) template file(s)" "PASS"
        } else {
            Write-Check "Templates directory is empty" "WARN"
        }
    } else {
        Write-Check "Templates directory not found" "FAIL"
    }
    
    # Check ecosystem.config.json
    $ecosystemConfig = Join-Path $backendPath "ecosystem.config.json"
    if (Test-Path $ecosystemConfig) {
        Write-Check "ecosystem.config.json exists (PM2 config)" "PASS"
    } else {
        Write-Check "ecosystem.config.json not found" "WARN"
    }
    
    # Check if node_modules exists
    $nodeModules = Join-Path $backendPath "node_modules"
    if (Test-Path $nodeModules) {
        Write-Check "node_modules exists" "PASS"
    } else {
        Write-Check "node_modules not found - run npm install" "WARN"
    }
    
} else {
    Write-Check "Backend directory not found" "FAIL"
}

# Check 4: Frontend structure
Write-Section "4. FRONTEND STRUCTURE"

$frontendPath = "frontend"
if (Test-Path $frontendPath) {
    Write-Check "Frontend directory exists" "PASS"
    
    # Check package.json
    $packageJson = Join-Path $frontendPath "package.json"
    if (Test-Path $packageJson) {
        Write-Check "package.json exists" "PASS"
        
        $pkg = Get-Content $packageJson | ConvertFrom-Json
        
        # Check for required scripts
        if ($pkg.scripts.build) {
            Write-Check "Build script defined: $($pkg.scripts.build)" "PASS"
        } else {
            Write-Check "Build script missing in package.json" "FAIL"
        }
    } else {
        Write-Check "package.json not found" "FAIL"
    }
    
    # Check critical files
    $criticalFiles = @(
        "App.tsx",
        "pages\dashboards\CadetApplications.tsx",
        "pages\dashboards\PoomsaeApplications.tsx",
        "pages\dashboards\CertificatesList.tsx"
    )
    
    foreach ($file in $criticalFiles) {
        $filePath = Join-Path $frontendPath $file
        if (Test-Path $filePath) {
            Write-Check "$file exists" "PASS"
        } else {
            Write-Check "$file not found" "FAIL"
        }
    }
    
    # Check if node_modules exists
    $nodeModules = Join-Path $frontendPath "node_modules"
    if (Test-Path $nodeModules) {
        Write-Check "node_modules exists" "PASS"
    } else {
        Write-Check "node_modules not found - run npm install" "WARN"
    }
    
} else {
    Write-Check "Frontend directory not found" "FAIL"
}

# Check 5: Deployment scripts
Write-Section "5. DEPLOYMENT SCRIPTS"

$deployScripts = @{
    "deploy.sh" = "Linux deployment script"
    "deploy.ps1" = "Windows deployment launcher"
    "AUTOMATED_DEPLOYMENT.md" = "Automated deployment guide"
    "UBUNTU_VPS_DEPLOYMENT.md" = "Manual deployment guide"
    "DEPLOYMENT_QUICK_REFERENCE.md" = "Quick reference card"
}

foreach ($script in $deployScripts.Keys) {
    if (Test-Path $script) {
        Write-Check "$script exists - $($deployScripts[$script])" "PASS"
    } else {
        Write-Check "$script not found" "WARN"
    }
}

# Check 6: Build tests (if not skipped)
if (-not $SkipBuild) {
    Write-Section "6. BUILD TESTS"
    
    # Test backend build
    Write-Check "Testing backend build..." "INFO"
    Push-Location $backendPath
    try {
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Check "Backend builds successfully" "PASS"
            
            # Check if dist folder was created
            if (Test-Path "dist") {
                Write-Check "dist/ directory created" "PASS"
            } else {
                Write-Check "dist/ directory not created" "FAIL"
            }
        } else {
            Write-Check "Backend build failed" "FAIL"
            if ($Verbose) {
                Write-Host "  Build output:" -ForegroundColor Red
                $buildOutput | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
            }
        }
    } catch {
        Write-Check "Error during backend build: $_" "FAIL"
    }
    Pop-Location
    
    # Test frontend build
    Write-Check "Testing frontend build..." "INFO"
    Push-Location $frontendPath
    try {
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Check "Frontend builds successfully" "PASS"
            
            # Check if dist folder was created
            if (Test-Path "dist") {
                Write-Check "dist/ directory created" "PASS"
                
                # Check if index.html exists in dist
                if (Test-Path "dist\index.html") {
                    Write-Check "dist/index.html exists" "PASS"
                } else {
                    Write-Check "dist/index.html not found" "FAIL"
                }
            } else {
                Write-Check "dist/ directory not created" "FAIL"
            }
        } else {
            Write-Check "Frontend build failed" "FAIL"
            if ($Verbose) {
                Write-Host "  Build output:" -ForegroundColor Red
                $buildOutput | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
            }
        }
    } catch {
        Write-Check "Error during frontend build: $_" "FAIL"
    }
    Pop-Location
} else {
    Write-Check "Build tests skipped (-SkipBuild flag)" "INFO"
}

# Summary
Write-Section "VALIDATION SUMMARY"

$total = $script:passedChecks + $script:failedChecks + $script:warnings

Write-Host "`nResults:" -ForegroundColor White
Write-Host "  Passed: $($script:passedChecks)" -ForegroundColor Green
Write-Host "  Failed: $($script:failedChecks)" -ForegroundColor Red
Write-Host "  Warnings: $($script:warnings)" -ForegroundColor Yellow
Write-Host "  Total Checks: $total`n" -ForegroundColor Gray

if ($script:failedChecks -eq 0 -and $script:warnings -eq 0) {
    Write-Host "All checks passed! Your project is ready for deployment." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Commit and push changes: git push origin main" -ForegroundColor White
    Write-Host "  2. Run deployment: .\deploy.ps1" -ForegroundColor White
    exit 0
} elseif ($script:failedChecks -eq 0) {
    Write-Host "All critical checks passed, but there are warnings." -ForegroundColor Yellow
    Write-Host "Review warnings above and fix if necessary." -ForegroundColor Yellow
    Write-Host "`nYou can proceed with deployment, but address warnings for best results." -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "Validation failed! Fix the errors above before deploying." -ForegroundColor Red
    Write-Host "`nCommon fixes:" -ForegroundColor Cyan
    Write-Host "  - Run npm install in backend and frontend directories" -ForegroundColor White
    Write-Host "  - Ensure all required files exist" -ForegroundColor White
    Write-Host "  - Fix build errors by checking package.json scripts" -ForegroundColor White
    Write-Host "`nRun with -Verbose flag for detailed error output." -ForegroundColor Gray
    exit 1
}

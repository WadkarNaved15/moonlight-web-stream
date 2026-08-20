# ===============================
# Windows-only Build Script
# ===============================

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("production", "development")]
    [string]$Environment
)

# ===============================
# Environment configuration
# ===============================

if ($Environment -eq "production") {
    $configFile = "app-config.prod.js"
    $environmentName = "production"
}
elseif ($Environment -eq "development") {
    $configFile = "app-config.dev.js"
    $environmentName = "development"
}

Write-Host ""
Write-Host "========================================"
Write-Host "Building environment: $environmentName"
Write-Host "========================================"
Write-Host ""

# ===============================
# Resolve Cargo metadata
# ===============================

$metadataJson = cargo metadata --format-version 1 --no-deps
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to resolve Cargo metadata"
    exit 1
}

$metadata = $metadataJson | ConvertFrom-Json
$targetDir = $metadata.target_directory

# ===============================
# Output directories
# ===============================

New-Item -ItemType Directory -Force "./finalOutput" | Out-Null
$outputDir = Resolve-Path "./finalOutput"

$moonlightRoot = Resolve-Path "."
$moonlightFrontend = Join-Path $moonlightRoot "moonlight-web/web-server"

if (-not (Test-Path $moonlightFrontend)) {
    Write-Error "Frontend directory not found!"
    exit 1
}

Write-Host "Target directory: $targetDir"
Write-Host "Output directory: $outputDir"
Write-Host "Moonlight root: $moonlightRoot"

# ===============================
# Environment config
# ===============================

$configSource = Join-Path $moonlightFrontend "web\config\$configFile"

if (-not (Test-Path $configSource)) {
    Write-Error "Configuration file not found: $configSource"
    exit 1
}

Write-Host "Using config: $configSource"

# ===============================
# Windows MSVC target only
# ===============================

$target = "x86_64-pc-windows-msvc"

# ===============================
# Clean output
# ===============================

if (Test-Path "$outputDir\*") {
    Remove-Item "$outputDir\*" -Recurse -Force
}

# ===============================
# Frontend build
# ===============================

Write-Host ""
Write-Host "------------- Building Frontend -------------"

Set-Location $moonlightFrontend

# Clean previous frontend dist
if (Test-Path "$moonlightFrontend\dist") {
    Remove-Item "$moonlightFrontend\dist" -Recurse -Force
}

# Build frontend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed"
    Set-Location $moonlightRoot
    exit 1
}

# ===============================
# Copy environment config
# ===============================

Write-Host "------------- Adding Environment Config -------------"

# Make sure dist exists
if (-not (Test-Path "$moonlightFrontend\dist")) {
    Write-Error "Frontend dist directory was not created!"
    Set-Location $moonlightRoot
    exit 1
}

# Copy selected config as app-config.js
Copy-Item `
    $configSource `
    "$moonlightFrontend\dist\app-config.js" `
    -Force

Write-Host "Environment config copied:"
Write-Host "  $configSource"
Write-Host "  -> $moonlightFrontend\dist\app-config.js"

# ===============================
# Copy frontend to final output
# ===============================

New-Item -ItemType Directory "$outputDir\static" -Force | Out-Null

Copy-Item `
    "$moonlightFrontend\dist\*" `
    "$outputDir\static" `
    -Recurse `
    -Force

Write-Host "------------- Frontend Build Complete -------------"

Set-Location $moonlightRoot

# ===============================
# Backend build (MSVC)
# ===============================

Write-Host ""
Write-Host "------------- Building Backend ($target) -------------"

cargo build --release --target $target

if ($LASTEXITCODE -ne 0) {
    Write-Error "Rust build failed"
    exit 1
}

# ===============================
# Find produced binaries
# ===============================

$binDir = Join-Path $targetDir "$target\release"
$binaries = Get-ChildItem $binDir -Filter "*.exe"

if ($binaries.Count -eq 0) {
    Write-Error "No executables found in $binDir"
    exit 1
}

$binaries | ForEach-Object {
    Write-Host "Binary: $($_.FullName)"
}

# ===============================
# Packaging
# ===============================

Write-Host ""
Write-Host "------------- Packaging -------------"

$archiveName = "$outputDir\moonlight-web-$environmentName-$target.zip"

$itemsToZip = @(
    $binaries.FullName
    "$outputDir\static"
)

7z a -tzip $archiveName $itemsToZip -y | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create ZIP"
    exit 1
}

Write-Host ""
Write-Host "Created ZIP:"
Write-Host "$archiveName"

# ===============================
# Cleanup
# ===============================

Remove-Item "$outputDir\static" -Recurse -Force

Write-Host ""
Write-Host "========================================"
Write-Host "Build Finished Successfully"
Write-Host "Environment: $environmentName"
Write-Host "========================================"
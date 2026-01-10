# ===============================
# Windows-only Build Script
# ===============================

# Resolve Cargo metadata
$metadataJson = cargo metadata --format-version 1 --no-deps
$metadata = $metadataJson | ConvertFrom-Json
$targetDir = $metadata.target_directory

# Output directories
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

# Windows MSVC target only
$target = "x86_64-pc-windows-msvc"

# Clean output
if (Test-Path "$outputDir\*") {
    Remove-Item "$outputDir\*" -Recurse -Force
}

# ===============================
# Frontend build
# ===============================
Write-Host "------------- Building Frontend -------------"

Set-Location $moonlightFrontend

New-Item -ItemType Directory "$outputDir\static" -Force | Out-Null

if (Test-Path "$moonlightFrontend\dist") {
    Remove-Item "$moonlightFrontend\dist" -Recurse -Force
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed"
    exit 1
}

Copy-Item "$moonlightFrontend\dist\*" "$outputDir\static" -Recurse -Force

Write-Host "------------- Frontend Build Complete -------------"

Set-Location $moonlightRoot

# ===============================
# Backend build (MSVC)
# ===============================
Write-Host "------------- Building Backend ($target) -------------"

cargo build --release --target $target
if ($LASTEXITCODE -ne 0) {
    Write-Error "Rust build failed"
    exit 1
}

# Find produced binaries
$binDir = Join-Path $targetDir "$target\release"
$binaries = Get-ChildItem $binDir -Filter "*.exe"

if ($binaries.Count -eq 0) {
    Write-Error "No executables found in $binDir"
    exit 1
}

$binaries | ForEach-Object { Write-Host "Binary: $($_.FullName)" }

# ===============================
# Packaging
# ===============================
Write-Host "------------- Packaging -------------"

$archiveName = "$outputDir\moonlight-web-$target.zip"
$itemsToZip = @($binaries.FullName, "$outputDir\static")

7z a -tzip $archiveName $itemsToZip -y | Out-Null

Write-Host "Created ZIP: $archiveName"

# Cleanup
Remove-Item "$outputDir\static" -Recurse -Force

Write-Host "------------- Build Finished Successfully -------------"

# Pack context for AI ingestion
# This script uses Repomix to bundle the codebase into a single file.

$ExecutionPolicy = Get-ExecutionPolicy
if ($ExecutionPolicy -ne "Bypass") {
    Write-Host "[!] Setting ExecutionPolicy to Bypass for this session..." -ForegroundColor Yellow
}

npx repomix --config repomix.config.json

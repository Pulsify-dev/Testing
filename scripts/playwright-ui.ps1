param(
    [ValidateSet("all", "module1")]
    [string]$Scope = "all",
    [string]$BaseUrl = "https://pulsify.page"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$env:BASE_URL = $BaseUrl

Write-Host "Playwright UI launcher" -ForegroundColor Cyan
Write-Host "Repo root: $repoRoot"
Write-Host "BASE_URL : $env:BASE_URL"
Write-Host "Scope    : $Scope"

if ($Scope -eq "module1") {
    npx playwright test --ui e2e/modules/module-01-auth --project=chromium
}
else {
    npx playwright test --ui
}

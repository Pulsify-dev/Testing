param(
    [string]$BaseUrl = "https://pulsify.page",
    [string]$EmailPrefix = "qa.module1"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$env:BASE_URL = $BaseUrl
$env:RUN_LIVE_REGISTRATION = "true"
$env:TEST_REGISTRATION_EMAIL_PREFIX = $EmailPrefix

$pwArgs = @(
    "playwright",
    "test",
    "e2e/modules/module-01-auth/verification/TC04-live-registration-check-email.spec.js",
    "--project=chromium",
    "--workers=1",
    "--timeout=240000",
    "--headed"
)

Write-Host "Running TC-M1-V04 live registration test..."
Write-Host "BASE_URL=$($env:BASE_URL)"
Write-Host "RUN_LIVE_REGISTRATION=$($env:RUN_LIVE_REGISTRATION)"
Write-Host "TEST_REGISTRATION_EMAIL_PREFIX=$($env:TEST_REGISTRATION_EMAIL_PREFIX)"
Write-Host "Complete CAPTCHA manually in the browser window when prompted, then submit."

& npx @pwArgs
exit $LASTEXITCODE

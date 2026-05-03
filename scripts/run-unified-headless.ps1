param(
    [string]$BaseUrl = "https://pulsify.page",
    [string]$Email = "Mohamedtest@test.com",     # Update this with your actual test email for the TA
    [string]$Password = "password123",            # Update this with your actual test password
    [string]$TrackId = "69d67db1f279d83706cfbda8",
    [string]$TrackUrl = "https://soundcloud.com/forss/flickermood",  # kept for SoundCloud benchmark compat
    [string]$AdminEmail = "Admin@test.com",
    [string]$AdminPassword = "12345678"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Pulsify Environment Variables (Modules 1-12)
$env:BASE_URL              = $BaseUrl
$env:TEST_USER_EMAIL       = $Email
$env:TEST_USER_PASSWORD    = $Password
$env:TEST_TRACK_ID         = $TrackId
$env:ADMIN_USER_EMAIL      = $AdminEmail
$env:ADMIN_USER_PASSWORD   = $AdminPassword
$env:RUN_LIVE_REGISTRATION = "true"

# SoundCloud benchmark env (kept for historical benchmark suite)
$env:SOUNDCLOUD_TRACK_URL = $TrackUrl

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   PULSIFY E2E - MODULES 1-12 (HEADLESS)        " -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  App URL    : $env:BASE_URL" -ForegroundColor White
Write-Host "  Test User  : $env:TEST_USER_EMAIL" -ForegroundColor White
Write-Host "  Test Track : /tracks/$env:TEST_TRACK_ID" -ForegroundColor White
Write-Host "  Modules    : M1 Auth · M2 Profile · M3 Social · M4 Tracks" -ForegroundColor Gray
Write-Host "               M5 Playback · M6 Engagement · M7 Playlists" -ForegroundColor Gray
Write-Host "               M8 Discovery · M9 Messaging · M10 Notifications" -ForegroundColor Gray
Write-Host "               M11 Moderation · M12 Premium" -ForegroundColor Gray
Write-Host "-------------------------------------------------" -ForegroundColor DarkGray

# Launch Playwright — all 12 modules on Pulsify
npx playwright test e2e/modules/module-01-auth e2e/modules/module-02-profile e2e/modules/module-03-social e2e/modules/module-04-tracks e2e/modules/module-05-playback e2e/modules/module-06-engagement e2e/modules/module-07-playlists e2e/modules/module-08-discovery e2e/modules/module-09-messaging e2e/modules/module-10-notifications e2e/modules/module-11-moderation e2e/modules/module-12-premium --config=playwright.config.js --project=chromium

exit $LASTEXITCODE

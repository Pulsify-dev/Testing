param(
    [string]$TrackUrl = "https://soundcloud.com/forss/flickermood"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$env:SOUNDCLOUD_TRACK_URL = $TrackUrl

Write-Host "Running SoundCloud benchmark for modules 4-6..."
Write-Host "SOUNDCLOUD_TRACK_URL=$($env:SOUNDCLOUD_TRACK_URL)"

npx playwright test e2e/benchmark/soundcloud --project=chromium --workers=1 --headed
exit $LASTEXITCODE

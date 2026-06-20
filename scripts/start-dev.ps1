param(
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$nextCli = Join-Path $projectRoot "node_modules\next\dist\bin\next"

Set-Location -LiteralPath $projectRoot

# Close only stale Next.js processes launched from this exact project.
$escapedRoot = [Regex]::Escape($projectRoot)
$staleProcesses = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "node.exe" -and
  $_.CommandLine -match $escapedRoot -and
  ($_.CommandLine -match "next[\\/]dist" -or $_.CommandLine -match "[\\/]next[\\/]dist[\\/]server")
}

if ($staleProcesses) {
  Write-Host "Closing the previous Ourside development server..." -ForegroundColor DarkGray
  Stop-Process -Id $staleProcesses.ProcessId -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 800
}

& (Join-Path $PSScriptRoot "clean-next.ps1")

if (-not (Test-Path -LiteralPath $nextCli)) {
  throw "Next.js is not installed. Run npm install first."
}

Write-Host "Starting Ourside at http://localhost:$Port" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor DarkGray

$warmupJob = Start-Job -ArgumentList $Port -ScriptBlock {
  param($TargetPort)
  Start-Sleep -Seconds 4
  foreach ($route in @("/", "/login", "/signup", "/join")) {
    try {
      Invoke-WebRequest -Uri "http://127.0.0.1:$TargetPort$route" -UseBasicParsing -TimeoutSec 30 | Out-Null
    } catch { }
  }
}

try {
  & node $nextCli dev --turbopack -p $Port
} finally {
  Stop-Job -Job $warmupJob -ErrorAction SilentlyContinue
  Remove-Job -Job $warmupJob -Force -ErrorAction SilentlyContinue
}
exit $LASTEXITCODE

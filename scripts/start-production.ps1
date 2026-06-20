param([int]$Port = 3000)

$ErrorActionPreference = "Stop"
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
Set-Location -LiteralPath $projectRoot

$escapedRoot = [Regex]::Escape($projectRoot)
$staleProcesses = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "node.exe" -and $_.CommandLine -match $escapedRoot -and $_.CommandLine -match "next[\\/]dist"
}
if ($staleProcesses) { Stop-Process -Id $staleProcesses.ProcessId -Force -ErrorAction SilentlyContinue }

& (Join-Path $PSScriptRoot "clean-next.ps1")
& npm run build
if ($LASTEXITCODE -ne 0) { throw "Production build failed." }

Write-Host "Starting the fast Ourside preview at http://localhost:$Port" -ForegroundColor Green
$nextCli = Join-Path $projectRoot "node_modules\next\dist\bin\next"
& node $nextCli start -p $Port
exit $LASTEXITCODE


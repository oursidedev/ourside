$ErrorActionPreference = "Stop"

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$cachePath = [IO.Path]::GetFullPath((Join-Path $projectRoot ".next"))

if (-not $cachePath.StartsWith($projectRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Unsafe Next.js cache path: $cachePath"
}

if (Test-Path -LiteralPath $cachePath) {
  Write-Host "Cleaning OneDrive-affected Next.js cache..." -ForegroundColor DarkGray
  Remove-Item -LiteralPath $cachePath -Recurse -Force
}

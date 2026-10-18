param([int]$Port=4190,[string]$SitePath)
$ErrorActionPreference='Stop'
$repo=Split-Path -Parent $PSScriptRoot
if(-not $SitePath){
  $mainSha=(& git -C $repo rev-parse origin/main).Trim()
  if($LASTEXITCODE -ne 0){throw 'Cannot resolve origin/main.'}
  $records=(& git -C $repo worktree list --porcelain) -join "`n"
  foreach($record in ($records -split "`n`n")){
    if($record -match ('(?m)^HEAD '+[regex]::Escape($mainSha)+'$')){
      $SitePath=([regex]::Match($record,'(?m)^worktree (.+)$')).Groups[1].Value
      break
    }
  }
  if(-not $SitePath){throw 'No checkout of origin/main found. Supply -SitePath with a clean main checkout; do not overwrite the original working index.html.'}
}
$SitePath=(Resolve-Path -LiteralPath $SitePath).Path
if(-not (Test-Path -LiteralPath (Join-Path $SitePath 'index.html'))){throw 'SitePath does not contain index.html.'}
Write-Host "Read-only homepage source: $SitePath"
$env:PYTHONIOENCODING='utf-8'
& python -u (Join-Path $repo 'prototype/experiments/nav/serve.py') --site $SitePath --port $Port
exit $LASTEXITCODE

$tools = Get-Content 'D:\Projects\xtoolbox\toolsList.json' | ConvertFrom-Json
$pending = $tools | Where-Object { -not $_.status -and $_.category -eq 'pdf' }
$pending | ForEach-Object { $_.id }
Write-Host ""
Write-Host "PDF Tools to build: $($pending.Count)"
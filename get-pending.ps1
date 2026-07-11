$tools = Get-Content 'D:\Projects\xtoolbox\toolsList.json' | ConvertFrom-Json
$pending = $tools | Where-Object { ($_.status -eq $null -or $_.status -eq '') -and $_.category -eq 'pdf' }
$pending | ForEach-Object { $_.id }
Write-Host ""
Write-Host "PDF Tools to build: $($pending.Count)"
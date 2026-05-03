$tools = Get-Content 'D:\Projects\xtoolbox\toolsList.json' | ConvertFrom-Json
$done = $tools | Where-Object { $_.status -eq 'done' }
$pending = $tools | Where-Object { -not $_.status }
Write-Host "Total:" $tools.Count
Write-Host "Done:" $done.Count
Write-Host "Pending:" $pending.Count
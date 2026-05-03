# Read tool IDs from tools.json
$jsonContent = Get-Content src/data/tools.json -Raw
$jsonIds = [regex]::Matches($jsonContent, '"id":\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

# Read implemented tool filenames (excluding utils.js)
$implemented = Get-ChildItem -Path src/tools -Recurse -Filter "*.js" | 
    Where-Object { $_.Name -notlike "*-utils.js" } | 
    ForEach-Object { $_.BaseName } | 
    Sort-Object -Unique

# Find unbuilt tools
$unbuilt = $jsonIds | Where-Object { $implemented -notcontains $_ }

Write-Host "Total in tools.json: $($jsonIds.Count)"
Write-Host "Total implemented: $($implemented.Count)"
Write-Host ""
Write-Host "UNBUILT TOOLS (in tools.json but not implemented):"
$unbuilt | ForEach-Object { Write-Host "  - $_" }

Write-Host ""
Write-Host "Note: utils files and some helpers are not counted"
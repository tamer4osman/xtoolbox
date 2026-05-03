$tools = Get-Content 'D:\Projects\xtoolbox\toolsList.json' | ConvertFrom-Json
$pdfTools = $tools | Where-Object { $_.category -eq 'pdf' }
$pdfTools | ForEach-Object { $_.id }
Write-Host ""
Write-Host "Total PDF tools:" $pdfTools.Count
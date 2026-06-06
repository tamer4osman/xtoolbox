$tools = Get-Content 'D:\Projects\xtoolbox\toolsList.json' | ConvertFrom-Json

$pdfIds = @(
    'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-image', 'image-to-pdf',
    'rotate-pdf', 'watermark-pdf', 'page-numbers-pdf', 'unlock-pdf', 'protect-pdf',
    'fill-pdf-forms', 'reorder-pdf', 'crop-pdf', 'pdf-metadata-viewer',
    'pdf-password-info', 'word-to-pdf', 'excel-to-pdf', 'pdf-esign'
)

foreach ($tool in $tools) {
    if ($pdfIds -contains $tool.id) {
        $tool | Add-Member -MemberType NoteProperty -Name "status" -Value "done" -Force
    }
}

$tools | ConvertTo-Json -Depth 100 | Set-Content 'D:\Projects\xtoolbox\toolsList.json'
Write-Host "Updated" $pdfIds.Count "PDF tools with status: done"
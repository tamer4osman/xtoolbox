$tools = Get-Content 'D:\Projects\xtoolbox\toolsList.json' | ConvertFrom-Json

$imageIds = @(
    'compress-image', 'resize-image', 'convert-image', 'remove-background', 'upscale-image',
    'crop-image', 'rotate-flip-image', 'split-image', 'merge-images', 'add-text-image',
    'watermark-image', 'brightness-contrast', 'grayscale-sepia', 'remove-exif', 'view-exif', 'favicon-generator'
)

foreach ($tool in $tools) {
    if ($imageIds -contains $tool.id) {
        $tool | Add-Member -MemberType NoteProperty -Name "status" -Value "done" -Force
    }
}

$tools | ConvertTo-Json -Depth 100 | Set-Content 'D:\Projects\xtoolbox\toolsList.json'
Write-Host "Updated" $imageIds.Count "Image tools with status: done"
$html = Get-Content -Raw -Path index.html
$app = Get-Content -Raw -Path app.js

Write-Host "--- Checking getElementById ---"
$matchesId = [regex]::Matches($app, "document\.getElementById\('([^']+)'\)")
$missingCount = 0
foreach ($m in $matchesId) {
    $id = $m.Groups[1].Value
    if ($html -notmatch "id=['""]$id['""]") {
        Write-Host "Missing ID in index.html: $id" -ForegroundColor Red
        $missingCount++
    }
}

Write-Host "--- Checking querySelectorAll / querySelector ---"
$matchesQS = [regex]::Matches($app, "document\.(querySelector|querySelectorAll)\('([^']+)'\)")
foreach ($m in $matchesQS) {
    $selector = $m.Groups[2].Value
    if ($selector.StartsWith('.')) {
        $className = $selector.Substring(1)
        if ($html -notmatch "class=['""]([^'""]*\s)?$className(\s[^'""]*)?['""]") {
            Write-Host "Missing class in index.html: $selector" -ForegroundColor Red
            $missingCount++
        }
    }
}

if ($missingCount -eq 0) {
    Write-Host "All elements found!" -ForegroundColor Green
} else {
    Write-Host "Found $missingCount missing elements!" -ForegroundColor Yellow
}

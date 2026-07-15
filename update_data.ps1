$dataPath = "c:\Users\SKTelecom\.gemini\antigravity\scratch\philosophy-discussion-web-app\data.js"
$jsonPath = "C:\Users\SKTelecom\.gemini\antigravity\brain\6ac592d3-2943-4f74-b84f-46e7e7fad091\scratch\philosophers.json"

# Load philosopher mapping safely with UTF8 encoding
$philosophers = Get-Content -Raw -Path $jsonPath -Encoding UTF8 | ConvertFrom-Json
$content = Get-Content -Raw -Path $dataPath -Encoding UTF8

# Regular expression pattern to match each philosophy block
$pattern = '(?s)\{\s*author:\s*"([^"]+)"\s*,\s*source:\s*"([^"]+)"\s*,\s*passage:\s*"([\s\S]*?)"\s*,\s*commentary:\s*"([\s\S]*?)"\s*\}'

$evaluator = {
    param($match)
    $author = $match.Groups[1].Value
    $source = $match.Groups[2].Value
    $passage = $match.Groups[3].Value
    $commentary = $match.Groups[4].Value

    # Decide concepts text
    $concepts = ""
    if ($philosophers.PSObject.Properties[$author]) {
        $concepts = $philosophers.$author
    } else {
        # Fallback dynamic logic using safe character replacements (cast to string to avoid char overload issues)
        $u201c = [string][char]0x201c
        $u201d = [string][char]0x201d
        $cleanComm = $commentary.Replace($u201c, "").Replace($u201d, "").Replace('"', "")
        
        $summary = $cleanComm
        if ($cleanComm.Length -gt 85) {
            $summary = $cleanComm.Substring(0, 85) + "..."
        }
        
        # Load fallback template segments from JSON to completely avoid PowerShell scripting encoding issue
        $prefix = $philosophers._fallback_prefix
        $mid = $philosophers._fallback_mid
        $suffix = $philosophers._fallback_suffix
        
        $concepts = "${author}${prefix}${source}${mid}${summary}${suffix}"
    }

    # Escape double quotes for JS string compliance
    $escapedConcepts = $concepts -replace '"', '\"'

    return @"
            {
                author: "$author",
                source: "$source",
                passage: "$passage",
                commentary: "$commentary",
                concepts: "$escapedConcepts"
            }
"@
}

# Cleanup re-run blocks
$cleanupPattern = '(?s)\{\s*author:\s*"([^"]+)"\s*,\s*source:\s*"([^"]+)"\s*,\s*passage:\s*"([\s\S]*?)"\s*,\s*commentary:\s*"([\s\S]*?)"\s*,\s*concepts:\s*"([\s\S]*?)"\s*\}'
$cleanupEvaluator = {
    param($m)
    return @"
            {
                author: "$($m.Groups[1].Value)",
                source: "$($m.Groups[2].Value)",
                passage: "$($m.Groups[3].Value)",
                commentary: "$($m.Groups[4].Value)"
            }
"@
}
$contentCleaned = [regex]::Replace($content, $cleanupPattern, $cleanupEvaluator)

# Process concepts injection
$newContent = [regex]::Replace($contentCleaned, $pattern, $evaluator)

# Write back to data.js
[System.IO.File]::WriteAllText($dataPath, $newContent, [System.Text.Encoding]::UTF8)

Write-Host "Injected concepts field successfully without local encoding reliance!"

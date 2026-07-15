$content = Get-Content -Raw -Path .\data.js

# 1. Bracket Matching Check
$stack = New-Object System.Collections.Generic.Stack[char]
$errors = New-Object System.Collections.Generic.List[string]

for ($i = 0; $i -lt $content.Length; $i++) {
    $char = $content[$i]
    if ($char -eq '{' -or $char -eq '[') {
        $stack.Push($char)
    } elseif ($char -eq '}') {
        if ($stack.Count -eq 0 -or $stack.Peek() -ne '{') {
            $errors.Add("Mismatched } at index $i")
        } else {
            [void]$stack.Pop()
        }
    } elseif ($char -eq ']') {
        if ($stack.Count -eq 0 -or $stack.Peek() -ne '[') {
            $errors.Add("Mismatched ] at index $i")
        } else {
            [void]$stack.Pop()
        }
    }
}
if ($stack.Count -ne 0) {
    $errors.Add("Unclosed brackets left on stack")
}

# 2. Quote Check
$lines = Get-Content -Path .\data.js
$newSection = $false
$quoteErrors = New-Object System.Collections.Generic.List[string]
$lineNum = 0
foreach ($line in $lines) {
    $lineNum++
    if ($line -match "81. 성실") {
        $newSection = $true
    }
    if ($newSection) {
        $count = ($line -split '"').Length - 1
        if ($count -gt 2) {
            $quoteErrors.Add("Line $lineNum has $count quotes: $line")
        }
    }
}

Write-Host "=== VALIDATION RESULTS ==="
if ($errors.Count -eq 0 -and $quoteErrors.Count -eq 0) {
    Write-Host "Validation Passed! No syntax errors or internal quote errors found." -ForegroundColor Green
} else {
    if ($errors.Count -gt 0) {
        Write-Host "Bracket Errors:" -ForegroundColor Red
        foreach ($err in $errors) { Write-Host $err -ForegroundColor Red }
    }
    if ($quoteErrors.Count -gt 0) {
        Write-Host "Quote Errors (Inside string):" -ForegroundColor Red
        foreach ($err in $quoteErrors) { Write-Host $err -ForegroundColor Red }
    }
}

$lines = Get-Content "C:\Users\familia diaz\.gemini\antigravity\scratch\sentimiento-universal\index.html"
$cutAt = 0
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '</html>') {
        $cutAt = $i
        break
    }
}
$clean = $lines[0..$cutAt]
[System.IO.File]::WriteAllLines(
    "C:\Users\familia diaz\.gemini\antigravity\scratch\sentimiento-universal\index.html",
    $clean,
    [System.Text.Encoding]::UTF8
)
Write-Host "Done. Trimmed to line $($cutAt + 1)"

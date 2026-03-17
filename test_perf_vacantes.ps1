
$url = "http://localhost:8081/api/auth/session-state"
$counts = 5
$totalTime = 0

Write-Host "Iniciando pruebas de rendimiento en $url..." -ForegroundColor Cyan

for ($i = 1; $i -le $counts; $i++) {
    $sw = [diagnostics.stopwatch]::StartNew()
    try {
        $client = New-Object System.Net.WebClient
        $null = $client.DownloadString($url)
    } catch {
        # Ignorar errores
    }
    $sw.Stop()
    $ms = $sw.Elapsed.TotalMilliseconds
    Write-Host "Petición $i : $ms ms"
    $totalTime += $ms
}

$avg = $totalTime / $counts
Write-Host "------------------------------------"
Write-Host "Tiempo promedio: $avg ms" -ForegroundColor Green
if ($avg -lt 100) {
    Write-Host "¡EXCELENTE! El rendimiento es óptimo." -ForegroundColor Green
} elseif ($avg -lt 500) {
    Write-Host "BUENO. El rendimiento es aceptable." -ForegroundColor Yellow
} else {
    Write-Host "ADVERTENCIA. Sigue habiendo latencia." -ForegroundColor Red
}

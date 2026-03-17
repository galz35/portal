# run_dev_basico.ps1
# Levanta los 4 servicios del portal en la terminal actual (NestJS backends + Vite frontends)
# Uso: .\scripts\run_dev_basico.ps1

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=== Portal Dev (NestJS) - Levantando servicios ===" -ForegroundColor Cyan
Write-Host ""

# --- 1. portal-api-nest ---
Write-Host "[1/4] Levantando portal-api-nest (puerto 3001)..." -ForegroundColor Green
$coreApi = Start-Job -ScriptBlock {
    Set-Location D:\portal\core\portal-api-nest
    npm run dev 2>&1
}
Start-Sleep -Seconds 5

# --- 2. vacantes-api-nest ---
Write-Host "[2/4] Levantando vacantes-api-nest (puerto 3002)..." -ForegroundColor Green
$vacantesApi = Start-Job -ScriptBlock {
    Set-Location D:\portal\vacantes\vacantes-api-nest
    npm run dev 2>&1
}
Start-Sleep -Seconds 5

# --- 3. portal-web ---
Write-Host "[3/4] Levantando portal-web (puerto 5173)..." -ForegroundColor Green
$portalWeb = Start-Job -ScriptBlock {
    Set-Location D:\portal\core\portal-web
    npm run dev -- --port 5173 2>&1
}
Start-Sleep -Seconds 2

# --- 4. vacantes-web ---
Write-Host "[4/4] Levantando vacantes-web (puerto 5174)..." -ForegroundColor Green
$vacantesWeb = Start-Job -ScriptBlock {
    Set-Location D:\portal\vacantes\vacantes-web
    npm run dev -- --port 5174 2>&1
}
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=== Servicios levantados (NestJS Migration) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Jobs activos:" -ForegroundColor Yellow
Write-Host "  portal-api:   Job $($coreApi.Id)" -ForegroundColor DarkGray
Write-Host "  vacantes-api: Job $($vacantesApi.Id)" -ForegroundColor DarkGray
Write-Host "  portal-web:   Job $($portalWeb.Id)" -ForegroundColor DarkGray
Write-Host "  vacantes-web: Job $($vacantesWeb.Id)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Local URLs:" -ForegroundColor DarkCyan
Write-Host "  Portal UI:      http://localhost:5173"
Write-Host "  Vacantes UI:    http://localhost:5174"
Write-Host "  Portal API:     http://localhost:3001"
Write-Host "  Vacantes API:   http://localhost:3002"
Write-Host ""
Write-Host "Para detener todo: .\scripts\stop_dev.ps1" -ForegroundColor Yellow
Write-Host ""

Write-Host "Presiona Ctrl+C para salir..."
while($true) { Start-Sleep 10 }

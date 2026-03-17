# stop_dev.ps1
# Detiene los procesos de los 4 servicios

$ErrorActionPreference = "SilentlyContinue"

Write-Host "Deteniendo procesos de Node.js y React..." -ForegroundColor Yellow
Get-Process node | Stop-Process -Force

Write-Host "Deteniendo procesos de Rust..." -ForegroundColor Yellow
Get-Process core-api | Stop-Process -Force
Get-Process vacantes-api | Stop-Process -Force
Get-Process cargo | Stop-Process -Force

Write-Host "Procesos detenidos." -ForegroundColor Green

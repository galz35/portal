# test_migration_parity.ps1
# Script para probar los endpoints clave de la migración a NestJS
# backends: portal-api (3001), vacantes-api (3002)

$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param($Name, $Url, $Method = "GET", $Body = $null)
    Write-Host "Probando $Name [$Method] $Url ... " -NoNewline
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
        }
        if ($Body) { $params.Body = ($Body | ConvertTo-Json) }
        
        $res = Invoke-WebRequest @params -ErrorAction Stop
        Write-Host "OK ($($res.StatusCode))" -ForegroundColor Green
        return $res.Content | ConvertFrom-Json
    } catch {
        Write-Host "FALLO" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $null
    }
}

Write-Host "`n=== INICIANDO SMOKE TEST DE MIGRACION NESTJS ===`n" -ForegroundColor Cyan

# 1. Health Checks
Test-Endpoint "Portal API Health" "http://127.0.0.1:3001/api/health"
Test-Endpoint "Vacantes API Health" "http://127.0.0.1:3002/api/health"

# 2. Portal Auth (Auth Flow)
Write-Host "`n--- Pruebas de Autenticacion ---" -ForegroundColor Yellow
$loginBody = @{
    usuario = "admin"
    clave = "admin123" # Asumiendo un usuario demo
}
# Nota: Esto fallará si la DB no tiene los registros o el password no coincide con el hash en SP
$loginRes = Test-Endpoint "Portal Login (Admin)" "http://127.0.0.1:3001/api/auth/login-empleado" "POST" $loginBody

# 3. Vacantes Publicas (Acceso anonimo)
Write-Host "`n--- Pruebas de Vacantes Publicas ---" -ForegroundColor Yellow
$vacantes = Test-Endpoint "Listar Vacantes Publicas" "http://127.0.0.1:3002/api/vacantes/publicas"
if ($vacantes -and $vacantes.data -and $vacantes.data.Count -gt 0) {
    $slug = $vacantes.data[0].slug
    Test-Endpoint "Detalle Vacante ($slug)" "http://127.0.0.1:3002/api/vacantes/publicas/$slug"
}

# 4. Observabilidad
Write-Host "`n--- Pruebas de Observabilidad ---" -ForegroundColor Yellow
Test-Endpoint "Portal Snapshot" "http://127.0.0.1:3001/api/observabilidad/snapshot"
Test-Endpoint "Vacantes Snapshot" "http://127.0.0.1:3002/api/observabilidad/snapshot"

Write-Host "`n=== FIN DE PRUEBAS ===`n" -ForegroundColor Cyan

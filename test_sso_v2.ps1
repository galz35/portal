$CoreBaseUrl = "http://127.0.0.1:8080"
$VacantesBaseUrl = "http://127.0.0.1:8081"

function Invoke-ApiRequest {
    param($Method, $Uri, $Headers, $Body)
    $params = @{
        Uri = $Uri
        Method = $Method
        Headers = @{ "Accept" = "application/json" }
        ErrorAction = "Stop"
    }
    if ($Headers) { foreach ($k in $Headers.Keys) { $params.Headers[$k] = $Headers[$k] } }
    if ($Body) { 
        $params.ContentType = "application/json"
        $params.Body = ($Body | ConvertTo-Json -Compress)
    }
    try {
        $resp = Invoke-WebRequest @params -SessionVariable session
        return [pscustomobject]@{ Ok=$true; Status=$resp.StatusCode; Content=($resp.Content | ConvertFrom-Json); Session=$session; Headers=$resp.Headers }
    } catch {
        $err = $_.Exception.Response
        $body = ""
        if ($err) {
            $reader = New-Object System.IO.StreamReader($err.GetResponseStream())
            $body = $reader.ReadToEnd() | ConvertFrom-Json
            return [pscustomobject]@{ Ok=$false; Status=$err.StatusCode.Value__; Content=$body; Session=$null; Headers=$err.Headers }
        }
        return [pscustomobject]@{ Ok=$false; Status=0; Content=$_.Exception.Message; Session=$null; Headers=@{} }
    }
}

Write-Host "`n--- [1] Login ---" -ForegroundColor Cyan
$login = Invoke-ApiRequest -Method POST -Uri "$CoreBaseUrl/api/auth/login-empleado" -Body @{
    usuario = "empleado.portal"
    clave = "Portal123!"
    returnUrl = "/portal"
}
if ($login.Ok) {
    Write-Host "Login OK. Usuario: $($login.Content.perfil.usuario)" -ForegroundColor Green
} else {
    Write-Host "Login Failed: $($login.Content.message)" -ForegroundColor Red
    exit
}

# Obtener cookies de la sesion de PS
$cookies = $login.Session.Cookies.GetCookies($CoreBaseUrl)
$sid1 = ""
foreach($c in $cookies) { if($c.Name -eq "portal_sid") { $sid1 = $c.Value } }
Write-Host "SID Inicial: $sid1"

Write-Host "`n--- [2] Introspect ---" -ForegroundColor Cyan
$intro = Invoke-ApiRequest -Method POST -Uri "$CoreBaseUrl/api/auth/introspect" -Headers @{ "Cookie" = $login.Headers["Set-Cookie"] }
if ($intro.Ok -and $intro.Content.authenticated) {
    Write-Host "Introspect OK. Nombre: $($intro.Content.identity.nombre)" -ForegroundColor Green
} else {
    Write-Host "Introspect Failed" -ForegroundColor Red
}

Write-Host "`n--- [3] Refresh (Rotation) ---" -ForegroundColor Cyan
$refresh = Invoke-ApiRequest -Method POST -Uri "$CoreBaseUrl/api/auth/refresh" -Headers @{ "Cookie" = $login.Headers["Set-Cookie"] }
if ($refresh.Ok) {
    $cookies2 = $refresh.Headers["Set-Cookie"]
    Write-Host "Refresh OK (Tokens rotados)" -ForegroundColor Green
    # Extraer nuevo sid de los headers si es posible o simplemente ver que devolvio algo
} else {
    Write-Host "Refresh Failed: $($refresh.Content.message)" -ForegroundColor Red
}

Write-Host "`n--- [4] Introspect con Token anterior (Debe fallar) ---" -ForegroundColor Cyan
try {
    $intro2 = Invoke-ApiRequest -Method POST -Uri "$CoreBaseUrl/api/auth/introspect" -Headers @{ "Cookie" = $login.Headers["Set-Cookie"] }
    if ($intro2.Status -eq 401) {
        Write-Host "Correcto: Token anterior invalidado por rotacion." -ForegroundColor Green
    } else {
        Write-Host "Error: El token anterior aun funciona despues del refresh! (Status: $($intro2.Status))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Correcto: Fallo la peticion (Token anterior invalidado)" -ForegroundColor Green
}

Write-Host "`n--- [5] Vacantes RH (Usando Introspeccion HTTP) ---" -ForegroundColor Cyan
# Reenviamos el cookie del refresh (que es el nuevo valido)
$rh = Invoke-ApiRequest -Method GET -Uri "$VacantesBaseUrl/api/rh/postulaciones" -Headers @{ "Cookie" = $refresh.Headers["Set-Cookie"] }
if ($rh.Ok) {
    Write-Host "RH List OK. Items: $($rh.Content.items.Count)" -ForegroundColor Green
} else {
    Write-Host "RH List Failed: $($rh.Content.message)" -ForegroundColor Red
    Write-Host "Detalle: $($rh.Status)"
}

Write-Host "`nTest completado."

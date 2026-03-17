param(
    [string]$CoreBaseUrl = "http://127.0.0.1:8080",
    [string]$VacantesBaseUrl = "http://127.0.0.1:8081",
    [string]$EmpleadoUsuario,
    [string]$EmpleadoClave,
    [string]$CandidateEmail,
    [string]$CandidatePassword,
    [string]$CandidateNombres = "Smoke",
    [string]$CandidateApellidos = "Portal",
    [string]$CandidateTelefono = "+50555550000",
    [string]$PublicVacancySlug,
    [int]$VacancyId = 0,
    [switch]$AllowWriteOperations
)

$ErrorActionPreference = "Stop"

$results = New-Object System.Collections.Generic.List[object]

function Add-Result {
    param(
        [string]$Step,
        [bool]$Passed,
        [string]$Detail
    )

    $results.Add([pscustomobject]@{
        Step   = $Step
        Passed = $Passed
        Detail = $Detail
    }) | Out-Null
}

function Normalize-BaseUrl {
    param([string]$Value)
    return $Value.TrimEnd("/")
}

function Try-ParseJson {
    param([string]$Content)

    if ([string]::IsNullOrWhiteSpace($Content)) {
        return $null
    }

    try {
        return $Content | ConvertFrom-Json -Depth 20
    }
    catch {
        return $null
    }
}

function Convert-HeadersToMap {
    param($Headers)

    $map = @{}
    if (-not $Headers) {
        return $map
    }

    foreach ($key in $Headers.Keys) {
        $map[$key.ToString()] = [string]$Headers[$key]
    }

    return $map
}

function New-RequestHeaders {
    param([hashtable]$ExtraHeaders)

    $headers = @{
        "Accept"       = "application/json"
        "X-Request-Id" = [guid]::NewGuid().ToString()
    }

    if ($ExtraHeaders) {
        foreach ($key in $ExtraHeaders.Keys) {
            $headers[$key] = $ExtraHeaders[$key]
        }
    }

    return $headers
}

function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers,
        [object]$Body,
        [Microsoft.PowerShell.Commands.WebRequestSession]$Session,
        [switch]$JsonBody
    )

    $params = @{
        Uri         = $Uri
        Method      = $Method
        Headers     = New-RequestHeaders $Headers
        ErrorAction = "Stop"
    }

    if ($PSVersionTable.PSVersion.Major -lt 6) {
        $params.UseBasicParsing = $true
    }

    if ($Session) {
        $params.WebSession = $Session
    }

    if ($JsonBody) {
        $params.ContentType = "application/json"
        $params.Body = ($Body | ConvertTo-Json -Depth 20 -Compress)
    }
    elseif ($null -ne $Body) {
        $params.Body = $Body
    }

    try {
        $response = Invoke-WebRequest @params
        return [pscustomobject]@{
            Ok             = ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300)
            StatusCode     = [int]$response.StatusCode
            Content        = $response.Content
            Json           = Try-ParseJson $response.Content
            Headers        = Convert-HeadersToMap $response.Headers
            TransportError = $null
        }
    }
    catch {
        $exception = $_.Exception
        if (-not $exception.Response) {
            return [pscustomobject]@{
                Ok             = $false
                StatusCode     = 0
                Content        = ""
                Json           = $null
                Headers        = @{}
                TransportError = $exception.Message
            }
        }

        $response = $exception.Response
        $content = ""

        if ($response.PSObject.Properties.Name -contains "Content") {
            $content = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        }
        elseif ($response.PSObject.Methods.Name -contains "GetResponseStream") {
            $stream = $response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            try {
                $content = $reader.ReadToEnd()
            }
            finally {
                $reader.Close()
                $stream.Close()
            }
        }

        return [pscustomobject]@{
            Ok             = $false
            StatusCode     = [int]$response.StatusCode
            Content        = $content
            Json           = Try-ParseJson $content
            Headers        = Convert-HeadersToMap $response.Headers
            TransportError = $null
        }
    }
}

function Assert-Status {
    param(
        [string]$Step,
        $Response,
        [int[]]$ExpectedStatusCodes
    )

    $passed = $ExpectedStatusCodes -contains [int]$Response.StatusCode
    $detail = "status={0}; expected={1}" -f $Response.StatusCode, ($ExpectedStatusCodes -join ",")
    if (-not [string]::IsNullOrWhiteSpace([string]$Response.TransportError)) {
        $detail = "{0}; transport={1}" -f $detail, [string]$Response.TransportError
    }
    Add-Result $Step $passed $detail
    return $passed
}

function Assert-HeaderPresent {
    param(
        [string]$Step,
        $Response,
        [string]$HeaderName
    )

    $value = $null
    foreach ($key in $Response.Headers.Keys) {
        if ($key.ToString().ToLowerInvariant() -eq $HeaderName.ToLowerInvariant()) {
            $value = $Response.Headers[$key]
            break
        }
    }

    $passed = -not [string]::IsNullOrWhiteSpace($value)
    $detail = "header={0}; value={1}" -f $HeaderName, $value
    if (-not [string]::IsNullOrWhiteSpace([string]$Response.TransportError)) {
        $detail = "{0}; transport={1}" -f $detail, [string]$Response.TransportError
    }
    Add-Result $Step $passed $detail
    return $passed
}

function Get-CookieValue {
    param(
        [Microsoft.PowerShell.Commands.WebRequestSession]$Session,
        [string]$BaseUrl,
        [string]$CookieName
    )

    $uri = [Uri](Normalize-BaseUrl $BaseUrl)
    $cookies = $Session.Cookies.GetCookies($uri)
    foreach ($cookie in $cookies) {
        if ($cookie.Name -eq $CookieName) {
            return $cookie.Value
        }
    }

    return $null
}

function Copy-Cookies {
    param(
        [Microsoft.PowerShell.Commands.WebRequestSession]$SourceSession,
        [string]$SourceBaseUrl,
        [Microsoft.PowerShell.Commands.WebRequestSession]$TargetSession,
        [string]$TargetBaseUrl,
        [string[]]$CookieNames
    )

    $targetUri = [Uri](Normalize-BaseUrl $TargetBaseUrl)
    foreach ($cookieName in $CookieNames) {
        $value = Get-CookieValue -Session $SourceSession -BaseUrl $SourceBaseUrl -CookieName $cookieName
        if ([string]::IsNullOrWhiteSpace($value)) {
            continue
        }

        $cookie = New-Object System.Net.Cookie($cookieName, $value, "/", $targetUri.Host)
        $TargetSession.Cookies.Add($targetUri, $cookie)
    }
}

function Resolve-PublicVacancy {
    param(
        [object]$Items,
        [string]$Slug,
        [int]$Id
    )

    if (-not $Items) {
        return $null
    }

    if ($Id -gt 0) {
        foreach ($item in $Items) {
            if ([int]$item.idVacante -eq $Id) {
                return $item
            }
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($Slug)) {
        foreach ($item in $Items) {
            if ($item.slug -eq $Slug) {
                return $item
            }
        }
    }

    return $Items | Select-Object -First 1
}

function Test-WriteOutcome {
    param(
        $Response,
        [string]$DuplicateNeedle
    )

    if ($Response.StatusCode -eq 200) {
        return $true
    }

    if ($Response.StatusCode -ne 400) {
        return $false
    }

    $message = [string]$Response.Json.message
    return $message -like "*$DuplicateNeedle*"
}

$CoreBaseUrl = Normalize-BaseUrl $CoreBaseUrl
$VacantesBaseUrl = Normalize-BaseUrl $VacantesBaseUrl

$portalSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$vacantesPortalSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$candidateSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$coreLive = Invoke-ApiRequest -Method "GET" -Uri "$CoreBaseUrl/health/live" -Session $portalSession
Assert-Status -Step "core.health.live" -Response $coreLive -ExpectedStatusCodes @(200) | Out-Null
Assert-HeaderPresent -Step "core.health.live.x-request-id" -Response $coreLive -HeaderName "x-request-id" | Out-Null
Assert-HeaderPresent -Step "core.health.live.x-content-type-options" -Response $coreLive -HeaderName "x-content-type-options" | Out-Null

$coreReady = Invoke-ApiRequest -Method "GET" -Uri "$CoreBaseUrl/health/ready" -Session $portalSession
Assert-Status -Step "core.health.ready" -Response $coreReady -ExpectedStatusCodes @(200) | Out-Null

$vacLive = Invoke-ApiRequest -Method "GET" -Uri "$VacantesBaseUrl/health/live" -Session $candidateSession
Assert-Status -Step "vacantes.health.live" -Response $vacLive -ExpectedStatusCodes @(200) | Out-Null
Assert-HeaderPresent -Step "vacantes.health.live.x-request-id" -Response $vacLive -HeaderName "x-request-id" | Out-Null
Assert-HeaderPresent -Step "vacantes.health.live.x-content-type-options" -Response $vacLive -HeaderName "x-content-type-options" | Out-Null

$vacReady = Invoke-ApiRequest -Method "GET" -Uri "$VacantesBaseUrl/health/ready" -Session $candidateSession
Assert-Status -Step "vacantes.health.ready" -Response $vacReady -ExpectedStatusCodes @(200) | Out-Null

$publicList = Invoke-ApiRequest -Method "GET" -Uri "$VacantesBaseUrl/api/vacantes/publicas" -Session $candidateSession
Assert-Status -Step "vacantes.publicas.list" -Response $publicList -ExpectedStatusCodes @(200) | Out-Null

$publicItems = @()
if ($publicList.Json -and $publicList.Json.items) {
    $publicItems = @($publicList.Json.items)
}
if ($publicItems.Count -gt 0) {
    Add-Result "vacantes.publicas.count" $true ("items={0}" -f $publicItems.Count)
}
else {
    Add-Result "vacantes.publicas.count" $true "items=0; sin vacantes publicas cargadas en este ambiente"
}

$selectedVacancy = Resolve-PublicVacancy -Items $publicItems -Slug $PublicVacancySlug -Id $VacancyId
if ($selectedVacancy) {
    $detail = Invoke-ApiRequest -Method "GET" -Uri "$VacantesBaseUrl/api/vacantes/publicas/$($selectedVacancy.slug)" -Session $candidateSession
    Assert-Status -Step "vacantes.publicas.detail" -Response $detail -ExpectedStatusCodes @(200) | Out-Null
}
else {
    Add-Result "vacantes.publicas.detail" $true "Omitido porque no hay vacantes publicas disponibles para prueba"
}

if (-not [string]::IsNullOrWhiteSpace($EmpleadoUsuario) -and -not [string]::IsNullOrWhiteSpace($EmpleadoClave)) {
    $portalLogin = Invoke-ApiRequest `
        -Method "POST" `
        -Uri "$CoreBaseUrl/api/auth/login-empleado" `
        -Session $portalSession `
        -JsonBody `
        -Body @{
            usuario    = $EmpleadoUsuario
            clave      = $EmpleadoClave
            tipo_login = "empleado"
            returnUrl  = "/portal"
        }

    Assert-Status -Step "core.login-empleado" -Response $portalLogin -ExpectedStatusCodes @(200) | Out-Null
    Assert-HeaderPresent -Step "core.login-empleado.cache-control" -Response $portalLogin -HeaderName "cache-control" | Out-Null

    $portalSid = Get-CookieValue -Session $portalSession -BaseUrl $CoreBaseUrl -CookieName "portal_sid"
    $portalCsrf = Get-CookieValue -Session $portalSession -BaseUrl $CoreBaseUrl -CookieName "portal_csrf"
    Add-Result "core.login-empleado.cookie.portal_sid" (-not [string]::IsNullOrWhiteSpace($portalSid)) ("present={0}" -f (-not [string]::IsNullOrWhiteSpace($portalSid)))
    Add-Result "core.login-empleado.cookie.portal_csrf" (-not [string]::IsNullOrWhiteSpace($portalCsrf)) ("present={0}" -f (-not [string]::IsNullOrWhiteSpace($portalCsrf)))

    $portalMe = Invoke-ApiRequest -Method "GET" -Uri "$CoreBaseUrl/api/auth/me" -Session $portalSession
    Assert-Status -Step "core.me" -Response $portalMe -ExpectedStatusCodes @(200) | Out-Null

    $portalState = Invoke-ApiRequest -Method "GET" -Uri "$CoreBaseUrl/api/auth/session-state" -Session $portalSession
    Assert-Status -Step "core.session-state" -Response $portalState -ExpectedStatusCodes @(200) | Out-Null
    Add-Result "core.session-state.authenticated" ([bool]$portalState.Json.authenticated) ("authenticated={0}" -f [bool]$portalState.Json.authenticated)

    $portalApps = Invoke-ApiRequest -Method "GET" -Uri "$CoreBaseUrl/api/core/apps" -Session $portalSession
    Assert-Status -Step "core.apps" -Response $portalApps -ExpectedStatusCodes @(200) | Out-Null

    if ($AllowWriteOperations -and $selectedVacancy -and -not [string]::IsNullOrWhiteSpace($portalCsrf)) {
        Copy-Cookies -SourceSession $portalSession -SourceBaseUrl $CoreBaseUrl -TargetSession $vacantesPortalSession -TargetBaseUrl $VacantesBaseUrl -CookieNames @("portal_sid", "portal_refresh", "portal_csrf")
        $internalApply = Invoke-ApiRequest `
            -Method "POST" `
            -Uri "$VacantesBaseUrl/api/vacantes/postular" `
            -Session $vacantesPortalSession `
            -JsonBody `
            -Headers @{ "X-CSRF-Token" = $portalCsrf } `
            -Body @{
                id_vacante         = [int]$selectedVacancy.idVacante
                fuente_postulacion = "SMOKE_PORTAL"
            }

        Add-Result "vacantes.postular.interno" (Test-WriteOutcome -Response $internalApply -DuplicateNeedle "postulacion interna registrada") ("status={0}; message={1}" -f $internalApply.StatusCode, [string]$internalApply.Json.message)
    }
    else {
        Add-Result "vacantes.postular.interno" $true "Omitido por falta de credenciales, CSRF, vacante o -AllowWriteOperations"
    }

    if (-not [string]::IsNullOrWhiteSpace($portalCsrf)) {
        $portalLogout = Invoke-ApiRequest `
            -Method "POST" `
            -Uri "$CoreBaseUrl/api/auth/logout" `
            -Session $portalSession `
            -Headers @{ "X-CSRF-Token" = $portalCsrf }

        Assert-Status -Step "core.logout" -Response $portalLogout -ExpectedStatusCodes @(200) | Out-Null
        Assert-HeaderPresent -Step "core.logout.clear-site-data" -Response $portalLogout -HeaderName "clear-site-data" | Out-Null
    }
}
else {
    Add-Result "core.login-empleado" $true "Omitido por falta de credenciales"
}

$effectiveCandidateEmail = $CandidateEmail
$effectiveCandidatePassword = $CandidatePassword

if ($AllowWriteOperations) {
    if ([string]::IsNullOrWhiteSpace($effectiveCandidateEmail)) {
        $effectiveCandidateEmail = ("smoke.{0}@example.invalid" -f ([guid]::NewGuid().ToString("N").Substring(0, 12)))
    }
    if ([string]::IsNullOrWhiteSpace($effectiveCandidatePassword)) {
        $effectiveCandidatePassword = "Smoke#2026Portal"
    }

    $candidateAuth = Invoke-ApiRequest `
        -Method "POST" `
        -Uri "$VacantesBaseUrl/api/candidatos/register" `
        -Session $candidateSession `
        -JsonBody `
        -Body @{
            correo    = $effectiveCandidateEmail
            nombres   = $CandidateNombres
            apellidos = $CandidateApellidos
            telefono  = $CandidateTelefono
            clave     = $effectiveCandidatePassword
        }

    if ($candidateAuth.StatusCode -eq 400) {
        $candidateAuth = Invoke-ApiRequest `
            -Method "POST" `
            -Uri "$VacantesBaseUrl/api/candidatos/login" `
            -Session $candidateSession `
            -JsonBody `
            -Body @{
                correo = $effectiveCandidateEmail
                clave  = $effectiveCandidatePassword
            }
    }

    Assert-Status -Step "candidato.auth" -Response $candidateAuth -ExpectedStatusCodes @(200) | Out-Null
}
elseif (-not [string]::IsNullOrWhiteSpace($CandidateEmail) -and -not [string]::IsNullOrWhiteSpace($CandidatePassword)) {
    $effectiveCandidateEmail = $CandidateEmail
    $effectiveCandidatePassword = $CandidatePassword

    $candidateAuth = Invoke-ApiRequest `
        -Method "POST" `
        -Uri "$VacantesBaseUrl/api/candidatos/login" `
        -Session $candidateSession `
        -JsonBody `
        -Body @{
            correo = $effectiveCandidateEmail
            clave  = $effectiveCandidatePassword
        }

    Assert-Status -Step "candidato.auth" -Response $candidateAuth -ExpectedStatusCodes @(200) | Out-Null
}
else {
    Add-Result "candidato.auth" $true "Omitido por falta de credenciales y sin -AllowWriteOperations"
}

$candidateSid = Get-CookieValue -Session $candidateSession -BaseUrl $VacantesBaseUrl -CookieName "cand_sid"
$candidateCsrf = Get-CookieValue -Session $candidateSession -BaseUrl $VacantesBaseUrl -CookieName "cand_csrf"
if (-not [string]::IsNullOrWhiteSpace($candidateSid)) {
    Add-Result "candidato.cookie.cand_sid" $true "present=True"
    Add-Result "candidato.cookie.cand_csrf" (-not [string]::IsNullOrWhiteSpace($candidateCsrf)) ("present={0}" -f (-not [string]::IsNullOrWhiteSpace($candidateCsrf)))

    $candidateMe = Invoke-ApiRequest -Method "GET" -Uri "$VacantesBaseUrl/api/candidatos/me" -Session $candidateSession
    Assert-Status -Step "candidato.me" -Response $candidateMe -ExpectedStatusCodes @(200) | Out-Null

    $candidatePostulations = Invoke-ApiRequest -Method "GET" -Uri "$VacantesBaseUrl/api/candidatos/mis-postulaciones" -Session $candidateSession
    Assert-Status -Step "candidato.mis-postulaciones" -Response $candidatePostulations -ExpectedStatusCodes @(200) | Out-Null

    if ($AllowWriteOperations -and $selectedVacancy -and -not [string]::IsNullOrWhiteSpace($candidateCsrf)) {
        $candidateApply = Invoke-ApiRequest `
            -Method "POST" `
            -Uri "$VacantesBaseUrl/api/candidatos/postular" `
            -Session $candidateSession `
            -JsonBody `
            -Headers @{ "X-CSRF-Token" = $candidateCsrf } `
            -Body @{
                id_vacante         = [int]$selectedVacancy.idVacante
                fuente_postulacion = "SMOKE_CANDIDATO"
            }

        Add-Result "candidato.postular" (Test-WriteOutcome -Response $candidateApply -DuplicateNeedle "postulacion registrada") ("status={0}; message={1}" -f $candidateApply.StatusCode, [string]$candidateApply.Json.message)
    }
    else {
        Add-Result "candidato.postular" $true "Omitido por falta de vacante, CSRF o -AllowWriteOperations"
    }

    $candidateLogout = Invoke-ApiRequest `
        -Method "POST" `
        -Uri "$VacantesBaseUrl/api/candidatos/logout" `
        -Session $candidateSession `
        -Headers @{ "X-CSRF-Token" = $candidateCsrf }

    Assert-Status -Step "candidato.logout" -Response $candidateLogout -ExpectedStatusCodes @(200) | Out-Null
    Assert-HeaderPresent -Step "candidato.logout.clear-site-data" -Response $candidateLogout -HeaderName "clear-site-data" | Out-Null
}

Write-Host ""
Write-Host "Smoke summary"
$results | Format-Table -AutoSize

$failed = @($results | Where-Object { -not $_.Passed })
Write-Host ""
Write-Host ("Passed: {0}" -f (@($results | Where-Object { $_.Passed }).Count))
Write-Host ("Failed: {0}" -f $failed.Count)

if ($failed.Count -gt 0) {
    exit 1
}

exit 0

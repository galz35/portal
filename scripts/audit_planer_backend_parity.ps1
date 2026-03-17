param(
    [string]$RustRoot = "D:\planificacion\rustsistema\backendrust",
    [string]$NestRoot = "D:\planificacion\v2sistema\v2backend",
    [string]$OutputDir = "D:\portal\docs\2026-03-14\planer_paridad"
)

$ErrorActionPreference = "Stop"

function New-Directory {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Get-UniqueCsv {
    param([string[]]$Values)
    return (($Values | Where-Object { $_ } | Sort-Object -Unique) -join ", ")
}

function Normalize-PathTemplate {
    param([string]$Path)

    $parts = $Path -split "/"
    $normalized = foreach ($part in $parts) {
        if ($part -like ":*") { ":*" } else { $part }
    }

    return ($normalized -join "/")
}

function Expand-ManifestPath {
    param([string]$Path)

    if (-not $Path.Contains("[")) {
        return @($Path)
    }

    $prefix = $Path.Substring(0, $Path.IndexOf("["))
    $items = [regex]::Matches($Path, "'([^']+)'") | ForEach-Object { $_.Groups[1].Value }

    if (-not $items -or $items.Count -eq 0) {
        return @($Path)
    }

    $expanded = foreach ($item in $items) {
        if ($prefix -eq "/") {
            "/$item"
        }
        else {
            "$prefix$item"
        }
    }

    return @($expanded)
}

function Get-NestGuardHints {
    param(
        [string]$ControllerPath,
        [string]$Method = "",
        [string]$Path = ""
    )

    $fullPath = Join-Path $NestRoot "src\$ControllerPath"
    if (-not (Test-Path $fullPath)) {
        return ""
    }

    $publicEndpointOverrides = @{
        "common/notification.controller.ts" = @(
            "GET /notifications/test-email-public",
            "GET /notifications/test-overdue-redesign"
        )
    }

    if ($ControllerPath -and $publicEndpointOverrides.ContainsKey($ControllerPath)) {
        $endpointKey = "$($Method.ToUpperInvariant()) $Path"
        if ($publicEndpointOverrides[$ControllerPath] -contains $endpointKey) {
            return ""
        }
    }

    $content = Get-Content $fullPath -Raw
    $hints = @()

    if ($content -match "AuthGuard\('jwt'\)") { $hints += "jwt" }
    if ($content -match "RolesGuard") { $hints += "roles" }
    if ($content -match "AdminGuard") { $hints += "admin" }
    if ($content -match "FeatureFlagGuard") { $hints += "feature-flag" }

    return (Get-UniqueCsv -Values $hints)
}

function Get-HandlerMetadata {
    param([string]$SourceRoot)

    $metadata = @{}
    $files = Get-ChildItem -Path $SourceRoot -Recurse -File -Filter *.rs

    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        $matches = [regex]::Matches(
            $content,
            "pub\s+async\s+fn\s+([A-Za-z0-9_]+)\s*\((.*?)\)\s*(?:->\s*[^{]+)?\{",
            [System.Text.RegularExpressions.RegexOptions]::Singleline
        )

        foreach ($match in $matches) {
            $name = $match.Groups[1].Value
            $signature = $match.Groups[2].Value
            $authKinds = @()

            if ($signature -match "\bAuthUser\b") { $authKinds += "auth-user" }
            if ($signature -match "axum::extract::Query<") { $authKinds += "query" }
            if ($signature -match "Json<") { $authKinds += "json" }

            $metadata[$name] = [pscustomobject]@{
                handler = $name
                file = $file.FullName
                auth_hint = (Get-UniqueCsv -Values $authKinds)
            }
        }
    }

    return $metadata
}

function Parse-RouteSection {
    param(
        [string]$Content,
        [string]$PathPrefix = ""
    )

    $routes = @()
    $blocks = New-Object System.Collections.Generic.List[string]
    $capturing = $false
    $depth = 0
    $current = ""

    foreach ($line in ($Content -split "`r?`n")) {
        if (-not $capturing -and $line -match '\.route\(') {
            $capturing = $true
            $current = $line
            $depth = ([regex]::Matches($line, '\(').Count - [regex]::Matches($line, '\)').Count)

            if ($depth -le 0) {
                $blocks.Add($current)
                $capturing = $false
                $current = ""
                $depth = 0
            }
            continue
        }

        if ($capturing) {
            $current += "`n$line"
            $depth += ([regex]::Matches($line, '\(').Count - [regex]::Matches($line, '\)').Count)

            if ($depth -le 0) {
                $blocks.Add($current)
                $capturing = $false
                $current = ""
                $depth = 0
            }
        }
    }

    foreach ($block in $blocks) {
        $pathMatch = [regex]::Match($block, '\.route\(\s*"([^"]+)"')
        if (-not $pathMatch.Success) {
            continue
        }

        $path = $pathMatch.Groups[1].Value
        $fullPath = if ([string]::IsNullOrWhiteSpace($PathPrefix)) { $path } else { "$PathPrefix$path" }

        $handlerMatches = [regex]::Matches($block, '\b(get|post|put|patch|delete|any)\(([^)]+)\)')
        foreach ($handlerMatch in $handlerMatches) {
            $routes += [pscustomobject]@{
                method = $handlerMatch.Groups[1].Value.ToUpperInvariant()
                path = $fullPath
                handler = $handlerMatch.Groups[2].Value.Trim()
            }
        }
    }

    return $routes
}

New-Directory -Path $OutputDir

$manifestPath = Join-Path $RustRoot "data\endpoints_manifest.json"
$implementedPath = Join-Path $RustRoot "data\implemented_endpoints.json"
$routerPath = Join-Path $RustRoot "src\router.rs"
$handlersRoot = Join-Path $RustRoot "src\handlers"

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$implementedEndpoints = @()
if (Test-Path $implementedPath) {
    $implementedEndpoints = Get-Content $implementedPath -Raw | ConvertFrom-Json
}
$implementedEndpointSet = New-Object System.Collections.Generic.HashSet[string]
foreach ($implementedEndpoint in $implementedEndpoints) {
    $null = $implementedEndpointSet.Add("$($implementedEndpoint.method.ToUpperInvariant()) $($implementedEndpoint.path)")
}
$routerContent = Get-Content $routerPath -Raw

$adminMarker = "fn admin_subrouter"
$adminIndex = $routerContent.IndexOf($adminMarker)
if ($adminIndex -lt 0) {
    throw "No se encontro admin_subrouter en router.rs"
}

$mainRouterContent = $routerContent.Substring(0, $adminIndex)
$adminRouterContent = $routerContent.Substring($adminIndex)

$routeDeclarations = @()
$routeDeclarations += Parse-RouteSection -Content $mainRouterContent
$routeDeclarations += Parse-RouteSection -Content $adminRouterContent -PathPrefix "/admin"

$routeMap = @{}
$routeMapNormalized = @{}
foreach ($route in $routeDeclarations) {
    $key = "$($route.method) $($route.path)"
    $routeMap[$key] = $route
    $normalizedKey = "$($route.method) $(Normalize-PathTemplate -Path $route.path)"
    if (-not $routeMapNormalized.ContainsKey($normalizedKey)) {
        $routeMapNormalized[$normalizedKey] = $route
    }
}

$handlerMetadata = Get-HandlerMetadata -SourceRoot $handlersRoot

$endpointRows = @()
foreach ($endpoint in $manifest.endpoints) {
    $paths = Expand-ManifestPath -Path $endpoint.path
    foreach ($expandedPath in $paths) {
        $key = "$($endpoint.method.ToUpperInvariant()) $expandedPath"
        $route = $routeMap[$key]
        $matchType = "exact"
        if (-not $route) {
            $normalizedKey = "$($endpoint.method.ToUpperInvariant()) $(Normalize-PathTemplate -Path $expandedPath)"
            $route = $routeMapNormalized[$normalizedKey]
            if ($route) {
                $matchType = "normalized"
            }
        }
        $handlerName = if ($route) { $route.handler } else { "" }
        $handlerInfo = if ($handlerName -and $handlerMetadata.ContainsKey($handlerName)) { $handlerMetadata[$handlerName] } else { $null }
        $nestGuardHints = Get-NestGuardHints -ControllerPath $endpoint.controller -Method $endpoint.method -Path $expandedPath
        $rustAuthHint = if ($expandedPath.StartsWith("/admin")) {
            "admin-middleware"
        }
        elseif ($handlerInfo) {
            $handlerInfo.auth_hint
        }
        else {
            ""
        }

        $isGeneric = $false
        if ($handlerName -match "^generic_" -or $handlerName -eq "endpoint_proxy") {
            $isGeneric = $true
        }

        $implementedFromLegacyManifest = [bool]$endpoint.implemented_in_rust
        $implementedFromDeclaredList = $implementedEndpointSet.Contains("$($endpoint.method.ToUpperInvariant()) $expandedPath")

        $status = if (-not $route) {
            "missing"
        }
        elseif ($isGeneric) {
            "generic"
        }
        elseif ($implementedFromLegacyManifest) {
            "manifest_real"
        }
        else {
            "declared_untracked"
        }

        $securityMismatch = $false
        if ($nestGuardHints -and -not $rustAuthHint -and -not $expandedPath.StartsWith("/admin")) {
            $securityMismatch = $true
        }

        $endpointRows += [pscustomobject]@{
            controller = $endpoint.controller
            method = $endpoint.method.ToUpperInvariant()
            path = $expandedPath
            manifest_implemented = $implementedFromLegacyManifest
            implemented_declared_file = $implementedFromDeclaredList
            rust_declared = [bool]($null -ne $route)
            rust_handler = $handlerName
            rust_handler_file = if ($handlerInfo) { $handlerInfo.file } else { "" }
            rust_match_type = if ($route) { $matchType } else { "" }
            rust_auth_hint = $rustAuthHint
            rust_generic = $isGeneric
            nest_guard_hints = $nestGuardHints
            security_mismatch_hint = $securityMismatch
            status = $status
        }
    }
}

$controllerSummary = $endpointRows |
    Group-Object controller |
    ForEach-Object {
        $group = $_.Group
        [pscustomobject]@{
            controller = $_.Name
            total = [int]$group.Count
            manifest_real = [int]@($group | Where-Object { $_.status -eq "manifest_real" }).Count
            declared_untracked = [int]@($group | Where-Object { $_.status -eq "declared_untracked" }).Count
            generic = [int]@($group | Where-Object { $_.status -eq "generic" }).Count
            missing = [int]@($group | Where-Object { $_.status -eq "missing" }).Count
            security_mismatch_hint = [int]@($group | Where-Object { $_.security_mismatch_hint }).Count
            readiness_percent = [math]::Round((([int]@($group | Where-Object { $_.status -in @("manifest_real", "declared_untracked") }).Count) * 100.0) / [math]::Max($group.Count, 1), 1)
        }
    } |
    Sort-Object readiness_percent, missing, generic

$summary = [pscustomobject]@{
    nest_total_endpoints = [int]$endpointRows.Count
    rust_manifest_real = [int]@($endpointRows | Where-Object { $_.status -eq "manifest_real" }).Count
    rust_implemented_declared_file = [int]@($endpointRows | Where-Object { $_.implemented_declared_file }).Count
    rust_declared_untracked = [int]@($endpointRows | Where-Object { $_.status -eq "declared_untracked" }).Count
    rust_generic = [int]@($endpointRows | Where-Object { $_.status -eq "generic" }).Count
    rust_missing = [int]@($endpointRows | Where-Object { $_.status -eq "missing" }).Count
    security_mismatch_hints = [int]@($endpointRows | Where-Object { $_.security_mismatch_hint }).Count
}

$summaryPath = Join-Path $OutputDir "summary.json"
$controllerSummaryPath = Join-Path $OutputDir "controller_summary.csv"
$endpointMatrixPath = Join-Path $OutputDir "endpoint_matrix.csv"
$reportPath = Join-Path $OutputDir "report.md"

$summary | ConvertTo-Json -Depth 4 | Set-Content -Path $summaryPath
$controllerSummary | Export-Csv -Path $controllerSummaryPath -NoTypeInformation -Encoding UTF8
$endpointRows | Export-Csv -Path $endpointMatrixPath -NoTypeInformation -Encoding UTF8

$topControllers = $controllerSummary | Select-Object -First 12
$topMissing = $endpointRows | Where-Object { $_.status -eq "missing" } | Select-Object -First 40
$topGeneric = $endpointRows | Where-Object { $_.status -eq "generic" } | Select-Object -First 20
$declaredUntracked = $endpointRows | Where-Object { $_.status -eq "declared_untracked" } | Select-Object -First 30
$securityHints = $endpointRows | Where-Object { $_.security_mismatch_hint } | Select-Object -First 30

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Auditoria de paridad backendrust vs Nest")
$lines.Add("")
$lines.Add("## Resumen")
$lines.Add("")
$lines.Add("- Endpoints Nest contabilizados: $($summary.nest_total_endpoints)")
$lines.Add("- Endpoints Rust certificados por bandera legacy en manifiesto: $($summary.rust_manifest_real)")
$lines.Add("- Endpoints Rust declarados como implementados en implemented_endpoints.json: $($summary.rust_implemented_declared_file)")
$lines.Add("- Endpoints Rust declarados pero no marcados como implementados: $($summary.rust_declared_untracked)")
$lines.Add("- Endpoints Rust con handler generico: $($summary.rust_generic)")
$lines.Add("- Endpoints Rust faltantes en router: $($summary.rust_missing)")
$lines.Add("- Hints de posible brecha de seguridad: $($summary.security_mismatch_hints)")
$lines.Add("- Nota: existe una inconsistencia entre `endpoints_manifest.json` (`implemented_in_rust`) y `implemented_endpoints.json`; ambos numeros se reportan por separado.")
$lines.Add("- Nota: 'Readiness' en esta auditoria significa cobertura de router sin handler generico. No equivale a certificacion funcional completa.")
$lines.Add("")
$lines.Add("## Controladores con menor readiness")
$lines.Add("")
$lines.Add("| Controller | Total | Real | Declarado no certificado | Generico | Faltante | Hints seguridad | Cobertura router |")
$lines.Add("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
foreach ($row in $topControllers) {
    $lines.Add("| $($row.controller) | $($row.total) | $($row.manifest_real) | $($row.declared_untracked) | $($row.generic) | $($row.missing) | $($row.security_mismatch_hint) | $($row.readiness_percent)% |")
}

$lines.Add("")
$lines.Add("## Endpoints faltantes")
$lines.Add("")
$lines.Add("| Controller | Metodo | Path |")
$lines.Add("| --- | --- | --- |")
foreach ($row in $topMissing) {
    $lines.Add("| $($row.controller) | $($row.method) | $($row.path) |")
}

$lines.Add("")
$lines.Add("## Endpoints genericos o mock")
$lines.Add("")
$lines.Add("| Controller | Metodo | Path | Handler |")
$lines.Add("| --- | --- | --- | --- |")
foreach ($row in $topGeneric) {
    $lines.Add("| $($row.controller) | $($row.method) | $($row.path) | $($row.rust_handler) |")
}

$lines.Add("")
$lines.Add("## Endpoints declarados en Rust pero no certificados por manifiesto")
$lines.Add("")
$lines.Add("| Controller | Metodo | Path | Handler | Auth hint |")
$lines.Add("| --- | --- | --- | --- | --- |")
foreach ($row in $declaredUntracked) {
    $lines.Add("| $($row.controller) | $($row.method) | $($row.path) | $($row.rust_handler) | $($row.rust_auth_hint) |")
}

$lines.Add("")
$lines.Add("## Hints de brecha de seguridad")
$lines.Add("")
$lines.Add("| Controller | Metodo | Path | Guards Nest | Auth Rust |")
$lines.Add("| --- | --- | --- | --- | --- |")
foreach ($row in $securityHints) {
    $lines.Add("| $($row.controller) | $($row.method) | $($row.path) | $($row.nest_guard_hints) | $($row.rust_auth_hint) |")
}

$lines.Add("")
$lines.Add("## Archivos generados")
$lines.Add("")
$lines.Add('- `summary.json`')
$lines.Add('- `controller_summary.csv`')
$lines.Add('- `endpoint_matrix.csv`')

$lines | Set-Content -Path $reportPath -Encoding UTF8

Write-Host "Auditoria generada en $OutputDir"
Write-Host "Resumen:"
$summary | Format-List | Out-Host

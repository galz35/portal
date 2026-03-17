$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$connectionFile = Join-Path $root "..\conexion.txt"

if (-not (Test-Path $connectionFile)) {
    throw "No se encontro conexion.txt en $connectionFile"
}

$values = @{}
Get-Content $connectionFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
        return
    }

    $parts = $line -split "=", 2
    if ($parts.Count -eq 2) {
        $values[$parts[0].Trim()] = $parts[1].Trim()
    }
}

$hostName = $values["MSSQL_HOST"]
$port = if ($values["MSSQL_PORT"]) { $values["MSSQL_PORT"] } else { "1433" }
$user = $values["MSSQL_USER"]
$password = $values["MSSQL_PASSWORD"]

if (-not $hostName -or -not $user -or -not $password) {
    throw "La conexion SQL no esta completa en conexion.txt"
}

Add-Type -AssemblyName System.Data

function Invoke-SqlFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Database,
        [Parameter(Mandatory = $true)]
        [string]$FilePath
    )

    $connectionString = "Server=$hostName,$port;Database=$Database;User ID=$user;Password=$password;Encrypt=False;TrustServerCertificate=True;"
    $rawSql = Get-Content $FilePath -Raw
    $batches = [regex]::Split($rawSql, "(?im)^\s*GO\s*(?:--.*)?$")

    $connection = New-Object System.Data.SqlClient.SqlConnection $connectionString
    $connection.Open()

    try {
        foreach ($batch in $batches) {
            $sql = $batch.Trim()
            if (-not $sql) {
                continue
            }

            $command = $connection.CreateCommand()
            $command.CommandTimeout = 120
            $command.CommandText = $sql
            [void]$command.ExecuteNonQuery()
        }
    }
    finally {
        $connection.Close()
    }
}

$scripts = @(
    @{ Database = "master"; File = "00_crear_portal_vacantes.sql" },
    @{ Database = "PortalVacantes"; File = "00_bootstrap_portal_vacantes.sql" },
    @{ Database = "PortalVacantes"; File = "01_tablas_vacantes.sql" },
    @{ Database = "PortalVacantes"; File = "02_candidato_externo.sql" },
    @{ Database = "PortalVacantes"; File = "02_indices_vacantes.sql" },
    @{ Database = "PortalVacantes"; File = "03_seed_estados_y_catalogos.sql" },
    @{ Database = "PortalVacantes"; File = "04_sp_vacantes.sql" },
    @{ Database = "PortalVacantes"; File = "05_sp_postulaciones.sql" },
    @{ Database = "PortalVacantes"; File = "06_sp_terna.sql" },
    @{ Database = "PortalVacantes"; File = "07_sp_lista_negra.sql" },
    @{ Database = "PortalVacantes"; File = "08_sp_reportes.sql" },
    @{ Database = "PortalVacantes"; File = "09_tablas_ia_cv.sql" },
    @{ Database = "PortalVacantes"; File = "10_indices_ia_cv.sql" },
    @{ Database = "PortalVacantes"; File = "11_sp_ia_cv.sql" },
    @{ Database = "PortalVacantes"; File = "12_tablas_requisicion_descriptor.sql" },
    @{ Database = "PortalVacantes"; File = "13_indices_requisicion_descriptor.sql" },
    @{ Database = "PortalVacantes"; File = "14_sp_requisicion_descriptor.sql" },
    @{ Database = "PortalVacantes"; File = "15_sp_suspension_automatica.sql" },
    @{ Database = "PortalVacantes"; File = "16_candidato_externo_postulacion_y_perfil.sql" },
    @{ Database = "PortalVacantes"; File = "17_postulacion_externa_rh.sql" },
    @{ Database = "PortalVacantes"; File = "18_candidato_cv_seguro.sql" },
    @{ Database = "PortalVacantes"; File = "19_candidato_auth_y_operacion_hardening.sql" },
    @{ Database = "PortalVacantes"; File = "21_candidato_perfil_claro.sql" },
    @{ Database = "PortalVacantes"; File = "22_rh_postulaciones_filtros_claro.sql" }
)

foreach ($script in $scripts) {
    $filePath = Join-Path $PSScriptRoot $script.File
    Write-Host "Ejecutando $($script.File) en $($script.Database)..."
    Invoke-SqlFile -Database $script.Database -FilePath $filePath
}

Write-Host "Provisionamiento PortalVacantes completado."

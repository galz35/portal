# Matriz de Metricas de Negocio

| Metrica | Origen | Frecuencia | Dueno | Dashboard |
| --- | --- | --- | --- | --- |
| vacantes_activas | SQL / vacantes-api | diaria | RH | vacantes_negocio_dashboard |
| vacantes_ocupadas | SQL / vacantes-api | diaria | RH | vacantes_negocio_dashboard |
| postulaciones_creadas | vacantes-api | continua | RH | vacantes_negocio_dashboard |
| internos_vs_externos | SQL / vacantes-api | diaria | RH | vacantes_negocio_dashboard |
| cv_subidos | vacantes-api | continua | Reclutamiento | vacantes_api_dashboard |
| analisis_ia_fallidos | ATS / integracion externa | continua | Reclutamiento / TI | vacantes_api_dashboard |
| logins_fallidos | core-api | continua | Seguridad | core_api_dashboard |
| accesos_planer | planer-api | continua | Operaciones | planer_api_dashboard |

"use client";

import React, { useRef } from 'react';

interface ReporteAtencionProps {
    data: any;
    onClose: () => void;
}

function getSemaforoColor(nivel: string) {
    switch (nivel) {
        case 'V': return '#22c55e';
        case 'A': return '#f59e0b';
        case 'R': return '#ef4444';
        default: return '#6b7280';
    }
}

function getSemaforoLabel(nivel: string) {
    switch (nivel) {
        case 'V': return 'Verde (Bajo)';
        case 'A': return 'Amarillo (Medio)';
        case 'R': return 'Rojo (Alto)';
        default: return 'N/A';
    }
}

function formatDate(dateStr: string) {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch { return dateStr; }
}

export function ReporteAtencionPrint({ data, onClose }: ReporteAtencionProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte Atención Médica - ${data.paciente_nombre}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #1a1a1a; padding: 20px; font-size: 12px; }
                    .header { text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 15px; margin-bottom: 20px; }
                    .header h1 { color: #0066cc; font-size: 20px; margin-bottom: 4px; }
                    .header p { color: #666; font-size: 11px; }
                    .section { margin-bottom: 18px; page-break-inside: avoid; }
                    .section-title { background: #0066cc; color: white; padding: 6px 12px; font-size: 13px; font-weight: bold; border-radius: 3px 3px 0 0; }
                    .section-body { border: 1px solid #ddd; border-top: none; padding: 12px; }
                    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
                    .field { margin-bottom: 6px; }
                    .field-label { font-weight: bold; color: #555; font-size: 10px; text-transform: uppercase; }
                    .field-value { font-size: 12px; margin-top: 2px; }
                    .semaforo { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
                    .diagnostico-box { background: #f0f7ff; border-left: 4px solid #0066cc; padding: 10px; margin: 8px 0; }
                    .signos-table { width: 100%; border-collapse: collapse; }
                    .signos-table th, .signos-table td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
                    .signos-table th { background: #f5f5f5; font-size: 10px; text-transform: uppercase; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; color: #999; font-size: 10px; }
                    .firma { margin-top: 60px; text-align: center; }
                    .firma-line { border-top: 1px solid #333; width: 250px; margin: 0 auto; padding-top: 5px; }
                    @media print { 
                        body { padding: 0; } 
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print" style="margin-bottom: 15px; text-align: right;">
                    <button onclick="window.print()" style="background: #0066cc; color: white; border: none; padding: 8px 20px; cursor: pointer; border-radius: 4px; font-size: 14px;">🖨️ Imprimir / Guardar PDF</button>
                    <button onclick="window.close()" style="background: #999; color: white; border: none; padding: 8px 20px; cursor: pointer; border-radius: 4px; font-size: 14px; margin-left: 8px;">Cerrar</button>
                </div>

                <div class="header">
                    <h1>📋 REPORTE DE ATENCIÓN MÉDICA</h1>
                    <p>Claro Mi Salud — Sistema de Salud Ocupacional</p>
                    <p>Fecha de generación: ${formatDate(data.fechaGeneracion)}</p>
                </div>

                <div class="section">
                    <div class="section-title">👤 DATOS DEL PACIENTE</div>
                    <div class="section-body">
                        <div class="grid-2">
                            <div class="field"><div class="field-label">Nombre Completo</div><div class="field-value">${data.paciente_nombre || 'N/A'}</div></div>
                            <div class="field"><div class="field-label">Carnet</div><div class="field-value">${data.paciente_carnet || 'N/A'}</div></div>
                            <div class="field"><div class="field-label">Fecha Nacimiento</div><div class="field-value">${formatDate(data.paciente_nacimiento)}</div></div>
                            <div class="field"><div class="field-label">Sexo</div><div class="field-value">${data.paciente_sexo || 'N/A'}</div></div>
                            <div class="field"><div class="field-label">Gerencia / Área</div><div class="field-value">${data.paciente_gerencia || ''} / ${data.paciente_area || ''}</div></div>
                            <div class="field"><div class="field-label">Contacto</div><div class="field-value">${data.paciente_telefono || ''} | ${data.paciente_correo || ''}</div></div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">📅 DATOS DE LA CITA</div>
                    <div class="section-body">
                        <div class="grid-3">
                            <div class="field"><div class="field-label">Fecha</div><div class="field-value">${formatDate(data.fecha_cita)}</div></div>
                            <div class="field"><div class="field-label">Hora</div><div class="field-value">${data.hora_cita || 'N/A'}</div></div>
                            <div class="field"><div class="field-label">Canal Origen</div><div class="field-value">${data.canal_origen || 'N/A'}</div></div>
                        </div>
                        <div class="grid-2" style="margin-top: 8px;">
                            <div class="field"><div class="field-label">Caso Clínico</div><div class="field-value">${data.codigo_caso || 'Sin caso asociado'}</div></div>
                            <div class="field"><div class="field-label">Motivo</div><div class="field-value">${data.motivo_resumen || data.motivo_consulta || 'N/A'}</div></div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">🩺 SIGNOS VITALES</div>
                    <div class="section-body">
                        <table class="signos-table">
                            <tr>
                                <th>Peso (kg)</th><th>Altura (m)</th><th>P. Arterial</th><th>F. Cardíaca</th><th>Temperatura (°C)</th>
                            </tr>
                            <tr>
                                <td>${data.peso_kg ?? 'N/R'}</td>
                                <td>${data.altura_m ?? 'N/R'}</td>
                                <td>${data.presion_arterial || 'N/R'}</td>
                                <td>${data.frecuencia_cardiaca ? data.frecuencia_cardiaca + ' bpm' : 'N/R'}</td>
                                <td>${data.temperatura_c ? data.temperatura_c + '°C' : 'N/R'}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">🔍 DIAGNÓSTICO Y TRATAMIENTO</div>
                    <div class="section-body">
                        <div class="diagnostico-box">
                            <div class="field-label">Diagnóstico Principal</div>
                            <div class="field-value" style="font-size: 14px; font-weight: bold; margin-top: 4px;">${data.diagnostico_principal || 'N/A'}</div>
                        </div>
                        <div class="grid-2" style="margin-top: 10px;">
                            <div class="field"><div class="field-label">Plan de Tratamiento</div><div class="field-value">${data.plan_tratamiento || 'No especificado'}</div></div>
                            <div class="field"><div class="field-label">Recomendaciones</div><div class="field-value">${data.recomendaciones || 'No especificadas'}</div></div>
                        </div>
                        <div class="grid-2" style="margin-top: 8px;">
                            <div class="field"><div class="field-label">Requiere Seguimiento</div><div class="field-value">${data.requiere_seguimiento ? '✅ Sí' : '❌ No'}</div></div>
                            <div class="field"><div class="field-label">Siguiente Cita</div><div class="field-value">${data.fecha_siguiente_cita ? formatDate(data.fecha_siguiente_cita) : 'No programada'}</div></div>
                        </div>
                    </div>
                </div>

                ${data.examenes && data.examenes.length > 0 ? `
                <div class="section">
                    <div class="section-title">🧪 EXÁMENES SOLICITADOS</div>
                    <div class="section-body">
                        <table class="signos-table">
                            <tr><th>Tipo</th><th>Estado</th><th>Laboratorio</th></tr>
                            ${data.examenes.map((e: any) => `<tr><td>${e.tipo_examen}</td><td>${e.estado_examen}</td><td>${e.laboratorio || 'N/A'}</td></tr>`).join('')}
                        </table>
                    </div>
                </div>` : ''}

                <div class="section">
                    <div class="section-title">👨‍⚕️ MÉDICO TRATANTE</div>
                    <div class="section-body">
                        <div class="grid-2">
                            <div class="field"><div class="field-label">Nombre</div><div class="field-value">${data.medico_nombre || 'N/A'}</div></div>
                            <div class="field"><div class="field-label">Especialidad</div><div class="field-value">${data.medico_especialidad || 'General'}</div></div>
                        </div>
                    </div>
                </div>

                <div class="firma">
                    <div class="firma-line">
                        <p><strong>${data.medico_nombre || ''}</strong></p>
                        <p style="color: #666; font-size: 10px;">${data.medico_especialidad || 'Médico'} | ${data.medico_carnet || ''}</p>
                    </div>
                </div>

                <div class="footer">
                    <p>Documento generado por Claro Mi Salud — Este documento es confidencial y de uso médico exclusivo.</p>
                    <p>${formatDate(data.fechaGeneracion)}</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div>
            <div ref={printRef} style={{ display: 'none' }}></div>
            <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                🖨️ Imprimir Reporte
            </button>
        </div>
    );
}

export function ReportePacientePrint({ data, onClose }: { data: any; onClose: () => void }) {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Historial Clínico - ${data.paciente?.nombre_completo}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #1a1a1a; padding: 20px; font-size: 12px; }
                    .header { text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 15px; margin-bottom: 20px; }
                    .header h1 { color: #0066cc; font-size: 20px; }
                    .header p { color: #666; font-size: 11px; }
                    .section { margin-bottom: 18px; page-break-inside: avoid; }
                    .section-title { background: #0066cc; color: white; padding: 6px 12px; font-size: 13px; font-weight: bold; border-radius: 3px 3px 0 0; }
                    .section-body { border: 1px solid #ddd; border-top: none; padding: 12px; }
                    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                    .field { margin-bottom: 6px; }
                    .field-label { font-weight: bold; color: #555; font-size: 10px; text-transform: uppercase; }
                    .field-value { font-size: 12px; margin-top: 2px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                    th, td { border: 1px solid #ddd; padding: 5px 8px; text-align: left; font-size: 11px; }
                    th { background: #f5f5f5; font-size: 10px; text-transform: uppercase; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; color: #999; font-size: 10px; }
                    .no-print { margin-bottom: 15px; text-align: right; }
                    @media print { .no-print { display: none !important; } }
                </style>
            </head>
            <body>
                <div class="no-print">
                    <button onclick="window.print()" style="background: #0066cc; color: white; border: none; padding: 8px 20px; cursor: pointer; border-radius: 4px;">🖨️ Imprimir / Guardar PDF</button>
                    <button onclick="window.close()" style="background: #999; color: white; border: none; padding: 8px 20px; cursor: pointer; border-radius: 4px; margin-left: 8px;">Cerrar</button>
                </div>

                <div class="header">
                    <h1>📋 HISTORIAL CLÍNICO DEL PACIENTE</h1>
                    <p>Claro Mi Salud — Sistema de Salud Ocupacional</p>
                    <p>Generado: ${formatDate(data.fechaGeneracion)}</p>
                </div>

                <div class="section">
                    <div class="section-title">👤 DATOS DEL PACIENTE</div>
                    <div class="section-body">
                        <div class="grid-2">
                            <div class="field"><div class="field-label">Nombre</div><div class="field-value">${data.paciente?.nombre_completo || 'N/A'}</div></div>
                            <div class="field"><div class="field-label">Carnet</div><div class="field-value">${data.paciente?.carnet || 'N/A'}</div></div>
                            <div class="field"><div class="field-label">Nacimiento</div><div class="field-value">${formatDate(data.paciente?.fecha_nacimiento)}</div></div>
                            <div class="field"><div class="field-label">Gerencia / Área</div><div class="field-value">${data.paciente?.gerencia || ''} / ${data.paciente?.area || ''}</div></div>
                        </div>
                    </div>
                </div>

                ${data.atenciones && data.atenciones.length > 0 ? `
                <div class="section">
                    <div class="section-title">🩺 HISTORIAL DE ATENCIONES (${data.atenciones.length})</div>
                    <div class="section-body">
                        <table>
                            <tr><th>Fecha</th><th>Diagnóstico</th><th>Plan</th><th>Médico</th></tr>
                            ${data.atenciones.map((a: any) => `<tr><td>${formatDate(a.fecha_atencion)}</td><td>${a.diagnostico_principal}</td><td>${a.plan_tratamiento || 'N/A'}</td><td>${a.medico_nombre || 'N/A'}</td></tr>`).join('')}
                        </table>
                    </div>
                </div>` : ''}

                ${data.examenes && data.examenes.length > 0 ? `
                <div class="section">
                    <div class="section-title">🧪 EXÁMENES (${data.examenes.length})</div>
                    <div class="section-body">
                        <table>
                            <tr><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Resultado</th></tr>
                            ${data.examenes.map((e: any) => `<tr><td>${e.tipo_examen}</td><td>${formatDate(e.fecha_solicitud)}</td><td>${e.estado_examen}</td><td>${e.resultado_resumen || 'Pendiente'}</td></tr>`).join('')}
                        </table>
                    </div>
                </div>` : ''}

                ${data.vacunas && data.vacunas.length > 0 ? `
                <div class="section">
                    <div class="section-title">💉 VACUNAS (${data.vacunas.length})</div>
                    <div class="section-body">
                        <table>
                            <tr><th>Vacuna</th><th>Dosis</th><th>Fecha</th><th>Médico</th></tr>
                            ${data.vacunas.map((v: any) => `<tr><td>${v.tipo_vacuna}</td><td>${v.dosis}</td><td>${formatDate(v.fecha_aplicacion)}</td><td>${v.medico_nombre || 'N/A'}</td></tr>`).join('')}
                        </table>
                    </div>
                </div>` : ''}

                <div class="footer">
                    <p>Documento generado por Claro Mi Salud — Confidencial</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            🖨️ Imprimir Historial
        </button>
    );
}

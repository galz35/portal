"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SemaforoBadge } from '@/components/shared/SemaforoBadge';
import type { CitaMedica, Paciente, EmpleadoEmp2024, CasoClinico } from '@/lib/types/domain';
import { Badge } from '@/components/ui/badge';

interface Step1Props {
    citaData: {
        cita: CitaMedica;
        paciente: Paciente;
        empleado: EmpleadoEmp2024;
        caso: CasoClinico;
    };
}

export function Step1_Resumen({ citaData }: Step1Props) {
    const { cita, paciente, empleado, caso } = citaData;
    const datosPsico = caso?.datosExtra?.Psicosocial;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalles de la Cita</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p><strong>Fecha y Hora:</strong> {new Date(cita.fechaCita).toLocaleDateString('es-ES')} a las {cita.horaCita}</p>
                        <p><strong>Origen:</strong> {cita.canalOrigen}</p>
                         <div className="flex items-center gap-2">
                            <strong>Semáforo del Paciente:</strong> 
                            <SemaforoBadge nivel={cita.nivelSemaforoPaciente} />
                        </div>
                        {datosPsico && (
                             <div className="space-y-2 pt-2 border-t">
                                <h4 className="font-semibold">Contexto Psicosocial (Reportado)</h4>
                                <div className='flex gap-2 flex-wrap'>
                                    {datosPsico.estres && <Badge variant='secondary'>Estrés: {datosPsico.estres}</Badge>}
                                    {datosPsico.animo && <Badge variant='secondary'>Ánimo: {datosPsico.animo}</Badge>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Motivo de la Cita</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground italic pl-4 border-l-2">{cita.motivoResumen}</p>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}

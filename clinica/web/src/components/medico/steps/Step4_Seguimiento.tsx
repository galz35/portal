"use client";

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AtencionMedica, SeguimientoGenerado } from "@/lib/types/domain";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Step4Props {
    atencion: AtencionMedica;
    handleChange: (field: keyof AtencionMedica, value: any) => void;
    setSeguimientos: React.Dispatch<React.SetStateAction<SeguimientoGenerado[]>>;
    idPaciente: string;
}

export function Step4_Seguimiento({ atencion, handleChange, setSeguimientos, idPaciente }: Step4Props) {
    
    useEffect(() => {
        // Automatically suggest follow-up if clinical state is not 'BIEN'
        if (atencion.estadoClinico === 'REGULAR' || atencion.estadoClinico === 'MAL') {
            handleChange('requiereSeguimiento', true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [atencion.estadoClinico]);

    const generarSeguimientoAutomatico = () => {
        if (!atencion.requiereSeguimiento || !atencion.fechaSiguienteCita) return;
        
        const nuevoSeguimiento: SeguimientoGenerado = {
            idSeguimiento: Date.now(),
            idCaso: atencion.idCaso,
            idAtencion: atencion.idAtencion.toString(),
            idPaciente: idPaciente,
            fechaProgramada: atencion.fechaSiguienteCita,
            motivo: `Seguimiento por: ${atencion.diagnosticoPrincipal || 'Revisión'}`,
            estadoInicial: 'PENDIENTE',
            estadoClinicoAlProgramar: atencion.estadoClinico,
        };
        setSeguimientos(prev => [...prev, nuevoSeguimiento]);
        // Ideally show a toast notification
    };

    return (
        <Card>
            <CardHeader><CardTitle>Seguimiento y Recordatorios</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="requiere-seguimiento"
                        checked={atencion.requiereSeguimiento}
                        onCheckedChange={(checked) => handleChange('requiereSeguimiento', checked)}
                    />
                    <Label htmlFor="requiere-seguimiento" className="text-base">¿Requiere seguimiento?</Label>
                </div>

                {atencion.requiereSeguimiento && (
                    <div className="p-4 border rounded-md space-y-4 bg-muted/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Fecha Próxima Cita</Label>
                                <Input type="date" value={atencion.fechaSiguienteCita || ''} onChange={(e) => handleChange('fechaSiguienteCita', e.target.value)} />
                             </div>
                             <div className="space-y-2">
                                <Label>Tipo de Cita</Label>
                                <Select value={atencion.tipoSiguienteCita} onValueChange={(value) => handleChange('tipoSiguienteCita', value)}>
                                    <SelectTrigger><SelectValue placeholder="Seleccione tipo..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CONTROL">Control</SelectItem>
                                        <SelectItem value="RESULTADO_EXAMEN">Resultado de Examen</SelectItem>
                                        <SelectItem value="OTRO">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notas para el seguimiento</Label>
                            <Textarea value={atencion.notasSeguimientoMedico || ''} onChange={(e) => handleChange('notasSeguimientoMedico', e.target.value)} placeholder="Ej: Verificar tolerancia al tratamiento, reevaluar síntomas..."/>
                        </div>
                         <Button onClick={generarSeguimientoAutomatico} disabled={!atencion.fechaSiguienteCita}>Generar Seguimiento Automático</Button>
                         <p className="text-xs text-muted-foreground">Esto creará una tarea de seguimiento en el sistema.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

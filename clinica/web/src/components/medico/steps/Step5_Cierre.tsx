"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AtencionMedica, VacunaAplicada, RegistroPsicosocial } from "@/lib/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


// Subcomponents defined in the same file for simplicity
const VacunasEmpresaBlock: React.FC<{ vacunas: VacunaAplicada[], setVacunas: React.Dispatch<React.SetStateAction<VacunaAplicada[]>>, idAtencion: number, idPaciente: string }> = ({ vacunas, setVacunas, idAtencion, idPaciente }) => {
    
    const handleAdd = () => {
        setVacunas(prev => [...prev, { idVacunaRegistro: Date.now(), idAtencion: idAtencion.toString(), tipoVacuna: '', dosis: '', fechaAplicacion: new Date().toISOString().split('T')[0], idPaciente: idPaciente }]);
    };
    
    const handleRemove = (id: number) => {
        setVacunas(prev => prev.filter(v => v.idVacunaRegistro !== id));
    };

    const handleChange = (id: number, field: keyof VacunaAplicada, value: string) => {
        setVacunas(prev => prev.map(v => v.idVacunaRegistro === id ? { ...v, [field]: value } : v));
    };

    return (
        <Card>
            <CardHeader><CardTitle>Acciones / Vacunas de Empresa</CardTitle></CardHeader>
            <CardContent>
                {vacunas.map(vacuna => (
                    <div key={vacuna.idVacunaRegistro} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-2 border rounded-md items-end">
                        <Input placeholder="Tipo Vacuna" value={vacuna.tipoVacuna} onChange={(e) => handleChange(vacuna.idVacunaRegistro, 'tipoVacuna', e.target.value)} />
                        <Input placeholder="Dosis" value={vacuna.dosis} onChange={(e) => handleChange(vacuna.idVacunaRegistro, 'dosis', e.target.value)} />
                        <Input type="date" value={vacuna.fechaAplicacion} onChange={(e) => handleChange(vacuna.idVacunaRegistro, 'fechaAplicacion', e.target.value)} />
                        <div className="flex gap-2">
                            <Input placeholder="Observaciones" value={vacuna.observaciones || ''} onChange={(e) => handleChange(vacuna.idVacunaRegistro, 'observaciones', e.target.value)} />
                            <Button variant="ghost" size="icon" onClick={() => handleRemove(vacuna.idVacunaRegistro)}><Trash2 className="text-destructive"/></Button>
                        </div>
                    </div>
                ))}
                <Button variant="outline" onClick={handleAdd}>+ Agregar Vacuna</Button>
            </CardContent>
        </Card>
    );
};

const PsicosocialBlock: React.FC<{ psico: RegistroPsicosocial, setPsico: (field: keyof RegistroPsicosocial, value: any) => void }> = ({ psico, setPsico }) => {
    
    const sintomas = ['Ansiedad', 'Insomnio', 'Tristeza', 'Irritabilidad', 'Desmotivación', 'Apatía'];

    const handleSintomaChange = (sintoma: string, checked: boolean) => {
        const currentSintomas = psico.sintomasPsico || [];
        const newSintomas = checked ? [...currentSintomas, sintoma] : currentSintomas.filter(s => s !== sintoma);
        setPsico('sintomasPsico', newSintomas);
    };
    
    return (
        <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                        <CardTitle>Registro Psicosocial (Opcional)</CardTitle>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="confidencial">Confidencial</Label>
                            <Switch id="confidencial" checked={psico.confidencial} onCheckedChange={(c) => setPsico('confidencial', c)} />
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4 p-2">
                        <div>
                            <Label>Nivel de Estrés Percibido</Label>
                            <div className="flex gap-2 mt-2">
                                {(['Bajo', 'Medio', 'Alto'] as const).map(level => (
                                     <Badge key={level} onClick={() => setPsico('nivelEstres', level)} variant={psico.nivelEstres === level ? 'default' : 'outline'} className={cn('cursor-pointer', psico.nivelEstres === level ? 'bg-primary' : '')}>{level}</Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Síntomas Psicológicos Referidos</Label>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                {sintomas.map(sintoma => (
                                    <div key={sintoma} className="flex items-center gap-2">
                                        <Checkbox id={`sintoma-${sintoma}`} checked={psico.sintomasPsico?.includes(sintoma)} onCheckedChange={(c) => handleSintomaChange(sintoma, !!c)} />
                                        <Label htmlFor={`sintoma-${sintoma}`}>{sintoma}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                             <Label>Notas Psicosociales</Label>
                             <Textarea placeholder="Detalles adicionales, narrativa del paciente, etc." value={psico.notasPsico || ''} onChange={(e) => setPsico('notasPsico', e.target.value)} />
                        </div>
                         <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox id="riesgo-suicida" checked={psico.riesgoSuicida} onCheckedChange={(c) => setPsico('riesgoSuicida', !!c)} />
                                <Label htmlFor="riesgo-suicida" className="text-destructive font-semibold">¿Riesgo suicida?</Label>
                            </div>
                             <div className="flex items-center gap-2">
                                <Checkbox id="derivar-psico" checked={psico.derivarAPsico} onCheckedChange={(c) => setPsico('derivarAPsico', !!c)} />
                                <Label htmlFor="derivar-psico">¿Derivar a Psicología?</Label>
                            </div>
                         </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};


interface Step5Props {
    atencion: AtencionMedica;
    vacunas: VacunaAplicada[];
    setVacunas: React.Dispatch<React.SetStateAction<VacunaAplicada[]>>;
    psico: RegistroPsicosocial;
    setPsico: (field: keyof RegistroPsicosocial, value: any) => void;
    idPaciente: string;
}

export function Step5_Cierre({ atencion, vacunas, setVacunas, psico, setPsico, idPaciente }: Step5Props) {
    return (
        <div className="space-y-6">
            <VacunasEmpresaBlock vacunas={vacunas} setVacunas={setVacunas} idAtencion={atencion.idAtencion} idPaciente={idPaciente} />
            <PsicosocialBlock psico={psico} setPsico={setPsico} />

            <Card>
                <CardHeader><CardTitle>Resumen Final de la Atención</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                    <p><strong>Estado Clínico:</strong> <Badge variant={atencion.estadoClinico === 'BIEN' ? 'default' : atencion.estadoClinico === 'REGULAR' ? 'secondary' : 'destructive'} className={cn(atencion.estadoClinico === 'BIEN' && 'bg-green-500')}>{atencion.estadoClinico}</Badge></p>
                    <p><strong>Diagnóstico:</strong> {atencion.diagnosticoPrincipal || 'No especificado'}</p>
                    <p><strong>Requiere Seguimiento:</strong> {atencion.requiereSeguimiento ? `Sí, para el ${atencion.fechaSiguienteCita}` : 'No'}</p>
                    <p><strong>Vacunas/Acciones registradas:</strong> {vacunas.length}</p>
                    <p><strong>Se registró info psicosocial:</strong> {psico.nivelEstres || (psico.sintomasPsico && psico.sintomasPsico.length > 0) || psico.notasPsico ? 'Sí' : 'No'}</p>
                </CardContent>
            </Card>
        </div>
    );
}

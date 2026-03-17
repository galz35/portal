"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AtencionMedica, EstadoClinico } from "@/lib/types/domain";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";


interface Step2Props {
    atencion: AtencionMedica;
    handleChange: (field: keyof AtencionMedica, value: any) => void;
}

const estadoClinicoOptions: { value: EstadoClinico, label: string, className: string }[] = [
    { value: 'BIEN', label: 'Bien', className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' },
    { value: 'REGULAR', label: 'Regular', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200' },
    { value: 'MAL', label: 'Mal', className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200' }
];

export function Step2_Vitales({ atencion, handleChange }: Step2Props) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Signos Vitales</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Temperatura (°C)</label>
                        <Input type="number" step="0.1" value={atencion.temperaturaC || ''} onChange={(e) => handleChange('temperaturaC', e.target.valueAsNumber)} />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Peso (kg)</label>
                        <Input type="number" step="0.1" value={atencion.pesoKg || ''} onChange={(e) => handleChange('pesoKg', e.target.valueAsNumber)} />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Altura (m)</label>
                        <Input type="number" step="0.01" value={atencion.alturaM || ''} onChange={(e) => handleChange('alturaM', e.target.valueAsNumber)} />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Frec. Cardíaca</label>
                        <Input type="number" value={atencion.frecuenciaCardiaca || ''} onChange={(e) => handleChange('frecuenciaCardiaca', e.target.valueAsNumber)} />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Presión Arterial</label>
                        <Input placeholder="120/80" value={atencion.presionArterial || ''} onChange={(e) => handleChange('presionArterial', e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Estado Clínico General</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <p className="text-sm text-muted-foreground">Selecciona el estado general del paciente durante esta consulta.</p>
                     <div className="flex gap-4">
                        {estadoClinicoOptions.map(option => (
                            <Button
                                key={option.value}
                                variant="outline"
                                className={cn("text-base py-6 flex-1", atencion.estadoClinico === option.value && option.className)}
                                onClick={() => handleChange('estadoClinico', option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                     </div>
                     {atencion.estadoClinico === 'MAL' && (
                        <Alert variant="destructive" className="bg-red-50">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Estado Clínico: Mal</AlertTitle>
                            <AlertDescription>
                                Considera acciones inmediatas, como referir a emergencias o iniciar un seguimiento prioritario.
                            </AlertDescription>
                        </Alert>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}

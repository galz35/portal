"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AtencionMedica } from "@/lib/types/domain";
import { Textarea } from "@/components/ui/textarea";

interface Step3Props {
    atencion: AtencionMedica;
    handleChange: (field: keyof AtencionMedica, value: any) => void;
}

export function Step3_Diagnostico({ atencion, handleChange }: Step3Props) {
    return (
         <Card>
            <CardHeader><CardTitle>Diagnóstico y Plan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Diagnóstico Principal</label>
                <Textarea rows={4} value={atencion.diagnosticoPrincipal} onChange={(e) => handleChange('diagnosticoPrincipal', e.target.value)} placeholder="Ej: Faringoamigdalitis viral..."/>
              </div>

               <div className="space-y-2">
                <label className="text-sm font-medium">Plan de Tratamiento</label>
                <Textarea rows={4} value={atencion.planTratamiento || ''} onChange={(e) => handleChange('planTratamiento', e.target.value)} placeholder="Ej: Reposo, hidratación, paracetamol 500mg cada 8 horas..."/>
              </div>
              
               <div className="space-y-2">
                <label className="text-sm font-medium">Recomendaciones</label>
                <Textarea rows={3} value={atencion.recomendaciones || ''} onChange={(e) => handleChange('recomendaciones', e.target.value)} placeholder="Ej: Evitar cambios bruscos de temperatura, dieta blanda..."/>
              </div>
            </CardContent>
          </Card>
    );
}

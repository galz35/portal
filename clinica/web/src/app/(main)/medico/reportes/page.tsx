import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
      
      <Card>
          <CardHeader>
            <CardTitle>Módulo de Reportes</CardTitle>
            <CardDescription>Esta sección se encuentra en construcción.</CardDescription>
          </CardHeader>
          <CardContent>
              <EmptyState 
                title="Próximamente"
                message="Aquí podrás visualizar gráficos y estadísticas sobre atenciones, diagnósticos frecuentes, niveles de semáforo de los pacientes y más."
              />
          </CardContent>
      </Card>
    </div>
  );
}

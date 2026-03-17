"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { User, FileText, FlaskConical, Repeat, Calendar } from 'lucide-react';
import { CasosService } from '@/lib/services/casos.service';
import type { CasoClinico, Paciente, AtencionMedica, ExamenMedico, SeguimientoPaciente } from '@/lib/types/domain';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SemaforoBadge } from '@/components/shared/SemaforoBadge';
import { Separator } from '@/components/ui/separator';

type CasoDetalle = CasoClinico & {
  paciente: Paciente;
  atenciones: AtencionMedica[];
  examenes: ExamenMedico[];
  seguimientos: SeguimientoPaciente[];
};

export default function DetalleCasoClinicoPage() {
  const params = useParams();
  const id = params.id as string;
  const [caso, setCaso] = useState<CasoDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      CasosService.getCasoById(id)
        .then(data => {
          if (!data) throw new Error('Caso no encontrado');
          setCaso(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        })
    }
  }, [id]);

  if (loading) return <div>Cargando detalle del caso...</div>;
  if (!caso) return <div>Caso no encontrado.</div>;

  const { paciente } = caso;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detalle del Caso: {caso.codigoCaso}</h1>
        <SemaforoBadge nivel={caso.nivelSemaforo} className="px-4 py-2 text-base" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna Izquierda: Datos del Paciente */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <CardTitle>Información del Paciente</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Nombre:</strong> {paciente.nombreCompleto}</p>
            <p><strong>Carnet:</strong> {paciente.carnet}</p>
            <p><strong>Gerencia:</strong> {paciente.gerencia}</p>
            <p><strong>Área:</strong> {paciente.area}</p>
            <p><strong>Teléfono:</strong> {paciente.telefono}</p>
            <p><strong>Correo:</strong> {paciente.correo}</p>
          </CardContent>
        </Card>

        {/* Columna Central: Detalles del Caso */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <CardTitle>Detalles Clínicos</CardTitle>
            </div>
            <CardDescription>
              Creado el {new Date(caso.fechaCreacion).toLocaleDateString('es-ES')} - Estado: {caso.estadoCaso}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Motivo de Consulta</h4>
              <p className="text-sm text-muted-foreground">{caso.motivoConsulta}</p>
            </div>
            <div>
              <h4 className="font-semibold">Resumen Clínico (del usuario)</h4>
              <p className="text-sm text-muted-foreground">{caso.resumenClinicoUsuario || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-semibold">Diagnóstico Preliminar (del usuario)</h4>
              <p className="text-sm text-muted-foreground">{caso.diagnosticoUsuario || 'N/A'}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Mini-listado de Atenciones */}
              <div>
                <h4 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Atenciones</h4>
                <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                  {caso.atenciones && caso.atenciones.length > 0 ? caso.atenciones.map(a => (
                    <li key={a.idAtencion}>{new Date(a.fechaAtencion).toLocaleDateString('es-ES')}</li>
                  )) : <li className="list-none text-muted-foreground">Ninguna</li>}
                </ul>
              </div>

              {/* Mini-listado de Exámenes */}
              <div>
                <h4 className="font-semibold flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Exámenes</h4>
                <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                  {caso.examenes && caso.examenes.length > 0 ? caso.examenes.map(e => (
                    <li key={e.idExamen}>{e.tipoExamen} ({e.estadoExamen})</li>
                  )) : <li className="list-none text-muted-foreground">Ninguno</li>}
                </ul>
              </div>

              {/* Mini-listado de Seguimientos */}
              <div>
                <h4 className="font-semibold flex items-center gap-2"><Repeat className="h-4 w-4" /> Seguimientos</h4>
                <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                  {caso.seguimientos && caso.seguimientos.length > 0 ? caso.seguimientos.map(s => (
                    <li key={s.idSeguimiento}>{s.tipoSeguimiento} ({s.estadoSeguimiento})</li>
                  )) : <li className="list-none text-muted-foreground">Ninguno</li>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

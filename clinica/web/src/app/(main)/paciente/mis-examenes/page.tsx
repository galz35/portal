"use client";

import React, { useEffect, useState } from 'react';
import { Eye, FlaskConical, Calendar, Microscope, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { PacienteService } from '@/lib/services/paciente.service';
import { ExamenMedico } from '@/lib/types/domain';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function MisExamenesPage() {
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();
  const [examenes, setExamenes] = useState<ExamenMedico[]>([]);
  const [selectedExamen, setSelectedExamen] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileLoading) return;

    if (userProfile?.id_paciente) {
      PacienteService.getMisExamenes()
        .then(data => {
          setExamenes(data);
        }).catch(() => {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el historial de exámenes.' });
        }).finally(() => {
          setLoading(false);
        });
    } else if (!profileLoading && !userProfile?.id_paciente) {
      setLoading(false);
    }
  }, [userProfile?.id_paciente, profileLoading, toast]);

  const columns: any[] = [
    { 
      accessor: (row: any) => row.fecha_solicitud || row.fechaSolicitud, 
      header: 'Fecha Solicitud',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#DA291C]" />
            <span className="font-bold text-slate-700">{new Date(row.fecha_solicitud || row.fechaSolicitud).toLocaleDateString()}</span>
        </div>
      )
    },
    { 
      accessor: (row: any) => row.tipo_examen || row.tipoExamen, 
      header: 'Tipo de Examen',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Microscope size={16} />
            </div>
            <span className="font-extrabold text-[#0F172A]">{row.tipo_examen || row.tipoExamen}</span>
        </div>
      )
    },
    {
      accessor: (row: any) => row.estado_examen || row.estadoExamen,
      header: 'Estado',
      cell: (row: any) => {
        const isDone = (row.estado_examen || row.estadoExamen) === 'ENTREGADO';
        return (
            <Badge className={cn("border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest", isDone ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400")}>
                {isDone ? 'Resultado Listo' : 'En Proceso'}
            </Badge>
        )
      },
    },
    {
      accessor: (row: any) => 'actions',
      header: 'Ver',
      cell: (row: any) => {
        const isDone = (row.estado_examen || row.estadoExamen) === 'ENTREGADO';
        return (
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-xl" disabled={!isDone} onClick={() => setSelectedExamen(row)}>
                <Eye className={cn("h-4 w-4", isDone ? "text-[#DA291C]" : "text-slate-200")} />
            </Button>
        )
      },
    },
  ];

  if (loading) return (
    <div className="space-y-10 animate-pulse">
        <div className="h-12 w-80 bg-slate-200 rounded-2xl" />
        <div className="h-[500px] bg-slate-100 rounded-[40px]" />
    </div>
  );

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 text-left">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Apoyo Diagnóstico</span>
            <div className="flex items-center gap-1 text-[#DA291C] font-bold text-[11px]">
               <FlaskConical size={14} /> Laboratorio Clínico
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Mis Exámenes</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Consulte los resultados de sus análisis médicos y estudios especializados.</p>
        </motion.div>
      </header>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-10 pb-0">
            <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                <Microscope className="text-[#DA291C]" /> Historial de Estudios
            </CardTitle>
            <CardDescription className="font-medium">Relación de exámenes solicitados y su estatus actual.</CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          <DataTable columns={columns} data={examenes} filterColumn="tipoExamen" filterPlaceholder="Buscar tipo de examen..." />
        </CardContent>
      </Card>

      {selectedExamen && (
        <Dialog open={!!selectedExamen} onOpenChange={(open) => !open && setSelectedExamen(null)}>
          <DialogContent className="rounded-[32px] border-none shadow-2xl sm:max-w-lg p-0 overflow-hidden">
            <div className="p-10 bg-slate-900 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Microscope size={120} />
                </div>
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] uppercase tracking-widest">Resultado Final</Badge>
                        <span className="text-xs font-bold text-slate-400">{new Date(selectedExamen.fecha_resultado || selectedExamen.fechaResultado).toLocaleDateString()}</span>
                    </div>
                    <DialogTitle className="text-3xl font-black text-white leading-tight">
                        {selectedExamen.tipo_examen || selectedExamen.tipoExamen}
                    </DialogTitle>
                </DialogHeader>
            </div>
            
            <div className="p-10 space-y-8 bg-white">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Laboratorio Emisor</p>
                        <p className="font-bold text-[#0F172A]">{selectedExamen.laboratorio || 'Clínica Corporativa'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Referencia</p>
                        <p className="font-bold text-[#0F172A]">REQ-{selectedExamen.id_examen || selectedExamen.id || 'N/A'}</p>
                    </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                    <p className="text-[10px] font-black text-[#DA291C] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 size={12} /> Interpretación del Resultado
                    </p>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-700 font-medium leading-relaxed italic">
                            "{selectedExamen.resultado_resumen || selectedExamen.resultadoResumen || 'No hay un resumen textual del resultado. Por favor, consulte con su médico tratante.'}"
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={18} />
                    <p className="text-[11px] font-bold text-amber-800 leading-tight">
                        Nota: Este resumen es para su referencia. Los valores técnicos completos están en su expediente digital y fueron revisados por su especialista.
                    </p>
                </div>
            </div>

            <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
                <Button onClick={() => setSelectedExamen(null)} className="w-full h-12 bg-[#0F172A] text-white font-black rounded-xl">Entendido</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

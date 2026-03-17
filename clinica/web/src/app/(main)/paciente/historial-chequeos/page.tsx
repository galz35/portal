"use client";

import React, { useEffect, useState } from 'react';
import { Eye, History, ShieldCheck, UserCircle, Activity, Info, Calendar } from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { ChequeoBienestar } from '@/lib/types/domain';
import { PacienteService } from '@/lib/services/paciente.service';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { SemaforoBadge } from '@/components/shared/SemaforoBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistorialChequeosPage() {
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();
  const [chequeos, setChequeos] = useState<ChequeoBienestar[]>([]);
  const [selectedChequeo, setSelectedChequeo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileLoading) return;

    if (userProfile?.id_paciente) {
      PacienteService.getMisChequeos()
        .then(data => {
          setChequeos(data);
        }).catch(() => {
          toast({ variant: 'destructive', title: 'Fallo de Carga', description: 'No pudimos recuperar tu historial de bienestar.' });
        }).finally(() => {
          setLoading(false);
        });
    } else if (!profileLoading && !userProfile?.id_paciente) {
      setLoading(false);
    }
  }, [userProfile?.id_paciente, profileLoading, toast]);

  const columns: any[] = [
    {
      accessor: (row: any) => row.fecha_registro || row.fechaRegistro,
      header: 'Fecha de Registro',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#DA291C]" />
            <span className="font-bold text-slate-700">{new Date(row.fecha_registro || row.fechaRegistro).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      )
    },
    { 
        accessor: (row: any) => row.estado_animo || row.estadoAnimo, 
        header: 'Estado de Ánimo',
        cell: (row: any) => <span className="font-medium text-slate-600 capitalize">{row.estado_animo || row.estadoAnimo}</span>
    },
    { 
        accessor: (row: any) => row.modalidad_trabajo || row.modalidadTrabajo, 
        header: 'Modalidad',
        cell: (row: any) => <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">{row.modalidad_trabajo || row.modalidadTrabajo}</span>
    },
    {
      accessor: (row: any) => row.apto_laboral || row.aptoLaboral,
      header: 'Apto para Hoy',
      cell: (row: any) => {
        const isApto = row.apto_laboral ?? row.aptoLaboral;
        return (
            <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest", isApto ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                {isApto ? 'Sí' : 'No'}
            </div>
        )
      },
    },
    {
      accessor: (row: any) => row.nivel_semaforo || row.nivelSemaforo,
      header: 'Nivel Salud',
      cell: (row: any) => <SemaforoBadge nivel={row.nivel_semaforo || row.nivelSemaforo} />,
    },
    {
      accessor: (row: any) => 'actions',
      header: 'Atención',
      cell: (row: any) => (
        <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-xl" onClick={() => setSelectedChequeo(row)}>
          <Eye className="h-4 w-4 text-slate-400" />
        </Button>
      ),
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
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Auto-Monitoreo</span>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
               <ShieldCheck size={14} /> Historial de Bienestar
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Mi Salud Diaria</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Consulte sus registros anteriores y siga la evolución de su bienestar preventivo.</p>
        </motion.div>
      </header>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-10 pb-0 flex flex-row justify-between items-center">
            <div>
                <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                    <History className="text-[#DA291C]" /> Bitácora Personal
                </CardTitle>
                <CardDescription className="font-medium">Consolidado de sus chequeos de salud reportados.</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          <DataTable columns={columns} data={chequeos} filterColumn="estadoAnimo" filterPlaceholder="Buscar por estado de ánimo..." />
        </CardContent>
      </Card>

      {selectedChequeo && (
        <Dialog open={!!selectedChequeo} onOpenChange={(open) => !open && setSelectedChequeo(null)}>
          <DialogContent className="rounded-[32px] border-none shadow-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Detalle del Registro</DialogTitle>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Activity size={12} className="text-[#DA291C]" /> Reporte de Salud {new Date(selectedChequeo.fecha_registro || selectedChequeo.fechaRegistro).toLocaleDateString()}
              </p>
            </DialogHeader>
            <div className="mt-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Ánimo Reportado</p>
                     <p className="font-bold text-[#0F172A] capitalize">{selectedChequeo.estado_animo || selectedChequeo.estadoAnimo}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Modalidad</p>
                     <p className="font-bold text-[#0F172A] uppercase">{selectedChequeo.modalidad_trabajo || selectedChequeo.modalidadTrabajo}</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-2">
                     <span className="text-sm font-bold text-slate-600">Sede / Ubicación</span>
                     <span className="text-sm font-black text-[#0F172A]">{selectedChequeo.ruta || 'No especificada'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2">
                     <span className="text-sm font-bold text-slate-600">¿Apto para laborar?</span>
                     <span className={cn("text-sm font-black", (selectedChequeo.apto_laboral ?? selectedChequeo.aptoLaboral) ? "text-emerald-600" : "text-red-600")}>
                        {(selectedChequeo.apto_laboral ?? selectedChequeo.aptoLaboral) ? 'Sí' : 'No'}
                     </span>
                  </div>
                  <div className="flex items-center justify-between p-2">
                     <span className="text-sm font-bold text-slate-600">Estatus Clínico</span>
                     <SemaforoBadge nivel={selectedChequeo.nivel_semaforo || selectedChequeo.nivelSemaforo} />
                  </div>
               </div>

               {(selectedChequeo.comentario_general || selectedChequeo.comentarioGeneral) && (
                 <div className="p-6 bg-[#DA291C]/5 rounded-3xl border border-dashed border-[#DA291C]/20">
                    <p className="text-[10px] font-black text-[#DA291C] uppercase mb-2 flex items-center gap-2"><Info size={12} /> Observaciones</p>
                    <p className="text-sm font-medium text-slate-700 italic">"{selectedChequeo.comentario_general || selectedChequeo.comentarioGeneral}"</p>
                 </div>
               )}
            </div>
            <div className="mt-8">
               <Button onClick={() => setSelectedChequeo(null)} className="w-full h-12 bg-[#0F172A] text-white font-black rounded-xl">Cerrar Detalle</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

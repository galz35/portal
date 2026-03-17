"use client";

import React, { useEffect, useState } from 'react';
import { Syringe, Calendar, UserCheck, Info, ShieldCheck, ClipboardCheck } from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { PacienteService } from '@/lib/services/paciente.service';
import { VacunaAplicada } from '@/lib/types/domain';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function MisVacunasPage() {
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();
  const [vacunas, setVacunas] = useState<VacunaAplicada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileLoading) return;

    if (userProfile?.id_paciente) {
      PacienteService.getMisVacunas()
        .then(data => {
          setVacunas(data);
        }).catch(() => {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar su cartilla de vacunación digital.' });
        }).finally(() => {
          setLoading(false);
        });
    } else if (!profileLoading && !userProfile?.id_paciente) {
      setLoading(false);
    }
  }, [userProfile?.id_paciente, profileLoading, toast]);

  const columns: any[] = [
    { 
      accessor: (row: any) => row.fecha_aplicacion || row.fechaAplicacion, 
      header: 'Fecha de Aplicación',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#DA291C]" />
            <span className="font-bold text-slate-700">{new Date(row.fecha_aplicacion || row.fechaAplicacion).toLocaleDateString()}</span>
        </div>
      )
    },
    { 
      accessor: (row: any) => row.tipo_vacuna || row.tipoVacuna, 
      header: 'Tipo de Inmunización',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-[#DA291C] flex items-center justify-center">
                <Syringe size={18} />
            </div>
            <div>
                <p className="font-extrabold text-[#0F172A]">{row.tipo_vacuna || row.tipoVacuna}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Esquema Corporativo</p>
            </div>
        </div>
      )
    },
    { 
        accessor: (row: any) => row.dosis, 
        header: 'Dosis',
        cell: (row: any) => <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-tight">{row.dosis}</span>
    },
    {
      accessor: (row: any) => row.medico?.nombreCompleto || row.medico_nombre || 'Servicio Corporativo',
      header: 'Verificado por',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
            <UserCheck size={14} className="text-emerald-500" />
            <span className="text-sm font-medium text-slate-600">{row.medico?.nombreCompleto || row.medico_nombre || 'Servicio Médico'}</span>
        </div>
      )
    },
    { 
        accessor: (row: any) => row.observaciones, 
        header: 'Notas / Observaciones',
        cell: (row: any) => <span className="text-sm text-slate-500 italic max-w-[300px] truncate block">{row.observaciones || 'Sin anotaciones particulares.'}</span>
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
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Prevención Primaria</span>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
               <ShieldCheck size={14} /> Cartilla Digital
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Mi Inmunización</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Historial certificado de vacunas aplicadas bajo el programa de salud ocupacional.</p>
        </motion.div>
      </header>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-10 pb-0">
            <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                <ClipboardCheck className="text-[#DA291C]" /> Registro de Dosis
            </CardTitle>
            <CardDescription className="font-medium">Certificación oficial de las vacunas recibidas en la clínica.</CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          <DataTable columns={columns} data={vacunas} filterColumn="tipoVacuna" filterPlaceholder="Buscar por tipo de vacuna..." />
        </CardContent>
      </Card>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 flex items-start gap-4"
      >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#DA291C] shadow-sm shrink-0">
              <Info size={20} />
          </div>
          <div>
              <p className="font-black text-[#0F172A]">Información Importante</p>
              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                  Si tiene vacunas aplicadas externamente que no figuran en esta cartilla, por favor presente su comprobante físico en el Servicio Médico para la actualización de su expediente digital.
              </p>
          </div>
      </motion.div>
    </div>
  );
}

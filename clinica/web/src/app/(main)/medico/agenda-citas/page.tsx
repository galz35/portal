"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { MedicoService } from '@/lib/services/medico.service';
import { CasosService } from '@/lib/services/casos.service';
import { AdminService } from '@/lib/services/admin.service';
import { CasoClinico, Paciente, Medico, TriajeIA } from '@/lib/types/domain';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { SemaforoBadge } from '@/components/shared/SemaforoBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CalendarPlus, Ban, Loader2, Sparkles, Filter, Activity, Clock, UserCheck, ChevronRight, Stethoscope } from 'lucide-react';
import { useConfirm } from '@/hooks/use-confirm';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

type CasoConPaciente = CasoClinico & { paciente?: Paciente };

export default function GestionCitasPage() {
  const { pais } = useUserProfile();
  const { toast } = useToast();
  const [ConfirmDialog, confirm] = useConfirm();

  const [casos, setCasos] = useState<CasoConPaciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCaso, setSelectedCaso] = useState<any | null>(null);
  const [isAgendarOpen, setAgendarOpen] = useState(false);
  const [isAnalisisOpen, setAnalisisOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!pais) return;
    setIsLoading(true);
    try {
      const [casosData, medicosData] = await Promise.all([
        CasosService.getCasosClinicos({ pais, estado: 'Abierto' }),
        AdminService.getMedicos()
      ]);
      setCasos(casosData);
      setMedicos(medicosData);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error de Sincronización', description: 'No se pudieron recuperar las solicitudes pendientes.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pais]);

  const handleAgendar = async (formData: any) => {
    if (!selectedCaso) return;
    setIsSubmitting(true);
    const body = {
      idCaso: selectedCaso.id || selectedCaso.id_caso,
      idPaciente: selectedCaso.id_paciente || selectedCaso.idPaciente,
      idMedico: formData.idMedico,
      fechaCita: formData.fechaCita,
      horaCita: formData.horaCita,
    };

    try {
      await MedicoService.agendarCita(body);
      toast({ title: 'Cita Confirmada', description: `Se ha notificado al paciente y asignado al médico especialista.` });
      setAgendarOpen(false);
      setSelectedCaso(null);
      fetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error al Agendar', description: e.message || 'No fue posible completar la programación.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelar = async (caso: any) => {
    const isConfirmed = await confirm({
      title: '¿Descartar Solicitud?',
      description: `Esta acción cancelará permanentemente la solicitud de atención del paciente. ¿Desea continuar?`
    });

    if (isConfirmed) {
      setIsSubmitting(true);
      try {
        await CasosService.updateCaso(caso.id || caso.id_caso, { estadoCaso: 'Cancelado' });
        toast({ title: 'Solicitud Cancelada', description: `El caso ha sido cerrado sin atención.` });
        fetchData();
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cancelar el caso.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  const columns: any[] = [
    {
      accessor: (row: any) => row.fecha_creacion || row.fechaCreacion,
      header: 'F. Solicitud',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-400" />
            <span className="font-bold text-slate-600">{new Date(row.fecha_creacion || row.fechaCreacion).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      accessor: (row: any) => row.paciente_nombre || row.paciente?.nombre_completo || row.paciente?.nombreCompleto || 'Cargando...',
      header: 'Paciente',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                {String(row.paciente_nombre || row.paciente?.nombre_completo || 'P').charAt(0)}
            </div>
            <span className="font-extrabold text-[#0F172A]">{row.paciente_nombre || row.paciente?.nombre_completo || 'N/A'}</span>
        </div>
      )
    },
    { 
        accessor: (row: any) => row.motivo_consulta || row.motivoConsulta, 
        header: 'Motivo / Síntomas',
        cell: (row: any) => <span className="font-medium text-slate-500 max-w-[200px] truncate block">{row.motivo_consulta || row.motivoConsulta}</span>
    },
    {
      accessor: (row: any) => row.nivel_semaforo || row.nivelSemaforo,
      header: 'Semáforo',
      cell: (row: any) => <SemaforoBadge nivel={row.nivel_semaforo || row.nivelSemaforo} />,
    },
    {
      accessor: (row: any) => 'triaje',
      header: 'Análisis IA',
      cell: (row: any) => {
        const hasIA = row.triajeIA || row.triaje_ia;
        return (
            <Button 
                variant="ghost" 
                size="sm" 
                className={cn("gap-2 rounded-xl h-10 px-4 font-black transition-all", hasIA ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : "bg-slate-50 text-slate-400 opacity-50")}
                disabled={!hasIA}
                onClick={() => { setSelectedCaso(row); setAnalisisOpen(true); }}
            >
                <Sparkles size={14} /> {hasIA ? 'Consultar IA' : 'Procesando...'}
            </Button>
        )
      }
    },
    {
      accessor: (row: any) => 'actions',
      header: 'Gestión',
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" className="bg-[#DA291C] hover:bg-[#b52217] text-white rounded-xl h-10 px-4 font-black" onClick={() => { setSelectedCaso(row); setAgendarOpen(true); }}>
            <CalendarPlus size={16} className="mr-2" /> Agendar
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-500 rounded-xl" onClick={() => handleCancelar(row)}>
            <Ban size={16} />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return (
    <div className="space-y-10 animate-pulse py-10">
        <div className="h-12 w-80 bg-slate-200 rounded-2xl" />
        <div className="h-[500px] bg-slate-100 rounded-[40px]" />
    </div>
  );

  return (
    <div className="space-y-10 pb-10">
      <ConfirmDialog />
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 text-left">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Coordinación Médica</span>
            <div className="flex items-center gap-1 text-indigo-500 font-bold text-[11px]">
               <Activity size={14} /> Triaje & Agendamiento
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Gestión de Citas</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Administre las solicitudes de atención y asigne especialistas basados en la prioridad clínica.</p>
        </motion.div>
      </header>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-10 pb-0 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                <Filter className="text-[#DA291C]" size={24} /> Solicitudes Activas
            </CardTitle>
            <CardDescription className="font-medium">Casos pendientes de evaluación y programación en agenda.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          <DataTable columns={columns} data={casos} filterColumn="paciente_nombre" filterPlaceholder='Buscar por nombre de paciente...' />
        </CardContent>
      </Card>

      {/* Agendar Modal */}
      <Dialog open={isAgendarOpen} onOpenChange={(open) => { if (!open) setSelectedCaso(null); setAgendarOpen(open); }}>
        <DialogContent className="rounded-[32px] border-none shadow-2xl sm:max-w-xl p-0 overflow-hidden">
          <div className="p-10 bg-slate-900 text-white">
            <DialogHeader>
                <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-[#DA291C] text-white border-none font-black text-[9px] uppercase tracking-widest">Programación</Badge>
                </div>
                <DialogTitle className="text-3xl font-black">Asignar Consulta</DialogTitle>
                <DialogDescription className="text-slate-400 font-medium text-lg">
                    Paciente: {selectedCaso?.paciente_nombre || selectedCaso?.paciente?.nombreCompleto}
                </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            handleAgendar(data);
          }} className="p-10 space-y-8 bg-white">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fecha-cita" className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Fecha Sugerida</Label>
                  <Input id="fecha-cita" name="fechaCita" type="date" required className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora-cita" className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Hora de Cita</Label>
                  <Input id="hora-cita" name="horaCita" type="time" required className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="medico-cita" className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Profesional Asignado</Label>
                <Select name="idMedico" required>
                  <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-slate-50 font-black"><SelectValue placeholder="Seleccione un especialista" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {medicos?.map(m => <SelectItem key={m.id_medico || (m as any).id} value={String(m.id_medico || (m as any).id)} className="rounded-lg h-10">{m.nombre_completo || (m as any).nombreCompleto}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Motivo de Solicitud</p>
                <p className="text-sm font-bold text-slate-600 italic">"{selectedCaso?.motivo_consulta || selectedCaso?.motivoConsulta}"</p>
            </div>

            <DialogFooter className="pt-4 gap-4">
                <Button type="button" variant="ghost" onClick={() => setAgendarOpen(false)} className="rounded-xl h-12 font-black">Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 bg-[#DA291C] hover:bg-[#b52217] text-white font-black rounded-xl shadow-xl shadow-red-500/20">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar Programación'}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Analisis IA Modal */}
      <Dialog open={isAnalisisOpen} onOpenChange={(open) => { if (!open) setSelectedCaso(null); setAnalisisOpen(open); }}>
        <DialogContent className="rounded-[40px] border-none shadow-2xl sm:max-w-2xl p-0 overflow-hidden">
          <div className="p-10 bg-indigo-900 text-white relative">
            <Sparkles className="absolute top-10 right-10 text-white/10" size={120} />
            <DialogHeader>
              <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-white/10 text-white border-white/20 font-black text-[9px] uppercase tracking-widest backdrop-blur-sm">Inteligencia Artificial</Badge>
              </div>
              <DialogTitle className="text-4xl font-black flex items-center gap-3">
                 Pre-Triaje Clínico
              </DialogTitle>
              <DialogDescription className="text-indigo-200 text-lg font-medium">Asistencia diagnóstica para el paciente {selectedCaso?.paciente_nombre || selectedCaso?.paciente?.nombreCompleto}</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-10 bg-white">
            <div className="grid grid-cols-2 gap-8">
                <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-black">Nivel de Riesgo</p>
                    <Badge className={cn("px-4 py-1.5 rounded-xl font-black text-xs uppercase border-none", (selectedCaso?.triajeIA?.nivel_urgencia || selectedCaso?.triaje_ia?.nivel_urgencia) === 'Emergencia' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white')}>
                        {selectedCaso?.triajeIA?.nivel_urgencia || selectedCaso?.triaje_ia?.nivel_urgencia || 'Sin calificar'}
                    </Badge>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-black">Especialidad Sugerida</p>
                    <p className="font-black text-[#0F172A] text-xl flex items-center gap-2"><Stethoscope size={20} className="text-indigo-500" /> {selectedCaso?.triajeIA?.especialidad_sugerida || selectedCaso?.triaje_ia?.especialidad_sugerida || 'Medicina General'}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2"><UserCheck size={14} /> Resumen para el Médico</p>
                   <p className="text-xl font-medium text-slate-700 italic border-l-4 border-indigo-200 pl-6 py-2">
                       "{selectedCaso?.triajeIA?.resumen_medico || selectedCaso?.triaje_ia?.resumen_medico}"
                   </p>
                </div>
                
                <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 border-dashed">
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Acción Recomendada por IA</p>
                   <p className="font-black text-indigo-900 text-lg">{selectedCaso?.triajeIA?.accion_recomendada || selectedCaso?.triaje_ia?.accion_recomendada}</p>
                </div>
            </div>

            <DialogFooter className="pt-4">
                <Button variant="ghost" onClick={() => setAnalisisOpen(false)} className="rounded-xl h-14 px-8 font-black">Ignorar por ahora</Button>
                <Button onClick={() => { setAnalisisOpen(false); setAgendarOpen(true); }} className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20">
                    <CalendarPlus size={20} className="mr-2" /> Proceder a Programar
                </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

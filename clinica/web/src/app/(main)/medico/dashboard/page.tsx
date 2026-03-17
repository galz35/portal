"use client";

import React, { useEffect, useState } from 'react';
import { MedicoService, MedicoDashboardData } from '@/lib/services/medico.service';
import { useUserProfile } from '@/hooks/use-user-profile';
import { KpiCard } from '@/components/shared/KpiCard';
import { CalendarCheck, UserX, Repeat, FlaskConical, AlertTriangle, ArrowRight, ClipboardList, Activity, Stethoscope, Clock, ShieldCheck, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SemaforoBadge } from '@/components/shared/SemaforoBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function DashboardMedicoPage() {
  const { userProfile, loading: profileLoading } = useUserProfile();
  const [data, setData] = useState<MedicoDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (profileLoading) return;

    if (userProfile?.id_medico) {
      setLoading(true);
      MedicoService.getDashboard()
        .then(dashboardData => {
          setData(dashboardData);
          setLoading(false);
        }).catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else if (!userProfile?.id_medico && !profileLoading) {
      setLoading(false);
    }
  }, [userProfile?.id_medico, profileLoading]);

  if (loading) return (
    <div className="space-y-10 animate-pulse py-10">
        <div className="h-12 w-80 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[32px]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[500px] bg-slate-100 rounded-[40px]" />
            <div className="h-[500px] bg-slate-100 rounded-[40px]" />
        </div>
    </div>
  );

  if (!userProfile?.id_medico) return <EmptyState title="Perfil no médico" message="No pudimos validar sus credenciales de especialista para este panel." />;
  if (!data) return <EmptyState title="Panel vacío" message="No se han sincronizado datos clínicos aún." />;

  const { citasHoyCount, citasHoy, pacientesEnRojoCount, pacientesEnRojo, casosAbiertos } = data;

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 text-left">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Portal del Especialista</span>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
               <Activity size={14} className="animate-pulse" /> Estado del Centro: Óptimo
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Escritorio Médico</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Panel de control asistencial y monitoreo de salud corporativa en tiempo real.</p>
        </motion.div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Agenda de Hoy" value={citasHoyCount} icon={CalendarCheck} description="Pacientes en lista" />
        <KpiCard title="Riesgo Crítico" value={pacientesEnRojoCount} icon={UserX} description="Requieren contacto" trend="Alerta Roja" isNegative={true} />
        <KpiCard title="Seguimientos" value={casosAbiertos} icon={Repeat} description="Casos bajo evolución" />
        <KpiCard title="Laboratorio" value={0} icon={FlaskConical} description="Resultados por validar" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-100 rounded-[40px] overflow-hidden bg-white">
          <CardHeader className="p-10 pb-4">
            <div className="flex items-center justify-between">
                <div>
                   <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                        <Clock className="text-[#DA291C]" size={24} /> Programación del Día
                    </CardTitle>
                    <CardDescription className="font-medium">Gestione las consultas agendadas para su turno actual.</CardDescription>
                </div>
                <Button variant="ghost" className="rounded-xl h-10 px-4 font-black text-slate-400 hover:text-[#0F172A]" onClick={() => router.push('/medico/agenda-calendario')}>
                    Ver Agenda Completa
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <div className="overflow-hidden rounded-2xl border border-slate-50">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="py-5 font-black text-[#0F172A] text-[10px] uppercase tracking-widest pl-6">Horario</TableHead>
                    <TableHead className="py-5 font-black text-[#0F172A] text-[10px] uppercase tracking-widest">Colaborador / Paciente</TableHead>
                    <TableHead className="py-5 font-black text-[#0F172A] text-[10px] uppercase tracking-widest text-center">Triage</TableHead>
                    <TableHead className="py-5 font-black text-[#0F172A] text-[10px] uppercase tracking-widest text-right pr-6">Atención</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citasHoy.length > 0 ? citasHoy.map((cita: any, idx: number) => (
                    <TableRow key={cita.id_cita} className="group border-slate-50 hover:bg-slate-50/50 transition-all font-medium h-20">
                      <TableCell className="pl-6 font-black text-slate-800 text-base">{cita.hora_cita?.substring(0, 5) || '12:00'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-[#0F172A] leading-none mb-1">{cita.paciente_nombre || 'N/A'}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {cita.carnet_paciente || '---'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <SemaforoBadge nivel={cita.nivel_semaforo || 'V'} />
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          size="sm" 
                          className="bg-[#DA291C] hover:bg-[#b52217] text-white rounded-xl font-black h-10 px-5 transition-all hover:scale-105 active:scale-95"
                          onClick={() => router.push(`/medico/atencion/${cita.id_cita}`)}
                        >
                          Atender <Stethoscope size={16} className="ml-2" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 text-slate-400 font-bold italic">
                        No hay consultas pendientes de atención para el período actual.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
            <Card className="border-none shadow-2xl shadow-red-50 rounded-[40px] overflow-hidden bg-slate-900 border-2 border-red-500/10">
              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                  <AlertTriangle className="text-red-500 animate-bounce" size={24} />
                  Alertas de Riesgo
                </CardTitle>
                <CardDescription className="text-slate-400 font-medium leading-tight">Casos críticos detectados por el sistema de monitoreo diario.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-4 space-y-6">
                <AnimatePresence>
                    {pacientesEnRojo.length > 0 ? pacientesEnRojo.map((paciente: any, index: number) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-3 relative z-10">
                           <Badge className="bg-red-500 text-white font-black text-[8px] uppercase tracking-[0.2em] border-none px-2 py-0.5">Emergencia</Badge>
                           <Clock size={10} className="text-slate-500" />
                        </div>
                        <p className="font-black text-white text-lg group-hover:text-red-400 transition-colors relative z-10">{paciente.nombre_completo || paciente.nombreCompleto}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1 leading-tight relative z-10">Signos clínicos fuera de rango normal. Contactar de inmediato.</p>
                      </motion.div>
                    )) : (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 text-slate-600">
                            <ShieldCheck size={32} />
                        </div>
                        <p className="text-sm text-slate-400 font-bold">Todo bajo control.</p>
                        <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mt-1">Sincronización al día</p>
                      </div>
                    )}
                </AnimatePresence>
              </CardContent>
              {pacientesEnRojo.length > 0 && (
                <CardFooter className="p-10 pt-0">
                    <Button variant="ghost" className="w-full text-white/50 hover:text-white hover:bg-white/10 font-bold h-12 rounded-2xl">
                        Protocolar Seguimiento Masivo
                    </Button>
                </CardFooter>
              )}
            </Card>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-[#DA291C] rounded-[32px] text-white flex items-center gap-6 shadow-2xl shadow-red-200"
            >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <HeartPulse size={32} />
                </div>
                <div>
                   <p className="font-black text-xl leading-none italic">Claro Salud AI</p>
                   <p className="text-xs font-bold text-white/70 mt-1 uppercase tracking-widest">Motor Diagnóstico Activo</p>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}

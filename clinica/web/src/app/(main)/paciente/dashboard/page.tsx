"use client";

import React, { useEffect, useState } from 'react';
import { HeartPulse, Calendar, Repeat, Activity, ArrowRight, User, Clock, ChevronRight, ShieldCheck, Sparkles, Footprints, Stethoscope } from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { KpiCard } from '@/components/shared/KpiCard';
import { SemaforoBadge } from '@/components/shared/SemaforoBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { PacienteService, DashboardData } from '@/lib/services/paciente.service';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function DashboardPacientePage() {
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (profileLoading) return;

    if (userProfile?.id_paciente) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const dashboardData = await PacienteService.getDashboard();
          setData(dashboardData);
        } catch (err) {
          toast({ title: 'Error de Red', description: 'No pudimos sincronizar su historial médico en este momento.', variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else if (!profileLoading && !userProfile?.id_paciente) {
      setLoading(false);
    }
  }, [userProfile?.id_paciente, profileLoading, toast]);

  if (loading || profileLoading) return (
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

  if (!userProfile?.id_paciente) return <EmptyState title="Expediente no iniciado" message="No se ha detectado un registro de paciente asociado a su cuenta corporativa." />;
  if (!data) return <EmptyState title="Sincronización Pendiente" message="Su panel de salud se activará cuando realice su primer chequeo de bienestar." />;

  const { kpis, ultimoChequeoData, timeline } = data;

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Portal del Colaborador</span>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
               <ShieldCheck size={14} /> Expediente Digital Protegido
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tighter leading-none">
            Hola, {userProfile.nombre_completo.split(' ')[0]}
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Este es el estado actual de su bienestar corporativo.</p>
        </motion.div>
        
        <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 px-8 h-14 bg-white border border-slate-100 rounded-2xl font-black text-sm text-[#0F172A] hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/50 group"
            onClick={() => router.push('/paciente/perfil')}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#DA291C] group-hover:text-white transition-all">
            <User size={20} />
          </div>
          Ver Mi Ficha Médica
        </motion.button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Nivel de Triage" value="" icon={HeartPulse} description="Estado clínico actual">
          <SemaforoBadge nivel={kpis.estadoActual} className="text-xs font-black px-5 py-2 rounded-xl" />
        </KpiCard>
        <KpiCard 
          title="Registro Reciente" 
          value={kpis.ultimoChequeo ? new Date(kpis.ultimoChequeo).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Sin datos'} 
          icon={Activity} 
          description="Último chequeo"
        />
        <KpiCard title="Cita Próxima" value={kpis.proximaCita || 'Sin agenda'} icon={Calendar} description="Consulta programada" />
        <KpiCard title="Casos Clínicos" value={kpis.seguimientosActivos} icon={Repeat} description="En seguimiento" trend={kpis.seguimientosActivos > 0 ? "Activo" : "Sin casos"} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-100 rounded-[40px] overflow-hidden bg-white">
          <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                <Stethoscope className="text-[#DA291C]" size={28} /> Informe de Bienestar
              </CardTitle>
              <CardDescription className="font-medium text-slate-500 mt-1">Detalle analítico de su último reporte de salud.</CardDescription>
            </div>
            <button 
                onClick={() => router.push('/paciente/historial-chequeos')}
                className="text-[12px] font-black text-[#DA291C] hover:bg-red-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2"
            >
              Todo el Historial <ChevronRight size={14} />
            </button>
          </CardHeader>
          <CardContent className="p-10 pt-8">
            {ultimoChequeoData ? (
              <div className="relative p-10 bg-slate-50 rounded-[32px] border border-slate-100 overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                    <HeartPulse size={300} />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#DA291C] shadow-lg shadow-slate-200/50">
                        <Clock size={28} />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Última validación</p>
                       <p className="text-lg font-black text-[#0F172A]">
                         {new Date(ultimoChequeoData.fecha_registro || ultimoChequeoData.fechaRegistro).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                       </p>
                     </div>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Semaforización</p>
                       <SemaforoBadge nivel={ultimoChequeoData.nivel_semaforo} className="px-6 py-2 rounded-xl font-black" />
                   </div>
                </div>
                <div className="h-px bg-slate-200/60 mb-8" />
                <div className="space-y-4 relative z-10">
                   <p className="text-lg text-slate-600 leading-relaxed font-medium">
                     Su estado se registra como <span className="font-extrabold text-[#0F172A]">{ultimoChequeoData.nivel_semaforo === 'V' ? 'Excelente' : ultimoChequeoData.nivel_semaforo === 'A' ? 'Preventivo' : 'Prioritario'}</span>. 
                     De acuerdo a sus indicadores, el equipo médico sugiere <span className="text-[#DA291C] font-black underline decoration-red-200 decoration-4 underline-offset-4">mantener el monitoreo diario</span> para asegurar su bienestar laboral continuo.
                   </p>
                </div>
              </div>
            ) : (
                <div className="p-20 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                    <Stethoscope size={48} className="mx-auto text-slate-300 mb-6" />
                    <p className="text-slate-500 font-bold text-lg max-w-xs mx-auto">No hay chequeos clínicos registrados en su bitácora digital.</p>
                </div>
            )}
          </CardContent>
          <CardFooter className="px-10 pb-10">
            <Button 
                onClick={() => router.push('/paciente/chequeo-diario')}
                className="w-full h-14 bg-[#DA291C] hover:bg-[#b52217] text-white font-black rounded-2xl text-lg shadow-xl shadow-red-500/20"
            >
                Realizar Chequeo de Hoy <Sparkles size={18} className="ml-3" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-none shadow-2xl shadow-slate-200 rounded-[40px] overflow-hidden bg-slate-900 border-b-8 border-emerald-500">
          <CardHeader className="p-10 pb-0">
            <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                <Footprints size={24} className="text-[#DA291C]" /> Eventos de Salud
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium">Línea de tiempo de sus atenciones.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-8">
            <div className="space-y-10 relative">
              <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-white/5" />
              {timeline.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-6 relative"
                >
                  <div className="w-3 h-3 rounded-full bg-[#DA291C] ring-4 ring-red-500/20 z-10 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-base font-black text-white group-hover:text-[#DA291C] transition-colors">{item.title}</p>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">
                      {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {timeline.length === 0 && (
                <div className="text-center py-10">
                    <History size={32} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-sm text-slate-500 font-bold italic">Bitácora sin eventos registrados.</p>
                </div>
              )}
            </div>
            
            <button 
                onClick={() => router.push('/paciente/mis-citas')}
                className="w-full mt-12 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-xs text-white transition-all flex items-center justify-center gap-3 group uppercase tracking-widest"
            >
              Explorar Historial <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-[#DA291C]" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

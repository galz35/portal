"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, PlusCircle, History, Info } from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { PacienteService } from '@/lib/services/paciente.service';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function MisCitasPage() {
  const { userProfile, loading: profileLoading } = useUserProfile();
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (profileLoading) return;

    if (userProfile?.id_paciente) {
      const fetchCitas = async () => {
        try {
          const data = await PacienteService.getMisCitas();
          setCitas(data);
        } catch (error) {
          console.error(error);
          toast({
            title: "Error de sincronización",
            description: "No pudimos recuperar tu historial de citas.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };
      fetchCitas();
    } else if (!profileLoading && !userProfile?.id_paciente) {
      setLoading(false);
    }
  }, [userProfile?.id_paciente, profileLoading, toast]);

  if (loading) return (
    <div className="space-y-10 animate-pulse">
        <div className="h-12 w-64 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[32px]" />)}
        </div>
    </div>
  );

  if (!userProfile?.id_paciente) return <EmptyState title="Identidad no verificada" message="No se encontró un expediente de paciente asociado a tu cuenta corporativa." />;

  const citasPendientes = citas.filter(c => c.estado_cita === 'PROGRAMADA' || c.estado_cita === 'SOLICITADA');
  const historialCitas = citas.filter(c => c.estado_cita !== 'PROGRAMADA' && c.estado_cita !== 'SOLICITADA');

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 text-left">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Atención Médica</span>
            <div className="flex items-center gap-1 text-[#DA291C] font-bold text-[11px]">
               <Calendar size={14} /> Historial de Consultas
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Mis Citas</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Siga el estado de sus solicitudes y revise atenciones pasadas.</p>
        </motion.div>
        
        <Button onClick={() => navigate('/paciente/solicitar-cita')} className="gap-2 bg-[#DA291C] hover:bg-[#b52217] text-white h-14 px-8 rounded-full font-black shadow-xl shadow-red-500/20 transition-all hover:scale-105 active:scale-95">
          <PlusCircle size={20} /> Solicitar Nueva Cita
        </Button>
      </header>

      {citasPendientes.length > 0 && (
        <section className="space-y-6">
            <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
                <Clock className="text-[#DA291C]" size={22} /> Próximas Atenciones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {citasPendientes.map((cita, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        key={cita.id_cita}
                    >
                        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white group hover:translate-y-[-4px] transition-all">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#DA291C]">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-black text-[#0F172A]">
                                                {cita.motivo || 'Consulta Médica'}
                                            </CardTitle>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Pendiente de Atención</p>
                                        </div>
                                    </div>
                                    <Badge className={cn("px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border-none", cita.estado_cita === 'PROGRAMADA' ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-600")}>
                                        {cita.estado_cita === 'PROGRAMADA' ? 'Confirmada' : 'En espera'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Clock size={16} className="text-[#DA291C]" />
                                        <span className="text-sm font-bold text-slate-600">{new Date(cita.fecha_cita).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} - {cita.hora_cita}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <User size={16} className="text-[#DA291C]" />
                                        <span className="text-sm font-bold text-slate-600 truncate">{cita.medico_nombre || 'Por asignar'}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 border border-dashed border-slate-200">
                                     <MapPin size={16} className="text-slate-400" />
                                     <span className="text-[11px] font-bold text-slate-500 italic">Clínica Corporativa HQ</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>
      )}

      <section className="space-y-6 pt-4">
        <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
            <History className="text-slate-400" size={22} /> Registro Histórico
        </h2>
        {historialCitas.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
              <Info size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold italic">No tienes atenciones finalizadas aún.</p>
          </div>
        ) : (
          <Card className="border-none shadow-2xl shadow-slate-200/30 rounded-[40px] overflow-hidden bg-white">
            <CardContent className="p-0">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-10 py-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Fecha & Hora</th>
                            <th className="px-10 py-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Motivo</th>
                            <th className="px-10 py-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Especialista</th>
                            <th className="px-10 py-5 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {historialCitas.map((cita) => (
                            <tr key={cita.id_cita} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-10 py-6">
                                    <p className="font-extrabold text-[#0F172A]">{new Date(cita.fecha_cita).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{cita.hora_cita}</p>
                                </td>
                                <td className="px-10 py-6">
                                    <p className="font-bold text-slate-600">{cita.motivo || 'Consulta Finalizada'}</p>
                                </td>
                                <td className="px-10 py-6">
                                    <p className="font-bold text-slate-600">{cita.medico_nombre || 'N/A'}</p>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <Badge className="bg-slate-100 text-slate-400 border-none px-3 font-bold text-[9px] uppercase tracking-widest">Atendido</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

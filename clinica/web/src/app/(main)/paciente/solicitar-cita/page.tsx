"use client";

import React, { useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { SolicitudCitaWizard } from '@/components/paciente/SolicitudCitaWizard';
import { EmpleadoEmp2024 } from '@/lib/types/domain';
import { AdminService } from '@/lib/services/admin.service';
import { motion } from 'framer-motion';
import { Calendar, UserCircle, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SolicitarCitaPage() {
    const { userProfile, loading: profileLoading } = useUserProfile();
    const [empleado, setEmpleado] = useState<EmpleadoEmp2024 | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (profileLoading) return;

        if (userProfile?.carnet) {
            setIsLoading(true);
            AdminService.getEmpleados({ carnet: userProfile.carnet }).then(empleados => {
                if (empleados && empleados.length > 0) {
                    setEmpleado(empleados[0]);
                }
                setIsLoading(false);
            }).catch(err => {
                console.error("Error fetching employee info", err);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [userProfile?.carnet, profileLoading]);

    if (isLoading) return (
        <div className="space-y-10 animate-pulse py-10">
            <div className="h-12 w-64 bg-slate-200 rounded-2xl mx-auto md:mx-0" />
            <div className="h-[600px] bg-slate-100 rounded-[40px]" />
        </div>
    );

    return (
        <div className="space-y-10 pb-10 max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 text-left px-4 md:px-0">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Atención Especializada</span>
                        <div className="flex items-center gap-1 text-[#DA291C] font-bold text-[11px]">
                           <Calendar size={14} /> Solicitud de Consulta
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Agendar Cita Médica</h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Inicie su proceso de atención informándonos sobre su estado de salud actual.</p>
                </motion.div>
                
                {empleado && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block">
                        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#DA291C]">
                                    <UserCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Colaborador</p>
                                    <p className="text-sm font-black text-[#0F172A] mt-1">{empleado.nombreCompleto}</p>
                                    <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{empleado.area}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="px-2"
            >
                <SolicitudCitaWizard />
            </motion.div>
            
            <footer className="text-center pb-6">
                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <ShieldCheck size={12} /> Proceso de triaje clínico inteligente - Clínica Corporativa Claro
                </p>
            </footer>
        </div>
    );
}

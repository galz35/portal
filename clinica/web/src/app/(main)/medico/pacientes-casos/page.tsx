"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, MoreHorizontal, Stethoscope, Search, History, Filter, UserCircle, Activity } from 'lucide-react';
import { CasosService } from '@/lib/services/casos.service';
import { CasoClinico, Paciente } from '@/lib/types/domain';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { SemaforoBadge } from '@/components/shared/SemaforoBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Skeleton } from '@/components/ui/skeleton';

type CasoConPaciente = CasoClinico & { paciente: Paciente };

export default function PacientesCasosPage() {
  const { pais } = useUserProfile();
  const [casos, setCasos] = useState<CasoConPaciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pais) return;
    setLoading(true);
    CasosService.getCasosClinicos({ pais })
      .then(data => {
        setCasos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading cases", err);
        setLoading(false);
      });
  }, [pais]);

  const columns: any[] = [
    { 
        accessor: (row: any) => row.codigo_caso || row.codigoCaso, 
        header: 'Expediente',
        cell: (row: any) => <span className="font-black text-slate-400 text-[11px] tracking-widest uppercase">{row.codigo_caso || row.codigoCaso}</span>
    },
    {
      accessor: (row: any) => row.paciente?.nombre_completo || row.paciente?.nombreCompleto || 'Cargando...',
      header: 'Paciente / Colaborador',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#DA291C]/5 flex items-center justify-center text-[#DA291C]">
                <UserCircle size={20} />
            </div>
            <div>
                <p className="font-extrabold text-[#0F172A] leading-none">{row.paciente?.nombre_completo || row.paciente?.nombreCompleto}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Población Activa</p>
            </div>
        </div>
      )
    },
    {
      accessor: (row: any) => row.fecha_creacion || row.fechaCreacion,
      header: 'Apertura',
      cell: (row: any) => (
        <span className="font-bold text-slate-600 italic">
            {new Date(row.fecha_creacion || row.fechaCreacion).toLocaleDateString()}
        </span>
      ),
    },
    { 
        accessor: (row: any) => row.estado_caso || row.estadoCaso, 
        header: 'Estatus',
        cell: (row: any) => (
            <div className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex border-none", (row.estado_caso || row.estadoCaso) === 'Abierto' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                {row.estado_caso || row.estadoCaso}
            </div>
        )
    },
    {
      accessor: (row: any) => row.nivel_semaforo || row.nivelSemaforo,
      header: 'Criterio Salud',
      cell: (row: any) => <SemaforoBadge nivel={row.nivel_semaforo || row.nivelSemaforo} />,
    },
    {
      accessor: (row: any) => 'actions',
      header: 'Gestión',
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
              <span className="sr-only">Menú</span>
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[200px]">
            {row.id_cita || row.idCita ? (
              <DropdownMenuItem asChild className="rounded-xl h-11 focus:bg-red-50 focus:text-[#DA291C]">
                <Link href={`/medico/atencion/${row.id_cita || row.idCita}`}>
                  <Stethoscope className="mr-3 h-4 w-4" /> <span className="font-bold">Retomar Atención</span>
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem asChild className="rounded-xl h-11 focus:bg-slate-50">
              <Link href={`/medico/casos/${row.id || row.id_caso}`}>
                <Eye className="mr-3 h-4 w-4" /> <span className="font-bold">Ver Detalles Expediente</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) return (
    <div className="space-y-10 animate-pulse py-10">
        <div className="h-12 w-80 bg-slate-200 rounded-2xl" />
        <div className="h-[500px] bg-slate-100 rounded-[40px]" />
    </div>
  );

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 text-left">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Atención Médica Digital</span>
            <div className="flex items-center gap-1 text-[#DA291C] font-bold text-[11px]">
               <Activity size={14} /> Gestión de Expedientes
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Pacientes y Casos</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Consulte el historial clínico, estatus de triaje y evoluciones de la población corporativa.</p>
        </motion.div>
      </header>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-10 pb-4 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                <History className="text-[#DA291C]" size={24} /> Historial Clínico Activo
            </CardTitle>
            <CardDescription className="font-medium">Total de expedientes abiertos y en seguimiento especializado.</CardDescription>
          </div>
          <div className="bg-slate-50 p-2 rounded-2xl flex items-center gap-2 border border-slate-100">
             <Search size={18} className="text-slate-400 ml-2" />
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pr-4">Búsqueda Inteligente</span>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          <DataTable
            columns={columns}
            data={casos}
            filterColumn="paciente_nombre"
            filterPlaceholder="Buscar por nombre de paciente..."
          />
        </CardContent>
      </Card>
      
      <footer className="text-center">
         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
             <Filter size={12} /> Exclusivo para personal médico certificado
         </p>
      </footer>
    </div>
  );
}

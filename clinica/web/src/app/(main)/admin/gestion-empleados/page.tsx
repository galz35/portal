"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { AdminService } from '@/lib/services/admin.service';
import { EmpleadoEmp2024 } from '@/lib/types/domain';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, Users, Search, Mail, Phone, Building2, Briefcase, IdCard, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function GestionEmpleadosPage() {
  const { pais } = useUserProfile();
  const { toast } = useToast();
  const [empleadosData, setEmpleadosData] = useState<EmpleadoEmp2024[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmpleados = async () => {
      setIsLoading(true);
      try {
        const data: EmpleadoEmp2024[] = await AdminService.getEmpleados();
        setEmpleadosData(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error de Red',
          description: 'No se pudo sincronizar la base de datos de colaboradores.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmpleados();
  }, [toast]);

  const empleadosDelPais = useMemo(() => {
    if (!empleadosData || !pais) return [];
    return empleadosData.filter(e => e.pais === pais);
  }, [empleadosData, pais]);

  const columns: any[] = [
    { 
        accessor: (row: any) => row.carnet, 
        header: 'ID / Carnet',
        cell: (row: any) => (
            <div className="flex items-center gap-2">
                <IdCard size={14} className="text-[#DA291C]" />
                <span className="font-black text-slate-400 text-[11px] tracking-widest uppercase">{row.carnet}</span>
            </div>
        )
    },
    { 
        accessor: (row: any) => row.nombreCompleto, 
        header: 'Colaborador',
        cell: (row: any) => (
            <div className="flex flex-col">
                <span className="font-extrabold text-[#0F172A] leading-tight">{row.nombreCompleto}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{row.cargo}</span>
            </div>
        )
    },
    { 
        accessor: (row: any) => row.gerencia, 
        header: 'Estructura',
        cell: (row: any) => (
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold text-slate-600 text-[11px]">
                    <Building2 size={12} className="text-slate-400" /> {row.gerencia}
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-400 text-[10px] mt-0.5">
                    <Briefcase size={12} className="text-slate-300" /> {row.area}
                </div>
            </div>
        )
    },
    { 
        accessor: (row: any) => row.correo, 
        header: 'Contacto',
        cell: (row: any) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
                    <Mail size={12} className="text-slate-300" /> {row.correo}
                </div>
                {row.telefono && (
                    <div className="flex items-center gap-2 text-slate-400 font-medium text-[10px]">
                        <Phone size={12} className="text-slate-300" /> {row.telefono}
                    </div>
                )}
            </div>
        )
    },
    {
      accessor: (row: any) => row.estado,
      header: 'Estatus',
      cell: (row: EmpleadoEmp2024) => {
        const isActive = row.estado === 'ACTIVO';
        return (
            <Badge className={cn("px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border-none transition-all shadow-sm", isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400")}>
                {isActive ? 'Activo' : 'Inactivo'}
            </Badge>
        )
      },
    },
  ];

  if (isLoading) return (
    <div className="space-y-10 animate-pulse py-10">
        <div className="h-12 w-80 bg-slate-200 rounded-2xl" />
        <div className="h-[600px] bg-slate-100 rounded-[40px]" />
    </div>
  );

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 text-left">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Recursos Humanos</span>
            <div className="flex items-center gap-1 text-[#DA291C] font-bold text-[11px]">
               <ShieldCheck size={14} /> Directorio de Nómina
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Gestión de Colaboradores</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Administre y consulte la base de datos centralizada de todo el personal para la región de {pais || 'Operación'}.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button className="h-14 px-8 bg-white hover:bg-slate-50 text-[#0F172A] font-black rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-[#DA291C]/10 text-[#DA291C] flex items-center justify-center group-hover:bg-[#DA291C] group-hover:text-white transition-all">
                    <UploadCloud size={20} />
                </div>
                Importar Suministro (.xlsx)
            </Button>
        </motion.div>
      </header>

      <Card className="border-none shadow-2xl shadow-indigo-50/50 rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-10 pb-4 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                <Users className="text-[#DA291C]" size={24} /> Listado Maestro
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">Visualización detallada de la relación laboral y cargos corporativos.</CardDescription>
          </div>
          <div className="bg-slate-50 p-2 rounded-2xl flex items-center gap-2 border border-slate-100">
             <Search size={18} className="text-slate-400 ml-2" />
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pr-4">Búsqueda Unificada</span>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          <DataTable
            columns={columns}
            data={empleadosDelPais}
            filterColumn="nombreCompleto"
            filterPlaceholder="Buscar por nombre, carnet o cargo..."
          />
        </CardContent>
        <CardFooter className="p-10 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users size={12} /> Total Colaboradores en {pais}: {empleadosDelPais.length}
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

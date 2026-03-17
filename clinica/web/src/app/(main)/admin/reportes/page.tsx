"use client";

import React, { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminService } from '@/lib/services/admin.service';
import { useUserProfile } from '@/hooks/use-user-profile';
import { AtencionMedica, EmpleadoEmp2024, Paciente, Medico, CasoClinico } from '@/lib/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileSpreadsheet, Filter, ChartBar, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { DataTable } from '@/components/shared/DataTable';
import { KpiCard } from '@/components/shared/KpiCard';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const reportFilterSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  gerencia: z.string().optional(),
  sexo: z.string().optional(),
  edadFrom: z.coerce.number().optional(),
  edadTo: z.coerce.number().optional(),
});

type FilterValues = z.infer<typeof reportFilterSchema>;
type AtencionCompleta = AtencionMedica & { paciente: Paciente, medico: Medico, caso: CasoClinico, empleado: EmpleadoEmp2024 };

export default function ReportesAdminPage() {
  const { pais } = useUserProfile();
  const { toast } = useToast();
  const [atenciones, setAtenciones] = useState<AtencionCompleta[]>([]);
  const [filteredAtenciones, setFilteredAtenciones] = useState<AtencionCompleta[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<FilterValues>({
    resolver: zodResolver(reportFilterSchema),
    defaultValues: {
      dateRange: {
        from: subDays(new Date(), 30),
        to: new Date(),
      },
      gerencia: 'all',
      sexo: 'all',
    },
  });

  const fetchData = async () => {
    if (!pais) return;
    setLoading(true);
    try {
      const data = await AdminService.getReportesAtenciones({ pais });
      setAtenciones(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reports", err);
      toast({ variant: "destructive", title: "Error de Datos", description: "No se pudieron obtener los registros de atenciones." });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pais]);

  const gerencias = useMemo(() => {
    if (!atenciones.length) return [];
    const g = new Set(atenciones.map(a => a.empleado?.gerencia).filter(Boolean));
    return Array.from(g);
  }, [atenciones]);

  useEffect(() => {
    if (atenciones.length > 0) {
      const initialValues = form.getValues();
      onSubmit(initialValues);
    }
  }, [atenciones]);

  const onSubmit = (values: FilterValues) => {
    const filtered = atenciones.filter(a => {
      const atencionDate = new Date(a.fecha_atencion);
      const fromDate = values.dateRange.from;
      const toDate = values.dateRange.to;
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      if (atencionDate < fromDate || atencionDate > toDate) return false;
      if (values.gerencia && values.gerencia !== 'all' && a.empleado?.gerencia !== values.gerencia) return false;
      if (values.sexo && values.sexo !== 'all' && a.paciente?.sexo !== values.sexo) return false;

      if (values.edadFrom || values.edadTo) {
        const birthDate = new Date(a.paciente?.fecha_nacimiento!);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (values.edadFrom && age < values.edadFrom) return false;
        if (values.edadTo && age > values.edadTo) return false;
      }
      return true;
    });
    setFilteredAtenciones(filtered);
  };

  const exportToExcel = () => {
    if (filteredAtenciones.length === 0) {
      toast({ variant: "destructive", title: "Sin datos", description: "No hay registros filtrados para exportar." });
      return;
    }

    const worksheetData = filteredAtenciones.map(a => ({
      'Fecha': format(new Date(a.fecha_atencion), "dd/MM/yyyy"),
      'Colaborador': a.paciente?.nombre_completo || "N/A",
      'ID/Carnet': a.paciente?.carnet || "N/A",
      'Sexo': a.paciente?.sexo === 'M' ? 'Masculino' : 'Femenino',
      'Gerencia': a.empleado?.gerencia || "N/A",
      'Área': a.empleado?.area || "N/A",
      'Médico Tratante': a.medico?.nombre_completo || "N/A",
      'Especialidad': a.medico?.especialidad || "N/A",
      'Diagnóstico': a.diagnostico_principal || "N/A",
      'Plan de Atención': a.plan_tratamiento || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheets, "Reporte Médico");
    XLSX.writeFile(workbook, `Reporte_Salud_${pais}_${format(new Date(), "yyyyMMdd")}.xlsx`);
    
    toast({ title: "Reporte Generado", description: "El archivo Excel se ha descargado exitosamente." });
  }

  const kpis = useMemo(() => {
    const total = filteredAtenciones.length;
    const totalAge = filteredAtenciones.reduce((sum, a) => {
      const birthDate = a.paciente?.fecha_nacimiento;
      if (!birthDate) return sum + 30;
      const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
      return sum + age;
    }, 0);
    return {
      totalAtenciones: total,
      edadPromedio: total > 0 ? Math.round(totalAge / total) : 0,
      diagnosticosUnicos: new Set(filteredAtenciones.map(a => a.diagnostico_principal)).size,
    };
  }, [filteredAtenciones]);

  const columns: any[] = [
    { 
      accessor: (row: AtencionCompleta) => row.fecha_atencion, 
      header: 'Fecha',
      cell: (row: any) => <span className="font-bold text-slate-600">{format(new Date(row.fecha_atencion), "dd/MM/yyyy")}</span>
    },
    { 
      accessor: (row: AtencionCompleta) => row.paciente?.nombre_completo || 'N/A', 
      header: 'Colaborador',
      cell: (row: any) => (
        <div>
          <p className="font-extrabold text-[#0F172A]">{row.paciente?.nombre_completo}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{row.empleado?.area || 'Sin área'}</p>
        </div>
      )
    },
    { 
        accessor: (row: AtencionCompleta) => row.empleado?.gerencia || 'N/A', 
        header: 'Gerencia',
        cell: (row: any) => <Badge className="bg-slate-50 text-slate-600 border-none font-bold uppercase text-[9px] tracking-widest">{row.empleado?.gerencia || 'N/A'}</Badge>
    },
    { 
        accessor: (row: AtencionCompleta) => row.diagnostico_principal, 
        header: 'Diagnóstico',
        cell: (row: any) => <span className="font-medium text-slate-600 max-w-[200px] truncate block">{row.diagnostico_principal}</span>
    },
    { 
        accessor: (row: AtencionCompleta) => row.medico?.nombre_completo || 'N/A', 
        header: 'Médico',
        cell: (row: any) => <span className="font-bold text-[#DA291C]">{row.medico?.nombre_completo}</span>
    },
  ];

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 text-left">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Inteligencia de Datos</span>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
               <ChartBar size={14} /> Reportes Ejecutivos
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Análisis de Atenciones</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Consolidado histórico de consultas y diagnósticos médicos corporativos.</p>
        </motion.div>
        
        <Button onClick={exportToExcel} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-14 px-8 rounded-full font-black shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">
          <FileSpreadsheet size={20} /> Exportar Reporte (Excel)
        </Button>
      </header>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
        <CardHeader className="p-8 pb-0 border-b border-slate-50">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <Filter size={20} className="text-[#DA291C]" /> Panel de Filtrado
          </CardTitle>
          <CardDescription className="font-medium">Refine la búsqueda para generar análisis específicos de la población atendida.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-black text-xs uppercase text-slate-400 mb-2">Rango de Fechas</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn("h-12 justify-start text-left font-bold rounded-xl border-slate-100 bg-slate-50", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4 text-[#DA291C]" />
                            {field.value?.from ? (
                              field.value.to ? (
                                <span className="truncate">
                                  {format(field.value.from, "dd/MM/yy")} - {format(field.value.to, "dd/MM/yy")}
                                </span>
                              ) : (
                                format(field.value.from, "dd/MM/yy")
                              )
                            ) : (
                              <span>Seleccionar periodo</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="range" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="gerencia" render={({ field }) => (
                  <FormItem><FormLabel className="font-black text-xs uppercase text-slate-400 mb-2">Gerencia</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"><SelectValue placeholder="Todas" /></SelectTrigger></FormControl>
                      <SelectContent className="rounded-xl"><SelectItem value="all">Todas las Unidades</SelectItem>{gerencias.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormItem>)}
                />
                <FormField control={form.control} name="sexo" render={({ field }) => (
                  <FormItem><FormLabel className="font-black text-xs uppercase text-slate-400 mb-2">Sexo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"><SelectValue placeholder="Ambos" /></SelectTrigger></FormControl>
                      <SelectContent className="rounded-xl"><SelectItem value="all">Ambos Sexos</SelectItem><SelectItem value="F">Femenino</SelectItem><SelectItem value="M">Masculino</SelectItem></SelectContent>
                    </Select>
                  </FormItem>)}
                />
                <div className="flex items-end gap-2">
                  <FormField control={form.control} name="edadFrom" render={({ field }) => (<FormItem className="flex-1"><FormLabel className="font-black text-xs uppercase text-slate-400 mb-2">Edades</FormLabel><FormControl><Input type="number" placeholder="Min" className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="edadTo" render={({ field }) => (<FormItem className="flex-1 lg:hidden xl:block"><FormLabel className="opacity-0">Max</FormLabel><FormControl><Input type="number" placeholder="Max" className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" {...field} /></FormControl></FormItem>)} />
                </div>
              </div>
              <div className="flex justify-start">
                 <Button type="submit" className="h-12 px-10 bg-[#0F172A] hover:bg-slate-800 text-white font-black rounded-xl transition-all">
                    Aplicar filtros y recalcular
                 </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <KpiCard title="Atenciones" value={kpis.totalAtenciones} icon={ChartBar} description="Total filtrado" />
        <KpiCard title="Edad Promedio" value={kpis.edadPromedio} icon={Users} description="Años de vida" trend="Aprox." />
        <KpiCard title="Diagnósticos" value={kpis.diagnosticosUnicos} icon={Filter} description="Tipos detectados" color="red" />
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-10 pb-0 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight">Resultados del Análisis</CardTitle>
            <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Detalle cronológico de las atenciones médicas procesadas.</p>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          {loading ? (
             <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
             </div>
          ) : (
            <DataTable columns={columns} data={filteredAtenciones} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

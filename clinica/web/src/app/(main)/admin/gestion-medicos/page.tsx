"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUserProfile } from '@/hooks/use-user-profile';
import { AdminService } from '@/lib/services/admin.service';
import { Medico, EmpleadoEmp2024 } from '@/lib/types/domain';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, Loader2, Stethoscope, Mail, Phone, HeartPulse, UserCircle2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const medicoSchema = z.object({
  userType: z.enum(['interno', 'externo']),
  empleadoCarnet: z.string().optional(),
  nombreCompleto: z.string().optional(),
  especialidad: z.string().min(1, 'La especialidad es requerida.'),
  correo: z.string().email('Correo inválido.').optional(),
  telefono: z.string().optional(),
  carnet: z.string().optional(),
}).refine(data => {
  if (data.userType === 'interno') return !!data.empleadoCarnet;
  return true;
}, { message: "Debe seleccionar un empleado.", path: ["empleadoCarnet"] })
  .refine(data => {
    if (data.userType === 'externo') return !!data.nombreCompleto;
    return true;
  }, { message: "El nombre es requerido para médicos externos.", path: ["nombreCompleto"] });

type MedicoFormValues = z.infer<typeof medicoSchema>;

export default function GestionMedicosPage() {
  const { pais } = useUserProfile();
  const { toast } = useToast();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [empleados, setEmpleados] = useState<EmpleadoEmp2024[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!pais) return;
    setIsLoading(true);
    try {
      const [medicosData, empleadosData] = await Promise.all([
        AdminService.getMedicos(),
        AdminService.getEmpleados()
      ]);
      setMedicos(medicosData);
      setEmpleados(empleadosData);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error de Red', description: 'No se pudo obtener el listado de médicos.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pais]);

  const medicosDelPais = useMemo(() => {
    if (!medicos || !empleados || !pais) return [];
    const medicosExternos = medicos.filter(m => m.tipo_medico === 'EXTERNO');
    const empleadosDelPaisCarnets = new Set(empleados.filter(e => e.pais === pais).map(e => e.carnet));
    const medicosInternosDelPais = medicos.filter(m => m.tipo_medico === 'INTERNO' && m.carnet && empleadosDelPaisCarnets.has(m.carnet));
    return [...medicosInternosDelPais, ...medicosExternos];
  }, [medicos, empleados, pais]);

  const empleadosDisponibles = useMemo(() => {
    if (!empleados || !medicos || !pais) return [];
    const medicoCarnets = new Set(medicos.map(m => m.carnet));
    return empleados.filter(e => e.pais === pais && !medicoCarnets.has(e.carnet));
  }, [empleados, medicos, pais]);

  const form = useForm<MedicoFormValues>({
    resolver: zodResolver(medicoSchema),
    defaultValues: { userType: 'interno' }
  });

  const userType = form.watch('userType');

  const onSubmit = async (data: MedicoFormValues) => {
    setIsSubmitting(true);
    let newMedicoData: Omit<Medico, 'idMedico' | 'id'>;

    if (data.userType === 'interno') {
      const empleado = empleados?.find(e => e.carnet === data.empleadoCarnet)!;
      newMedicoData = {
        carnet: empleado.carnet,
        nombre_completo: empleado.nombre_completo || empleado.nombreCompleto,
        especialidad: data.especialidad,
        tipo_medico: 'INTERNO',
        correo: empleado.correo,
        telefono: empleado.telefono,
        estado_medico: 'A',
      };
    } else {
      newMedicoData = {
        nombre_completo: data.nombreCompleto!,
        carnet: data.carnet,
        especialidad: data.especialidad,
        tipo_medico: 'EXTERNO',
        correo: data.correo,
        telefono: data.telefono,
        estado_medico: 'A',
      };
    }

    try {
      await AdminService.crearMedico(newMedicoData);
      toast({ title: "Médico Registrado", description: `El profesional ${newMedicoData.nombre_completo} ha sido incorporado.` });
      setDialogOpen(false);
      form.reset({ userType: 'interno' });
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la información del médico.' })
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: any[] = [
    { 
      accessor: (row: any) => row.nombre_completo || row.nombreCompleto, 
      header: 'Médico Especialista',
      cell: (row: any) => (
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center text-[#DA291C]">
            <UserCircle2 size={24} />
          </div>
          <div>
            <p className="font-extrabold text-[#0F172A] leading-tight">Dr. {row.nombre_completo || row.nombreCompleto}</p>
            <p className="text-[11px] text-[#DA291C] font-black uppercase tracking-widest mt-0.5">{row.especialidad}</p>
          </div>
        </div>
      )
    },
    { 
      accessor: (row: any) => row.tipo_medico || row.tipoMedico, 
      header: 'Vínculo',
      cell: (row: any) => {
        const isInterno = (row.tipo_medico || row.tipoMedico) === 'INTERNO';
        return (
          <Badge className={cn("border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider", isInterno ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600")}>
            {isInterno ? 'Staff Interno' : 'Especialista Externo'}
          </Badge>
        )
      }
    },
    { 
        accessor: (row: any) => row.correo, 
        header: 'Contacto',
        cell: (row: any) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
               <Mail size={12} /> <span className="text-xs font-medium">{row.correo || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
               <Phone size={12} /> <span className="text-xs font-medium">{row.telefono || '-'}</span>
            </div>
          </div>
        )
      },
    {
      accessor: (row: any) => row.estado_medico || row.estadoMedico,
      header: 'Disponibilidad',
      cell: (row: Medico) => {
        const isActive = (row.estado_medico || row.estadoMedico) === 'A';
        return (
            <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-500" : "bg-slate-300")} />
                <span className={cn("text-xs font-black uppercase tracking-widest", isActive ? "text-emerald-600" : "text-slate-400")}>
                    {isActive ? 'Activo' : 'En Pausa'}
                </span>
            </div>
        )
      }
    },
    {
      accessor: (row: any) => 'actions',
      header: 'Acciones',
      cell: () => (
        <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-xl"><Pencil className="h-4 w-4 text-slate-400" /></Button>
      ),
    },
  ];

  if (isLoading) return (
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
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Personal de Salud</span>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
               <HeartPulse size={14} /> Red Médica Activa
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Gestión de Médicos</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Directorio oficial de especialistas autorizados para atención médica corporativa.</p>
        </motion.div>
        
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#DA291C] hover:bg-[#b52217] text-white h-14 px-8 rounded-full font-black shadow-xl shadow-red-500/20 transition-all hover:scale-105 active:scale-95">
              <PlusCircle size={20} /> Registrar Especialista
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] rounded-[32px] border-none shadow-2xl">
            <DialogHeader><DialogTitle className="text-2xl font-black">Nuevo Médico</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <FormField control={form.control} name="userType" render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel className="font-bold">Estatus del Profesional</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="interno" /></FormControl><FormLabel className="font-bold">Médico Local</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="externo" /></FormControl><FormLabel className="font-bold">Subcontratado</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl><FormMessage />
                  </FormItem>)}
                />

                {userType === 'interno' ? (
                  <FormField control={form.control} name="empleadoCarnet" render={({ field }) => (
                    <FormItem><FormLabel className="font-bold">Seleccionar Colaborador</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Busque al profesional..." /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl">
                          {empleadosDisponibles.length > 0 ? (
                            empleadosDisponibles.map(e => <SelectItem key={e.carnet} value={e.carnet} className="rounded-lg">{e.nombre_completo || e.nombreCompleto} ({e.carnet})</SelectItem>)
                          ) : (
                            <SelectItem value="none" disabled>No hay personal disponible para asignar como médico</SelectItem>
                          )}
                        </SelectContent>
                      </Select><FormMessage />
                    </FormItem>)} />
                ) : (
                  <div className='grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl'>
                    <FormField control={form.control} name="nombreCompleto" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel className="font-bold">Nombre Completo</FormLabel><FormControl><Input placeholder="Ej: Dr. Alejandro García" className="h-12 rounded-xl border-slate-200" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="correo" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold">Email</FormLabel><FormControl><Input className="h-12 rounded-xl border-slate-200" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="telefono" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold">Teléfono</FormLabel><FormControl><Input className="h-12 rounded-xl border-slate-200" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="carnet" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel className="font-bold">No. Colegiado / ID</FormLabel><FormControl><Input className="h-12 rounded-xl border-slate-200" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                )}

                <FormField control={form.control} name="especialidad" render={({ field }) => (
                  <FormItem><FormLabel className="font-bold">Rama Médica</FormLabel>
                    <FormControl><Input placeholder="Ej: Pediatría, Ginecología, Medicina Interna..." className="h-12 rounded-xl border-slate-200" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>)} />

                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-[#0F172A] hover:bg-slate-800 text-white font-black rounded-2xl shadow-lg mt-4">
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Finalizar Registro Médico'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-10 pb-2">
            <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                <Stethoscope className="text-[#DA291C]" /> Staff Profesional ({pais})
            </CardTitle>
            <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">Visualización detallada de la capacidad resolutiva médica.</p>
        </CardHeader>
        <CardContent className="p-10 pt-4">
          <DataTable columns={columns} data={medicosDelPais} filterColumn="nombre_completo" filterPlaceholder="Buscar por nombre o especialidad..." />
        </CardContent>
      </Card>
    </div>
  );
}

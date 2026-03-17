"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUserProfile } from '@/hooks/use-user-profile';
import { AdminService } from '@/lib/services/admin.service';
import { UsuarioAplicacion, EmpleadoEmp2024 } from '@/lib/types/domain';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, Loader2, ShieldCheck, UserCircle, Mail, MapPin } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const userSchema = z.object({
  userType: z.enum(['interno', 'externo']),
  empleadoCarnet: z.string().optional(),
  nombreCompleto: z.string().optional(),
  carnet: z.string().optional(),
  correo: z.string().email({ message: "Correo inválido." }).optional(),
  rol: z.enum(["PACIENTE", "MEDICO", "ADMIN"], { required_error: "El rol es requerido." }),
}).refine(data => {
  if (data.userType === 'interno') return !!data.empleadoCarnet;
  return true;
}, { message: "Debe seleccionar un empleado.", path: ["empleadoCarnet"] })
  .refine(data => {
    if (data.userType === 'externo') return !!data.nombreCompleto && !!data.carnet;
    return true;
  }, { message: "Nombre y Carnet son requeridos para usuarios externos.", path: ["nombreCompleto", "carnet"] });

type UserFormValues = z.infer<typeof userSchema>;

const editUserSchema = z.object({
  rol: z.enum(["PACIENTE", "MEDICO", "ADMIN"]),
  estado: z.enum(["A", "I"]),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export default function GestionUsuariosPage() {
  const { pais } = useUserProfile();
  const { toast } = useToast();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioAplicacion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioAplicacion[]>([]);
  const [empleados, setEmpleados] = useState<EmpleadoEmp2024[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!pais) return;
    setIsLoading(true);
    try {
      const [usuariosData, empleadosData] = await Promise.all([
        AdminService.getUsuarios(),
        AdminService.getEmpleados()
      ]);
      setUsuarios(usuariosData);
      setEmpleados(empleadosData);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error de Conexión', description: 'No pudimos sincronizar la lista de usuarios.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pais]);

  const usuariosDelPais = useMemo(() => {
    if (!usuarios || !pais) return [];
    return usuarios.filter(u => u.pais === pais);
  }, [usuarios, pais]);

  const empleadosDisponibles = useMemo(() => {
    if (!empleados || !usuarios || !pais) return [];
    const userCarnets = new Set(usuarios.map(u => u.carnet));
    return empleados.filter(e => e.pais === pais && !userCarnets.has(e.carnet));
  }, [empleados, usuarios, pais]);

  const createForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { userType: 'interno' }
  });

  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
  });

  const userType = createForm.watch('userType');

  const handleEditClick = (user: UsuarioAplicacion) => {
    setSelectedUser(user);
    editForm.reset({
      rol: (['PACIENTE', 'MEDICO', 'ADMIN'].includes(user.rol) ? user.rol : 'PACIENTE'),
      estado: user.estado,
    } as any);
    setEditDialogOpen(true);
  };

  const handleCreateSubmit = async (data: UserFormValues) => {
    if (!pais) return;
    setIsSubmitting(true);
    let newUserData: Omit<UsuarioAplicacion, 'id' | 'idUsuario'>;

    if (data.userType === 'interno') {
      const empleado = empleados?.find(e => e.carnet === data.empleadoCarnet)!;
      newUserData = {
        carnet: empleado.carnet,
        rol: data.rol,
        estado: 'A',
        nombre_completo: empleado.nombre_completo || empleado.nombreCompleto,
        correo: empleado.correo,
        pais: pais as any,
        ultimo_acceso: new Date().toISOString(),
      };
    } else {
      newUserData = {
        carnet: data.carnet!,
        rol: data.rol,
        estado: 'A',
        nombre_completo: data.nombreCompleto!,
        correo: data.correo,
        pais: pais as any,
        ultimo_acceso: new Date().toISOString(),
      };
    }

    try {
      await AdminService.crearUsuario(newUserData);
      toast({ title: "Acceso Concedido", description: `${newUserData.nombre_completo} ya puede ingresar al sistema.` });
      setCreateDialogOpen(false);
      createForm.reset({ userType: 'interno', rol: undefined });
      fetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear la cuenta de usuario.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: EditUserFormValues) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await AdminService.updateUsuario(selectedUser.id_usuario!, data);
      toast({ title: "Cambios Guardados", description: "El perfil de acceso se ha actualizado correctamente." });
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron aplicar los cambios.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: any[] = [
    { 
      accessor: (row: any) => row.nombre_completo || row.nombreCompleto, 
      header: 'Nombre del Usuario',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#DA291C]/10 group-hover:text-[#DA291C] transition-colors">
            <UserCircle size={18} />
          </div>
          <div>
            <p className="font-extrabold text-[#0F172A] leading-tight">{row.nombre_completo || row.nombreCompleto}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{row.carnet}</p>
          </div>
        </div>
      )
    },
    { 
      accessor: (row: any) => row.correo, 
      header: 'Contacto',
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-slate-600">{row.correo || 'Sin correo registrado'}</span>
          <span className="text-[10px] text-slate-400 font-medium">Email Oficial</span>
        </div>
      )
    },
    { 
      accessor: (row: any) => row.rol, 
      header: 'Permisos',
      cell: (row: any) => {
        const roles = {
          'ADMIN': 'Administrador',
          'MEDICO': 'Médico Especialista',
          'PACIENTE': 'Paciente / Colaborador'
        };
        return <Badge className="bg-slate-100 hover:bg-slate-200 text-[#0F172A] border-none font-bold px-3 py-1 rounded-lg">{roles[row.rol as keyof typeof roles] || row.rol}</Badge>
      }
    },
    {
      accessor: (row: any) => row.estado,
      header: 'Estado',
      cell: (row: UsuarioAplicacion) => (
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", row.estado === 'A' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
          <span className={cn("text-xs font-black uppercase tracking-widest", row.estado === 'A' ? "text-emerald-600" : "text-slate-400")}>
            {row.estado === 'A' ? 'Activo' : 'Suspendido'}
          </span>
        </div>
      ),
    },
    {
      accessor: (row: any) => 'actions',
      header: 'Acciones',
      cell: (row: UsuarioAplicacion) => (
        <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-xl" onClick={() => handleEditClick(row)}><Pencil className="h-4 w-4 text-slate-400" /></Button>
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
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Seguridad</span>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
               <ShieldCheck size={14} /> Control de Accesos
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter">Gestión de Usuarios</h1>
          <p className="text-slate-500 font-medium mt-1">Administre quién tiene acceso y qué permisos posee en la plataforma.</p>
        </motion.div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#DA291C] hover:bg-[#b52217] text-white h-14 px-8 rounded-full font-black shadow-xl shadow-red-500/20 transition-all hover:scale-105 active:scale-95">
              <PlusCircle size={20} /> Crear Nueva Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] rounded-[32px] border-none shadow-2xl">
            <DialogHeader><DialogTitle className="text-2xl font-black">Nuevo Usuario</DialogTitle></DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-6 pt-4">
                <FormField control={createForm.control} name="userType" render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel className="font-bold">Origen del Usuario</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="interno" /></FormControl><FormLabel className="font-bold">Colaborador Local</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="externo" /></FormControl><FormLabel className="font-bold">Usuario Externo</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl><FormMessage />
                  </FormItem>)}
                />

                {userType === 'interno' ? (
                  <FormField control={createForm.control} name="empleadoCarnet" render={({ field }) => (
                    <FormItem><FormLabel className="font-bold">Seleccionar Colaborador</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Busque por nombre..." /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl">
                          {empleadosDisponibles.length > 0 ? (
                            empleadosDisponibles.map(e => <SelectItem key={e.carnet} value={e.carnet} className="rounded-lg">{e.nombreCompleto} ({e.carnet})</SelectItem>)
                          ) : (
                            <SelectItem value="none" disabled>No se encontraron colaboradores nuevos</SelectItem>
                          )}
                        </SelectContent>
                      </Select><FormMessage />
                    </FormItem>)} />
                ) : (
                  <div className='grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl'>
                    <FormField control={createForm.control} name="nombreCompleto" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel className="font-bold">Nombre Completo</FormLabel><FormControl><Input placeholder="Ej: Juan Pérez" className="h-12 rounded-xl border-slate-200" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={createForm.control} name="carnet" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold">ID / Cédula</FormLabel><FormControl><Input className="h-12 rounded-xl border-slate-200" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={createForm.control} name="correo" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel className="font-bold">Correo Electrónico</FormLabel><FormControl><Input className="h-12 rounded-xl border-slate-200" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                )}

                <FormField control={createForm.control} name="rol" render={({ field }) => (
                  <FormItem><FormLabel className="font-bold">Asignar Perfil</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Defina los permisos..." /></SelectTrigger></FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="PACIENTE" className="rounded-lg">Paciente / Consulta</SelectItem>
                        <SelectItem value="MEDICO" className="rounded-lg">Médico Tratante</SelectItem>
                        <SelectItem value="ADMIN" className="rounded-lg">Administrador Global</SelectItem>
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>)} />
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-[#0F172A] hover:bg-[#1e293b] text-white font-black rounded-2xl shadow-lg mt-4">
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Confirmar Registro'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-[32px] border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black">Ajustar Acceso</DialogTitle></DialogHeader>
          <p className="text-slate-500 font-medium -mt-2">Modificando perfil de: <span className="text-[#0F172A] font-black">{selectedUser?.nombre_completo || selectedUser?.nombreCompleto}</span></p>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6 pt-4">
              <FormField control={editForm.control} name="rol" render={({ field }) => (
                <FormItem><FormLabel className="font-bold">Nuevo Perfil</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="PACIENTE" className="rounded-lg">Paciente</SelectItem>
                      <SelectItem value="MEDICO" className="rounded-lg">Médico</SelectItem>
                      <SelectItem value="ADMIN" className="rounded-lg">Administrador</SelectItem>
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>)} />
              <FormField control={editForm.control} name="estado" render={({ field }) => (
                <FormItem><FormLabel className="font-bold">Estado de la Cuenta</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="A" className="rounded-lg text-emerald-600 font-bold">Cuenta Activa</SelectItem>
                      <SelectItem value="I" className="rounded-lg text-red-600 font-bold">Cuenta Suspendida</SelectItem>
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>)} />
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-[#0F172A] hover:bg-slate-800 text-white font-black rounded-2xl">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Aplicar Cambios'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-10 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight">Directorio de Accesos</CardTitle>
              <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs flex items-center gap-2">
                <MapPin size={12} className="text-[#DA291C]" /> Región: {pais}
              </p>
            </div>
            <div className="flex -space-x-3">
               {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">U{i}</div>)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-4">
          <DataTable columns={columns} data={usuariosDelPais} filterColumn="nombre_completo" filterPlaceholder="Buscar por nombre, correo o ID..." />
        </CardContent>
      </Card>
    </div>
  );
}

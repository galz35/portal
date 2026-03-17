"use client";

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUserProfile } from '@/hooks/use-user-profile';
import { PacienteService } from '@/lib/services/paciente.service';
import { AdminService } from '@/lib/services/admin.service';
import { EmpleadoEmp2024 } from '@/lib/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { HeartPulse, UserCircle, Activity, ShieldCheck, Waves, Moon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const chequeoSchema = z.object({
  estadoAnimo: z.string().min(1, 'Por favor, indique su estado de ánimo.'),
  modalidadTrabajo: z.string().min(1, 'Seleccione su modalidad de hoy.'),
  ruta: z.string().min(1, 'Indique su sede o ruta actual.'),
  aptoLaboral: z.boolean().default(true),
  alergiasActivas: z.boolean().default(false),
  alergiasDescripcion: z.string().optional(),
  calidadSueno: z.string().min(1, 'Indique cómo durmió.'),
  consumoAgua: z.string().min(1, 'Seleccione su nivel de hidratación.'),
  yaConsultoMedico: z.boolean().default(false),
  comentarioGeneral: z.string().optional(),
}).refine(data => !data.alergiasActivas || (data.alergiasActivas && data.alergiasDescripcion), {
  message: 'Por favor, describa brevemente su alergia.',
  path: ['alergiasDescripcion'],
});

type ChequeoFormValues = z.infer<typeof chequeoSchema>;

export default function ChequeoDiarioPage() {
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();
  const [empleado, setEmpleado] = useState<EmpleadoEmp2024 | null>(null);

  const form = useForm<ChequeoFormValues>({
    resolver: zodResolver(chequeoSchema),
    defaultValues: {
      aptoLaboral: true,
      alergiasActivas: false,
      yaConsultoMedico: false,
      estadoAnimo: '',
      modalidadTrabajo: '',
      ruta: '',
      calidadSueno: '',
      consumoAgua: '',
    },
  });

  const alergiasActivas = form.watch('alergiasActivas');

  useEffect(() => {
    if (userProfile?.carnet) {
      AdminService.getEmpleados({ carnet: userProfile.carnet }).then(empleados => {
        if (empleados && empleados.length > 0) setEmpleado(empleados[0]);
      }).catch(err => console.error(err));
    }
  }, [userProfile]);

  const onSubmit: SubmitHandler<ChequeoFormValues> = async (data) => {
    if (!userProfile?.id_paciente) {
        toast({ variant: 'destructive', title: 'Identidad no válida', description: 'No pudimos validar su expediente de paciente.' });
        return;
    }

    try {
      await PacienteService.crearChequeo(data);
      toast({
        title: "Registro Exitoso",
        description: "Su reporte de bienestar ha sido recibido por el equipo médico corporativo.",
      });
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fallo en el envío",
        description: "No fue posible guardar su reporte. Verifique su conexión.",
      });
    }
  };

  if (profileLoading) return <div className="p-20 text-center animate-pulse">Cargando formulario...</div>;

  return (
    <div className="space-y-10 pb-10 max-w-4xl mx-auto">
      <header className="text-center md:text-left">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Prevención Diaria</span>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
               <ShieldCheck size={14} /> Protocolo de Salud
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Auto-Chequeo de Bienestar</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Reporte su estado general para ayudarnos a cuidar de su salud laboral.</p>
        </motion.div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-10 pb-4 border-b border-slate-50">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <UserCircle size={20} className="text-[#DA291C]" /> Datos del Colaborador
              </CardTitle>
              <CardDescription className="font-medium">Confirme que sus datos de identificación sean correctos.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-8 grid gap-8 md:grid-cols-3">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID / Carnet</p>
                <p className="font-bold text-[#0F172A]">{userProfile?.carnet || empleado?.carnet || '---'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre Completo</p>
                <p className="font-black text-[#0F172A] text-lg leading-none">{userProfile?.nombre_completo || empleado?.nombreCompleto || 'Cargando...'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <HeartPulse size={20} className="text-[#DA291C]" /> Monitoreo de Bienestar
              </CardTitle>
              <CardDescription className="font-medium">Complete la siguiente información con total honestidad.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-10">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <FormField control={form.control} name="estadoAnimo" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">Estado de Ánimo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"><SelectValue placeholder="Seleccione..." /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="Bien" className="rounded-lg">Bien / Positivo</SelectItem>
                            <SelectItem value="Normal" className="rounded-lg">Estable / Normal</SelectItem>
                            <SelectItem value="Cansado" className="rounded-lg">Agotamiento / Estrés</SelectItem>
                            <SelectItem value="Triste" className="rounded-lg">Decaído / Triste</SelectItem>
                        </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="modalidadTrabajo" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">Modalidad de Hoy</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"><SelectValue placeholder="Seleccione..." /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="Presencial" className="rounded-lg">Físico / Oficina</SelectItem>
                            <SelectItem value="Remoto" className="rounded-lg">Teletrabajo / Casa</SelectItem>
                            <SelectItem value="Campo" className="rounded-lg">Ruta / Campo</SelectItem>
                        </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ruta" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">Ubicación / Sede</FormLabel>
                    <FormControl><Input placeholder="Ej: Central Vistana" className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <FormField control={form.control} name="calidadSueno" render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className="font-bold text-slate-700 flex items-center gap-2"><Moon size={14} className="text-indigo-400" /> Descanso Nocturno</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"><SelectValue placeholder="¿Cómo durmió?" /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="Excelente" className="rounded-lg">Suficiente y Reparador</SelectItem>
                            <SelectItem value="Normal" className="rounded-lg">Promedio (6-8 horas)</SelectItem>
                            <SelectItem value="Interrumpido" className="rounded-lg">Sueño Ligero / Fragmentado</SelectItem>
                            <SelectItem value="Insomnio" className="rounded-lg">Dificultad para dormir</SelectItem>
                        </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="consumoAgua" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700 flex items-center gap-2"><Waves size={14} className="text-blue-400" /> Hidratación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"><SelectValue placeholder="Consumo de agua..." /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="Alta" className="rounded-lg">+ 8 Vasos (Óptimo)</SelectItem>
                            <SelectItem value="Moderada" className="rounded-lg">4 - 6 Vasos</SelectItem>
                            <SelectItem value="Baja" className="rounded-lg">Menos de 4 Vasos</SelectItem>
                        </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="p-8 bg-slate-50 rounded-[32px] space-y-6">
                <FormField control={form.control} name="alergiasActivas" render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="w-6 h-6 rounded-lg border-slate-300 data-[state=checked]:bg-[#DA291C]" /></FormControl>
                    <div className="space-y-1"><FormLabel className="text-sm font-black text-slate-600 cursor-pointer">Presento síntomas alérgicos en este momento</FormLabel></div>
                  </FormItem>
                )} />
                {alergiasActivas && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <FormField control={form.control} name="alergiasDescripcion" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase text-[#DA291C]">Especifique los síntomas</FormLabel>
                        <FormControl><Textarea placeholder="Ej: Rinitis, picazón de ojos, estornudos frecuentes..." className="rounded-2xl border-red-100 bg-white font-medium resize-none" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </motion.div>
                )}
              </div>

              <FormField control={form.control} name="comentarioGeneral" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-slate-700">Reporte de Otros Síntomas</FormLabel>
                  <FormControl><Textarea placeholder="Describa cualquier otra molestia física o comentario relevante para el médico..." className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50 font-medium resize-none" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex items-center justify-between p-8 bg-emerald-50 rounded-[32px] border border-emerald-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="font-black text-emerald-900 leading-none">Declaración de Aptitud</p>
                        <p className="text-xs font-medium text-emerald-700 mt-1">Confirmo que me siento en condiciones de realizar mis labores.</p>
                    </div>
                </div>
                <FormField control={form.control} name="aptoLaboral" render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="w-8 h-8 rounded-xl border-emerald-400 data-[state=checked]:bg-emerald-600" /></FormControl>
                  </FormItem>
                )} />
              </div>
            </CardContent>
            <CardFooter className="p-10 bg-slate-900">
               <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                  <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={14} /> La información es confidencial y para fines médicos.
                  </p>
                  <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto px-12 h-14 bg-[#DA291C] hover:bg-[#b52217] text-white font-black rounded-full shadow-xl shadow-red-500/20 transition-all hover:scale-105 active:scale-95 text-lg">
                    {form.formState.isSubmitting ? "Procesando Reporte..." : "Enviar Reporte de Salud"}
                  </Button>
               </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}

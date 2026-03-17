"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Settings, Clock, MessageSquare, ShieldCheck, Save, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const generalSchema = z.object({
  limiteCitas: z.coerce.number().min(1),
  horarioInicio: z.string(),
  horarioFin: z.string(),
});

const plantillasSchema = z.object({
  msgConfirmacion: z.string().min(10),
});

const semaforoSchema = z.object({
    semaVerde: z.string().min(10),
    semaAmarillo: z.string().min(10),
    semaRojo: z.string().min(10),
});

export default function ConfiguracionGeneralPage() {
    const { toast } = useToast();

    const generalForm = useForm<z.infer<typeof generalSchema>>({
        resolver: zodResolver(generalSchema),
        defaultValues: {
            limiteCitas: 50,
            horarioInicio: "08:00",
            horarioFin: "17:00",
        }
    });
    
    const plantillasForm = useForm<z.infer<typeof plantillasSchema>>({
        resolver: zodResolver(plantillasSchema),
        defaultValues: {
            msgConfirmacion: "Su cita ha sido confirmada para el día [FECHA] a las [HORA]. Por favor, presentarse 10 minutos antes.",
        }
    });
    
    const semaforoForm = useForm<z.infer<typeof semaforoSchema>>({
        resolver: zodResolver(semaforoSchema),
        defaultValues: {
            semaVerde: "Indica un buen estado de salud general, sin síntomas de riesgo detectados en las últimas evaluaciones.",
            semaAmarillo: "Indica la presencia de síntomas leves o malestares que requieren atención preventiva, pero no representan una emergencia inmediata.",
            semaRojo: "Indica síntomas o condiciones críticas que requieren atención médica prioritaria o derivación inmediata a urgencias.",
        }
    });

    const onGeneralSubmit = (data: z.infer<typeof generalSchema>) => {
        toast({ title: "Cambios Aplicados", description: "Los parámetros operativos del sistema han sido actualizados." });
    };
    
    const onPlantillasSubmit = (data: z.infer<typeof plantillasSchema>) => {
        toast({ title: "Plantillas Actualizadas", description: "Las comunicaciones automáticas ahora utilizarán el nuevo formato." });
    };

    const onSemaforoSubmit = (data: z.infer<typeof semaforoSchema>) => {
        toast({ title: "Criterios Guardados", description: "Se han actualizado las definiciones de los niveles de salud." });
    };

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 text-left">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Ajustes del Sistema</span>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
               <Settings size={14} className="animate-spin-slow" /> Configuración Global
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Preferencias de la Clínica</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Defina los parámetros operativos y criterios clínicos para toda la región.</p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Form {...generalForm}>
          <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)}>
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white h-full">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Clock size={20} className="text-[#DA291C]" /> Capacidad Operativa
                </CardTitle>
                <CardDescription className="font-medium">Gestione los límites de atención y horarios de oficina.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <FormField
                  control={generalForm.control}
                  name="limiteCitas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-800">Límite Diario de Consultas</FormLabel>
                      <FormControl><Input type="number" className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="space-y-3">
                  <Label className="font-bold text-slate-800 flex items-center gap-2">
                    <Globe size={14} /> Ventana de Atención Regional
                  </Label>
                  <div className='flex gap-4 items-center'>
                     <FormField
                        control={generalForm.control}
                        name="horarioInicio"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl><Input type="time" className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                     <span className="text-slate-300 font-black">→</span>
                     <FormField
                        control={generalForm.control}
                        name="horarioFin"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl><Input type="time" className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button type="submit" className="w-full h-12 bg-[#0F172A] hover:bg-slate-800 text-white font-black rounded-xl">
                   <Save size={18} className="mr-2" /> Guardar Parámetros
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
        
        <Form {...plantillasForm}>
          <form onSubmit={plantillasForm.handleSubmit(onPlantillasSubmit)}>
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white h-full">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <MessageSquare size={20} className="text-[#DA291C]" /> Comunicación con Paciente
                </CardTitle>
                <CardDescription className="font-medium">Personalice los mensajes automáticos enviados vía email.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <FormField
                  control={plantillasForm.control}
                  name="msgConfirmacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-800">Cuerpo del Mensaje (Confirmación)</FormLabel>
                      <FormControl><Textarea className="min-h-[140px] rounded-2xl border-slate-100 bg-slate-50 font-medium resize-none" {...field} /></FormControl>
                      <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight">Utilice [FECHA] y [HORA] como variables dinámicas.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
               <CardFooter className="p-8 pt-0">
                <Button type="submit" className="w-full h-12 bg-[#0F172A] hover:bg-slate-800 text-white font-black rounded-xl">
                   <Save size={18} className="mr-2" /> Actualizar Plantilla
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
        
        <Form {...semaforoForm}>
            <form onSubmit={semaforoForm.handleSubmit(onSemaforoSubmit)} className="md:col-span-2">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <ShieldCheck size={20} className="text-[#DA291C]" /> Criterios de Triaje (Semáforo)
                    </CardTitle>
                    <CardDescription className="font-medium text-slate-500">Defina qué significa cada nivel de riesgo para que los usuarios comprendan su estado de salud.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                     <FormField
                        control={semaforoForm.control}
                        name="semaVerde"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="font-black text-[11px] uppercase text-emerald-600 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Nivel Verde: Saludable
                            </FormLabel>
                            <FormControl><Textarea className="min-h-[120px] rounded-2xl border-slate-100 bg-emerald-50/30 font-medium resize-none border-dashed" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={semaforoForm.control}
                        name="semaAmarillo"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="font-black text-[11px] uppercase text-amber-600 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500" /> Nivel Amarillo: Observación
                            </FormLabel>
                            <FormControl><Textarea className="min-h-[120px] rounded-2xl border-slate-100 bg-amber-50/30 font-medium resize-none border-dashed" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={semaforoForm.control}
                        name="semaRojo"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="font-black text-[11px] uppercase text-red-600 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" /> Nivel Rojo: Intervención
                            </FormLabel>
                            <FormControl><Textarea className="min-h-[120px] rounded-2xl border-slate-100 bg-red-50/30 font-medium resize-none border-dashed" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </CardContent>
                <CardFooter className="p-8 pt-0 border-t border-slate-50">
                    <Button type="submit" className="h-12 px-10 bg-[#0F172A] hover:bg-slate-800 text-white font-black rounded-xl">
                        <Save size={18} className="mr-2" /> Guardar Criterios de Salud
                    </Button>
                </CardFooter>
                </Card>
            </form>
        </Form>
      </div>
    </div>
  );
}

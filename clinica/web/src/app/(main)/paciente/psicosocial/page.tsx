"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUserProfile } from '@/hooks/use-user-profile';
import { PacienteService } from '@/lib/services/paciente.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BrainCircuit, CheckCircle2, HeartPulse, Sparkles, MessageSquare, Quote, ArrowRight, Activity, Smile } from 'lucide-react';
import { analyzePsychosocial } from '@/actions/analyze-psychosocial';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const psicosocialSchema = z.object({
  nivelEstres: z.string().min(1, 'Por favor, indique su nivel de estrés.'),
  estadoAnimo: z.string().min(1, 'Por favor, describa su estado de ánimo.'),
  calidadSueno: z.string().min(1, 'Indique cómo fue su descanso.'),
  consumoAgua: z.string().min(1, '¿Cuánta agua bebió ayer?'),
  modalidadTrabajo: z.string().min(1, 'Seleccione su modalidad.'),
  comentarioGeneral: z.string().optional(),
});

type PsicosocialFormValues = z.infer<typeof psicosocialSchema>;

export default function PacientePsicosocialPage() {
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();
  const [aiResult, setAiResult] = React.useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const form = useForm<PsicosocialFormValues>({
    resolver: zodResolver(psicosocialSchema),
    defaultValues: {
      nivelEstres: '',
      estadoAnimo: '',
      calidadSueno: '',
      consumoAgua: '',
      modalidadTrabajo: '',
      comentarioGeneral: '',
    },
  });

  const onSubmit: SubmitHandler<PsicosocialFormValues> = async (data) => {
    if (!userProfile?.id_paciente) {
      toast({ variant: "destructive", title: "Identidad no válida", description: "No pudimos validar su expediente para este análisis." });
      return;
    }

    setIsAnalyzing(true);
    try {
      const aiResponse = await analyzePsychosocial(data);
      let aiData = null;

      if (aiResponse.success) {
        aiData = aiResponse.data;
        setAiResult(aiData);
      }

      await PacienteService.crearChequeo({
        ...data,
        idPaciente: userProfile.id_paciente,
        ruta: "Psicosocial",
        nivelSemaforo: aiData ? (aiData.nivelRiesgo === 'Alto' ? 'R' : aiData.nivelRiesgo === 'Medio' ? 'A' : 'V') : (data.nivelEstres === 'Alto' ? 'A' : 'V'),
        estadoChequeo: 'Completado',
        datos_completos: aiData || {},
      });

      toast({ title: "Análisis Completado", description: "Su reporte emocional ha sido procesado exitosamente." });
    } catch (error) {
      toast({ variant: "destructive", title: "Fallo en el sistema", description: "No pudimos completar el análisis en este momento." });
    } finally {
        setIsAnalyzing(false);
    }
  };

  if (profileLoading) return <div className="p-20 text-center animate-pulse">Cargando módulo emocional...</div>;

  return (
    <div className="space-y-10 pb-10 max-w-4xl mx-auto">
      <header className="text-center md:text-left px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Salud Mental & Emocional</span>
            <div className="flex items-center gap-1 text-indigo-500 font-bold text-[11px]">
               <Sparkles size={14} className="animate-pulse" /> IA Empatía
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Módulo Psicosocial</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Un espacio seguro y confidencial para cuidar su bienestar interior con apoyo de Inteligencia Artificial.</p>
        </motion.div>
      </header>

      <AnimatePresence mode="wait">
        {aiResult ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-3xl border border-emerald-100">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                   <p className="font-black text-emerald-900 leading-none">Análisis Finalizado</p>
                   <p className="text-xs font-medium text-emerald-700 mt-1">Nuestra IA ha procesado sus respuestas con una perspectiva clínica profesional.</p>
                </div>
            </div>

            <Card className="border-none shadow-2xl shadow-indigo-100 rounded-[40px] overflow-hidden bg-white">
              <CardHeader className="p-10 pb-4 bg-indigo-50/50 border-b border-indigo-100/50">
                <CardTitle className="text-2xl font-black text-[#0F172A] flex items-center gap-3">
                  <BrainCircuit className="text-indigo-600" size={28} /> Diagnóstico de Bienestar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="relative p-10 bg-slate-900 rounded-[32px] overflow-hidden">
                   <Quote className="absolute top-6 left-6 text-white/10" size={80} />
                   <p className="text-xl md:text-2xl text-white font-medium italic text-center relative z-10 leading-relaxed">
                      "{aiResult.mensajePaciente}"
                   </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
                            <Activity size={20} className="text-indigo-500" /> Interpretación IA
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-medium">
                            {aiResult.analisis}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
                            <Smile size={20} className="text-emerald-500" /> Pasos a Seguir
                        </h3>
                        <ul className="space-y-3">
                            {aiResult.recomendaciones.map((rec: string, i: number) => (
                                <li key={i} className="flex gap-3 text-slate-600 font-medium">
                                    <ArrowRight size={18} className="text-emerald-500 shrink-0 mt-1" />
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
              </CardContent>
              <CardFooter className="p-10 pt-0">
                <Button onClick={() => { setAiResult(null); form.reset(); }} className="w-full h-14 bg-[#0F172A] hover:bg-slate-800 text-white font-black rounded-2xl text-lg shadow-xl shadow-slate-200/50">
                  Realizar Nuevo Chequeo Emocional
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-2xl font-black text-[#0F172A] flex items-center gap-3">
                    <HeartPulse size={24} className="text-[#DA291C]" /> Escucha Activa Digital
                </CardTitle>
                <CardDescription className="text-base font-medium text-slate-500">
                    Sus respuestas nos ayudan a entender su entorno emocional y brindarle el apoyo necesario en el momento adecuado.
                </CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="p-10 pt-4 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField control={form.control} name="nivelEstres" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700">Percepción de Estrés</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"><SelectValue placeholder="¿Cómo califica su estrés?" /></SelectTrigger></FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="Bajo" className="rounded-lg font-medium">Bajo / Manejable</SelectItem>
                              <SelectItem value="Medio" className="rounded-lg font-medium">Moderado / Presencia de tensión</SelectItem>
                              <SelectItem value="Alto" className="rounded-lg font-medium text-red-600 font-bold">Elevado / Agotamiento</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="estadoAnimo" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700">Estado de Ánimo Predominante</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"><SelectValue placeholder="¿Cómo se siente hoy?" /></SelectTrigger></FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="Bien" className="rounded-lg font-medium italic">"Me siento optimista/estable"</SelectItem>
                              <SelectItem value="Regular" className="rounded-lg font-medium italic">"Me siento neutro/cansado"</SelectItem>
                              <SelectItem value="Decaído" className="rounded-lg font-medium italic">"Me siento triste/sin energía"</SelectItem>
                              <SelectItem value="Ansioso" className="rounded-lg font-medium italic">"Me siento inquieto/nervioso"</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Variables de Contexto Personal</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="calidadSueno" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-slate-600 text-sm">Registro de Sueño</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-12 rounded-xl border-none bg-white shadow-sm font-bold"><SelectValue placeholder="Descanso" /></SelectTrigger></FormControl>
                                <SelectContent className="rounded-xl"><SelectItem value="Buena" className="rounded-lg">Suficiente</SelectItem><SelectItem value="Regular" className="rounded-lg">Intermitente</SelectItem><SelectItem value="Mala" className="rounded-lg">Insuficiente</SelectItem></SelectContent>
                            </Select><FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="consumoAgua" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-slate-600 text-sm">Nivel Hidratación</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-12 border-none bg-white shadow-sm font-bold rounded-xl"><SelectValue placeholder="Agua" /></SelectTrigger></FormControl>
                                <SelectContent className="rounded-xl"><SelectItem value="Alta" className="rounded-lg">Óptima</SelectItem><SelectItem value="Media" className="rounded-lg">Adecuada</SelectItem><SelectItem value="Baja" className="rounded-lg">Baja</SelectItem></SelectContent>
                            </Select><FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="modalidadTrabajo" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-slate-600 text-sm">Entorno Laboral</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-12 border-none bg-white shadow-sm font-bold rounded-xl"><SelectValue placeholder="Modalidad" /></SelectTrigger></FormControl>
                                <SelectContent className="rounded-xl"><SelectItem value="Presencial" className="rounded-lg">Oficina</SelectItem><SelectItem value="Remoto" className="rounded-lg">Casa</SelectItem><SelectItem value="Campo" className="rounded-lg">Ruta</SelectItem></SelectContent>
                            </Select><FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <FormField control={form.control} name="comentarioGeneral" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700 flex items-center gap-2">
                           <MessageSquare size={16} className="text-indigo-500" /> Notas adicionales (Confidencial)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Este espacio es libre. Puede describir sus preocupaciones, reflexiones o cualquier detalle que considere relevante para su salud emocional."
                            className="min-h-[160px] rounded-[24px] border-slate-100 bg-slate-50 font-medium p-6 resize-none focus:bg-white transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                  <CardFooter className="p-10 bg-slate-900 border-t border-white/5">
                    <Button type="submit" disabled={isAnalyzing} className="w-full md:w-auto px-12 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-full shadow-2xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 text-lg">
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          Consultando Motor de Empatía IA...
                        </>
                      ) : (
                        <>
                          Procesar Reporte Emocional
                          <Sparkles size={20} className="ml-3" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUserProfile } from '@/hooks/use-user-profile';
import { MedicoService } from '@/lib/services/medico.service';
import type { Paciente } from '@/lib/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Syringe, UserCheck, ShieldCheck, ClipboardCheck, Info, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const vacunaSchema = z.object({
    idPaciente: z.string().min(1, "Debe seleccionar un paciente de la lista."),
    tipoVacuna: z.string().min(1, "Especifique el tipo de inmunización."),
    dosis: z.string().min(1, "Indique la dosis o número de refuerzo."),
    fechaAplicacion: z.date({ required_error: "La fecha de aplicación es obligatoria." }),
    observaciones: z.string().optional(),
});

type VacunaFormValues = z.infer<typeof vacunaSchema>;

export default function RegistroVacunasPage() {
    const { pais, userProfile, loading: profileLoading } = useUserProfile();
    const { toast } = useToast();
    const [pacientes, setPacientes] = useState<any[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);

    const form = useForm<VacunaFormValues>({
        resolver: zodResolver(vacunaSchema),
        defaultValues: {
            fechaAplicacion: new Date(),
        }
    });

    useEffect(() => {
        if (pais) {
            setLoadingPatients(true);
            MedicoService.getPacientes(pais)
                .then(data => {
                    setPacientes(data);
                    setLoadingPatients(false);
                })
                .catch(err => {
                    console.error("Error loading patients", err);
                    setLoadingPatients(false);
                });
        }
    }, [pais]);

    const onSubmit = async (data: VacunaFormValues) => {
        if (!userProfile?.id_medico) {
            toast({ variant: 'destructive', title: 'Error de Identidad', description: 'No se pudo validar su firma médica para este registro.' });
            return;
        }

        try {
            await MedicoService.registrarVacuna({
                ...data,
                idMedico: userProfile.id_medico,
                fechaAplicacion: data.fechaAplicacion.toISOString().split('T')[0],
            });

            const paciente = pacientes.find(p => String(p.id_paciente || p.id) === data.idPaciente);
            toast({
                title: "Certificación Registrada",
                description: `Se ha actualizado la cartilla digital de ${paciente?.nombre_complea || paciente?.nombreCompleto || 'paciente'}.`
            });
            form.reset({ fechaAplicacion: new Date(), idPaciente: '', tipoVacuna: '', dosis: '', observaciones: '' });

        } catch (error) {
            toast({
                title: "Fallo en el Registro",
                description: "No fue posible guardar la inmunización. Verifique su conexión.",
                variant: "destructive"
            });
        }
    }

    if (profileLoading) return <div className="p-20 text-center animate-pulse">Cargando protocolo de inmunización...</div>;

    return (
        <div className="space-y-10 pb-10 max-w-4xl mx-auto">
            <header className="text-center md:text-left">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Inmunización Corporativa</span>
                        <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
                           <ShieldCheck size={14} /> Protocolo Clínico Certificado
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Certificar Vacunación</h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Registre oficialmente la aplicación de dosis para actualizar la cartilla digital del colaborador.</p>
                </motion.div>
            </header>

            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
                <CardHeader className="p-10 pb-4 bg-slate-50/50 border-b border-slate-100/50">
                    <CardTitle className="text-2xl font-black text-[#0F172A] flex items-center gap-3">
                        <Syringe className="text-[#DA291C]" size={28} /> Datos de la Aplicación
                    </CardTitle>
                    <CardDescription className="text-base font-medium">Complete el formulario para avalar la inmunización recibida por el paciente.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="p-10 space-y-8">
                            <FormField
                                control={form.control}
                                name="idPaciente"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700 flex items-center gap-2">
                                            <UserCheck size={16} className="text-slate-400" /> Seleccionar Colaborador
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-black">
                                                    <SelectValue placeholder="Busque al paciente por nombre..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl">
                                                {loadingPatients ? (
                                                    <div className="p-4 text-center">
                                                        <Loader2 className="animate-spin mx-auto text-[#DA291C]" />
                                                        <p className="text-[10px] font-black uppercase text-slate-400 mt-2">Cargando nómina...</p>
                                                    </div>
                                                ) : 
                                                    pacientes.map(p => (
                                                        <SelectItem key={p.id_paciente || p.id} value={String(p.id_paciente || p.id)} className="rounded-xl h-11">
                                                            {p.nombre_completo || p.nombreCompleto}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="tipoVacuna"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700">Tipo de Inmunización</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-black">
                                                        <SelectValue placeholder="Seleccione vacuna..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-2xl">
                                                    <SelectItem value="Influenza" className="rounded-xl font-bold">Influenza Estacional</SelectItem>
                                                    <SelectItem value="COVID-19" className="rounded-xl font-bold">COVID-19 (Esquema/Refuerzo)</SelectItem>
                                                    <SelectItem value="Hepatitis B" className="rounded-xl font-bold">Hepatitis B</SelectItem>
                                                    <SelectItem value="Tétanos" className="rounded-xl font-bold">Tétanos / Difteria (Td)</SelectItem>
                                                    <SelectItem value="Otra" className="rounded-xl font-bold">Otra / Refuerzo Especial</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dosis"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700">Dosis / Lote</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej: 1era Dosis, Refuerzo 2024" className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-black" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="fechaAplicacion"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="font-bold text-slate-700 flex items-center gap-2">
                                            <CalendarIcon size={16} className="text-slate-400" /> Fecha de Aplicación
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("h-14 rounded-2xl border-slate-100 bg-slate-50 pl-6 text-left font-black", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP", { locale: require('date-fns/locale/es') }) : <span>Seleccione fecha de la dosis</span>}
                                                        <CalendarIcon className="ml-auto h-5 w-5 opacity-50 text-[#DA291C]" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-none" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="rounded-3xl" />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="observaciones"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700 flex items-center gap-2">
                                            <ClipboardCheck size={16} className="text-slate-400" /> Notas Médicas (Opcional)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Indique el número de lote, fabricante o cualquier reacción leve observada..." className="min-h-[120px] rounded-3xl border-slate-100 bg-slate-50 font-medium p-6 resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                                <Info className="text-blue-500 shrink-0 mt-1" size={20} />
                                <p className="text-sm font-medium text-blue-900 leading-relaxed">
                                    Al registrar esta vacuna, el colaborador podrá visualizarla de inmediato en su <span className="font-black">Cartilla Digital de Vacunación</span> dentro de su panel de paciente. Esta acción es definitiva para el expediente corporativo.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="p-10 bg-slate-900">
                             <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto px-12 h-14 bg-[#DA291C] hover:bg-[#b52217] text-white font-black rounded-full shadow-2xl shadow-red-500/30 transition-all hover:scale-105 active:scale-95 text-lg">
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        Certificando Dosis...
                                    </>
                                ) : (
                                    <>
                                        Registrar Certificación
                                        <Syringe size={20} className="ml-3" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}

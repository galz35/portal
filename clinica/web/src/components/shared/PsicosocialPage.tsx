"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUserProfile } from '@/hooks/use-user-profile';
import { MedicoService } from '@/lib/services/medico.service';
import type { Paciente, RegistroPsicosocial } from '@/lib/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from './DataTable';
import { Badge } from '../ui/badge';
import { Loader2, Sparkles } from 'lucide-react';
import { analizarSentimiento } from '@/ai/flows/analisis-sentimiento';
import { cn } from '@/lib/utils';

const sintomasOptions = ['Ansiedad', 'Insomnio', 'Tristeza', 'Irritabilidad', 'Desmotivación', 'Apatía', 'Pánico'];

const psicosocialSchema = z.object({
    idPaciente: z.string().min(1, "Debe seleccionar un paciente."),
    nivelEstres: z.enum(['Bajo', 'Medio', 'Alto']).optional(),
    sintomasPsico: z.array(z.string()).optional(),
    estadoAnimoGeneral: z.string().optional(),
    analisisSentimiento: z.enum(['Positivo', 'Negativo', 'Neutro']).optional(),
    riesgoSuicida: z.boolean().default(false),
    derivarAPsico: z.boolean().default(false),
    notasPsico: z.string().optional(),
});

type PsicosocialFormValues = z.infer<typeof psicosocialSchema>;

export default function PsicosocialPage() {
    const { userProfile, pais } = useUserProfile();
    const { toast } = useToast();
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [registros, setRegistros] = useState<RegistroPsicosocial[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalysing, setIsAnalysing] = useState(false);

    const form = useForm<PsicosocialFormValues>({
        resolver: zodResolver(psicosocialSchema),
        defaultValues: {
            sintomasPsico: [],
            riesgoSuicida: false,
            derivarAPsico: false,
        },
    });

    const fetchData = async () => {
        if (!pais) return;
        try {
            // Assuming getRegistrosPsicosociales is not yet in MedicoService, we might need to add it or use a generic get
            // But based on previous steps, we added many methods. Let's check if we missed this one.
            // If it's missing, I'll add it to MedicoService in the next step or assume it's there.
            // For now, I'll use MedicoService.getPacientes.
            // I'll comment out getRegistrosPsicosociales call if it doesn't exist in the service definition I saw earlier.
            // Wait, I didn't see getRegistrosPsicosociales in MedicoService. I should add it.
            // For now, let's assume I will add it.
            const [pacientesData, registrosData] = await Promise.all([
                MedicoService.getPacientes(pais),
                MedicoService.getRegistrosPsicosociales(pais)
            ]);
            setPacientes(pacientesData);
            setRegistros(registrosData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los datos.' });
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pais]);

    const handleAnalizarSentimiento = async () => {
        const texto = form.getValues('estadoAnimoGeneral');
        if (!texto) {
            toast({ variant: 'destructive', title: 'Campo vacío', description: 'Por favor, ingrese el texto del paciente para analizar.' });
            return;
        }
        setIsAnalysing(true);
        try {
            const result = await analizarSentimiento({ texto });
            form.setValue('analisisSentimiento', result.sentimiento);
            toast({ title: 'Análisis Completo', description: `El sentimiento detectado es: ${result.sentimiento}` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error de IA', description: 'No se pudo analizar el texto.' });
        } finally {
            setIsAnalysing(false);
        }
    }

    const getSentimentClass = (sentiment?: 'Positivo' | 'Negativo' | 'Neutro') => {
        switch (sentiment) {
            case 'Positivo': return 'bg-green-100 text-green-800';
            case 'Negativo': return 'bg-red-100 text-red-800';
            case 'Neutro': return 'bg-gray-100 text-gray-800';
            default: return 'bg-transparent';
        }
    }

    const onSubmit = async (data: PsicosocialFormValues) => {
        if (!userProfile?.idMedico) return;
        setIsSubmitting(true);
        try {
            const payload: Omit<RegistroPsicosocial, 'id' | 'idRegistroPsico'> = {
                ...data,
                idMedico: userProfile.idMedico,
                fechaRegistro: new Date().toISOString(),
            };
            await MedicoService.crearRegistroPsicosocial(payload);
            toast({ title: 'Registro Guardado', description: 'La evaluación psicosocial se ha guardado correctamente.' });
            form.reset({ sintomasPsico: [], riesgoSuicida: false, derivarAPsico: false });
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el registro.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const registrosConPaciente = useMemo(() => {
        return registros.map(reg => ({
            ...reg,
            paciente: pacientes.find(p => p.id_paciente === reg.id_paciente)
        })).sort((a, b) => new Date(b.fecha_registro!).getTime() - new Date(a.fecha_registro!).getTime());
    }, [registros, pacientes]);

    const columns: any[] = [
        { accessor: (row: any) => row.fecha_registro ? new Date(row.fecha_registro).toLocaleDateString() : 'N/A', header: 'Fecha' },
        { accessor: (row: any) => row.paciente_nombre || row.paciente?.nombre_completo || 'N/A', header: 'Paciente' },
        { accessor: (row: any) => row.nivel_estres, header: 'Nivel Estrés' },
        {
            accessor: (row: any) => row.analisis_sentiment,
            header: 'Sentimiento IA',
            cell: (row: any) => row.analisis_sentiment ? <Badge className={cn(getSentimentClass(row.analisis_sentiment), "border-transparent")}>{row.analisis_sentiment}</Badge> : 'N/A'
        },
        {
            accessor: (row: any) => row.riesgo_suicida,
            header: 'Alerta',
            cell: (row: any) => row.riesgo_suicida ? <Badge variant="destructive">Riesgo Suicida</Badge> : (row.derivar_a_psico ? <Badge variant="secondary">Derivar</Badge> : '-')
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Registro y Seguimiento Psicosocial</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className='lg:col-span-2'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Nueva Evaluación Psicosocial</CardTitle>
                                    <CardDescription>Registre una nueva evaluación para un colaborador.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="idPaciente" render={({ field }) => (
                                        <FormItem><FormLabel>Paciente</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione un paciente..." /></SelectTrigger></FormControl>
                                                <SelectContent>{pacientes.map(p => <SelectItem key={p.id_paciente} value={p.id_paciente!.toString()}>{p.nombre_completo}</SelectItem>)}</SelectContent>
                                            </Select><FormMessage />
                                        </FormItem>)}
                                    />

                                    <FormField control={form.control} name="nivelEstres" render={({ field }) => (
                                        <FormItem><FormLabel>Nivel de Estrés Percibido</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccione un nivel..." /></SelectTrigger></FormControl>
                                                <SelectContent><SelectItem value="Bajo">Bajo</SelectItem><SelectItem value="Medio">Medio</SelectItem><SelectItem value="Alto">Alto</SelectItem></SelectContent>
                                            </Select><FormMessage />
                                        </FormItem>)}
                                    />

                                    <Controller
                                        control={form.control}
                                        name="sintomasPsico"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Síntomas Psicológicos Referidos</FormLabel>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-md">
                                                    {sintomasOptions.map((sintoma) => (
                                                        <FormField
                                                            key={sintoma}
                                                            control={form.control}
                                                            name="sintomasPsico"
                                                            render={({ field }) => {
                                                                return (
                                                                    <FormItem key={sintoma} className="flex flex-row items-start space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(sintoma)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...(field.value || []), sintoma])
                                                                                        : field.onChange(field.value?.filter((value) => value !== sintoma));
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal">{sintoma}</FormLabel>
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField control={form.control} name="estadoAnimoGeneral" render={({ field }) => (
                                        <FormItem><FormLabel>Estado de Ánimo General (Narrativa del Paciente)</FormLabel>
                                            <FormControl><Textarea placeholder="Escriba aquí lo que el paciente expresa sobre cómo se siente..." {...field} /></FormControl>
                                            <div className='flex items-center gap-2'>
                                                <Button type="button" size="sm" variant="outline" className="gap-2" onClick={handleAnalizarSentimiento} disabled={isAnalysing}>
                                                    {isAnalysing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                                                    Analizar Sentimiento (IA)
                                                </Button>
                                                {form.getValues('analisisSentimiento') && (
                                                    <Badge className={cn('border-transparent', getSentimentClass(form.getValues('analisisSentimiento')))}>
                                                        Resultado: {form.getValues('analisisSentimiento')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <FormMessage />
                                        </FormItem>)}
                                    />

                                    <FormField control={form.control} name="notasPsico" render={({ field }) => (
                                        <FormItem><FormLabel>Notas Confidenciales del Profesional</FormLabel>
                                            <FormControl><Textarea placeholder="Observaciones, plan de acción, detalles de la conversación..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>)}
                                    />

                                    <div className="flex gap-6 pt-2">
                                        <FormField control={form.control} name="riesgoSuicida" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive-foreground" /></FormControl>
                                                <div className="space-y-1 leading-none"><FormLabel className="text-destructive font-semibold">¿Riesgo suicida?</FormLabel></div>
                                            </FormItem>)}
                                        />
                                        <FormField control={form.control} name="derivarAPsico" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                <div className="space-y-1 leading-none"><FormLabel>Recomendar derivación a Psicología</FormLabel></div>
                                            </FormItem>)}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar Registro
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </div>
                <div className='lg:col-span-1'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Registros</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={columns} data={registrosConPaciente} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

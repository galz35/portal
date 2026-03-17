"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MedicoService, AtencionPageData } from '@/lib/services/medico.service';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const atencionSchema = z.object({
  pesoKg: z.coerce.number().optional(),
  alturaM: z.coerce.number().optional(),
  presionArterial: z.string().optional(),
  frecuenciaCardiaca: z.coerce.number().optional(),
  temperaturaC: z.coerce.number().optional(),
  diagnosticoMedico: z.string().min(1, 'El diagnóstico es requerido.'),
  planTratamiento: z.string().optional(),
  recomendaciones: z.string().optional(),
  nivelSemaforo: z.enum(['V', 'A', 'R']),
  requiereSeguimiento: z.boolean().default(false),
  fechaSugeridaSeguimiento: z.date().optional(),
  tipoAlta: z.string().min(1, 'El tipo de alta es requerido.'),
});

type AtencionFormValues = z.infer<typeof atencionSchema>;

export default function AtencionMedicaPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const citaId = params.citaId as string;

  const [data, setData] = useState<AtencionPageData | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<AtencionFormValues>({
    resolver: zodResolver(atencionSchema),
    defaultValues: {
      requiereSeguimiento: false,
      nivelSemaforo: 'V',
    },
  });

  const requiereSeguimiento = form.watch('requiereSeguimiento');

  useEffect(() => {
    if (citaId) {
      MedicoService.getAtencionMedicaData(citaId).then(res => {
        setData(res);
        if (res) form.setValue('nivelSemaforo', res.cita.caso.nivelSemaforo);
        setLoading(false);
      }).catch(err => {
        console.error("Error loading attention data", err);
        setLoading(false);
      });
    }
  }, [citaId, form]);

  const onSubmit = async (formData: AtencionFormValues) => {
    if (!data || !userProfile?.idMedico) return;
    try {
      await MedicoService.crearAtencion({
        ...formData,
        fechaSugeridaSeguimiento: formData.fechaSugeridaSeguimiento?.toISOString().split('T')[0],
        idCita: citaId,
        idCaso: data.cita.idCaso!,
        idMedico: userProfile.idMedico,
        fechaAtencion: new Date().toISOString(),
        estadoAtencion: 'Finalizada'
      });
      toast({ title: "Atención guardada", description: "La atención médica se ha registrado correctamente." });
      router.push('/medico/dashboard');
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la atención.", variant: "destructive" });
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!data) return <div>No se encontró la cita.</div>;

  const { cita } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Atención Médica</h1>
      <Card>
        <CardHeader>
          <CardTitle>Paciente: {cita.paciente.nombreCompleto}</CardTitle>
          <CardDescription>Cita del {cita.fechaCita} a las {cita.horaCita} | Caso: {cita.caso.codigoCaso}</CardDescription>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Signos Vitales</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <FormField name="pesoKg" control={form.control} render={({ field }) => <FormItem><FormLabel>Peso (kg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField name="alturaM" control={form.control} render={({ field }) => <FormItem><FormLabel>Altura (m)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField name="presionArterial" control={form.control} render={({ field }) => <FormItem><FormLabel>Presión Arterial</FormLabel><FormControl><Input placeholder="120/80" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField name="frecuenciaCardiaca" control={form.control} render={({ field }) => <FormItem><FormLabel>Frec. Cardíaca</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField name="temperaturaC" control={form.control} render={({ field }) => <FormItem><FormLabel>Temp (°C)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Diagnóstico y Plan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField name="diagnosticoMedico" control={form.control} render={({ field }) => <FormItem><FormLabel>Diagnóstico Médico</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField name="planTratamiento" control={form.control} render={({ field }) => <FormItem><FormLabel>Plan de Tratamiento</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField name="recomendaciones" control={form.control} render={({ field }) => <FormItem><FormLabel>Recomendaciones</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Cierre de Atención</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="nivelSemaforo" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Nivel Semáforo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="V">Verde</SelectItem><SelectItem value="A">Amarillo</SelectItem><SelectItem value="R">Rojo</SelectItem></SelectContent>
                    </Select><FormMessage />
                  </FormItem>)}
                />
                <FormField name="tipoAlta" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Tipo de Alta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="Alta Médica">Alta Médica</SelectItem><SelectItem value="Referencia a especialista">Referencia a especialista</SelectItem><SelectItem value="Seguimiento interno">Seguimiento interno</SelectItem></SelectContent>
                    </Select><FormMessage />
                  </FormItem>)}
                />
              </div>
              <FormField name="requiereSeguimiento" control={form.control} render={({ field }) => (
                <FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>¿Requiere seguimiento?</FormLabel></FormItem>
              )} />
              {requiereSeguimiento && (
                <FormField name="fechaSugeridaSeguimiento" control={form.control} render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Fecha Sugerida de Seguimiento</FormLabel>
                    <Popover><PopoverTrigger asChild>
                      <FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Seleccione fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button></FormControl>
                    </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent></Popover><FormMessage />
                  </FormItem>
                )} />
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>Guardar Atención</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}

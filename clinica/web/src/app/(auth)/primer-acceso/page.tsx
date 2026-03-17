"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const resetSchema = z.object({
  carnet: z.string().min(5, "El carnet es obligatorio"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetValues = z.infer<typeof resetSchema>;

export default function PrimerAccesoPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      carnet: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetValues) => {
    try {
      await api.post('/auth/reset-password', {
        carnet: values.carnet,
        password: values.password
      });
      
      toast({
        title: "¡Éxito!",
        description: "Tu contraseña ha sido configurada. Ahora puedes iniciar sesión.",
      });
      
      router.push('/login');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "No se pudo actualizar la contraseña. Verifique su carnet.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Primer Acceso</CardTitle>
        <CardDescription>Configure su nueva contraseña para comenzar.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="carnet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Carnet</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: ABC12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Procesando..." : "Configurar Cuenta"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" asChild>
          <Link href="/login">Volver al inicio de sesión</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

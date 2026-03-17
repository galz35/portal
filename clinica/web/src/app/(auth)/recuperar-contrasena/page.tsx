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

const recoverSchema = z.object({
  carnet: z.string().min(5, "El carnet es obligatorio"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RecoverValues = z.infer<typeof recoverSchema>;

export default function RecuperarContrasenaPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RecoverValues>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      carnet: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RecoverValues) => {
    try {
      await api.post('/auth/reset-password', {
        carnet: values.carnet,
        password: values.password
      });
      
      toast({
        title: "Contraseña recuperada",
        description: "Tu contraseña ha sido actualizada. Ya puedes entrar al sistema.",
      });
      
      router.push('/login');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "No se pudo restablecer la contraseña.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Recuperar Contraseña</CardTitle>
        <CardDescription>Ingrese su carnet y su nueva contraseña.</CardDescription>
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
                    <Input placeholder="Ingrese su carnet registrado" {...field} />
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
                    <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
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
              {form.formState.isSubmitting ? "Restableciendo..." : "Actualizar Contraseña"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" asChild>
          <Link href="/login">Regresar al Login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

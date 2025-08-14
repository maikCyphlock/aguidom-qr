"use client"

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

// 1. Define un esquema de validación para el formulario usando Zod.
const formSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  location: z.string().min(2, { message: 'La ubicación debe tener al menos 2 caracteres.' }),
  description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }),
});

export default function Client() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');

  // 2. Define tu formulario con useForm y el resolver de Zod.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
    },
  });

  // 3. Define la función que se ejecuta al enviar el formulario.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSubmissionMessage('');
    try {
      const response = await fetch('/api/club', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al crear el club.');
      }

      setSubmissionMessage('Club creado correctamente.');
      form.reset(); // Reinicia el formulario si la creación fue exitosa.

    } catch (error) {
      setSubmissionMessage(error instanceof Error ? error.message : 'Error desconocido.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-4">
      <h1 className="text-2xl font-bold mb-4">Crear un nuevo club</h1>
      {submissionMessage && (
        <div className={`p-3 rounded-lg mb-4 ${submissionMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {submissionMessage}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del club</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Club de Lectura" {...field} />
                </FormControl>
                <FormDescription>
                  Este será el nombre visible de tu club.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Caracas, Venezuela" {...field} />
                </FormControl>
                <FormDescription>
                  Dónde se encuentra tu club.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe tu club en detalle..." {...field} />
                </FormControl>
                <FormDescription>
                  Una breve descripción de lo que se trata tu club.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear club'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}

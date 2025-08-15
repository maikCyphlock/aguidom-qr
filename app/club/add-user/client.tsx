"use client"

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { users } from '@/lib/db/schema';

// Define un esquema de validación para el formulario de usuarios usando Zod.
const userSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'El correo electrónico no es válido.' }),
});

interface ClientProps {
  clubId: string;
}

export default function Client({ clubId }: ClientProps) {
  const [usersWithoutClub, setUsersWithoutClub] = useState<typeof users.$inferSelect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionMessage, setSubmissionMessage] = useState('');

  // 1. Define tu formulario con useForm y el resolver de Zod para agregar usuarios.
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // 2. Función para obtener la lista de usuarios sin club.
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/club/user');
        const {data}: {data:typeof users.$inferSelect[]} = await response.json();
        if (response.ok) {
          setUsersWithoutClub(data);
        } else {
          //@ts-expect-error por si acaso explota
          setSubmissionMessage(data.error || 'No se pudo obtener la lista de usuarios.');
        }
      } catch (error) {
        console.error('Error de red al obtener usuarios:', error);
        setSubmissionMessage('Error de red al obtener usuarios.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // 3. Función para añadir un usuario a un club
  async function addUserToClub(userId: string) {
    try {
      const response = await fetch('/api/club/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubId,
          userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmissionMessage('Usuario añadido al club exitosamente');
        // Actualizar la lista de usuarios sin club
        setUsersWithoutClub(prev => prev.filter(user => user.userId !== userId));
      } else {
        setSubmissionMessage(data.error || 'Error al añadir usuario al club');
      }
    } catch (error) {
      console.error('Error de red al añadir usuario al club:', error);
      setSubmissionMessage('Error de red al añadir usuario al club');
    }
  }

  // 4. Función que se ejecuta al enviar el formulario para agregar un usuario (ejemplo).
  async function onSubmit(values: z.infer<typeof userSchema>) {
    setSubmissionMessage('Funcionalidad de añadir usuario no implementada.');
    // Aquí iría la lógica para enviar los datos del nuevo usuario a una ruta API
    return values;
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Sección para mostrar la lista de usuarios sin club */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios sin club</CardTitle>
          <CardDescription>Lista de usuarios que pueden unirse a un club.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            {isLoading ? (
              <p>Cargando usuarios...</p>
            ) : usersWithoutClub.length > 0 ? (
              <ul className="space-y-2">
                {usersWithoutClub.map((user) => (
                  <li key={user.userId}  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => addUserToClub(user.userId)}
                    >
                      Añadir
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">No hay usuarios sin club.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Sección para añadir un nuevo usuario */}
      <Card>
        <CardHeader>
          <CardTitle>Añadir un nuevo usuario</CardTitle>
          <CardDescription>Crea un nuevo perfil de usuario para añadirlo a un club.</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Añadir usuario</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React from 'react';
import { useUserProfileQuery } from '@/lib/hooks/use-user-profile-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/stores/authStore';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type ProfileFormData = {
  name: string;
  phone: string;
  clubId: string;
};

export function UserProfile() {
  const { 
    data: profile, 
    isLoading, 
    error, 
    updateProfile, 
    isUpdating, 
    updateError 
  } = useUserProfileQuery();
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      clubId: profile?.clubId || '',
    },
  });

  // Update form when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        phone: profile.phone || '',
        clubId: profile.clubId || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        name: data.name,
        phone: data.phone || null,
        clubId: data.clubId || null,
      });
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
      console.error('Update profile error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando perfil...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive">
        <h3 className="font-medium">Error al cargar el perfil</h3>
        <p className="text-sm">{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  const handleLoginClick = () => {
    window.location.href = '/auth/login';
  };

  if (!user) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">No has iniciado sesión</h3>
        <p className="text-muted-foreground mb-4">
          Por favor inicia sesión para ver tu perfil
        </p>
        <Button onClick={handleLoginClick}>
          Iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tu perfil</h2>
        <p className="text-muted-foreground">
          Actualiza tu información personal
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={user.email || ''}
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            {...register('name', { required: 'El nombre es requerido' })}
            placeholder="Tu nombre completo"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="Tu número de teléfono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clubId">ID del club</Label>
          <Input
            id="clubId"
            {...register('clubId')}
            placeholder="ID de tu club"
          />
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={isUpdating}
            className="min-w-[120px]"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : 'Guardar cambios'}
          </Button>
          {updateError && (
            <p className="mt-2 text-sm text-destructive">
              {updateError.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

import Client from './client';
import { db } from '@/lib/db/index';
import { clubs, users } from '@/lib/db/schema';
import { redirect } from "next/navigation";
import { eq, and, isNotNull } from 'drizzle-orm';
import { createClient, SupabaseClient } from '@/lib/supabase/server';

import {pipe ,Exit,Effect} from 'effect';

/**
 * Esta es la página principal que obtiene los datos del club y el usuario
 * utilizando la inyección de dependencias de Effect.ts para el cliente de Supabase.
 */
export default async function Page() {

  /**
   * Define el programa principal de Effect que contiene toda la lógica de negocio.
   * Se usa Effect.gen para secuenciar las operaciones de forma síncrona.
   */
  const mainProgram = Effect.gen(function* () {
    // Inyecta el SupabaseClient del entorno proporcionado por la capa 'createClient'
    const supabase = yield* SupabaseClient;

    // Obtiene las reclamaciones (claims) de la sesión de Supabase.
    // Usamos Effect.tryPromise para manejar posibles errores de la llamada asíncrona.
    const { data: sessionData, error: sessionError } = yield* Effect.tryPromise<{
        data: { claims?: { email: string } } | null;
        error: Error | null;
      }>(() => supabase.auth.getClaims());

    // Si hay un error de sesión o no hay claims, redirige al login.
    // Esto es un efecto secundario de Next.js, por lo que lo llamamos directamente.
    if (sessionError || !sessionData?.claims) {
      redirect("/auth/login");
    }

    const email = sessionData?.claims?.email;

    // Consulta la base de datos para obtener el usuario, envolviendo la llamada en Effect.tryPromise.
    const user = yield* Effect.tryPromise({
      try: () => db.select().from(users).where(eq(users.email, email)).get(),
      catch: (error) => new Error(`Error al buscar usuario: ${error instanceof Error ? error.message : String(error)}`),
    });

    if (!user) {
      throw new Error('No se encontró el usuario en la base de datos');
    }

    // Verifica el rol del usuario. Si no es 'admin', retorna el JSX de error.
    if (user?.role !== 'admin') {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl text-center">No tienes permisos, consulta con tu profesor</h2>
          </div>
        </div>
      );
    }
    
    // Verifica si el usuario tiene un club asignado
    if (!user.clubId) {
      throw new Error('Tu cuenta no está asociada a ningún club. Por favor, contacta al administrador.');
    }

    // Consulta el club del usuario, envolviendo la llamada en Effect.tryPromise
    const club = yield* Effect.tryPromise({
      try: () => {
        if (!user.clubId) {
          throw new Error('Tu cuenta no está asociada a ningún club. Por favor, contacta al administrador.');
        }

        return db.select()
        .from(clubs)
        .where(eq(clubs.id, user.clubId))
        .get()
      },
      catch: (error) => new Error(`Error al buscar el club: ${error instanceof Error ? error.message : 'Error desconocido'}`),
    });

    if (!club) {
      throw new Error('No se pudo encontrar la información del club. Por favor, inténtalo de nuevo más tarde.');
    }

    // Retorna el componente Client con los datos del club, que será el resultado final del programa.
    return <Client club={club || { id: '', name: '' }} />;
  });

  // Ejecuta el programa principal.
  // Proporciona la capa 'createClient' para resolver la dependencia SupabaseClient.
  // Usamos Effect.runPromise para ejecutar el efecto asíncrono y obtener el resultado.
  // El .pipe() se usa para encadenar operaciones de Effect.
  const exit = await pipe(
    mainProgram,
    Effect.provide(createClient),
    Effect.runPromiseExit,
  );

  // Mapa de errores conocidos con mensajes amigables
  const getFriendlyErrorMessage = (error: unknown): string => {
    // Si es un error de autenticación
    if (error instanceof Error && error.message.includes('Failed to get session')) {
      return 'Error de autenticación. Por favor, inicia sesión nuevamente.';
    }
    
    // Si es un error de base de datos
    if (error instanceof Error && error.message.includes('Error al buscar usuario')) {
      return 'Error al cargar la información del usuario. Por favor, intenta de nuevo.';
    }
    
    // Si es un error de club no encontrado
    if (error instanceof Error && error.message.includes('Tu cuenta no está asociada a ningún club')) {
      return 'Tu cuenta no está asociada a ningún club. Por favor, contacta al administrador.';
    }
    
    // Si es un error de base de datos de club
    if (error instanceof Error && error.message.includes('Error al buscar el club')) {
      return 'No se pudo cargar la información del club. Por favor, intenta de nuevo más tarde.';
    }
    
    // Error genérico para cualquier otro caso
    return 'Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.';
  };

  // Maneja el resultado del programa
  if (Exit.isSuccess(exit)) {
    return exit.value;
  } else {
    // Extrae el mensaje de error de manera segura
    let errorMessage = 'Lo sentimos, ha ocurrido un error inesperado.';
    let debugInfo = 'No hay información de depuración disponible.';
    
    if (Exit.isFailure(exit)) {
      const cause = exit.cause;
      
      // Registra el error completo solo en el servidor
      console.error('Error en la aplicación:', {
        error: cause,
        timestamp: new Date().toISOString()
      });
      
      // Obtiene un mensaje amigable basado en el tipo de error
      if (cause._tag === 'Fail' && cause.error instanceof Error) {
        errorMessage = getFriendlyErrorMessage(cause.error);
        debugInfo = `Error: ${cause.error.name}`; // Solo el nombre del error, no el mensaje completo
      } else if (cause._tag === 'Die' && cause.defect instanceof Error) {
        errorMessage = getFriendlyErrorMessage(cause.defect);
        debugInfo = `Error: ${cause.defect.name}`;
      }
    }

    // Muestra solo el mensaje amigable al usuario
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">¡Ups! Algo salió mal</h2>
            <p className="text-gray-600">{errorMessage}</p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-4">
              Si el problema persiste, por favor contacta al soporte técnico.
            </p>
            <button
              
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Reintentar
            </button>
          </div>
          
          {/* Solo visible en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-50 rounded text-xs text-gray-500 overflow-hidden">
              <p className="font-mono truncate">{debugInfo}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}


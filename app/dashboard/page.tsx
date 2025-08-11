import { createClient, SupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Dashboard from '@/components/dashboard'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Effect } from "effect";

// Define la lógica de la página dentro de un Effect.gen para manejar las dependencias
const dashboardPageLogic = Effect.gen(function* () {
  // Obtiene el cliente de Supabase del contexto de Effect
  const supabase = yield* SupabaseClient;

  // Envuelve las llamadas asíncronas de Supabase y Drizzle en Effect.promise
  const { data: { claims } } = yield* Effect.promise(() => supabase.auth.getClaims());
  const user = claims;

  if (!user) {
    // Si no hay usuario, regresa un objeto que indique la redirección
    return { shouldRedirect: true, user: null, userFromDb: null };
  }

  const userFromDb = yield* Effect.promise(() =>
    db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .get()
  );
  
  // Devuelve los datos si el usuario existe
  return { shouldRedirect: false, claims, userFromDb };
});

export default async function DashboardPage() {
  // Ejecuta la lógica del Effect, proporcionando la capa del cliente de Supabase
  const { shouldRedirect, claims, userFromDb } = await Effect.runPromise(
    dashboardPageLogic.pipe(
      Effect.provide(createClient)
    )
  );

  if (shouldRedirect) {
    return redirect("/auth/login");
  }

  return (
    <Dashboard claims={claims} userFromDb={userFromDb} >
      <div className="flex w-full min-h-screen bg-muted/20">
        {/* Sidebar */}


        {/* Main content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tarjeta de información del usuario */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-xl font-bold">Perfil de usuario</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Información básica de tu cuenta
                </p>
              </CardHeader>
              <CardContent className="mt-6 grid gap-4">
                <div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={claims.user_metadata.avatar_url} />
                    <AvatarFallback>{userFromDb?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Nombre</p>
                    <p className="font-medium">{userFromDb?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                    📧
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{userFromDb?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                    🆔
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cédula</p>
                    <p className="font-medium">{userFromDb?.idNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                    📞
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="font-medium">
                      {userFromDb?.phone || "No registrado"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Otra tarjeta de ejemplo */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No hay actividad reciente.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </Dashboard>
  );
}

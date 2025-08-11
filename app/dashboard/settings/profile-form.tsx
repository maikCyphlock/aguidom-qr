// app/dashboard/page.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Dashboard from "@/components/dashboard";
import { type User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface State {
  message: string | null;
  error: string | null;
}

export function ProfileForm({ user, userFromDb }: { user: User; userFromDb: any }) {
  const [state, setState] = useState<State>({ message: null, error: null });
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          idNumber: formData.get("idNumber"),
          phone: formData.get("phone"),
          userFromDb,
        }),
      });

      const result = await response.json();
      setState(
        response.ok
          ? { message: result.message, error: null }
          : { message: null, error: result.error }
      );
    });
  };

  return (
    <Dashboard userFromDb={userFromDb} claims={user}>
      <Card className=" max-w-2xl w-full mx-auto">
        <CardHeader>
          <CardTitle>Editar Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {state?.message && (
              <Alert className="bg-green-50 border-green-200 text-green-700">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            {state?.error && (
              <Alert className="bg-red-50 border-red-200 text-red-700">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1">
              <Label htmlFor="email">Correo Electronico</Label>
              <Input id="email" type="email" value={user.email} disabled />
            </div>

            <div className="space-y-1">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={userFromDb?.name}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="idNumber">Cédula</Label>
              <Input
                id="idNumber"
                name="idNumber"
                type="text"
                defaultValue={userFromDb?.idNumber}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={userFromDb?.phone ?? ""}
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "actualizando..." : "actualizar perfil"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Dashboard>
  );
}

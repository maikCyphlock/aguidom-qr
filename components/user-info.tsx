"use client"

import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserInfo() {
  const { user, signOut } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Información del Usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-gray-600 mb-2">
            Datos de Autenticación
          </h3>
          <div className="space-y-1 text-sm">
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>ID:</strong> {user?.id}</div>
            <div><strong>Último login:</strong> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</div>
          </div>
        </div>
        
        <Button onClick={signOut} variant="outline">
          Cerrar Sesión
        </Button>
      </CardContent>
    </Card>
  );
}

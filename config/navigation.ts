// src/config/navigation.ts
import { Home, QrCode, UserCheck, ShieldCheck } from "lucide-react";

export const bottomNavRoutes = [
  {
    label: "Inicio",
    path: "/",
    icon: Home,
  },
  {
    label: "Generar QR",
    path: "/qr",
    icon: QrCode,
  },
  {
    label: "Verificar",
    path: "/qr/verify",
    icon: ShieldCheck,
  },
  {
    label: "Perfil",
    path: "/dashboard",
    icon: UserCheck,
  },
  
];

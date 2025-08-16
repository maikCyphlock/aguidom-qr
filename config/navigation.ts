// src/config/navigation.ts
import { 
  Home, 
  QrCode, 
  ShieldCheck, 
  User, 
  Users, 
  Settings, 
  LogIn, 
 Camera,
  UserPlus,
  LayoutDashboard,
  UserCheck,
  CalendarCheck,
  LockKeyhole,
  UserCog
} from "lucide-react";

// Main navigation items (shown in bottom bar)
export const bottomNavRoutes = [
  {
    label: "Inicio",
    path: "/",
    icon: Home,
  },
  {
    label: "QR",
    path: "/qr",
    icon: QrCode,
  },
  {
    label: "Verificar",
    path: "/qr/verify",
    icon: Camera,
  },
  {
    label: "Clubes",
    path: "/club",
    icon: Users,
  },
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
];

// Auth navigation items
export const authRoutes = [
  {
    label: "Iniciar Sesión",
    path: "/auth/login",
    icon: LogIn,
  },
  {
    label: "Registrarse",
    path: "/auth/sign-up",
    icon: UserPlus,
  },
  {
    label: "Recuperar Contraseña",
    path: "/auth/forgot-password",
    icon: LockKeyhole,
  },
];

// Dashboard navigation items
export const dashboardRoutes = [
  {
    label: "Perfil",
    path: "/dashboard",
    icon: User,
  },
  {
    label: "Asistencia",
    path: "/dashboard/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Ajustes",
    path: "/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Administrar Usuarios",
    path: "/dashboard/users",
    icon: UserCog,
  },
];

// Club management routes
export const clubRoutes = [
  {
    label: "Crear Club",
    path: "/club/create",
    icon: Users,
  },
  {
    label: "Añadir Usuario",
    path: "/club/add-user",
    icon: UserPlus,
  },
];

// All available routes in the application
export const allRoutes = [
  ...bottomNavRoutes,
  ...authRoutes,
  ...dashboardRoutes,
  ...clubRoutes,
  {
    label: "Verificación de QR",
    path: "/qr/verify",
    icon: ShieldCheck,
  },
  {
    label: "Seguridad",
    path: "/security",
    icon: ShieldCheck,
  },
];

# Sistema de Autenticación Híbrido Seguro

Este proyecto utiliza un sistema de autenticación híbrido que combina **Supabase** para la autenticación y **Turso** con Drizzle para almacenar datos del usuario, con una arquitectura segura que mantiene la base de datos solo en el servidor.

## Arquitectura de Seguridad

### Supabase (Cliente + Servidor)
- Maneja el login/logout en el cliente
- Gestiona sesiones y tokens JWT
- Proporciona autenticación segura

### Turso + Drizzle (Solo Servidor)
- Almacena información del perfil del usuario
- Datos específicos del negocio (club, rol, etc.)
- **NUNCA** se accede directamente desde el cliente
- Todas las consultas pasan por APIs del servidor

## Componentes Principales

### 1. AuthStore (`lib/stores/authStore.ts`)
El store principal que sincroniza ambos sistemas a través de APIs:

```typescript
const { user, userProfile, isAuthenticated } = useAuthStore()

// user: Datos de Supabase (email, id, sesión)
// userProfile: Datos de Turso obtenidos vía API
// isAuthenticated: true si ambos están disponibles
```

### 2. Hook useUser (`lib/hooks/use-user.ts`)
Hook personalizado que proporciona acceso fácil a los datos combinados:

```typescript
const { 
  user,           // Datos de Supabase
  userProfile,    // Datos de Turso (vía API)
  isAuthenticated, // Estado combinado
  isAdmin,        // Verificación de rol
  getName,        // Función helper
  belongsToClub   // Verificación de club
} = useUser()
```

### 3. Hook useAuthSync (`lib/hooks/use-auth-sync.ts`)
Sincroniza automáticamente los datos cuando cambia el estado de autenticación.

### 4. APIs del Servidor
- `GET /api/user/profile` - Obtener perfil del usuario
- `PUT /api/user/profile` - Actualizar perfil del usuario

## Uso en Componentes

### Ejemplo Básico
```tsx
import { useUser } from '@/lib/hooks/use-user'

export function MyComponent() {
  const { user, userProfile, isAuthenticated } = useUser()
  
  if (!isAuthenticated) {
    return <div>No autenticado</div>
  }
  
  return (
    <div>
      <h1>Hola {userProfile?.name || user?.email}</h1>
      <p>Club: {userProfile?.clubId}</p>
      <p>Rol: {userProfile?.role}</p>
    </div>
  )
}
```

### Verificación de Permisos
```tsx
const { isAdmin, hasRole, belongsToClub } = useUser()

// Verificar si es admin
if (isAdmin) {
  // Mostrar funcionalidades de admin
}

// Verificar rol específico
if (hasRole('trainer')) {
  // Mostrar funcionalidades de entrenador
}

// Verificar pertenencia a club
if (belongsToClub('club-123')) {
  // Mostrar datos específicos del club
}
```

## Flujo de Sincronización Seguro

1. **Login**: Usuario se autentica en Supabase (cliente)
2. **Sincronización**: Se llama a la API `/api/user/profile` (servidor)
3. **Verificación**: La API verifica autenticación con Supabase
4. **Consulta**: Se accede a Turso solo desde el servidor
5. **Respuesta**: Los datos se envían de vuelta al cliente
6. **Estado**: Se actualiza el store con ambos datos

## Estructura de Datos

### User (Supabase)
```typescript
{
  id: string
  email: string
  last_sign_in_at: string
  // ... otros campos de Supabase
}
```

### UserProfile (Turso - vía API)
```typescript
{
  userId: string
  name: string | null
  email: string
  clubId: string | null
  role: string | null
  phone: string | null
  // ... otros campos personalizados
}
```

## Configuración

### 1. Variables de Entorno
```env
# Supabase (cliente + servidor)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_key

# Turso (solo servidor)
TURSO_DATABASE_URL=your_turso_url
TURSO_AUTH_TOKEN=your_turso_token
```

### 2. Provider en Layout
```tsx
// app/layout.tsx
import { AuthProvider } from '@/components/auth-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Ventajas del Sistema Híbrido Seguro

1. **Seguridad Máxima**: Turso nunca se expone al cliente
2. **Autenticación Robusta**: Supabase maneja la autenticación de forma segura
3. **Flexibilidad**: Turso permite esquemas personalizados
4. **Sincronización**: Datos siempre actualizados entre ambos sistemas
5. **Escalabilidad**: Cada sistema se especializa en su función
6. **Mantenimiento**: Separación clara de responsabilidades

## Consideraciones de Seguridad

- **Turso**: Solo accesible desde el servidor
- **APIs**: Todas verifican autenticación antes de acceder a Turso
- **Cliente**: Solo tiene acceso a Supabase para autenticación
- **Tokens**: Nunca se exponen en el cliente
- **Validación**: Todas las entradas se validan en el servidor

## Operaciones Disponibles

### Obtener Perfil
```typescript
// Se ejecuta automáticamente en login
await useAuthStore.getState().syncUserProfile(email)

// O manualmente
await useAuthStore.getState().refreshUserProfile()
```

### Actualizar Perfil
```typescript
await useAuthStore.getState().updateUserProfile({
  name: 'Nuevo Nombre',
  phone: '123-456-7890'
})
```

El sistema ahora es completamente seguro, con Turso solo accesible desde el servidor a través de APIs autenticadas.

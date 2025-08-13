# Configuración de Variables de Entorno

Este proyecto requiere configurar variables de entorno para funcionar correctamente. Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

## Variables Requeridas

### Supabase (Autenticación)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
```

### Turso (Base de Datos - Solo Servidor)
```env
# Variables privadas (solo servidor)
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

## Obtener las Variables

### Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Selecciona tu proyecto
3. Ve a Settings > API
4. Copia la URL del proyecto y la anon key

### Turso
1. Ve a [turso.tech](https://turso.tech)
2. Crea una base de datos
3. Obtén la URL y el token de autenticación

## Estructura del Archivo .env.local

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Turso - Solo servidor (privadas)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
```

## Notas Importantes

- **NEXT_PUBLIC_**: Las variables con este prefijo están disponibles en el cliente (browser)
- **Sin prefijo**: Solo están disponibles en el servidor
- **Turso**: Solo se accede desde el servidor a través de APIs por seguridad
- **.env.local**: Este archivo no se sube a Git (está en .gitignore)
- **Seguridad**: Nunca subas tokens o claves secretas a repositorios públicos

## Arquitectura de Seguridad

- **Cliente**: Solo tiene acceso a Supabase para autenticación
- **Servidor**: Accede a Turso para operaciones de base de datos
- **APIs**: Todas las consultas a Turso pasan por APIs del servidor
- **Autenticación**: Se verifica en cada API antes de acceder a Turso

## Verificación

El sistema validará automáticamente que todas las variables requeridas estén configuradas. Si falta alguna, verás un error claro indicando cuál falta.

## Solución de Problemas

### Error: "Variable de entorno requerida"
- Verifica que todas las variables estén definidas en `.env.local`
- Reinicia el servidor de desarrollo después de cambiar las variables

### Error: "No autorizado" en APIs
- Verifica que Supabase esté configurado correctamente
- Asegúrate de que el usuario esté autenticado

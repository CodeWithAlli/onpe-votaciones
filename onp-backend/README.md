# ONP Votaciones — Backend con Supabase

Backend completo usando Supabase (PostgreSQL + Edge Functions).
Sin servidores propios — todo corre en la nube de Supabase.

---

## 🗂 Archivos incluidos

```
supabase/
├── schema.sql                        ← Ejecutar primero en SQL Editor
└── functions/
    ├── verificar-votante/index.ts    ← Verifica DNI en el padrón
    ├── emitir-voto/index.ts          ← Registra el voto de forma segura
    ├── admin-login/index.ts          ← Login del administrador
    ├── admin-stats/index.ts          ← Estadísticas en tiempo real
    ├── admin-estado/index.ts         ← Activa / pausa / cierra elección
    └── candidatos-publicos/index.ts  ← Lista de candidatos (pública)

api.ts          ← Reemplaza src/services/api.ts en el frontend
.env.example    ← Variables de entorno para el frontend
```

---

## 🚀 Pasos de configuración

### 1. Crear proyecto en Supabase
1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Elegir nombre, contraseña de BD, región más cercana (São Paulo o us-east)
3. Esperar ~2 minutos a que el proyecto se cree

### 2. Crear las tablas
1. En el panel de Supabase → **SQL Editor** → **New query**
2. Pegar todo el contenido de `supabase/schema.sql`
3. Click en **Run** (o Ctrl+Enter)
4. Verificar que aparezcan las tablas en **Table Editor**

### 3. Instalar Supabase CLI
```bash
npm install -g supabase
supabase login
cd onp-supabase
```

### 4. Desplegar las Edge Functions
```bash
# En la carpeta raíz del proyecto
supabase link --project-ref TUPROYECTO-REF

# Desplegar todas las funciones
supabase functions deploy verificar-votante
supabase functions deploy emitir-voto
supabase functions deploy admin-login
supabase functions deploy admin-stats
supabase functions deploy admin-estado
supabase functions deploy candidatos-publicos
```

El `TUPROYECTO-REF` lo encuentras en:
Supabase → Settings → General → **Reference ID**

### 5. Configurar secretos de las Edge Functions
```bash
# Estos valores están en: Supabase → Settings → API
supabase secrets set SUPABASE_URL=https://TUPROYECTO.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
supabase secrets set JWT_SECRET=una-clave-secreta-larga-y-aleatoria-2026
```

> ⚠️ El `SERVICE_ROLE_KEY` tiene acceso total a la BD. Nunca lo pongas en el frontend.

### 6. Configurar el frontend
1. Copiar `.env.example` como `.env.local` en la carpeta del frontend
2. Completar los valores:

```env
VITE_SUPABASE_FUNCTIONS_URL=https://TUPROYECTO.supabase.co/functions/v1
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_USE_MOCK=false
VITE_ELECCION_ID=a1b2c3d4-0000-0000-0000-000000000001
```

3. Reemplazar `src/services/api.ts` con el archivo `api.ts` de este paquete
4. Reiniciar: `npm run dev`

---

## 🔑 Credenciales de admin (por defecto)

| Usuario | Contraseña |
|---------|------------|
| `admin` | `onpe2026` |

> Para cambiar la contraseña en producción, genera un hash bcrypt real:
> ```bash
> node -e "const b=require('bcrypt'); b.hash('nueva-clave',10).then(console.log)"
> ```
> Luego actualiza `password_hash` en la tabla `admin_usuarios`.

---

## 📡 Endpoints disponibles

| Función              | Método | URL                                              | Auth       |
|----------------------|--------|--------------------------------------------------|------------|
| verificar-votante    | POST   | `.../functions/v1/verificar-votante`            | anon key   |
| emitir-voto          | POST   | `.../functions/v1/emitir-voto`                  | anon key   |
| candidatos-publicos  | GET    | `.../functions/v1/candidatos-publicos`          | anon key   |
| admin-login          | POST   | `.../functions/v1/admin-login`                  | anon key   |
| admin-stats          | GET    | `.../functions/v1/admin-stats?eleccion_id=uuid` | JWT admin  |
| admin-estado         | PATCH  | `.../functions/v1/admin-estado`                 | JWT admin  |

---

## 🔒 Seguridad implementada

- **DNI nunca se guarda** en la tabla de votos — solo su hash SHA-256
- **Doble voto imposible** — constraint UNIQUE en `dni_hash` + verificación previa
- **Elección cerrada** no acepta más votos (verificado en la Edge Function)
- **JWT propio** para admins con expiración de 8 horas
- **RLS activo** en todas las tablas — el frontend con anon key no puede leer el padrón ni los votos directamente
- **service_role_key** solo en Edge Functions, nunca en el cliente

---

## 🧪 Probar los endpoints manualmente

```bash
# Verificar DNI de prueba
curl -X POST https://TUPROYECTO.supabase.co/functions/v1/verificar-votante \
  -H "Content-Type: application/json" \
  -H "apikey: TU-ANON-KEY" \
  -H "Authorization: Bearer TU-ANON-KEY" \
  -d '{"dni": "12345678"}'

# Login de admin
curl -X POST https://TUPROYECTO.supabase.co/functions/v1/admin-login \
  -H "Content-Type: application/json" \
  -H "apikey: TU-ANON-KEY" \
  -H "Authorization: Bearer TU-ANON-KEY" \
  -d '{"username": "admin", "password": "onpe2026"}'
```

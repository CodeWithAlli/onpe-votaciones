# ONP Votaciones — Frontend

Sistema de votación electrónica para elecciones generales del Perú.
Desarrollado con React 19 + TypeScript + Vite.

---

## 🚀 Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL de su backend

# 3. Iniciar en modo desarrollo (con datos mock)
npm run dev

# 4. Construir para producción
npm run build
```

---

## 📁 Estructura del proyecto

```
src/
├── context/
│   ├── AccesibilidadContext.tsx   # Modos visuales (alto contraste, etc.)
│   └── AuthContext.tsx            # Sesión del administrador
├── data/
│   └── mockData.ts                # Datos de prueba para desarrollo
├── pages/
│   ├── usuario/
│   │   ├── VerificacionPage.tsx   # Paso 1: Ingresar DNI
│   │   ├── CandidatosPage.tsx     # Paso 2: Seleccionar candidato
│   │   ├── ConfirmacionPage.tsx   # Paso 3: Confirmar voto
│   │   └── ComprobantePage.tsx    # Paso 4: Comprobante final
│   └── administrador/
│       ├── AdminLoginPage.tsx     # Login del admin
│       ├── AdminDashboardPage.tsx # Control de la elección
│       ├── AdminResultadosPage.tsx# Resultados + gráficos
│       └── AdminCandidatosPage.tsx# Gestión de candidatos
├── components/
│   └── shared/
│       ├── PanelAccesibilidad.tsx # Selector de modo visual
│       ├── Stepper.tsx            # Indicador de progreso
│       └── RutaProtegida.tsx      # Guard para rutas de admin
├── services/
│   └── api.ts                     # Capa de comunicación con el backend
├── types/
│   └── index.ts                   # Tipos TypeScript centrales
└── styles/
    └── global.css                 # Sistema de diseño completo
```

---

## 🔌 Contrato con el Backend

### Variables de entorno

| Variable       | Descripción                          | Ejemplo                    |
|----------------|--------------------------------------|----------------------------|
| `VITE_API_URL` | URL base del backend                 | `http://localhost:8000`    |
| `VITE_USE_MOCK`| `true` = datos mock, `false` = API   | `true`                     |

Cuando `VITE_USE_MOCK=false`, el frontend llama a los siguientes endpoints:

---

### Endpoints requeridos

#### Votante

| Método | Ruta                    | Body                                        | Respuesta esperada                |
|--------|-------------------------|---------------------------------------------|-----------------------------------|
| POST   | `/api/votante/verificar`| `{ "dni": "12345678" }`                     | `VotanteVerificado`               |
| POST   | `/api/votante/votar`    | `{ "dni", "candidato_id", "eleccion_id" }`  | `Voto`                            |

**`VotanteVerificado`:**
```json
{
  "dni": "12345678",
  "nombre": "Juan Pedro",
  "apellido": "Villanueva Soto",
  "fechaNacimiento": "1985-03-22",
  "ubigeo": "150101",
  "distrito": "Lima Cercado",
  "yaVoto": false
}
```

**`Voto`:**
```json
{
  "id": "uuid",
  "candidatoId": "c1",
  "eleccionId": "elec-2026",
  "timestamp": "2026-06-15T10:30:00Z",
  "codigoVerificacion": "ONP-ABC123"
}
```

---

#### Elección y Candidatos

| Método | Ruta                                    | Respuesta esperada      |
|--------|-----------------------------------------|-------------------------|
| GET    | `/api/eleccion/activa`                  | `Eleccion`              |
| GET    | `/api/eleccion/:id/candidatos`          | `Candidato[]`           |

**`Candidato`:**
```json
{
  "id": "c1",
  "numero": 1,
  "nombre": "María",
  "apellido": "González Ríos",
  "partido": "Alianza por el Perú",
  "siglas": "APP",
  "colorPartido": "#1a56db",
  "foto": "https://cdn.ejemplo.com/foto.jpg"
}
```

---

#### Administrador (requiere Bearer token)

| Método | Ruta                                      | Descripción                    |
|--------|-------------------------------------------|--------------------------------|
| POST   | `/api/admin/login`                        | Login → devuelve `token`       |
| GET    | `/api/admin/estadisticas/:eleccionId`     | Estadísticas en tiempo real    |
| PATCH  | `/api/admin/eleccion/:id/estado`          | Cambiar estado de elección     |
| POST   | `/api/admin/eleccion/:id/candidatos`      | Cargar lista de candidatos     |
| DELETE | `/api/admin/eleccion/:id/datos`           | Limpiar datos (solo pendiente) |
| GET    | `/api/admin/eleccion/:id/exportar`        | Exportar CSV (blob)            |

**Autenticación:** el token se envía automáticamente en cada request como:
```
Authorization: Bearer <token>
```

---

## ♿ Modos de accesibilidad

El panel flotante (ícono ☀ en el header) permite cambiar entre:

| Modo            | Descripción                                |
|-----------------|--------------------------------------------|
| `estandar`      | Vista institucional normal                 |
| `altoContraste` | Fondo negro, texto blanco                  |
| `textoGrande`   | Fuente 125% más grande, botones más altos  |
| `daltonismo`    | Paleta azul/naranja (sin rojo/verde)       |

La preferencia se guarda en `localStorage` y persiste entre sesiones.

---

## 🗺 Rutas

| Ruta                  | Descripción                        | Acceso       |
|-----------------------|------------------------------------|--------------|
| `/votar`              | Verificación de DNI (paso 1)       | Público      |
| `/votar/candidatos`   | Selección de candidato (paso 2)    | Con sesión   |
| `/votar/confirmar`    | Confirmación del voto (paso 3)     | Con sesión   |
| `/votar/gracias`      | Comprobante final (paso 4)         | Con sesión   |
| `/admin/login`        | Login del administrador            | Público      |
| `/admin/dashboard`    | Panel de control                   | Admin auth   |
| `/admin/resultados`   | Resultados con gráficos            | Admin auth   |
| `/admin/candidatos`   | Gestión de candidatos              | Admin auth   |

---

## 🔒 Seguridad del flujo de votación

1. Datos del votante se guardan en `sessionStorage` (se borran al cerrar pestaña)
2. Al emitir el voto, `onp_candidato_seleccionado` se elimina inmediatamente
3. Al llegar al comprobante, toda la sesión del votante se limpia
4. El token del admin se guarda en `localStorage` y se envía automáticamente
5. Las rutas de admin tienen guard (`RutaProtegida`) que redirige si no hay sesión

---

## 🛠 Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo en http://localhost:3000
npm run build    # Compilar para producción (salida en /dist)
npm run preview  # Previsualizar build de producción
npm run lint     # Verificar calidad del código
```

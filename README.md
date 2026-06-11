# 🗳️ Sistema de Votación Electrónica - ONPE Digital

## 📖 Descripción

Sistema web de votación electrónica inspirado en los procesos de la Oficina Nacional de Procesos Electorales (ONPE), desarrollado para demostrar competencias en desarrollo Full Stack, gestión de usuarios, seguridad, validación de identidad, administración electoral y despliegue en la nube.

La plataforma permite la gestión integral de procesos electorales, incluyendo validación de votantes, emisión de votos, administración de candidatos, supervisión del padrón electoral, auditoría de actividades y visualización de resultados en tiempo real.


## 📌 Nota para Reclutadores y Evaluadores

Este proyecto se encuentra desplegado utilizando servicios cloud gratuitos para fines de demostración y portafolio profesional.

Debido a las limitaciones de los planes gratuitos utilizados en la infraestructura, algunos servicios del backend y la base de datos pueden entrar en estado de suspensión automática después de períodos prolongados de inactividad.

Si al ingresar al demo observa una carga inicial más lenta de lo habitual, espere algunos segundos y recargue la página. Los servicios se reactivarán automáticamente.

Esta situación corresponde únicamente a restricciones del entorno de despliegue y no afecta la funcionalidad ni la arquitectura implementada en el sistema.

---
## 🚀 Demo

🔗 Demo en producción:

https://onpe-votaciones.vercel.app/votar

## ✨ Características Principales

### 👤 Módulo de Votantes

* Verificación de identidad mediante DNI.
* Validación contra padrón electoral.
* Emisión de voto electrónico.
* Restricción de doble votación.
* Confirmación de voto registrado.
* Interfaz intuitiva y responsive.

### 🛡️ Panel Administrativo

* Gestión de procesos electorales.
* Administración de candidatos.
* Gestión del padrón electoral.
* Administración de usuarios.
* Auditoría de acciones realizadas.
* Estadísticas electorales.
* Visualización de resultados.

### 📊 Sistema de Resultados

* Conteo automático de votos.
* Resultados en tiempo real.
* Estadísticas generales.
* Reportes electorales.
* Visualización de participación ciudadana.

### 🔒 Seguridad

* Autenticación mediante Supabase Auth.
* Protección de rutas administrativas.
* Validación de permisos por rol.
* Registro de auditoría.
* Validaciones en frontend y backend.
* Comunicación segura mediante HTTPS.

---

## 🏗️ Arquitectura

Frontend (React + TypeScript)

↓

API Layer

↓

Supabase Edge Functions

↓

Supabase Database

### Flujo de la Aplicación

1. El votante ingresa su DNI.
2. El sistema verifica su existencia en el padrón electoral.
3. Se valida que no haya emitido un voto previamente.
4. El usuario selecciona su candidato.
5. El voto se registra en la base de datos.
6. Los resultados se actualizan automáticamente.

---

## 🛠️ Tecnologías Utilizadas

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

### Backend

* Supabase
* Edge Functions (Deno)
* PostgreSQL
* Supabase Auth

### Despliegue

* Vercel
* Supabase Cloud

---

## 📂 Funcionalidades Administrativas

### Gestión Electoral

* Crear elecciones.
* Activar o cerrar procesos electorales.
* Configurar parámetros de votación.

### Gestión de Candidatos

* Registro de candidatos.
* Edición de información.
* Control de participación electoral.

### Gestión del Padrón

* Registro de votantes.
* Importación de datos.
* Validación de electores.

### Auditoría

* Registro de acciones administrativas.
* Trazabilidad de operaciones.
* Historial de eventos.

---

## 🎯 Objetivos del Proyecto

Este proyecto fue desarrollado con fines educativos y profesionales para demostrar conocimientos en:

* Desarrollo Full Stack.
* Arquitectura cliente-servidor.
* Bases de datos relacionales.
* Seguridad y autenticación.
* Integración con servicios cloud.
* Diseño de sistemas escalables.
* Desarrollo de aplicaciones empresariales.

---

## 📧 Contacto

Si encuentra algún inconveniente al acceder al sistema, desea realizar consultas técnicas o solicitar información adicional sobre el proyecto, puede contactarme mediante:

📧 [codewithalli.dev@gmail.com](mailto:codewithalli.dev@gmail.com)

---

## 👨‍💻 Autor

Desarrollado por Allison como proyecto de portafolio profesional enfocado en desarrollo Full Stack, arquitectura cloud y sistemas de gestión electoral.

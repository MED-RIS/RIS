# 🔌 Integración con la API

Este documento describe la interacción del frontend del RIS con la API del backend, explicando cómo se inyectan las credenciales, cómo funciona el wrapper de peticiones y los endpoints principales del sistema.

---

## ⚙️ Configuración del Servidor Base (`src/Users/user.ts`)

La aplicación frontend se comunica con el servidor backend utilizando la URL provista por las variables de entorno. Si no se detecta ninguna variable, el sistema tiene por defecto un fallback local:

```typescript
export const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

---

## 🔒 Inyección de Cabeceras de Autorización (`src/utils/token.ts`)

Para cada petición que requiera autenticación, la aplicación adjunta un JSON Web Token (JWT) almacenado en el `localStorage` bajo el nombre `'usuario'`. La función `getAuthHeaders()` se encarga de formatear y devolver estas cabeceras:

```typescript
export function getAuthHeaders() {
  const localStr = localStorage.getItem('usuario');
  const session = localStr ? JSON.parse(localStr) : null;
  const token = session?.token;

  if (token) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  } else {
    return {
      'Content-Type': 'application/json',
    };
  }
}
```

---

## 🛸 Envoltorio de Peticiones HTTP (`src/RisWorklist/risService.ts`)

Para evitar la repetición de lógica de autenticación en cada petición, `risService.ts` implementa una función auxiliar `fetchWithAuth`. Esta función inyecta automáticamente el token JWT y realiza la llamada `fetch` nativa:

```typescript
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
};
```

---

## 📡 Endpoints del Sistema RIS

A continuación, se listan los endpoints principales que se consumen en la aplicación:

### 1. Gestión de Órdenes y Worklist
* **Obtener todas las órdenes:** `GET /api/ris/orders` (retorna un array de `Order`)
* **Crear nueva orden:** `POST /api/ris/orders` (recibe un objeto `Order` sin `_id`)
* **Modificar orden:** `PUT /api/ris/orders/:id` (actualiza datos generales)
* **Actualizar estado de orden:** `PATCH /api/ris/orders/:orderId/status` (ej. cambia a `IN_PROGRESS`, `COMPLETED`, `SIGNED`)
* **Eliminar orden:** `DELETE /api/ris/orders/:id`

### 2. Gestión de Pacientes (CRUD)
* **Listado general:** `GET /api/ris/patients`
* **Registrar paciente:** `POST /api/ris/patients`
* **Actualizar ficha:** `PUT /api/ris/patients/:id`
* **Eliminar registro:** `DELETE /api/ris/patients/:id`

### 3. Caja Registradora
* **Listado de turnos de caja:** `GET /api/ris/cash-register`
* **Apertura de caja:** `POST /api/ris/cash-register/open`
  * *Payload:* `{ initialAmount: number, status: 'OPEN', openedBy: string }`
* **Cierre de caja:** `PUT /api/ris/cash-register/:id/close`
  * *Payload:* `{ currentAmount: number, status: 'CLOSED', closedBy: string }`

### 4. Subida y Descarga de Documentos Adjuntos (`RisUploadDocuments.tsx`)
Este módulo se comunica con endpoints dedicados a la gestión de archivos físicos asociados a los pacientes:
* **Subir archivo (Multipart):** `POST /api/subida/upload`
  * Envía un cuerpo de tipo `FormData` conteniendo el archivo bajo la clave `file` y el nombre normalizado del paciente bajo la clave `paciente`.
* **Listar archivos del paciente:** `GET /api/subida/files/:paciente`
* **Descargar / Ver archivo:** `GET /api/subida/files/download/:filename`
* **Eliminar archivo:** `DELETE /api/subida/files/:filename`

### 5. Configuración del Sistema e Historiales
* **Equipos:** `GET` / `POST` / `PUT` / `DELETE` en `/api/ris/equipment`
* **Modalidades:** `GET` / `POST` / `PUT` / `DELETE` en `/api/ris/modalities`
* **Servicios (Procedimientos):** `GET` / `POST` / `PUT` / `DELETE` en `/api/ris/services`
* **Sucursales:** `GET` / `POST` / `PUT` / `DELETE` en `/api/ris/branches`
* **Organizaciones (OIDs):** `GET` / `POST` / `PATCH` / `DELETE` en `/api/organizations`
* **Plantillas de Informes:** `GET` / `POST` / `PUT` / `DELETE` en `/api/ris/templates`
* **Inventario / Insumos:** `GET` / `POST` / `PUT` / `DELETE` en `/api/ris/inventory`

---

## 🗃️ Tipado de Datos (`src/RisWorklist/types.ts`)

Todos los datos devueltos por la API se tipan con interfaces estrictas en TypeScript, tales como `Patient`, `Modality`, `Equipment`, `Service`, `Order`, `Company`, `CashRegister`, asegurando que las respuestas contengan la estructura correcta esperada por el frontend.

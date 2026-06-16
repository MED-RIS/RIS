# 🧩 Mapeo de Módulos y Componentes

El panel de control principal de la aplicación (`RisWorklistPanel`) se estructura mediante pestañas laterales dinámicas. A continuación, se detalla el listado de componentes de la carpeta `src/RisWorklist/components`, su ubicación de archivo y su funcionalidad dentro del flujo hospitalario.

---

## 📋 Tabla Resumen de Pestañas (Tabs)

El sistema cuenta con **24 componentes modulares** divididos por responsabilidades operativas:

| # | Pestaña / Vista | Archivo Asociado | Propósito Operativo |
| :--- | :--- | :--- | :--- |
| 1 | **Totem** | `TotemTab.tsx` | Interfaz de autoatención para pacientes en sala de espera. |
| 2 | **Caja Registradora** | `CashRegisterTab.tsx` | Control financiero (apertura, cierre y transacciones de caja). |
| 3 | **Informes (Reporting)** | `ReportsTab.tsx` | Redacción, edición con plantillas HTML y firma de informes. |
| 4 | **Consultas** | `ConsultaTab.tsx` | Historial radiológico del paciente e inspección rápida. |
| 5 | **Órdenes (Worklist)** | `OrdersTab.tsx` | Listado y administración de estudios agendados. |
| 6 | **Citas** | `AppointmentsTab.tsx` | Calendario y agenda diaria de citas de pacientes. |
| 7 | **Pacientes** | `PatientsTab.tsx` | Registro centralizado (CRUD) de la base de datos de pacientes. |
| 8 | **Métricas y KPIs** | `MetricsTab.tsx` | Dashboard con gráficas y analíticas financieras y de volumen. |
| 9 | **Plantillas** | `TemplatesTab.tsx` | Editor de informes preestablecidos según modalidad DICOM. |
| 10 | **Inventario** | `InventoryTab.tsx` | Control de stock de insumos médicos y precios. |
| 11 | **Mantenimiento** | `MaintenanceTab.tsx` | Historial de mantenimiento de equipos radiológicos. |
| 12 | **Equipos** | `EquipmentTab.tsx` | Gestión de máquinas/equipos y números de serie. |
| 13 | **Modalidades** | `ModalitiesTab.tsx` | Catálogo de códigos DICOM de modalidades (CT, MR, CR, etc.). |
| 14 | **Servicios** | `ServicesTab.tsx` | Listado de procedimientos médicos, costos y precios. |
| 15 | **Empresas** | `CompaniesTab.tsx` | Convenios corporativos, aseguradoras e información RUC. |
| 16 | **Organizaciones** | `OrganizationsTab.tsx` | Configuración de OIDs de las instituciones del sistema. |
| 17 | **Sucursales** | `BranchesTab.tsx` | Gestión de sedes físicas donde opera el sistema RIS. |
| 18 | **Casos Docentes** | `TeachingFileTab.tsx` | Base de datos de casos médicos marcados para docencia. |
| 19 | **Telerradiología** | `TeleradiologyTab.tsx` | Distribución de carga de lecturas para radiólogos remotos. |
| 20 | **Formulario** | `FormularioTab.tsx` | Formulario dinámico de captura y registro rápido de órdenes. |

---

## 🛠️ Modales e Interfaces Auxiliares

| Componente | Archivo Asociado | Propósito Operativo |
| :--- | :--- | :--- |
| **Subida de Archivos** | `RisUploadDocuments.tsx` | Carga de órdenes físicas, PDFs o exámenes previos por paciente. |
| **Perfil del Paciente** | `PatientProfileModal.tsx` | Ficha detallada con datos demográficos y antecedentes del paciente. |
| **Telemedicina** | `TelemedModal.tsx` | Videollamadas integradas para discusión remota de casos. |
| **Contenedor Modal** | `RisModal.tsx` | Componente base (wrapper) que asegura la consistencia UI/UX en modales. |

---

## 🔍 Detalle de Componentes Clave

### 1. Central de Informes (`ReportsTab.tsx`)
Permite a los radiólogos redactar los resultados diagnósticos.
* **Integración de Plantillas:** Al seleccionar un informe, el sistema precarga las plantillas en formato HTML estructuradas en `TemplatesTab` correspondientes a la modalidad del estudio.
* **Firma Digital:** Proceso de validación que cambia el estado a `SIGNED` y bloquea la edición del documento para garantizar integridad legal.
* **Casos Docentes:** Permite marcar un reporte con la bandera `Teaching File` para que aparezca en el repositorio de investigación clínica (`TeachingFileTab`).

### 2. Control Financiero (`CashRegisterTab.tsx`)
Permite gestionar la tesorería de la jornada de trabajo.
* **Flujo de Caja:** Valida si existe una caja abierta para el usuario actual. Si no, bloquea las funciones de pago y solicita el ingreso del monto de apertura inicial.
* **Historial de Cierres:** Muestra montos iniciales, transacciones de entrada (efectivo, tarjetas, transferencias, seguros) y calcula el arqueo final al dar clic en cerrar caja.

### 3. Subida de Documentos (`RisUploadDocuments.tsx`)
Componente modular para adjuntar archivos a la ficha del estudio.
* **Arrastrar y Soltar (Drag & Drop):** Zona reactiva interactiva con detector de arrastre y soporte para límites de archivos de 50MB.
* **Control de Duplicados:** Alerta si el archivo a subir comparte el mismo nombre y extensión con un documento ya existente en la base de datos del paciente, advirtiendo sobre su posible reemplazo.
* **Sincronización RIS:** Tras una subida exitosa, realiza una llamada a `/api/ris/reports` para actualizar el estado del estudio e indicar la presencia de anexos.

### 4. Totem de Autoatención (`TotemTab.tsx`)
Interfaz táctil simplificada.
* **Llegada del Paciente:** El paciente ingresa con su identificador u orden médica para confirmar su presencia presencial en la clínica.
* **Consentimiento Informado:** Integra una firma digital manuscrita en lienzo HTML5 Canvas para almacenar los consentimientos requeridos en estudios contrastados o invasivos antes de la toma del examen.

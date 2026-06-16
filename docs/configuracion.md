# 📘 Guía de Instalación y Despliegue

Este documento detalla los pasos para levantar el entorno de desarrollo del sistema RIS frontend, así como el flujo de compilación y despliegue en producción utilizando contenedores Docker.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
* **Node.js** (versión recomendada: `20.x` o superior, LTS)
* **npm** (versión `10.x` o superior)
* **Docker** y **Docker Compose** (opcional, para levantamiento en contenedores)

---

## 🛠️ Configuración Local (Sin Docker)

### 1. Clonar el repositorio e instalar dependencias
Instala los paquetes necesarios definidos en `package.json` de forma limpia:
```bash
npm install
```

### 2. Variables de Entorno
Crea o edita el archivo `.env` en la raíz del proyecto para definir la dirección de la API de backend:
```env
VITE_API_URL=http://localhost:5000
```
> [!NOTE]
> En Vite, todas las variables de entorno destinadas a consumirse en el frontend deben llevar el prefijo `VITE_`. Se accede a ellas mediante `import.meta.env.VITE_API_URL`.

### 3. Levantar Servidor de Desarrollo
Inicia el servidor local de Vite con soporte para Hot Module Replacement (HMR):
```bash
npm run dev
```
Por defecto, la aplicación estará disponible en [http://localhost:5173](http://localhost:5173).

### 4. Compilar para Producción
Genera la carpeta `dist/` con el código minificado y optimizado para producción:
```bash
npm run build
```
Puedes previsualizar el bundle localmente antes de desplegarlo con:
```bash
npm run preview
```

---

## 🐳 Despliegue con Docker y Docker Compose

El proyecto está preparado para su despliegue tanto en modo desarrollo (con HMR y volúmenes montados) como en producción (servido a través de Nginx).

### ⚙️ Arquitectura de Dockerfile
El archivo `Dockerfile` utiliza **Multi-stage builds** dividido en 4 etapas principales:
1. **`base`**: Instala Node.js 20 en Alpine y copia los archivos de dependencias `package*.json`.
2. **`development`**: Instala todas las dependencias (`npm install`), monta el código y expone el puerto `5173` corriendo Vite en modo host (`--host 0.0.0.0`).
3. **`builder`**: Compila el bundle de producción (`npm run build`) tras realizar una instalación limpia con `npm ci`.
4. **`production`**: Utiliza una imagen ligera de Nginx, copia el build generado en la etapa anterior a `/usr/share/nginx/html` y carga una configuración personalizada en `nginx.conf` para manejar las rutas SPA.

---

### 🚀 Levantar el Entorno de Desarrollo (Contenedor)

En el modo de desarrollo con Docker, el código local se mapea mediante volúmenes hacia el contenedor para permitir cambios en caliente (HMR).

```bash
docker compose up --build ris-dev
```

* **Puerto expuesto:** `http://localhost:5173`
* **Definición en `docker-compose.yml`:**
```yaml
  ris-dev:
    container_name: ris-frontend-dev
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:5000
    stdin_open: true
    tty: true
    restart: always
```

---

### 📦 Levantar el Entorno de Producción (Contenedor)

Para producción, el código se compila dentro del contenedor de compilación y se sirve de forma estática a través de un servidor web Nginx configurado para SPA.

```bash
docker compose up --build ris-prod
```

* **Puerto expuesto:** `http://localhost:8080` (redirecciona al puerto `80` interno de Nginx)
* **Definición en `docker-compose.yml`:**
```yaml
  ris-prod:
    container_name: ris-frontend-prod
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "8080:80"
    restart: always
```

---

## 🌐 Configuración de Nginx (`nginx.conf`)

Dado que React Router (`react-router-dom`) maneja el enrutamiento en el cliente, Nginx debe estar configurado para redireccionar todas las rutas desconocidas al archivo base `index.html`. De lo contrario, se obtendría un error `404 Not Found` al refrescar la página en cualquier ruta que no sea `/`.

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        # Redirección SPA indispensable:
        try_files $uri $uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

## 🔍 Verificación y Calidad de Código

El proyecto tiene configurado ESLint para verificar estándares de calidad y bugs potenciales:
```bash
# Ejecutar análisis estático de código
npm run lint
```
El archivo de configuración asociado es `eslint.config.js`.

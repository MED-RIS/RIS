# 🛠️ Credenciales e Instalación en otro equipo — Troubleshooting

Esta guía complementa a [configuracion.md](./configuracion.md) (instalación del frontend) con lo necesario para levantar el sistema completo (frontend + backend) en un equipo nuevo, cómo funcionan las credenciales, y los problemas reales que ya se presentaron y cómo se resolvieron.

---

## 📦 El sistema son dos repositorios

Para tener el RIS funcionando completo en un equipo nuevo hacen falta **los dos repos**, no solo este:

| Repo | Qué es | Puerto por defecto |
| :--- | :--- | :--- |
| `RIS-SERVER` | Backend (API, MongoDB, integración PACS/DICOM, HL7, WhatsApp) | `5000` |
| `RIS` (este repo) | Frontend (panel web) | `5173` (dev) / `80` dentro del contenedor de producción |

Instrucciones de instalación de cada uno, en su propio `docs/configuracion.md`.

Si además querés probar contra un PACS local (sin depender de un servidor remoto), `RIS-SERVER` trae un laboratorio DCM4CHEE con Docker:

```bash
npm run pacs-lab:up    # levanta DCM4CHEE local en localhost:8080
```

**Requisito importante:** todo esto (backend, pacs-lab) depende de que **Docker Desktop esté corriendo**. Si Docker no está iniciado, el backend puede tardar en arrancar o directamente no conectar, y el frontend no va a poder ver estudios del PACS aunque todo el código esté bien.

---

## 🔑 Credenciales

Ningún usuario ni contraseña real va en el código ni en la documentación — se definen por variable de entorno, distintas en cada instalación:

- **Usuario administrador inicial:** lo crea automáticamente el backend la primera vez que arranca, usando `ADMIN_EMAIL` y `ADMIN_PASSWORD` del `.env` de `RIS-SERVER`. Cada instalación (tu máquina, el servidor de SUS, el de CNS, etc.) debe tener su **propio valor**, no el que viene de ejemplo en `.env.example`.
- **JWT_SECRET:** clave con la que el backend firma las sesiones. También debe ser propia de cada instalación, larga y aleatoria.
- Si en algún momento alguna instalación quedó con los valores de ejemplo del `.env.example` (`ADMIN_PASSWORD`/`JWT_SECRET` sin cambiar), hay que **rotarlos ya** — quedaron documentados en el repo en algún momento y no son seguros para un entorno real.

> Para pedir o compartir credenciales de un ambiente específico (SUS, CNS, etc.), se hace por un canal privado (no por el repo ni por chat abierto), y quien las entrega debe confirmar que no son las de ejemplo.

---

## 🩺 Problemas reales y cómo se resolvieron

### 1. "No veo el PACS" / no aparecen estudios
**Causa:** Docker Desktop estaba apagado en la máquina, y el PACS local (`pacs-lab`, DCM4CHEE) corre dentro de Docker.
**Solución:**
```bash
# 1. Iniciar Docker Desktop
# 2. En RIS-SERVER:
npm run pacs-lab:up
# 3. Verificar que responda:
curl -o /dev/null -w "%{http_code}\n" http://localhost:8080/dcm4chee-arc/aets/DCM4CHEE/rs/studies
```

### 2. Login funciona en tu máquina pero no en el servidor de la nube
**Síntoma:** el navegador muestra un error de Vite ("Failed to parse source... invalid JS syntax") con contenido que parece un archivo del sistema operativo (`/proc/self/mountinfo`).

**Causa real:** el contenedor en la nube estaba corriendo el **servidor de desarrollo de Vite** (`ris-dev`, con `--host 0.0.0.0`) expuesto directo a internet. El modo desarrollo de Vite no es seguro para exponer públicamente — permite lectura de archivos del servidor por fuera del proyecto, y lo que se veía en el error era justamente eso siendo explotado (probablemente por un bot escaneando, no un usuario real).

**Solución:** correr el target de **producción** (`ris-prod`), que compila el proyecto y lo sirve con Nginx (sin las vulnerabilidades del modo desarrollo):
```bash
docker compose stop ris-dev
docker compose up -d --build ris-prod
```
**Nunca dejar `ris-dev` expuesto a un dominio público.** Es solo para desarrollo local o entre máquinas de confianza.

### 3. Error "Conflict: the container name ... is already in use"
**Causa:** el servidor tiene varios proyectos corriendo (otros sistemas, otros clientes), y el `container_name` fijo del `docker-compose.yml` (`ris-frontend-prod`) coincidía con el de otro proyecto ya corriendo en la misma máquina.
**Solución:** los nombres de contenedor deben ser únicos en todo el servidor, no solo dentro del proyecto. Renombrar el `container_name` del servicio en conflicto:
```bash
sed -i 's/container_name: ris-frontend-prod/container_name: <nombre-unico>/' docker-compose.yml
docker compose up -d --build ris-prod
```

### 4. El frontend le pega a la URL de API equivocada
**Causa:** `VITE_API_URL` se "hornea" (queda fijo) dentro del bundle **en el momento de compilar** (`npm run build` / target `production` del Dockerfile), no se puede cambiar después en tiempo de ejecución como una variable de entorno normal de servidor.
**Solución:** confirmar el valor correcto en el `.env` (o en `environment:` del servicio de Docker Compose) **antes** de reconstruir la imagen, y volver a construir:
```bash
grep VITE_API_URL .env
docker compose up -d --build ris-prod
```

### 5. `ERR_CERT_DATE_INVALID` al conectar con el backend
**Causa:** el certificado SSL del dominio del backend estaba vencido.
**Diagnóstico:**
```bash
echo | openssl s_client -connect <dominio-del-backend>:443 -servername <dominio-del-backend> 2>/dev/null | openssl x509 -noout -dates
```
**Solución:** renovar con `certbot renew` en el servidor — requiere acceso `root`. Si tu usuario no está en el archivo de sudoers, hay que pedirle a quien administra el servidor que lo renueve, o (si la cuenta de Contabo de esa VPS es tuya) restablecer la contraseña de `root` desde el panel de Contabo.

---

## ✅ Checklist rápido antes de decir "ya está listo"

- [ ] Docker Desktop corriendo (si vas a probar PACS local o el backend completo)
- [ ] `RIS-SERVER` arriba, con Mongo conectado (revisar consola: "MongoDB Conectado...")
- [ ] `.env` de ambos repos con valores propios, **no** los de `.env.example`
- [ ] En producción, el contenedor corriendo es `ris-prod` (Nginx), nunca `ris-dev`
- [ ] Certificados SSL vigentes en los dominios que se van a usar

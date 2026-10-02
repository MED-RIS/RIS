// Sin VITE_API_URL, el backend se busca en la misma máquina que sirve el frontend:
// así funciona igual abriendo localhost o la IP de la laptop desde otra PC de la red.
export const api = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

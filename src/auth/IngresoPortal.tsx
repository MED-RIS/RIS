import React, { useEffect, useState } from 'react';
import { api } from '../Users/user';

// Ingreso desde el portal "Corea Servicios SUS": el portal abre este sistema con
// https://…/#sso=PASE (pase de un solo uso, 60 s). Aquí se cambia por una sesión de este sistema
// (POST /api/auth/sso) y se sigue sin pedir la contraseña. Sin pase, no hace nada.
export const paseDelPortal = () => {
  const m = window.location.hash.match(/[#&]sso=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : '';
};

export default function IngresoPortal({ children }: { children: React.ReactNode }) {
  const [pase] = useState(paseDelPortal);
  const [estado, setEstado] = useState<'listo' | 'entrando' | 'error'>(pase ? 'entrando' : 'listo');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pase) return;
    // El pase no debe quedar en la barra de direcciones ni en el historial
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    (async () => {
      try {
        const r = await fetch(`${api}/api/auth/sso`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pase }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d.token) throw new Error(d.error || 'No se pudo ingresar desde el portal');
        const s = { token: d.token, user: d.user };
        localStorage.setItem('usuario', JSON.stringify(s));
        localStorage.setItem('authSession', JSON.stringify({ ...s, expiresAt: Date.now() + 12 * 60 * 60 * 1000 }));
        setEstado('listo');
      } catch (e: any) {
        setError(e.message);
        setEstado('error');
      }
    })();
  }, [pase]);

  if (estado === 'entrando') {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-gray-300 text-sm">
        Ingresando desde Corea Servicios SUS…
      </div>
    );
  }
  if (estado === 'error') {
    return (
      <div className="h-screen flex items-center justify-center bg-black p-6">
        <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-600/10 p-6 text-center">
          <div className="text-white font-bold mb-2">No se pudo ingresar desde el portal</div>
          <div className="text-sm text-red-200 mb-4">{error}</div>
          <a href="/login" className="text-sm text-primary-light underline">Ingresar con usuario y contraseña</a>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

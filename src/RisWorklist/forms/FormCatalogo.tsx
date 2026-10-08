import React from 'react';
import { ParametroLab } from '../laboratorio/catalogoLaboratorio';

interface FormCatalogoProps {
  titulo?: string;
  parametros: ParametroLab[];
  datos: any;
  setDatos: (datos: any) => void;
}

// Formulario armado desde el catálogo: sirve para editar los exámenes que no
// tienen un formulario propio (los agregados del formulario SUS D-8).
export default function FormCatalogo({ titulo, parametros, datos, setDatos }: FormCatalogoProps) {
  const valores = datos || {};
  const cambiar = (key: string, value: string) => setDatos({ ...valores, [key]: value });

  const inputBase =
    'w-full bg-[#050a09] border border-[#2a403a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00bfa5] transition-colors';

  return (
    <div className="space-y-3">
      {titulo && <h4 className="text-xs font-bold uppercase tracking-wider text-[#00bfa5]">{titulo}</h4>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {parametros.map((p) => (
          <div key={p.key}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              {p.label}
              {p.unidad && <span className="normal-case text-gray-500"> ({p.unidad})</span>}
            </label>
            {p.opciones ? (
              <select value={valores[p.key] ?? ''} onChange={(e) => cambiar(p.key, e.target.value)} className={inputBase}>
                <option value="">-- Seleccionar --</option>
                {p.opciones.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input value={valores[p.key] ?? ''} onChange={(e) => cambiar(p.key, e.target.value)} placeholder={p.rango || ''} className={inputBase} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

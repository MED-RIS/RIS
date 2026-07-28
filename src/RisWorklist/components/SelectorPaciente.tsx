import React, { useState } from 'react';
import { Search, User, ArrowLeft, UserPlus, ChevronRight } from 'lucide-react';
import { Patient } from '../types';

interface SelectorPacienteProps {
  patients: Patient[];
  onSeleccionar: (paciente: Patient) => void;
  onCancelar: () => void;
}

const calcularEdad = (fechaNacimiento?: string): string => {
  if (!fechaNacimiento) return '—';
  const nac = new Date(fechaNacimiento);
  if (isNaN(nac.getTime())) return '—';
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return `${edad} años`;
};

// Selector de paciente para "Nuevo Informe": lista SOLO pacientes existentes del store
// compartido (pestaña Pacientes). No crea pacientes acá — si no hay, invita a crearlos allá.
export default function SelectorPaciente({ patients, onSeleccionar, onCancelar }: SelectorPacienteProps) {
  const [busqueda, setBusqueda] = useState('');

  const q = busqueda.trim().toLowerCase();
  const filtrados = patients.filter((p) => {
    if (!q) return true;
    const texto = `${p.firstName ?? ''} ${p.lastName ?? ''} ${p.patientId ?? ''}`.toLowerCase();
    return texto.includes(q);
  });

  return (
    <div className="text-white">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onCancelar}
          className="p-2 bg-[#050a09] border border-[#2a403a] rounded-lg text-gray-300 hover:text-white hover:border-[#00bfa5] transition-colors"
          title="Volver a la lista"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-bold text-white">Nuevo Informe — Seleccionar Paciente</h2>
          <p className="text-xs text-gray-500 mt-0.5">Elegí un paciente ya registrado en la pestaña Pacientes.</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, apellido o MRN/ID..."
          className="w-full bg-[#050a09] border border-[#2a403a] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00bfa5] transition-colors"
        />
      </div>

      {patients.length === 0 ? (
        <div className="border border-dashed border-[#2a403a] rounded-xl p-12 text-center text-gray-500">
          <UserPlus className="w-8 h-8 mx-auto mb-3 text-gray-600 stroke-1" />
          <p className="text-sm font-semibold text-gray-300">No hay pacientes registrados</p>
          <p className="text-xs mt-1">Creá un paciente en la pestaña <b className="text-[#00bfa5]">Pacientes</b> y volvé acá para generar su informe.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {filtrados.map((p) => (
            <button
              key={p._id}
              onClick={() => onSeleccionar(p)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#1c352f] bg-[#050a09] hover:border-[#00bfa5] hover:bg-[#0e1715] transition-all text-left group"
            >
              <div className="p-2 bg-[#121b18] rounded-lg border border-[#2a403a] text-[#00bfa5]">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white truncate">
                  {`${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Sin nombre'}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5 font-mono flex gap-3">
                  <span>MRN: {p.patientId || p._id}</span>
                  <span>{calcularEdad(p.dateOfBirth)}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#00bfa5] transition-colors" />
            </button>
          ))}
          {filtrados.length === 0 && (
            <div className="text-center text-xs text-gray-500 py-10 italic">
              Ningún paciente coincide con "{busqueda}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}

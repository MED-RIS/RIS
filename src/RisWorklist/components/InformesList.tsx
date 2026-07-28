import React, { useState } from 'react';
import { FileText, Plus, Search, FolderOpen, AlertCircle } from 'lucide-react';

interface InformesListProps {
  informes: any[];               // registros de ris_historial_cns
  onNuevoInforme: () => void;
  onAbrir: (informe: any) => void;
  soloLectura?: boolean;         // true = rol consulta: oculta "Nuevo Informe"
}

type FiltroEstado = 'TODOS' | 'BORRADOR' | 'COMPLETADO' | 'FIRMADO';

const FILTROS: FiltroEstado[] = ['TODOS', 'BORRADOR', 'COMPLETADO', 'FIRMADO'];

// Normaliza el estado de un informe a una de las 3 etiquetas del ciclo de vida.
const estadoDe = (informe: any): 'BORRADOR' | 'COMPLETADO' | 'FIRMADO' => {
  const raw = String(informe?.datos?.estadoInforme || informe?.estado || 'COMPLETADO').toUpperCase();
  if (raw.includes('BORRA')) return 'BORRADOR';
  if (raw.includes('FIRMA')) return 'FIRMADO';
  return 'COMPLETADO';
};

const ESTADO_BADGE: Record<string, string> = {
  BORRADOR: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  COMPLETADO: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  FIRMADO: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

export default function InformesList({ informes, onNuevoInforme, onAbrir, soloLectura }: InformesListProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroEstado>('TODOS');

  const q = busqueda.trim().toLowerCase();
  const visibles = informes.filter((inf) => {
    const est = estadoDe(inf);
    if (filtro !== 'TODOS' && est !== filtro) return false;
    if (!q) return true;
    const texto = `${inf?.paciente ?? ''} ${inf?.datos?.medico_solicitante ?? ''} ${inf?.datos?.nro_solicitud ?? ''} ${inf?.cod ?? ''}`.toLowerCase();
    return texto.includes(q);
  });

  return (
    <div className="text-white">
      {/* Cabecera */}
      <div className="flex flex-wrap justify-between items-start gap-4 border-b border-[#142823] pb-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#00bfa5] flex items-center gap-2">
            <FileText className="w-5 h-5" /> Informes de Laboratorio Clínico
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Gestión de análisis clínicos: Hematología, Serología, Urología, Química Sanguínea
          </p>
        </div>
        {!soloLectura && (
          <button
            onClick={onNuevoInforme}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00bfa5] text-[#04140f] rounded-lg text-sm font-bold hover:bg-[#00d4b8] transition-colors shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nuevo Informe
          </button>
        )}
      </div>

      {/* Buscador + filtros */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por paciente, médico, nro. de solicitud..."
            className="w-full bg-[#050a09] border border-[#2a403a] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00bfa5] transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                filtro === f
                  ? 'bg-[#00bfa5]/15 text-[#00bfa5] border-[#00bfa5]/40'
                  : 'bg-[#050a09] text-gray-400 border-[#2a403a] hover:text-white'
              }`}
            >
              {f === 'TODOS' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#0e1715] border border-[#2a403a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-[#1f332d]">
                <th className="text-left font-bold px-4 py-3">Paciente</th>
                <th className="text-left font-bold px-4 py-3">Nro. Solicitud</th>
                <th className="text-left font-bold px-4 py-3">Médico Derivante</th>
                <th className="text-left font-bold px-4 py-3">Fecha</th>
                <th className="text-left font-bold px-4 py-3">Estado</th>
                <th className="text-right font-bold px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((inf, idx) => {
                const est = estadoDe(inf);
                return (
                  <tr key={inf.cod ?? idx} className="border-b border-[#1f332d] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-bold text-white">{inf.paciente || 'Sin nombre'}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{inf?.datos?.nro_solicitud || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{inf?.datos?.medico_solicitante || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{inf.fecha || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ESTADO_BADGE[est]}`}>{est}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onAbrir(inf)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#00bfa5] bg-[#00bfa5]/10 border border-[#00bfa5]/20 rounded-lg hover:bg-[#00bfa5]/20 transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Abrir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibles.length === 0 && (
          <div className="text-center py-16 px-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-gray-600 stroke-1" />
            <p className="text-sm font-semibold text-gray-300">No se encontraron informes</p>
            <p className="text-xs text-gray-500 mt-1">
              {informes.length === 0
                ? 'Haga clic en "Nuevo Informe" para registrar uno nuevo.'
                : 'Probá con otro filtro o término de búsqueda.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

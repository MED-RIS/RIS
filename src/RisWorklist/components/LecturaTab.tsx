import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, ExternalLink, Clock, FileText, CheckCircle2, AlertTriangle, Timer } from 'lucide-react';
import { fetchAllReports } from '../risService';
import { urlEstudio } from '../visor';

// Lista de lectura del radiólogo: los estudios que llegaron al PACS en los últimos
// días cruzados con su informe del RIS (por StudyInstanceUID). Muestra qué falta
// informar, cuánto lleva esperando cada estudio y el tiempo de informe de los firmados.
// Los estudios salen del PACS por QIDO (no hace falta que tengan orden en el RIS).

type Estado = 'pendiente' | 'borrador' | 'firmado';

const RANGOS = [
  { id: 1, label: 'Hoy' },
  { id: 3, label: '3 días' },
  { id: 7, label: '7 días' },
  { id: 30, label: '30 días' },
];

const FILTROS: { id: Estado | 'todos'; label: string }[] = [
  { id: 'pendiente', label: 'Por informar' },
  { id: 'borrador', label: 'En borrador' },
  { id: 'firmado', label: 'Firmados' },
  { id: 'todos', label: 'Todos' },
];

// Modalidades que no son imágenes para informar
const NO_IMAGEN = ['SR', 'PR', 'KO', 'DOC', 'OT', 'SEG'];

const valor = (ds: any, tag: string) => ds?.[tag]?.Value?.[0];
const nombreDicom = (pn: any) =>
  String(typeof pn === 'string' ? pn : pn?.Alphabetic || '')
    .split('^')
    .filter(Boolean)
    .reverse()
    .join(' ')
    .trim();
const aaaammdd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

// Fecha y hora del estudio (hora local del equipo)
function cuandoSeHizo(ds: any): Date | null {
  const f = valor(ds, '00080020');
  if (!f || f.length !== 8) return null;
  const h = String(valor(ds, '00080030') || '000000');
  return new Date(+f.slice(0, 4), +f.slice(4, 6) - 1, +f.slice(6, 8), +h.slice(0, 2) || 0, +h.slice(2, 4) || 0);
}

function duracion(ms: number) {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h} h ${min % 60 ? `${min % 60} min` : ''}`.trim();
  return `${Math.floor(h / 24)} días`;
}

// Semáforo de espera: más de 24 h en rojo, más de 4 h en ámbar
const colorEspera = (ms: number) => (ms > 24 * 3600e3 ? 'text-red-400' : ms > 4 * 3600e3 ? 'text-amber-300' : 'text-emerald-300');

const CHIP: Record<Estado, string> = {
  pendiente: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  borrador: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  firmado: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};
const TEXTO_ESTADO: Record<Estado, string> = { pendiente: 'Por informar', borrador: 'Borrador', firmado: 'Firmado' };

export default function LecturaTab({ appConfig }: any) {
  const qidoRoot = appConfig?.dataSources?.[0]?.configuration?.qidoRoot || '/dicom-web';
  const [dias, setDias] = useState(3);
  const [filtro, setFiltro] = useState<Estado | 'todos'>('pendiente');
  const [modalidad, setModalidad] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [estudios, setEstudios] = useState<any[]>([]);
  const [informes, setInformes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [ahora, setAhora] = useState(Date.now());

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const desde = new Date();
      desde.setDate(desde.getDate() - (dias - 1));
      const params = new URLSearchParams({
        StudyDate: `${aaaammdd(desde)}-${aaaammdd(new Date())}`,
        includefield: '00081030,00080061,00201208,00080090,00080050,00080030,00100020',
        limit: '1000',
      });
      const [resPacs, reps] = await Promise.all([
        fetch(`${qidoRoot}/studies?${params}`, { headers: { Accept: 'application/dicom+json' } }),
        fetchAllReports().catch(() => []),
      ]);
      if (!resPacs.ok && resPacs.status !== 204) throw new Error(`El PACS respondió ${resPacs.status}`);
      setEstudios(resPacs.status === 204 ? [] : await resPacs.json());
      setInformes(Array.isArray(reps) ? reps : []);
      setAhora(Date.now());
    } catch (e: any) {
      setError(e.message || 'No se pudo consultar el PACS');
    } finally {
      setCargando(false);
    }
  }, [qidoRoot, dias]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Se refresca sola cada 2 minutos (llegan estudios nuevos del tomógrafo)
  useEffect(() => {
    const t = setInterval(cargar, 120000);
    return () => clearInterval(t);
  }, [cargar]);

  const filas = useMemo(() => {
    const porEstudio = new Map(informes.map((r: any) => [r.studyInstanceUid, r]));
    return estudios
      .map(ds => {
        const uid = valor(ds, '0020000D');
        const mods: string[] = (ds['00080061']?.Value || []).filter((m: string) => !NO_IMAGEN.includes(m));
        const rep: any = porEstudio.get(uid);
        const estado: Estado = rep?.status === 'SIGNED' ? 'firmado' : rep ? 'borrador' : 'pendiente';
        const hecho = cuandoSeHizo(ds);
        const fin = estado === 'firmado' && rep?.signedAt ? new Date(rep.signedAt).getTime() : ahora;
        return {
          uid,
          paciente: nombreDicom(valor(ds, '00100010')) || 'Sin nombre',
          documento: valor(ds, '00100020') || '',
          estudio: valor(ds, '00081030') || '—',
          modalidades: mods,
          imagenes: valor(ds, '00201208') || 0,
          solicitante: nombreDicom(valor(ds, '00080090')),
          hecho,
          espera: hecho ? fin - hecho.getTime() : NaN,
          estado,
          medico: rep?.radiologist || '',
        };
      })
      .filter(f => f.uid && f.modalidades.length);
  }, [estudios, informes, ahora]);

  const modalidades = useMemo(() => [...new Set(filas.flatMap(f => f.modalidades))].sort(), [filas]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return filas
      .filter(f => filtro === 'todos' || f.estado === filtro)
      .filter(f => !modalidad || f.modalidades.includes(modalidad))
      .filter(f => !q || `${f.paciente} ${f.documento} ${f.estudio}`.toLowerCase().includes(q))
      .sort((a, b) =>
        // Por informar: el que más espera primero; firmados: el más reciente primero
        filtro === 'firmado' ? (b.hecho?.getTime() || 0) - (a.hecho?.getTime() || 0) : (b.espera || 0) - (a.espera || 0)
      );
  }, [filas, filtro, modalidad, busqueda]);

  const resumen = useMemo(() => {
    const pend = filas.filter(f => f.estado === 'pendiente');
    const firm = filas.filter(f => f.estado === 'firmado' && Number.isFinite(f.espera));
    return {
      pendientes: pend.length,
      borradores: filas.filter(f => f.estado === 'borrador').length,
      firmados: filas.filter(f => f.estado === 'firmado').length,
      masAntiguo: pend.reduce((m, f) => Math.max(m, f.espera || 0), 0),
      promedio: firm.length ? firm.reduce((s, f) => s + f.espera, 0) / firm.length : NaN,
    };
  }, [filas]);

  const Tarjeta = ({ icono, titulo, valor: v, nota, color }: any) => (
    <div className="bg-plom-main border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${color}`}>{icono}</div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">{titulo}</div>
        <div className="text-xl font-bold text-white leading-tight">{v}</div>
        {nota && <div className="text-[11px] text-gray-500">{nota}</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Lista de lectura</h2>
          <p className="text-sm text-gray-400 mt-0.5">Estudios del PACS por informar, en borrador y firmados, con su tiempo de espera</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
            {RANGOS.map(r => (
              <button
                key={r.id}
                onClick={() => setDias(r.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${dias === r.id ? 'bg-primary-main text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={cargar}
            disabled={cargando}
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            title="Volver a consultar el PACS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tarjeta icono={<FileText className="w-5 h-5 text-sky-300" />} color="bg-sky-500/10 border-sky-500/30" titulo="Por informar" valor={resumen.pendientes} nota={resumen.pendientes ? `El más antiguo: ${duracion(resumen.masAntiguo)}` : 'Al día'} />
        <Tarjeta icono={<Clock className="w-5 h-5 text-amber-300" />} color="bg-amber-500/10 border-amber-500/30" titulo="En borrador" valor={resumen.borradores} nota="Falta firmar" />
        <Tarjeta icono={<CheckCircle2 className="w-5 h-5 text-emerald-300" />} color="bg-emerald-500/10 border-emerald-500/30" titulo="Firmados" valor={resumen.firmados} nota={RANGOS.find(r => r.id === dias)?.label} />
        <Tarjeta icono={<Timer className="w-5 h-5 text-primary-light" />} color="bg-primary-main/10 border-primary-main/30" titulo="Tiempo de informe" valor={duracion(resumen.promedio)} nota="Promedio: del estudio a la firma" />
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex gap-1 border-b border-white/10">
          {FILTROS.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-4 py-2 rounded-t-lg text-xs font-bold border-b-2 transition-all ${filtro === f.id ? 'text-primary-light border-primary-light bg-primary-dark/20' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select value={modalidad} onChange={e => setModalidad(e.target.value)} className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm outline-none focus:border-primary-light/70">
          <option value="">Todas las modalidades</option>
          {modalidades.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar paciente, C.I. o estudio…"
          className="flex-1 min-w-[220px] p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm outline-none focus:border-primary-light/70"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="bg-plom-main border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/40">
              <tr>
                {['Estado', 'Paciente', 'Estudio', 'Realizado', filtro === 'firmado' ? 'Tiempo de informe' : 'Espera', 'Radiólogo', ''].map(h => (
                  <th key={h} className="p-3 text-xs font-bold text-gray-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando && !filas.length ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Consultando el PACS…
                  </td>
                </tr>
              ) : visibles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    {filtro === 'pendiente' ? '✓ No hay estudios por informar en este período.' : 'No hay estudios que coincidan.'}
                  </td>
                </tr>
              ) : (
                visibles.map(f => (
                  <tr key={f.uid} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${CHIP[f.estado]}`}>{TEXTO_ESTADO[f.estado]}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{f.paciente}</div>
                      <div className="text-xs text-gray-500">{f.documento}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-gray-200">{f.estudio}</div>
                      <div className="text-xs text-gray-500">
                        {f.modalidades.join(' / ')} · {f.imagenes} imág.{f.solicitante ? ` · Remite ${f.solicitante}` : ''}
                      </div>
                    </td>
                    <td className="p-3 text-gray-300">
                      {f.hecho ? f.hecho.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className={`p-3 font-bold ${f.estado === 'firmado' ? 'text-gray-300' : colorEspera(f.espera)}`}>{duracion(f.espera)}</td>
                    <td className="p-3 text-gray-400">{f.medico || '—'}</td>
                    <td className="p-3 text-right">
                      <a
                        href={urlEstudio(f.uid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-main/20 border border-primary-main/40 text-primary-light text-xs font-bold hover:bg-primary-main/30"
                        title="Abrir el estudio en el MED Viewer para informarlo"
                      >
                        {f.estado === 'firmado' ? 'Ver' : 'Informar'} <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-white/10 text-xs text-gray-500 flex justify-between">
          <span>
            {visibles.length} de {filas.length} estudios · se actualiza cada 2 minutos
          </span>
          <span>Espera: verde menos de 4 h · ámbar hasta 24 h · rojo más de 24 h</span>
        </div>
      </div>
    </div>
  );
}

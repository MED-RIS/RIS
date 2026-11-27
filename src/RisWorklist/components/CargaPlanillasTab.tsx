import React, { useEffect, useRef, useState } from 'react';
import { FileSpreadsheet, Upload, X, CheckCircle2, AlertTriangle, Loader2, History, Undo2, Info } from 'lucide-react';
import { api } from '../../Users/user';
import { getAuthHeaders } from '../../utils/token';

// Carga de las planillas Excel del laboratorio (hoja DAT) desde el RIS.
// 1) Se suben las planillas  2) el sistema simula y muestra qué es nuevo y qué ya estaba
// 3) se confirma la carga (informes FIRMADOS + pacientes nuevos + preprogramación) con un lote
// 4) cada carga queda en el historial y se puede deshacer completa.

type Trabajo = {
  id: string;
  estado: 'leyendo' | 'simulado' | 'cargando' | 'cargado' | 'error';
  progreso?: string;
  porPlanilla: { archivo: string; hoja: string; filas: number; columnasConCampo: number; columnasSinCampo: number }[];
  simulacion?: any;
  carga?: any;
  error?: string;
};

const base = `${api}/api/ris/importacion-lab`;
const auth = () => {
  const h: any = getAuthHeaders();
  delete h['Content-Type'];
  return h;
};
const pedir = async (ruta: string, init: RequestInit = {}) => {
  const r = await fetch(`${base}${ruta}`, { ...init, headers: { ...(getAuthHeaders() as any), ...(init.headers || {}) } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `Error ${r.status}`);
  return d;
};
const ddmmaaaa = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}/.test(s) ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : '—');
const n = (v: any) => Number(v || 0).toLocaleString('es-BO');
const tamano = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export default function CargaPlanillasTab() {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [trabajo, setTrabajo] = useState<Trabajo | null>(null);
  const [error, setError] = useState('');
  const [cargas, setCargas] = useState<any[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const sondeo = useRef<any>(null);

  const cargarHistorial = async () => {
    try {
      setCargas(await pedir('/cargas'));
    } catch (e: any) {
      setError(e.message);
    }
  };
  useEffect(() => {
    cargarHistorial();
    return () => clearInterval(sondeo.current);
  }, []);

  const seguir = (id: string) => {
    clearInterval(sondeo.current);
    sondeo.current = setInterval(async () => {
      try {
        const t: Trabajo = await pedir(`/trabajos/${id}`);
        setTrabajo(t);
        if (!['leyendo', 'cargando'].includes(t.estado)) {
          clearInterval(sondeo.current);
          if (t.estado === 'cargado') cargarHistorial();
        }
      } catch (e: any) {
        clearInterval(sondeo.current);
        setError(e.message);
      }
    }, 2000);
  };

  const agregar = (lista: FileList | null) => {
    if (!lista) return;
    const nuevos = Array.from(lista).filter((f) => /\.(xlsx|xlsm)$/i.test(f.name) && !f.name.startsWith('~$'));
    setArchivos((a) => [...a, ...nuevos.filter((f) => !a.some((x) => x.name === f.name && x.size === f.size))]);
  };

  const revisar = async () => {
    setError('');
    setTrabajo(null);
    const fd = new FormData();
    archivos.forEach((f) => fd.append('planillas', f, f.name));
    try {
      const r = await fetch(`${base}/planillas`, { method: 'POST', headers: auth(), body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || `Error ${r.status}`);
      setTrabajo({ id: d.trabajo, estado: 'leyendo', progreso: 'Subiendo…', porPlanilla: [] });
      seguir(d.trabajo);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const confirmarCarga = async () => {
    if (!trabajo?.simulacion) return;
    const s = trabajo.simulacion;
    if (!confirm(`Se cargarán ${n(s.informes)} informes firmados, ${n(s.pacientesNuevos)} pacientes nuevos y ${n(s.preprogramaciones)} preprogramaciones.\n\nLa carga se puede deshacer después desde el historial. ¿Continuar?`)) return;
    try {
      setTrabajo(await pedir(`/trabajos/${trabajo.id}/cargar`, { method: 'POST' }));
      seguir(trabajo.id);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deshacer = async (c: any) => {
    if (!confirm(`¿Deshacer la carga del ${new Date(c.createdAt).toLocaleString('es-BO')}?\n\nSe quitarán sus ${n(c.resumen?.informes)} informes, los pacientes que se crearon con ella y su preprogramación. Lo cargado a mano no se toca.`)) return;
    try {
      const r = await pedir(`/cargas/${encodeURIComponent(c.lote)}/deshacer`, { method: 'POST' });
      alert(`Listo: se quitaron ${n(r.informes)} informes, ${n(r.pacientes)} pacientes y ${n(r.preprogramaciones)} preprogramaciones.`);
      cargarHistorial();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const reiniciar = () => {
    clearInterval(sondeo.current);
    setTrabajo(null);
    setArchivos([]);
    setError('');
  };

  const ocupado = trabajo && ['leyendo', 'cargando'].includes(trabajo.estado);
  const s = trabajo?.carga || trabajo?.simulacion;
  const yaEstaban = s
    ? Object.entries(s.omitidos || {})
        .filter(([k]) => /^Ya /.test(k))
        .reduce((t, [, v]) => t + Number(v), 0)
    : 0;
  const descartados = s
    ? Object.entries(s.omitidos || {})
        .filter(([k]) => !/^Ya /.test(k))
        .reduce((t, [, v]) => t + Number(v), 0)
    : 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Cargar planillas del laboratorio</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Suba las planillas Excel (hoja DAT). Primero se revisan sin cambiar nada; después usted confirma la carga.
        </p>
      </div>

      {/* Paso 1: elegir planillas */}
      {!trabajo && (
        <div className="bg-plom-main border border-white/10 rounded-2xl p-5 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => { e.preventDefault(); setArrastrando(false); agregar(e.dataTransfer.files); }}
            onClick={() => entrada.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${arrastrando ? 'border-primary-light bg-primary-main/20' : 'border-white/15 hover:border-white/30 bg-black/20'}`}
          >
            <Upload className="w-8 h-8 mx-auto text-primary-light mb-2" />
            <div className="text-white font-semibold">Arrastre aquí las planillas o haga clic para elegirlas</div>
            <div className="text-xs text-gray-400 mt-1">Archivos .xlsm o .xlsx · puede subir varias a la vez (rutina y emergencias, varios meses)</div>
            <input ref={entrada} type="file" multiple accept=".xlsx,.xlsm" className="hidden" onChange={(e) => { agregar(e.target.files); e.target.value = ''; }} />
          </div>
          {archivos.length > 0 && (
            <div className="space-y-1.5">
              {archivos.map((f) => (
                <div key={f.name + f.size} className="flex items-center gap-3 rounded-lg bg-black/30 border border-white/5 px-3 py-2 text-sm">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-gray-200 truncate flex-1">{f.name}</span>
                  <span className="text-xs text-gray-500">{tamano(f.size)}</span>
                  <button onClick={() => setArchivos((a) => a.filter((x) => x !== f))} className="text-gray-500 hover:text-red-300" title="Quitar">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <button onClick={revisar} className="px-5 py-2.5 rounded-lg bg-primary-main hover:bg-primary-dark text-white text-sm font-bold shadow-lg">
                  Revisar {archivos.length === 1 ? 'la planilla' : `las ${archivos.length} planillas`}
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-2 text-xs text-gray-400">
            <Info className="w-4 h-4 shrink-0 text-gray-500" />
            <span>
              Puede volver a subir planillas actualizadas: lo que ya está cargado se reconoce y no se duplica (aunque la planilla tenga otro nombre o las filas estén corridas).
              Si el laboratorio corrigió valores de registros ya cargados, esas correcciones no se aplican solas.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-600/15 px-4 py-3 text-sm text-red-200">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
          <button onClick={reiniciar} className="ml-auto underline text-red-100">Empezar de nuevo</button>
        </div>
      )}

      {/* Progreso */}
      {ocupado && (
        <div className="bg-plom-main border border-white/10 rounded-2xl p-6 flex items-center gap-3 text-gray-200">
          <Loader2 className="w-5 h-5 animate-spin text-primary-light" />
          <div>
            <div className="font-semibold">{trabajo?.estado === 'cargando' ? 'Cargando…' : 'Revisando las planillas…'}</div>
            <div className="text-xs text-gray-400">{trabajo?.progreso} Las planillas grandes tardan cerca de medio minuto cada una; puede esperar en esta pantalla.</div>
          </div>
        </div>
      )}

      {trabajo?.estado === 'error' && !error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-600/15 px-4 py-3 text-sm text-red-200">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {trabajo.error}
          <button onClick={reiniciar} className="ml-auto underline text-red-100">Empezar de nuevo</button>
        </div>
      )}

      {/* Resultado de la revisión o de la carga */}
      {s && ['simulado', 'cargado'].includes(trabajo!.estado) && (
        <div className="space-y-4">
          {trabajo!.estado === 'cargado' ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-600/15 px-5 py-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
              <div>
                <div className="text-white font-bold">Carga terminada</div>
                <div className="text-xs text-emerald-100/80">Quedó registrada en el historial (lote {trabajo!.carga.lote}); desde ahí se puede deshacer.</div>
              </div>
              <button onClick={reiniciar} className="ml-auto px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white">Cargar otras planillas</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-sky-500/30 bg-sky-600/10 px-5 py-4">
              <Info className="w-5 h-5 text-sky-300" />
              <div className="text-sm text-sky-100">Revisión lista. <b>Todavía no se cargó nada.</b> Revise los números y, si están bien, confirme la carga.</div>
              <div className="ml-auto flex gap-2">
                <button onClick={reiniciar} className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-gray-200">Cancelar</button>
                <button
                  onClick={confirmarCarga}
                  disabled={!s.informes}
                  className="px-5 py-2 rounded-lg bg-primary-main hover:bg-primary-dark text-white text-sm font-bold shadow-lg disabled:opacity-40"
                  title={!s.informes ? 'No hay informes nuevos para cargar' : ''}
                >
                  Cargar al sistema
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <Tarjeta titulo="Filas leídas" valor={s.filas} />
            <Tarjeta titulo={trabajo!.estado === 'cargado' ? 'Informes cargados' : 'Informes nuevos'} valor={s.informes} nota={s.informes ? `del ${ddmmaaaa(s.desde)} al ${ddmmaaaa(s.hasta)}` : 'nada nuevo'} resaltar />
            <Tarjeta titulo="Pacientes nuevos" valor={s.pacientesNuevos} />
            <Tarjeta titulo="Preprogramaciones" valor={s.preprogramaciones} nota={`${n(s.emergencias)} emergencias`} />
            <Tarjeta titulo="Ya estaban cargados" valor={yaEstaban} nota="no se duplican" />
            <Tarjeta titulo="Descartados" valor={descartados} nota="sin fecha, nombre o resultados" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Bloque titulo="Planillas leídas">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] uppercase tracking-wider text-gray-500"><th className="py-1.5">Planilla</th><th className="py-1.5 text-right">Filas</th><th className="py-1.5 text-right">Columnas reconocidas</th></tr></thead>
                <tbody>
                  {trabajo!.porPlanilla.map((p) => (
                    <tr key={p.archivo} className="border-t border-white/5">
                      <td className="py-1.5 text-gray-200">{p.archivo}</td>
                      <td className="py-1.5 text-right text-white font-semibold">{n(p.filas)}</td>
                      <td className="py-1.5 text-right text-gray-300">{p.columnasConCampo}{p.columnasSinCampo ? <span className="text-gray-500"> (+{p.columnasSinCampo} aparte)</span> : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Bloque>
            <Bloque titulo="Qué no se carga y por qué">
              <div className="space-y-1.5 text-sm">
                {Object.entries(s.omitidos || {}).filter(([, v]) => Number(v) > 0).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3"><span className="text-gray-300">{k}</span><b className="text-white">{n(v)}</b></div>
                ))}
                {!Object.values(s.omitidos || {}).some((v) => Number(v) > 0) && <p className="text-gray-500">Se carga todo.</p>}
              </div>
            </Bloque>
            <Bloque titulo="Informes por área">
              <div className="space-y-1.5 text-sm">
                {Object.entries(s.porEstudio || {}).sort((a: any, b: any) => b[1] - a[1]).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3"><span className="text-gray-300">{k}</span><b className="text-white">{n(v)}</b></div>
                ))}
                {!Object.keys(s.porEstudio || {}).length && <p className="text-gray-500">Sin informes nuevos.</p>}
              </div>
            </Bloque>
            <Bloque titulo="Para revisar después">
              <div className="space-y-1.5 text-sm">
                <Aviso v={s.fechaEstimada} texto="sin fecha en la planilla: se usó la de la fila anterior" />
                <Aviso v={s.fechaCorregida} texto="con el año mal escrito: se usó la fecha de solicitud o de muestra" />
                <Aviso v={s.sinMatricula} texto="sin matrícula: el paciente se reconoce por nombre" />
                <Aviso v={s.conColumnasAparte} texto="con columnas que el RIS no tiene: se guardan aparte en el informe" />
                {!s.fechaEstimada && !s.fechaCorregida && !s.sinMatricula && !s.conColumnasAparte && <p className="text-gray-500">Nada para revisar.</p>}
              </div>
            </Bloque>
          </div>
        </div>
      )}

      {/* Historial */}
      <Bloque titulo="Historial de cargas" icono={<History className="w-4 h-4" />}>
        {cargas.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="py-1.5 pr-3">Fecha</th><th className="py-1.5 pr-3">Usuario</th><th className="py-1.5 pr-3">Planillas</th>
                  <th className="py-1.5 pr-3 text-right">Informes</th><th className="py-1.5 pr-3 text-right">Preprog.</th><th className="py-1.5 pr-3">Periodo</th><th className="py-1.5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargas.map((c) => (
                  <tr key={c.lote} className="border-t border-white/5 align-top">
                    <td className="py-2 pr-3 text-gray-200 whitespace-nowrap">{new Date(c.createdAt).toLocaleString('es-BO')}</td>
                    <td className="py-2 pr-3 text-gray-300">{c.usuario || '—'}</td>
                    <td className="py-2 pr-3 text-gray-400 text-xs">{(c.archivos || []).map((a: any) => a.nombre).join(', ')}</td>
                    <td className="py-2 pr-3 text-right text-white font-semibold">{n(c.resumen?.informes)}</td>
                    <td className="py-2 pr-3 text-right text-gray-200">{n(c.resumen?.preprogramaciones)}</td>
                    <td className="py-2 pr-3 text-gray-400 whitespace-nowrap">{ddmmaaaa(c.resumen?.desde)} – {ddmmaaaa(c.resumen?.hasta)}</td>
                    <td className="py-2 text-right whitespace-nowrap">
                      {c.estado === 'DESHECHA' ? (
                        <span className="text-xs text-gray-500" title={`Deshecha por ${c.deshechaPor || '—'}`}>Deshecha {c.deshechaEl ? new Date(c.deshechaEl).toLocaleDateString('es-BO') : ''}</span>
                      ) : (
                        <button onClick={() => deshacer(c)} className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-300 hover:text-red-300 inline-flex items-center gap-1">
                          <Undo2 className="w-3.5 h-3.5" /> Deshacer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Todavía no hay cargas hechas desde esta pantalla.</p>
        )}
      </Bloque>
    </div>
  );
}

function Tarjeta({ titulo, valor, nota, resaltar }: { titulo: string; valor: any; nota?: string; resaltar?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3.5 ${resaltar ? 'border-primary-light/50 bg-primary-main/20' : 'border-white/10 bg-plom-main'}`}>
      <div className="text-2xl font-bold text-white leading-none">{n(valor)}</div>
      <div className="text-[11px] font-semibold text-gray-400 mt-1">{titulo}</div>
      {nota && <div className="text-[10px] text-gray-500 mt-0.5">{nota}</div>}
    </div>
  );
}

function Bloque({ titulo, icono, children }: { titulo: string; icono?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-plom-main border border-white/10 rounded-2xl p-4">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">{icono}{titulo}</h3>
      {children}
    </div>
  );
}

function Aviso({ v, texto }: { v: number; texto: string }) {
  if (!v) return null;
  return (
    <div className="flex gap-2 text-gray-300">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <span><b className="text-white">{n(v)}</b> {texto}</span>
    </div>
  );
}

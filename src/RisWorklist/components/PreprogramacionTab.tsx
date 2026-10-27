import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@ohif/ui-next';
import { ChevronLeft, ChevronRight, Plus, Printer, UserCheck, UserX, Pencil, Trash2, X, ScanLine } from 'lucide-react';
import { fetchPreprogramacion, createPreprogramacion, updatePreprogramacion, deletePreprogramacion } from '../risService';
import QrBoletaScanner from './QrBoletaScanner';
import { parseBoletaQr } from '../../utils/parseBoletaQr';
import { imprimirComprobante, leerQrComprobante } from '../laboratorio/comprobante';

// Preprogramación del laboratorio (CNS). El paciente llega a caja con su boleta y se
// lo anota para un DÍA (sin hora) con lo mínimo: nombre y apellido, matrícula, celular
// y los exámenes de su hoja "Registro diario de programación de pacientes" (CNS - CVT
// REGPRG-001), más la firma de entrega. El día del examen, si vino, se lo registra
// formalmente; si no, "No vino".

type Examen = { id: string; label: string; corto: string };
const GRUPOS: { grupo: string | null; items: Examen[] }[] = [
  {
    grupo: 'HEMATO',
    items: [
      { id: 'HTO', label: 'HTO', corto: 'HTO' },
      { id: 'HB', label: 'Hb', corto: 'Hb' },
      { id: 'HEMOGRAMA', label: 'Hemograma', corto: 'Hemogram' },
    ],
  },
  {
    grupo: null,
    items: [
      { id: 'QMC_SANGUINEA', label: 'Química sanguínea', corto: 'QMC sanguínea' },
      { id: 'SEROLOGIA', label: 'Serología', corto: 'Serología' },
      { id: 'EGO', label: 'E.G.O.', corto: 'E.G.O.' },
      { id: 'COPROLOGIA', label: 'Coprología', corto: 'Coprología' },
      { id: 'H_PYLORI_SANGRE_OCULTA', label: 'H. Pylori / Sangre oculta', corto: 'H. Pylori / S. oculta' },
      { id: 'HORMONAS', label: 'Hormonas', corto: 'Hormonas' },
      { id: 'PBAS_TRANSFERENCIA', label: 'Pbas. para transferencia', corto: 'Pbas. transferencia' },
    ],
  },
  {
    grupo: 'PBA RAP COVID-19',
    items: [
      { id: 'COVID_ANTIGENO', label: 'Antígeno', corto: 'Antígeno' },
      { id: 'COVID_ANTICUERPOS', label: 'Anticuerpos', corto: 'Anticuerpos' },
      { id: 'COVID_QUIMIO', label: 'Quimioluminiscencia', corto: 'Quimiolumin.' },
    ],
  },
];
const TODOS = GRUPOS.flatMap(g => g.items);

const ESTADOS: Record<string, { texto: string; clase: string }> = {
  PROGRAMADO: { texto: 'Programado', clase: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  ASISTIO: { texto: 'Llegó', clase: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  NO_VINO: { texto: 'No vino', clase: 'bg-red-500/15 text-red-300 border-red-500/30' },
};

// Fechas como "AAAA-MM-DD" en hora local (la programación es por día, sin hora)
const aDia = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const deDia = (s: string) => {
  const [a, m, d] = s.split('-').map(Number);
  return new Date(a, m - 1, d);
};
const lunesDe = (d: Date) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
// Registros cargados con la primera versión (paterno, materno y nombres por separado)
const nombreDe = (f: any) => f.nombreCompleto || [f.paterno, f.materno, f.nombres].filter(Boolean).join(' ');
const ddmmaaaa = (s?: string) => (s ? s.split('-').reverse().join('/') : '');
const ddmm = (v?: string) => (v ? new Date(v).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' }) : '');

const VACIO = { fechaExamen: '', nombreCompleto: '', matricula: '', celular: '', examenes: [] as string[], emergencia: false };

// Para comparar nombres sin que molesten espacios de más ni minúsculas
const normalizar = (s: any) => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase();

type Filtro = 'TODOS' | 'PROGRAMADO' | 'ASISTIO' | 'NO_VINO' | 'EMERGENCIA';
const FILTROS: { id: Filtro; texto: string }[] = [
  { id: 'TODOS', texto: 'Todos' },
  { id: 'PROGRAMADO', texto: 'Por llegar' },
  { id: 'ASISTIO', texto: 'Llegaron' },
  { id: 'NO_VINO', texto: 'No vinieron' },
  { id: 'EMERGENCIA', texto: 'Emergencias' },
];

const campo =
  'w-full p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm outline-none focus:border-primary-light/70 placeholder:text-gray-600';
const rotulo = 'block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1';
const th = 'px-2 py-2 text-[10px] font-bold text-gray-400 uppercase border-b border-l border-white/10 first:border-l-0';
const thVertical = `${th} align-bottom h-28 w-9`;

export default function PreprogramacionTab({ onRegistrar }: { onRegistrar?: (fila: any) => void }) {
  const hoy = aDia(new Date());
  const [dia, setDia] = useState(hoy);
  const [semana, setSemana] = useState(() => lunesDe(new Date()));
  const [filas, setFilas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState<any>(null); // null = cerrado; { ...datos, _id? }
  const [guardando, setGuardando] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  // QR de la boleta CNS: llena nombre, matrícula y celular
  const [qrAbierto, setQrAbierto] = useState(false);
  const [qrLeido, setQrLeido] = useState<{ texto: string; reconocido: boolean; sinDatos?: boolean } | null>(null);
  // QR del comprobante que se le entregó al paciente: al volver se lo encuentra al instante
  const [scanComprobante, setScanComprobante] = useState(false);

  const dias = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(semana);
        d.setDate(d.getDate() + i);
        return aDia(d);
      }),
    [semana]
  );

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setFilas(await fetchPreprogramacion(dias[0], dias[dias.length - 1]));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCargando(false);
    }
  }, [dias]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const delDia = useMemo(
    () => filas.filter(f => f.fechaExamen === dia).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))),
    [filas, dia]
  );
  const cuenta = (d: string) => filas.filter(f => f.fechaExamen === d && f.estado !== 'NO_VINO').length;
  const totales = useMemo(() => {
    const t: Record<string, number> = {};
    delDia.filter(f => f.estado !== 'NO_VINO').forEach(f => f.examenes.forEach((e: string) => (t[e] = (t[e] || 0) + 1)));
    return TODOS.filter(e => t[e.id]).map(e => ({ ...e, n: t[e.id] }));
  }, [delDia]);
  const resumen = {
    programados: delDia.filter(f => f.estado === 'PROGRAMADO').length,
    llegaron: delDia.filter(f => f.estado === 'ASISTIO').length,
    noVinieron: delDia.filter(f => f.estado === 'NO_VINO').length,
    entregados: delDia.filter(f => f.entregado).length,
    emergencias: delDia.filter(f => f.emergencia).length,
  };
  // La planilla filtrada (para atender según llegada); el N.º sigue siendo el del día
  const visibles = delDia.filter(f =>
    filtro === 'TODOS' ? true : filtro === 'EMERGENCIA' ? f.emergencia : f.estado === filtro
  );
  const cuantos = (id: Filtro) =>
    id === 'TODOS' ? delDia.length : id === 'EMERGENCIA' ? resumen.emergencias : delDia.filter(f => f.estado === id).length;

  const moverSemana = (n: number) => {
    const s = new Date(semana);
    s.setDate(s.getDate() + 7 * n);
    setSemana(s);
    setDia(aDia(s));
  };
  const irAHoy = () => {
    setSemana(lunesDe(new Date()));
    setDia(hoy);
  };

  const nuevo = () => {
    setQrLeido(null);
    setForm({ ...VACIO, fechaExamen: dia });
  };

  // Lo que se pudo leer del QR se pone en el formulario; si el formato no se reconoce,
  // se muestra el texto para copiarlo a mano (no se adivina)
  const usarQr = useCallback((raw: string) => {
    setQrAbierto(false);
    const { fields, recognized, sinDatos } = parseBoletaQr(raw);
    setQrLeido({ texto: raw, reconocido: recognized, sinDatos });
    const nombre =
      fields.nombreCompleto ||
      [fields.firstName, fields.apellidoPaterno ?? fields.lastName, fields.apellidoMaterno].filter(Boolean).join(' ').toUpperCase();
    setForm((p: any) => ({
      ...p,
      ...(nombre ? { nombreCompleto: nombre } : {}),
      ...(fields.numeroAsegurado ? { matricula: String(fields.numeroAsegurado).toUpperCase() } : {}),
      ...(fields.phone ? { celular: fields.phone } : {}),
    }));
  }, []);
  const editar = (f: any) => setForm({ ...VACIO, ...f, nombreCompleto: nombreDe(f), celular: f.celular || '' });
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const alternarEnForm = (id: string) =>
    setForm((p: any) => ({ ...p, examenes: p.examenes.includes(id) ? p.examenes.filter((e: string) => e !== id) : [...p.examenes, id] }));

  const actualizarFila = async (f: any, cambios: any) => {
    const anterior = filas;
    setFilas(prev => prev.map(x => (x._id === f._id ? { ...x, ...cambios } : x)));
    try {
      const guardada = await updatePreprogramacion(f._id, cambios);
      setFilas(prev => prev.map(x => (x._id === f._id ? guardada : x)));
      return true;
    } catch (err: any) {
      setFilas(anterior);
      toast.error(err.message);
      return false;
    }
  };

  // Marcar o desmarcar un examen directamente en la planilla, como en el Excel
  const alternarEnPlanilla = (f: any, id: string) => {
    const examenes = f.examenes.includes(id) ? f.examenes.filter((e: string) => e !== id) : [...f.examenes, id];
    if (!examenes.length) return toast.warning('Debe quedar al menos un examen');
    actualizarFila(f, { examenes });
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombreCompleto.trim()) return toast.warning('Falta NOMBRE Y APELLIDO');
    if (!form.matricula.trim()) return toast.warning('Falta MATRÍCULA');
    if (!form.celular.trim()) return toast.warning('Falta CELULAR');
    if (!form.examenes.length) return toast.warning('Marque al menos un examen');
    // Validador de duplicados: el mismo paciente (matrícula y nombre) el mismo día.
    // El servidor también lo controla; esto avisa antes con lo que ya está en pantalla.
    const repetida = filas.find(
      x =>
        x._id !== form._id &&
        x.fechaExamen === form.fechaExamen &&
        normalizar(x.matricula) === normalizar(form.matricula) &&
        normalizar(nombreDe(x)) === normalizar(form.nombreCompleto)
    );
    if (repetida) {
      return toast.error(`${nombreDe(repetida)} ya está programado para el ${ddmmaaaa(form.fechaExamen)}${repetida.creadoPor ? ` (lo anotó ${repetida.creadoPor})` : ''}`);
    }
    setGuardando(true);
    try {
      const { _id, fechaExamen, nombreCompleto, matricula, celular, examenes, emergencia } = form;
      const datos = { fechaExamen, nombreCompleto, matricula, celular, examenes, emergencia: !!emergencia };
      const guardada = _id ? await updatePreprogramacion(_id, datos) : await createPreprogramacion(datos);
      toast.success(_id ? 'Preprogramación actualizada' : `Programado para el ${ddmmaaaa(fechaExamen)}`);
      if (fechaExamen !== dia) setDia(fechaExamen);
      const lunes = lunesDe(deDia(fechaExamen));
      if (lunes.getTime() !== semana.getTime()) setSemana(lunes);
      setForm(null);
      cargar();
      // EMERGENCIA nueva: vino hoy con su boleta, se pasa directo a su registro
      if (!_id && emergencia && guardada?._id) cambiarEstado(guardada, 'ASISTIO');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (f: any, estado: string) => {
    if ((await actualizarFila(f, { estado })) && estado === 'ASISTIO') {
      const nombresExamenes = TODOS.filter(e => f.examenes.includes(e.id)).map(e => e.label);
      onRegistrar?.({ ...f, nombreCompleto: nombreDe(f), nombresExamenes });
    }
  };

  // Comprobante para el paciente: su día, sus exámenes, indicaciones y nuestro QR
  const comprobante = (f: any) => {
    const examenes = TODOS.filter(e => f.examenes.includes(e.id)).map(e => ({ id: e.id, label: e.label }));
    if (!imprimirComprobante(f, nombreDe(f), examenes)) toast.warning('Permita ventanas emergentes para imprimir');
  };

  // El paciente volvió con su comprobante: se lo busca por el QR y se lo marca como "Llegó"
  const usarComprobante = async (raw: string) => {
    setScanComprobante(false);
    const datos = leerQrComprobante(raw);
    if (!datos) return toast.error('Ese QR no es un comprobante de programación del sistema');
    try {
      const lista = await fetchPreprogramacion(datos.fecha, datos.fecha);
      const f = lista.find((x: any) => x._id === datos.id);
      if (!f) return toast.error('No se encontró esa programación (pudo haber sido eliminada)');
      setDia(datos.fecha);
      const lunes = lunesDe(deDia(datos.fecha));
      if (lunes.getTime() !== semana.getTime()) setSemana(lunes);
      if (datos.fecha !== hoy && !window.confirm(`${nombreDe(f)} estaba programado para el ${ddmmaaaa(datos.fecha)}. ¿Registrar que llegó hoy?`)) return;
      toast.success(`${nombreDe(f)}: llegó`);
      cambiarEstado(f, 'ASISTIO');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const alternarEntrega = (f: any) => {
    if (f.entregado && !window.confirm('¿Quitar la entrega registrada?')) return;
    actualizarFila(f, { entregado: !f.entregado });
  };

  const eliminar = async (f: any) => {
    if (!window.confirm(`¿Eliminar la preprogramación de ${nombreDe(f)}?`)) return;
    try {
      await deletePreprogramacion(f._id);
      setFilas(prev => prev.filter(x => x._id !== f._id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Hoja impresa igual a la planilla de papel (CNS - CVT REGPRG-001)
  const imprimir = () => {
    const v = window.open('', '_blank');
    if (!v) return toast.warning('Permita ventanas emergentes para imprimir');
    const esc = (s: any) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
    const cab1 = GRUPOS.map(g =>
      g.grupo
        ? `<th colspan="${g.items.length}">${esc(g.grupo)}</th>`
        : g.items.map(e => `<th rowspan="2" class="v"><div>${esc(e.label)}</div></th>`).join('')
    ).join('');
    const cab2 = GRUPOS.filter(g => g.grupo)
      .flatMap(g => g.items)
      .map(e => `<th class="v"><div>${esc(e.corto)}</div></th>`)
      .join('');
    const cuerpo = delDia
      .filter(f => f.estado !== 'NO_VINO')
      .map(
        (f, i) => `<tr><td>${i + 1}</td><td class="n">${esc(nombreDe(f))}${f.emergencia ? ' <b>(EMERGENCIA)</b>' : ''}</td><td>${esc(f.matricula)}</td><td>${esc(f.celular)}</td>
          ${TODOS.map(e => `<td class="c">${f.examenes.includes(e.id) ? '✓' : ''}</td>`).join('')}
          <td>${f.entregado ? `Entregado ${esc(ddmm(f.entregadoEl))}` : ''}</td></tr>`
      )
      .join('');
    v.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Programación ${ddmmaaaa(dia)}</title>
<style>@page{size:A4 landscape;margin:10mm}body{font-family:Arial,sans-serif;font-size:9pt;color:#111}
h1{font-size:12pt;margin:0;text-align:center}.sub{display:flex;justify-content:space-between;margin:4px 0 8px;font-size:9pt}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #444;padding:3px 4px}th{background:#eee;font-size:7.5pt}
th.v{height:95px;width:20px;padding:0}th.v div{writing-mode:vertical-rl;transform:rotate(180deg);margin:auto;white-space:nowrap}
td{height:20px}td.c{text-align:center;font-weight:bold}td.n{white-space:nowrap}</style></head><body>
<h1>REGISTRO DIARIO DE PROGRAMACIÓN DE PACIENTES</h1>
<div class="sub"><span>LABORATORIO</span><span>FECHA: <b>${ddmmaaaa(dia)}</b></span><span>CNS – CVT REGPRG-001</span></div>
<table><thead>
<tr><th rowspan="2">N.º</th><th rowspan="2">NOMBRE Y APELLIDO</th><th rowspan="2">MATRÍCULA</th><th rowspan="2">CELULAR</th>${cab1}<th rowspan="2">FIRMA ENTREGA</th></tr>
<tr>${cab2}</tr></thead>
<tbody>${cuerpo || '<tr><td colspan="18" style="text-align:center;padding:12px">Sin pacientes programados</td></tr>'}</tbody></table>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`);
    v.document.close();
  };

  const celdaExamen = (f: any, e: Examen) => {
    const on = f.examenes.includes(e.id);
    return (
      <td key={e.id} className="border-l border-white/5 p-0 text-center">
        <button
          onClick={() => alternarEnPlanilla(f, e.id)}
          className={`w-full h-10 font-bold transition-colors ${on ? 'text-primary-light bg-primary-main/25 hover:bg-primary-main/40' : 'text-transparent hover:text-gray-500 hover:bg-white/5'}`}
          title={`${e.label}: ${on ? 'quitar' : 'agregar'}`}
        >
          ✓
        </button>
      </td>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Preprogramación del laboratorio</h2>
          <p className="text-sm text-gray-400 mt-0.5">Registro diario de programación de pacientes · el registro formal se hace el día que viene</p>
        </div>
        <div className="flex gap-2">
          <button onClick={imprimir} className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Imprimir planilla del día
          </button>
          <button
            onClick={() => setScanComprobante(true)}
            className="px-3 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-600/30 text-xs font-bold flex items-center gap-1.5"
            title="El paciente volvió: escanear el QR de su comprobante para marcar que llegó"
          >
            <ScanLine className="w-3.5 h-3.5" /> Escanear comprobante
          </button>
          <button onClick={nuevo} className="px-4 py-2 rounded-lg bg-primary-main hover:bg-primary-dark text-white text-sm font-bold flex items-center gap-1.5 shadow-lg">
            <Plus className="w-4 h-4" /> Preprogramar paciente
          </button>
        </div>
      </div>

      {/* Calendario por día */}
      <div className="flex items-center gap-2 bg-plom-main border border-white/10 rounded-2xl p-3">
        <button onClick={() => moverSemana(-1)} className="p-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white" title="Semana anterior">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 grid grid-cols-6 gap-2">
          {dias.map(d => {
            const fecha = deDia(d);
            const n = cuenta(d);
            const activo = d === dia;
            return (
              <button
                key={d}
                onClick={() => setDia(d)}
                className={`relative rounded-xl py-2 px-1 border transition-all ${activo ? 'bg-primary-main border-primary-light/60 text-white shadow-lg' : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold">{fecha.toLocaleDateString('es-419', { weekday: 'short' })}</div>
                <div className="text-lg font-bold leading-tight">{fecha.getDate()}</div>
                <div className="text-[10px] uppercase">{fecha.toLocaleDateString('es-419', { month: 'short' })}</div>
                {d === hoy && <div className="absolute top-1 left-1.5 text-[9px] font-bold text-primary-light">HOY</div>}
                {n > 0 && (
                  <div className={`absolute top-1 right-1.5 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center ${activo ? 'bg-white text-primary-dark' : 'bg-primary-main text-white'}`}>
                    {n}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <button onClick={() => moverSemana(1)} className="p-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white" title="Semana siguiente">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={irAHoy} className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white text-xs font-bold">
          Hoy
        </button>
      </div>

      {/* Resumen y totales del día */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-plom-main border border-white/10 rounded-2xl p-4">
          <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
            {deDia(dia).toLocaleDateString('es-419', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <div><span className="text-2xl font-bold text-sky-300">{resumen.programados}</span> <span className="text-gray-400">programados</span></div>
            <div><span className="text-2xl font-bold text-emerald-300">{resumen.llegaron}</span> <span className="text-gray-400">llegaron</span></div>
            <div><span className="text-2xl font-bold text-red-300">{resumen.noVinieron}</span> <span className="text-gray-400">no vinieron</span></div>
            <div><span className="text-2xl font-bold text-amber-300">{resumen.entregados}</span> <span className="text-gray-400">entregados</span></div>
            {resumen.emergencias > 0 && (
              <div><span className="text-2xl font-bold text-red-400">{resumen.emergencias}</span> <span className="text-gray-400">emergencias</span></div>
            )}
          </div>
        </div>
        <div className="lg:col-span-2 bg-plom-main border border-white/10 rounded-2xl p-4">
          <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Exámenes del día (para preparar reactivos)</div>
          <div className="flex flex-wrap gap-2">
            {totales.length === 0 ? (
              <span className="text-sm text-gray-500">Sin exámenes programados</span>
            ) : (
              totales.map(t => (
                <span key={t.id} className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-sm text-gray-200">
                  {t.label} <b className="text-primary-light ml-1">{t.n}</b>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Atender según llegada: ver solo los que faltan, los que llegaron, etc. */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTROS.map(x => (
          <button
            key={x.id}
            onClick={() => setFiltro(x.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              filtro === x.id
                ? x.id === 'EMERGENCIA'
                  ? 'bg-red-600/30 border-red-500/60 text-red-200'
                  : 'bg-primary-main border-primary-light/60 text-white'
                : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {x.texto} <span className="ml-1 opacity-70">{cuantos(x.id)}</span>
          </button>
        ))}
      </div>

      {/* Planilla del día: mismas columnas que la hoja de papel */}
      <div className="bg-plom-main border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40">
              <tr>
                <th rowSpan={2} className={th}>N.º</th>
                <th rowSpan={2} className={`${th} min-w-[200px]`}>Nombre y apellido</th>
                <th rowSpan={2} className={th}>Matrícula</th>
                <th rowSpan={2} className={th}>Celular</th>
                {GRUPOS.map(g =>
                  g.grupo ? (
                    <th key={g.grupo} colSpan={g.items.length} className={`${th} text-center text-primary-light`}>
                      {g.grupo}
                    </th>
                  ) : (
                    g.items.map(e => (
                      <th key={e.id} rowSpan={2} className={thVertical}>
                        <div className="[writing-mode:vertical-rl] rotate-180 mx-auto whitespace-nowrap">{e.corto}</div>
                      </th>
                    ))
                  )
                )}
                <th rowSpan={2} className={th}>Firma entrega</th>
                <th rowSpan={2} className={th}>Estado</th>
                <th rowSpan={2} className={th}>Programó</th>
                <th rowSpan={2} className={th}></th>
              </tr>
              <tr>
                {GRUPOS.filter(g => g.grupo).flatMap(g =>
                  g.items.map(e => (
                    <th key={e.id} className={thVertical}>
                      <div className="[writing-mode:vertical-rl] rotate-180 mx-auto whitespace-nowrap">{e.corto}</div>
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {cargando && !filas.length ? (
                <tr><td colSpan={20} className="p-8 text-center text-gray-500">Cargando…</td></tr>
              ) : visibles.length === 0 ? (
                <tr><td colSpan={20} className="p-8 text-center text-gray-500">
                  {delDia.length === 0 ? 'No hay pacientes programados para este día.' : 'Ningún paciente en este filtro.'}
                </td></tr>
              ) : (
                visibles.map(f => (
                  <tr
                    key={f._id}
                    className={`border-t border-white/5 hover:bg-white/[.03] ${f.emergencia ? 'bg-red-900/25 shadow-[inset_3px_0_0_#ef4444]' : ''} ${f.estado === 'NO_VINO' ? 'opacity-40' : ''}`}
                  >
                    <td className="px-2 py-2 text-gray-400">{delDia.indexOf(f) + 1}</td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <button
                        onClick={() => cambiarEstado(f, 'ASISTIO')}
                        className="font-semibold text-white hover:text-primary-light hover:underline text-left"
                        title="El paciente vino: completar sus datos y cargar los resultados de sus exámenes"
                      >
                        {nombreDe(f)}
                      </button>
                      {f.emergencia && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold tracking-wider align-middle">EMERGENCIA</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-gray-300 font-mono text-xs whitespace-nowrap">{f.matricula}</td>
                    <td className="px-2 py-2 text-gray-300 whitespace-nowrap">{f.celular}</td>
                    {TODOS.map(e => celdaExamen(f, e))}
                    <td className="px-2 py-2 border-l border-white/5 whitespace-nowrap">
                      <button
                        onClick={() => alternarEntrega(f)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${f.entregado ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'}`}
                        title={f.entregado ? `Entregado por ${f.entregadoPor || '—'}` : 'Registrar la entrega de resultados'}
                      >
                        {f.entregado ? `✓ ${ddmm(f.entregadoEl)}` : 'Entregar'}
                      </button>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-bold border ${ESTADOS[f.estado]?.clase}`}>{ESTADOS[f.estado]?.texto}</span>
                    </td>
                    <td
                      className="px-2 py-2 text-xs text-gray-400 whitespace-nowrap max-w-[140px] truncate"
                      title={f.creadoPor ? `${f.creadoPor} · ${new Date(f.createdAt).toLocaleString('es-BO')}` : ''}
                    >
                      {f.creadoPor || '—'}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1 justify-end">
                        {f.estado !== 'ASISTIO' && (
                          <button onClick={() => cambiarEstado(f, 'ASISTIO')} className="p-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30" title="Llegó: abrir su registro formal con estos datos">
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {f.estado === 'PROGRAMADO' ? (
                          <button onClick={() => cambiarEstado(f, 'NO_VINO')} className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-red-300" title="No vino">
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button onClick={() => cambiarEstado(f, 'PROGRAMADO')} className="px-1.5 py-1 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-white text-[11px]" title="Volver a programado">
                            ↶
                          </button>
                        )}
                        <button onClick={() => comprobante(f)} className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-white" title="Imprimir el comprobante para el paciente (con QR)">
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editar(f)} className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-white" title="Editar o cambiar de día">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => eliminar(f)} className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-red-300" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-white/10 text-xs text-gray-500">
          Toque el nombre cuando el paciente llegue para completar sus datos y cargar sus resultados · Toque una casilla para marcar o quitar un examen
        </div>
      </div>

      {/* Formulario: los campos de la hoja de papel */}
      {form && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto p-4" onMouseDown={e => e.target === e.currentTarget && setForm(null)}>
          <form onSubmit={guardar} className="w-full max-w-4xl bg-plom-main border border-white/10 rounded-2xl shadow-2xl my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">{form._id ? 'Editar preprogramación' : 'Preprogramar paciente'}</h3>
                <p className="text-xs text-gray-400">Solo lo necesario para programar. Los demás datos se toman el día que viene.</p>
              </div>
              <button type="button" onClick={() => setForm(null)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* QR de la boleta CNS: evita tipear nombre y matrícula */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQrAbierto(true)}
                  className="px-4 py-2 rounded-lg bg-primary-main/30 border border-primary-light/40 text-primary-light text-sm font-bold flex items-center gap-2 hover:bg-primary-main/50"
                >
                  <ScanLine className="w-4 h-4" /> Escanear QR de la boleta
                </button>
                <span className="text-xs text-gray-500">Con la cámara o subiendo una foto: llena nombre y matrícula</span>
              </div>
              {qrLeido && (
                <div className={`text-xs rounded-lg border p-3 ${qrLeido.reconocido ? 'border-primary-light/30 bg-primary-main/10' : 'border-amber-500/40 bg-amber-900/20'}`}>
                  <div className={`font-bold ${qrLeido.reconocido ? 'text-primary-light' : 'text-amber-300'}`}>
                    {qrLeido.reconocido
                      ? '✓ Datos leídos del QR y puestos abajo: revíselos.'
                      : qrLeido.sinDatos
                        ? '⚠ El QR de esta boleta viene sin los datos del paciente (así lo genera el sistema de la CNS): copie los datos de la boleta a mano.'
                        : '⚠ El QR se leyó pero su formato no se reconoce: copie los datos a mano.'}
                  </div>
                  <div className="mt-1 font-mono break-all text-gray-400">{qrLeido.texto}</div>
                </div>
              )}

              {/* EMERGENCIA: vino hoy con su boleta; se registra y se atiende en el día */}
              <button
                type="button"
                onClick={() => setForm((p: any) => ({ ...p, emergencia: !p.emergencia, ...(!p.emergencia ? { fechaExamen: hoy } : {}) }))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                  form.emergencia ? 'bg-red-900/40 border-red-500/60' : 'bg-black/30 border-white/10 hover:border-red-500/40'
                }`}
              >
                <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-bold ${form.emergencia ? 'bg-red-600 border-red-500 text-white' : 'border-white/30 text-transparent'}`}>✓</span>
                <span>
                  <span className={`block text-sm font-bold ${form.emergencia ? 'text-red-200' : 'text-gray-200'}`}>EMERGENCIA</span>
                  <span className="block text-xs text-gray-400">Vino hoy con su boleta: queda marcado en rojo y se pasa directo a su registro</span>
                </span>
              </button>

              <div className="grid grid-cols-2 md:grid-cols-12 gap-3">
                <div className="col-span-2 md:col-span-3">
                  <label className={rotulo}>Fecha (día del examen) *</label>
                  <input type="date" required value={form.fechaExamen} onChange={e => set('fechaExamen', e.target.value)} className={campo} />
                </div>
                <div className="col-span-2 md:col-span-9">
                  <label className={rotulo}>Nombre y apellido *</label>
                  <input required autoFocus value={form.nombreCompleto} onChange={e => set('nombreCompleto', e.target.value)} className={campo} placeholder="Ej. ANA MARIA QUISPE MAMANI" />
                </div>
                <div className="col-span-2 md:col-span-6">
                  <label className={rotulo}>Matrícula *</label>
                  <input required value={form.matricula} onChange={e => set('matricula', e.target.value.toUpperCase())} className={`${campo} font-mono`} placeholder="Ej. 123456ABC" />
                </div>
                <div className="col-span-2 md:col-span-6">
                  <label className={rotulo}>Celular *</label>
                  <input required type="tel" inputMode="numeric" value={form.celular} onChange={e => set('celular', e.target.value)} className={campo} placeholder="Ej. 70000000" />
                </div>
              </div>

              <div>
                <label className={rotulo}>Exámenes *</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {GRUPOS.map((g, gi) => (
                    <div key={gi} className={`bg-black/30 border border-white/10 rounded-xl p-3 ${g.grupo ? '' : 'md:col-span-2'}`}>
                      <div className="text-[10px] font-bold tracking-wider text-primary-light mb-2">{g.grupo || 'EXÁMENES'}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {g.items.map(e => {
                          const on = form.examenes.includes(e.id);
                          return (
                            <button
                              key={e.id}
                              type="button"
                              onClick={() => alternarEnForm(e.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${on ? 'bg-primary-main border-primary-light/60 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'}`}
                            >
                              {on ? '✓ ' : ''}
                              {e.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-white/10 bg-black/20 rounded-b-2xl">
              <button type="button" onClick={() => setForm(null)} className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 text-sm font-bold">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="px-5 py-2 rounded-lg bg-primary-main hover:bg-primary-dark text-white text-sm font-bold disabled:opacity-50">
                {guardando ? 'Guardando…' : form._id ? 'Guardar cambios' : `Programar para el ${ddmmaaaa(form.fechaExamen)}`}
              </button>
            </div>
          </form>
        </div>
      )}

      <QrBoletaScanner isOpen={qrAbierto} onClose={() => setQrAbierto(false)} onDecoded={usarQr} />
      <QrBoletaScanner
        isOpen={scanComprobante}
        onClose={() => setScanComprobante(false)}
        onDecoded={usarComprobante}
        titulo="Escanear comprobante del paciente"
      />
    </div>
  );
}

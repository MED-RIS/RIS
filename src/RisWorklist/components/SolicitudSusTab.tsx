import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Printer, Search, X, ClipboardList, Trash2, CheckCircle2, Clock, CalendarCheck } from 'lucide-react';
import { api } from '../../Users/user';
import { getAuthHeaders } from '../../utils/token';
import { SEDE } from '../../config/sede';

// Solicitud única del SUS (formulario D-8 "Solicitud de exámenes de laboratorio, imagenología/gabinete o
// servicios de sangre"). Recepción la registra una vez: los exámenes de laboratorio pasan solos a la
// preprogramación y el resto queda en la bandeja de cada servicio, que lo marca como atendido.

type Estado = 'NO_APLICA' | 'PENDIENTE' | 'PROGRAMADO' | 'ATENDIDO';
const SERVICIOS: { id: string; nombre: string }[] = [
  { id: 'laboratorio', nombre: 'Laboratorio' },
  { id: 'imagenologia', nombre: 'Imagenología' },
  { id: 'electrocardiograma', nombre: 'Electrocardiograma' },
  { id: 'transfusion', nombre: 'Transfusión' },
  { id: 'bancoSangre', nombre: 'Banco de sangre' },
];
const BANCO: [string, string][] = [
  ['COOMBS_DIRECTO', 'Test de Coombs directo'], ['COOMBS_INDIRECTO', 'Test de Coombs indirecto'],
  ['PAQUETE_GLOBULAR', 'Paquete globular'], ['PLASMA_FRESCO_CONGELADO', 'Plasma fresco congelado'],
  ['CONCENTRADO_PLAQUETAS', 'Concentrado de plaquetas'], ['GRUPO_FACTOR_RH', 'Grupo sanguíneo y factor RH'],
  ['ANTICUERPOS_IRREGULARES', 'Anticuerpos irregulares'], ['PLASMA_NORMAL', 'Plasma normal'],
  ['GLOBULOS_ROJOS_LAVADOS', 'Glóbulos rojos lavados'], ['SANGRIA', 'Sangría'],
];
const COLOR: Record<string, string> = {
  PENDIENTE: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  PROGRAMADO: 'bg-sky-500/15 text-sky-200 border-sky-400/30',
  ATENDIDO: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
};
const hoyISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const ddmmaaaa = (s?: string) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : '');
const esc = (v: any) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
const nombreExamen = Object.fromEntries(SEDE.gruposExamenes.flatMap((g) => g.items.map((i) => [i.id, i.label])));

const vacia = () => ({
  fechaSolicitud: hoyISO(), fechaLaboratorio: hoyISO(), numeroRegistro: '', historiaClinica: '',
  paciente: { nombreCompleto: '', ci: '', sexo: '', edad: '', celular: '' },
  red: 'COREA', establecimiento: 'HOSPITAL MUNICIPAL MODELO COREA', municipio: 'EL ALTO',
  diagnostico: '', medicoSolicitante: '', salaCama: '', emergencia: false,
  laboratorio: [] as string[], imagenologia: { tac: '', ecografia: '', rayosX: '' }, electrocardiograma: false,
  otrosEstudios: ['', ''], transfusion: { solicitada: false, unidadServicio: '', prioridad: '' },
  bancoSangre: { items: [] as string[], paqueteGlobularUnidades: '' as any }, otro: '',
});

const pedir = async (ruta: string, init: RequestInit = {}) => {
  const r = await fetch(`${api}/api/ris/solicitudes-sus${ruta}`, { ...init, headers: getAuthHeaders() as HeadersInit });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `Error ${r.status}`);
  return d;
};

export default function SolicitudSusTab() {
  const [lista, setLista] = useState<any[]>([]);
  const [desde, setDesde] = useState(hoyISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [bandeja, setBandeja] = useState('');
  const [buscar, setBuscar] = useState('');
  const [form, setForm] = useState<any | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const avisar = (tipo: 'ok' | 'error', texto: string) => { setAviso({ tipo, texto }); setTimeout(() => setAviso(null), 4000); };
  const cargar = async () => {
    try {
      const q = new URLSearchParams({ desde, hasta, ...(bandeja && { servicio: bandeja }), ...(buscar && { q: buscar }) });
      setLista(await pedir(`?${q}`));
    } catch (e: any) {
      avisar('error', e.message);
    }
  };
  useEffect(() => { cargar(); }, [desde, hasta, bandeja]); // eslint-disable-line react-hooks/exhaustive-deps

  const guardar = async () => {
    setGuardando(true);
    try {
      const d = await pedir('', { method: 'POST', body: JSON.stringify(form) });
      setForm(null);
      avisar('ok', `Solicitud registrada${d.laboratorio?.length ? ': el laboratorio ya quedó en la preprogramación' : ''}.`);
      cargar();
    } catch (e: any) {
      avisar('error', e.message);
    } finally {
      setGuardando(false);
    }
  };
  const cambiar = async (s: any, servicio: string, estado: Estado) => {
    try {
      const d = await pedir(`/${s._id}/servicio/${servicio}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      setLista((l) => l.map((x) => (x._id === s._id ? d : x)));
    } catch (e: any) {
      avisar('error', e.message);
    }
  };
  const anular = async (s: any) => {
    if (!confirm(`¿Anular la solicitud de ${s.paciente?.nombreCompleto}? Se quitarán sus exámenes de la preprogramación si todavía no llegó.`)) return;
    try {
      await pedir(`/${s._id}`, { method: 'DELETE' });
      cargar();
    } catch (e: any) {
      avisar('error', e.message);
    }
  };

  const conteo = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of lista) for (const sv of SERVICIOS) if (s.estados?.[sv.id] === 'PENDIENTE') c[sv.id] = (c[sv.id] || 0) + 1;
    return c;
  }, [lista]);

  const campo = 'w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-light/60';

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Solicitud SUS</h2>
          <p className="text-sm text-gray-400 mt-0.5">Formulario D-8: se registra una vez y cada examen pasa a su servicio</p>
        </div>
        <div className="flex gap-2 items-center">
          {aviso && <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${aviso.tipo === 'ok' ? 'bg-emerald-600/20 text-emerald-200' : 'bg-red-600/20 text-red-200'}`}>{aviso.texto}</span>}
          <button onClick={() => setForm(vacia())} className="px-4 py-2 rounded-lg bg-primary-main hover:bg-primary-dark text-white text-sm font-bold flex items-center gap-1.5 shadow-lg">
            <Plus className="w-4 h-4" /> Nueva solicitud
          </button>
        </div>
      </div>

      {form ? (
        <Formulario form={form} setForm={setForm} campo={campo} guardando={guardando} onGuardar={guardar} onCancelar={() => setForm(null)} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 bg-plom-main border border-white/10 rounded-2xl p-3">
            <span className="text-xs text-gray-400 ml-1">Del</span>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white" />
            <span className="text-xs text-gray-400">al</span>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white" />
            <div className="relative ml-2">
              <input value={buscar} onChange={(e) => setBuscar(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && cargar()} placeholder="Nombre, CI o historia clínica" className="bg-black/40 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-sm text-white w-64" />
              <Search className="w-4 h-4 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex flex-wrap gap-1.5 ml-auto">
              <button onClick={() => setBandeja('')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${!bandeja ? 'bg-primary-main border-primary-light/60 text-white' : 'bg-black/40 border-white/10 text-gray-400'}`}>Todas</button>
              {SERVICIOS.map((s) => (
                <button key={s.id} onClick={() => setBandeja(s.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${bandeja === s.id ? 'bg-primary-main border-primary-light/60 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'}`}>
                  {s.nombre}{conteo[s.id] ? <span className="ml-1.5 rounded-full bg-amber-500/30 text-amber-100 px-1.5">{conteo[s.id]}</span> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-plom-main border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/10">
                  <th className="py-2.5 px-4">Fecha</th><th className="py-2.5 px-2">Paciente</th><th className="py-2.5 px-2">Médico / diagnóstico</th>
                  <th className="py-2.5 px-2">Servicios</th><th className="py-2.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((s) => (
                  <tr key={s._id} className="border-b border-white/5 align-top">
                    <td className="py-3 px-4 text-gray-300 whitespace-nowrap">{ddmmaaaa(s.fechaSolicitud)}{s.emergencia && <div className="text-[10px] font-bold text-red-300 mt-0.5">EMERGENCIA</div>}</td>
                    <td className="py-3 px-2">
                      <div className="text-white font-semibold">{s.paciente?.nombreCompleto}</div>
                      <div className="text-[11px] text-gray-500">CI {s.paciente?.ci || '—'} · HC {s.historiaClinica || '—'}{s.paciente?.edad ? ` · ${s.paciente.edad} años` : ''}</div>
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-400 max-w-[16rem]">
                      <div className="text-gray-300">{s.medicoSolicitante || '—'}</div>
                      <div className="truncate" title={s.diagnostico}>{s.diagnostico}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1.5">
                        {SERVICIOS.filter((sv) => s.estados?.[sv.id] && s.estados[sv.id] !== 'NO_APLICA').map((sv) => (
                          <ChipEstado key={sv.id} nombre={sv.nombre} estado={s.estados[sv.id]} editable={bandeja === sv.id && sv.id !== 'laboratorio'} onCambiar={(e) => cambiar(s, sv.id, e)} />
                        ))}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1.5">{resumenPedido(s)}</div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button onClick={() => imprimirD8(s)} className="p-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white" title="Imprimir solicitud (D-8)"><Printer className="w-4 h-4" /></button>
                      <button onClick={() => anular(s)} className="ml-1.5 p-2 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-red-300" title="Anular"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {!lista.length && (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-500"><ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />No hay solicitudes en estas fechas{bandeja ? ' para este servicio' : ''}.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function resumenPedido(s: any) {
  const partes: string[] = [];
  if (s.laboratorio?.length) partes.push(`Lab: ${s.laboratorio.map((e: string) => nombreExamen[e] || e).join(', ')}`);
  const img = s.imagenologia || {};
  if (img.tac) partes.push(`TAC: ${img.tac}`);
  if (img.ecografia) partes.push(`Eco: ${img.ecografia}`);
  if (img.rayosX) partes.push(`RX: ${img.rayosX}`);
  if (s.bancoSangre?.items?.length) partes.push(`Banco: ${s.bancoSangre.items.map((k: string) => (BANCO.find((b) => b[0] === k) || [k, k])[1]).join(', ')}`);
  return partes.join(' · ');
}

function ChipEstado({ nombre, estado, editable, onCambiar }: { nombre: string; estado: Estado; editable: boolean; onCambiar: (e: Estado) => void }) {
  const icono = estado === 'ATENDIDO' ? <CheckCircle2 className="w-3 h-3" /> : estado === 'PROGRAMADO' ? <CalendarCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />;
  if (!editable) {
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${COLOR[estado] || ''}`}>{icono}{nombre}: {estado.toLowerCase()}</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full border text-[11px] font-semibold ${COLOR[estado] || ''}`}>
      {icono}{nombre}:
      <select value={estado} onChange={(e) => onCambiar(e.target.value as Estado)} className="bg-transparent text-[11px] font-semibold outline-none cursor-pointer">
        <option value="PENDIENTE" className="bg-gray-900">pendiente</option>
        <option value="PROGRAMADO" className="bg-gray-900">programado</option>
        <option value="ATENDIDO" className="bg-gray-900">atendido</option>
      </select>
    </span>
  );
}

const Seccion = ({ titulo, children }: any) => (
  <div className="bg-plom-main border border-white/10 rounded-2xl p-4 space-y-3">
    <h3 className="text-sm font-bold text-white uppercase tracking-wide">{titulo}</h3>
    {children}
  </div>
);
const Campo = ({ etiqueta, children, className = '' }: any) => (
  <label className={`block ${className}`}><span className="block text-[11px] font-semibold text-gray-400 mb-1">{etiqueta}</span>{children}</label>
);
const Marca = ({ activo, onClick, children }: any) => (
  <button type="button" onClick={onClick} className={`flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg border text-xs ${activo ? 'border-primary-light/60 bg-primary-main/25 text-white' : 'border-white/10 bg-black/30 text-gray-300 hover:text-white'}`}>
    <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[10px] ${activo ? 'bg-primary-main border-primary-light' : 'border-gray-500'}`}>{activo ? '✓' : ''}</span>{children}
  </button>
);

function Formulario({ form, setForm, campo, guardando, onGuardar, onCancelar }: any) {
  const set = (ruta: string, v: any) => {
    setForm((f: any) => {
      const n = structuredClone(f);
      const partes = ruta.split('.');
      let o = n;
      partes.slice(0, -1).forEach((p) => (o = o[p]));
      o[partes[partes.length - 1]] = v;
      return n;
    });
  };
  // Sobre el estado más reciente (varios clics seguidos no se pisan)
  const alternar = (ruta: string, id: string) => {
    setForm((f: any) => {
      const n = structuredClone(f);
      const partes = ruta.split('.');
      let o = n;
      partes.slice(0, -1).forEach((p) => (o = o[p]));
      const ult = partes[partes.length - 1];
      o[ult] = o[ult].includes(id) ? o[ult].filter((x: string) => x !== id) : [...o[ult], id];
      return n;
    });
  };
  return (
    <div className="space-y-4">
      <Seccion titulo="Datos de la solicitud">
        <div className="grid md:grid-cols-4 gap-3">
          <Campo etiqueta="Fecha de solicitud"><input type="date" className={campo} value={form.fechaSolicitud} onChange={(e) => set('fechaSolicitud', e.target.value)} /></Campo>
          <Campo etiqueta="N.º de registro"><input className={campo} value={form.numeroRegistro} onChange={(e) => set('numeroRegistro', e.target.value)} placeholder="Ej. 18-06-74" /></Campo>
          <Campo etiqueta="Historia clínica"><input className={campo} value={form.historiaClinica} onChange={(e) => set('historiaClinica', e.target.value)} /></Campo>
          <Campo etiqueta="Cédula de identidad"><input className={campo} value={form.paciente.ci} onChange={(e) => set('paciente.ci', e.target.value)} /></Campo>
          <Campo etiqueta="Nombre del paciente" className="md:col-span-2"><input className={campo} value={form.paciente.nombreCompleto} onChange={(e) => set('paciente.nombreCompleto', e.target.value)} /></Campo>
          <Campo etiqueta="Sexo">
            <div className="flex gap-2">
              {['F', 'M'].map((x) => <Marca key={x} activo={form.paciente.sexo === x} onClick={() => set('paciente.sexo', form.paciente.sexo === x ? '' : x)}>{x === 'F' ? 'Femenino' : 'Masculino'}</Marca>)}
            </div>
          </Campo>
          <Campo etiqueta="Edad / Celular">
            <div className="flex gap-2"><input className={campo} value={form.paciente.edad} onChange={(e) => set('paciente.edad', e.target.value)} placeholder="Edad" /><input className={campo} value={form.paciente.celular} onChange={(e) => set('paciente.celular', e.target.value)} placeholder="Celular" /></div>
          </Campo>
          <Campo etiqueta="Diagnóstico principal" className="md:col-span-2"><input className={campo} value={form.diagnostico} onChange={(e) => set('diagnostico', e.target.value)} /></Campo>
          <Campo etiqueta="Médico solicitante"><input className={campo} value={form.medicoSolicitante} onChange={(e) => set('medicoSolicitante', e.target.value)} /></Campo>
          <Campo etiqueta="Servicio / sala y cama"><input className={campo} value={form.salaCama} onChange={(e) => set('salaCama', e.target.value)} placeholder="Ej. M-I cama 70" /></Campo>
          <Campo etiqueta="Red"><input className={campo} value={form.red} onChange={(e) => set('red', e.target.value)} /></Campo>
          <Campo etiqueta="Establecimiento" className="md:col-span-2"><input className={campo} value={form.establecimiento} onChange={(e) => set('establecimiento', e.target.value)} /></Campo>
          <Campo etiqueta="Municipio"><input className={campo} value={form.municipio} onChange={(e) => set('municipio', e.target.value)} /></Campo>
        </div>
        <Marca activo={form.emergencia} onClick={() => set('emergencia', !form.emergencia)}>Emergencia (se atiende el mismo día)</Marca>
      </Seccion>

      <Seccion titulo="Laboratorio">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SEDE.gruposExamenes.map((g) => (
            <div key={g.grupo || 'otros'}>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{g.grupo}</div>
              <div className="flex flex-col gap-1">
                {g.items.map((i) => <Marca key={i.id} activo={form.laboratorio.includes(i.id)} onClick={() => alternar('laboratorio', i.id)}>{i.label}</Marca>)}
              </div>
            </div>
          ))}
        </div>
        {form.laboratorio.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-300">
            Programar el laboratorio para el día
            <input type="date" className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white" value={form.fechaLaboratorio} onChange={(e) => set('fechaLaboratorio', e.target.value)} />
            <span className="text-gray-500">({form.laboratorio.length} exámenes)</span>
          </div>
        )}
      </Seccion>

      <div className="grid lg:grid-cols-2 gap-4">
        <Seccion titulo="Imagenología - sírvase realizar">
          <Campo etiqueta="TAC"><input className={campo} value={form.imagenologia.tac} onChange={(e) => set('imagenologia.tac', e.target.value)} placeholder="Ej. TAC de cráneo simple" /></Campo>
          <Campo etiqueta="Ecografía"><input className={campo} value={form.imagenologia.ecografia} onChange={(e) => set('imagenologia.ecografia', e.target.value)} /></Campo>
          <Campo etiqueta="Rayos X"><input className={campo} value={form.imagenologia.rayosX} onChange={(e) => set('imagenologia.rayosX', e.target.value)} /></Campo>
        </Seccion>
        <Seccion titulo="Gabinete y otros estudios">
          <Marca activo={form.electrocardiograma} onClick={() => set('electrocardiograma', !form.electrocardiograma)}>Electrocardiograma</Marca>
          <Campo etiqueta="Otros estudios de laboratorio o gabinete">
            <div className="space-y-2">{form.otrosEstudios.map((o: string, k: number) => <input key={k} className={campo} value={o} onChange={(e) => set(`otrosEstudios.${k}`, e.target.value)} placeholder={`${k + 1}.`} />)}</div>
          </Campo>
        </Seccion>
        <Seccion titulo="Solicitud de transfusión">
          <Marca activo={form.transfusion.solicitada} onClick={() => set('transfusion.solicitada', !form.transfusion.solicitada)}>Se solicita transfusión</Marca>
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Unidad / servicio"><input className={campo} value={form.transfusion.unidadServicio} onChange={(e) => set('transfusion.unidadServicio', e.target.value)} /></Campo>
            <Campo etiqueta="Prioridad">
              <div className="flex gap-2">{['URGENTE', 'PROGRAMADO'].map((p) => <Marca key={p} activo={form.transfusion.prioridad === p} onClick={() => set('transfusion.prioridad', form.transfusion.prioridad === p ? '' : p)}>{p === 'URGENTE' ? 'Urgente' : 'Programado'}</Marca>)}</div>
            </Campo>
          </div>
        </Seccion>
        <Seccion titulo="Banco de sangre - sírvase a otorgar">
          <div className="grid grid-cols-2 gap-1.5">
            {BANCO.map(([k, t]) => <Marca key={k} activo={form.bancoSangre.items.includes(k)} onClick={() => alternar('bancoSangre.items', k)}>{t}</Marca>)}
          </div>
          {form.bancoSangre.items.includes('PAQUETE_GLOBULAR') && (
            <Campo etiqueta="Paquete globular: N.º de unidades"><input type="number" min={1} max={20} className={campo} value={form.bancoSangre.paqueteGlobularUnidades} onChange={(e) => set('bancoSangre.paqueteGlobularUnidades', e.target.value)} /></Campo>
          )}
        </Seccion>
      </div>
      <Seccion titulo="Otro (especificar)">
        <input className={campo} value={form.otro} onChange={(e) => set('otro', e.target.value)} />
      </Seccion>

      <div className="flex justify-end gap-2 sticky bottom-0 py-3 bg-gradient-to-t from-black/90 to-transparent">
        <button onClick={onCancelar} className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white text-sm flex items-center gap-1.5"><X className="w-4 h-4" /> Cancelar</button>
        <button onClick={onGuardar} disabled={guardando} className="px-5 py-2 rounded-lg bg-primary-main hover:bg-primary-dark text-white text-sm font-bold shadow-lg disabled:opacity-50">{guardando ? 'Guardando…' : 'Registrar solicitud'}</button>
      </div>
    </div>
  );
}

// Hoja D-8 impresa con lo marcado (☒) y lo no marcado (☐), como el formulario en papel
function imprimirD8(s: any) {
  const v = window.open('', '_blank');
  if (!v) return;
  const caja = (on: boolean) => (on ? '☒' : '☐');
  const grupos = SEDE.gruposExamenes.map((g) => `<div class="g"><b>${esc(g.grupo)}</b>${g.items.map((i) => `<div>${caja(s.laboratorio?.includes(i.id))} ${esc(i.label)}</div>`).join('')}</div>`).join('');
  const img = s.imagenologia || {};
  v.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Solicitud SUS ${esc(s.paciente?.nombreCompleto)}</title><style>
@page{size:letter;margin:10mm}body{font-family:Arial,sans-serif;font-size:9pt;color:#111}h1{font-size:11.5pt;text-align:center;margin:0 0 6px}
table{width:100%;border-collapse:collapse;margin-bottom:6px}td{border:1px solid #333;padding:3px 5px;vertical-align:top}td b{font-size:7.5pt}
.cols{columns:3;column-gap:10px;border:1px solid #333;padding:6px}.g{break-inside:avoid;margin-bottom:6px}.g b{display:block;font-size:8pt;border-bottom:1px solid #999;margin-bottom:2px}
.sec{border:1px solid #333;padding:5px 6px;margin-top:6px}.sec b{font-size:8pt}.firma{margin-top:40px;width:50%;border-top:1px solid #333;text-align:center;padding-top:3px;font-size:8pt}</style></head><body>
<h1>SOLICITUD DE EXÁMENES DE LABORATORIO, IMAGENOLOGÍA/GABINETE O SERVICIOS DE SANGRE</h1>
<table><tr><td><b>RED</b> ${esc(s.red)}</td><td><b>MUNICIPIO</b> ${esc(s.municipio)}</td><td><b>N.º REGISTRO</b> ${esc(s.numeroRegistro)}</td></tr>
<tr><td colspan="2"><b>ESTABLECIMIENTO</b> ${esc(s.establecimiento)}</td><td><b>HISTORIA CLÍNICA</b> ${esc(s.historiaClinica)}</td></tr>
<tr><td><b>FECHA DE SOLICITUD</b> ${ddmmaaaa(s.fechaSolicitud)}</td><td><b>CÉDULA DE IDENTIDAD</b> ${esc(s.paciente?.ci)}</td><td><b>SEXO</b> ${esc(s.paciente?.sexo)} &nbsp; <b>EDAD</b> ${esc(s.paciente?.edad)}</td></tr>
<tr><td colspan="3"><b>NOMBRE DEL PACIENTE</b> ${esc(s.paciente?.nombreCompleto)}</td></tr>
<tr><td colspan="2"><b>DIAGNÓSTICO PRINCIPAL</b> ${esc(s.diagnostico)}</td><td><b>SERVICIO / SALA Y CAMA</b> ${esc(s.salaCama)}</td></tr></table>
<div class="cols">${grupos}</div>
<div class="sec"><b>IMAGENOLOGÍA - SÍRVASE REALIZAR</b><div>TAC: ${esc(img.tac)}</div><div>ECOGRAFÍA: ${esc(img.ecografia)}</div><div>RAYOS X: ${esc(img.rayosX)}</div>
<div style="margin-top:4px"><b>ELECTROCARDIOGRAMA</b> ${caja(s.electrocardiograma)} &nbsp; <b>OTROS ESTUDIOS</b> ${(s.otrosEstudios || []).map((o: string, k: number) => `${k + 1}. ${esc(o)}`).join(' &nbsp; ')}</div></div>
<div class="sec"><b>SOLICITUD DE TRANSFUSIÓN</b> &nbsp; Unidad/servicio: ${esc(s.transfusion?.unidadServicio)} &nbsp; Urgente ${caja(s.transfusion?.prioridad === 'URGENTE')} &nbsp; Programado ${caja(s.transfusion?.prioridad === 'PROGRAMADO')}</div>
<div class="sec"><b>SERVICIO DE BANCO DE SANGRE - SÍRVASE A OTORGAR</b><div style="columns:2">${BANCO.map(([k, t]) => `<div>${caja(s.bancoSangre?.items?.includes(k))} ${esc(t)}${k === 'PAQUETE_GLOBULAR' && s.bancoSangre?.paqueteGlobularUnidades ? ` (N.º ${s.bancoSangre.paqueteGlobularUnidades})` : ''}</div>`).join('')}</div></div>
<div class="sec"><b>OTRO (ESPECIFICAR)</b> ${esc(s.otro)}</div>
<div class="firma">${esc(s.medicoSolicitante)}<br>SELLO Y FIRMA SOLICITANTE</div>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`);
  v.document.close();
}

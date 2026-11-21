import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, CheckCircle2, ClipboardCheck, Download, FileSignature, FileText, Printer, RefreshCw, Siren, UserX, AlertTriangle } from 'lucide-react';
import { fetchPreprogramacion, fetchInformesLab } from '../risService';
import { SEDE, TODOS_EXAMENES } from '../../config/sede';
import { CATEGORIAS_LAB } from '../laboratorio/catalogoLaboratorio';

// Estadísticas del laboratorio: producción por día, exámenes más pedidos, informes por área y estado,
// asistencia, emergencias y resultados fuera de rango. Todo sale de la preprogramación y de los
// informes guardados en el servidor; se puede imprimir o bajar en CSV para el informe mensual.

const dia = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const deDia = (s: string) => new Date(`${s}T12:00:00`);
const ddmm = (s: string) => { const [, m, d] = s.split('-'); return `${d}/${m}`; };
const ddmmaaaa = (s: string) => { const [a, m, d] = s.split('-'); return `${d}/${m}/${a}`; };
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const esc = (s: any) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

const COLOR = { prog: '#3b82f6', emer: '#f43f5e', ok: '#10b981', warn: '#f59e0b', gris: '#64748b', violeta: '#8b5cf6' };
const NOMBRE_EXAMEN = Object.fromEntries(TODOS_EXAMENES.map((e) => [e.id, e.label]));
const AREA_DE_TIPO = Object.fromEntries(CATEGORIAS_LAB.map((c) => [c.storage.tipoLab, c.label]));

type Rango = 'hoy' | '7' | '30' | 'mes' | 'anio' | 'libre';
const RANGOS: { id: Rango; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: '7', label: '7 días' },
  { id: '30', label: '30 días' },
  { id: 'mes', label: 'Este mes' },
  { id: 'anio', label: 'Este año' },
  { id: 'libre', label: 'Fechas…' },
];

function calcularRango(r: Rango, libre: { desde: string; hasta: string }) {
  const hoy = new Date();
  const h = dia(hoy);
  if (r === 'hoy') return { desde: h, hasta: h };
  if (r === '7' || r === '30') { const d = new Date(hoy); d.setDate(d.getDate() - (Number(r) - 1)); return { desde: dia(d), hasta: h }; }
  if (r === 'mes') return { desde: dia(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta: h };
  if (r === 'anio') return { desde: `${hoy.getFullYear()}-01-01`, hasta: h };
  return libre;
}

// Valores de un informe: hematología se guarda plano en datos; las demás áreas en su "bolsa"
function valoresInforme(inf: any): { key: string; label: string; valor: number; min: number; max: number }[] {
  const datos = inf?.datos || {};
  const out: any[] = [];
  for (const cat of CATEGORIAS_LAB) {
    const bolsa = cat.storage.mode === 'flat' ? datos : datos[(cat.storage as any).bag];
    if (!bolsa || typeof bolsa !== 'object') continue;
    for (const p of cat.catalogo as any[]) {
      if (typeof p.min !== 'number' || typeof p.max !== 'number' || p.bagOverride) continue;
      const v = parseFloat(String(bolsa[p.key] ?? '').replace(',', '.'));
      if (Number.isFinite(v)) out.push({ key: p.key, label: p.label, valor: v, min: p.min, max: p.max });
    }
  }
  return out;
}

function contar<T>(lista: T[], clave: (x: T) => string | string[] | undefined) {
  const m = new Map<string, number>();
  for (const x of lista) {
    const k = clave(x);
    for (const c of Array.isArray(k) ? k : [k]) if (c) m.set(c, (m.get(c) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export default function EstadisticasLabTab() {
  const [rango, setRango] = useState<Rango>('30');
  const [libre, setLibre] = useState(() => calcularRango('mes', { desde: '', hasta: '' }));
  const { desde, hasta } = calcularRango(rango, libre);
  const [preprog, setPreprog] = useState<any[]>([]);
  const [informes, setInformes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargar = async () => {
    if (!desde || !hasta || desde > hasta) return;
    setCargando(true); setError('');
    try {
      const [p, i] = await Promise.all([fetchPreprogramacion(desde, hasta), fetchInformesLab()]);
      setPreprog(Array.isArray(p) ? p : []);
      setInformes(Array.isArray(i) ? i : []);
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => { cargar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [desde, hasta]);

  const est = useMemo(() => {
    const infs = informes.filter((x) => x.fecha && x.fecha >= desde && x.fecha <= hasta);
    const dias: string[] = [];
    for (let d = deDia(desde); dia(d) <= hasta && dias.length < 400; d.setDate(d.getDate() + 1)) dias.push(dia(d));

    const porDia = dias.map((d) => {
      const filas = preprog.filter((f) => f.fechaExamen === d);
      return {
        d,
        prog: filas.filter((f) => !f.emergencia).length,
        emer: filas.filter((f) => f.emergencia).length,
        informes: infs.filter((x) => x.fecha === d).length,
      };
    });

    const asistio = preprog.filter((f) => f.estado === 'ASISTIO' || f.paciente).length;
    const noVino = preprog.filter((f) => f.estado === 'NO_VINO').length;
    const emergencias = preprog.filter((f) => f.emergencia).length;
    const entregados = preprog.filter((f) => f.entregado).length;
    const examenesPedidos = preprog.reduce((s, f) => s + (f.examenes?.length || 0), 0);

    const estados = { BORRADOR: 0, COMPLETADO: 0, FIRMADO: 0 } as Record<string, number>;
    for (const x of infs) estados[x.estado || 'COMPLETADO'] = (estados[x.estado || 'COMPLETADO'] || 0) + 1;

    const topExamenes = contar(preprog, (f) => f.examenes).map(([k, n]) => [NOMBRE_EXAMEN[k] || k, n] as [string, number]);
    const porArea = contar(infs, (x) => (x.estudiosRealizados || []).map((t: string) => AREA_DE_TIPO[t] || t));

    // Resultados fuera de rango por parámetro (solo parámetros numéricos con rango de referencia)
    const fuera = new Map<string, { label: string; total: number; altos: number; bajos: number }>();
    for (const x of infs) {
      for (const v of valoresInforme(x)) {
        const r = fuera.get(v.key) || { label: v.label, total: 0, altos: 0, bajos: 0 };
        r.total++;
        if (v.valor > v.max) r.altos++;
        else if (v.valor < v.min) r.bajos++;
        fuera.set(v.key, r);
      }
    }
    const fueraRango = [...fuera.values()]
      .filter((r) => r.total >= 3 && r.altos + r.bajos > 0)
      .sort((a, b) => (b.altos + b.bajos) / b.total - (a.altos + a.bajos) / a.total)
      .slice(0, 10);

    const municipios = SEDE.camposSolicitud ? contar(preprog, (f) => (f.municipio || '').trim().toUpperCase() || undefined).slice(0, 8) : [];
    const medicos = SEDE.camposSolicitud ? contar(preprog, (f) => (f.medicoSolicitante || '').trim().toUpperCase() || undefined).slice(0, 8) : [];

    const diasSemana = [0, 0, 0, 0, 0, 0, 0];
    for (const f of preprog) diasSemana[deDia(f.fechaExamen).getDay()]++;

    return { infs, porDia, asistio, noVino, emergencias, entregados, examenesPedidos, estados, topExamenes, porArea, fueraRango, municipios, medicos, diasSemana };
  }, [preprog, informes, desde, hasta]);

  const total = preprog.length;
  const periodo = desde === hasta ? ddmmaaaa(desde) : `${ddmmaaaa(desde)} al ${ddmmaaaa(hasta)}`;

  const exportarCsv = () => {
    const filas: (string | number)[][] = [
      ['Estadísticas de laboratorio', SEDE.institucion],
      ['Periodo', periodo],
      [],
      ['Indicador', 'Valor'],
      ['Pacientes programados', total],
      ['Asistieron / registrados', est.asistio],
      ['No vinieron', est.noVino],
      ['Emergencias', est.emergencias],
      ['Exámenes solicitados', est.examenesPedidos],
      ['Informes', est.infs.length],
      ['Informes en borrador', est.estados.BORRADOR || 0],
      ['Informes completados', est.estados.COMPLETADO || 0],
      ['Informes firmados', est.estados.FIRMADO || 0],
      ['Resultados entregados', est.entregados],
      [],
      ['Fecha', 'Programados', 'Emergencias', 'Informes'],
      ...est.porDia.map((r) => [ddmmaaaa(r.d), r.prog, r.emer, r.informes]),
      [],
      ['Examen', 'Solicitudes'],
      ...est.topExamenes,
      [],
      ['Área', 'Informes'],
      ...est.porArea,
      [],
      ['Parámetro', 'Resultados', 'Altos', 'Bajos', '% fuera de rango'],
      ...est.fueraRango.map((r) => [r.label, r.total, r.altos, r.bajos, pct(r.altos + r.bajos, r.total)]),
    ];
    const csv = '﻿' + filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `estadisticas-laboratorio-${desde}_${hasta}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const imprimir = () => {
    const v = window.open('', '_blank');
    if (!v) return;
    const tabla = (titulo: string, cab: string[], filas: (string | number)[][]) =>
      `<h3>${esc(titulo)}</h3><table><thead><tr>${cab.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${
        filas.length ? filas.map((f) => `<tr>${f.map((c, i) => `<td class="${i ? 'n' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${cab.length}" class="vacio">Sin datos en el periodo</td></tr>`
      }</tbody></table>`;
    const maxDia = Math.max(1, ...est.porDia.map((r) => r.prog + r.emer));
    const barras = est.porDia.length <= 62
      ? `<h3>Pacientes por día</h3><div class="graf">${est.porDia.map((r) => `<div class="col" title="${ddmm(r.d)}"><div class="e" style="height:${(r.emer / maxDia) * 100}px"></div><div class="p" style="height:${(r.prog / maxDia) * 100}px"></div><span>${est.porDia.length <= 31 ? ddmm(r.d).slice(0, 2) : ''}</span></div>`).join('')}</div><div class="ley"><i style="background:${COLOR.prog}"></i>Programados <i style="background:${COLOR.emer}"></i>Emergencias</div>`
      : '';
    v.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Estadísticas de laboratorio ${esc(periodo)}</title>
<style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;font-size:9.5pt;color:#111}h1{font-size:14pt;margin:0}
.sub{color:#444;margin:2px 0 10px}.kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:8px 0 4px}
.kpi{border:1px solid #bbb;border-radius:6px;padding:6px 8px}.kpi b{display:block;font-size:15pt}.kpi span{font-size:8pt;color:#555}
h3{font-size:10.5pt;margin:14px 0 4px;border-bottom:2px solid #1e3a8a;padding-bottom:2px;color:#1e3a8a}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:3px 6px}th{background:#e8edf7;font-size:8.5pt;text-align:left}
td.n{text-align:right;width:70px}td.vacio{text-align:center;color:#777}.dos{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.graf{display:flex;align-items:flex-end;gap:2px;height:120px;border-bottom:1px solid #999;padding-top:6px}
.col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;position:relative;height:100%}
.col .p{background:${COLOR.prog}}.col .e{background:${COLOR.emer}}.col span{position:absolute;bottom:-13px;left:0;right:0;text-align:center;font-size:6.5pt}
.ley{margin-top:16px;font-size:8pt}.ley i{display:inline-block;width:10px;height:10px;margin:0 4px 0 10px;vertical-align:middle}
h3{break-after:avoid}table,.dos,.graf{break-inside:avoid}.pie{margin-top:18px;font-size:8pt;color:#666}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>
<h1>ESTADÍSTICAS DEL LABORATORIO</h1>
<div class="sub">${esc(SEDE.institucion)} · Periodo: <b>${esc(periodo)}</b></div>
<div class="kpis">
<div class="kpi"><b>${total}</b><span>Pacientes programados</span></div>
<div class="kpi"><b>${est.asistio}</b><span>Asistieron (${pct(est.asistio, total)}%)</span></div>
<div class="kpi"><b>${est.emergencias}</b><span>Emergencias</span></div>
<div class="kpi"><b>${est.examenesPedidos}</b><span>Exámenes solicitados</span></div>
<div class="kpi"><b>${est.infs.length}</b><span>Informes (${est.estados.FIRMADO || 0} firmados)</span></div>
</div>
${barras}
<div class="dos"><div>${tabla('Exámenes más solicitados', ['Examen', 'Solicitudes'], est.topExamenes.slice(0, 15))}</div>
<div>${tabla('Informes por área', ['Área', 'Informes'], est.porArea)}
${tabla('Estado de los informes', ['Estado', 'Cantidad'], [['Borrador', est.estados.BORRADOR || 0], ['Completado', est.estados.COMPLETADO || 0], ['Firmado', est.estados.FIRMADO || 0]])}</div></div>
${tabla('Parámetros con más resultados fuera de rango', ['Parámetro', 'Resultados', 'Altos', 'Bajos', '% fuera'], est.fueraRango.map((r) => [r.label, r.total, r.altos, r.bajos, `${pct(r.altos + r.bajos, r.total)}%`]))}
${SEDE.camposSolicitud ? `<div class="dos"><div>${tabla('Pacientes por municipio', ['Municipio', 'Pacientes'], est.municipios)}</div><div>${tabla('Médicos solicitantes', ['Médico', 'Pacientes'], est.medicos)}</div></div>` : ''}
<div class="pie">Generado el ${new Date().toLocaleString('es-BO')} · Laboratorio clínico</div>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`);
    v.document.close();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Estadísticas del laboratorio</h2>
          <p className="text-sm text-gray-400 mt-0.5">{SEDE.institucion} · {periodo}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={cargar} className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5" title="Actualizar">
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} /> Actualizar
          </button>
          <button onClick={exportarCsv} className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Excel (CSV)
          </button>
          <button onClick={imprimir} className="px-4 py-2 rounded-lg bg-primary-main hover:bg-primary-dark text-white text-sm font-bold flex items-center gap-1.5 shadow-lg">
            <Printer className="w-4 h-4" /> Imprimir informe estadístico
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap bg-plom-main border border-white/10 rounded-2xl p-3">
        <CalendarDays className="w-4 h-4 text-gray-400 ml-1" />
        {RANGOS.map((r) => (
          <button
            key={r.id}
            onClick={() => setRango(r.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${rango === r.id ? 'bg-primary-main border-primary-light/60 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'}`}
          >
            {r.label}
          </button>
        ))}
        {rango === 'libre' && (
          <div className="flex items-center gap-2 ml-2 text-xs text-gray-300">
            <input type="date" value={libre.desde} onChange={(e) => setLibre({ ...libre, desde: e.target.value })} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white" />
            al
            <input type="date" value={libre.hasta} onChange={(e) => setLibre({ ...libre, hasta: e.target.value })} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white" />
          </div>
        )}
        {error && <span className="ml-auto text-xs text-red-300">{error}</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <Kpi icono={<CalendarDays />} color={COLOR.prog} valor={total} titulo="Programados" />
        <Kpi icono={<CheckCircle2 />} color={COLOR.ok} valor={est.asistio} titulo="Asistieron" nota={`${pct(est.asistio, total)}%`} />
        <Kpi icono={<UserX />} color={COLOR.gris} valor={est.noVino} titulo="No vinieron" nota={`${pct(est.noVino, total)}%`} />
        <Kpi icono={<Siren />} color={COLOR.emer} valor={est.emergencias} titulo="Emergencias" nota={`${pct(est.emergencias, total)}%`} />
        <Kpi icono={<BarChart3 />} color={COLOR.violeta} valor={est.examenesPedidos} titulo="Exámenes pedidos" nota={total ? `${(est.examenesPedidos / total).toFixed(1)} por paciente` : ''} />
        <Kpi icono={<FileText />} color={COLOR.prog} valor={est.infs.length} titulo="Informes" />
        <Kpi icono={<FileSignature />} color={COLOR.ok} valor={est.estados.FIRMADO || 0} titulo="Firmados" nota={`${est.estados.BORRADOR || 0} en borrador`} />
        <Kpi icono={<ClipboardCheck />} color={COLOR.warn} valor={est.entregados} titulo="Entregados" nota={`${pct(est.entregados, total)}%`} />
      </div>

      <Tarjeta titulo="Pacientes por día" extra={<Leyenda items={[['Programados', COLOR.prog], ['Emergencias', COLOR.emer], ['Informes', COLOR.warn]]} />}>
        <GraficoDias filas={est.porDia} />
      </Tarjeta>

      <div className="grid lg:grid-cols-2 gap-5">
        <Tarjeta titulo="Exámenes más solicitados">
          <BarrasH filas={est.topExamenes.slice(0, 12)} color={COLOR.prog} vacio="No hay exámenes preprogramados en el periodo" />
        </Tarjeta>
        <Tarjeta titulo="Informes por área">
          <BarrasH filas={est.porArea} color={COLOR.violeta} vacio="No hay informes en el periodo" />
        </Tarjeta>
        <Tarjeta titulo="Estado de los informes">
          <BarraEstados estados={est.estados} />
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Pacientes por día de la semana</h4>
            <BarrasV valores={est.diasSemana} etiquetas={['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']} color={COLOR.prog} />
          </div>
        </Tarjeta>
        <Tarjeta titulo="Parámetros con más resultados fuera de rango" extra={<AlertTriangle className="w-4 h-4 text-amber-400" />}>
          {est.fueraRango.length ? (
            <div className="space-y-2.5">
              {est.fueraRango.map((r) => {
                const p = pct(r.altos + r.bajos, r.total);
                return (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-200 truncate pr-2">{r.label}</span>
                      <span className="text-gray-400 whitespace-nowrap">{r.altos} altos · {r.bajos} bajos de {r.total} · <b className="text-amber-300">{p}%</b></span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                      <div style={{ width: `${pct(r.altos, r.total)}%`, background: COLOR.emer }} />
                      <div style={{ width: `${pct(r.bajos, r.total)}%`, background: COLOR.prog }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-6 text-center">Sin resultados numéricos suficientes en el periodo</p>
          )}
        </Tarjeta>
        {SEDE.camposSolicitud && (
          <>
            <Tarjeta titulo="Pacientes por municipio">
              <BarrasH filas={est.municipios} color={COLOR.ok} vacio="Sin municipio registrado" />
            </Tarjeta>
            <Tarjeta titulo="Médicos solicitantes">
              <BarrasH filas={est.medicos} color={COLOR.warn} vacio="Sin médico solicitante registrado" />
            </Tarjeta>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Piezas visuales ─────────────────────────────────────────────────── */

function Kpi({ icono, color, valor, titulo, nota }: { icono: React.ReactElement; color: string; valor: number; titulo: string; nota?: string }) {
  return (
    <div className="bg-plom-main border border-white/10 rounded-2xl p-3.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${color}26`, color }}>
        {React.cloneElement(icono, { className: 'w-4 h-4' } as any)}
      </div>
      <div className="text-2xl font-bold text-white leading-none">{valor.toLocaleString('es-BO')}</div>
      <div className="text-[11px] font-semibold text-gray-400 mt-1">{titulo}</div>
      {nota ? <div className="text-[10px] text-gray-500 mt-0.5">{nota}</div> : null}
    </div>
  );
}

function Tarjeta({ titulo, extra, children }: { titulo: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-plom-main border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-sm font-bold text-white">{titulo}</h3>
        {extra}
      </div>
      {children}
    </div>
  );
}

function Leyenda({ items }: { items: [string, string][] }) {
  return (
    <div className="flex gap-3 text-[11px] text-gray-400">
      {items.map(([t, c]) => (
        <span key={t} className="flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: c }} />{t}</span>
      ))}
    </div>
  );
}

function GraficoDias({ filas }: { filas: { d: string; prog: number; emer: number; informes: number }[] }) {
  const [sobre, setSobre] = useState<number | null>(null);
  if (!filas.length) return null;
  const max = Math.max(1, ...filas.map((r) => Math.max(r.prog + r.emer, r.informes)));
  const W = 1000, H = 220, pad = 28;
  const ancho = (W - pad) / filas.length;
  const y = (v: number) => H - 20 - (v / max) * (H - 36);
  const cada = Math.ceil(filas.length / 16);
  const linea = filas.map((r, i) => `${pad + i * ancho + ancho / 2},${y(r.informes)}`).join(' ');
  const s = sobre != null ? filas[sobre] : null;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56" onMouseLeave={() => setSobre(null)}>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={pad} x2={W} y1={y(max * t)} y2={y(max * t)} stroke="rgba(255,255,255,0.07)" />
            <text x={pad - 6} y={y(max * t) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{Math.round(max * t)}</text>
          </g>
        ))}
        {filas.map((r, i) => {
          const x = pad + i * ancho + ancho * 0.15, w = Math.max(1, ancho * 0.7);
          return (
            <g key={r.d} onMouseEnter={() => setSobre(i)}>
              <rect x={pad + i * ancho} y={0} width={ancho} height={H} fill={sobre === i ? 'rgba(255,255,255,0.05)' : 'transparent'} />
              <rect x={x} y={y(r.prog)} width={w} height={H - 20 - y(r.prog)} fill={COLOR.prog} rx="2" />
              <rect x={x} y={y(r.prog + r.emer)} width={w} height={y(r.prog) - y(r.prog + r.emer)} fill={COLOR.emer} rx="2" />
              {i % cada === 0 && <text x={pad + i * ancho + ancho / 2} y={H - 5} textAnchor="middle" fontSize="10" fill="#94a3b8">{ddmm(r.d)}</text>}
            </g>
          );
        })}
        <polyline points={linea} fill="none" stroke={COLOR.warn} strokeWidth="2" pointerEvents="none" />
      </svg>
      {s && (
        <div className="absolute top-0 right-0 bg-black/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 pointer-events-none">
          <b className="text-white">{ddmmaaaa(s.d)}</b> · {s.prog} programados · {s.emer} emergencias · {s.informes} informes
        </div>
      )}
    </div>
  );
}

function BarrasH({ filas, color, vacio }: { filas: [string, number][]; color: string; vacio: string }) {
  if (!filas.length) return <p className="text-sm text-gray-500 py-6 text-center">{vacio}</p>;
  const max = Math.max(...filas.map((f) => f[1]));
  return (
    <div className="space-y-2">
      {filas.map(([t, n]) => (
        <div key={t} className="grid grid-cols-[minmax(0,11rem)_1fr_3rem] items-center gap-2 text-xs">
          <span className="text-gray-300 truncate" title={t}>{t}</span>
          <div className="h-3 rounded bg-white/5 overflow-hidden"><div className="h-full rounded" style={{ width: `${(n / max) * 100}%`, background: color }} /></div>
          <span className="text-right font-bold text-white">{n.toLocaleString('es-BO')}</span>
        </div>
      ))}
    </div>
  );
}

function BarrasV({ valores, etiquetas, color }: { valores: number[]; etiquetas: string[]; color: string }) {
  const max = Math.max(1, ...valores);
  return (
    <div className="flex items-end gap-2 h-28">
      {valores.map((v, i) => (
        <div key={etiquetas[i]} className="flex-1 flex flex-col items-center justify-end h-full">
          <span className="text-[10px] text-gray-300 mb-1">{v || ''}</span>
          <div className="w-full rounded-t" style={{ height: `${(v / max) * 80}%`, background: color, minHeight: v ? 2 : 0 }} />
          <span className="text-[10px] text-gray-500 mt-1">{etiquetas[i]}</span>
        </div>
      ))}
    </div>
  );
}

function BarraEstados({ estados }: { estados: Record<string, number> }) {
  const items: [string, number, string][] = [
    ['Borrador', estados.BORRADOR || 0, COLOR.warn],
    ['Completado', estados.COMPLETADO || 0, COLOR.prog],
    ['Firmado', estados.FIRMADO || 0, COLOR.ok],
  ];
  const total = items.reduce((s, i) => s + i[1], 0);
  if (!total) return <p className="text-sm text-gray-500 py-4 text-center">No hay informes en el periodo</p>;
  return (
    <div>
      <div className="h-4 rounded-full overflow-hidden flex bg-white/5">
        {items.map(([t, n, c]) => n ? <div key={t} style={{ width: `${(n / total) * 100}%`, background: c }} title={`${t}: ${n}`} /> : null)}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {items.map(([t, n, c]) => (
          <div key={t} className="rounded-xl bg-black/30 border border-white/5 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400"><i className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />{t}</div>
            <div className="text-lg font-bold text-white">{n.toLocaleString('es-BO')} <span className="text-xs text-gray-500 font-normal">{pct(n, total)}%</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

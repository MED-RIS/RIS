import React, { useState } from 'react';
import {
  ArrowLeft, ClipboardList, Search, FileText, Clock, CheckCircle2,
  Lock, User, Tag, CalendarDays, Stethoscope, ListChecks,
} from 'lucide-react';
import { CATEGORIAS_LAB, ParametroLab } from '../laboratorio/catalogoLaboratorio';

type EstadoInforme = 'BORRADOR' | 'COMPLETADO' | 'FIRMADO';

interface EditorLaboratorioProps {
  pacienteData: any;
  informePrevio?: any;   // último informe del paciente (para precargar un control repetido)
  onVolver: () => void;
  onGuardarLocal: (documento: any) => void;
}

// Calcula el flag ESTADO (H alto / L bajo / N normal) solo cuando el parámetro tiene
// min/max numéricos. Rangos por sexo o de texto devuelven null (columna "—").
const calcularFlag = (p: ParametroLab, raw: any): 'H' | 'L' | 'N' | null => {
  if (raw === undefined || raw === null || String(raw).trim() === '') return null;
  if (p.min === undefined && p.max === undefined) return null;
  const n = parseFloat(String(raw).replace(',', '.'));
  if (isNaN(n)) return null;
  if (p.min !== undefined && n < p.min) return 'L';
  if (p.max !== undefined && n > p.max) return 'H';
  return 'N';
};

const FLAG_META: Record<string, { txt: string; cls: string }> = {
  H: { txt: 'ALTO', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  L: { txt: 'BAJO', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  N: { txt: 'NORMAL', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const ESTADO_META: Record<EstadoInforme, { txt: string; cls: string }> = {
  BORRADOR: { txt: '🕓 BORRADOR', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  COMPLETADO: { txt: '✓ COMPLETADO', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  FIRMADO: { txt: '🔒 FIRMADO', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
};

const esLleno = (v: any) => String(v ?? '').trim() !== '';

// Reconstruye `valores` por categoría desde un `datos` guardado (inverso del ruteo de guardar):
// lee cada parámetro desde su bolsa efectiva (flat en la raíz, o datos[bag] / bagOverride).
const hidratarValores = (datos: any): Record<string, Record<string, string>> => {
  const out: Record<string, Record<string, string>> = {};
  if (!datos) return out;
  for (const cat of CATEGORIAS_LAB) {
    const catVals: Record<string, string> = {};
    for (const p of cat.catalogo) {
      const mode = p.modeOverride || cat.storage.mode;
      const bag = p.bagOverride || cat.storage.bag;
      const raw = mode === 'flat' ? datos[p.key] : datos[bag as string]?.[p.key];
      if (raw !== undefined && raw !== null && String(raw).trim() !== '') catVals[p.key] = String(raw);
    }
    if (Object.keys(catVals).length) out[cat.id] = catVals;
  }
  return out;
};

export default function EditorLaboratorio({ pacienteData, informePrevio, onVolver, onGuardarLocal }: EditorLaboratorioProps) {
  // Valores por categoría: { [categoriaId]: { [paramKey]: valor } }.
  const [valores, setValores] = useState<Record<string, Record<string, string>>>({});
  const [observaciones, setObservaciones] = useState('');
  const [general, setGeneral] = useState({
    ordenRelacionada: '',
    nroSolicitud: '',
    medicoDerivante: '',
    fechaExamen: new Date().toISOString().slice(0, 10),
    horaToma: '',
    horaRecepcion: '',
    horaEmision: '',
  });
  const [tabActiva, setTabActiva] = useState('hematologia');
  const [filtro, setFiltro] = useState('');
  const [estado, setEstado] = useState<EstadoInforme>('BORRADOR');

  const nombrePaciente = `${pacienteData?.nombres || ''} ${pacienteData?.paterno || ''}`.trim() || 'Paciente sin nombre';

  const categoria = CATEGORIAS_LAB.find((c) => c.id === tabActiva)!;
  const valoresCat = valores[tabActiva] || {};

  const setParam = (key: string, value: string) =>
    setValores((prev) => ({ ...prev, [tabActiva]: { ...(prev[tabActiva] || {}), [key]: value } }));

  const setGen = (key: string, value: string) => setGeneral((prev) => ({ ...prev, [key]: value }));

  const contarLlenos = (catId: string) => Object.values(valores[catId] || {}).filter(esLleno).length;

  const guardar = (nuevoEstado: EstadoInforme) => {
    setEstado(nuevoEstado);

    // Documento con la MISMA forma que RegistrarConsulta: cada bag al nivel superior,
    // para que guardarEnRisServer los deje en datos.<bag> y los PDF los lean.
    const doc: any = {
      paciente: nombrePaciente,
      fecha: general.fechaExamen,
      codigoAsegurado: pacienteData?.cod || 'S/M',
      medico_solicitante: general.medicoDerivante,
      nro_solicitud: general.nroSolicitud,
      hora_toma_muestra: general.horaToma,
      hora_recepcion: general.horaRecepcion,
      hora_emision: general.horaEmision,
      estadoInforme: nuevoEstado,
      observaciones,
    };

    const estudios = new Set<string>();
    const hematoBag: Record<string, string> = {};

    // Ruteo POR PARÁMETRO: cada campo cae en su bolsa efectiva (respeta bagOverride,
    // p.ej. Widal dentro de Serología va a widalDatos; Microalbuminuria a microDatos).
    for (const cat of CATEGORIAS_LAB) {
      const vals = valores[cat.id] || {};
      let catLleno = false;
      for (const p of cat.catalogo) {
        const v = vals[p.key];
        if (!esLleno(v)) continue;
        catLleno = true;
        const mode = p.modeOverride || cat.storage.mode;
        const bag = p.bagOverride || cat.storage.bag;
        if (mode === 'flat') {
          hematoBag[p.key] = v;
        } else if (bag) {
          doc[bag] = { ...(doc[bag] || {}), [p.key]: v };
        }
      }
      if (catLleno) estudios.add(cat.storage.tipoLab);
    }

    // Hematología: plano (guardarEnRisServer usa hematoDatos como datosFormularioSueltos).
    doc.datos = { ...hematoBag, observaciones };
    doc.hematoDatos = { ...hematoBag, observaciones };
    doc.tipoLaboratorio = [...estudios][0] || 'Lab_Hemato';
    doc.estudiosRealizados = [...estudios];

    onGuardarLocal(doc);
  };

  const paramsVisibles = categoria.catalogo.filter((p) =>
    p.label.toLowerCase().includes(filtro.trim().toLowerCase())
  );

  const inputBase =
    'w-full bg-[#050a09] border border-[#2a403a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00bfa5] transition-colors';
  const labelBase = 'text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-1.5';

  return (
    <div className="fixed inset-0 bg-[#060b09] z-50 flex flex-col overflow-y-auto text-white">

      {/* Cabecera del módulo */}
      <div className="border-b border-[#142823] px-6 py-4">
        <div className="flex items-center gap-2 text-[#00bfa5]">
          <FileText className="w-5 h-5" />
          <h1 className="text-lg font-bold">Informes de Laboratorio Clínico</h1>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Gestión de análisis clínicos: Hematología, Serología, Urología, Química Sanguínea
        </p>
      </div>

      <div className="p-6 flex-1">
        {/* Barra del editor */}
        <div className="bg-[#0e1715] border border-[#2a403a] rounded-xl p-5 mb-5 flex justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={onVolver}
              className="p-2 bg-[#050a09] border border-[#2a403a] rounded-lg text-gray-300 hover:text-white hover:border-[#00bfa5] transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-bold text-white">Crear Informe de Laboratorio</h2>
              <p className="text-xs text-gray-500 mt-0.5">Llene los datos del paciente y resultados analíticos</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Estado actual</span>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${ESTADO_META[estado].cls}`}>
              {ESTADO_META[estado].txt}
            </span>
          </div>
        </div>

        {/* Precarga de control repetido: reutiliza el último informe del paciente */}
        {informePrevio && (
          <div className="bg-[#00bfa5]/5 border border-[#00bfa5]/25 rounded-xl p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <ListChecks className="w-4 h-4 text-[#00bfa5]" />
              <span className="text-gray-300">
                Este paciente tiene un informe previo del <b className="text-white">{informePrevio.fecha}</b>. Podés precargar sus valores para un control.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setValores(hidratarValores(informePrevio.datos));
                setObservaciones(informePrevio.datos?.observaciones || '');
              }}
              className="px-4 py-2 text-xs font-bold text-[#04140f] bg-[#00bfa5] rounded-lg hover:bg-[#00d4b8] transition-colors"
            >
              Cargar último control
            </button>
          </div>
        )}

        {/* INFORMACIÓN GENERAL */}
        <div className="bg-[#0e1715] border border-[#2a403a] rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 text-[#00bfa5] mb-4">
            <ClipboardList className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Información General</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelBase}><User className="w-3 h-3" /> Paciente *</label>
              <div className={`${inputBase} flex items-center text-gray-200 cursor-default`}>{nombrePaciente}</div>
            </div>
            <div>
              <label className={labelBase}><FileText className="w-3 h-3" /> Cód. Beneficiario</label>
              <div className={`${inputBase} flex items-center text-gray-200 cursor-default`}>
                {pacienteData?.codigoBeneficiario && pacienteData.codigoBeneficiario !== '-' ? pacienteData.codigoBeneficiario : '—'}
              </div>
            </div>
            <div>
              <label className={labelBase}><Tag className="w-3 h-3" /> Nro. de Solicitud / Recibo Físico</label>
              <input value={general.nroSolicitud} onChange={(e) => setGen('nroSolicitud', e.target.value)} placeholder="Ej: CQREA-10293" className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><Stethoscope className="w-3 h-3" /> Médico Derivante</label>
              <input value={general.medicoDerivante} onChange={(e) => setGen('medicoDerivante', e.target.value)} placeholder="Dr. Juan Pérez" className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><CalendarDays className="w-3 h-3" /> Fecha del Examen</label>
              <input type="date" value={general.fechaExamen} onChange={(e) => setGen('fechaExamen', e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><Clock className="w-3 h-3" /> Hora Toma de Muestra</label>
              <input type="time" value={general.horaToma} onChange={(e) => setGen('horaToma', e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><Clock className="w-3 h-3" /> Hora Recepción Muestra</label>
              <input type="time" value={general.horaRecepcion} onChange={(e) => setGen('horaRecepcion', e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><Clock className="w-3 h-3" /> Hora Emisión Resultados</label>
              <input type="time" value={general.horaEmision} onChange={(e) => setGen('horaEmision', e.target.value)} className={inputBase} />
            </div>
          </div>
        </div>

        {/* Tabs de categorías */}
        <div className="flex flex-wrap gap-1 border-b border-[#1f332d] mb-5">
          {CATEGORIAS_LAB.map((cat) => {
            const activa = cat.id === tabActiva;
            const llenos = contarLlenos(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => { setTabActiva(cat.id); setFiltro(''); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activa ? 'border-[#00bfa5] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {cat.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activa ? 'bg-[#00bfa5]/15 text-[#00bfa5]' : 'bg-white/5 text-gray-500'}`}>
                  {llenos}/{cat.total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel de la categoría activa */}
        <div className="bg-[#0e1715] border border-[#2a403a] rounded-xl p-5">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00bfa5]" /> {categoria.label}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Ingrese los resultados de los análisis. Los campos vacíos no se incluirán en el informe impreso.
                {categoria.sinPDF && (
                  <span className="text-amber-400/80"> · Esta categoría aún no genera PDF (datos capturados).</span>
                )}
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Filtrar parámetros..." className={`${inputBase} pl-9 w-64`} />
            </div>
          </div>

          {/* Tabla de parámetros */}
          <div className="overflow-x-auto rounded-lg border border-[#1f332d]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0a1310] text-[10px] uppercase tracking-wider text-gray-400">
                  <th className="text-left font-bold px-4 py-3">Parámetro / Examen</th>
                  <th className="text-left font-bold px-4 py-3 w-[26%]">Valor / Resultado</th>
                  <th className="text-left font-bold px-4 py-3 w-[8%]">Unidad</th>
                  <th className="text-left font-bold px-4 py-3 w-[24%]">Rango de Referencia</th>
                  <th className="text-center font-bold px-4 py-3 w-[10%]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paramsVisibles.map((p) => {
                  const valor = valoresCat[p.key] ?? '';
                  const flag = calcularFlag(p, valor);
                  return (
                    <tr key={p.key} className="border-t border-[#1f332d] hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-bold text-white">{p.label}</td>
                      <td className="px-4 py-3">
                        {p.opciones ? (
                          <select
                            value={valor}
                            onChange={(e) => setParam(p.key, e.target.value)}
                            className={inputBase}
                          >
                            <option value="">-- Seleccionar --</option>
                            {p.opciones.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="relative">
                            <input
                              value={valor}
                              onChange={(e) => setParam(p.key, e.target.value)}
                              placeholder="- - -"
                              className={`${inputBase} text-right ${p.unidad ? 'pr-12' : ''}`}
                            />
                            {p.unidad && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-500 pointer-events-none">{p.unidad}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.unidad || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.rango || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {flag ? (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${FLAG_META[flag].cls}`}>{FLAG_META[flag].txt}</span>
                        ) : (
                          <span className="text-gray-600 text-xs">- - -</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paramsVisibles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 text-sm py-10 italic">
                      Ningún parámetro coincide con "{filtro}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Observaciones */}
          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2 mb-2">
              <ListChecks className="w-4 h-4 text-[#00bfa5]" /> Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Escriba aquí observaciones del reporte..."
              rows={4}
              className={`${inputBase} resize-y`}
            />
          </div>
        </div>
      </div>

      {/* Footer de acciones */}
      <div className="border-t border-[#1f332d] bg-[#0a1310] px-6 py-4 flex flex-wrap justify-between items-center gap-3 sticky bottom-0">
        <button
          onClick={onVolver}
          className="px-5 py-2.5 text-sm font-bold text-gray-300 bg-[#050a09] border border-[#2a403a] rounded-lg hover:border-gray-500 transition-colors"
        >
          Cancelar
        </button>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => guardar('BORRADOR')} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors">
            <Clock className="w-4 h-4" /> Guardar Borrador
          </button>
          <button onClick={() => guardar('COMPLETADO')} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 rounded-lg hover:bg-sky-500/20 transition-colors">
            <CheckCircle2 className="w-4 h-4" /> Guardar Completado
          </button>
          <button onClick={() => guardar('FIRMADO')} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#005a43] to-[#00734f] rounded-lg hover:from-[#00734f] hover:to-[#00895d] transition-colors shadow-lg">
            <Lock className="w-4 h-4" /> Finalizar y Firmar
          </button>
        </div>
      </div>
    </div>
  );
}

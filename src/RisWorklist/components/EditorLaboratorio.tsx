import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, ClipboardList, Search, FileText, Clock, CheckCircle2,
  Lock, User, CalendarDays, Stethoscope, ListChecks, DoorOpen, Phone, FlaskConical,
} from 'lucide-react';
import { CATEGORIAS_LAB, ParametroLab, parametrosDeExamenes, COLUMNAS_EXCEL } from '../laboratorio/catalogoLaboratorio';
import { imprimirSolicitudExamenCNS } from '../reports/SolicitudExamenComplementario';
import { UNIDAD_SANITARIA, letraDelDia } from '../pacienteExcel';

type EstadoInforme = 'BORRADOR' | 'COMPLETADO' | 'FIRMADO';

interface EditorLaboratorioProps {
  pacienteData: any;
  informePrevio?: any;   // último informe del paciente (para precargar un control repetido)
  onVolver: () => void;
  onGuardarLocal: (documento: any) => void;
  // Exámenes marcados en la Preprogramación (HEMOGRAMA, EGO…): si vienen, el editor
  // muestra solo esas categorías y parámetros. Sin ellos, muestra todo como antes.
  soloExamenes?: string[];
  nombresExamenes?: string[];
  // Datos de la visita cargados en el registro (columnas del Excel): CONSULTORIO, MÉDICO,
  // FECHA SOLICIT., FECHA MUESTRA y FECHA EX.
  admision?: any;
  // Informes ya guardados: con ellos se saca la letra EMERGENCIAS del día (A, B, C…)
  historial?: any[];
  // Informe de este paciente para este día que ya existe: se abre con sus valores para
  // corregirlo o completarlo, en vez de crear otro (evita duplicados)
  informeExistente?: any;
}

// Quién está usando el sistema (para el historial de correcciones)
const usuarioActual = () => {
  try {
    const s = JSON.parse(localStorage.getItem('usuario') || 'null');
    return s?.user?.nombre || s?.user?.correo || 'Usuario';
  } catch {
    return 'Usuario';
  }
};

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

export default function EditorLaboratorio({ pacienteData, informePrevio, onVolver, onGuardarLocal, soloExamenes, nombresExamenes, admision: admisionProp, historial = [], informeExistente }: EditorLaboratorioProps) {
  const admision = admisionProp || pacienteData?.admision;
  const previo = informeExistente?.datos;
  const permitidos = useMemo(() => parametrosDeExamenes(soloExamenes || []), [soloExamenes]);
  const filtrado = Object.keys(permitidos).length > 0;
  const categoriasVisibles = CATEGORIAS_LAB.filter((c) => !filtrado || permitidos[c.id]);
  const totalCategoria = (catId: string) => (filtrado ? permitidos[catId]?.size || 0 : CATEGORIAS_LAB.find((c) => c.id === catId)?.total || 0);
  // Valores por categoría: { [categoriaId]: { [paramKey]: valor } }.
  const [valores, setValores] = useState<Record<string, Record<string, string>>>(() => (previo ? hidratarValores(previo) : {}));
  const [observaciones, setObservaciones] = useState(previo?.observaciones || '');
  const [general, setGeneral] = useState({
    letra: typeof previo?.emergencia === 'string' ? previo.emergencia : '', // vacío = la que toca en el día
    medicoDerivante: previo?.medico_solicitante ?? admision?.medico ?? '',
    consultorio: previo?.consultorio ?? admision?.consultorio ?? '',
    telefono: previo?.telefono ?? pacienteData?.telefono ?? '',
    diagnostico: previo?.diagnostico || '',
    muestra: previo?.muestra || '',
    // Fecha local: con toISOString a la noche de Bolivia ya salía el día siguiente
    fechaExamen: informeExistente?.fecha || admision?.fechaExamen || (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
    fechaSolicitud: previo?.fecha_solicitud ?? admision?.fechaSolicitud ?? '',
    fechaMuestra: previo?.fecha_muestra ?? admision?.fechaMuestra ?? '',
  });
  const [tabActiva, setTabActiva] = useState(() => categoriasVisibles[0]?.id || 'hematologia');
  const [filtro, setFiltro] = useState('');
  const [estado, setEstado] = useState<EstadoInforme>(() =>
    ['BORRADOR', 'COMPLETADO', 'FIRMADO'].includes(informeExistente?.estado) ? informeExistente.estado : 'BORRADOR'
  );
  const correccionesPrevias: any[] = previo?.correcciones || [];

  const nombrePaciente = `${pacienteData?.nombres || ''} ${pacienteData?.paterno || ''}`.trim() || 'Paciente sin nombre';
  const letraSugerida = letraDelDia(historial.filter((i) => i?.fecha === general.fechaExamen && i?.id !== informeExistente?.id).length);
  const letra = general.letra.trim().toUpperCase() || letraSugerida;

  const categoria = CATEGORIAS_LAB.find((c) => c.id === tabActiva)!;
  const valoresCat = valores[tabActiva] || {};

  const setParam = (key: string, value: string) =>
    setValores((prev) => ({ ...prev, [tabActiva]: { ...(prev[tabActiva] || {}), [key]: value } }));

  const setGen = (key: string, value: any) => setGeneral((prev) => ({ ...prev, [key]: value }));

  const contarLlenos = (catId: string) => Object.values(valores[catId] || {}).filter(esLleno).length;

  const guardar = (nuevoEstado: EstadoInforme) => {
    if (nombrePaciente === 'Paciente sin nombre') {
      alert('Ingrese al menos el nombre o apellido del paciente antes de guardar.');
      return;
    }
    const hayResultados = CATEGORIAS_LAB.some((cat) =>
      Object.values(valores[cat.id] || {}).some(esLleno)
    );
    if (!hayResultados) {
      alert('Ingrese al menos un resultado de laboratorio antes de guardar.');
      return;
    }

    // Corrección de valores ya registrados (error al copiar la boleta, por ejemplo):
    // se muestra qué cambia, se pide el motivo y queda en el historial del informe
    let correcciones = correccionesPrevias;
    if (informeExistente) {
      const antes = hidratarValores(previo);
      const cambios: { campo: string; antes: string; despues: string }[] = [];
      for (const cat of CATEGORIAS_LAB) {
        for (const p of cat.catalogo) {
          const a = String(antes[cat.id]?.[p.key] ?? '').trim();
          const d = String(valores[cat.id]?.[p.key] ?? '').trim();
          if (a !== '' && a !== d) cambios.push({ campo: p.label, antes: a, despues: d || '(vacío)' });
        }
      }
      if (cambios.length) {
        const lista = cambios.map((c) => `• ${c.campo}: ${c.antes} → ${c.despues}`).join('\n');
        const motivo = window.prompt(
          `Está corrigiendo ${cambios.length} valor(es) ya registrado(s):\n${lista}\n\nEscriba el motivo de la corrección (queda registrado con su nombre):`
        );
        if (motivo === null) return;
        if (!motivo.trim()) {
          alert('Para corregir valores ya registrados hay que escribir el motivo.');
          return;
        }
        correcciones = [...correcciones, { fecha: new Date().toISOString(), usuario: usuarioActual(), motivo: motivo.trim(), cambios }];
      }
    }

    setEstado(nuevoEstado);

    // Documento con la MISMA forma que RegistrarConsulta: cada bag al nivel superior,
    // para que guardarEnRisServer los deje en datos.<bag> y los PDF los lean.
    const doc: any = {
      paciente: nombrePaciente,
      fecha: general.fechaExamen,
      codigoAsegurado: pacienteData?.cod || 'S/M',
      // Columnas de la hoja dat del Excel
      emergencia: letra,
      paterno: pacienteData?.apellidoPaterno || '',
      materno: pacienteData?.apellidoMaterno || '',
      nombres: pacienteData?.nombres || '',
      edad: pacienteData?.edad || '',
      genero: pacienteData?.genero || '',
      avc: pacienteData?.codigoAsegurado || '',
      benef: pacienteData?.codigoBeneficiario || '',
      consultorio: general.consultorio,
      medico_solicitante: general.medicoDerivante,
      fecha_solicitud: general.fechaSolicitud,
      fecha_muestra: general.fechaMuestra,
      telefono: general.telefono,
      diagnostico: general.diagnostico,
      muestra: general.muestra,
      centro_asistencial: UNIDAD_SANITARIA,
      estadoInforme: nuevoEstado,
      observaciones,
      idInforme: informeExistente?.id,
      correcciones,
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

  // Filas en el orden de la planilla Excel, con el nombre de su columna y el encabezado
  // de su área (QUIMICAS 1, ELECTROLITOS…); lo que no está en la planilla va al final.
  const q = filtro.trim().toLowerCase();
  const pasa = (p: ParametroLab, excel = '') =>
    (!filtrado || permitidos[tabActiva]?.has(p.key)) &&
    (!q || p.label.toLowerCase().includes(q) || excel.toLowerCase().includes(q));
  type Fila = { grupo: string } | { p: ParametroLab; excel?: string };
  const filas: Fila[] = [];
  const columnas = COLUMNAS_EXCEL[tabActiva];
  if (columnas) {
    let area = '';
    for (const c of columnas) {
      const p = categoria.catalogo.find((x) => x.key === c.key);
      if (!p || !pasa(p, c.excel)) continue;
      if (c.area !== area) {
        area = c.area;
        filas.push({ grupo: area });
      }
      filas.push({ p, excel: c.excel });
    }
    const otros = categoria.catalogo.filter((p) => !columnas.some((c) => c.key === p.key) && pasa(p));
    if (otros.length) {
      filas.push({ grupo: 'OTROS (no están en la planilla)' });
      otros.forEach((p) => filas.push({ p }));
    }
  } else {
    categoria.catalogo.filter((p) => pasa(p)).forEach((p) => filas.push({ p }));
  }
  const paramsVisibles = filas.filter((x): x is { p: ParametroLab; excel?: string } => 'p' in x).map((x) => x.p);

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
              <h2 className="text-base font-bold text-white">{informeExistente ? 'Editar Informe de Laboratorio' : 'Crear Informe de Laboratorio'}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Llene los datos del paciente y resultados analíticos</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => imprimirSolicitudExamenCNS({
                paciente: { ...pacienteData, medico_solicitante: general.medicoDerivante, centro_asistencial: UNIDAD_SANITARIA, consultorio: general.consultorio, fecha: general.fechaExamen },
                categoriaId: categoria.id,
              })}
              className="px-3 py-2 text-xs font-bold text-[#00bfa5] bg-[#00bfa5]/10 border border-[#00bfa5]/30 rounded-lg hover:bg-[#00bfa5]/20 transition-colors whitespace-nowrap"
              title="Imprimir la solicitud de este examen para que el paciente la lleve al servicio"
            >
              🖨️ Imprimir Solicitud ({categoria.label})
            </button>
            <div className="text-right">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Estado actual</span>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${ESTADO_META[estado].cls}`}>
                {ESTADO_META[estado].txt}
              </span>
            </div>
          </div>
        </div>

        {/* Informe ya registrado este día: se corrige o completa este, no se crea otro */}
        {informeExistente && (
          <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4 mb-5 text-sm">
            <div className="text-amber-200 font-bold">
              Este paciente ya tiene un informe del {informeExistente.fecha}: se muestran los valores guardados.
            </div>
            <div className="text-gray-400 text-xs mt-1">
              Puede completar lo que falta. Si cambia un valor ya registrado, se le pedirá el motivo y la corrección queda registrada.
            </div>
            {correccionesPrevias.length > 0 && (
              <details className="mt-2 text-xs text-gray-300">
                <summary className="cursor-pointer text-amber-300">{correccionesPrevias.length} corrección(es) registradas</summary>
                <ul className="mt-2 space-y-1">
                  {correccionesPrevias.map((c: any, i: number) => (
                    <li key={i}>
                      <b>{new Date(c.fecha).toLocaleString('es-BO')}</b> · {c.usuario} · {c.motivo}:{' '}
                      {c.cambios.map((x: any) => `${x.campo} ${x.antes} → ${x.despues}`).join('; ')}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* Precarga de control repetido: reutiliza el último informe del paciente */}
        {informePrevio && !informeExistente && (
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
          {/* Mismas columnas y nombres que la hoja dat del Excel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelBase} title="Letra de orden del paciente en el día (A, B, C…)">Emergencias</label>
              <input
                value={general.letra}
                onChange={(e) => setGen('letra', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2))}
                placeholder={letraSugerida}
                className={`${inputBase} text-center text-lg font-bold text-[#00bfa5] !placeholder-[#00bfa5]`}
              />
            </div>
            {[
              ['Paterno', pacienteData?.apellidoPaterno],
              ['Materno', pacienteData?.apellidoMaterno],
              ['Nombres', pacienteData?.nombres],
              ['Edad', pacienteData?.edad],
              ['Género', pacienteData?.genero],
              ['AVC', pacienteData?.codigoAsegurado],
              ['Benef.', pacienteData?.codigoBeneficiario],
            ].map(([rotulo, valor]) => (
              <div key={rotulo}>
                <label className={labelBase}>{rotulo === 'Paterno' && <User className="w-3 h-3" />}{rotulo}</label>
                <div className={`${inputBase} flex items-center text-gray-200 cursor-default min-h-[38px]`}>
                  {valor && valor !== '-' ? valor : '—'}
                </div>
              </div>
            ))}
            <div>
              <label className={labelBase}><DoorOpen className="w-3 h-3" /> Consultorio</label>
              <input value={general.consultorio} onChange={(e) => setGen('consultorio', e.target.value.toUpperCase())} placeholder="Ej: 5 o EMERGENCIA" className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><Stethoscope className="w-3 h-3" /> Médico</label>
              <input value={general.medicoDerivante} onChange={(e) => setGen('medicoDerivante', e.target.value.toUpperCase())} placeholder="Clave, ej: B123" className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><CalendarDays className="w-3 h-3" /> Fecha Solicit.</label>
              <input type="date" value={general.fechaSolicitud} onChange={(e) => setGen('fechaSolicitud', e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><CalendarDays className="w-3 h-3" /> Fecha Muestra</label>
              <input type="date" value={general.fechaMuestra} onChange={(e) => setGen('fechaMuestra', e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><CalendarDays className="w-3 h-3" /> Fecha Ex.</label>
              <input type="date" value={general.fechaExamen} onChange={(e) => setGen('fechaExamen', e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><Phone className="w-3 h-3" /> Teléfono</label>
              <input value={general.telefono} onChange={(e) => setGen('telefono', e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><FileText className="w-3 h-3" /> Diagnóstico</label>
              <input value={general.diagnostico} onChange={(e) => setGen('diagnostico', e.target.value.toUpperCase())} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}><FlaskConical className="w-3 h-3" /> Muestra</label>
              <input value={general.muestra} onChange={(e) => setGen('muestra', e.target.value.toUpperCase())} placeholder="Ej: SANGRE, ORINA" className={inputBase} />
            </div>
          </div>
        </div>

        {filtrado && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#00bfa5]/30 bg-[#00bfa5]/5 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00bfa5]">Exámenes programados:</span>
            {(nombresExamenes || soloExamenes || []).map((n) => (
              <span key={n} className="rounded-lg border border-[#2a403a] bg-[#050a09] px-2.5 py-1 text-xs font-semibold text-white">
                {n}
              </span>
            ))}
            <span className="text-xs text-gray-500">· solo se muestran los campos de estos exámenes</span>
          </div>
        )}

        {/* Tabs de categorías */}
        <div className="flex flex-wrap gap-1 border-b border-[#1f332d] mb-5">
          {categoriasVisibles.map((cat) => {
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
                  {llenos}/{totalCategoria(cat.id)}
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
                {filas.map((fila) => {
                  if ('grupo' in fila) {
                    return (
                      <tr key={`g-${fila.grupo}`} className="bg-[#00bfa5]/10 border-t border-[#1f332d]">
                        <td colSpan={5} className="px-4 py-2 text-[11px] font-bold tracking-widest text-[#00bfa5]">{fila.grupo}</td>
                      </tr>
                    );
                  }
                  const { p, excel } = fila;
                  const valor = valoresCat[p.key] ?? '';
                  const flag = calcularFlag(p, valor);
                  return (
                    <tr key={p.key} className="border-t border-[#1f332d] hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-white">{excel || p.label}</div>
                        {excel && <div className="text-[11px] text-gray-500">{p.label}</div>}
                      </td>
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

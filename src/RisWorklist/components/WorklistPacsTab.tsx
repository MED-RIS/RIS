import React, { useState, useEffect, useCallback } from 'react';
import { fetchMwlHealth, fetchPacsWorklist, retryMwlOrder, reconcileMwl } from '../risService';

/** Panel de Worklist: qué tiene el RIS agendado contra qué tiene el PACS realmente en su lista de trabajo. */

// ── Lectura de DICOM JSON ────────────────────────────────────────────────────
// El PACS responde en el formato DICOM JSON, donde cada campo es un tag hexadecimal.

/** Primer valor de un tag de nivel raíz. */
const tag = (ds: any, key: string): string => {
  const el = ds?.[key];
  if (!el?.Value?.length) return '';
  const v = el.Value[0];
  return typeof v === 'object' ? v.Alphabetic || '' : String(v);
};

/** Primer valor de un tag dentro de la Scheduled Procedure Step Sequence. */
const spsTag = (ds: any, key: string): string => {
  const item = ds?.['00400100']?.Value?.[0];
  return item ? tag(item, key) : '';
};

/** Fecha DICOM (YYYYMMDD) + hora (HHMMSS) a algo legible. */
const formatoDicom = (fecha: string, hora: string): string => {
  if (!fecha) return '-';
  const d = `${fecha.slice(6, 8)}/${fecha.slice(4, 6)}/${fecha.slice(0, 4)}`;
  if (!hora) return d;
  return `${d} ${hora.slice(0, 2)}:${hora.slice(2, 4)}`;
};

// ── Estados del cruce ────────────────────────────────────────────────────────

type EstadoCruce = 'OK' | 'FALTA_EN_PACS' | 'SOLO_EN_PACS';

const ESTILOS: Record<EstadoCruce, { etiqueta: string; clase: string; detalle: string }> = {
  OK: {
    etiqueta: '✓ SINCRONIZADO',
    clase: 'bg-green-900/40 text-green-300 border-green-600/40',
    detalle: 'La orden está en el RIS y el equipo la ve en su worklist.',
  },
  FALTA_EN_PACS: {
    etiqueta: '⚠ NO LLEGÓ AL EQUIPO',
    clase: 'bg-red-900/40 text-red-300 border-red-600/50',
    detalle: 'Está agendada en el RIS pero el equipo no la ve. El paciente no va a aparecer en la consola.',
  },
  SOLO_EN_PACS: {
    etiqueta: '◆ SOLO EN EL PACS',
    clase: 'bg-yellow-900/40 text-yellow-300 border-yellow-600/40',
    detalle: 'El equipo la ve pero no hay orden en el RIS. Puede ser una entrada cargada a mano o una orden borrada.',
  },
};

export default function WorklistPacsTab({ orders = [] }: any) {
  const [salud, setSalud] = useState<any>(null);
  const [entradasPacs, setEntradasPacs] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [filtroModalidad, setFiltroModalidad] = useState('');

  // Una worklist es sobre el trabajo que viene, no sobre el histórico.
  const [rango, setRango] = useState<'HOY' | 'DESDE_HOY' | 'TODAS'>('DESDE_HOY');
  const [reintentando, setReintentando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      // El estado se pide siempre; la worklist solo si el PACS responde, para no tapar el diagnóstico real con un segundo error de conexión.
      const estado = await fetchMwlHealth();
      setSalud(estado);

      if (estado?.archive?.ok) {
        const data = await fetchPacsWorklist(
          filtroModalidad ? { modality: filtroModalidad } : {}
        );
        setEntradasPacs(data.items || []);
      } else {
        setEntradasPacs([]);
      }
      setUltimaActualizacion(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [filtroModalidad]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const onReintentar = async (accessionNumber: string) => {
    setReintentando(accessionNumber);
    setAviso(null);
    try {
      await retryMwlOrder(accessionNumber);
      setAviso(`Orden ${accessionNumber} puesta en cola. Se envía en unos segundos.`);
      setTimeout(cargar, 4000);
    } catch (e: any) {
      setAviso(`No se pudo reintentar ${accessionNumber}: ${e.message}`);
    } finally {
      setReintentando(null);
    }
  };

  const onReconciliar = async () => {
    setAviso(null);
    try {
      const r = await reconcileMwl();
      setAviso(
        `Reconciliación: ${r.checked ?? 0} órdenes revisadas, ${r.requeued ?? 0} reencoladas.`
      );
      setTimeout(cargar, 4000);
    } catch (e: any) {
      setAviso(`No se pudo reconciliar: ${e.message}`);
    }
  };

  // ── El cruce ───────────────────────────────────────────────────────────────
  // Se unen las dos listas por accession number, que es el identificador que comparten el RIS y el PACS.
  const filas = React.useMemo(() => {
    const porAccession = new Map<string, any>();

    // Órdenes vivas del RIS. Las canceladas y terminadas no deberían estar en la worklist, así que no cuentan como faltantes.
    const activas = orders.filter((o: any) => ['SCHEDULED', 'ARRIVED'].includes(o.status));

    const inicioDeHoy = new Date();
    inicioDeHoy.setHours(0, 0, 0, 0);
    const finDeHoy = new Date(inicioDeHoy);
    finDeHoy.setDate(finDeHoy.getDate() + 1);

    const dentroDelRango = (fecha: any) => {
      if (rango === 'TODAS') return true;
      if (!fecha) return false;
      const d = new Date(fecha);
      if (rango === 'HOY') return d >= inicioDeHoy && d < finDeHoy;
      return d >= inicioDeHoy;
    };

    for (const o of activas) {
      if (filtroModalidad && o.modality !== filtroModalidad) continue;
      if (!dentroDelRango(o.scheduledDate)) continue;
      porAccession.set(o.accessionNumber, {
        accession: o.accessionNumber,
        paciente: `${o.patient?.lastName || ''} ${o.patient?.firstName || ''}`.trim() || '-',
        modalidad: o.modality || '-',
        equipo: o.stationAet || '-',
        programado: o.scheduledDate ? new Date(o.scheduledDate).toLocaleString('es-419') : '-',
        procedimiento: o.procedureDescription || '-',
        studyInstanceUid: o.studyInstanceUid || '',
        enRis: true,
        enPacs: false,
        mwlSyncStatus: o.mwlSyncStatus,
        mwlLastError: o.mwlLastError,
      });
    }

    // El Study Instance UID es el identificador confiable para cruzar: no tiene límite de longitud práctico y no lo recorta nadie.
    const porStudyUid = new Map<string, any>();
    for (const fila of porAccession.values()) {
      if (fila.studyInstanceUid) porStudyUid.set(fila.studyInstanceUid, fila);
    }

    for (const item of entradasPacs) {
      const accession = tag(item, '00080050');
      const studyUid = tag(item, '0020000D');
      const existente = porStudyUid.get(studyUid) || porAccession.get(accession);
      if (existente) {
        existente.enPacs = true;
        // Los datos del PACS mandan sobre los del RIS: es lo que ve el equipo.
        existente.equipo = spsTag(item, '00400001') || existente.equipo;
      } else {
        porAccession.set(accession, {
          accession,
          paciente: tag(item, '00100010').replace(/\^/g, ' ').trim() || '-',
          modalidad: spsTag(item, '00080060') || '-',
          equipo: spsTag(item, '00400001') || '-',
          programado: formatoDicom(spsTag(item, '00400002'), spsTag(item, '00400003')),
          procedimiento: spsTag(item, '00400007') || '-',
          enRis: false,
          enPacs: true,
        });
      }
    }

    const conEstado = [...porAccession.values()].map(f => ({
      ...f,
      estado: (f.enRis && f.enPacs
        ? 'OK'
        : f.enRis
          ? 'FALTA_EN_PACS'
          : 'SOLO_EN_PACS') as EstadoCruce,
    }));

    // Los problemas arriba: es lo que alguien necesita ver primero.
    const prioridad: Record<EstadoCruce, number> = {
      FALTA_EN_PACS: 0,
      SOLO_EN_PACS: 1,
      OK: 2,
    };
    return conEstado.sort(
      (a, b) => prioridad[a.estado] - prioridad[b.estado] || a.accession.localeCompare(b.accession)
    );
  }, [orders, entradasPacs, filtroModalidad, rango]);

  const problemas = filas.filter(f => f.estado === 'FALTA_EN_PACS').length;
  const pacsOk = salud?.archive?.ok;

  return (
    <div className="space-y-4">
      {/* ── Barra de estado ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div
          className={`rounded-lg border p-4 ${
            pacsOk ? 'bg-green-900/20 border-green-600/40' : 'bg-red-900/20 border-red-600/50'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
            Conexión con el PACS
          </div>
          <div className={`text-lg font-bold mt-1 ${pacsOk ? 'text-green-300' : 'text-red-300'}`}>
            {cargando && !salud ? 'Verificando…' : pacsOk ? 'Conectado' : 'Sin respuesta'}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 font-mono break-all">
            {salud?.archive?.mwlBase || '-'}
          </div>
        </div>

        <div className="rounded-lg border border-secondary-dark bg-primary-main p-4">
          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
            En la worklist
          </div>
          <div className="text-2xl font-bold text-primary-light mt-1">
            {pacsOk ? (salud?.archive?.count ?? '-') : '-'}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">estudios que ven los equipos</div>
        </div>

        <div className="rounded-lg border border-secondary-dark bg-primary-main p-4">
          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
            En cola de envío
          </div>
          <div className="text-2xl font-bold text-blue-300 mt-1">{salud?.queue?.pending ?? '-'}</div>
          <div className="text-[10px] text-gray-500 mt-1">se envían solas</div>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            problemas > 0 ? 'bg-red-900/20 border-red-600/50' : 'border-secondary-dark bg-primary-main'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
            Requieren atención
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${problemas > 0 ? 'text-red-300' : 'text-gray-500'}`}
          >
            {problemas}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">agendadas que el equipo no ve</div>
        </div>
      </div>

      {/* ── Controles ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 bg-primary-main rounded-lg border border-secondary-dark p-3">
        <select
          value={rango}
          onChange={e => setRango(e.target.value as any)}
          className="p-2 rounded bg-black border border-secondary-dark text-white text-sm outline-none focus:border-primary-light"
        >
          <option value="HOY">Solo hoy</option>
          <option value="DESDE_HOY">De hoy en adelante</option>
          <option value="TODAS">Todas las fechas</option>
        </select>

        <select
          value={filtroModalidad}
          onChange={e => setFiltroModalidad(e.target.value)}
          className="p-2 rounded bg-black border border-secondary-dark text-white text-sm outline-none focus:border-primary-light"
        >
          <option value="">Todas las modalidades</option>
          <option value="CT">CT — Tomografía</option>
          <option value="DX">DX — Rayos X</option>
          <option value="CR">CR — Rayos X (placa)</option>
          <option value="US">US — Ecografía</option>
        </select>

        <button
          onClick={cargar}
          disabled={cargando}
          className="px-4 py-2 bg-primary-dark border border-secondary-dark rounded text-sm hover:bg-primary-light hover:text-black transition-colors disabled:opacity-50"
        >
          {cargando ? 'Consultando…' : 'Actualizar'}
        </button>

        <button
          onClick={onReconciliar}
          title="Compara todas las órdenes agendadas contra el PACS y reenvía las que falten"
          className="px-4 py-2 bg-primary-dark border border-secondary-dark rounded text-sm hover:bg-primary-light hover:text-black transition-colors"
        >
          Reconciliar todo
        </button>

        {ultimaActualizacion && (
          <span className="text-[11px] text-gray-500 ml-auto">
            Actualizado {ultimaActualizacion.toLocaleTimeString('es-419')}
          </span>
        )}
      </div>

      {aviso && (
        <div className="rounded-lg border border-primary-light/40 bg-primary-light/10 p-3 text-sm text-primary-light">
          {aviso}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-600/50 bg-red-900/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!pacsOk && salud && (
        <div className="rounded-lg border border-red-600/50 bg-red-900/20 p-4 text-sm">
          <p className="text-red-300 font-bold mb-1">El PACS no está respondiendo.</p>
          <p className="text-gray-300">
            Las órdenes se siguen agendando normalmente y quedan en cola: se envían solas cuando el
            PACS vuelva. Lo que no va a pasar mientras tanto es que los equipos vean pacientes
            nuevos en su worklist.
          </p>
          {salud?.archive?.error && (
            <p className="text-[11px] text-gray-500 mt-2 font-mono break-all">
              {salud.archive.error}
            </p>
          )}
        </div>
      )}

      {/* ── Tabla del cruce ──────────────────────────────────────────── */}
      <div className="bg-primary-main rounded-lg border border-secondary-dark p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary-dark text-white">
              <tr>
                <th className="p-3 font-semibold">Accession #</th>
                <th className="p-3 font-semibold">Paciente</th>
                <th className="p-3 font-semibold">Modalidad</th>
                <th className="p-3 font-semibold">Equipo</th>
                <th className="p-3 font-semibold">Programado</th>
                <th className="p-3 font-semibold text-center">RIS</th>
                <th className="p-3 font-semibold text-center">PACS</th>
                <th className="p-3 font-semibold">Estado</th>
                <th className="p-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-dark">
              {cargando && filas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-primary-light">
                    Consultando el PACS…
                  </td>
                </tr>
              ) : filas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    No hay órdenes agendadas ni entradas en la worklist.
                  </td>
                </tr>
              ) : (
                filas.map(f => {
                  const estilo = ESTILOS[f.estado];
                  return (
                    <tr key={f.accession} className="hover:bg-primary-dark transition-colors">
                      <td className="p-3 font-medium text-primary-light">{f.accession}</td>
                      <td className="p-3">{f.paciente}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-secondary-dark rounded text-xs font-bold">
                          {f.modalidad}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-300">{f.equipo}</td>
                      <td className="p-3 text-gray-300 text-xs">{f.programado}</td>
                      <td className="p-3 text-center">
                        {f.enRis ? (
                          <span className="text-green-400">✓</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {f.enPacs ? (
                          <span className="text-green-400">✓</span>
                        ) : (
                          <span className="text-red-400">✗</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold border ${estilo.clase}`}
                          title={f.mwlLastError ? `${estilo.detalle}\n\n${f.mwlLastError}` : estilo.detalle}
                        >
                          {estilo.etiqueta}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {f.estado === 'FALTA_EN_PACS' && (
                          <button
                            onClick={() => onReintentar(f.accession)}
                            disabled={reintentando === f.accession}
                            className="px-3 py-1 bg-primary-dark border border-secondary-dark rounded text-xs hover:bg-primary-light hover:text-black transition-colors disabled:opacity-50"
                          >
                            {reintentando === f.accession ? 'Enviando…' : 'Reenviar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
          La columna <b>RIS</b> indica si la orden existe agendada en el sistema. La columna{' '}
          <b>PACS</b> indica si el equipo la ve en su lista de trabajo. Cuando una orden aparece en
          el RIS pero no en el PACS, el paciente no va a figurar en la consola del equipo.
        </p>
      </div>
    </div>
  );
}

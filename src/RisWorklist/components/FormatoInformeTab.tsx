import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, FileSignature, ImagePlus, Palette, PenLine, RotateCcw, Save, Trash2, Type, LayoutTemplate, Eye, X, Undo2, Eraser, Printer } from 'lucide-react';
import { api } from '../../Users/user';
import { getAuthHeaders, tiposUsuario } from '../../utils/token';

// Formato del informe radiológico: el administrador elige colores, letra, membrete, pie,
// qué datos del paciente se imprimen y el título por modalidad, y carga la firma y matrícula
// de cada médico. La vista previa la arma el mismo servidor que genera el PDF/Word real.

type Formato = {
  colorAcento: string; colorTitulo: string; fuenteCuerpo: 'serif' | 'sans'; tamanoLetra: number;
  alineacionMembrete: 'izquierda' | 'centro'; subtitulo: string; direccion: string; telefono: string; correo: string; web: string;
  mostrarLogoSecundario: boolean; pie: string; textoCargo: string; mostrarFirmaImagen: boolean; mostrarSelloElectronico: boolean;
  campos: Record<string, boolean>; titulos: Record<string, string>;
  logoIzq: string; logoCentro: string; logoDer: string; mostrarNombreInstitucion: boolean; lineasMembrete: boolean;
  estiloDatos: 'tabla' | 'lista'; etiquetas: Record<string, string>; marcaAgua: string; marcaAguaOpacidad: number;
  columnaLateral: string; conclusionDestacada: boolean;
};
const ETIQUETAS: [string, string][] = [
  ['paciente', 'Paciente'], ['accession', 'N.º de orden'], ['fechaEstudio', 'Fecha del estudio'], ['solicitante', 'Médico solicitante'],
  ['documento', 'C.I. / ID'], ['edadSexo', 'Edad / Sexo'], ['modalidad', 'Modalidad'], ['medico', 'Médico informante'], ['estudio', 'Estudio'],
];
// Diseños de partida: se aplican sobre lo que ya está y después se ajusta a gusto
const DISENOS: { nombre: string; detalle: string; cambios: Partial<Formato> }[] = [
  {
    nombre: 'Clásico',
    detalle: 'Membrete con líneas de color y datos en recuadro',
    cambios: { estiloDatos: 'tabla', lineasMembrete: true, conclusionDestacada: false, alineacionMembrete: 'izquierda', fuenteCuerpo: 'serif' },
  },
  {
    nombre: 'Membrete con logos',
    detalle: 'Logos arriba, datos en lista «PACIENTE : …» y conclusión en negrita',
    cambios: { estiloDatos: 'lista', lineasMembrete: false, conclusionDestacada: true, alineacionMembrete: 'centro', fuenteCuerpo: 'sans' },
  },
];
type Medico = { _id: string; nombre: string; role: string; matricula: string; especialidad: string; firma: string | null };

const PALETAS: { nombre: string; acento: string; titulo: string }[] = [
  { nombre: 'Turquesa', acento: '#008a8a', titulo: '#00585c' },
  { nombre: 'Azul institucional', acento: '#1d4ed8', titulo: '#1e3a8a' },
  { nombre: 'Verde salud', acento: '#16a34a', titulo: '#14532d' },
  { nombre: 'Vino', acento: '#be123c', titulo: '#881337' },
  { nombre: 'Grafito', acento: '#475569', titulo: '#0f172a' },
];
const CAMPOS: [string, string][] = [
  ['documento', 'C.I. / ID'], ['edadSexo', 'Edad / Sexo'], ['fechaEstudio', 'Fecha del estudio'], ['solicitante', 'Médico solicitante'],
  ['modalidad', 'Modalidad'], ['accession', 'N.º de orden'], ['medico', 'Médico informante'],
];
const ROLES_MEDICOS = /radiolog|dictado|medico|traumato|pediatr|emergenc|admin/i;

const pedir = async (ruta: string, init: RequestInit = {}) => {
  const r = await fetch(`${api}/api/ris${ruta}`, { ...init, headers: getAuthHeaders() as HeadersInit });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Error ${r.status}`);
  return r;
};

const leerImagen = (archivo: File, maxAncho = 600): Promise<string> =>
  new Promise((ok, mal) => {
    if (!/^image\/(png|jpeg|webp)$/.test(archivo.type)) return mal(new Error('Use una imagen PNG o JPG'));
    const lector = new FileReader();
    lector.onload = () => {
      // Se reduce a 600 px de ancho para que el informe no pese
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, maxAncho / img.width);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        ok(c.toDataURL('image/png'));
      };
      img.onerror = () => mal(new Error('No se pudo leer la imagen'));
      img.src = String(lector.result);
    };
    lector.readAsDataURL(archivo);
  });

export default function FormatoInformeTab() {
  const esAdmin = tiposUsuario() === 'admin';
  const [formato, setFormato] = useState<Formato | null>(null);
  const [guardado, setGuardado] = useState<string>('');
  const [base, setBase] = useState<Formato | null>(null);
  const [titulosBase, setTitulosBase] = useState<Record<string, string>>({});
  const [info, setInfo] = useState({ institucion: '', tieneLogo: false, tieneLogo2: false });
  const [html, setHtml] = useState('');
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [medicoVista, setMedicoVista] = useState('');
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [verTodos, setVerTodos] = useState(true);
  const temporizador = useRef<any>(null);
  const vista = useRef<HTMLIFrameElement>(null);

  const avisar = (tipo: 'ok' | 'error', texto: string) => { setAviso({ tipo, texto }); setTimeout(() => setAviso(null), 3500); };

  useEffect(() => {
    (async () => {
      try {
        const d = await (await pedir('/formato-informe')).json();
        setFormato(d.formato); setGuardado(JSON.stringify(d.formato)); setBase(d.base); setTitulosBase(d.titulosBase || {});
        setInfo({ institucion: d.institucion, tieneLogo: d.tieneLogo, tieneLogo2: d.tieneLogo2 });
        if (esAdmin) setMedicos(await (await pedir('/medicos-firma')).json());
      } catch (e: any) {
        avisar('error', e.message);
      }
    })();
  }, [esAdmin]);

  // Vista previa: se pide al servidor medio segundo después del último cambio
  useEffect(() => {
    if (!formato) return;
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(async () => {
      try {
        const r = await pedir('/formato-informe/vista-previa', { method: 'POST', body: JSON.stringify({ formato, medicoId: medicoVista || undefined }) });
        setHtml(await r.text());
      } catch (e: any) {
        avisar('error', e.message);
      }
    }, 450);
    return () => clearTimeout(temporizador.current);
  }, [formato, medicoVista]);

  const cambiado = useMemo(() => formato && JSON.stringify(formato) !== guardado, [formato, guardado]);
  const nCambios = useMemo(() => {
    if (!formato || !guardado) return 0;
    const g = JSON.parse(guardado);
    return Object.keys(formato).filter((k) => JSON.stringify((formato as any)[k]) !== JSON.stringify(g[k])).length;
  }, [formato, guardado]);
  const descartar = () => guardado && setFormato(JSON.parse(guardado));
  const set = (k: keyof Formato, v: any) => setFormato((f) => (f ? { ...f, [k]: v } : f));

  const guardar = async () => {
    if (!formato) return;
    setGuardando(true);
    try {
      const d = await (await pedir('/formato-informe', { method: 'PUT', body: JSON.stringify({ formato }) })).json();
      setFormato(d.formato); setGuardado(JSON.stringify(d.formato));
      avisar('ok', 'Formato guardado: los próximos PDF y Word ya salen así');
    } catch (e: any) {
      avisar('error', e.message);
    } finally {
      setGuardando(false);
    }
  };

  const guardarMedico = async (m: Medico, cambios: Partial<Medico> & { firma_base64?: string | null }) => {
    try {
      await pedir(`/medicos-firma/${m._id}`, { method: 'PUT', body: JSON.stringify(cambios) });
      setMedicos((l) => l.map((x) => (x._id === m._id ? { ...x, ...cambios, firma: cambios.firma_base64 !== undefined ? cambios.firma_base64 : x.firma } : x)));
      if (medicoVista === m._id) setFormato((f) => (f ? { ...f } : f)); // refresca la vista previa
      avisar('ok', `Datos de ${m.nombre} guardados`);
    } catch (e: any) {
      avisar('error', e.message);
    }
  };

  if (!formato || !base) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">{aviso?.texto || 'Cargando formato del informe…'}</div>;
  }

  const medicosVisibles = verTodos ? medicos : medicos.filter((m) => ROLES_MEDICOS.test(m.role) || m.firma || m.matricula);
  // Casilla de texto: muestra el valor real que se imprime, con botones para borrarlo
  // y para volver al valor de fábrica (si lo tiene)
  const texto = (k: keyof Formato, ayuda: string) => {
    const v = String(formato[k] ?? '');
    const deFabrica = String((base as any)[k] ?? '');
    return (
      <CajaTexto valor={v} ayuda={ayuda} deFabrica={deFabrica} onCambiar={(x) => set(k, x)} clase={entrada} />
    );
  };
  const tituloDe = (mod: string) => (formato.titulos[mod] || '').trim() || titulosBase[mod] || '';
  const cambiarTitulo = (mod: string, v: string) => {
    const t = { ...formato.titulos };
    if (!v.trim() || v.trim() === titulosBase[mod]) delete t[mod];
    else t[mod] = v;
    set('titulos', t);
  };
  const entrada = 'w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-light/60';

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Formato del informe radiológico</h2>
          <p className="text-sm text-gray-400 mt-0.5">Así salen el PDF y el Word de los informes firmados en el visor y en el RIS · {info.institucion}</p>
        </div>
        <div className="flex gap-2 items-center">
          {aviso && (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${aviso.tipo === 'ok' ? 'bg-emerald-600/20 text-emerald-200' : 'bg-red-600/20 text-red-200'}`}>{aviso.texto}</span>
          )}
          {cambiado && (
            <button
              onClick={descartar}
              className="px-3 py-2 rounded-lg bg-black/40 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-bold flex items-center gap-1.5"
              title="Volver a lo último que se guardó"
            >
              <Undo2 className="w-3.5 h-3.5" /> Descartar {nCambios} {nCambios === 1 ? 'cambio' : 'cambios'}
            </button>
          )}
          <button
            onClick={() => confirm('¿Volver todo el formato al diseño original? Se borran dirección, teléfono, pie, colores y títulos personalizados. No se guarda hasta presionar «Guardar formato».') && setFormato({ ...base, campos: { ...base.campos }, titulos: {} })}
            disabled={!esAdmin}
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
            title="Volver al diseño original (no se guarda hasta presionar Guardar)"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restablecer todo
          </button>
          <button
            onClick={guardar}
            disabled={!esAdmin || !cambiado || guardando}
            className="px-4 py-2 rounded-lg bg-primary-main hover:bg-primary-dark text-white text-sm font-bold flex items-center gap-1.5 shadow-lg disabled:opacity-40"
          >
            {cambiado ? <Save className="w-4 h-4" /> : <Check className="w-4 h-4" />} {guardando ? 'Guardando…' : cambiado ? 'Guardar formato' : 'Guardado'}
          </button>
        </div>
      </div>
      {!esAdmin && <p className="text-xs text-amber-300">Solo el administrador puede cambiar el formato. Usted puede ver cómo queda.</p>}

      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-5 items-start">
        <fieldset disabled={!esAdmin} className="space-y-5 min-w-0">
          <Seccion icono={<LayoutTemplate />} titulo="Diseño de la hoja">
            <div className="grid sm:grid-cols-2 gap-2">
              {DISENOS.map((d) => {
                const activo = Object.entries(d.cambios).every(([k, v]) => (formato as any)[k] === v);
                return (
                  <button
                    key={d.nombre}
                    type="button"
                    onClick={() => setFormato({ ...formato, ...d.cambios })}
                    className={`text-left rounded-xl border px-3 py-2 ${activo ? 'border-primary-light/60 bg-primary-main/25' : 'border-white/10 bg-black/40 hover:border-white/30'}`}
                  >
                    <div className="text-sm font-bold text-white">{activo ? '✓ ' : ''}{d.nombre}</div>
                    <div className="text-[11px] text-gray-400">{d.detalle}</div>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              <Interruptor valor={formato.lineasMembrete} onChange={(v) => set('lineasMembrete', v)} texto="Líneas de color bajo el membrete" />
              <Interruptor valor={formato.conclusionDestacada} onChange={(v) => set('conclusionDestacada', v)} texto="Conclusión en negrita y mayúsculas" />
            </div>
          </Seccion>

          <Seccion icono={<LayoutTemplate />} titulo="Membrete">
            <div className="grid grid-cols-3 gap-2">
              <CajaImagen etiqueta="Logo izquierdo" valor={formato.logoIzq} ayuda={info.tieneLogo ? 'Usa el de la institución' : 'Sin logo'} onCambiar={(v) => set('logoIzq', v)} />
              <CajaImagen etiqueta="Logo central (grande)" valor={formato.logoCentro} ayuda="Sin logo central" ancho={900} onCambiar={(v) => set('logoCentro', v)} />
              <CajaImagen etiqueta="Logo derecho" valor={formato.logoDer} ayuda={info.tieneLogo2 && formato.mostrarLogoSecundario ? 'Usa el secundario' : 'Sin logo'} onCambiar={(v) => set('logoDer', v)} />
            </div>
            <Interruptor valor={formato.mostrarNombreInstitucion} onChange={(v) => set('mostrarNombreInstitucion', v)} texto="Escribir el nombre de la institución (apáguelo si el logo central ya lo trae)" />
            <Campo etiqueta="Subtítulo o lema bajo el nombre">
              {texto('subtitulo', 'Sin subtítulo')}
            </Campo>
            <div className="grid sm:grid-cols-2 gap-3">
              <Campo etiqueta="Dirección">{texto('direccion', 'Sin dirección (escriba la del hospital)')}</Campo>
              <Campo etiqueta="Teléfono">{texto('telefono', 'Sin teléfono')}</Campo>
              <Campo etiqueta="Correo">{texto('correo', 'Sin correo')}</Campo>
              <Campo etiqueta="Página web">{texto('web', 'Sin página web')}</Campo>
            </div>
            <div className="flex flex-wrap gap-2">
              <Opcion activo={formato.alineacionMembrete === 'izquierda'} onClick={() => set('alineacionMembrete', 'izquierda')}>Texto a la izquierda</Opcion>
              <Opcion activo={formato.alineacionMembrete === 'centro'} onClick={() => set('alineacionMembrete', 'centro')}>Texto centrado</Opcion>
              <Interruptor valor={formato.mostrarLogoSecundario} onChange={(v) => set('mostrarLogoSecundario', v)} texto={`Logo secundario a la derecha${info.tieneLogo2 ? '' : ' (no hay cargado)'}`} />
            </div>
            {!info.tieneLogo && <p className="text-[11px] text-gray-500">Los logos se cargan en la configuración de la institución del visor.</p>}
          </Seccion>

          <Seccion icono={<Palette />} titulo="Colores y letra">
            <div className="flex flex-wrap gap-2">
              {PALETAS.map((p) => (
                <button
                  key={p.nombre}
                  type="button"
                  onClick={() => setFormato({ ...formato, colorAcento: p.acento, colorTitulo: p.titulo })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${formato.colorAcento === p.acento && formato.colorTitulo === p.titulo ? 'border-white/60 bg-white/10 text-white' : 'border-white/10 bg-black/40 text-gray-300 hover:text-white'}`}
                >
                  <span className="flex"><i className="w-3.5 h-3.5 rounded-full inline-block" style={{ background: p.acento }} /><i className="w-3.5 h-3.5 rounded-full inline-block -ml-1 ring-1 ring-black/40" style={{ background: p.titulo }} /></span>
                  {p.nombre}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Campo etiqueta="Color de líneas y bordes">
                <div className="flex gap-2 items-center"><input type="color" value={formato.colorAcento} onChange={(e) => set('colorAcento', e.target.value)} className="w-10 h-9 rounded bg-transparent cursor-pointer" /><span className="text-xs text-gray-400 font-mono">{formato.colorAcento}</span></div>
              </Campo>
              <Campo etiqueta="Color de títulos">
                <div className="flex gap-2 items-center"><input type="color" value={formato.colorTitulo} onChange={(e) => set('colorTitulo', e.target.value)} className="w-10 h-9 rounded bg-transparent cursor-pointer" /><span className="text-xs text-gray-400 font-mono">{formato.colorTitulo}</span></div>
              </Campo>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Type className="w-4 h-4 text-gray-500" />
              <Opcion activo={formato.fuenteCuerpo === 'serif'} onClick={() => set('fuenteCuerpo', 'serif')}><span style={{ fontFamily: 'Georgia, serif' }}>Clásica (Georgia)</span></Opcion>
              <Opcion activo={formato.fuenteCuerpo === 'sans'} onClick={() => set('fuenteCuerpo', 'sans')}><span style={{ fontFamily: 'Arial, sans-serif' }}>Moderna (Arial)</span></Opcion>
              <span className="text-xs text-gray-400 ml-3">Tamaño</span>
              {[10, 11, 12, 13].map((n) => (
                <Opcion key={n} activo={formato.tamanoLetra === n} onClick={() => set('tamanoLetra', n)}>{n} pt</Opcion>
              ))}
            </div>
          </Seccion>

          <Seccion icono={<Eye />} titulo="Datos del paciente que se imprimen">
            <div className="flex flex-wrap gap-2">
              <Opcion activo={formato.estiloDatos !== 'lista'} onClick={() => set('estiloDatos', 'tabla')}>En recuadro</Opcion>
              <Opcion activo={formato.estiloDatos === 'lista'} onClick={() => set('estiloDatos', 'lista')}>En lista (PACIENTE : …)</Opcion>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 bg-white/5 text-gray-400">Paciente (siempre)</span>
              {CAMPOS.map(([k, t]) => (
                <Opcion key={k} activo={formato.campos[k] !== false} onClick={() => set('campos', { ...formato.campos, [k]: formato.campos[k] === false })}>
                  {formato.campos[k] !== false ? '✓ ' : ''}{t}
                </Opcion>
              ))}
            </div>
            <details className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold text-gray-300">Cambiar los nombres de los datos (p. ej. «N.º de orden» → «Código»)</summary>
              <div className="grid sm:grid-cols-3 gap-2 mt-3">
                {ETIQUETAS.map(([k, t]) => (
                  <Campo key={k} etiqueta={t}>
                    <CajaTexto
                      valor={formato.etiquetas[k] || t}
                      ayuda={t}
                      deFabrica={t}
                      clase={entrada}
                      onCambiar={(v) => {
                        const e = { ...formato.etiquetas };
                        if (!v.trim() || v.trim() === t) delete e[k];
                        else e[k] = v;
                        set('etiquetas', e);
                      }}
                    />
                  </Campo>
                ))}
              </div>
            </details>
          </Seccion>

          <Seccion icono={<ImagePlus />} titulo="Fondo y columna lateral">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <CajaImagen etiqueta="Marca de agua (imagen tenue de fondo)" valor={formato.marcaAgua} ayuda="Sin marca de agua" ancho={900} onCambiar={(v) => set('marcaAgua', v)} />
                {formato.marcaAgua && (
                  <label className="flex items-center gap-2 text-xs text-gray-400">
                    Intensidad
                    <input type="range" min={0.02} max={0.3} step={0.01} value={formato.marcaAguaOpacidad} onChange={(e) => set('marcaAguaOpacidad', Number(e.target.value))} className="flex-1" />
                    {Math.round(formato.marcaAguaOpacidad * 100)}%
                  </label>
                )}
              </div>
              <CajaImagen etiqueta="Columna lateral izquierda (servicios, fotos)" valor={formato.columnaLateral} ayuda="Sin columna lateral" ancho={400} alto onCambiar={(v) => set('columnaLateral', v)} />
            </div>
            <p className="text-[11px] text-gray-500">La marca de agua se ve en el PDF impreso; en el Word se omite.</p>
          </Seccion>

          <Seccion icono={<PenLine />} titulo="Título del informe por modalidad">
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(titulosBase).map(([mod, t]) => (
                <Campo key={mod} etiqueta={`${mod}${formato.titulos[mod] ? ' · personalizado' : ''}`}>
                  <div className="flex gap-1.5">
                    <input className={entrada} value={tituloDe(mod)} onChange={(e) => cambiarTitulo(mod, e.target.value)} />
                    {formato.titulos[mod] && (
                      <button type="button" onClick={() => cambiarTitulo(mod, '')} className="px-2 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-white" title={`Volver a «${t}»`}>
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </Campo>
              ))}
            </div>
          </Seccion>

          <Seccion icono={<FileSignature />} titulo="Firma y pie de página">
            <div className="grid sm:grid-cols-2 gap-3">
              <Campo etiqueta="Cargo bajo el nombre (si el médico no tiene especialidad)">
                {texto('textoCargo', 'Sin cargo')}
              </Campo>
            </div>
            <Campo etiqueta="Pie de página (puede tener varias líneas: sucursales, teléfonos, correo)">
              <div className="flex gap-1.5">
                <textarea
                  className={`${entrada} min-h-[84px] font-mono text-xs`}
                  value={formato.pie}
                  placeholder="Sin pie de página"
                  onChange={(e) => set('pie', e.target.value)}
                />
                {formato.pie && (
                  <button type="button" onClick={() => set('pie', '')} className="px-2 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-red-300 self-start py-2" title="Borrar el pie">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Campo>
            <div className="flex flex-wrap gap-2">
              <Interruptor valor={formato.mostrarFirmaImagen} onChange={(v) => set('mostrarFirmaImagen', v)} texto="Imprimir la firma escaneada del médico" />
              <Interruptor valor={formato.mostrarSelloElectronico} onChange={(v) => set('mostrarSelloElectronico', v)} texto="Sello «Firmado electrónicamente»" />
            </div>
          </Seccion>
        </fieldset>

        <div className="xl:sticky xl:top-4 space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">Vista previa <span className="font-normal text-gray-500">· paciente e informe de ejemplo</span></h3>
            <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => vista.current?.contentWindow?.print()}
              disabled={!html}
              className="px-3 py-1.5 rounded-lg bg-primary-main hover:bg-primary-dark text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
              title="Imprimir o guardar como PDF la vista previa"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>
            {esAdmin && (
              <select value={medicoVista} onChange={(e) => setMedicoVista(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-200 max-w-[16rem]">
                <option value="">Firma de ejemplo</option>
                {medicos.filter((m) => m.firma || m.matricula).map((m) => <option key={m._id} value={m._id}>Firma de {m.nombre}</option>)}
              </select>
            )}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white shadow-2xl">
            <iframe ref={vista} title="Vista previa del informe" srcDoc={html} className="w-full bg-white" style={{ height: 'min(1060px, 82vh)' }} />
          </div>
        </div>
      </div>

      {esAdmin && (
        <Seccion icono={<FileSignature />} titulo="Firmas y matrícula de los médicos">
          <p className="text-xs text-gray-400 -mt-1">
            La firma escaneada (PNG con fondo transparente, o foto de la firma sobre papel blanco) aparece sobre la línea de firma de los informes de ese médico.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/10">
                  <th className="py-2 pr-3">Médico</th><th className="py-2 pr-3">Especialidad</th><th className="py-2 pr-3">Matrícula</th><th className="py-2 pr-3">Firma</th><th className="py-2 pr-1 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {medicosVisibles.map((m) => <FilaMedico key={m._id} m={m} entrada={entrada} onGuardar={guardarMedico} onVer={() => setMedicoVista(m._id)} />)}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => setVerTodos(!verTodos)} className="text-xs text-primary-light hover:underline">
            {verTodos ? 'Mostrar solo médicos' : `Mostrar todos los usuarios (${medicos.length})`}
          </button>
        </Seccion>
      )}
    </div>
  );
}

function FilaMedico({ m, entrada, onGuardar, onVer }: { m: Medico; entrada: string; onGuardar: (m: Medico, c: any) => void; onVer: () => void }) {
  const [esp, setEsp] = useState(m.especialidad);
  const [mat, setMat] = useState(m.matricula);
  const archivo = useRef<HTMLInputElement>(null);
  const cambiado = esp !== m.especialidad || mat !== m.matricula;
  useEffect(() => { setEsp(m.especialidad); setMat(m.matricula); }, [m.especialidad, m.matricula]);
  const tieneDatos = Boolean(m.firma || m.matricula || m.especialidad);
  return (
    <tr className="border-b border-white/5 align-middle">
      <td className="py-2.5 pr-3"><div className="text-white font-semibold">{m.nombre}</div><div className="text-[11px] text-gray-500">{m.role}</div></td>
      <td className="py-2.5 pr-3 min-w-[12rem]"><input className={entrada} value={esp} onChange={(e) => setEsp(e.target.value)} placeholder="Sin especialidad" /></td>
      <td className="py-2.5 pr-3 min-w-[8rem]"><input className={entrada} value={mat} onChange={(e) => setMat(e.target.value)} placeholder="Sin matrícula" /></td>
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2">
          {m.firma ? (
            <button type="button" onClick={onVer} className="bg-white rounded-md px-2 py-1 h-10 w-28 flex items-center justify-center" title="Ver en la vista previa">
              <img src={m.firma} alt="" className="max-h-8 max-w-full" />
            </button>
          ) : (
            <span className="text-xs text-gray-500 w-28">Sin firma</span>
          )}
          <input
            ref={archivo}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              try { onGuardar(m, { firma_base64: await leerImagen(f) }); } catch (err: any) { alert(err.message); }
            }}
          />
          <button type="button" onClick={() => archivo.current?.click()} className="p-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white" title="Cargar firma">
            <ImagePlus className="w-4 h-4" />
          </button>
          {m.firma && (
            <button type="button" onClick={() => confirm(`¿Eliminar la firma de ${m.nombre}? Sus informes saldrán sin firma escaneada.`) && onGuardar(m, { firma_base64: null })} className="p-2 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-red-300" title="Eliminar firma">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
      <td className="py-2.5 pr-1 whitespace-nowrap text-right">
        {cambiado ? (
          <div className="inline-flex gap-1.5">
            <button type="button" onClick={() => onGuardar(m, { especialidad: esp, matricula: mat })} className="px-3 py-2 rounded-lg bg-primary-main text-white text-xs font-bold flex items-center gap-1" title="Guardar los cambios de este médico">
              <Save className="w-3.5 h-3.5" /> Actualizar
            </button>
            <button type="button" onClick={() => { setEsp(m.especialidad); setMat(m.matricula); }} className="p-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white" title="Deshacer">
              <Undo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : tieneDatos ? (
          <button
            type="button"
            onClick={() => confirm(`¿Eliminar firma, matrícula y especialidad de ${m.nombre}? El usuario no se borra.`) && onGuardar(m, { firma_base64: null, matricula: '', especialidad: '' })}
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-red-300 text-xs font-bold inline-flex items-center gap-1"
            title="Eliminar los datos de firma de este médico"
          >
            <Eraser className="w-3.5 h-3.5" /> Eliminar datos
          </button>
        ) : (
          <span className="text-[11px] text-gray-600">Sin datos</span>
        )}
      </td>
    </tr>
  );
}

function CajaImagen({ etiqueta, valor, ayuda, onCambiar, ancho = 600, alto = false }: { etiqueta: string; valor: string; ayuda: string; onCambiar: (v: string) => void; ancho?: number; alto?: boolean }) {
  const archivo = useRef<HTMLInputElement>(null);
  return (
    <div>
      <span className="block text-[11px] font-semibold text-gray-400 mb-1">{etiqueta}</span>
      <div className={`rounded-lg border border-dashed border-white/15 bg-white/95 flex items-center justify-center overflow-hidden ${alto ? 'h-40' : 'h-20'}`}>
        {valor ? <img src={valor} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-[11px] text-gray-500 px-2 text-center">{ayuda}</span>}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        <input
          ref={archivo}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            try { onCambiar(await leerImagen(f, ancho)); } catch (err: any) { alert(err.message); }
          }}
        />
        <button type="button" onClick={() => archivo.current?.click()} className="flex-1 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-gray-300 hover:text-white text-[11px] font-semibold">
          {valor ? 'Cambiar' : 'Cargar'}
        </button>
        {valor && (
          <button type="button" onClick={() => onCambiar('')} className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-red-300" title="Quitar">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function CajaTexto({ valor, ayuda, deFabrica, onCambiar, clase }: { valor: string; ayuda: string; deFabrica: string; onCambiar: (v: string) => void; clase: string }) {
  return (
    <div className="flex gap-1.5">
      <input className={clase} value={valor} placeholder={ayuda} onChange={(e) => onCambiar(e.target.value)} />
      {valor && (
        <button type="button" onClick={() => onCambiar('')} className="px-2 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-red-300" title="Borrar (no se imprimirá)">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {deFabrica && valor !== deFabrica && (
        <button type="button" onClick={() => onCambiar(deFabrica)} className="px-2 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-white" title={`Volver a «${deFabrica}»`}>
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function Seccion({ icono, titulo, children }: { icono: React.ReactElement; titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-plom-main border border-white/10 rounded-2xl p-4 space-y-3">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <span className="text-primary-light">{React.cloneElement(icono, { className: 'w-4 h-4' } as any)}</span>{titulo}
      </h3>
      {children}
    </div>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-gray-400 mb-1">{etiqueta}</span>
      {children}
    </label>
  );
}

function Opcion({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activo ? 'bg-primary-main border-primary-light/60 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'}`}>
      {children}
    </button>
  );
}

function Interruptor({ valor, onChange, texto }: { valor: boolean; onChange: (v: boolean) => void; texto: string }) {
  return (
    <button type="button" onClick={() => onChange(!valor)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-black/40 text-gray-300 hover:text-white">
      <span className={`w-7 h-4 rounded-full relative transition-colors ${valor ? 'bg-primary-main' : 'bg-gray-600'}`}>
        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${valor ? 'left-3.5' : 'left-0.5'}`} />
      </span>
      {texto}
    </button>
  );
}

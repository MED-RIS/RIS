// Informe de resultados con el formato del Hospital Municipal Modelo Corea (SUS):
// "Reporte General Consolidado" (Hemograma, Diferencial, Coagulograma, Complementarios,
// Comentario | Química sanguínea, Serología y Widal) y una hoja aparte para el Examen
// General de Orina, con las firmas de toma de muestra, hematología y bioquímica.
// Lee los valores donde los guarda el editor de laboratorio (catálogo común con la CNS).
import { CATEGORIAS_LAB } from '../laboratorio/catalogoLaboratorio';
import { SEDE } from '../../config/sede';

const esc = (s: any) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
const lleno = (v: any) => v !== undefined && v !== null && String(v).trim() !== '';

// Valor de un parámetro según dónde lo guarda el editor (plano o en su bolsa)
const valorDe = (datos: any, catId: string, key: string) => {
  const cat = CATEGORIAS_LAB.find((c) => c.id === catId);
  const p = cat?.catalogo.find((x) => x.key === key);
  const mode = p?.modeOverride || cat?.storage.mode;
  const bag = p?.bagOverride || cat?.storage.bag;
  return mode === 'flat' ? datos?.[key] : datos?.[bag as string]?.[key] ?? datos?.[key];
};

type Fila = { cat: string; k: string; t: string; u?: string };

const HEMOGRAMA: Fila[] = [
  { cat: 'hematologia', k: 'globulos_rojos', t: 'Glóbulos Rojos', u: 'mm3' },
  { cat: 'hematologia', k: 'globulos_blancos', t: 'Glóbulos Blancos', u: 'mm3' },
  { cat: 'hematologia', k: 'hto', t: 'Hematocrito', u: '%' },
  { cat: 'hematologia', k: 'hb', t: 'Hemoglobina', u: 'g%' },
  { cat: 'hematologia', k: 'ves_1_hora', t: 'V.E.S. 1 hora', u: 'mm/hr' },
  { cat: 'hematologia', k: 'plaquetas', t: 'Plaquetas', u: 'mm3' },
];
const DIFERENCIAL: Fila[] = [
  { cat: 'hematologia', k: 'cay', t: 'Cayados', u: '0 - 4%' },
  { cat: 'hematologia', k: 'seg', t: 'Segmentados', u: '55-65%' },
  { cat: 'hematologia', k: 'eosi', t: 'Eosinófilos', u: '0 - 4%' },
  { cat: 'hematologia', k: 'baso', t: 'Basófilos', u: '0 - 1%' },
  { cat: 'hematologia', k: 'linf', t: 'Linfocitos', u: '25-39%' },
  { cat: 'hematologia', k: 'mon', t: 'Monocitos', u: '2 - 10%' },
];
const COAGULOGRAMA: Fila[] = [
  { cat: 'hematologia', k: 't_coagulacion_min', t: 'T. Coagulación', u: 'min' },
  { cat: 'hematologia', k: 't_sangria_min', t: 'T. Sangría', u: 'min' },
  { cat: 'hematologia', k: 'tiempo_protrombina', t: 'T. Protrombina', u: 'seg' },
  { cat: 'hematologia', k: 'actividad_protrombina', t: 'Actividad', u: '%' },
  { cat: 'hematologia', k: 'inr', t: 'INR', u: '' },
  { cat: 'hematologia', k: 'ttpa', t: 'TPTA (APTT)', u: 'V.R.: 20 - 35 seg' },
];
const COMPLEMENTARIOS: Fila[] = [
  { cat: 'hematologia', k: 'reticulocitos', t: 'Reticulocitos', u: '(V.R. 0.5-2%)' },
  { cat: 'hematologia', k: 'grupo_sanguineo', t: 'Grupo Sanguíneo y Rh', u: '' },
];
const QUIMICA: Fila[] = [
  { cat: 'quimica', k: 'gli', t: 'Glicemia', u: '70-105 mg/dl' },
  { cat: 'quimica', k: 'nus', t: 'N.U.S.', u: '7-25 mg/dl' },
  { cat: 'quimica', k: 'crea', t: 'Creatinina', u: '0.5-1.2 mg/dl' },
  { cat: 'quimica', k: 'urea', t: 'UREA', u: '17-55 mg/dl' },
  { cat: 'quimica', k: 'bt', t: 'Bilirrubina Total', u: 'hasta 1 mg/dl' },
  { cat: 'quimica', k: 'bd', t: 'Bil. Directo', u: 'hasta 0.3 mg/dl' },
  { cat: 'quimica', k: 'bi', t: 'Bil. Indirecta', u: 'hasta 0.7 mg/dl' },
  { cat: 'quimica', k: 'got', t: 'A.S.A.T/GO T.', u: 'hasta 35 U/L' },
  { cat: 'quimica', k: 'gpt', t: 'A.L.A.T/GP T.', u: 'hasta 41 U/L' },
  { cat: 'quimica', k: 'fal', t: 'Fosf. Alcalina', u: '35-129 U/L' },
  { cat: 'quimica', k: 'amilasa', t: 'Amilasa', u: 'hasta 100 U/L' },
  { cat: 'quimica', k: 'acido_urico', t: 'Ácido Úrico', u: '2.6-7.2 mg/dl' },
  { cat: 'quimica', k: 'col', t: 'Colesterol', u: 'hasta 200 mg/dl' },
  { cat: 'quimica', k: 'hdl', t: 'HDL Colesterol', u: '≥ 35 mg/dl' },
  { cat: 'quimica', k: 'ldl', t: 'LDL Colesterol', u: '< 115 mg/dl' },
  { cat: 'quimica', k: 'tri', t: 'Triglicéridos', u: 'hasta 200 mg/dl' },
  { cat: 'quimica', k: 'prot', t: 'Proteínas Totales', u: '6.1-7.9 g/dl' },
  { cat: 'quimica', k: 'alb', t: 'Albúmina', u: '3.5-4.8 g/dl' },
  { cat: 'quimica', k: 'rel_alb_glo', t: 'Rel. Alb/Glob', u: '1.2-2.2' },
  { cat: 'quimica', k: 'hba_1c', t: 'Hemoglobina Glicosilada', u: '6.6-8.6%' },
  { cat: 'quimica', k: 'calcio', t: 'Calcio', u: '8.5-10.5 mg/dl' },
  { cat: 'quimica', k: 'ldh', t: 'LDH deshidrogenasa', u: '< 480 U/L' },
];
const SEROLOGIA: Fila[] = [
  { cat: 'serologia', k: 'hiv', t: 'Pba. Rápida P/VIH' },
  { cat: 'serologia', k: 'h_pylori_heces', t: 'Pba. Rápida para H. pylori' },
  { cat: 'serologia', k: 'psa_prueba_rapida', t: 'Pba. Rápida para PSA' },
  { cat: 'serologia', k: 'rpr', t: 'R.P.R.' },
  { cat: 'serologia', k: 'pcr', t: 'P.C.R.', u: 'mg/dl (menor a 0.6)' },
  { cat: 'serologia', k: 'asto', t: 'A.S.T.O.', u: 'UI/ml (menor a 200)' },
  { cat: 'serologia', k: 'fr', t: 'F.R.', u: 'UI/ml (menor a 8)' },
];
const WIDAL: Fila[] = [
  { cat: 'serologia', k: 'widal_o', t: 'O' },
  { cat: 'serologia', k: 'widal_h', t: 'H' },
  { cat: 'serologia', k: 'widal_a', t: 'A' },
  { cat: 'serologia', k: 'widal_b', t: 'B' },
];
const EGO_FISICO: Fila[] = [
  { cat: 'ego', k: 'volumen', t: 'CANTIDAD' },
  { cat: 'ego', k: 'color', t: 'COLOR' },
  { cat: 'ego', k: 'olor', t: 'OLOR' },
  { cat: 'ego', k: 'aspecto', t: 'ASPECTO' },
  { cat: 'ego', k: 'sedimento', t: 'SEDIMENTO' },
  { cat: 'ego', k: 'espuma', t: 'ESPUMA' },
  { cat: 'ego', k: 'densidad', t: 'DENSIDAD' },
  { cat: 'ego', k: 'ph', t: 'REACCIÓN' },
];
const EGO_QUIMICO: Fila[] = [
  { cat: 'ego', k: 'prot', t: 'PROTEÍNAS' },
  { cat: 'ego', k: 'glucosa', t: 'GLUCOSA' },
  { cat: 'ego', k: 'cetonas', t: 'CETONAS' },
  { cat: 'ego', k: 'bilirrubinas', t: 'BILIRRUBINA' },
  { cat: 'ego', k: 'sangre', t: 'SANGRE' },
  { cat: 'ego', k: 'nitritos', t: 'NITRITOS' },
  { cat: 'ego', k: 'pigmentos_biliares', t: 'PIGMENTOS BILIARES' },
  { cat: 'ego', k: 'urobilinogeno', t: 'UROBILINÓGENO' },
];
const EGO_MICRO: Fila[] = [
  { cat: 'ego', k: 'eritrocitos', t: 'HEMATÍES', u: 'POR CAMPO' },
  { cat: 'ego', k: 'leucocitos', t: 'LEUCOCITOS', u: 'POR CAMPO' },
  { cat: 'ego', k: 'piocitos', t: 'PIOCITOS', u: 'POR CAMPO' },
  { cat: 'ego', k: 'cel_renales', t: 'CÉLULAS RENALES', u: 'POR CAMPO' },
  { cat: 'ego', k: 'cel_epiteliales', t: 'CÉLULAS EPITELIALES', u: 'POR CAMPO' },
  { cat: 'ego', k: 'bacterias', t: 'FLORA BACTERIANA', u: 'POR CAMPO' },
  { cat: 'ego', k: 'cilindros_hialinos', t: 'CILINDROS HIALINOS', u: 'POR CAMPO' },
  { cat: 'ego', k: 'cilindros_granuloso', t: 'CILINDROS GRANULOSOS', u: 'POR CAMPO' },
  { cat: 'ego', k: 'cristales', t: 'CRISTALES', u: 'CANTIDAD' },
];

const algunValor = (d: any, filas: Fila[]) => filas.some((f) => lleno(valorDe(d, f.cat, f.k)));

const linea = (d: any, f: Fila) =>
  `<div class="lin"><span class="et">${esc(f.t)}:</span><span class="val">${esc(valorDe(d, f.cat, f.k) ?? '')}</span>${
    f.u ? `<span class="u">${esc(f.u)}</span>` : ''
  }</div>`;
const caja = (titulo: string, cuerpo: string) => `<div class="caja"><div class="tit">${titulo}</div><div class="cue">${cuerpo}</div></div>`;
const casilla = (d: any, f: Fila, ancho = false) =>
  `<div class="cas${ancho ? ' ancho' : ''}"><span class="et">${esc(f.t)}</span><span class="box">${esc(valorDe(d, f.cat, f.k) ?? '')}</span>${
    f.u ? `<span class="u">${esc(f.u)}</span>` : ''
  }</div>`;

const ESTILO = `
@page{size:A4;margin:0}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;color:#000;margin:0;background:#f3f4f6}
.hoja{width:21cm;min-height:29.7cm;margin:12px auto;background:#fff;padding:1.4cm;display:flex;flex-direction:column;page-break-after:always}
.hoja:last-child{page-break-after:auto}
@media print{body{background:#fff}.hoja{margin:0}}
.enc{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:8px}
.enc .izq{display:flex;align-items:center;gap:10px}
.enc h1{font-size:13px;margin:0;font-weight:900;text-transform:uppercase}
.enc .s1{font-size:10.5px;font-weight:bold;color:#374151;text-transform:uppercase;letter-spacing:.05em}
.enc .s2{font-size:9.5px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;font-weight:600}
.enc .der{text-align:right}.enc .der b{font-size:11px;text-transform:uppercase}.enc .der div{font-size:9.5px;color:#6b7280;font-family:monospace}
.pac{border:1px solid #000;margin-top:10px;font-size:10.5px}
.pac .fila{display:flex;border-top:1px solid #000}.pac .fila:first-child{border-top:0}
.pac .c{padding:3px 5px;border-left:1px solid #000}.pac .c:first-child{border-left:0}
.pac .et,.lin .et{font-weight:900;color:#4b5563;text-transform:uppercase}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;flex:1;align-content:start}
.col{display:flex;flex-direction:column;gap:9px}
.caja{border:1px solid #000}
.caja .tit{background:#f3f4f6;border-bottom:1px solid #000;text-align:center;font-size:10px;font-weight:900;letter-spacing:.08em;padding:2px 0;text-transform:uppercase}
.caja .cue{padding:6px 8px}
.lin{display:flex;align-items:flex-end;font-size:9.5px;line-height:1.25;margin:3px 0}
.lin .et{color:#1f2937;text-transform:none}
.lin .val{flex:1;border-bottom:1px dotted #9ca3af;margin:0 4px 1px;text-align:center;font-weight:bold;min-height:12px}
.lin .u{color:#6b7280;font-size:8.5px;min-width:60px;text-align:right}
.sub{font-size:9px;font-weight:900;border-top:1px solid #e5e7eb;margin-top:4px;padding-top:2px;color:#374151;text-transform:uppercase}
.widal{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}.widal .lin .u{display:none}
.coment{min-height:46px;font-size:10px;font-weight:bold;white-space:pre-wrap}
.titulo{text-align:center;border-bottom:2px solid #000;padding-bottom:3px;margin-top:16px;font-size:12px;font-weight:900;letter-spacing:.06em}
.dos{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.cas{display:flex;align-items:center;justify-content:space-between;font-size:10px;margin:4px 0;gap:6px}
.cas .et{font-weight:900;color:#1f2937}
.cas .box{border:1px solid #000;border-radius:3px;min-width:130px;min-height:18px;text-align:center;font-weight:bold;padding:1px 6px}
.cas .u{font-size:9px;color:#6b7280;font-style:italic;min-width:70px;text-align:right}
.cas.ancho{display:grid;grid-template-columns:1fr 230px 110px}
.cas.ancho .box{min-width:0}
.pie{border-top:1px solid #000;margin-top:22px;padding-top:28px;display:flex;justify-content:space-between;align-items:flex-end}
.pie .cod{font-size:9px;color:#6b7280;font-family:monospace}
.firmas{display:flex;gap:40px}.firma{width:110px;text-align:center}
.firma .raya{border-bottom:1px solid #000;margin-bottom:3px}.firma span{font-size:8px;color:#4b5563;text-transform:uppercase;line-height:1.2;display:block}
`;

const LOGO = `<svg width="58" height="58" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="black" stroke-width="2"/><circle cx="50" cy="50" r="41" fill="none" stroke="black" stroke-width="1"/><text x="50" y="58" font-size="20" font-weight="900" font-family="serif" text-anchor="middle">HMC</text><path id="arco" d="M 15 50 A 35 35 0 1 1 85 50" fill="none"/><text font-size="4.8" font-weight="bold"><textPath href="#arco" startOffset="50%" text-anchor="middle">HOSPITAL MUNICIPAL MODELO COREA</textPath></text></svg>`;

const fechaCorta = (s?: string) => {
  const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : esc(s || '');
};

export function imprimirInformeCorea(informe: any): boolean {
  const d = informe?.datos || {};
  const hayConsolidado = [HEMOGRAMA, DIFERENCIAL, COAGULOGRAMA, COMPLEMENTARIOS, QUIMICA, SEROLOGIA, WIDAL].some((g) => algunValor(d, g));
  const hayEgo = [EGO_FISICO, EGO_QUIMICO, EGO_MICRO].some((g) => algunValor(d, g)) || lleno(valorDe(d, 'ego', 'otros_sedimento'));
  if (!hayConsolidado && !hayEgo) {
    alert('Este informe no tiene resultados para imprimir en el formato del hospital.');
    return true;
  }
  const v = window.open('', '_blank');
  if (!v) return false;

  const nombre = [d.paterno, d.materno, d.nombres].filter(Boolean).join(' ') || String(informe.paciente || '').toUpperCase();
  const sexo = ({ M: 'MASCULINO', F: 'FEMENINO' } as any)[String(d.sexo || d.genero || '').toUpperCase()] || d.sexo || '—';
  const registro = d.numero_solicitud || informe.orden || d.orden || '—';
  const firmado = String(informe.estado || d.estadoInforme || '').toUpperCase() === 'FIRMADO';

  const cabecera = `
<div class="enc">
  <div class="izq">${LOGO}<div><h1>${esc(SEDE.institucion)}</h1><div class="s1">Servicio de Laboratorio Clínico</div><div class="s2">Reporte y Resultados de Laboratorio Clínico</div></div></div>
  <div class="der"><b>Informe de Resultados</b><div>Solicitud: ${esc(registro)}</div></div>
</div>
<div class="pac">
  <div class="fila"><div class="c" style="width:60%"><span class="et">Nombre:</span> <b>${esc(nombre)}</b></div><div class="c" style="width:20%"><span class="et">Edad:</span> <b>${esc(d.edad || informe.edad || '—')}</b></div><div class="c" style="width:20%"><span class="et">Sexo:</span> <b>${esc(sexo)}</b></div></div>
  <div class="fila"><div class="c" style="width:60%"><span class="et">Registro:</span> <b>${esc(registro)}</b></div><div class="c" style="width:40%"><span class="et">Municipio:</span> <b>${esc(d.municipio || 'EL ALTO')}</b></div></div>
  <div class="fila"><div class="c" style="width:60%"><span class="et">Sala y cama:</span> <b>${esc(d.consultorio || d.sala_cama || 'EXTERNO')}</b></div><div class="c" style="width:40%"><span class="et">Fecha de reporte:</span> <b>${fechaCorta(informe.fecha || d.fecha)}</b></div></div>
  <div class="fila"><div class="c" style="width:50%"><span class="et">Hora de toma de muestra:</span> <b>${esc(d.hora_toma || '—')}</b></div><div class="c" style="width:50%"><span class="et">Hora de recepción muestra:</span> <b>${esc(d.hora_recepcion || '—')}</b></div></div>
  <div class="fila"><div class="c" style="width:50%"><span class="et">Hora de emisión resultados:</span> <b>${esc(d.hora_emision || '—')}</b></div><div class="c" style="width:50%"><span class="et">Médico solicitante:</span> <b>${esc(d.medico_solicitante || '—')}</b></div></div>
</div>`;

  const pie = (unaFirma: boolean) =>
    unaFirma
      ? `<div class="pie"><div class="cod">HMC - LAB-01 | ${firmado ? 'Firmado digitalmente' : 'Borrador'}</div><div class="firma" style="width:180px"><div class="raya"></div><span>Firma responsable<br>Bioquímica - Laboratorio Clínico</span></div></div>`
      : `<div class="pie"><div class="cod">HMC - LAB-01 | ${firmado ? 'Firmado digitalmente' : 'Borrador'}</div><div class="firmas">
        <div class="firma"><div class="raya"></div><span>Responsable<br>Toma de muestra</span></div>
        <div class="firma"><div class="raya"></div><span>Responsable<br>Área Hematología</span></div>
        <div class="firma"><div class="raya"></div><span>Responsable<br>Área Bioquímica</span></div></div></div>`;

  const comentario = [d.comentario_serie_roja, d.comentario_serie_blanca, d.comentario_plaquetas, d.observaciones].filter(lleno).join('\n') || '—';

  const consolidado = `
<div class="hoja">${cabecera}
<div class="grid">
  <div class="col">
    ${caja('Hemograma', HEMOGRAMA.map((f) => linea(d, f)).join(''))}
    ${caja('Diferencial', DIFERENCIAL.map((f) => linea(d, f)).join(''))}
    ${caja('Coagulograma', COAGULOGRAMA.map((f) => linea(d, f)).join(''))}
    ${caja('Exámenes complementarios', COMPLEMENTARIOS.map((f) => linea(d, f)).join(''))}
    ${caja('Comentario', `<div class="coment">${esc(comentario)}</div>`)}
  </div>
  <div class="col">
    ${caja('Química sanguínea', QUIMICA.map((f) => linea(d, f)).join(''))}
    ${caja('Serología', SEROLOGIA.map((f) => linea(d, f)).join('') + `<div class="sub">Reacciones febriles (Widal)</div><div class="widal">${WIDAL.map((f) => linea(d, f)).join('')}</div>`)}
  </div>
</div>
${pie(false)}</div>`;

  const ego = `
<div class="hoja">${cabecera}
<div class="titulo">RESULTADOS - EXAMEN GENERAL DE ORINA</div>
<div class="dos">
  ${caja('Examen físico', EGO_FISICO.map((f) => casilla(d, f)).join(''))}
  ${caja('Examen químico', EGO_QUIMICO.map((f) => casilla(d, f)).join(''))}
</div>
<div style="margin-top:12px">${caja('Resultados examen microscópico', EGO_MICRO.map((f) => casilla(d, f, true)).join('') +
    `<div class="cas" style="border-top:1px solid #e5e7eb;padding-top:5px"><span class="et">OTROS ELEMENTOS</span><span class="box" style="flex:1;text-align:left">${esc(valorDe(d, 'ego', 'otros_sedimento') ?? '')}</span></div>`)}</div>
<div style="flex:1"></div>
${pie(true)}</div>`;

  v.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe ${esc(nombre)}</title><style>${ESTILO}</style></head><body>
${hayConsolidado ? consolidado : ''}${hayEgo ? ego : ''}
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`);
  v.document.close();
  return true;
}

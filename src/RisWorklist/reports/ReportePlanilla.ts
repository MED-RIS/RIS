// Informe de laboratorio con el MISMO formato que las hojas de impresión de la planilla
// Excel del laboratorio (pestañas bh, q1, q2, elec, sero, ego, copro y cit): banda roja
// "CIMFA VILLA TUNARI - LABORATORIO" con el número correlativo, los datos del paciente en
// el mismo orden y, debajo, el área con los mismos nombres, unidades y valores normales.
// Se imprime una hoja por área y solo las áreas que tienen resultados.
import { CATEGORIAS_LAB } from '../laboratorio/catalogoLaboratorio';
import { UNIDAD_SANITARIA } from '../pacienteExcel';

type Item = { t: string; k?: string; u?: string; vn?: string; titulo?: boolean };
type Hoja = {
  titulo: string;
  cat: string; // categoría del editor donde están guardados los valores
  columnas: Item[][];
  notas?: string[][]; // textos fijos debajo de cada columna (VALORES NORMALES…)
  pie?: Item[]; // filas largas al final (comentarios, observaciones)
};

const HOJAS: Hoja[] = [
  {
    titulo: 'HEMATOLOGÍA',
    cat: 'hematologia',
    columnas: [
      [
        { t: 'Glob. Rojos', k: 'globulos_rojos', u: 'ul' },
        { t: 'Hematocrito', k: 'hto', u: '%' },
        { t: 'Hemoglobina', k: 'hb', u: 'g/dl' },
        { t: 'Reticulocitos', k: 'reticulocitos', u: '%' },
        { t: 'VES', k: 'ves_1_hora', u: '1ra Hr.' },
        { t: 'Grupo sanguíneo', k: 'grupo_sanguineo' },
      ],
      [
        { t: 'Glob. Blancos', k: 'globulos_blancos', vn: '4.500-10.000' },
        { t: 'FÓRMULA DIFERENCIAL %', titulo: true },
        { t: 'Mielocitos', k: 'mielo' },
        { t: 'Metamielocitos', k: 'metamie' },
        { t: 'Cayados', k: 'cay', vn: '0-2' },
        { t: 'Segmentados', k: 'seg', vn: '45-70' },
        { t: 'Eosinófilos', k: 'eosi', vn: '1-4' },
        { t: 'Basófilos', k: 'baso', vn: '0-1' },
        { t: 'Linfocitos', k: 'linf', vn: '20-55' },
        { t: 'Monocitos', k: 'mon', vn: '2-9' },
        { t: 'TOTAL', k: 'formula_total' },
      ],
      [
        { t: 'Plaquetas', k: 'plaquetas', u: 'mm3' },
        { t: 'T. Protrombina', k: 'tiempo_protrombina', u: 'seg' },
        { t: 'C. Protrombina', k: 'actividad_protrombina', u: '%' },
        { t: 'INR', k: 'inr' },
        { t: 'T. de Sangrado', k: 't_sangria_min', u: 'min/seg' },
        { t: 'T. de Coagulación', k: 't_coagulacion_min', u: 'min/seg' },
      ],
    ],
    notas: [
      ['VALORES NORMALES', 'HT. H=45-61 M=41-56', 'HB. H=13-21 M=12-19', 'RETIS: <0,5%'],
      [],
      ['VALORES NORMALES', 'PLAQUETAS: 140.000 - 400.000 / mm3', 'TP: 12 segundos', 'T. SANGRIA: 25 - 35 Segundos', 'T. COAGULACIÓN: 3 - 11 minutos'],
    ],
    pie: [
      { t: 'COMENTARIOS SERIE BLANCA', k: 'comentario_serie_blanca' },
      { t: 'COMENTARIOS SERIE ROJA', k: 'comentario_serie_roja' },
      { t: 'OBSERVACIONES', k: 'observaciones' },
    ],
  },
  {
    titulo: 'QUÍMICAS',
    cat: 'quimica',
    columnas: [
      [
        { t: 'GLICEMIA', k: 'gli', u: 'mg/dl', vn: '(70 - 105)' },
        { t: 'ACIDO URICO', k: 'acido_urico', u: 'mg/dl', vn: 'V (3.4 - 7.0) · M (2,4 - 5,7)' },
        { t: 'NUS', k: 'nus', u: 'mg/dl', vn: '(7 - 25)' },
        { t: 'CREATININA', k: 'crea', u: 'mg/dl', vn: 'V (0,7 - 1,2) · M (0,6 - 1,0)' },
        { t: 'UREA', k: 'urea', u: 'mg/dl', vn: '(15 - 45)' },
        { t: 'AMILASA', k: 'amilasa', u: 'U/L', vn: '(<125)' },
        { t: 'CALCIO', k: 'calcio', u: 'mg/dl' },
        { t: 'HEMOGLOBINA GLICOSILADA', k: 'hba_1c', u: '%' },
      ],
      [
        { t: 'COLESTEROL', k: 'col', u: 'mg/dl', vn: '(<200)' },
        { t: 'TRIGLICERIDOS', k: 'tri', u: 'mg/dl', vn: '(<150)' },
        { t: 'HDL', k: 'hdl', u: 'mg/dl', vn: '(35 - 55)' },
        { t: 'LDL', k: 'ldl', u: 'mg/dl', vn: '(50 - 160)' },
        { t: 'VLDL', k: 'vldl', u: 'mg/dl', vn: '(2 - 30)' },
        { t: 'PROTEINAS TOTALES', k: 'prot', u: 'g/dl', vn: '(6,5 - 8,0)' },
        { t: 'ALBUMINA', k: 'alb', u: 'g/dl', vn: '(3,5 - 5,0)' },
        { t: 'GLOBULINA', k: 'globulinas', u: 'g/dl', vn: '(2,0 - 3,5)' },
      ],
    ],
  },
  {
    titulo: 'QUÍMICAS',
    cat: 'quimica',
    columnas: [
      [
        { t: 'T.G.O.', k: 'got', u: 'U/L', vn: '(hasta 40)' },
        { t: 'T.G.P.', k: 'gpt', u: 'U/L', vn: '(hasta 41)' },
        { t: 'PAL', k: 'fal', u: 'U/L', vn: 'V (30-130) · M (30-130)' },
        { t: 'BILIRRUBINA DIRECTA', k: 'bd', u: 'mg/dl', vn: '(hasta 0.3)' },
        { t: 'BILIRRUBINA INDIRECTA', k: 'bi', u: 'mg/dl', vn: '(hasta 0.7)' },
        { t: 'BILIRRUBINA TOTAL', k: 'bt', u: 'mg/dl', vn: '(hasta 1)' },
      ],
      [
        { t: 'VOLUMEN 24 Hrs.', k: 'volumen_creatinuria', u: 'ml/día' },
        { t: 'CREATININA EN ORINA', k: 'creatinuria', u: 'mg/día' },
        { t: 'VOLUMEN 24 Hrs. (proteínas)', k: 'volumen_proteinuria', u: 'ml/día' },
        { t: 'PROTEINAS EN ORINA', k: 'proteinuria', u: 'mg/día', vn: '(28 - 140)' },
      ],
    ],
    notas: [
      ['NOTA: PAL en niños V.N. hasta 390'],
      ['CREATINURIA: dividir entre el peso del paciente', 'Valor normal: Varones 14-26 · Mujeres 11-20', 'DEPURACIÓN: Varones (97 - 137) · Mujeres (88 - 128)'],
    ],
    pie: [{ t: 'OBSERVACIONES', k: 'observaciones_quimica' }],
  },
  {
    titulo: 'ELECTROLITOS',
    cat: 'quimica',
    columnas: [
      [
        { t: 'SODIO', k: 'sodio_meql', u: 'mEq/L', vn: '(136 - 145)' },
        { t: 'POTASIO', k: 'potasio_meql', u: 'mEq/L', vn: '(3,5 - 5,3)' },
        { t: 'CLORO', k: 'cloro_meql', u: 'mEq/L', vn: '(97 - 107)' },
        { t: 'GASOMETRÍA', k: 'gasometria' },
      ],
    ],
  },
  {
    titulo: 'SEROLOGÍA',
    cat: 'serologia',
    columnas: [
      [
        { t: 'P.C.R.', k: 'pcr', u: 'mg/l', vn: '(hasta 8)' },
        { t: 'LATEX - TURBI', k: 'fr', u: 'U/l', vn: '(hasta 20)' },
        { t: 'ASTO', k: 'asto', u: 'U/l', vn: '(hasta 200)' },
        { t: 'R.P.R.', k: 'rpr' },
        { t: 'WIDAL  O =', k: 'widal_o' },
        { t: 'WIDAL  H =', k: 'widal_h' },
        { t: 'WIDAL  A =', k: 'widal_a' },
        { t: 'WIDAL  B =', k: 'widal_b' },
      ],
      [
        { t: 'TEST DE EMBARAZO', k: 'test_embarazo' },
        { t: 'V.I.H.', k: 'hiv' },
        { t: 'HEPATITIS B', k: 'hepatitis_b' },
        { t: 'HEPATITIS C', k: 'hepatitis_c' },
        { t: 'VDRL', k: 'vdrl' },
        { t: 'PSA', k: 'psa_prueba_rapida' },
        { t: 'OTROS', k: 'otros_serologia' },
      ],
    ],
  },
  {
    titulo: 'EXAMEN GENERAL DE ORINA',
    cat: 'ego',
    columnas: [
      [
        { t: 'Cantidad', k: 'volumen' },
        { t: 'Color', k: 'color' },
        { t: 'Olor', k: 'olor' },
        { t: 'Aspecto', k: 'aspecto' },
        { t: 'Espuma', k: 'espuma' },
        { t: 'Otros', k: 'otros_fisico' },
      ],
      [
        { t: 'Densidad', k: 'densidad' },
        { t: 'pH', k: 'ph' },
        { t: 'Proteinas', k: 'prot' },
        { t: 'Glucosa', k: 'glucosa' },
        { t: 'Cetonas', k: 'cetonas' },
        { t: 'Bilirrubina', k: 'bilirrubinas' },
        { t: 'Sangre (Hb)', k: 'sangre' },
        { t: 'Urobilinógeno', k: 'urobilinogeno' },
        { t: 'Nitritos', k: 'nitritos' },
      ],
      [
        { t: 'SEDIMENTO', titulo: true },
        { t: 'Cel. Epitelia.', k: 'cel_epiteliales', u: 'XC' },
        { t: 'Leucocitos', k: 'leucocitos', u: 'XC' },
        { t: 'Glob. Rojos', k: 'eritrocitos', u: 'XC' },
        { t: 'Bacterias', k: 'bacterias', u: 'XC' },
        { t: 'Cel. Renales', k: 'cel_renales', u: 'XC' },
        { t: 'Cuerp Grasos', k: 'c_gra', u: 'XC' },
        { t: 'Piocitos', k: 'piocitos', u: 'XC' },
        { t: 'Cristales', k: 'cristales', u: 'XC' },
      ],
      [
        { t: 'CILINDROS', titulo: true },
        { t: 'Hialinos', k: 'cilindros_hialinos' },
        { t: 'Granulosos', k: 'cilindros_granuloso' },
        { t: 'Hemáticos', k: 'cilindros_hematico' },
        { t: 'Pigmentarios', k: 'cilindros_pigmentados' },
        { t: 'Céreos', k: 'cilindros_cereo' },
        { t: 'Otros', k: 'otros_sedimento' },
      ],
    ],
    pie: [
      { t: 'OBSERVACIONES', k: 'observaciones_1' },
      { t: '', k: 'observaciones_2' },
    ],
  },
  {
    titulo: 'COPROPARASITOLÓGICO',
    cat: 'urologia',
    columnas: [
      [
        { t: 'COPRO SIMPLE', k: 'copro_simple' },
        { t: 'SANGRE OCULTA', k: 'sangre_oculta' },
        { t: 'HELICOBACTER PYLORI', k: 'h_pylori_heces' },
        { t: 'ROTAVIRUS', k: 'rotavirus' },
      ],
      [
        { t: 'COPRO SER. 1º', k: 'copro_muestra_1' },
        { t: 'COPRO SER. 2º', k: 'copro_muestra_2' },
        { t: 'COPRO SER. 3º', k: 'copro_muestra_3' },
      ],
    ],
    pie: [{ t: 'NOTA', k: 'nota_copro' }],
  },
  {
    titulo: 'CITOLOGÍA FECAL',
    cat: 'urologia',
    columnas: [
      [
        { t: 'REST. ALIMENTICIOS', k: 'cf_restos' },
        { t: 'CEL. EPITELIALES', k: 'cf_cel_epit' },
        { t: 'COLOR', k: 'cf_color' },
        { t: 'CONSISTENCIA', k: 'cf_consistencia' },
        { t: 'MOCO FECAL', k: 'cf_moco' },
        { t: 'LEUCOCITOS', k: 'cf_leuco' },
        { t: 'ERITROCITOS', k: 'cf_eritro' },
        { t: 'BACTERIAS', k: 'cf_bact' },
      ],
      [
        { t: 'PH', k: 'cf_ph' },
        { t: 'SANGRE', k: 'cf_sangre' },
        { t: 'COPRO 1', k: 'cf_copro_1' },
        { t: 'COPRO 2', k: 'cf_copro_2' },
        { t: 'COPRO 3', k: 'cf_copro_3' },
        { t: 'COPRO 4', k: 'cf_copro_4' },
        { t: 'COPRO 5', k: 'cf_copro_5' },
      ],
    ],
    pie: [
      { t: 'NOTA', k: 'cf_notas' },
      { t: 'OBSERVACIONES', k: 'cf_obs' },
    ],
  },
];

const esc = (s: any) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

const lleno = (v: any) => v !== undefined && v !== null && String(v).trim() !== '';

// Valor de un parámetro según dónde lo guarda el editor (plano o en su bolsa)
const valorDe = (datos: any, catId: string, key: string) => {
  const cat = CATEGORIAS_LAB.find((c) => c.id === catId);
  const p = cat?.catalogo.find((x) => x.key === key);
  const mode = p?.modeOverride || cat?.storage.mode;
  const bag = p?.bagOverride || cat?.storage.bag;
  if (key === 'observaciones') return datos?.observaciones;
  return mode === 'flat' ? datos?.[key] : datos?.[bag as string]?.[key] ?? datos?.[key];
};

// "2026-09-24" -> "jueves, 24 de septiembre de 2026"
const fechaLarga = (s?: string) => {
  const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return esc(s || '');
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export function imprimirPlanillaCNS(informe: any): boolean {
  const d = informe?.datos || {};
  const hojas = HOJAS.filter((h) =>
    [...h.columnas.flat(), ...(h.pie || [])].some((i) => i.k && i.k !== 'observaciones' && lleno(valorDe(d, h.cat, i.k)))
  );
  if (!hojas.length) {
    alert('Este informe no tiene resultados para imprimir.');
    return true;
  }
  const v = window.open('', '_blank');
  if (!v) return false;

  const nombre =
    [d.paterno, d.materno, d.nombres].filter(Boolean).join(' ') || String(informe.paciente || '').toUpperCase();
  const numero = informe.orden ?? d.orden ?? '';
  const ahora = new Date();
  const emitido = `${ahora.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ${ahora.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}`;

  const cabecera = `
<table class="cab"><tr><td class="banda">${esc(UNIDAD_SANITARIA)} - LABORATORIO</td><td class="num">${esc(numero)}</td></tr></table>
<table class="pac">
<tr><td></td><td></td><td class="et der">Nº asegurado:</td><td class="dato">${esc(d.avc || informe.codigoAsegurado || informe.cod || '')}</td></tr>
<tr><td></td><td></td><td class="et der">Código Beneficiario:</td><td class="dato">${esc(d.benef || informe.codigoBeneficiario || '')} &nbsp; <span class="et">Edad:</span> ${esc(d.edad || informe.edad || '')}</td></tr>
</table>
<table class="ident"><tr>
<td><div class="linea">${esc(d.medico_solicitante || '')}</div><div class="et">Clave Médico</div></td>
<td><div class="linea">${esc(UNIDAD_SANITARIA)}</div><div class="et">Unidad sanitaria</div></td>
<td class="ancho"><div class="linea">${esc(nombre)}</div><div class="et">Apellido Paterno - Materno - Nombres</div></td>
</tr><tr>
<td><div class="linea">${esc(d.consultorio || '')}</div><div class="et">Consultorio</div></td><td></td>
<td class="ancho"><div class="linea">${fechaLarga(d.fecha_solicitud || informe.fecha)}</div><div class="et">Fecha de solicitud</div></td>
</tr></table>`;

  const celda = (h: Hoja, i: Item) => {
    if (i.titulo) return `<tr><td colspan="4" class="sub">${esc(i.t)}</td></tr>`;
    const val = i.k ? valorDe(d, h.cat, i.k) : '';
    return `<tr><td class="nom">${esc(i.t)}</td><td class="val">${lleno(val) ? esc(val) : '-'}</td><td class="uni">${esc(i.u || '')}</td><td class="vn">${esc(i.vn || '')}</td></tr>`;
  };

  const paginas = hojas
    .map((h) => {
      const cols = h.columnas
        .map(
          (c, n) =>
            `<td class="col"><table class="res">${c.map((i) => celda(h, i)).join('')}</table>${(h.notas?.[n] || [])
              .map((t, j) => `<div class="${j === 0 && /^VALORES|^NOTA/.test(t) ? 'nota tit' : 'nota'}">${esc(t)}</div>`)
              .join('')}</td>`
        )
        .join('');
      const pie = (h.pie || [])
        .map((i) => {
          const val = i.k ? valorDe(d, h.cat, i.k) : '';
          return `<div class="pie">${i.t ? `<b>${esc(i.t)}:</b> ` : ''}<span>${lleno(val) ? esc(val) : ''}</span></div>`;
        })
        .join('');
      return `<section class="hoja">${cabecera}<h2>${esc(h.titulo)}</h2><table class="cols"><tr>${cols}</tr></table>${pie}<div class="fecha">${esc(emitido)} Hrs.</div></section>`;
    })
    .join('');

  v.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Laboratorio ${esc(numero)} - ${esc(nombre)}</title>
<style>@page{size:letter landscape;margin:10mm}body{font-family:Arial,sans-serif;font-size:9.5pt;color:#111;margin:0}
.hoja{page-break-after:always;padding:2mm}.hoja:last-child{page-break-after:auto}
table{border-collapse:collapse;width:100%}
.cab .banda{background:#e00000;color:#000;font-weight:bold;font-style:italic;text-align:center;font-size:11pt;padding:7px;border:1px solid #000}
.cab .num{background:#92d050;font-size:22pt;font-weight:bold;text-align:center;width:120px;border:1px solid #000}
.pac td{padding:2px 4px}.der{text-align:right;width:160px}.dato{font-weight:bold;width:230px}
.et{font-size:8pt;color:#333;font-style:italic}.ident td{padding:3px 8px;text-align:center;vertical-align:bottom}
.ident .ancho{width:45%}.linea{border-bottom:1px solid #000;min-height:15px;font-weight:bold;font-size:10.5pt}
h2{text-align:center;text-decoration:underline;font-size:12pt;margin:10px 0 6px}
.cols>tbody>tr>td.col{vertical-align:top;padding:0 6px;border-left:1px solid #000}.cols td.col:first-child{border-left:none}
.res td{padding:2px 3px;border-bottom:1px dotted #bbb}.nom{white-space:nowrap}.val{font-weight:bold;text-align:right;width:70px}
.uni{font-size:8pt;width:50px}.vn{font-size:8pt;color:#333;white-space:nowrap}
.sub{font-weight:bold;text-align:center;padding-top:5px;border-bottom:1px solid #000}
.nota{font-size:8pt;margin-top:2px}.nota.tit{font-weight:bold;font-style:italic;text-decoration:underline;margin-top:6px}
.pie{margin-top:6px;border-bottom:1px solid #000;min-height:15px}.fecha{text-align:center;margin-top:12px}
</style></head><body>${paginas}<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`);
  v.document.close();
  return true;
}

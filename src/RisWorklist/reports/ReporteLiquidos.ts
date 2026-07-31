// src/RisWorklist/reports/ReporteLiquidos.ts

import { v, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

export const imprimirLiquidosCNS = (p: any) => {
  const d = p.datos || p || {};
  // Soporte para datos en bolsa anidada liquidosDatos o directamente en la raíz d
  const l = d.liquidosDatos || p.liquidosDatos || d || {};
  const f = resolverFiliacion(p);

  const row = (label: string, val: any, unidad = "") => {
    const valTxt = v(val);
    const valMostrar = valTxt !== "-" && unidad ? `${valTxt} ${unidad}` : valTxt;
    return `<div class="row-item"><span>${label}</span><span>${valMostrar}</span></div>`;
  };

  const tipoLiquidoTexto = l.tipo_liquido ? v(l.tipo_liquido).toUpperCase() : "BIOLÓGICO";

  const cuerpo = `
    ${cabeceraHTML(f, "LÍQUIDOS BIOLÓGICOS", "#5d4037", "#bcaaa4")}
    <div class="main-title">ANÁLISIS DE LÍQUIDOS BIOLÓGICOS — ${tipoLiquidoTexto}</div>

    <div class="grid-2">
      <!-- 🧪 COLUMNA 1: MACROSCÓPICO, CENTRIFUGACIÓN Y QUÍMICO -->
      <div class="col-box">
        <div class="col-title">EXAMEN FISICO / MACROSCÓPICO</div>
        ${row("Tipo de Líquido:", l.tipo_liquido)}
        ${row("Volumen:", l.volumen, "ml")}
        ${row("Color:", l.color)}
        ${row("Aspecto:", l.aspecto)}
        ${row("pH:", l.ph)}
        ${row("Reacción:", l.reaccion)}
        ${row("Otros:", l.otros)}

        <div class="col-title sub">LUEGO DE LA CENTRIFUGACIÓN</div>
        ${row("Color (sobrenadante):", l.centrif_color)}
        ${row("Aspecto (sobrenadante):", l.centrif_aspecto)}
        ${row("Observaciones:", l.centrif_obs)}

        <div class="col-title sub">EXAMEN QUÍMICO</div>
        ${row("Glucosa:", l.quimico_glucosa, "mg/dL")}
        ${row("Proteínas:", l.quimico_proteinas, "g/dL")}
        ${row("Observaciones:", l.quimico_obs)}
      </div>

      <!-- 🔬 COLUMNA 2: MICROSCÓPICO Y SEDIMENTO -->
      <div class="col-box">
        <div class="col-title">EXAMEN MICROSCOPICO / CITOLÓGICO</div>
        ${row("Leucocitos (recuento):", l.micro_leucocitos, "/mm³")}
        ${row("PMN:", l.micro_pmn, "%")}
        ${row("MN:", l.micro_mn, "%")}
        ${row("No procede a recuento / Obs.:", l.micro_no_procede_obs)}

        <div class="col-title sub">SEDIMENTO EN FRESCO</div>
        ${row("Leucocitos:", l.sedimento_leucocitos)}
        ${row("Hematíes:", l.sedimento_hematies)}
        ${row("Bacterias:", l.sedimento_bacterias)}
        ${row("Otros:", l.sedimento_otros)}
      </div>
    </div>

    ${l.observaciones || d.observaciones ? `<div class="obs-box"><b>Observaciones generales:</b> ${v(l.observaciones ?? d.observaciones)}</div>` : ''}
  `;

  const estilos = `
    .main-title { text-align: center; font-size: 15px; font-weight: bold; margin: 20px 0 15px 0; text-decoration: underline; letter-spacing: 1.2px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; align-items: start; }
    .col-box { border: 1px solid #000; background: #fff; }
    .col-title { background-color: #efebe9; font-weight: bold; text-align: center; padding: 5px; border-bottom: 1px solid #000; font-size: 11px; color: #000; }
    .col-title.sub { border-top: 1px solid #000; background-color: #d7ccc8; }
    .row-item { display: flex; justify-content: space-between; padding: 4px 10px; border-bottom: 1px dotted #999; min-height: 18px; font-size: 11px; color: #000; }
    .row-item span:last-child { font-family: monospace; font-weight: bold; text-align: right; }
    .obs-box { margin-top: 20px; font-size: 10px; color: #000; border-top: 1px dashed #000; padding-top: 8px; }
  `;

  renderizarEImprimir(`CNS_Liquidos_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};
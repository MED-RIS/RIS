// src/RisWorklist/reports/ReporteLiquidos.ts
import { v, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

export const imprimirLiquidosCNS = (p: any) => {
  const d = p.datos || p || {};
  const l = d.liquidosDatos || p.liquidosDatos || {};
  const f = resolverFiliacion(p);

  const row = (label: string, val: any, unidad = "") =>
    `<div class="row-item"><span>${label}</span><span>${v(val)}${unidad ? " " + unidad : ""}</span></div>`;

  const cuerpo = `
    ${cabeceraHTML(f, "ANÁLISIS DE LÍQUIDOS", "#5d4037", "#bcaaa4")}
    <div class="main-title">ANÁLISIS DE LÍQUIDOS BIOLÓGICOS — ${v(l.tipo_liquido).toUpperCase()}</div>

    <div class="grid-2">
      <div class="col-box">
        <div class="col-title">EXAMEN MACROSCÓPICO</div>
        ${row("Volumen:", l.volumen, "ml")}
        ${row("Color:", l.color)}
        ${row("Aspecto:", l.aspecto)}
        ${row("pH:", l.ph)}
        ${row("Reacción:", l.reaccion)}
        <div class="col-title sub">LUEGO DE CENTRIFUGACIÓN</div>
        ${row("Color (sobrenadante):", l.centrif_color)}
        ${row("Aspecto (sobrenadante):", l.centrif_aspecto)}
        ${row("Observaciones:", l.centrif_obs)}
        <div class="col-title sub">EXAMEN QUÍMICO</div>
        ${row("Glucosa:", l.quimico_glucosa, "mg/dl")}
        ${row("Proteínas:", l.quimico_proteinas, "g/dl")}
        ${row("Observaciones:", l.quimico_obs)}
      </div>
      <div class="col-box">
        <div class="col-title">EXAMEN CITOLÓGICO / MICROSCÓPICO</div>
        ${row("Leucocitos (recuento):", l.micro_leucocitos, "cel/mm³")}
        ${row("PMN:", l.micro_pmn, "%")}
        ${row("MN:", l.micro_mn, "%")}
        ${row("No procede a recuento:", l.micro_no_procede_obs)}
        <div class="col-title sub">SEDIMENTO EN FRESCO</div>
        ${row("Leucocitos:", l.sedimento_leucocitos, "x campo")}
        ${row("Hematíes:", l.sedimento_hematies, "x campo")}
        ${row("Bacterias:", l.sedimento_bacterias)}
        ${row("Otros:", l.sedimento_otros)}
      </div>
    </div>

    <div class="obs-box"><b>Observaciones generales:</b> ${v(l.otros)}</div>
  `;

  const estilos = `
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; }
    .col-box { border: 1px solid #000; background: #fff; }
    .col-title { background-color: #efebe9; font-weight: bold; text-align: center; padding: 5px; border-bottom: 1px solid #000; font-size: 11px; color: #000; }
    .col-title.sub { border-top: 1px solid #000; }
    .row-item { display: flex; justify-content: space-between; padding: 4px 10px; border-bottom: 1px dotted #999; min-height: 18px; font-size: 11px; color: #000; }
    .row-item span:last-child { font-family: monospace; font-weight: bold; text-align: right; }
    .obs-box { color: #000; }
  `;

  renderizarEImprimir(`CNS_Liquidos_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};
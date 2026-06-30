import { v, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

export const imprimirEspermatoCNS = (p: any) => {
  const d = p.datos || p || {};
  const e = d.espermatoDatos || p.espermatoDatos || {};
  const f = resolverFiliacion(p);

  const row = (label: string, val: any, ref = "") =>
    `<div class="row-item"><span>${label}</span><span class="val">${v(val)}</span><span class="ref">${ref}</span></div>`;

  const cuerpo = `
    ${cabeceraHTML(f, "ESPERMATOGRAMA", "#37474f", "#b0bec5")}
    <div class="main-title">ESPERMATOGRAMA</div>

    <div class="muestra">
      <span><b>Obtención:</b> ${v(e.fecha_obtencion)}</span>
      <span><b>Recepción:</b> ${v(e.hora_recepcion)}</span>
      <span><b>Abstinencia:</b> ${v(e.dias_abstinencia)} días</span>
    </div>

    <div class="grid-2">
      <div class="col-box">
        <div class="col-title">EXAMEN MACROSCÓPICO</div>
        ${row("Volumen:", v(e.volumen) + " mL", "≥ 1.5")}
        ${row("Color:", e.color)}
        ${row("pH:", e.ph, "≥ 7.2")}
        ${row("Viscosidad:", e.viscosidad)}
        ${row("Aspecto:", e.aspecto)}
        ${row("Licuefacción:", e.licuefaccion, "< 60 min")}
        ${row("Coagulación:", e.coagulacion)}
        ${row("Olor:", e.olor)}
      </div>
      <div class="col-box">
        <div class="col-title">EXAMEN MICROSCÓPICO</div>
        ${row("Concentración:", v(e.concentracion) + " mill/mL", "≥ 15")}
        ${row("Conc. Total:", v(e.concentracion_total) + " mill", "≥ 39")}
        ${row("Recuento Total:", e.recuento_total)}
        ${row("Motilidad Progr. (a+b):", v(e.motilidad_progresiva) + " %", "≥ 32")}
        ${row("Motilidad No Progr. (c):", v(e.motilidad_no_progresiva) + " %")}
        ${row("Inmóviles (d):", v(e.inmoviles) + " %")}
        ${row("Vitalidad:", v(e.vitalidad) + " %", "≥ 58")}
        ${row("Morfología Normal:", v(e.morfologia_normal) + " %", "≥ 4")}
        ${row("Leucocitos:", v(e.leucocitos) + " mill/mL", "< 1")}
        ${row("Aglutinación:", e.aglutinacion)}
      </div>
    </div>

    <div class="obs-box"><b>Observaciones / Conclusión:</b> ${v(e.observaciones)}</div>
    <div class="ref-nota">Valores de referencia según OMS (5ª/6ª ed.), límite inferior de referencia.</div>
  `;

  const estilos = `
    .muestra { display: flex; justify-content: space-around; font-size: 10.5px; border: 1px solid #000; padding: 6px; margin-top: 6px; background-color: #eceff1; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px; align-items: start; }
    .col-box { border: 1px solid #000; }
    .col-title { background-color: #eceff1; font-weight: bold; text-align: center; padding: 5px; border-bottom: 1px solid #000; font-size: 11px; }
    .row-item { display: grid; grid-template-columns: 1.3fr 1fr 0.6fr; padding: 4px 10px; border-bottom: 1px dotted #999; min-height: 18px; font-size: 11px; align-items: center; }
    .row-item .val { font-family: monospace; font-weight: bold; text-align: right; }
    .row-item .ref { color: #888; font-size: 9px; text-align: right; }
    .ref-nota { margin-top: 10px; font-size: 9px; color: #555; font-style: italic; text-align: center; }
  `;

  renderizarEImprimir(`CNS_Espermato_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};

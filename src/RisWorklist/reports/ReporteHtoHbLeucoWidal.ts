import { v, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

// Hematocrito, Hemoglobina, Leucocitos + fórmula diferencial + Reacción de Widal.
export const imprimirHtoHbLeucoWidalCNS = (p: any) => {
  const d = p.datos || p || {};
  const w = d.widalDatos || p.widalDatos || {};
  const f = resolverFiliacion(p);

  const cuerpo = `
    ${cabeceraHTML(f, "HEMATOLOGÍA + WIDAL", "#ad1457", "#f48fb1")}
    <div class="main-title">HTO · HB · LEUCOCITOS + REACCIÓN DE WIDAL</div>

    <div class="grid-2">
      <div class="col-box">
        <div class="col-title">HEMATOLOGÍA</div>
        <div class="row-item"><span>Hematocrito:</span><span>${v(d.hto)} %</span></div>
        <div class="row-item"><span>Hemoglobina:</span><span>${v(d.hb)} g/dL</span></div>
        <div class="row-item"><span>Plaquetas:</span><span>${v(d.plaquetas)} uL</span></div>
        <div class="row-item"><span>Glóbulos Blancos:</span><span>${v(d.globulos_blancos)} uL</span></div>
        <div class="col-title sub">FÓRMULA DIFERENCIAL (%)</div>
        <div class="row-item"><span>Cayados:</span><span>${v(d.cay)}</span></div>
        <div class="row-item"><span>Segmentados:</span><span>${v(d.seg)}</span></div>
        <div class="row-item"><span>Eosinófilos:</span><span>${v(d.eosi)}</span></div>
        <div class="row-item"><span>Basófilos:</span><span>${v(d.baso)}</span></div>
        <div class="row-item"><span>Linfocitos:</span><span>${v(d.linf)}</span></div>
        <div class="row-item"><span>Monocitos:</span><span>${v(d.mon)}</span></div>
        <div class="row-item total"><span>Total:</span><span>${v(d.total)}</span></div>
      </div>
      <div class="col-box">
        <div class="col-title">REACCIÓN DE WIDAL</div>
        <div class="row-item"><span>Eberth O (Antígeno O):</span><span>${v(w.widal_o)}</span></div>
        <div class="row-item"><span>Eberth H (Antígeno H):</span><span>${v(w.widal_h)}</span></div>
        <div class="row-item"><span>Paratífico A:</span><span>${v(w.widal_a)}</span></div>
        <div class="row-item"><span>Paratífico B:</span><span>${v(w.widal_b)}</span></div>
      </div>
    </div>

    <div class="obs-box"><b>Interpretación Widal:</b> ${v(w.observaciones_widal)}</div>
  `;

  const estilos = `
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; align-items: start; }
    .col-box { border: 1px solid #000; }
    .col-title { background-color: #fce4ec; font-weight: bold; text-align: center; padding: 5px; border-bottom: 1px solid #000; font-size: 11px; }
    .col-title.sub { border-top: 1px solid #000; }
    .row-item { display: flex; justify-content: space-between; padding: 4px 10px; border-bottom: 1px dotted #999; min-height: 18px; font-size: 11.5px; }
    .row-item span:last-child { font-family: monospace; font-weight: bold; text-align: right; }
    .row-item.total { background-color: #f5f5f5; font-weight: bold; }
  `;

  renderizarEImprimir(`CNS_HtoHbLeucoWidal_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};

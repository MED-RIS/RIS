// src/RisWorklist/reports/ReporteHtoHbLeucoWidal.ts

import { v, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

// Reporte combinado: Hematocrito, Hemoglobina, Leucocitos + Fórmula Diferencial + Reacción de Widal.
export const imprimirHtoHbLeucoWidalCNS = (p: any) => {
  const d = p.datos || p || {};
  // Soporte para datos anidados en widalDatos o planos en d
  const w = d.widalDatos || p.widalDatos || d || {};
  const f = resolverFiliacion(p);

  // Helper para suma de fórmula diferencial
  const n = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const { mielo, metamie, cay, seg, eosi, baso, linf, mon } = d;
  const sumaFormula = n(mielo) + n(metamie) + n(cay) + n(seg) + n(eosi) + n(baso) + n(linf) + n(mon);
  const totalFormula = sumaFormula > 0 ? String(sumaFormula) : (d.total ? v(d.total) : "-");

  const cuerpo = `
    ${cabeceraHTML(f, "HEMATOLOGÍA + WIDAL", "#ad1457", "#f48fb1")}
    <div class="main-title">HTO · HB · LEUCOCITOS + REACCIÓN DE WIDAL</div>

    <div class="grid-2">
      <!-- 🔴 COLUMNA 1: HEMATOLOGÍA -->
      <div class="col-box">
        <div class="col-title">HEMATOLOGÍA</div>
        <div class="row-item"><span>Hematocrito (HTO):</span><span>${v(d.hto)} %</span></div>
        <div class="row-item"><span>Hemoglobina (HB):</span><span>${v(d.hb)} g/dL</span></div>
        <div class="row-item"><span>Glóbulos Blancos:</span><span>${v(d.globulos_blancos)} uL</span></div>
        <div class="row-item"><span>Plaquetas:</span><span>${v(d.plaquetas)} uL</span></div>
        
        <div class="col-title sub">FÓRMULA DIFERENCIAL (%)</div>
        <div class="row-item"><span>Mielocitos:</span><span>${v(d.mielo)}</span></div>
        <div class="row-item"><span>Metamielocitos:</span><span>${v(d.metamie)}</span></div>
        <div class="row-item"><span>Cayados:</span><span>${v(d.cay)}</span></div>
        <div class="row-item"><span>Segmentados:</span><span>${v(d.seg)}</span></div>
        <div class="row-item"><span>Eosinófilos:</span><span>${v(d.eosi)}</span></div>
        <div class="row-item"><span>Basófilos:</span><span>${v(d.baso)}</span></div>
        <div class="row-item"><span>Linfocitos:</span><span>${v(d.linf)}</span></div>
        <div class="row-item"><span>Monocitos:</span><span>${v(d.mon)}</span></div>
        <div class="row-item total"><span>TOTAL:</span><span>${totalFormula} %</span></div>
      </div>

      <!-- 🔬 COLUMNA 2: REACCIÓN DE WIDAL -->
      <div class="col-box">
        <div class="col-title">REACCIÓN DE WIDAL</div>
        <div class="row-item"><span>Eberth O (Antígeno O):</span><span>${v(w.widal_o ?? w.o)}</span></div>
        <div class="row-item"><span>Eberth H (Antígeno H):</span><span>${v(w.widal_h ?? w.h)}</span></div>
        <div class="row-item"><span>Paratífico A:</span><span>${v(w.widal_a ?? w.a)}</span></div>
        <div class="row-item"><span>Paratífico B:</span><span>${v(w.widal_b ?? w.b)}</span></div>
      </div>
    </div>

    <div class="obs-box">
      ${w.observaciones_widal || d.observaciones ? `<div><b>Observaciones:</b> ${v(w.observaciones_widal ?? d.observaciones)}</div>` : ''}
    </div>
  `;

  const estilos = `
    .main-title { text-align: center; font-size: 15px; font-weight: bold; margin: 20px 0 15px 0; text-decoration: underline; letter-spacing: 1.2px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; align-items: start; }
    .col-box { border: 1px solid #000; background: #fff; }
    .col-title { background-color: #fce4ec; font-weight: bold; text-align: center; padding: 5px; border-bottom: 1px solid #000; font-size: 11px; color: #000; }
    .col-title.sub { border-top: 1px solid #000; background-color: #f8bbd0; }
    .row-item { display: flex; justify-content: space-between; padding: 4px 10px; border-bottom: 1px dotted #999; min-height: 18px; font-size: 11px; color: #000; }
    .row-item span:last-child { font-family: monospace; font-weight: bold; text-align: right; }
    .row-item.total { background-color: #f5f5f5; font-weight: bold; border-top: 1px solid #000; }
    .obs-box { margin-top: 20px; font-size: 10px; color: #000; border-top: 1px dashed #000; padding-top: 8px; }
  `;

  renderizarEImprimir(`CNS_HtoHbLeucoWidal_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};
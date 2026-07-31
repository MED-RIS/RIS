// src/RisWorklist/reports/ReporteHtoHb.ts

import { v, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

// Reporte aislado de Hematocrito y Hemoglobina (deriva de los datos de Hematología).
export const imprimirHtoHbCNS = (p: any) => {
  const d = p.datos || p || {};
  const f = resolverFiliacion(p);

  // 🩸 Lectura directa de Hematocrito y Hemoglobina
  const htoVal = d.hto ?? d.hematoDatos?.hto;
  const hbVal = d.hb ?? d.hematoDatos?.hb;

  const cuerpo = `
    ${cabeceraHTML(f, "HEMATOLOGÍA", "#c62828", "#ef9a9a")}
    <div class="main-title">HEMATOCRITO Y HEMOGLOBINA</div>
    
    <table class="tbl">
      <tbody>
        <tr>
          <td class="lbl">HEMATOCRITO:</td>
          <td class="val">${v(htoVal)}</td>
          <td class="uni">%</td>
          <td class="ref">(M: 42-52% / F: 37-47%)</td>
        </tr>
        <tr>
          <td class="lbl">HEMOGLOBINA:</td>
          <td class="val">${v(hbVal)}</td>
          <td class="uni">g/dL</td>
          <td class="ref">(M: 14-18 / F: 12-16)</td>
        </tr>
      </tbody>
    </table>

    <div class="ref-nota">Valores de referencia orientativos según sexo (M: masculino, F: femenino).</div>
    
    ${d.observaciones ? `<div class="obs-box"><b>Observaciones:</b> ${v(d.observaciones)}</div>` : ''}
  `;

  const estilos = `
    .main-title { text-align: center; font-size: 16px; font-weight: bold; margin: 30px 0 20px 0; text-decoration: underline; letter-spacing: 1.5px; }
    .tbl { width: 85%; margin: 30px auto 0 auto; border-collapse: collapse; }
    .tbl td { border-bottom: 1px dotted #000; padding: 12px 14px; font-size: 13px; color: #000; }
    .tbl td.lbl { font-weight: bold; width: 35%; }
    .tbl td.val { text-align: right; font-family: monospace; font-weight: bold; font-size: 16px; width: 20%; }
    .tbl td.uni { color: #333; font-size: 11px; width: 15%; font-weight: bold; }
    .tbl td.ref { color: #555; font-size: 10px; text-align: right; width: 30%; }
    .ref-nota { width: 85%; margin: 20px auto 0 auto; font-size: 9.5px; color: #555; font-style: italic; text-align: center; }
    .obs-box { width: 85%; margin: 25px auto 0 auto; font-size: 10px; border-top: 1px dashed #000; padding-top: 8px; }
  `;

  renderizarEImprimir(`CNS_HtoHb_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};
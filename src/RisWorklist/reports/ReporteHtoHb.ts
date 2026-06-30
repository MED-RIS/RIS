import { v, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

// Reporte aislado de Hematocrito y Hemoglobina (deriva de los datos de Hematología).
export const imprimirHtoHbCNS = (p: any) => {
  const d = p.datos || p || {};
  const f = resolverFiliacion(p);

  const cuerpo = `
    ${cabeceraHTML(f, "HEMATOLOGÍA", "#c62828", "#ef9a9a")}
    <div class="main-title">HEMATOCRITO Y HEMOGLOBINA</div>
    <table class="tbl">
      <tbody>
        <tr><td class="lbl">Hematocrito:</td><td class="val">${v(d.hto)}</td><td class="uni">%</td><td class="ref">(M 40-54 / F 37-47)</td></tr>
        <tr><td class="lbl">Hemoglobina:</td><td class="val">${v(d.hb)}</td><td class="uni">g/dL</td><td class="ref">(M 13-17 / F 12-16)</td></tr>
      </tbody>
    </table>
    <div class="ref-nota">Valores de referencia orientativos según sexo (M: masculino, F: femenino).</div>
  `;

  const estilos = `
    .tbl { width: 80%; margin: 20px auto 0 auto; border-collapse: collapse; }
    .tbl td { border-bottom: 1px dotted #000; padding: 12px 14px; font-size: 14px; }
    .tbl td.lbl { font-weight: bold; width: 40%; }
    .tbl td.val { text-align: right; font-family: monospace; font-weight: bold; font-size: 16px; width: 20%; }
    .tbl td.uni { color: #555; font-size: 11px; width: 15%; }
    .tbl td.ref { color: #555; font-size: 10px; text-align: right; width: 25%; }
    .ref-nota { width: 80%; margin: 14px auto 0 auto; font-size: 9.5px; color: #555; font-style: italic; text-align: center; }
  `;

  renderizarEImprimir(`CNS_HtoHb_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};

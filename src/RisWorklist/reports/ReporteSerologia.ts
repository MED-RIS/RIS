import { v, flagRango, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

export const imprimirSerologiaCNS = (p: any) => {
  const d = p.datos || p || {};
  const s = d.serologiaDatos || p.serologiaDatos || {};
  const f = resolverFiliacion(p);

  // Para pruebas cuantitativas evalúa rango; para cualitativas solo muestra el valor.
  const fila = (label: string, val: any, rango: string) => {
    const flag = flagRango(val, rango);
    const color = flag === "H" ? "#c62828" : flag === "L" ? "#1565c0" : "#000";
    const marca = flag ? (flag === "H" ? " ↑" : " ↓") : "";
    return `
      <tr>
        <td class="lbl">${label}</td>
        <td class="val" style="color:${color}">${v(val)}${marca}</td>
        <td class="ref">${rango || "—"}</td>
      </tr>`;
  };

  const cuerpo = `
    ${cabeceraHTML(f, "SEROLOGÍA", "#6a1b9a", "#ce93d8")}
    <div class="main-title">SEROLOGÍA E INMUNOLOGÍA</div>
    <table class="tbl">
      <thead><tr><th>Prueba</th><th>Resultado</th><th>Referencia</th></tr></thead>
      <tbody>
        ${fila("P.C.R. (Proteína C Reactiva)", s.pcr, "<0.8")}
        ${fila("Látex / Factor Reumatoideo", s.fr, "<8")}
        ${fila("ASTO / ASO", s.asto, "hasta 200")}
        ${fila("R.P.R. (Sífilis)", s.rpr, "")}
        ${fila("V.I.H. (1/2)", s.hiv, "")}
        ${fila("Test de Embarazo (hCG)", s.test_embarazo, "")}
        ${fila("PSA Prueba Rápida", s.psa_prueba_rapida, "")}
        ${fila("H. Pylori en Suero", s.h_pylori_suero, "")}
        ${fila("Hepatitis B (HBsAg)", s.hepatitis_b, "")}
      </tbody>
    </table>
    <div class="obs-box"><b>Observaciones:</b> ${v(s.observaciones)}</div>
  `;

  const estilos = `
    .tbl { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .tbl th { background-color: #f3e5f5; border: 1px solid #000; padding: 5px; font-size: 11px; }
    .tbl td { border: 1px solid #999; padding: 6px 10px; font-size: 11.5px; }
    .tbl td.lbl { font-weight: bold; width: 50%; }
    .tbl td.val { text-align: right; font-family: monospace; font-weight: bold; width: 28%; }
    .tbl td.ref { color: #555; font-size: 10px; text-align: center; width: 22%; }
  `;

  renderizarEImprimir(`CNS_Serologia_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};

import { v, num, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

export const imprimirToleranciaGlucosaCNS = (p: any) => {
  const d = p.datos || p || {};
  const g = d.glucosaFija || p.glucosaFija || {};
  const f = resolverFiliacion(p);

  // Flag de hiperglucemia según criterios OMS para la curva (basal ≥126, 2h ≥200).
  const flagBasal = !isNaN(num(g.basal)) && num(g.basal) >= 126 ? " ↑" : "";
  const flag2h = !isNaN(num(g.resultado_glucosa2)) && num(g.resultado_glucosa2) >= 200 ? " ↑" : "";

  const cuerpo = `
    ${cabeceraHTML(f, "TOLERANCIA A LA GLUCOSA", "#2e7d32", "#a5d6a7")}
    <div class="main-title">TEST DE TOLERANCIA A LA GLUCOSA</div>
    <table class="tbl">
      <thead><tr><th>Muestra</th><th>Hora</th><th>Resultado</th><th>Unidad</th></tr></thead>
      <tbody>
        <tr><td class="lbl">Basal (en ayunas)</td><td>${v(g.hora_basal)}</td><td class="val" style="color:${flagBasal ? "#c62828" : "#000"}">${v(g.basal)}${flagBasal}</td><td class="uni">mg/dl</td></tr>
        <tr><td class="lbl">60' (Post-Carga)</td><td>${v(g.hora_1h)}</td><td class="val">${v(g.resultado_glucosa1)}</td><td class="uni">mg/dl</td></tr>
        <tr><td class="lbl">120' (Post-Carga)</td><td>${v(g.hora_2h)}</td><td class="val" style="color:${flag2h ? "#c62828" : "#000"}">${v(g.resultado_glucosa2)}${flag2h}</td><td class="uni">mg/dl</td></tr>
      </tbody>
    </table>
    <div class="ref-nota">Valores de referencia (OMS): Basal &lt; 100 mg/dl &nbsp;·&nbsp; 2 Horas &lt; 140 mg/dl. Carga oral estándar: 75 g de glucosa anhidra.</div>
    <div class="obs-box"><b>Observaciones:</b> ${v(g.observaciones_glucosa)}</div>
  `;

  const estilos = `
    .tbl { width: 80%; margin: 8px auto 0 auto; border-collapse: collapse; }
    .tbl th { background-color: #e8f5e9; border: 1px solid #000; padding: 6px; font-size: 11px; }
    .tbl td { border: 1px solid #999; padding: 8px 12px; font-size: 12px; text-align: center; }
    .tbl td.lbl { font-weight: bold; text-align: left; }
    .tbl td.val { font-family: monospace; font-weight: bold; font-size: 14px; }
    .tbl td.uni { color: #555; font-size: 10px; }
    .ref-nota { width: 80%; margin: 12px auto 0 auto; font-size: 9.5px; color: #555; font-style: italic; text-align: center; }
  `;

  renderizarEImprimir(`CNS_Tolerancia_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};

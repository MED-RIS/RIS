// src/RisWorklist/reports/ReporteToleranciaGlucosa.ts

import { v, num, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

export const imprimirToleranciaGlucosaCNS = (p: any) => {
  const d = p.datos || p || {};
  // Soporte para datos en bolsa anidada glucosaFija o directamente en la raíz d
  const g = d.glucosaFija || p.glucosaFija || d || {};
  const f = resolverFiliacion(p);

  // Lectura flexible de claves
  const valBasal = g.basal;
  const horaBasal = g.hora_basal;

  const valGlucosa1 = g.resultado_glucosa1 ?? g.glucosa_60;
  const hora1h = g.hora_1h;

  const valGlucosa2 = g.resultado_glucosa2 ?? g.glucosa_120;
  const hora2h = g.hora_2h;

  // Flag de hiperglucemia según criterios OMS para la curva (basal ≥126, 2h ≥200).
  const flagBasal = !isNaN(num(valBasal)) && num(valBasal) >= 126 ? " ↑" : "";
  const flag2h = !isNaN(num(valGlucosa2)) && num(valGlucosa2) >= 200 ? " ↑" : "";

  const obsGlucosa = g.observaciones_glucosa ?? g.observaciones ?? d.observaciones;

  const cuerpo = `
    ${cabeceraHTML(f, "TOLERANCIA A LA GLUCOSA", "#2e7d32", "#a5d6a7")}
    <div class="main-title">TEST DE TOLERANCIA A LA GLUCOSA</div>
    
    <table class="tbl">
      <thead>
        <tr><th>Muestra</th><th>Hora</th><th>Resultado</th><th>Unidad</th></tr>
      </thead>
      <tbody>
        <tr>
          <td class="lbl">Basal (en ayunas)</td>
          <td>${v(horaBasal)}</td>
          <td class="val" style="color:${flagBasal ? "#c62828" : "#000"}">${v(valBasal)}${flagBasal}</td>
          <td class="uni">mg/dL</td>
        </tr>
        <tr>
          <td class="lbl">60' (Post-Carga)</td>
          <td>${v(hora1h)}</td>
          <td class="val">${v(valGlucosa1)}</td>
          <td class="uni">mg/dL</td>
        </tr>
        <tr>
          <td class="lbl">120' (Post-Carga)</td>
          <td>${v(hora2h)}</td>
          <td class="val" style="color:${flag2h ? "#c62828" : "#000"}">${v(valGlucosa2)}${flag2h}</td>
          <td class="uni">mg/dL</td>
        </tr>
      </tbody>
    </table>

    <div class="ref-nota">Valores de referencia (OMS): Basal &lt; 100 mg/dL &nbsp;·&nbsp; 2 Horas &lt; 140 mg/dL. Carga oral estándar: 75 g de glucosa anhidra.</div>
    
    ${obsGlucosa ? `<div class="obs-box"><b>Observaciones:</b> ${v(obsGlucosa)}</div>` : ''}
  `;

  const estilos = `
    .main-title { text-align: center; font-size: 15px; font-weight: bold; margin: 20px 0 15px 0; text-decoration: underline; letter-spacing: 1.2px; }
    .tbl { width: 80%; margin: 15px auto 0 auto; border-collapse: collapse; background: #fff; }
    .tbl th { background-color: #e8f5e9; border: 1px solid #000; padding: 6px; font-size: 11px; color: #000; }
    .tbl td { border: 1px solid #999; padding: 8px 12px; font-size: 11.5px; text-align: center; color: #000; }
    .tbl td.lbl { font-weight: bold; text-align: left; width: 35%; }
    .tbl td.val { font-family: monospace; font-weight: bold; font-size: 13.5px; width: 25%; }
    .tbl td.uni { color: #555; font-size: 10px; width: 15%; }
    .ref-nota { width: 80%; margin: 16px auto 0 auto; font-size: 9.5px; color: #555; font-style: italic; text-align: center; }
    .obs-box { width: 80%; margin: 20px auto 0 auto; font-size: 10px; color: #000; border-top: 1px dashed #000; padding-top: 8px; }
  `;

  renderizarEImprimir(`CNS_Tolerancia_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};
// src/RisWorklist/reports/ReporteSerologia.ts

import { v, flagRango, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

export const imprimirSerologiaCNS = (p: any) => {
  const d = p.datos || p || {};
  const s = d.serologiaDatos || p.serologiaDatos || d || {};
  const f = resolverFiliacion(p);

  // Para pruebas cuantitativas evalúa rango; para cualitativas solo muestra el valor.
  const fila = (label: string, val: any, rangoOriginal: string) => {
    // 🌟 PROTECCIÓN CRÍTICA: Convertimos rangos de un solo extremo en rangos numéricos seguros
    let rangoSaneadoParaValidar = rangoOriginal;
    
    if (!rangoOriginal || rangoOriginal.trim() === "") {
      rangoSaneadoParaValidar = "0 - 999999"; 
    } else if (rangoOriginal.includes(">")) {
      const num = rangoOriginal.replace(">", "").trim();
      rangoSaneadoParaValidar = `${num} - 999999`;
    } else if (rangoOriginal.includes("<")) {
      const num = rangoOriginal.replace("<", "").trim();
      rangoSaneadoParaValidar = `0 - ${num}`;      
    } else if (rangoOriginal.includes("hasta")) {
      const num = rangoOriginal.replace("hasta", "").trim();
      rangoSaneadoParaValidar = `0 - ${num}`;      
    }

    const flag = flagRango(val, rangoSaneadoParaValidar);
    const color = flag === "H" ? "#c62828" : flag === "L" ? "#1565c0" : "#000";
    const marca = flag ? (flag === "H" ? " ↑" : " ↓") : "";

    return `
      <tr>
        <td class="lbl">${label}</td>
        <td class="val" style="color:${color}">${v(val)}${marca}</td>
        <td class="ref">${rangoOriginal || "—"}</td>
      </tr>`;
  };

  const cuerpo = `
    ${cabeceraHTML(f, "SEROLOGÍA", "#6a1b9a", "#ce93d8")}
    <div class="main-title">SEROLOGÍA E INMUNOLOGÍA</div>

    <table class="tbl">
      <thead>
        <tr><th>Prueba / Determinación</th><th>Resultado Obtenido</th><th>Valores de Referencia</th></tr>
      </thead>
      <tbody>
        ${fila("P.C.R. (Proteína C Reactiva)", s.pcr, "< 0.8 mg/dL")}
        ${fila("LÁTEX (Factor Reumatoideo)", s.fr, "< 8 UI/mL")}
        ${fila("ASTO (Antiestreptolisina O)", s.asto, "hasta 200 UI/mL")}
        ${fila("R.P.R. (Sífilis)", s.rpr, "No Reactivo")}
        ${fila("V.I.H. (Prueba Rápida 1/2)", s.hiv, "No Reactivo")}
        ${fila("TEST DE EMBARAZO (hCG)", s.test_embarazo, "Negativo")}
        ${fila("PSA PRUEBA RAPIDA", s.psa_prueba_rapida, "Normal / Negativo")}
        ${fila("H. PYLORI EN SUERO", s.h_pylori_suero, "No Reactivo")}
        ${fila("HEPATITIS B (HBsAg)", s.hepatitis_b, "No Reactivo")}
      </tbody>
    </table>

    ${s.observaciones || d.observaciones ? `<div class="obs-box"><b>Observaciones:</b> ${v(s.observaciones ?? d.observaciones)}</div>` : ''}
  `;

  const estilos = `
    .main-title { text-align: center; font-size: 15px; font-weight: bold; margin: 20px 0 15px 0; text-decoration: underline; letter-spacing: 1.2px; }
    .tbl { width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff; }
    .tbl th { background-color: #f3e5f5; border: 1px solid #000; padding: 6px; font-size: 10.5px; color: #000; }
    .tbl td { border: 1px solid #999; padding: 6px 12px; font-size: 11px; color: #000; }
    .tbl td.lbl { font-weight: bold; width: 48%; }
    .tbl td.val { text-align: right; font-family: monospace; font-weight: bold; width: 27%; }
    .tbl td.ref { color: #555; font-size: 10px; text-align: center; width: 25%; }
    .obs-box { margin-top: 20px; font-size: 10px; color: #000; border-top: 1px dashed #000; padding-top: 8px; }
  `;

  renderizarEImprimir(`CNS_Serologia_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};
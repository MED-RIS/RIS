import { v, flagRango, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

// Reporte combinado: Electrolitos séricos + Orina 24 Hrs (proteínas) + Microalbuminuria.
export const imprimirElectrolitosProtCNS = (p: any) => {
  const d = p.datos || p || {};
  const q = d.quimicaDatos || {};
  const m = d.microDatos || {};
  const o = d.egoDatos || {};
  const f = resolverFiliacion(p);

  const fila = (label: string, val: any, unidad: string, rango: string) => {
    const flag = flagRango(val, rango);
    const color = flag === "H" ? "#c62828" : flag === "L" ? "#1565c0" : "#000";
    const marca = flag === "H" ? " ↑" : flag === "L" ? " ↓" : "";
    return `
      <tr>
        <td class="lbl">${label}</td>
        <td class="val" style="color:${color}">${v(val)}${marca}</td>
        <td class="uni">${unidad}</td>
        <td class="ref">${rango}</td>
      </tr>`;
  };

  const cuerpo = `
    ${cabeceraHTML(f, "ELECTROLITOS / PROTEÍNAS", "#00838f", "#80deea")}
    <div class="main-title">ELECTROLITOS, PROTEÍNAS EN ORINA Y MICROALBUMINURIA</div>

    <div class="sec-title">ELECTROLITOS SÉRICOS</div>
    <table class="tbl">
      <thead><tr><th>Determinación</th><th>Result.</th><th>Unid.</th><th>Ref.</th></tr></thead>
      <tbody>
        ${fila("Sodio (Na⁺)", q.sodio_meql, "mmol/L", "135 - 148")}
        ${fila("Potasio (K⁺)", q.potasio_meql, "mmol/L", "3.5 - 5.3")}
        ${fila("Cloro (Cl⁻)", q.cloro_meql, "mmol/L", "98 - 107")}
      </tbody>
    </table>

    <div class="sec-title">ORINA DE 24 HORAS</div>
    <table class="tbl">
      <thead><tr><th>Determinación</th><th>Result.</th><th>Unid.</th><th>Ref.</th></tr></thead>
      <tbody>
        ${fila("Volumen 24 Hrs.", o.volumen_24h, "ml/día", "")}
        ${fila("Creatinina en Orina", o.crea_orina_24h, "mg/día", "")}
        ${fila("Proteínas en Orina", o.prot_24h, "mg/día", "28 - 140")}
      </tbody>
    </table>

    <div class="sec-title">MICROALBUMINURIA (MUESTRA AISLADA)</div>
    <table class="tbl">
      <thead><tr><th>Determinación</th><th>Result.</th><th>Unid.</th><th>Ref.</th></tr></thead>
      <tbody>
        ${fila("Albúmina en Orina", m.micro_albumina, "mg/L", "")}
        ${fila("Creatinina en Orina", m.micro_creatinina, "mg/dL", "")}
        ${fila("Relación Albúmina/Creatinina", m.relacion_ac, "mg/g", "<30")}
      </tbody>
    </table>

    <div class="obs-box">
      <div><b>Obs. Electrolitos:</b> ${v(q.observaciones_electrolitos)}</div>
      <div><b>Obs. Orina 24h:</b> ${v(o.obs_orina_24h)}</div>
      <div><b>Obs. Microalbuminuria:</b> ${v(m.observaciones_micro)}</div>
    </div>
  `;

  const estilos = `
    .sec-title { background-color: #e0f7fa; font-weight: bold; padding: 5px 8px; margin: 14px 0 0 0; border: 1px solid #000; font-size: 11px; }
    .tbl { width: 100%; border-collapse: collapse; }
    .tbl th { background-color: #e0f7fa; border: 1px solid #000; padding: 4px; font-size: 10px; }
    .tbl td { border: 1px solid #999; padding: 4px 8px; font-size: 11px; }
    .tbl td.lbl { font-weight: bold; width: 45%; }
    .tbl td.val { text-align: right; font-family: monospace; font-weight: bold; width: 20%; }
    .tbl td.uni { color: #555; font-size: 10px; width: 17%; }
    .tbl td.ref { color: #555; font-size: 10px; text-align: center; width: 18%; }
  `;

  renderizarEImprimir(`CNS_Electrolitos_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};
